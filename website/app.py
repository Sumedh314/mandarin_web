from app import create_app
from app.extensions import db

from app.models import Word, WordForm
from config import WORDS_LIST_PATH
import json


app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # with open(WORDS_LIST_PATH, 'r') as file:
        #     hsk_words = json.load(file)
        
        # # simplified = [word['s'] for word in hsk_words]
        # # print(simplified)
        # # seen = set()
        # # duplicates = set()
        # # for index, word in enumerate(simplified):
        # #     if word in seen:
        # #         duplicates.add(word)
        # #         print(simplified.index(word), index)
        # #     else:
        # #         seen.add(word)
        
        # # print(duplicates)
        # # print(hsk_words[838])
        # # print(hsk_words[839])
        
        # pos_dict = {
        #     "a": "adjective",
        #     "ad": "adjective as adverbial",
        #     "ag": "adjective morpheme",
        #     "an": "adjective with nominal function",
        #     "b": "non-predicate adjective",
        #     "c": "conjunction",
        #     "d": "adverb",
        #     "dg": "adverb morpheme",
        #     "e": "interjection",
        #     "f": "directional locality",
        #     "g": "morpheme",
        #     "h": "prefix",
        #     "i": "idiom",
        #     "j": "abbreviation",
        #     "k": "suffix",
        #     "l": "fixed expressions",
        #     "m": "numeral",
        #     "mg": "numeric morpheme",
        #     "n": "common noun",
        #     "ng": "noun morpheme",
        #     "nr": "personal name",
        #     "ns": "place name",
        #     "nt": "organization name",
        #     "nx": "nominal character string",
        #     "nz": "other proper noun",
        #     "o": "onomatopoeia",
        #     "p": "preposition",
        #     "q": "classifier",
        #     "r": "pronoun",
        #     "rg": "pronoun morpheme",
        #     "s": "space word",
        #     "t": "time word",
        #     "tg": "time word morpheme",
        #     "u": "auxiliary",
        #     "v": "verb",
        #     "vd": "verb as adverbial",
        #     "vg": "verb morpheme",
        #     "vn": "verb with nominal function",
        #     "w": "symbol and non-sentential punctuation",
        #     "x": "unclassified items",
        #     "y": "modal particle",
        #     "z": "descriptive"
        # }


        # new_words = []
        # new_word_forms = []
        
        # id = 1
        # for word in hsk_words:
        #     old_level = None
        #     new_level = None
        #     for level in word['l']:
        #         if level[0] == 'o':
        #             old_level = level[1]
        #         elif level[0] == 'n':
        #             new_level = level[1]


        #     # print(word['p'])
        #     new_word = Word(
        #         id=id,
        #         text=word['s'],
        #         radical=word['r'],
        #         hsk_old_level=old_level,
        #         hsk_new_level=new_level,
        #         frequency=word['q'],
        #         parts_of_speech='; '.join([pos_dict[key] for key in word['p'] if key in pos_dict])
        #     )
        #     new_words.append(new_word)

        #     for form in word['f']:
        #         new_word_form = WordForm(
        #             word_id=id,
        #             traditional=form['t'],
        #             pinyin=form['i']['y'],
        #             bopomofo=form['i']['b'],
        #             translations='; '.join(form['m']),
        #             classifiers='; '.join(form['c'])
        #         )
        #         new_word_forms.append(new_word_form)
            
        #     id += 1

        #     # print(new_word)
        #     # print(new_word_form)
        #     # break
        # print(len([word.id for word in new_words]), len(set([word.id for word in new_words])))
        # db.session.add_all(new_words)
        # db.session.add_all(new_word_forms)
        # db.session.commit()

    app.run(debug=True, port=5000)