import './components/coin-card.js';

const themeSwitcher = document.getElementById('theme-switcher');
const body = document.body;

themeSwitcher.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark-mode');
    } else {
        localStorage.removeItem('theme');
    }
});

if (localStorage.getItem('theme') === 'dark-mode') {
    body.classList.add('dark-mode');
}

let currentCryptoPrices = []; // Global object to store latest crypto prices

function renderCoinGrid() {
    const coinGrid = document.getElementById('coin-grid');

    // If no data, don't touch the grid (keep previous cards visible)
    if (currentCryptoPrices.length === 0) return;

    // Build new cards in a document fragment to avoid flash
    const fragment = document.createDocumentFragment();
    currentCryptoPrices.forEach(coin => {
        const coinCard = document.createElement('coin-card');
        coinCard.setAttribute('coin-data', JSON.stringify(coin));
        fragment.appendChild(coinCard);
    });

    // Replace all at once — single repaint, no flash
    coinGrid.innerHTML = '';
    coinGrid.appendChild(fragment);
}

function updateTimestamp() {
    const el = document.getElementById('last-updated');
    if (!el) return;
    const now = new Date();
    const time = now.toLocaleTimeString();
    el.textContent = `Last updated: ${time}`;
    el.style.opacity = '1';
}

function showWarning(message) {
    const el = document.getElementById('last-updated');
    if (!el) return;
    el.textContent = message;
    el.style.opacity = '1';
}

async function fetchWithRetry(url, retries = 3) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url);
            if (response.status === 429 && attempt < retries) {
                // Rate limited — wait and retry
                const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (attempt < retries) {
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
}

async function fetchCryptoPrices() {
    const coinGrid = document.getElementById('coin-grid');
    const isInitialLoad = currentCryptoPrices.length === 0;

    // Only show loading text on the very first load
    if (isInitialLoad) {
        coinGrid.innerHTML = `<p style="color: var(--secondary-color); text-align: center;">Loading...</p>`;
    }

    try {
        const data = await fetchWithRetry(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
        );
        console.log('Fetched data:', data);

        currentCryptoPrices = data;
        renderCoinGrid();
        updateTimestamp();

    } catch (error) {
        console.error('Error fetching crypto prices:', error);

        if (isInitialLoad) {
            // No cached data — show error
            coinGrid.innerHTML = `<p style="color: var(--secondary-color); text-align: center;">Could not load coin data. Please check your connection or try again later.</p>`;
        } else {
            // Keep showing old data, just warn the user
            showWarning('Update failed — showing previous data');
        }
    }
}

fetchCryptoPrices(); // Initial fetch and display
setInterval(fetchCryptoPrices, 300000); // 5 minutes
