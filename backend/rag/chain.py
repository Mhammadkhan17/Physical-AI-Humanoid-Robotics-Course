from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI # Or other LLM

from .retrieve import get_retriever # Assuming relative import structure
import os
from dotenv import load_dotenv # Added to load GEMINI_API_KEY
from pathlib import Path # Added for dotenv path

# Load environment variables (same as retrieve.py and ingest.py)
script_dir = Path(__file__).parent
dotenv_path = script_dir.parent / '.env'
load_dotenv(dotenv_path=dotenv_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") # Ensure GEMINI_API_KEY is loaded here

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def create_rag_chain(selected_text: str = None):
    """
    Creates and returns a RAG chain.
    """
    retriever = get_retriever()
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY must be set in backend/.env file for the LLM.")
    print(f"DEBUG: GEMINI_API_KEY loaded: {GEMINI_API_KEY[:5]}...{GEMINI_API_KEY[-5:]}") # Print obfuscated key
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GEMINI_API_KEY) # Pass API Key
    template = """You are an AI assistant for a textbook on Physical AI & Humanoid Robotics.
    Answer the question based only on the following context.
    If the question is about a specific selected text, prioritize that text for context.
    If you don't know the answer, just say that you don't know, don't try to make up an answer.

    Context: {context}
    Selected Text: {selected_text}
    Question: {question}
    """
    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough(), "selected_text": lambda x: selected_text}
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
