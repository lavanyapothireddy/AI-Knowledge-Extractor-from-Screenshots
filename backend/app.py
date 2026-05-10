import os
import base64
import httpx
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, origins=["*"])

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "bmp"}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_media_type(filename):
    ext = filename.rsplit(".", 1)[1].lower()
    media_types = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif",
        "webp": "image/webp",
        "bmp": "image/bmp",
    }
    return media_types.get(ext, "image/jpeg")


def build_extraction_prompt(extraction_type, custom_prompt=None):
    prompts = {
        "full": """Analyze this screenshot thoroughly and extract ALL knowledge from it. Provide:
1. **Summary**: A concise overview of what this screenshot shows
2. **Key Information**: All important text, data, numbers, names, URLs
3. **Structure**: How the content is organized (menus, sections, tables, etc.)
4. **Insights**: Notable patterns, relationships, or observations
5. **Action Items**: Any tasks, links, or next steps visible
6. **Technical Details**: Any code, technical specs, or configuration visible
Format your response in clear Markdown with headers and bullet points.""",

        "text": """Extract ALL text from this screenshot exactly as it appears. Include:
- Headers and titles
- Body text and paragraphs
- Labels and captions
- Button text and UI labels
- Numbers and codes
- URLs and links
Preserve the logical reading order. Format as clean text.""",

        "summary": """Provide a concise but comprehensive summary of this screenshot in 3-5 sentences. Cover:
- What type of content/interface this is
- The main purpose or topic
- Key data points or important information visible
- Any critical actions or states shown""",

        "structured": """Extract and structure ALL data from this screenshot as JSON. Include:
- title: main heading or page title
- type: type of content (dashboard, article, form, code, etc.)
- text_content: all visible text organized by section
- data_tables: any tables or structured data
- ui_elements: buttons, menus, links visible
- metadata: dates, authors, version numbers, etc.
Return valid JSON only, no extra text.""",

        "code": """Extract all code, commands, configurations, or technical content from this screenshot. Provide:
1. The extracted code/commands in proper code blocks with language tags
2. Brief explanation of what the code does
3. Any important technical details or requirements visible
4. Dependencies or prerequisites shown""",

        "custom": custom_prompt or "Describe what you see in this screenshot in detail.",
    }
    return prompts.get(extraction_type, prompts["full"])


def call_groq_vision(image_data, media_type, prompt):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_VISION_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{image_data}"
                        },
                    },
                    {
                        "type": "text",
                        "text": prompt,
                    },
                ],
            }
        ],
        "max_tokens": 4096,
        "temperature": 0.2,
    }

    with httpx.Client(timeout=90) as client:
        response = client.post(GROQ_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    tokens_used = data.get("usage", {}).get("total_tokens", 0)
    return content, tokens_used


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "AI Knowledge Extractor"}), 200


@app.route("/api/extract", methods=["POST"])
def extract_knowledge():
    if not GROQ_API_KEY:
        return jsonify({"error": "GROQ_API_KEY is not configured on the server."}), 500

    if "file" not in request.files and "image_base64" not in request.form:
        return jsonify({"error": "No image provided"}), 400

    extraction_type = request.form.get("extraction_type", "full")
    custom_prompt = request.form.get("custom_prompt", "")

    image_data = None
    media_type = "image/jpeg"
    filename = "screenshot.jpg"

    if "file" in request.files:
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": "File type not allowed. Use PNG, JPG, JPEG, GIF, WEBP, or BMP"}), 400

        filename = secure_filename(file.filename)
        media_type = get_media_type(filename)
        image_data = base64.standard_b64encode(file.read()).decode("utf-8")

    elif "image_base64" in request.form:
        raw = request.form["image_base64"]
        if raw.startswith("data:"):
            header, raw = raw.split(",", 1)
            media_type = header.split(":")[1].split(";")[0]
        image_data = raw

    if not image_data:
        return jsonify({"error": "Failed to process image"}), 400

    prompt = build_extraction_prompt(extraction_type, custom_prompt)

    try:
        result, tokens_used = call_groq_vision(image_data, media_type, prompt)
        return jsonify({
            "success": True,
            "result": result,
            "extraction_type": extraction_type,
            "filename": filename,
            "tokens_used": tokens_used,
            "model": GROQ_VISION_MODEL,
        })

    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        try:
            detail = e.response.json().get("error", {}).get("message", str(e))
        except Exception:
            detail = str(e)
        if status == 429:
            return jsonify({"error": "Rate limit exceeded. Please wait a moment and try again."}), 429
        if status == 401:
            return jsonify({"error": "Invalid GROQ_API_KEY. Check your server configuration."}), 401
        return jsonify({"error": f"Groq API error: {detail}"}), status

    except httpx.TimeoutException:
        return jsonify({"error": "Request timed out. Please try again."}), 504

    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


@app.route("/api/batch-extract", methods=["POST"])
def batch_extract():
    if not GROQ_API_KEY:
        return jsonify({"error": "GROQ_API_KEY is not configured on the server."}), 500

    if "files" not in request.files:
        return jsonify({"error": "No files provided"}), 400

    files = request.files.getlist("files")
    extraction_type = request.form.get("extraction_type", "summary")
    results = []

    for file in files[:5]:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            media_type = get_media_type(filename)
            image_data = base64.standard_b64encode(file.read()).decode("utf-8")
            prompt = build_extraction_prompt(extraction_type)

            try:
                content, tokens_used = call_groq_vision(image_data, media_type, prompt)
                results.append({
                    "filename": filename,
                    "success": True,
                    "result": content,
                    "tokens_used": tokens_used,
                })
            except Exception as e:
                results.append({
                    "filename": filename,
                    "success": False,
                    "error": str(e),
                })

    return jsonify({"success": True, "results": results, "total": len(results)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
