from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest
from local_embeddings import LocalEmbeddings

import os
from dotenv import load_dotenv

# Kept: the __main__ demo runs standalone, and app.py imports this module
# BEFORE its own load_dotenv() call.
load_dotenv()

COLLECTION_NAME = "Physical_AI_Textbook_Local"
QDRANT_URL = "http://localhost:6333"

_client: QdrantClient | None = None
_embedder: LocalEmbeddings | None = None
_store: QdrantVectorStore | None = None


def _make_llm(temperature: float = 0.3) -> ChatOpenAI:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY must be set in backend/.env file for the LLM.")
    return ChatOpenAI(
        model="nvidia/nemotron-3-ultra-550b-a55b:free",
        openai_api_key=api_key,
        openai_api_base="https://openrouter.ai/api/v1",
        temperature=temperature,
        streaming=True,
        default_headers={
            "HTTP-Referer": "https://physical-ai-humanoid-robotics-cours-zeta.vercel.app",
            "X-Title": "Physical AI Textbook",
        },
    )


def _default_client() -> QdrantClient:
    global _client
    if _client is None:
        _client = QdrantClient(url=QDRANT_URL)
    return _client


def _default_embedder() -> LocalEmbeddings:
    global _embedder
    if _embedder is None:
        _embedder = LocalEmbeddings()
    return _embedder


def _default_store() -> QdrantVectorStore:
    global _store
    if _store is None:
        _store = QdrantVectorStore(
            client=_default_client(),
            collection_name=COLLECTION_NAME,
            embedding=_default_embedder(),
        )
    return _store


def _search_kwargs(chapter_id: str | None) -> dict:
    search_kwargs = {"k": 5}
    if chapter_id and chapter_id != "General Textbook":
        search_kwargs["filter"] = rest.Filter(
            must=[
                rest.FieldCondition(
                    key="metadata.chapter_id",
                    match=rest.MatchValue(value=chapter_id),
                )
            ]
        )
    return search_kwargs


def format_docs(docs):
    if not docs:
        print("DEBUG: No documents found for this chapter_id!")
    return "\n\n".join(doc.page_content for doc in docs)


def create_rag_chain(selected_text: str = None, chapter_id: str = None,
                     retriever=None, embedder=None, llm=None):
    """Build the RAG answer chain.

    Precedence: an injected `retriever` wins (embedder/chapter_id ignored);
    `chapter_id` and `embedder` shape only the default prod path.
    """
    if llm is None:
        llm = _make_llm(0.3)  # key check FIRST: no ONNX/Qdrant work on a keyless call

    if retriever is None:
        if embedder is None:
            retriever = _default_store().as_retriever(
                search_kwargs=_search_kwargs(chapter_id)
            )
        else:
            store = QdrantVectorStore(
                client=_default_client(),
                collection_name=COLLECTION_NAME,
                embedding=embedder,
            )
            retriever = store.as_retriever(
                search_kwargs=_search_kwargs(chapter_id)
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
    2. If YES: Quote the textbook directly where possible. Use the exact wording and examples from the context.
    3. If NO: Look at the 'USER'S HIGHLIGHTED TEXT' itself. If the definition is common knowledge in ROS 2 (like Nodes), explain it clearly using your expertise, but explicitly start by saying: "While the retrieved excerpts focus on [Subject of Context], here is a general explanation of {selected_text}..."
    4. Ensure you mention specific ROS 2 concepts like 'rclpy', 'executables', and 'graph' if they are in the context.
    5. If the question is short or simple (like "What does this mean?"), give a brief 1-2 sentence answer. Only go into detail if the question asks for it.

    Question: {question}
    Answer:"""
    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        {
            "context": retriever | format_docs,
            "question": RunnablePassthrough(),
            "selected_text": lambda x: selected_text if selected_text and selected_text.strip() else "No specific text selected.",
        }
        | prompt
        | llm
        | StrOutputParser()
    )
    return rag_chain


if __name__ == "__main__":
    rag_chain = create_rag_chain()
    response = rag_chain.invoke("What are the core concepts of ROS 2?")
    print(response)

    rag_chain_selected = create_rag_chain(selected_text="ROS 2 Nodes, Topics, and Services")
    response_selected = rag_chain_selected.invoke("Explain topics in ROS 2.")
    print(response_selected)
