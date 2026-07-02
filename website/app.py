from app import create_app
from app.extensions import db
# import website.app.services as services

app = create_app()

# word = Word()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
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

# from fsrs import Card, Scheduler

# card = Card()
# scheduler = Scheduler()

# print(card.due)
# card, _ = scheduler.review_card(card, 1)
# print(card.due)