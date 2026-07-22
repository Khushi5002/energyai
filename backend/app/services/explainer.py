from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

# GROQ_API_KEY is the documented name.  Accept the prior mixed-case spelling
# as well so existing local .env files continue to work on case-sensitive OSes.
api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("Groq_API_KEY")
client = Groq(api_key=api_key) if api_key else None


def explain_recommendation(rec):
    if client is None:
        return (
            f"{rec['supplier']} is ranked using its country and route risk, "
            f"historical reliability, and refinery compatibility. "
            f"Its {rec['grade']} grade is compatible with {rec['refinery']}. "
            "Add GROQ_API_KEY to backend/.env for an AI-generated explanation."
        )

    prompt = f"""
    You are an energy procurement analyst advising India's Ministry of Petroleum.

    Explain in 4 concise sentences why this procurement recommendation is optimal.

    Recommendation:
    Supplier: {rec['supplier']}
    Country: {rec['country']}
    Crude Grade: {rec['grade']}
    Risk Score: {rec['country_risk']}
    Reliability: {rec['reliability']}
    Compatibility: {rec['compatibility']}
    """

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return completion.choices[0].message.content
