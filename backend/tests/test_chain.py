import os

os.environ["OPENROUTER_API_KEY"] = ""  # force BEFORE chain import — env-force rule

import pytest
from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda

from chain import _make_llm, _search_kwargs, create_rag_chain
from in_memory import InMemoryRetriever

ECHO = RunnableLambda(lambda p: p.to_string())

DOCS = [
    Document(page_content="Torque is rotational force.", metadata={"chapter_id": "ch-1"}),
    Document(page_content="Batteries store energy.", metadata={"chapter_id": "ch-2"}),
]


def make_retriever() -> InMemoryRetriever:
    return InMemoryRetriever(docs=DOCS)


def test_context_wiring_retrieved_doc_reaches_prompt():
    chain = create_rag_chain(retriever=make_retriever(), llm=ECHO)
    out = chain.invoke("what is torque?")
    assert "Torque is rotational force." in out


def test_search_kwargs_chapter_filter_structure():
    kwargs = _search_kwargs("ch-1")
    assert kwargs["k"] == 5
    condition = kwargs["filter"].must[0]
    assert condition.key == "metadata.chapter_id"
    assert condition.match.value == "ch-1"
    assert "filter" not in _search_kwargs(None)
    assert "filter" not in _search_kwargs("General Textbook")


def test_in_memory_adapter_chapter_filter():
    filtered = InMemoryRetriever(docs=DOCS, chapter_id="ch-1").invoke("q")
    assert [d.page_content for d in filtered] == ["Torque is rotational force."]
    unfiltered = InMemoryRetriever(docs=DOCS).invoke("q")
    assert len(unfiltered) == 2


def test_make_llm_raises_without_key():
    with pytest.raises(ValueError, match="OPENROUTER_API_KEY"):
        _make_llm()


def test_full_seam_needs_no_env_or_network():
    chain = create_rag_chain(
        retriever=make_retriever(),
        llm=ECHO,
        selected_text="rotational force",
        chapter_id="ch-1",
    )
    assert chain is not None


def test_empty_selection_default_text():
    out = create_rag_chain(
        retriever=make_retriever(), llm=ECHO, selected_text="   "
    ).invoke("q")
    assert "No specific text selected." in out
    out_none = create_rag_chain(
        retriever=make_retriever(), llm=ECHO, selected_text=None
    ).invoke("q")
    assert "No specific text selected." in out_none
