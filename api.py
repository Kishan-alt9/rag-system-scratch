from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import shutil

from src.indexer import load_chunks, load_index, load_metadata, index_pdf
from src.pipeline import RAGPipeline


app = FastAPI(
    title="RAG API",
    description="Retrieval-Augmented Generation API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str


def reload_pipeline():
    try:
        chunks = load_chunks()
        index = load_index()
        app.state.pipeline = RAGPipeline(chunks, index)
    except Exception:
        app.state.pipeline = None


@app.on_event("startup")
def load_rag_pipeline():
    reload_pipeline()


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "RAG API is running"
    }


@app.get("/status")
def get_status():
    try:
        metadata = load_metadata()
        chunks = load_chunks()
        return {
            "status": "ready",
            "document_count": len(metadata.get("documents", [])),
            "chunk_count": len(chunks),
            "documents": metadata.get("documents", [])
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "document_count": 0,
            "chunk_count": 0,
            "documents": []
        }


@app.get("/documents")
def get_documents():
    try:
        metadata = load_metadata()
        chunks = load_chunks()
        doc_names = metadata.get("documents", [])
        
        doc_chunks = {}
        for chunk in chunks:
            doc_name = chunk.get("document", "unknown")
            doc_chunks[doc_name] = doc_chunks.get(doc_name, 0) + 1

        documents = []
        for name in doc_names:
            documents.append({
                "name": name,
                "chunks": doc_chunks.get(name, 0),
                "status": "indexed"
            })
        return {"documents": documents, "total_chunks": len(chunks)}
    except Exception as e:
        return {"documents": [], "total_chunks": 0, "error": str(e)}


@app.post("/ask")
def ask_question(request: QuestionRequest):
    if not hasattr(app.state, "pipeline") or app.state.pipeline is None:
        try:
            reload_pipeline()
        except Exception:
            raise HTTPException(status_code=500, detail="RAG Pipeline is not initialized or index missing.")

    result = app.state.pipeline.ask(request.question)
    return result


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    upload_dir = Path("data/raw")
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_path = upload_dir / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        index_pdf(file_path)
        reload_pipeline()
        return {"message": f"Successfully indexed {file.filename}", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to index document: {str(e)}")
