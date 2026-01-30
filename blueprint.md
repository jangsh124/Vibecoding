# Project Blueprint

## Overview
This project displays a real-time list of the top 10 cryptocurrencies by market capitalization, refreshing every 5 minutes. It utilizes modern web standards (HTML, CSS, JavaScript) and Web Components for modularity.

## Features Implemented

*   **Real-time Cryptocurrency Price List:**
    *   Displays a dynamic list of the top 10 cryptocurrencies by market cap.
    *   Data is sourced from the CoinGecko API.
    *   Data automatically refreshes every 5 minutes.
*   **Web Components:**
    *   Uses a `<coin-card>` custom element to display details for each cryptocurrency (icon, name, price, etc.).
*   **Theme Switcher:**
    *   A button to toggle between light and dark modes.
    *   User's theme preference is saved in `localStorage`.
*   **Responsive Design:**
    *   The layout is styled to be responsive and visually appealing on different screen sizes.

## Project Structure
*   `index.html`: Main HTML file with the page structure.
*   `style.css`: Contains all the styles for the application, including the theme switcher and coin cards.
*   `main.js`: Main script that fetches data, manages the theme, and renders the coin list.
*   `components/coin-card.js`: The definition for the `<coin-card>` Web Component.
*   `blueprint.md`: This file, documenting the project.
