"""
ai_classifier.py
----------------
Uses Groq to read headlines about any topic (a country, a route, or a
global market factor) and turn them into a 0-1 risk score.
"""

import os
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "openai/gpt-oss-120b"


def score_topic(topic_label: str, headlines: list[str]) -> float:
    """
    Given headlines about one topic (e.g. 'Russia oil sanctions' or
    'Strait of Hormuz'), returns a risk score between 0.0 (calm) and 1.0 (severe).
    """
    if not headlines:
        return 0.3  # neutral-low default if we truly have no data

    headlines_text = "\n".join(f"- {h}" for h in headlines)

    prompt = f"""You are a geopolitical risk analyst monitoring: {topic_label}

Recent headlines:
{headlines_text}

Based ONLY on these headlines, rate the current risk to oil supply/shipping
on a scale of 0.0 to 1.0, where:
0.0 = completely calm, no risk
0.5 = moderate tension, worth watching
1.0 = severe, active crisis

Respond with ONLY a decimal number between 0.0 and 1.0, nothing else."""

    try:
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=300,
            reasoning_effort="low",
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = response.choices[0].message.content.strip()

        match = re.search(r"0?\.\d+|1\.0|0|1", raw_text)
        if match:
            score = float(match.group())
            return max(0.0, min(score, 1.0))
        else:
            print(f"[ai_classifier warning] No score for '{topic_label}': '{raw_text}' - defaulting to 0.3")
            return 0.3
    except Exception as e:
        print(f"[ai_classifier error] {topic_label}: {e}")
        return 0.3


def score_all(headlines_by_topic: dict) -> dict:
    """
    headlines_by_topic = {"SAU": [...], "RUS": [...], ...}
    Returns: {"SAU": 0.2, "RUS": 0.85, ...}
    """
    return {topic: score_topic(topic, headlines) for topic, headlines in headlines_by_topic.items()}