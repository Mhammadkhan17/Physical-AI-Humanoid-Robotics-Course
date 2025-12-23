import json
import os
import logging
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
from jose import JWTError, jwt
from passlib.context import CryptContext

# --- RAG/LLM Imports ---
from rag.chain import create_rag_chain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# --- Agent Router Imports ---
from agents.ros2_code_generator import router as ros2_code_router
from agents.mermaid_diagram_generator import router as mermaid_router
from agents.ros2_doctor import router as ros2_doctor_router

# Load environment variables
load_dotenv()

# --- Environment & JWT Settings ---
DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configure basic logging
logging.basicConfig(level=logging.INFO)

# --- App & Middleware Setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://physical-ai-humanoid-robotics-cours-zeta.vercel.app",
        "https://physical-ai-humanoid-robotics-course.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Password & Auth Setup ---
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# --- SQLAlchemy Setup ---
# Ensure DATABASE_URL is present
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Database Models ---
class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)
    python_experience = Column(Integer)
    ros_experience = Column(Integer)
    has_gpu = Column(Boolean)
    has_jetson = Column(Boolean, default=False)
    has_robot_access = Column(Boolean, default=False)

Base.metadata.create_all(bind=engine)

# --- Pydantic Models ---
class ProfileResponse(BaseModel):
    id: int
    user_id: int
    python_experience: int
    ros_experience: int
    has_gpu: bool
    has_jetson: bool
    has_robot_access: bool
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    profile: Optional[ProfileResponse] = None
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None

class QuizAnswers(BaseModel):
    python_experience: int
    ros_experience: int
    has_gpu: bool
    has_jetson: bool
    has_robot_access: bool

class ChatRequest(BaseModel):
    message: str
    selected_text: Optional[str] = None
    chapter_id: Optional[str] = None

class PersonalizeRequest(BaseModel):
    chapter_original_text: str
    user_id: int

class TranslateRequest(BaseModel):
    text: str
    target_language: str
    
# --- DB Session Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Auth Helper Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> DBUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(DBUser).filter(DBUser.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- API Endpoints ---

# Agent Routers
app.include_router(ros2_code_router, prefix="/api/agents/ros2_code", tags=["agents"])
app.include_router(mermaid_router, prefix="/api/agents/mermaid", tags=["agents"])
app.include_router(ros2_doctor_router, prefix="/api/agents/ros2_doctor", tags=["agents"])
@app.post("/api/auth/register", response_model=User)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = DBUser(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/auth/login", response_model=Token)
async def login_for_access_token(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": db_user.email})
    profile = db.query(Profile).filter(Profile.user_id == db_user.id).first()
    user_response = User.from_orm(db_user)
    if profile:
        user_response.profile = ProfileResponse.from_orm(profile)
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_response}

@app.get("/api/users/me", response_model=User)
async def read_users_me(current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user_response = User.from_orm(current_user)
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile:
        user_response.profile = ProfileResponse.from_orm(profile)
    return user_response

@app.post("/api/profile/quiz")
async def submit_quiz(answers: QuizAnswers, current_user: DBUser = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    profile.python_experience = answers.python_experience
    profile.ros_experience = answers.ros_experience
    profile.has_gpu = answers.has_gpu
    profile.has_jetson = answers.has_jetson
    profile.has_robot_access = answers.has_robot_access
    
    db.commit()
    return {"status": "success", "message": "Quiz answers saved."}

@app.post("/api/chat")
async def chat_with_rag(request: ChatRequest, current_user: DBUser = Depends(get_current_user)):
    
    clean_id = request.chapter_id.split('/')[-1] if request.chapter_id else None
    
    logging.info(f"Cleaned Chapter ID for Search: {clean_id}")
    
    async def stream_generator():
        try:
            rag_chain = create_rag_chain(
                selected_text=request.selected_text,
                chapter_id=clean_id # Use the cleaned ID
            )
            # This will yield tokens as they are generated by Gemini
            for chunk in rag_chain.stream(request.message):
                yield chunk 
        except Exception as e:
            yield f"Error: {str(e)}"
    return StreamingResponse(stream_generator(), media_type="text/plain")

@app.post("/api/personalize")
async def personalize_text(request: PersonalizeRequest, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    if request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="User ID does not match authenticated user.")

    profile = db.query(Profile).filter(Profile.user_id == request.user_id).first()

    if not profile:
        return {"personalized_chapter_text": request.chapter_original_text}

    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GEMINI_API_KEY,
            temperature=0.7
        )
        
        expertise_levels = {
            0: "a complete beginner", 1: "a beginner",
            2: "an intermediate learner", 3: "an advanced learner",
            4: "an expert", 5: "a seasoned expert"
        }
        python_expertise = expertise_levels.get(profile.python_experience, "an intermediate learner")
        ros_expertise = expertise_levels.get(profile.ros_experience, "an intermediate learner")

        template = f"Dramatically rewrite the following chapter text for a student who is {python_expertise} in Python and {ros_expertise} in ROS. Return only the rewritten chapter text.\n\nOriginal Text:\n\"{{chapter_original_text}}\""
        prompt = ChatPromptTemplate.from_template(template)
        
        chain = prompt | llm | StrOutputParser()
        
        personalized_text = chain.invoke({
            "chapter_original_text": request.chapter_original_text
        })
        
        return {"personalized_chapter_text": personalized_text}
    except Exception as e:
        logging.error(f"Error in personalization endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to personalize text: {str(e)}")

@app.post("/api/translate")
async def translate_text(request: TranslateRequest, current_user: DBUser = Depends(get_current_user)):
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GEMINI_API_KEY,
            temperature=0.2
        )
        
        template = "Translate the following text into {target_language}. Return only the translated text. IMPORTANT: Do not translate text inside ```. Keep the content within the code blocks exactly as it is.\n\nText to translate:\n\"{text}\""
        prompt = ChatPromptTemplate.from_template(template)
        
        chain = prompt | llm | StrOutputParser()
        
        translated_text = chain.invoke({
            "text": request.text,
            "target_language": request.target_language
        })
        
        return {"translated_text": translated_text}
    except Exception as e:
        logging.error(f"Error in translation endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to translate text: {str(e)}")

@app.get("/")
async def read_root():
    return {"message": "Physical AI Textbook Backend"}