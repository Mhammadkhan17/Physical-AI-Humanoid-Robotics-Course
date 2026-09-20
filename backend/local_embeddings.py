"""Fully offline embeddings using ONNX Runtime. No HuggingFace Hub dependency."""

import json
from pathlib import Path

import numpy as np
import onnxruntime as ort
from langchain_core.embeddings import Embeddings
from tokenizers import Tokenizer

MODEL_DIR = Path(__file__).parent / "models" / "all-MiniLM-L6-v2"


class LocalEmbeddings(Embeddings):
    """Embeddings using local ONNX model. No network calls."""

    def __init__(self):
        self.tokenizer = Tokenizer.from_file(str(MODEL_DIR / "tokenizer.json"))
        self.session = ort.InferenceSession(str(MODEL_DIR / "onnx/model.onnx"))

        with open(MODEL_DIR / "config.json") as f:
            config = json.load(f)
        self.pad_id = config.get("pad_token_id", 0)

    def _embed(self, texts: list[str]) -> list[list[float]]:
        all_embeddings = []
        for text in texts:
            encoded = self.tokenizer.encode(text)
            inputs = {
                "input_ids": np.array([encoded.ids], dtype=np.int64),
                "attention_mask": np.array([encoded.attention_mask], dtype=np.int64),
                "token_type_ids": np.array([encoded.type_ids], dtype=np.int64),
            }
            outputs = self.session.run(None, inputs)
            token_embeddings = outputs[0][0]  # Shape: (seq_len, hidden_dim)
            attention_mask = np.array(encoded.attention_mask)  # Shape: (seq_len,)

            # Mean pooling - expand mask to match token_embeddings shape
            input_mask_expanded = attention_mask[:, np.newaxis].astype(np.float32)
            sum_embeddings = np.sum(token_embeddings * input_mask_expanded, axis=0)
            sum_mask = np.clip(input_mask_expanded.sum(), 1e-9, None)
            embedding = sum_embeddings / sum_mask

            # L2 normalize
            embedding = embedding / np.linalg.norm(embedding)
            all_embeddings.append(embedding.tolist())
        return all_embeddings

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return self._embed(texts)

    def embed_query(self, text: str) -> list[float]:
        return self._embed([text])[0]
