import json

from google.genai import types

from config import gemini_client


def generate_practice_sentences(words, num_sentences):
    """Generates practice senetences using Gemini and a list of words to generate sentences with"""
    prompt = f'Using this list of Mandarin Chinese words, generate {num_sentences} sentences for each word using simplified Mandarin Chinese: {', '.join(words)}. Other than the words in the list, use relatively common vocabulary for the sentences.'

    response_schema={
        "type": "object",
        "description": "A dictionary in which keys are a single Mandarin Chinese word whose values are Mandarin Chinese sentences that contain their corresponding key word.",
        "properties": {word: {'type': 'array', 'items': {'type': 'string'}} for word in words}
    }

    return json.loads(prompt_gemini(prompt, schema=response_schema))


def prompt_gemini(prompt: str, model: str = 'gemini-2.5-flash-lite', schema: dict = None):
    """Prompts Google Gemini and returns its response"""
    if schema == None:
        response = gemini_client.models.generate_content(model=model, contents=prompt).text
    else:
        response = gemini_client.models.generate_content(
            model=model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=schema
            )
        )
    
    return response.text if hasattr(response, 'text') else response