import os
import sys
import logging

# Add the current directory to sys.path to allow imports of local modules in Vercel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from typing import Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, Boolean
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

# --- RAG/LLM Imports ---
from chain import create_rag_chain
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Load environment variables
load_dotenv()

# --- Environment Settings ---
DATABASE_URL = os.getenv("DATABASE_URL")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Configure basic logging
logging.basicConfig(level=logging.INFO)

# --- App & Middleware Setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://physical-ai-humanoid-robotics-cours-zeta.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/api/profile/quiz")
async def submit_quiz(answers: QuizAnswers, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == 1).first()
    if not profile:
        profile = Profile(user_id=1)
        db.add(profile)
    
    profile.python_experience = answers.python_experience
    profile.ros_experience = answers.ros_experience
    profile.has_gpu = answers.has_gpu
    profile.has_jetson = answers.has_jetson
    profile.has_robot_access = answers.has_robot_access
    
    db.commit()
    return {"status": "success", "message": "Quiz answers saved."}

@app.post("/api/chat")
def chat_with_rag(request: ChatRequest):
    logging.info(f"Chapter ID for Search: {request.chapter_id or None}")

    try:
        rag_chain = create_rag_chain(
            selected_text=request.selected_text,
            chapter_id=request.chapter_id,
        )
    except Exception as e:
        logging.exception("chat setup failed")
        raise HTTPException(status_code=500, detail=f"chat setup failed: {e}") from e

    def stream_generator():
        try:
            yield from rag_chain.stream(request.message)
        except Exception:
            logging.exception("chat stream failed")
            yield "Error: the answer stream failed."

    return StreamingResponse(stream_generator(), media_type="text/plain")

@app.post("/api/personalize")
async def personalize_text(request: PersonalizeRequest, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == request.user_id).first()

    if not profile:
        return {"personalized_chapter_text": request.chapter_original_text}

    try:
        if not OPENROUTER_API_KEY:
            raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is not configured.")

        llm = ChatOpenAI(
            model="nvidia/nemotron-3-ultra-550b-a55b:free",
            openai_api_key=OPENROUTER_API_KEY,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.7,
            default_headers={
                "HTTP-Referer": "https://physical-ai-humanoid-robotics-cours-zeta.vercel.app",
                "X-Title": "Physical AI Textbook",
            },
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
async def translate_text(request: TranslateRequest):
    try:
        if not OPENROUTER_API_KEY:
            raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is not configured.")

        llm = ChatOpenAI(
            model="nvidia/nemotron-3-ultra-550b-a55b:free",
            openai_api_key=OPENROUTER_API_KEY,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.2,
            default_headers={
                "HTTP-Referer": "https://physical-ai-humanoid-robotics-cours-zeta.vercel.app",
                "X-Title": "Physical AI Textbook",
            },
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