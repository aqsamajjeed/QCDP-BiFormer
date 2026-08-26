from google import genai
from llm.config import GEMINI_API_KEY
from rag.rag import retrieve_chunks, build_context


client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "models/gemini-3.6-flash"


def generate_initial_report(left_prediction, right_prediction):

    left_query = f"""
    {left_prediction}
    definition symptoms signs risk factors
    detection diagnosis treatment management prevention
    """

    right_query = f"""
    {right_prediction}
    definition symptoms signs risk factors
    detection diagnosis treatment management prevention
    """

    left_results = retrieve_chunks(left_query, k=8)
    right_results = retrieve_chunks(right_query, k=8)

    left_context = build_context(left_results)
    right_context = build_context(right_results)

    prompt = f"""
You are a medical information assistant.

The AI model predicted:

LEFT EYE: {left_prediction}
RIGHT EYE: {right_prediction}

LEFT EYE MEDICAL INFORMATION:
{left_context}

RIGHT EYE MEDICAL INFORMATION:
{right_context}

Generate a clear educational explanation for both eyes.

Keep LEFT and RIGHT eye information separate.

For each eye explain:
- What the condition is
- Important symptoms/signs
- Risk factors
- Detection
- General management information if available

Use ONLY the retrieved information.
Do not invent information.
Do not claim that the prediction is a confirmed diagnosis.
Keep the answer concise.
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        return response.text

    except Exception as e:

        return (
            "The LLM service is temporarily unavailable. "
            "The disease prediction and medical information "
            "retrieval are still available."
        )


def answer_followup_question(
    left_prediction,
    right_prediction,
    user_question
):

    left_query = f"{left_prediction}: {user_question}"

    right_query = f"{right_prediction}: {user_question}"

    left_results = retrieve_chunks(left_query, k=5)
    right_results = retrieve_chunks(right_query, k=5)

    left_context = build_context(left_results)
    right_context = build_context(right_results)

    prompt = f"""
You are a medical information assistant.

AI predictions:

LEFT EYE: {left_prediction}
RIGHT EYE: {right_prediction}

USER QUESTION:
{user_question}

LEFT EYE RETRIEVED INFORMATION:
{left_context}

RIGHT EYE RETRIEVED INFORMATION:
{right_context}

Answer the user's question using ONLY the retrieved information.

If the question concerns both eyes, clearly separate the
LEFT and RIGHT eye information.

If it concerns only one eye, focus on that condition.

Do not invent medical information.
Do not treat the AI prediction as a confirmed diagnosis.
Keep the answer concise.
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        return response.text

    except Exception as e:

        return (
            "The LLM service is temporarily unavailable. "
            "Please try again later."
        )