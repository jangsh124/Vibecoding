
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
    *   A `<coin-card>` custom element encapsulates the structure, style, and logic for displaying each cryptocurrency. This includes the coin's icon, name, symbol, current price, 24-hour price change, and market cap.
*   **Dynamic Theme Switcher:**
    *   A button allows users to toggle between the default dark theme and a potential future light theme. The user's preference is saved in `localStorage`.

## Project Structure
*   `index.html`: The main HTML file containing the page structure.
*   `style.css`: Contains all global styles, including the futuristic background, theme variables, and responsive grid layout.
*   `main.js`: The main application script. It fetches data from the API, manages the theme, and dynamically populates the main grid with `<coin-card>` components.
*   `components/coin-card.js`: The JavaScript file that defines the `<coin-card>` custom element, including its HTML structure, encapsulated styles, and data rendering logic.
*   `blueprint.md`: This file, documenting the project's features, design, and structure.
