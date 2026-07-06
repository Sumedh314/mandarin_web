from app import create_app
from app.extensions import db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    # from app.services.words import calculate_hsk_percentages
    # calculate_hsk_percentages(db.session)
    app.run(debug=True, port=5000)