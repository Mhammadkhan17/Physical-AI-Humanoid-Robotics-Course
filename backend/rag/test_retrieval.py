import sys
from pathlib import Path
# Add the project root to the path to allow for correct module imports
sys.path.append(str(Path(__file__).parent.parent.parent))

from backend.rag.retrieve import retrieve_documents

def test_retrieval():
    """
    Tests the document retrieval functionality of the RAG system.
    """
    print("--- Starting RAG Retrieval Test ---")
    query = "What are ROS 2 concepts?"
    print(f"Testing with query: '{query}'")
    
    try:
        documents = retrieve_documents(query)
        
        if documents:
            print("\n[SUCCESS] Successfully retrieved documents:")
            for i, doc in enumerate(documents):
                print(f"\n--- Document {i+1} ---")
                print(f"Source: {doc.metadata.get('source')}")
                # print(f"Content: {doc.page_content[:300]}...") # Print a snippet
        else:
            print("\n[FAILURE] Retrieval function ran but returned no documents.")
            print("This indicates a problem with the vector database connection, the collection name, or the data within the collection.")
            
    except Exception as e:
        print(f"\n[ERROR] An exception occurred during retrieval: {e}")
        import traceback
        traceback.print_exc()

    print("\n--- RAG Retrieval Test Finished ---")

if __name__ == "__main__":
    test_retrieval()
