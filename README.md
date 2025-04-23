# Mandaread - Mandarin Reading Program

Mandaread is a web application designed to help users improve their Mandarin reading skills. It allows importing Mandarin texts (provided via a modal input with pipe-separated values including Hanzi, Pinyin, and English translation), displays them with Pinyin above each character, and shows translations for words not yet marked as "known" by the user.

## Features

*   **Text Input:** Allows importing Mandarin text via a modal on the homepage. Users input the title, and then provide the Mandarin (Hanzi), Pinyin, and English translation for each word/phrase, separated by pipe characters (`|`).
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
*   **Settings Page:**
    *   Allows users to import and export their known vocabulary list as a JSON file.
    *   Provides a slider to adjust the base font size for the reading interface.
    *   Displays the list of known words with an option to delete individual words.
*   **Persistent Storage:**
    *   Uses IndexedDB (via Dexie.js) in the browser to store:
        *   Imported texts.
        *   The user's known vocabulary list.
        *   User settings (like font size).
    *   All data persists across browser sessions.
*   **Styling:** Uses CSS Modules for component-scoped styling.
*   **UUID:** `uuid` library for generating unique text IDs.

## Tech Stack

*   **Frontend Framework:** React (with TypeScript)
*   **Build Tool:** Vite
*   **Local Storage:** IndexedDB via Dexie.js
*   **Styling:** CSS Modules
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
    *   `db/`: Database setup (`database.ts`).
    *   `assets/`: Image assets (`react.svg`).
    *   `App.tsx`: Main application component (handles routing, global state).
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
