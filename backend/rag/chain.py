from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI # Use ChatGoogleGenerativeAI

# Assuming relative import structure
from gemini_retrieve import get_retriever
import os
from dotenv import load_dotenv # Added to load API keys
from pathlib import Path # Added for dotenv path

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") # Load Gemini API Key

def format_docs(docs):
    if not docs:
        print("DEBUG: No documents found for this chapter_id!")
    return "\n\n".join(doc.page_content for doc in docs)

def create_rag_chain(selected_text: str = None, chapter_id: str = None):
    retriever = get_retriever(chapter_id=chapter_id)
    """
    Creates and returns a RAG chain.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY must be set in backend/.env file for the LLM.")
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=GEMINI_API_KEY,
        temperature=0.3
    )
    template = """You are a specialized AI tutor for the 'Physical AI & Humanoid Robotics' textbook.

    ---
    TEXTBOOK CONTEXT (Retrieved from database):
    {context}

    USER'S HIGHLIGHTED TEXT:
    {selected_text}
    ---

    INSTRUCTIONS:
    1. Look at the 'TEXTBOOK CONTEXT' provided. Does it contain a direct explanation of '{selected_text}'?
    2. If YES: Explain it using the textbook's specific wording and examples.
    3. If NO: Look at the 'USER'S HIGHLIGHTED TEXT' itself. If the definition is common knowledge in ROS 2 (like Nodes), explain it clearly using your expertise, but explicitly start by saying: "While the retrieved excerpts focus on [Subject of Context], here is a general explanation of {selected_text}..."
    4. Ensure you mention specific ROS 2 concepts like 'rclpy', 'executables', and 'graph' if they are in the context.

    Question: {question}
    Answer:"""
    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
    {
        "context": retriever | format_docs,
        "question": RunnablePassthrough(),
        "selected_text": lambda x: selected_text if selected_text and selected_text.strip() else "No specific text selected.",
        "chapter_id": lambda x: chapter_id if chapter_id else "General Textbook",
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
