# Mandarin Learning Tool
Website to help increase efficiency in learning Mandarin vocabulary

## Prequisites
This website is most useful for people at the upper-beginner level, who have a solid foundation in grammar and are aiming to learn low-frequency vocabulary through input.

## Features
1. Instant word lookups
    - After clicking on a word, if the word is part of the HSK standard, the program uses a built in database to find its definitions and other associated information.
    - If the word is not part of the HSK standard, the program uses Google Translate.
    - The user can also translate a phrase at a time by highlighting text.
1. Proficiency tracking
    - Words are color coded according to the following system:
        - Blue: proficiency 0, completely new word
        - Dark yellow: proficiency 1, word encountered before
        - Light yellow: proficiency 2, word encountered multiple times without translating
        - White: proficiency 3, word mastered
    - Proficiency levels are calculated as follows:
        - If the user looks up a proficiency 0 word, it becomes proficiency 1.
        - If the user looks up a proficiency 1 word, it stays proficiency 1.
        - If the user looks up a proficiency 2 or 3 word, it reduces proficiency by 1.
        - For words in between the previous word the user clicked on and the current word the user clicked on:
            - Proficiency 0 words become proficiency 3.
            - Proficiency 1 and 2 words increase proficiency by 1.
            - Proficiency 3 words stay proficiency 3.
2. YouTube video embedding
    - If a YouTube video has Mandarin captions, entering its link will embed the video along with its transcript.
    - The transcript syncs to the video being played.
    - The video pauses when a word is looked up, and scrolls to the timestamp of the word the user clicked on.
3. AI assisted Spaced Repetition system
    - After looking up a word, the user can press the letter 's' to save a word. All instances of this word will be underlined in green.
    - Saved words are added to the user's flashcard deck.
    - By clicking "Review words" users will see an Anki style flashcard review system.
    - Words that the user saved will appear as part of an AI generated sentence. For each instance of reviewing the word, the user sees a different sentence to ensure the user sees the word throghout various contexts.
    - The user can rate the word for how easy it was for them to understand the sentence, on a scale from "Again" to "Easy".