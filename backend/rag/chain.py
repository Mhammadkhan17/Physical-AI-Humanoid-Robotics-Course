from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI # Use ChatOpenAI for OpenRouter
# from langchain_google_genai import ChatGoogleGenerativeAI # Removed

from .gemini_retrieve import get_retriever # Assuming relative import structure
import os
from dotenv import load_dotenv # Added to load API keys
from pathlib import Path # Added for dotenv path

# Load environment variables (same as retrieve.py and ingest.py)
script_dir = Path(__file__).parent
dotenv_path = script_dir.parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") # Load Gemini API Key

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def create_rag_chain(selected_text: str = None, chapter_id: str = None):
    """
    Creates and returns a RAG chain.
    """
    retriever = get_retriever()
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY must be set in backend/.env file for the LLM.")
    llm = ChatOpenAI(
        model="gemini-2.5-flash",
        openai_api_key=GEMINI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        temperature=0.7
    )
    template = """You are an AI assistant for a textbook on Physical AI & Humanoid Robotics.
    Answer the question using a combination of the retrieved 'Retrieved Context' and the user's 'User's Selected Text' from the specified 'Chapter ID'.
    The 'User's Selected Text' provides specific focus, but you should use the 'Retrieved Context' for broader information and definitions.
    If you don't know the answer from the combined information, just say that you don't know.

    Retrieved Context: {context}

    Chapter ID: {chapter_id}

    User's Selected Text: {selected_text}

    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
            "selected_text": lambda x: selected_text,
            "chapter_id": lambda x: chapter_id,
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain

if __name__ == "__main__":
    # Example usage (ensure environment variables are set)
    # os.environ["QDRANT_HOST"] = "your_qdrant_host"
    # os.environ["QDRANT_API_KEY"] = "your_qdrant_api_key"

    rag_chain = create_rag_chain()
    response = rag_chain.invoke("What are the core concepts of ROS 2?")
    print(response)

    rag_chain_selected = create_rag_chain(selected_text="ROS 2 Nodes, Topics, and Services")
    response_selected = rag_chain_selected.invoke("Explain topics in ROS 2.")
    print(response_selected)
