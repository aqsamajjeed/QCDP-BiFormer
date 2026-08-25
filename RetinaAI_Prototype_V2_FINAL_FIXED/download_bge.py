from sentence_transformers import SentenceTransformer
import os


MODEL_NAME = "BAAI/bge-small-en-v1.5"


MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "rag",
    "bge_model"
)


print("Downloading BGE model...")


model = SentenceTransformer(
    MODEL_NAME
)


print("Saving model locally...")


model.save(
    MODEL_PATH
)


print("BGE model saved successfully!")

print(
    "Location:",
    MODEL_PATH
)