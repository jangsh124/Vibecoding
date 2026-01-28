# Project Blueprint: Daily Investment Tracker

## Overview

This application is a simple and intuitive tool designed to help users track their daily investments. Users can input a daily investment amount, and the application will maintain a running total, providing a clear and motivational view of their accumulated savings over time. The interface will be clean, modern, and mobile-responsive, ensuring a seamless experience across all devices.

## Design and Features

### Visual Design
- **Color Palette:** A vibrant and energetic color scheme will be used to create a positive and motivating user experience.
- **Typography:** Expressive fonts will be used to create a clear visual hierarchy, with larger, bolder fonts for key information like the total investment amount.
- **Layout:** The layout will be clean and balanced, with ample spacing to ensure readability and ease of use.
- **Effects:** Subtle drop shadows and "glow" effects will be applied to interactive elements to create a sense of depth and interactivity.

### Features
- **Investment Input:** A clear and simple input field for users to enter their daily investment amount.
- **Add Investment Button:** A prominent button to add the daily investment to the tracker.
- **Investment List:** A list displaying each individual investment, along with the date it was added.
- **Total Amount:** A highly visible display of the total accumulated investment amount.
- **Data Persistence:** The application will use the browser's local storage to save the investment data, so the user's information will be available even after they close the browser.

## Current Task: Initial Implementation

### Plan
1.  **HTML Structure:** Create the basic HTML structure in `index.html`, including input fields, buttons, and containers for the investment list and total amount.
2.  **CSS Styling:** Implement the visual design in `style.css`, applying the color palette, typography, and effects outlined above.
3.  **JavaScript Logic:** In `main.js`, develop the core application logic:
    - Create a custom element for the investment tracker to encapsulate its functionality.
    - Implement event listeners to handle adding new investments.
    - Use local storage to save and retrieve investment data.
    - Write functions to calculate and display the total investment amount and the list of individual investments.
