"""
LangGraph agent for room booking with Amazon Bedrock.
"""
import os
from typing import Annotated, TypedDict, Sequence, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage, ToolMessage
from langchain_aws import ChatBedrockConverse
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.tools import get_agent_tools
from app.models.user import User

# System prompt for the booking assistant
SYSTEM_PROMPT = """You are an AI assistant for Infinity8, a coworking space company in Malaysia. You help users find and book workspaces.

You have access to the following capabilities:
1. Search for available spaces by type, location, capacity, or price
2. Check availability of specific spaces on specific dates
3. Create bookings for users
4. View user's existing bookings
5. Cancel bookings

Available space types:
- hot_desk: Flexible seating in open workspace (from RM15/hour)
- private_office: Dedicated office space for teams (from RM50/hour)
- meeting_room: Professional meeting spaces (from RM60/hour)
- event_space: Large spaces for workshops and events (from RM300/hour)
- phone_booth: Soundproof booths for calls (from RM20/hour)

Locations:
- KL Eco City
- Bangsar South

Operating hours: 9 AM to 9 PM daily.

Guidelines:
- Be helpful, concise, and professional
- When searching for spaces, ask clarifying questions if needed (type, capacity, date)
- Always confirm booking details before creating a booking
- If user is not logged in, remind them to sign in before booking
- Use Ringgit Malaysia (RM) for prices
- Format dates as YYYY-MM-DD
- Use 24-hour format for times (9 for 9 AM, 14 for 2 PM, etc.)

Current date context will be provided. Help users find the perfect workspace!"""


class AgentState(TypedDict):
    """State for the agent graph."""
    messages: Annotated[Sequence[BaseMessage], lambda x, y: x + y]


def create_agent_graph(db: AsyncSession, user: Optional[User] = None):
    """Create a LangGraph agent with Bedrock and booking tools."""
    
    # Get the Bedrock model ARN from environment or use default
    model_id = os.getenv(
        "BEDROCK_MODEL_ID",
        "amazon.nova-pro-v1:0"
    )
    region = os.getenv("AWS_REGION", "us-east-1")
    
    # Initialize Bedrock chat model using Converse API (supports Nova, Claude, and other models)
    llm = ChatBedrockConverse(
        model=model_id,
        region_name=region,
        max_tokens=1024,
        temperature=0.7,
    )
    
    # Get tools with db session and user context
    tools = get_agent_tools(db, user)
    
    # Bind tools to the model
    llm_with_tools = llm.bind_tools(tools)
    
    # Create tool node
    tool_node = ToolNode(tools)
    
    # Define the agent function
    async def call_agent(state: AgentState) -> dict:
        """Call the agent with the current state."""
        messages = list(state["messages"])
        
        # Add system message if not present
        if not messages or not isinstance(messages[0], SystemMessage):
            from datetime import date
            system_with_date = f"{SYSTEM_PROMPT}\n\nToday's date: {date.today().isoformat()}"
            messages = [SystemMessage(content=system_with_date)] + messages
        
        response = await llm_with_tools.ainvoke(messages)
        return {"messages": [response]}
    
    # Define routing logic
    def should_continue(state: AgentState) -> str:
        """Determine if we should continue to tools or end."""
        messages = state["messages"]
        last_message = messages[-1]
        
        # If there are tool calls, continue to tools
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        
        # Otherwise, end
        return END
    
    # Build the graph
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("agent", call_agent)
    workflow.add_node("tools", tool_node)
    
    # Set entry point
    workflow.set_entry_point("agent")
    
    # Add conditional edges
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            END: END,
        }
    )
    
    # Add edge from tools back to agent
    workflow.add_edge("tools", "agent")
    
    # Compile the graph
    return workflow.compile()


async def run_agent(
    db: AsyncSession,
    user: Optional[User],
    message: str,
    conversation_history: list[dict] = None,
) -> tuple[str, list[dict]]:
    """
    Run the agent with a user message.
    
    Args:
        db: Database session
        user: Current user (or None if not authenticated)
        message: User's message
        conversation_history: Previous messages in the conversation
        
    Returns:
        Tuple of (agent response, updated conversation history)
    """
    # Create the agent graph
    graph = create_agent_graph(db, user)
    
    # Build messages from history
    messages: list[BaseMessage] = []
    
    if conversation_history:
        for msg in conversation_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
    
    # Add the new user message
    messages.append(HumanMessage(content=message))
    
    # Run the agent
    result = await graph.ainvoke({"messages": messages})
    
    # Extract the final response
    final_messages = result["messages"]
    
    # Find the last AI message (skip tool messages)
    response_content = ""
    for msg in reversed(final_messages):
        if isinstance(msg, AIMessage) and msg.content:
            response_content = msg.content
            break
    
    # Update conversation history
    new_history = conversation_history.copy() if conversation_history else []
    new_history.append({"role": "user", "content": message})
    new_history.append({"role": "assistant", "content": response_content})
    
    return response_content, new_history

