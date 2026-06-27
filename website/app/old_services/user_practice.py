import json

from google.genai import types
from app.old_services.storage import load_json, dump_json
from config import gemini_client, PRACTICE_SENTENCES_PATH


def update_practice_sentences(word, new_sentences):
    """Adds to practice_sentences JSON file"""
    practice_sentences: dict[str, list] = load_json(PRACTICE_SENTENCES_PATH)
    
    if word in practice_sentences.keys():
        practice_sentences[word].extend(new_sentences)
    else:
        practice_sentences[word] = new_sentences

    dump_json(PRACTICE_SENTENCES_PATH, practice_sentences)


def generate_practice_sentences(words, num_sentences):
    """Generates practice senetences using Gemini and a list of words to generate sentences with"""
    prompt = f'Using this list of Mandarin Chinese words, generate {num_sentences} sentences for each word using simplified Mandarin Chinese: {', '.join(words)}. Other than the words in the list, use relatively common vocabulary for the sentences.'

    schema = {}
    for word in words:
        schema[word] = {'type': 'array', 'items': {'type': 'string'}}

    response = gemini_client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type='application/json',
            response_schema={
                "type": "object",
                "description": "A dictionary in which keys are a single Mandarin Chinese word whose values are Mandarin Chinese sentences that contain their corresponding key word.",
                "properties": schema
            }
        )
    )
    
    sentences_by_word = json.loads(response.text)
    for word in sentences_by_word:
        update_practice_sentences(word, sentences_by_word[word])


def get_low_words(num_sentences=5):
    """Gets the words that have fewer than the desired amount of practice sentences"""
    practice_sentences = load_json(PRACTICE_SENTENCES_PATH)
    
    low_words = []
    for practice_word in practice_sentences:
        if len(practice_sentences[practice_word]) < num_sentences:
            low_words.append(practice_word)
    
    return low_words