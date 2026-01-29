from flask import Flask, request, jsonify, render_template
from urllib.parse import parse_qs, urlparse

from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranslationLanguageNotAvailable

from deep_translator import GoogleTranslator
from google import genai

import jieba
import pinyin

from dotenv import load_dotenv
import os

import requests
import json

import time


load_dotenv()

app = Flask(__name__)
translator = GoogleTranslator()
transcript_generator = YouTubeTranscriptApi()
client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
chat = client.chats.create(model='gemini-2.5-flash')

mandarin_language_codes = ['zh', 'zh-Hans', 'zh-CN', 'zh-Hant']
mandarin_and_english_language_codes = ['zh', 'zh-Hans', 'zh-CN', 'zh-Hant', 'en']

word_confidence_levels_json = 'user_progress/word_confidence_levels.json'


@app.route('/')
def home():
    """Home page for site"""
    return render_template('index.html')


@app.route('/translate_text', methods=['POST'])
def translate_text():
    """Translates a given word or phrase and returns it to JavaScript"""
    text = request.data.decode()

    translation = ''
    translation_found = False

    with open('mandarin_words/words.json' , 'r') as words_list:
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
    text = request.data.decode()

    pinyin_text = []
    pinyin_found = False
    
    with open('mandarin_words/words.json', 'r') as words_list:
        words = json.load(words_list)
    
    for word in words:
        if word['s'] == text:
            for form in word['f']:
                pinyin_text.append(form['i']['y'])
            pinyin_found = True
    pinyin_text = ', '.join(pinyin_text)
    
    if not pinyin_found:
        pinyin_text = pinyin.get(text)
    
    return pinyin_text


@app.route('/segment_text', methods=['POST'])
def segment_text():
    """Segments Mandarin text into individual words using the jieba library"""
    text = request.data.decode()
    segmented_text = [word for word in jieba.cut(text)]

    return segmented_text


@app.route('/segment_transcript', methods=['POST'])
def segment_transcript():
    """Segments a video transcript into individual words using the jieba library while preserving timestamps"""
    transcript = request.json
    segmented_transcript = {}
    
    for snippet in transcript:
        segmented_transcript[snippet['start']] = [word for word in jieba.cut(snippet['text'])]

    return jsonify(segmented_transcript)


@app.route('/get_confidence_levels', methods=['POST'])
def get_confidence_levels():
    """Returns the confidence levels of each word of the given text"""
    text = request.json
    text_confidence_levels = {}

    with open(word_confidence_levels_json, 'r') as word_confidence_levels_file:
        word_confidence_levels = json.load(word_confidence_levels_file)

    for word in text:

        word_is_mandarin = True
        for character in word:
            if not '\u4e00' <= character <= '\u9fff':
                word_is_mandarin = False
                break

        if not word_is_mandarin:
            continue
        
        if word in word_confidence_levels:
            confidence = word_confidence_levels[word]
        else:
            word_confidence_levels[word] = 0
            confidence = 0
        text_confidence_levels[word] = confidence

    with open(word_confidence_levels_json, 'w') as word_confidence_levels_file:
        json.dump(word_confidence_levels, word_confidence_levels_file, ensure_ascii=False, indent=4)

    return jsonify(text_confidence_levels)


@app.route('/update_confidence_levels', methods=['POST'])
def update_confidence_levels():
    """Updates the word confidence levels with new data from JavaScript"""
    confidence_levels_to_update = request.json
    updated_confidence_levels = {}

    with open(word_confidence_levels_json, 'r') as word_confidence_levels_file:
        word_confidence_levels = json.load(word_confidence_levels_file)
    
    current_word = confidence_levels_to_update['current']
    confidence = word_confidence_levels[current_word]
    if confidence == 0:
        confidence = 1
    elif 1 < confidence <= 3:
        confidence -= 1
    word_confidence_levels[current_word] = confidence
    updated_confidence_levels[current_word] = confidence

    previous_words = confidence_levels_to_update['previous']
    for word in previous_words:
        confidence = word_confidence_levels[word]

        if confidence == 0:
            confidence = 3
        elif 0 < confidence < 3:
            confidence += 1
        
        word_confidence_levels[word] = confidence
        updated_confidence_levels[word] = confidence
        
    with open(word_confidence_levels_json, 'w') as word_confidence_levels_file:
        json.dump(word_confidence_levels, word_confidence_levels_file, ensure_ascii=False, indent=4)
    
    return jsonify(updated_confidence_levels)


@app.route('/generate_transcript', methods=['POST'])
def generate_transcript():
    """Generates the transcript of a YouTube video"""
    link = request.data.decode()

    query = urlparse(link).query
    video_id = parse_qs(query)['v'][0]

    transcript_found = True
    transcript_is_new = False
    transcripts_json = 'user_progress/transcripts.json'

    with open(transcripts_json, 'r') as transcript_file:
        transcripts: dict = json.load(transcript_file)

        if video_id in transcripts:
            transcript = transcripts[video_id]
        else:
            transcript_is_new = True

            try:
                transcript = transcript_generator.list(video_id=video_id).find_transcript(mandarin_and_english_language_codes)
            except NoTranscriptFound:
                transcript = [{'text': 'Transcript not available', 'start': 0, 'duration': 0}]
                transcript_found = False

            if transcript_found:
                transcript = transcript.fetch().to_raw_data()

    if transcript_is_new:
        with open(transcripts_json, 'w') as transcript_file:
            transcripts[video_id] = transcript
            json.dump(transcripts, transcript_file, ensure_ascii=False, indent=4)

    return jsonify(transcript)


@app.route('/translate_transcript', methods=['POST'])
def translate_transcript():
    """Translates a transcript from English to Mandarin if available"""
    video_id = request.data.decode()

    transcript = transcript_generator.list(video_id=video_id).find_transcript(['en'])

    if transcript.is_translatable:
        for code in mandarin_language_codes:
            try:
                transcript = transcript.translate(code).fetch().to_raw_data()
                break
            except TranslationLanguageNotAvailable:
                pass
    else:
        transcript = [{'text': 'Transcript not available', 'start': 0, 'duration': 0}]
    
    print(transcript)
    
    return transcript


@app.route('/prompt_gemini', methods=['POST'])
def prompt_gemini():
    """Prompts Google Gemini using its API"""
    prompt = request.data.decode()

    chat = client.chats.create(model='gemini-2.5-flash')
    response = chat.send_message(prompt).text

    print(response)

    return response


if __name__ == '__main__':
    app.run(debug=True)

    # print(transcript)