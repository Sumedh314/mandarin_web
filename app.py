from flask import Flask, request, jsonify, render_template
from deep_translator import GoogleTranslator
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import parse_qs, urlparse


app = Flask(__name__)
translator = GoogleTranslator()
transcript_generator = YouTubeTranscriptApi()


@app.route('/')
def home():
    """Home page for site"""
    return render_template('index.html')


@app.route('/translate_text', methods=['POST'])
def translate_text():
    """Translates a given word or phrase and returns it to JavaScript"""
    text = request.data.decode('utf-8')
    translation = (translator.translate(text))

    return translation


@app.route('/generate_transcript', methods=['POST'])
def generate_transcript():
    """Generates the transcript of a YouTube video"""
    link = request.data.decode('utf-8')

    query = urlparse(link).query
    video_id = parse_qs(query)['v'][0]

    transcript = transcript_generator.fetch(video_id=video_id, languages=['zh', 'zh-Hans', 'zh-CN', 'zh-Hant', 'en']).to_raw_data()

    return jsonify(transcript)


if __name__ == '__main__':
    app.run(debug=True)