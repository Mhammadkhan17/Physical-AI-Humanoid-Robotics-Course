from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal

from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
import os
import google.generativeai as genai
from pathlib import Path

from backend.agents.ros2_code_generator import router as ros2_code_router
from backend.agents.mermaid_diagram_generator import router as mermaid_router
from backend.agents.ros2_doctor import router as ros2_doctor_router

# Load environment variables
dotenv_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=dotenv_path)
DATABASE_URL = os.getenv("DATABASE_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True)  # Link to better-auth user ID
    python_experience = Column(Integer)
    ros_experience = Column(Integer)
    has_gpu = Column(Boolean)
    has_jetson = Column(Boolean)
    has_robot_access = Column(Boolean)

class PersonalizedChapter(Base):
    __tablename__ = "personalized_chapters"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    chapter_path = Column(String, index=True) # e.g., 'module-1/chapter-1'
    # Use this field for both personalized and translated content, differentiated by chapter_path or a new column if needed
    personalized_content = Column(String)
    translated_content_ur = Column(String, nullable=True) # New column for Urdu translation

# Create database tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

app.include_router(ros2_code_router, prefix="/agents/ros2_code", tags=["agents"])
app.include_router(mermaid_router, prefix="/agents/mermaid", tags=["agents"])
app.include_router(ros2_doctor_router, prefix="/agents/ros2_doctor", tags=["agents"])

class QuizAnswers(BaseModel):
    user_id: int # Assuming user_id comes from frontend now
    python_experience: int  # e.g., 0-5 scale
    ros_experience: int
    has_gpu: bool
    has_jetson: bool
    has_robot_access: bool

@app.post("/profile/quiz")
async def submit_quiz(answers: QuizAnswers, db: Session = Depends(get_db)):
    # Store quiz answers in the profiles table
    profile = Profile(
        user_id=answers.user_id,
        python_experience=answers.python_experience,
        ros_experience=answers.ros_experience,
        has_gpu=answers.has_gpu,
        has_jetson=answers.has_jetson,
        has_robot_access=answers.has_robot_access,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {"status": "success", "message": "Quiz answers saved.", "profile_id": profile.id}


class PersonalizeRequest(BaseModel):
    chapter_path: str # Unique identifier for the chapter
    chapter_original_text: str # Original text to personalize if not cached
    user_id: int # Assuming user_id comes from frontend now

@app.post("/personalize")
async def personalize_chapter(request: PersonalizeRequest, db: Session = Depends(get_db)):
    # Removed current_user dependency for now. Authentication will be handled on frontend.

    # Check cache first
    cached_chapter = db.query(PersonalizedChapter).filter(
        PersonalizedChapter.user_id == request.user_id,
        PersonalizedChapter.chapter_path == request.chapter_path
    ).first()

    if cached_chapter:
        return {"personalized_chapter_text": cached_chapter.personalized_content}

    user_profile = db.query(Profile).filter(Profile.user_id == request.user_id).first()
    if not user_profile:
        raise HTTPException(status_code=404, detail="User profile not found.")

    profile_summary = f"""
    User Profile:
    - Python Experience: {user_profile.python_experience} (0-5)
    - ROS Experience: {user_profile.ros_experience} (0-5)
    - Has GPU: {'Yes' if user_profile.has_gpu else 'No'}
    - Has Jetson: {'Yes' if user_profile.has_jetson else 'No'}
    - Has Robot Access: {'Yes' if user_profile.has_robot_access else 'No'}
    """

    prompt = f"""
    You are an expert educator. Rewrite the following chapter text to be personalized for a user with the following profile:
    {profile_summary}

    Make the content more relevant and engaging based on their experience and access to hardware. Focus on simplifying complex concepts if their experience is low, or providing more advanced details/examples if their experience is high. If they have GPU/Jetson/robot access, suggest practical exercises or real-world implications that leverage these resources.

    Original Chapter Text:
    {request.chapter_original_text}

    Rewritten Chapter Text:
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-pro') # or 'gpt-4o' if configured
        response = model.generate_content(prompt)
        rewritten_text = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI model error: {str(e)}")

    # Save to cache
    new_personalized_chapter = PersonalizedChapter(
        user_id=request.user_id,
        chapter_path=request.chapter_path,
        personalized_content=rewritten_text,
    )
    db.add(new_personalized_chapter)
    db.commit()
    db.refresh(new_personalized_chapter)

    return {"personalized_chapter_text": rewritten_text}


class TranslateRequest(BaseModel):
    chapter_path: str
    chapter_original_text: str # Original text to translate
    user_id: int # Assuming user_id comes from frontend now
    target_language: str = "ur" # Default to Urdu

@app.post("/translate")
async def translate_chapter(request: TranslateRequest, db: Session = Depends(get_db)):
    # Removed current_user dependency for now. Authentication will be handled on frontend.

    # Check cache first for Urdu translation
    cached_chapter = db.query(PersonalizedChapter).filter(
        PersonalizedChapter.user_id == request.user_id,
        PersonalizedChapter.chapter_path == request.chapter_path
    ).first()

    if cached_chapter and cached_chapter.translated_content_ur:
        return {"translated_chapter_text": cached_chapter.translated_content_ur}

    # Construct prompt for translation
    prompt = f"""
    You are an expert translator. Translate the following chapter text into {request.target_language} (highest quality):

    Original Chapter Text:
    {request.chapter_original_text}

    Translated Chapter Text:
    """

    try:
        model = genai.GenerativeModel('gemini-1.5-pro') # Use Gemini for high-quality translation
        response = model.generate_content(prompt)
        translated_text = response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI model error: {str(e)}")

    # Save to cache
    if cached_chapter:
        cached_chapter.translated_content_ur = translated_text
        db.add(cached_chapter)
    else:
        new_translated_chapter = PersonalizedChapter(
            user_id=request.user_id,
            chapter_path=request.chapter_path,
            translated_content_ur=translated_text,
        )
        db.add(new_translated_chapter)
    db.commit()
    db.refresh(cached_chapter or new_translated_chapter) # Refresh the object that was updated/created

    return {"translated_chapter_text": translated_text}


class IngestRequest(BaseModel):
    url: str

class ChatRequest(BaseModel):
    message: str
    selected_text: str = None

@app.post("/ingest")
async def ingest_document(request: IngestRequest):
    # Placeholder for document ingestion logic
    return {"status": "success", "message": f"Document from {request.url} ingested."}

@app.post("/chat")
async def chat_with_rag(request: ChatRequest):
    # Placeholder for RAG chat logic
    if request.selected_text:
        response = f"Chat response based on selected text: '{request.selected_text}' and message: '{request.message}'"
    else:
        response = f"Chat response based on message: '{request.message}'"
    return {"response": response}

@app.get("/")
async def read_root():
    return {"message": "Physical AI Textbook Backend"}

