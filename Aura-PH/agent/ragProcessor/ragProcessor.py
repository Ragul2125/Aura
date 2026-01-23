import json
import os
import numpy as np
import uuid
from services.llmService import LLMInterface

class RAGProcessor:
    def __init__(self, persistence_path=r"d:\AURA\data\rag_store.json"):
        """
        Initialize lightweight RAG with JSON storage.
        """
        self.persistence_path = persistence_path
        self.llm_interface = LLMInterface()
        self.documents = []
        self._load_data()

    def _load_data(self):
        """Load data from JSON file if exists."""
        if os.path.exists(self.persistence_path):
            try:
                with open(self.persistence_path, 'r', encoding='utf-8') as f:
                    self.documents = json.load(f)
            except Exception as e:
                print(f"⚠️ Could not load RAG data: {e}. Starting fresh.")
                self.documents = []
        else:
            # Ensure directory exists
            os.makedirs(os.path.dirname(self.persistence_path), exist_ok=True)

    def _save_data(self):
        """Save data to JSON file."""
        try:
            with open(self.persistence_path, 'w', encoding='utf-8') as f:
                json.dump(self.documents, f, indent=2)
        except Exception as e:
            print(f"❌ Could not save RAG data: {e}")

    def store(self, text: str, metadata: dict = None):
        """
        Embeds and stores text with metadata.
        """
        if metadata is None:
            metadata = {}
            
        embedding = self.llm_interface.get_embedding(text)
        if not embedding:
            print("⚠️ Failed to generate embedding. Document not stored.")
            return None

        doc = {
            "id": str(uuid.uuid4()),
            "text": text,
            "metadata": metadata,
            "embedding": embedding
        }
        
        self.documents.append(doc)
        self._save_data()
        return doc["id"]

    def retrieve(self, query: str, n_results: int = 3):
        """
        Retrieve top N documents for query using cosine similarity.
        """
        if not self.documents:
            return []

        query_embedding = self.llm_interface.get_embedding(query)
        if not query_embedding:
            return []

        # Calculate cosine similarity
        query_vec = np.array(query_embedding)
        scores = []
        
        for doc in self.documents:
            doc_vec = np.array(doc['embedding'])
            # Cosine similarity: (A . B) / (||A|| * ||B||)
            # Assuming normalized embeddings often come from APIs, but let's be safe
            dot_product = np.dot(query_vec, doc_vec)
            norm_q = np.linalg.norm(query_vec)
            norm_d = np.linalg.norm(doc_vec)
            
            if norm_q * norm_d == 0:
                score = 0
            else:
                score = dot_product / (norm_q * norm_d)
            
            scores.append((score, doc))

        # Sort by score descending
        scores.sort(key=lambda x: x[0], reverse=True)
        
        # Return top N results (skipping embedding in output for cleanliness)
        top_results = []
        for score, doc in scores[:n_results]:
            top_results.append({
                "text": doc["text"],
                "metadata": doc["metadata"],
                "score": float(score)
            })
            
        return top_results
