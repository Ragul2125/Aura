from ragProcessor.rag import RAGProcessor

def test_rag():
    rag = RAGProcessor()
    
    # Store some data
    text = "The user prefers to work on deep coding tasks in the morning."
    meta = {"source": "user_preference", "date": "2026-01-23"}
    doc_id = rag.store(text, meta)
    print(f"Stored document with ID: {doc_id}")
    
    # Retrieve data
    query = "When does the user like to code?"
    results = rag.retrieve(query)
    
    print("\nRetrieval Results:")
    print("-" * 20)
    print(results)
    print("-" * 20)

if __name__ == "__main__":
    test_rag()
