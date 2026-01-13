from flask import Flask, request, jsonify, render_template
from deep_translator import GoogleTranslator

translator = GoogleTranslator()

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate():
    phrase = request.data.decode('utf-8')
    translation = (translator.translate(phrase))
    result = {'translation': translation}
    return(jsonify(result))

if __name__ == '__main__':
    app.run(debug=True)