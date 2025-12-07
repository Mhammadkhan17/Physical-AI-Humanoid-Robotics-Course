from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Schema for ingestion request (used by /ingest endpoint)
class IngestRequest(BaseModel):
    content_path: str

# Schema for chat request (used by /chat endpoint)
class ChatRequest(BaseModel):
    query: str
    selected_text: Optional[str] = None

# Schema for a citation
class Citation(BaseModel):
    source: str
    page_content: str

# Schema for chat response
class ChatResponse(BaseModel):
    status: str
    response: str
    citations: List[Citation]

# Placeholder for user profile schema (for Phase 2 onwards)
class UserProfile(BaseModel):
    user_id: str
    python_experience: Optional[str] = None
    ros_experience: Optional[str] = None
    gpu_available: Optional[bool] = None
    jetson_access: Optional[bool] = None
    robot_access: Optional[bool] = None

