# Mandarin Learning Tool
Website to help increase efficiency in learning Mandarin vocabulary

## Prequisites
This website is most useful for people at the upper-beginner level, who have a solid foundation in grammar and are aiming to learn low-frequency vocabulary through input.

## Features
- Instant word lookups
- Proficiency tracking
- YouTube video embedding with synced transcripts
- AI assisted spaced repetition system

## Usage
The site can be used in various ways to increase vocabulary level.

### Inputting text
There are several ways to enter words into the practice area, after which they can be learned:
1. Text input
    - Enter Mandarin text into textbox labeled "Text:"
    - Words will show up in the practice area with color-codes
    - The user's current location in the text will not be saved
2. YouTube video embedding
    - If a YouTube video has captions in Mandarin, enter the link of the video into the textbox labaled "YouTube link:"
    - The transcript of the video will appear in the practice area, which will sync to the video playing
    - A location marker will save the user's location in the video for future use
3. Spaced repetition system
    - After looking up a word, the user can press the letter 's' to save a word. All instances of this word will be underlined in green.
    - By clicking "Review words", users will see an Anki style flashcard review system for words they saved.
    - Words that the user saved will appear as part of an AI generated sentence. For each instance of reviewing the word, the user sees a different sentence to ensure the user sees the word throghout various contexts.
    - The user can rate the word for how easy it was for them to understand the sentence, on a scale from "Again" to "Easy".

Once words are entered into the practice area, users can click on words to look them up. Users can look up a word to see its character representation, pinyin representation, and English translations, as well as HSK levels and radicals if in the HSK standard. As words are looked up, proficiency levels of surrounding text is updated accordingly.

### Color-coding
Mandarin text in the practice area will be color-coded according to proficiency levels as follows:
- Blue: proficiency 0, completely new word
- Dark yellow: proficiency 1, word encountered before
- Light yellow: proficiency 2, word encountered multiple times without translating
- White: proficiency 3, word mastered
Proficiency levels are continuously updated as the user looks up various words. It is assumed that the user does not skip any words, looking up words that they do not know.

### Proficiency levels calculation
Proficiency levels are calculated as follows:
- If the user looks up a proficiency 0 word, it becomes proficiency 1.
- If the user looks up a proficiency 1 word, it stays proficiency 1.
- If the user looks up a proficiency 2 or 3 word, it reduces proficiency by 1.
- For words in between the previous word the user clicked on and the current word the user clicked on:
    - Proficiency 0 words become proficiency 3.
    - Proficiency 1 and 2 words increase proficiency by 1.
    - Proficiency 3 words stay proficiency 3.