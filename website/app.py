from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

from urllib.parse import parse_qs, urlparse
from dotenv import load_dotenv
from pathlib import Path
import os

import requests
import json

import random
import time

from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranslationLanguageNotAvailable

from deep_translator import GoogleTranslator
from google import genai

import jieba
import pinyin


load_dotenv()

app = Flask(__name__)
CORS(app)

translator = GoogleTranslator()

transcript_generator = YouTubeTranscriptApi()

client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))
chat = client.chats.create(model='gemini-2.5-flash')

mandarin_language_codes = ['zh', 'zh-Hans', 'zh-CN', 'zh-Hant']
mandarin_and_english_language_codes = ['zh', 'zh-Hans', 'zh-CN', 'zh-Hant', 'en']

base_path = Path(__file__).parent

word_proficiency_levels_json = base_path / 'user_progress' / 'word_proficiency_levels.json'
practice_sentences_json = base_path / 'user_progress' / 'practice_sentences.json'
saved_words_json = base_path / 'user_progress' / 'saved_words.json'
transcripts_json = base_path / 'user_progress' / 'transcripts.json'
hsk_words_json = base_path / 'mandarin_words' / 'words_by_hsk.json'
words_list_json = base_path / 'mandarin_words' / 'words.json'

with open(words_list_json, 'r') as words_list:
    all_words = json.load(words_list)

with open(hsk_words_json, 'r') as hsk_words_file:
    hsk_words = json.load(hsk_words_file)


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

    for word in all_words:
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
    
    for word in all_words:
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
    segmented_text = [word for word in jieba.cut_for_search(text)]
    print(segment_text)
    segmented_text = [word for word in jieba.cut(text)]
    print(segment_text)

    return segmented_text


@app.route('/segment_transcript', methods=['POST'])
def segment_transcript():
    """Segments a video transcript into individual words using the jieba library while preserving timestamps"""
    transcript = request.json
    segmented_transcript = {}
    
    for snippet in transcript:
        segmented_transcript[snippet['start']] = [word for word in jieba.cut(snippet['text'])]

    return jsonify(segmented_transcript)


@app.route('/get_proficiency_levels', methods=['POST'])
def get_proficiency_levels():
    """Returns the proficiency levels of each word of the given text"""
    text = request.json
    text_proficiency_levels = {}

    with open(word_proficiency_levels_json, 'r') as word_proficiency_levels_file:
        word_proficiency_levels = json.load(word_proficiency_levels_file)

    for word in text:
        word_is_mandarin = True
        for character in word:
            if not '\u4e00' <= character <= '\u9fff':
                word_is_mandarin = False
                break

        if not word_is_mandarin:
            continue
        
        if word in word_proficiency_levels:
            proficiency = word_proficiency_levels[word]
        else:
            word_proficiency_levels[word] = 0
            proficiency = 0
        text_proficiency_levels[word] = proficiency

    with open(word_proficiency_levels_json, 'w') as word_proficiency_levels_file:
        json.dump(word_proficiency_levels, word_proficiency_levels_file, ensure_ascii=False, indent=4)

    return jsonify(text_proficiency_levels)


@app.route('/update_proficiency_levels', methods=['POST'])
def update_proficiency_levels():
    """Updates the word proficiency levels with new data from JavaScript"""
    proficiency_levels_to_update = request.json
    updated_proficiency_levels = {}

    with open(word_proficiency_levels_json, 'r') as word_proficiency_levels_file:
        word_proficiency_levels = json.load(word_proficiency_levels_file)
    
    current_word = proficiency_levels_to_update['current']
    if current_word != '':
        proficiency = word_proficiency_levels[current_word]
        if proficiency == 0:
            proficiency = 1
        elif 1 < proficiency <= 3:
            proficiency -= 1
        word_proficiency_levels[current_word] = proficiency
        updated_proficiency_levels[current_word] = proficiency

    previous_words = proficiency_levels_to_update['previous']
    for word in previous_words:
        proficiency = word_proficiency_levels[word]

        if proficiency == 0:
            proficiency = 3
        elif 0 < proficiency < 3:
            proficiency += 1
        
        word_proficiency_levels[word] = proficiency
        updated_proficiency_levels[word] = proficiency
        
    with open(word_proficiency_levels_json, 'w') as word_proficiency_levels_file:
        json.dump(word_proficiency_levels, word_proficiency_levels_file, ensure_ascii=False, indent=4)
    
    return jsonify(updated_proficiency_levels)


@app.route('/generate_transcript', methods=['POST'])
def generate_transcript():
    """Generates the transcript of a YouTube video"""
    link = request.data.decode()

    query = urlparse(link).query
    video_id = parse_qs(query)['v'][0]

    transcript_found = True
    transcript_is_new = False

    with open(transcripts_json, 'r') as transcript_file:
        transcripts: dict = json.load(transcript_file)

    if video_id in transcripts:
        transcript = transcripts[video_id]['transcript']
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
            transcripts[video_id] = {'transcript': transcript, 'last_index': -1}
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


@app.route('/get_last_index', methods=['POST'])
def get_last_index():
    """Gets the location of the place the user left off of a transcript"""
    video_id = request.data.decode()

    with open(transcripts_json, 'r') as transcript_file:
        transcripts = json.load(transcript_file)
    
    if video_id in transcripts:
        return str(transcripts[video_id]['last_index'])
    else:
        return '0'


@app.route('/set_last_index', methods=['POST'])
def set_last_index():
    """Sets the index of the place the user left off of a transcript"""
    data = request.json
    print(data)

    with open(transcripts_json, 'r') as transcript_file:
        transcripts = json.load(transcript_file)

    transcripts[data['videoId']]['last_index'] = data['lastIndex']

    with open(transcripts_json, 'w') as transcript_file:
        json.dump(transcripts, transcript_file, ensure_ascii=False, indent=4)
    
    return ''


@app.route('/prompt_gemini', methods=['POST'])
def prompt_gemini():
    """Prompts Google Gemini using its API"""
    prompt = request.data.decode()

    chat = client.chats.create(model='gemini-2.5-flash')
    response = chat.send_message(prompt).text

    print(response)

    return response


@app.route('/get_hsk_percentages', methods=['GET'])
def get_hsk_percentages():
    """Returns the percentages of HSK words user knows and is learning for each level and HSK standard"""
    hsk_percentages = {}

    with open(word_proficiency_levels_json, 'r') as word_proficiency_levels_file:
        user_words = json.load(word_proficiency_levels_file)

    known_words = 0
    learning_words = 0

    hsk_level = 1
    hsk_standard = 'old'

    while hsk_standard != 'new' or hsk_level <= 7:

        words_to_check = hsk_words[f'{hsk_standard}_{hsk_level}']
        for word in user_words:
            if user_words[word] != 0:
                if user_words[word] == 3:
                    if word in words_to_check:
                        known_words += 1
                else:
                    if word in words_to_check:
                        learning_words += 1

        known_percent = round(known_words / len(words_to_check) * 100, 2)
        learning_percent = round(learning_words / len(words_to_check) * 100, 2)
        total_percent = round(known_percent + learning_percent, 2)

        hsk_percentages[f'{hsk_standard}-hsk-{hsk_level}-percent'] = f'{known_percent}% + {learning_percent}% = {total_percent}%'
        hsk_level += 1
        known_words = 0
        learning_words = 0

        if hsk_level == 7:
            if hsk_standard == 'old':
                hsk_standard = 'new'
                hsk_level = 1

    return jsonify(hsk_percentages)


@app.route('/get_random_list_words_learning', methods=['POST'])
def get_random_list_words_learning():
    num_words = int(request.data.decode())
    word_list = []

    with open(word_proficiency_levels_json, 'r') as words_file:
        words = json.load(words_file)
    
    for word in words:
        if 0 < words[word] < 3:
            word_list.append(word)
    
    word_list = random.choices(word_list, k=num_words)
    
    return jsonify(word_list)


@app.route('/get_random_list_words_saved', methods=['POST'])
def get_random_list_words_saved():
    num_words = int(request.data.decode())
    word_list = []

    with open(saved_words_json, 'r') as words_file:
        words = json.load(words_file)
    
    for word in words:
        if 0 < words[word] < 3:
            word_list.append(word)
    
    word_list = random.choices(word_list, k=num_words)
    
    return jsonify(word_list)


@app.route('/update_practice_sentences', methods=['POST'])
def update_practice_sentences():
    """Adds to practice_sentences JSON file"""
    sentencesList = request.json

    with open(practice_sentences_file, 'r') as practice_sentences_file:
        practice_sentences: list = json.load(practice_sentences_file)
    
    practice_sentences.extend(sentencesList)

    with open(practice_sentences_json, 'w') as practice_sentences_file:
        json.dump(sentencesList, practice_sentences_file, indent=4, ensure_ascii=False)
    
    return sentencesList


@app.route('/toggle_saved_word', methods=['POST'])
def toggle_saved_word():
    """Adds a word to saved_words.json"""
    word = request.data.decode()
    saved = False

    with open(saved_words_json, 'r') as saved_words_file:
        saved_words: list = json.load(saved_words_file)
    
    if word not in saved_words:
        saved = True
        saved_words.append(word)
    else:
        saved = False
        saved_words.remove(word)

    with open(saved_words_json, 'w') as saved_words_file:
        json.dump(saved_words, saved_words_file, indent=4, ensure_ascii=False)
    
    return 'Saved' if saved else 'Unsaved'


@app.route('/check_saved', methods=['POST'])
def check_saved():
    word = request.data.decode()
    
    with open(saved_words_json, 'r') as saved_words_file:
        saved_words: list = json.load(saved_words_file)
    
    return 'Saved' if word in saved_words else 'Unsaved'


if __name__ == '__main__':
    app.run(debug=True, port=5000)