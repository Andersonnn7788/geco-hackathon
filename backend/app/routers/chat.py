"""
Chat endpoint for the AI booking assistant.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, oauth2_scheme
from app.models.user import User
from app.agent.graph import run_agent

router = APIRouter(prefix="/agent", tags=["AI Agent"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    response: str
    conversation_history: List[ChatMessage]


async def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None."""
    if not token:
        return None
    
    try:
        from app.core.security import decode_token
        from sqlalchemy import select
        
        payload = decode_token(token)
        if payload is None:
            return None
        
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        result = await db.execute(select(User).where(User.id == int(user_id)))
        return result.scalar_one_or_none()
    except Exception:
        return None


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """
    Chat with the AI booking assistant.
    
    The assistant can help you:
    - Search for available spaces
    - Check availability on specific dates
    - Create bookings (requires authentication)
    - View your bookings (requires authentication)
    - Cancel bookings (requires authentication)
    """
    try:
        # Convert conversation history to list of dicts
        history = None
        if request.conversation_history:
            history = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
        
        # Run the agent
        response, updated_history = await run_agent(
            db=db,
            user=current_user,
            message=request.message,
            conversation_history=history,
        )
        
        # Convert back to ChatMessage format
        history_messages = [
            ChatMessage(role=msg["role"], content=msg["content"])
            for msg in updated_history
        ]
        
        return ChatResponse(
            response=response,
            conversation_history=history_messages,
        )
        
    except Exception as e:
        # Log the error for debugging
        import traceback
        traceback.print_exc()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )


@router.get("/status")
async def agent_status():
    """Check if the AI agent is available."""
    try:
        import boto3
        
        # Try to create a Bedrock client to verify credentials
        client = boto3.client("bedrock-runtime", region_name="us-east-1")
        
        return {
            "status": "available",
            "message": "AI assistant is ready to help"
        }
    except Exception as e:
        return {
            "status": "unavailable",
            "message": f"AI assistant is currently unavailable: {str(e)}"
        }

