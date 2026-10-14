from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import KnowledgeQuery, KnowledgeResponse
from app.ml.rag_assistant import rag_assistant_service

router = APIRouter(prefix="/knowledge", tags=["Knowledge Assistant"])

@router.post("/query", response_model=KnowledgeResponse)
def query_knowledge_base(payload: KnowledgeQuery, db: Session = Depends(get_db)):
    result = rag_assistant_service.search_knowledge(payload.query, payload.machine_type)
    return result
