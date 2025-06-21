from flask import Flask, request, jsonify
from openai_client import OpenAIClient
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
openai_client = OpenAIClient(api_key)

app = Flask(__name__)

CORS(app)

@app.route('/')
def home():
    return """
    <html>
        <head>
            <title>SERVER_CHATBOT</title>
            <link rel="icon" href="/static/icon.png" type="image/x-icon">
        </head>
        <body>
            <h1>SERVER ĐÃ ĐƯỢC KHỞI TẠO !</h1>
        </body>
    </html>
    """

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    messages = data.get('messages',[])
    if not messages:
        return jsonify({'error': 'No message provided'}), 400

    response = openai_client.chat(messages)

    return jsonify({'response': response,
                    'role':'assistant'
                    })

if __name__ == '__main__':
    app.run(debug=True)