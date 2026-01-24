from flask import Flask, request, jsonify, render_template
from urllib.parse import parse_qs, urlparse

from youtube_transcript_api import YouTubeTranscriptApi

from deep_translator import GoogleTranslator
from google import genai

import jieba
import pinyin

from dotenv import load_dotenv
import os

import requests
import json

import time
import string


load_dotenv()

app = Flask(__name__)
translator = GoogleTranslator()
transcript_generator = YouTubeTranscriptApi()
client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

non_mandarin_characters = string.printable + '！？。，、「」（）“‘：\n '


@app.route('/')
def home():
    """Home page for site"""
    return render_template('index.html')


@app.route('/translate_text', methods=['POST'])
def translate_text():
    """Translates a given word or phrase and returns it to JavaScript"""
    text = request.data.decode('utf-8')

    translation = ''
    translation_found = False

    with open('words.json' , 'r') as words_list:
        words = json.load(words_list)

    for word in words:
        if word['s'] == text:
            translation = ', '.join(word['f'][0]['m'])
            translation_found = True
    
    if not translation_found:
        translation = (translator.translate(text))

    return translation


@app.route('/get_pinyin', methods=['POST'])
def get_pinyin():
    """Returns the pinyin representation of a Mandarin word"""
    text = request.data.decode('utf-8')

    pinyin_text = []
    pinyin_found = False
    
    with open('words.json', 'r') as words_list:
        words = json.load(words_list)
    
    for word in words:
        if word['s'] == text:
            for form in word['f']:
                pinyin_text.append(form['i']['y'])
            pinyin_text = ', '.join(pinyin_text)
            pinyin_found = True
    
    if not pinyin_found:
        pinyin_text = pinyin.get(text)
    
    return pinyin_text


@app.route('/segment_text', methods=['POST'])
def segment_text():
    """Segments Mandarin text into individual words using the jieba library"""
    text = request.data.decode('utf-8')
    segmented_text = [word for word in jieba.cut(text)]

    return segmented_text


@app.route('/get_confidence_levels', methods=['POST'])
def get_confidence_levels():
    """Returns the confidence levels of each word of the given text"""
    text = request.json
    text_confidence_levels = {}

    with open('word_confidence_levels.json', 'r') as confidence_levels:
        word_confidence_levels = json.load(confidence_levels)

    for word in text:
        if word in non_mandarin_characters:
            confidence = -1
        elif word in word_confidence_levels:
            confidence = word_confidence_levels[word]
        else:
            word_confidence_levels[word] = 0
            confidence = 0
        
        text_confidence_levels[word] = confidence

    with open('word_confidence_levels.json', 'w') as confidence_levels:
        json.dump(word_confidence_levels, confidence_levels, ensure_ascii=False, indent=4)

    return jsonify(text_confidence_levels)


@app.route('/generate_transcript', methods=['POST'])
def generate_transcript():
    """Generates the transcript of a YouTube video"""
    link = request.data.decode('utf-8')

    query = urlparse(link).query
    video_id = parse_qs(query)['v'][0]

    # transcript = transcript_generator.fetch(video_id=video_id, languages=['zh', 'zh-Hans', 'zh-CN', 'zh-Hant', 'en']).to_raw_data()

    with open('transcript.json', 'r') as transcript_file:
        transcript = json.load(transcript_file)

    return jsonify(transcript)


@app.route('/prompt_gemini', methods=['POST'])
def prompt_gemini():
    """Prompts Google Gemini using its API"""
    prompt = request.data.decode('utf-8')

    chat = client.chats.create(model='gemini-2.0-flash')
    response = chat.send_message(prompt).text

    return response


if __name__ == '__main__':
    app.run(debug=True)

    # text = '因为今天下大雨，所以我们只能在家里看电影，不能去公园玩'
    # get_confidence_levels(segment_text(text))