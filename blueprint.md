
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
*   **Modular Web Components:**
    *   A `<coin-card>` custom element encapsulates the structure, style, and logic for displaying each cryptocurrency.
*   **Data Integrity & Flexible UI:**
    *   Prediction data is based on publicly available information only.
    *   The UI gracefully handles a variable number of predictions.
*   **Interactive Time-Slider & Roadmap:**
    *   An interactive slider allows users to explore future milestones from 2026 to 2030.
    *   Features real-time text updates with a "glitch" effect and a dynamic background glow that intensifies as the year approaches 2030.

## Current Task: Step 5 - Animated Price Target Chart

### 1. **Chart Generation (`detail.js`)**
*   **Action:** Replace the static grid of price targets with a dynamic bar chart.
*   **Details:**
    *   Create a new function to generate the HTML for the bar chart from the `institutionalPredictions` data.
    *   A helper function will parse price strings (e.g., "$1,480,000") into numerical values.
    *   Bar heights will be normalized relative to the highest prediction for the specific coin, ensuring each chart is visually balanced.
    *   After rendering, a `.loaded` class will be added to the chart container to trigger the entry animation.

### 2. **Styling and Animation (`detail.css`)**
*   **Action:** Style the new bar chart and implement the entry animation.
*   **Details:**
    *   The chart will use `flexbox` to align bars from the bottom.
    *   Each bar will have a `transform: scaleY(0)` initial state and will transition to `scaleY(1)` when the `.loaded` class is applied, creating a "grow up" effect.
    *   Bars will be styled with gradients and colors derived from the `--primary-glow` variable to match the futuristic theme.
