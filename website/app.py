from app import create_app
from app.extensions import db
# import website.app.services as services

app = create_app()
    
with app.app_context():
    db.create_all()
# word = Word()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    # with app.app_context():
    #     services.fetch_transcript(db.session, 'NxITmnGIl7E')
    # with yt_dlp.YoutubeDL({'format': 'bestvideo', 'quiet': True}) as ydl:
    #     info = ydl.extract_info('https://www.youtube.com/watch?v=NxITmnGIl7E', download=False)
    
    # url = info['url']
    # fps = info['fps']
    # duration = info['duration']
    
    # capture = cv2.VideoCapture(url)

    # while capture.isOpened():
    #     ret, frame = capture.read()