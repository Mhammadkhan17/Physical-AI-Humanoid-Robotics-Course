from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI # Or other LLM

# from .retrieve import get_retriever # Assuming relative import structure
import os
from qdrant_client import QdrantClient
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Qdrant

QDRANT_HOST = os.getenv("QDRANT_HOST")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = "physical_ai_textbook"

def get_retriever(embedding_model="models/embedding-001"):
    """
    Initializes and returns a Qdrant retriever.
    """
    if not QDRANT_HOST or not QDRANT_API_KEY:
        # In a real app, handle this more gracefully, e.g., raise an exception or log an error.
        # For this example, we'll use placeholder values if not set.
        print("Warning: QDRANT_HOST or QDRANT_API_KEY not set. Using dummy client.")
        # Create a dummy client or raise an error depending on desired behavior
        class DummyClient:
            def retrieve(self, query):
                return []
        return DummyClient()

    client = QdrantClient(host=QDRANT_HOST, api_key=QDRANT_API_KEY)
    embeddings = GoogleGenerativeAIEmbeddings(model=embedding_model)

    qdrant = Qdrant(client=client, collection_name=COLLECTION_NAME, embeddings=embeddings)
    return qdrant.as_retriever()

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def create_rag_chain(selected_text: str = None):
    """
    Creates and returns a RAG chain.
    """
    retriever = get_retriever()
    llm = ChatGoogleGenerativeAI(model="gemini-pro") # Or your chosen LLM (Claude 3.5 Sonnet recommended)

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
