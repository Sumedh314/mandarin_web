from app import create_app
from fsrs import Card
from datetime import datetime, timezone
# from app.models import Word

app = create_app()
# word = Word()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    # with yt_dlp.YoutubeDL({'format': 'bestvideo', 'quiet': True}) as ydl:
    #     info = ydl.extract_info('https://www.youtube.com/watch?v=NxITmnGIl7E', download=False)
    
    # url = info['url']
    # fps = info['fps']
    # duration = info['duration']
    
    # capture = cv2.VideoCapture(url)

    # while capture.isOpened():
    #     ret, frame = capture.read()