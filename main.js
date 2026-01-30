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
    coinGrid.innerHTML = ''; // Clear existing grid

    currentCryptoPrices.forEach(coin => {
        const coinCard = document.createElement('coin-card');
        coinCard.setAttribute('coin-data', JSON.stringify(coin));
        coinGrid.appendChild(coinCard);
    });
}

async function fetchCryptoPrices() {
    const coinGrid = document.getElementById('coin-grid');
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Check the fetched data

        currentCryptoPrices = data;
        renderCoinGrid();

    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        coinGrid.innerHTML = `<p style="color: var(--secondary-color); text-align: center;">Could not load coin data. Please check your connection or try again later.</p>`;
    }
}

const coinGrid = document.getElementById('coin-grid');
coinGrid.innerHTML = `<p style="color: var(--secondary-color); text-align: center;">Loading...</p>`;
fetchCryptoPrices(); // Initial fetch and display
setInterval(fetchCryptoPrices, 300000); // 5 minutes