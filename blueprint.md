
# Project Blueprint

## Overview
This project is an interactive crypto dashboard that displays the top 10 cryptocurrencies by market capitalization in real-time. The application is built using modern, framework-less web standards (Web Components, ES Modules) and features a futuristic, cyber-punk aesthetic. Data is automatically refreshed every 5 minutes.

## Design and Style
*   **Aesthetic:** The dashboard has a dark, futuristic theme with neon green and pink accents, creating a "cyberpunk" feel.
*   **Background:** A dynamic, multi-layered background is used to create depth. It consists of a subtle radial gradient and a glowing grid pattern that remains fixed during scrolling, enhancing the futuristic immersion.
*   **Typography:** The 'Poppins' font is used for a clean, modern look.
*   **Cards:** Each cryptocurrency is displayed on a semi-transparent "glassmorphic" card. The card has a neon glow effect (green for price increase, red for decrease) and a subtle hover animation that lifts the card, giving it a tactile feel.
*   **Responsiveness:** The layout uses a CSS grid that adapts to different screen sizes, ensuring the application is usable on both desktop and mobile devices.

## Features Implemented
*   **Real-time Cryptocurrency Data:**
    *   Displays the top 10 cryptocurrencies by market cap using the CoinGecko API.
    *   Data automatically refreshes every 5 minutes.
    *   **Market Cap Formatting:** Market capitalization is displayed in a shortened format (e.g., `$123.45B` for billions, `$67.89M` for millions) for better readability.
*   **Modular Web Components:**
    *   A `<coin-card>` custom element encapsulates the structure, style, and logic for displaying each cryptocurrency.
*   **Dynamic Theme Switcher:**
    *   Users can toggle between themes, and the preference is saved.

## Current Task: Step 6 - Data Integrity & Flexible UI

### 1. **Data Authenticity**
*   **Action:** Refine the prediction data in `data/cryptoData.js` to ensure data integrity.
*   **Details:**
    *   Remove any speculative or fabricated price predictions.
    *   Only include price targets that have been publicly discussed or reported by the specified firms and individuals.
    *   As a result, the number of predictions will vary for each cryptocurrency based on publicly available information. Some may have many predictions, others may have few or none.

### 2. **Flexible Prediction Grid**
*   **Action:** Update the CSS for the prediction grid to handle a variable number of items gracefully.
*   **Details:**
    *   Modify `.prediction-grid` in `detail.css` to use a responsive layout (e.g., `repeat(auto-fit, minmax(250px, 1fr))`).
    *   This will ensure the layout looks clean and balanced whether there is 1, 2, 3, 4, 5, or 6 predictions, preventing awkward empty spaces.

### 3. **Pundit & Firm List**
*   **Status:** The list remains the same, but predictions will only be shown where available.
    *   Ark Invest
    *   VanEck
    *   J.P. Morgan
    *   Goldman Sachs
    *   Tom Lee (Fundstrat)
    *   Michael Saylor (MicroStrategy)
