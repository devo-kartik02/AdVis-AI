from flask import Flask, render_template_string, request, jsonify
import subprocess
import os
import json

app = Flask(__name__)
UPLOAD_FOLDER = 'ai_engine/temp_test'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Processor.py Emergency Tester</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-white p-10">
    <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-cyan-400">AdVis AI Processor Tester</h1>
        <form action="/test" method="post" enctype="multipart/form-data" class="space-y-4 bg-zinc-900 p-6 rounded-xl border border-white/10">
            <div>
                <label class="block mb-2">Select Category:</label>
                <select name="category" class="bg-zinc-800 p-2 rounded w-full">
                    <option value="food">Food</option>
                    <option value="cosmetic">Cosmetic</option>
                </select>
            </div>
            <div>
                <label class="block mb-2">Upload File (Img/Vid):</label>
                <input type="file" name="file" class="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700">
            </div>
            <button type="submit" class="w-full bg-cyan-500 py-3 rounded-lg font-bold hover:bg-cyan-400 transition">RUN ANALYSIS</button>
        </form>
        <div id="loading" class="hidden mt-4 text-yellow-400 animate-pulse text-center">AI is thinking... (Calling YOLO, Saliency, and Gemini)</div>
        <div id="result" class="mt-8 space-y-4"></div>
    </div>
    <script>
        document.querySelector('form').onsubmit = () => { document.getElementById('loading').classList.remove('hidden'); };
    </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(HTML_TEMPLATE)

@app.route('/test', methods=['POST'])
def test():
    file = request.files['file']
    category = request.form['category']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    # Run your processor.py via subprocess
    cmd = ["python", "ai_engine/processor.py", filepath, category]
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    try:
        # Parse the JSON output from your script
        return jsonify(json.loads(result.stdout))
    except:
        return jsonify({"raw_output": result.stdout, "error": result.stderr})

if __name__ == '__main__':
    app.run(port=8080)