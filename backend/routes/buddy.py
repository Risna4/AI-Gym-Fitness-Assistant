import requests

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from models.user import User
from dependencies import get_current_user


router = APIRouter()


class BuddyMessage(BaseModel):
    message: str


OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "llama3.2:latest"


@router.get("/")
def get_buddy_info(
    current_user: User = Depends(get_current_user)
):
    return {
        "message": "Virtual Gym Buddy is ready!",
        "user": current_user.name,
        "fitness_goal": (
            current_user.fitness_goal
            or "general fitness"
        )
    }


@router.post("/chat")
def chat_with_buddy(
    message: BuddyMessage,
    current_user: User = Depends(get_current_user)
):

    user_message = message.message.strip()

    if not user_message:
        return {
            "reply": "Tell me what you need help with!"
        }

    goal = (
        current_user.fitness_goal
        or "general fitness"
    )

    prompt = f"""
You are the Virtual Gym Buddy in an AI Gym & Fitness Assistant.

User name: {current_user.name}
Fitness goal: {goal}

Your role is to provide friendly, practical and
encouraging fitness guidance.

You can help with:
- workout ideas
- exercise basics
- motivation
- consistency
- recovery and rest
- healthy lifestyle habits
- general nutrition education

Rules:
- Give general fitness and wellness information.
- Do not diagnose medical conditions.
- Do not provide medical treatment.
- Do not encourage extreme exercise.
- Do not encourage restrictive eating.
- Do not promote unrealistic body standards.
- If the user mentions significant pain, injury,
  illness, dizziness or another concerning symptom,
  recommend stopping the activity and seeking
  appropriate professional help.
- Do not pretend to be a human.
- Keep responses reasonably concise.
- Answer the user's actual question.

User's question:
{user_message}

Respond naturally as the Virtual Gym Buddy.
"""

    try:

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        if response.status_code != 200:

            print(
                "Ollama error:",
                response.text
            )

            raise HTTPException(
                status_code=500,
                detail="Local AI model returned an error."
            )

        data = response.json()

        reply = data.get(
            "response",
            ""
        ).strip()

        if not reply:

            raise HTTPException(
                status_code=500,
                detail="Local AI returned an empty response."
            )

        return {
            "message": user_message,
            "reply": reply
        }

    except requests.exceptions.ConnectionError:

        raise HTTPException(
            status_code=503,
            detail=(
                "Ollama is not running. "
                "Please start Ollama and try again."
            )
        )

    except requests.exceptions.Timeout:

        raise HTTPException(
            status_code=504,
            detail=(
                "The local AI model took too long "
                "to respond. Please try again."
            )
        )

    except HTTPException:

        raise

    except Exception as error:

        print(
            "Local AI error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to process the message."
        )