import requests

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from models.user import User
from dependencies import get_current_user


router = APIRouter()


OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
OLLAMA_MODEL = "llama3.2:latest"


class DietQuestion(BaseModel):
    question: str


@router.get("/")
def get_diet_info(
    current_user: User = Depends(get_current_user)
):
    fitness_goal = (
        current_user.fitness_goal
        or "general fitness"
    )

    recommendations = [
        "Include a variety of vegetables and fruits in your meals.",
        "Choose a mixture of protein-rich foods and whole grains.",
        "Include healthy fat sources such as nuts and seeds.",
        "Drink water regularly throughout the day.",
        "Aim for balanced and varied meals."
    ]

    sample_meals = [
        {
            "meal": "Breakfast",
            "suggestion":
                "Oats with fruit and a suitable protein-rich food"
        },
        {
            "meal": "Lunch",
            "suggestion":
                "Rice or whole grains with vegetables and a protein-rich food"
        },
        {
            "meal": "Snack",
            "suggestion":
                "Fruit with nuts, seeds, yogurt, or another suitable snack"
        },
        {
            "meal": "Dinner",
            "suggestion":
                "A balanced meal containing vegetables, carbohydrates, and protein"
        }
    ]

    return {
        "message":
            "AI Dietician recommendations generated successfully",
        "user":
            current_user.name,
        "fitness_goal":
            fitness_goal,
        "recommendations":
            recommendations,
        "sample_meals":
            sample_meals
    }


@router.post("/chat")
def diet_chat(
    question: DietQuestion,
    current_user: User = Depends(get_current_user)
):
    user_question = question.question.strip()

    if not user_question:
        return {
            "answer":
                "Please enter a nutrition question."
        }

    fitness_goal = (
        current_user.fitness_goal
        or "general fitness"
    )

    prompt = f"""
You are the AI Dietician inside an AI Gym & Fitness Assistant.

User name: {current_user.name}
User fitness goal: {fitness_goal}

Your role is to provide general nutrition education
and practical healthy food guidance.

You can help with:
- balanced meals
- breakfast, lunch and dinner ideas
- healthy snacks
- protein-rich foods
- fruits and vegetables
- hydration
- general nutrition questions
- meal planning ideas
- grocery suggestions

Important safety rules:
- Give general nutrition information only.
- Do not diagnose medical conditions.
- Do not prescribe treatment or medication.
- Do not encourage restrictive eating.
- Do not encourage extreme dieting or fasting.
- Do not promote unrealistic body standards.
- Do not give dangerous weight-loss instructions.
- Do not make medical claims.
- If the user asks about a medical condition,
  allergy, eating disorder, or other health concern,
  recommend discussing it with a qualified healthcare
  professional or trusted adult.
- Keep the answer practical and reasonably concise.
- Consider the user's stated fitness goal, but do not
  recommend extreme methods to achieve it.

User's nutrition question:
{user_question}

Give a clear and helpful answer as the AI Dietician.
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

        answer = data.get(
            "response",
            ""
        ).strip()

        if not answer:

            raise HTTPException(
                status_code=500,
                detail="Local AI returned an empty response."
            )

        return {
            "question": user_question,
            "answer": answer,
            "fitness_goal": fitness_goal
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
            detail="Unable to process the nutrition question."
        )