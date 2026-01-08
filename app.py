from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/print_this')
def print_this():
    return render_template('index.html', text='hello')

if __name__ == '__main__':
    app.run(debug=True)