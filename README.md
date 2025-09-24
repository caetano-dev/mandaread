# Mandaread - Mandarin Reading Program

Mandaread is a web application designed to help users improve their Mandarin reading skills. It allows importing Mandarin texts (provided via a modal input with pipe-separated values including Hanzi, Pinyin, and English translation), displays them with Pinyin above each character, and shows translations for words not yet marked as "known" by the user.

## Features

*   **Text Input:** Allows importing Mandarin text via a modal on the homepage. Users can either:
    *   Manually input the title and provide the Mandarin (Hanzi), Pinyin, and English translation for each word/phrase, separated by pipe characters (`|`)
    *   Use AI-powered text generation to create stories automatically by selecting a theme and length
*   **Standalone Flashcard Creation:** Dedicated section on the homepage to generate Chinese flashcards on any topic without needing to import texts first
*   **Homepage:**
    *   Displays a list of all imported texts.
    *   Shows a preview of the first 15 words of each text.
    *   Allows users to select a text to read.
    *   Allows users to delete imported texts.
    *   Provides a button to import new texts via the modal input.
*   **Reading Interface:**
    *   Displays the full Mandarin text.
    *   Shows Pinyin transcription above each Hanzi character.
    *   Displays the English translation below words that are *not* in the user's known vocabulary list.
    *   Allows users to click on any Hanzi word to mark it as "known", instantly hiding its translation and adding it to the persistent vocabulary list.
    *   Words are displayed inline, flowing like a standard text.
    *   **Flashcard Export:** Export unknown words as CSV with AI-generated example phrases for flashcard creation.
*   **Settings Page:**
    *   Allows users to import and export their known vocabulary list as a JSON file.
    *   Provides a slider to adjust the base font size for the reading interface.
    *   Displays the list of known words with an option to delete individual words.
*   **AI Features:**
    *   **Story Generation:** Create Chinese stories with proper formatting using AI (via Puter.js)
    *   **Phrase Generation:** Generate contextual example phrases for unknown words during flashcard export
    *   **Standalone Flashcard Creation:** Generate themed flashcard sets (5-25 cards) directly from the homepage
    *   **No Setup Required:** Free AI access without API keys or backend setup
*   **Persistent Storage:**
    *   Uses IndexedDB (via Dexie.js) in the browser to store:
        *   Imported texts.
        *   The user's known vocabulary list.
        *   User settings (like font size).
    *   All data persists across browser sessions.
*   **Styling:** Uses CSS Modules for component-scoped styling.
*   **UUID:** `uuid` library for generating unique text IDs.

## Tech Stack

*   **Frontend Framework:** React (with TypeScript) + React Router
*   **Build Tool:** Vite
*   **Local Storage:** IndexedDB via Dexie.js
*   **Styling:** CSS Modules
*   **AI Integration:** Puter.js for free AI model access
*   **UUID:** `uuid` library for generating unique text IDs.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd mandaread
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Project Structure

*   `public/`: Static assets (e.g., `vite.svg`).
*   `src/`:
    *   `components/`: React components organized by feature.
        *   `HomePage/`: Files related to the home page (`HomePage.tsx`, `HomePage.module.css`).
        *   `Reader/`: Files related to the reading interface (`Reader.tsx`, `Reader.module.css`).
        *   `Settings/`: Files related to the settings page (`Settings.tsx`, `Settings.module.css`).
        *   `ImportTextModal/`: Modal for text import with AI generation features.
        *   `Layout/`: Layout component with navigation.
    *   `contexts/`: React context providers for global state management.
    *   `routes/`: Route components for different pages.
    *   `db/`: Database setup (`database.ts`).
    *   `assets/`: Image assets (`react.svg`).
    *   `App.tsx`: Main application component with React Router configuration.
    *   `App.module.css`: CSS Module for the main App component.
    *   `index.css`: Global CSS styles.
    *   `main.tsx`: Entry point of the React application.
    *   `vite-env.d.ts`: TypeScript definitions for Vite environment variables.
    *   `types/`: TypeScript type definitions (`index.ts`).
*   `eslint.config.js`: ESLint configuration.
*   `index.html`: Main HTML entry point.
*   `package.json`: Project dependencies and scripts.
*   `README.md`: This file.
*   `tsconfig.*.json`: TypeScript configurations.
*   `vite.config.ts`: Vite configuration.

## JSON Input Format

**Note:** Text import no longer uses JSON files directly. Instead, use the "Import New Text" button on the homepage, which provides fields to paste Mandarin, Pinyin, and English text, separating each word/phrase with a pipe character (`|`).

**Example of pipe-separated input:**

*   **Title:** My Lesson
*   **Mandarin:** 我|喜欢|苹果
*   **Pinyin:** wǒ|xǐhuan|píngguǒ
*   **English:** I|like|apple

## Vocabulary JSON Format

When exporting or importing vocabulary, the JSON file should contain an array of word objects, where each object has `hanzi`, `pinyin`, and `translation` properties.

**Example:**

```json
[
  {
    "hanzi": "我",
    "pinyin": "wǒ",
    "translation": "I"
  },
  {
    "hanzi": "喜欢",
    "pinyin": "xǐhuan",
    "translation": "like"
  }
]
```

## AI Features

### Story Generation
- Click "🤖 Generate with AI" in the import modal
- Enter a theme (e.g., "daily routine", "family", "food")
- Select story length (short, medium, or long)
- AI creates properly formatted text with Hanzi, Pinyin, and English

### Standalone Flashcard Creation
- Use the "🎯 Create Flashcards" section on the homepage
- Enter any theme (e.g., "restaurant", "travel", "business")
- Choose number of flashcards (5, 10, 15, 20, or 25)
- AI generates themed flashcards and downloads them as CSV
- No need to import texts first - create flashcards on any topic instantly

### Flashcard Export from Texts
- Open any text in the Reader
- Click "📄 Export Flashcards (X)" to export unknown words
- AI generates contextual example phrases for each unknown word
- Downloads CSV file with format: `Phrase_Hanzi,Phrase_Pinyin,Phrase_English`
- Example CSV output:
```csv
Phrase_Hanzi,Phrase_Pinyin,Phrase_English
我每天七点起床,wǒ měitiān qīdiǎn qǐchuáng,I get up at seven o'clock every day
起床后我先洗脸,qǐchuáng hòu wǒ xiān xǐliǎn,After getting up I wash my face first
```

## Navigation
The app uses React Router with the following routes:
- `/` - Home page with text list
- `/reader` - Reading interface for selected text
- `/settings` - Settings and vocabulary management
