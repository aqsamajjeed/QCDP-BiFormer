import os
import json
import numpy as np
import faiss

from sentence_transformers import SentenceTransformer


# ==============================
# PATHS
# ==============================

RAG_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

INDEX_PATH = os.path.join(
    RAG_DIR,
    "odir5k_faiss.index"
)

CHUNKS_PATH = os.path.join(
    RAG_DIR,
    "odir5k_chunks.json"
)


# ==============================
# LOAD FAISS INDEX
# ==============================

print("Loading FAISS index...")

index = faiss.read_index(
    INDEX_PATH
)

print(
    "FAISS vectors:",
    index.ntotal
)


# ==============================
# LOAD CHUNKS
# ==============================

print("Loading chunks...")

with open(
    CHUNKS_PATH,
    "r",
    encoding="utf-8"
) as f:

    chunks = json.load(f)

print(
    "Total chunks:",
    len(chunks)
)


# ==============================
# LOAD BGE MODEL
# ==============================

MODEL_PATH = os.path.join(
    RAG_DIR,
    "bge_model"
)


print("Loading BGE model from local folder...")


model = SentenceTransformer(
    MODEL_PATH
)


print("BGE model loaded.")


# ==============================
# RETRIEVE CHUNKS
# ==============================

def retrieve_chunks(query, k=5):

    query_embedding = model.encode(
        [query],
        convert_to_numpy=True
    )

    query_embedding = query_embedding.astype(
        "float32"
    )

    # Same normalization used during
    # embedding creation

    query_embedding = (
        query_embedding /
        np.linalg.norm(
            query_embedding,
            axis=1,
            keepdims=True
        )
    )

    # FAISS similarity search

    scores, indices = index.search(
        query_embedding,
        k
    )

    results = []

    for rank, idx in enumerate(indices[0]):

        if idx == -1:
            continue

        results.append({

            "rank": rank + 1,

            "score": float(
                scores[0][rank]
            ),

            "text": chunks[idx]["text"],

            "source": chunks[idx].get(
                "source",
                ""
            ),

            "page": chunks[idx].get(
                "page",
                ""
            )
        })

    return results


# ==============================
# BUILD CONTEXT FOR GEMINI
# ==============================

def build_context(results):

    context = []

    for result in results:

        context.append(
            f"""
Source: {result['source']}
Page: {result['page']}

{result['text']}
"""
        )

    return "\n\n".join(context)