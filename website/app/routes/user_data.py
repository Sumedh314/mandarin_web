import random
from datetime import datetime, timezone
from urllib.parse import parse_qs, urlparse

from youtube_transcript_api import NoTranscriptFound, TranslationLanguageNotAvailable
from flask import Blueprint, request, jsonify
from fsrs import Card, Rating

from app.services.storage import load_json, dump_json
from app.services.user_practice import generate_practice_sentences, get_low_words
from config import SCHEDULER, TRANSCRIPT_GENERATOR, MANDARIN_LANGAUGE_CODES, MANDARIN_AND_ENGLISH_LANGUAGE_CODES, WORD_PROFICIENCY_LEVELS_PATH, PRACTICE_SENTENCES_PATH, FLASHCARDS_DATA_PATH, SAVED_WORDS_PATH, TRANSCRIPTS_PATH, HSK_WORDS_PATH, flashcards_by_word


user_data_bp = Blueprint('user_data', __name__)


@user_data_bp.route('/fetch_review_times', methods=['POST'])
def fetch_review_times():
    """Gets the amount of time before the next review of a flashcard depending on which button user clicks"""
    word = request.data.decode()
    card = flashcards_by_word[word]

    review_times = []

    ratings = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]
    for rating in ratings:
        new_card = Card.from_dict(card.to_dict())
        new_card, _ = SCHEDULER.review_card(new_card, rating)
        review_times.append((new_card.due - datetime.now(timezone.utc)).total_seconds())
    
    print(review_times)
    return review_times


@user_data_bp.route('/fetch_next_word', methods=['POST'])
def fetch_next_word():
    """Gets the next word and card that's due for the user to review"""
    index = int(request.data.decode())

    due_words = fetch_due_words()

    if len(due_words) <= index:
        return 'None'
    
    next_word = due_words[index]

    return next_word


@user_data_bp.route('/fetch_due_words', methods=['GET'])
def fetch_due_words():
    """Gets a list of words that the user is due to review the flashcards for"""
    due_pairs: list[tuple[str, Card]] = []

    for word, card in flashcards_by_word.items():
        if card.due <= datetime.now(timezone.utc) or card.state == 1:
            due_pairs.append((word, card))

    due_pairs.sort(key=lambda pair: pair[1].due)
    due_words = [pair[0] for pair in due_pairs]
    
    return due_words


@user_data_bp.route('/create_initial_cards', methods=['POST'])
def create_initial_cards():
    """Creates cards for the Free Spaced Repetition System algorithm from flashcards_data.json"""
    flashcards_data = load_json(FLASHCARDS_DATA_PATH)
    
    for word in flashcards_data:
        card = Card.from_dict(flashcards_data[word])
        flashcards_by_word[word] = card
    
    return ''


@user_data_bp.route('/create_card', methods=['POST'])
def create_card():
    """Creates a card for the Free Spaced Repetition System algorithm"""
    word = request.data.decode()

    flashcards_data = load_json(FLASHCARDS_DATA_PATH)

    card = Card()

    flashcards_data[word] = card.to_dict()

    dump_json(FLASHCARDS_DATA_PATH, flashcards_data)
    
    return ''


@user_data_bp.route('/update_card', methods=['POST'])
def update_card():
    """Updates a card using the Free Spaced Repetition System algorithm"""
    print('updating')
    data = request.json

    word = data['word']
    rating = data['rating']

    card = flashcards_by_word[word]

    card, review_log = SCHEDULER.review_card(card, rating, datetime.now(timezone.utc))
    print(review_log)

    card_data = card.to_dict()
    flashcards_data = load_json(FLASHCARDS_DATA_PATH)
    flashcards_data[word] = card_data
    dump_json(FLASHCARDS_DATA_PATH, flashcards_data)

    flashcards_by_word[word] = card
    print(card.due)
    return ''


@user_data_bp.route('/fetch_sentence', methods=['POST'])
def fetch_sentence():
    """Gets a sentence that includes the given word for the user to practice with"""
    word = request.data.decode()

    practice_sentences: list[list] = load_json(PRACTICE_SENTENCES_PATH)

    if word in practice_sentences:
        if len(practice_sentences[word]) == 0:
            force_generate_practice_sentences()
            practice_sentences: list[list] = load_json(PRACTICE_SENTENCES_PATH)
        sentence = practice_sentences[word][0]
        practice_sentences[word].pop(0)
    else:
        sentence = 'None'
    
    dump_json(PRACTICE_SENTENCES_PATH, practice_sentences)

    return sentence


@user_data_bp.route('/fetch_random_list_words_saved', methods=['POST'])
def fetch_random_list_words_saved():
    num_words = int(request.data.decode())
    word_list = load_json(SAVED_WORDS_PATH)
    word_list = random.sample(word_list, k=num_words)
    
    return jsonify(word_list)


@user_data_bp.route('/fetch_random_list_words_learning', methods=['POST'])
def fetch_random_list_words_learning():
    num_words = int(request.data.decode())
    word_list = []

    words = load_json(WORD_PROFICIENCY_LEVELS_PATH)
    
    for word in words:
        if 0 < words[word] < 3:
            word_list.append(word)
    
    word_list = random.choices(word_list, k=num_words)
    
    return jsonify(word_list)


@user_data_bp.route('/toggle_saved_word', methods=['POST'])
def toggle_saved_word():
    """Adds a word to saved_words.json"""
    word = request.data.decode()
    saved = False

    saved_words: list = load_json(SAVED_WORDS_PATH)
    practice_sentences = load_json(PRACTICE_SENTENCES_PATH)
    
    if word not in saved_words:
        saved = True
        saved_words.append(word)

        practice_sentences[word] = []
    else:
        saved = False
        saved_words.remove(word)

    dump_json(SAVED_WORDS_PATH, saved_words)
    dump_json(PRACTICE_SENTENCES_PATH, practice_sentences)
    
    return 'Saved' if saved else 'Unsaved'


@user_data_bp.route('/check_saved', methods=['POST'])
def check_saved():
    word = request.data.decode()

    saved_words = load_json(SAVED_WORDS_PATH)
    
    return 'Saved' if word in saved_words else 'Unsaved'


@user_data_bp.route('/force_generate_practice_sentences', methods=['GET'])
def force_generate_practice_sentences():
    """Generates practice senetences using Gemini for words that are running low on practice sentences"""
    low_words = get_low_words()

    generate_practice_sentences(low_words, 5)

    return ''


@user_data_bp.route('/fetch_proficiency_levels', methods=['POST'])
def fetch_proficiency_levels():
    """Returns the proficiency levels of each word of the given text"""
    text = request.json
    text_proficiency_levels = {}

    word_proficiency_levels = load_json(WORD_PROFICIENCY_LEVELS_PATH)

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

    dump_json(WORD_PROFICIENCY_LEVELS_PATH, word_proficiency_levels)

    return jsonify(text_proficiency_levels)


@user_data_bp.route('/update_proficiency_levels', methods=['POST'])
def update_proficiency_levels():
    """Updates the word proficiency levels with new data from JavaScript"""
    proficiency_levels_to_update = request.json
    updated_proficiency_levels = {}

    word_proficiency_levels = load_json(WORD_PROFICIENCY_LEVELS_PATH)
    
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

    dump_json(WORD_PROFICIENCY_LEVELS_PATH, word_proficiency_levels)
    
    return jsonify(updated_proficiency_levels)


@user_data_bp.route('/fetch_hsk_percentages', methods=['GET'])
def fetch_hsk_percentages():
    """Returns the percentages of HSK words user knows and is learning for each level and HSK standard"""
    hsk_percentages = {}

    user_words = load_json(WORD_PROFICIENCY_LEVELS_PATH)
    hsk_words = load_json(HSK_WORDS_PATH)

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


@user_data_bp.route('/fetch_transcript', methods=['POST'])
def fetch_transcript():
    """Generates the transcript of a YouTube video"""
    link = request.data.decode()

    query = urlparse(link).query
    video_id = parse_qs(query)['v'][0]

    transcript_found = True
    transcript_is_new = False

    transcripts: dict = load_json(TRANSCRIPTS_PATH)

    if video_id in transcripts:
        transcript = transcripts[video_id]['transcript']
    else:
        transcript_is_new = True

        try:
            transcript = TRANSCRIPT_GENERATOR.list(video_id=video_id).find_transcript(MANDARIN_AND_ENGLISH_LANGUAGE_CODES)
        except NoTranscriptFound:
            transcript = [{'text': 'Transcript not available', 'start': 0, 'duration': 0}]
            transcript_found = False

        if transcript_found:
            transcript = transcript.fetch().to_raw_data()

    if transcript_is_new:
        transcripts[video_id] = {'transcript': transcript, 'last_index': -1}
        dump_json(TRANSCRIPTS_PATH, transcripts)

    return jsonify(transcript)


@user_data_bp.route('/translate_transcript', methods=['POST'])
def translate_transcript():
    """Translates a transcript from English to Mandarin if available"""
    video_id = request.data.decode()

    transcript = TRANSCRIPT_GENERATOR.list(video_id=video_id).find_transcript(['en'])

    if transcript.is_translatable:
        for code in MANDARIN_LANGAUGE_CODES:
            try:
                transcript = transcript.translate(code).fetch().to_raw_data()
                break
            except TranslationLanguageNotAvailable:
                pass
    else:
        transcript = [{'text': 'Transcript not available', 'start': 0, 'duration': 0}]
    
    print(transcript)
    
    return transcript


@user_data_bp.route('/fetch_last_index', methods=['POST'])
def fetch_last_index():
    """Gets the location of the place the user left off of a transcript"""
    video_id = request.data.decode()

    transcripts = load_json(TRANSCRIPTS_PATH)
    
    if video_id in transcripts:
        return str(transcripts[video_id]['last_index'])
    else:
        return '0'


@user_data_bp.route('/update_transcript_last_index', methods=['POST'])
def update_transcript_last_index():
    """Sets the index of the place the user left off of a transcript"""
    data = request.json
    print(data)

    transcripts = load_json(TRANSCRIPTS_PATH)

    transcripts[data['videoId']]['last_index'] = data['lastIndex']

    dump_json(TRANSCRIPTS_PATH, transcripts)
    
    return ''