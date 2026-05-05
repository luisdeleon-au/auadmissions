"""Atlantis University — IT Admissions Agent (Flask app).

The main page is the bilingual IT program reference (`auit.html`) with the AU
IT Advisor chat dock embedded as a slide-out panel on the right. The reference
is the rep's primary surface; the AI assistant is one click away when needed.

Conversation history is kept on the client and sent on every request, so the
server stays stateless.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request

import anthropic

from agent.loader import build_system_prompt

load_dotenv()

MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 1024

BASE_DIR = Path(__file__).resolve().parent

app = Flask(__name__, static_folder="static", template_folder="templates")

SYSTEM_PROMPT = build_system_prompt()

_api_key = os.environ.get("ANTHROPIC_API_KEY")
client = anthropic.Anthropic(api_key=_api_key) if _api_key else None


@app.route("/")
def index():
    return render_template("auit.html")


@app.route("/chat", methods=["POST"])
def chat():
    if client is None:
        return (
            jsonify(
                {
                    "error": (
                        "ANTHROPIC_API_KEY is not set. Copy .env.example to .env "
                        "and add your key, then restart the server."
                    )
                }
            ),
            500,
        )

    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    history = data.get("history") or []

    if not message:
        return jsonify({"error": "Message is required."}), 400

    messages = []
    for turn in history:
        role = turn.get("role")
        content = turn.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": message})

    try:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        text_parts = [block.text for block in response.content if getattr(block, "type", None) == "text"]
        reply = "".join(text_parts).strip() or "(no response)"
        return jsonify({"response": reply})
    except anthropic.APIStatusError as e:
        return jsonify({"error": f"Anthropic API error ({e.status_code}): {e.message}"}), 502
    except anthropic.APIConnectionError as e:
        return jsonify({"error": f"Connection error: {e}"}), 502
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {e}"}), 500


@app.route("/reset", methods=["POST"])
def reset():
    return jsonify({"ok": True, "message": "Conversation cleared."})


if __name__ == "__main__":
    print("=" * 60)
    print("AU IT Admissions Advisor")
    print("=" * 60)
    if not _api_key:
        print("WARNING: ANTHROPIC_API_KEY is not set.")
        print("   Copy .env.example to .env and add your key.")
    print(f"Model:           {MODEL}")
    print(f"System prompt:   {len(SYSTEM_PROMPT):,} characters loaded")
    print("Server starting at http://127.0.0.1:5000")
    print("=" * 60)
    app.run(host="127.0.0.1", port=5000, debug=True)
