from langchain_core.documents import Document
from langchain_core.retrievers import BaseRetriever


class InMemoryRetriever(BaseRetriever):
    """Test adapter: returns stored docs, optionally filtered by chapter_id."""

    docs: list[Document] = []
    chapter_id: str | None = None

    def _get_relevant_documents(self, query: str, *, run_manager):
        if self.chapter_id is None:
            return list(self.docs)
        return [
            doc for doc in self.docs
            if doc.metadata.get("chapter_id") == self.chapter_id
        ]
