from fastapi import FastAPI
from pydantic import BaseModel

from src.indexer import load_chunks, load_index
from src.pipeline import RAGPipeline


app = FastAPI(
    title="RAG API",
    description="Retrieval-Augmented Generation API",
    version="1.0.0"
)


class QuestionRequest(BaseModel):
    question: str


@app.on_event("startup")
def load_rag_pipeline():
    chunks = load_chunks()
    index = load_index()

    app.state.pipeline = RAGPipeline(
        chunks,
        index
    )


@app.get("/")
def root():
    return {
        "message": "RAG API is running"
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):
    result = app.state.pipeline.ask(
        request.question
    )

    return result