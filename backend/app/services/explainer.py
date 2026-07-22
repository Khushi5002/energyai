from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ["GROQ_API_KEY"])


def explain_recommendation(rec):
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