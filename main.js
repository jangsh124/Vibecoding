import './components/coin-card.js';

let currentCryptoPrices = []; // Global object to store latest crypto prices
let previousPrices = {}; // Track previous prices for flash animation
let currentSort = 'market_cap';
let sortDescending = true;

const REFRESH_INTERVAL = 30; // seconds

// Only show these 6 coins
const COIN_IDS = 'bitcoin,ethereum,ripple,chainlink,bittensor,numeraire';

function renderCoinGrid() {
    const coinGrid = document.getElementById('coin-grid');

    // If no data, don't touch the grid (keep previous cards visible)
    if (currentCryptoPrices.length === 0) return;

    const searchInput = document.getElementById('search-input');
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    // Filter coins by name or symbol
    const filtered = query
        ? currentCryptoPrices.filter(coin =>
            coin.name.toLowerCase().includes(query) ||
            coin.symbol.toLowerCase().includes(query)
        )
        : [...currentCryptoPrices];

    // Sort filtered results
    filtered.sort((a, b) => {
        const valA = a[currentSort] || 0;
        const valB = b[currentSort] || 0;
        return sortDescending ? valB - valA : valA - valB;
    });

    // Build new cards in a document fragment to avoid flash
    const fragment = document.createDocumentFragment();

    if (filtered.length === 0) {
        const noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = `No coins found for "${searchInput.value}"`;
        fragment.appendChild(noResults);
    } else {
        filtered.forEach(coin => {
            const coinCard = document.createElement('coin-card');
            coinCard.setAttribute('coin-data', JSON.stringify(coin));
            // Compare with previous price to show flash direction
            const prev = previousPrices[coin.id];
            if (prev !== undefined && prev !== coin.current_price) {
                coinCard.setAttribute('price-direction', coin.current_price > prev ? 'up' : 'down');
            }
            fragment.appendChild(coinCard);
        });
    }

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

    // Only show skeleton on the very first load
    if (isInitialLoad) {
        const skeletonHTML = Array(6).fill(`
            <div class="skeleton-card">
                <div class="skeleton-line skeleton-circle"></div>
                <div class="skeleton-line skeleton-title"></div>
                <div class="skeleton-line skeleton-subtitle"></div>
                <div class="skeleton-line skeleton-price"></div>
                <div class="skeleton-line skeleton-change"></div>
                <div class="skeleton-line skeleton-cap"></div>
            </div>
        `).join('');
        coinGrid.innerHTML = skeletonHTML;
    }

    try {
        const data = await fetchWithRetry(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&sparkline=false`
        );
        console.log('Fetched data:', data);

        // Save previous prices before updating
        currentCryptoPrices.forEach(c => { previousPrices[c.id] = c.current_price; });

        currentCryptoPrices = data;
        renderCoinGrid();
        updateTimestamp();
        startCountdown(); // Reset countdown after successful fetch

        // Clear direction flags after animation plays
        setTimeout(() => {
            document.querySelectorAll('coin-card[price-direction]').forEach(card => {
                card.removeAttribute('price-direction');
            });
        }, 1000);

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

// Search filter — re-render grid on input
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', () => renderCoinGrid());

// Sort buttons
function updateSortButtons() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        const isActive = btn.dataset.sort === currentSort;
        btn.classList.toggle('active', isActive);
        const arrow = btn.querySelector('.sort-arrow');
        if (arrow) arrow.remove();
        if (isActive) {
            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'sort-arrow';
            arrowSpan.textContent = sortDescending ? ' ▼' : ' ▲';
            btn.appendChild(arrowSpan);
        }
    });
}

document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const sortKey = btn.dataset.sort;
        if (currentSort === sortKey) {
            sortDescending = !sortDescending;
        } else {
            currentSort = sortKey;
            sortDescending = true;
        }
        updateSortButtons();
        renderCoinGrid();
    });
});

updateSortButtons();

// Refresh countdown progress bar
let countdownTimer = null;
function startCountdown() {
    const bar = document.getElementById('refresh-bar');
    if (!bar) return;
    let remaining = REFRESH_INTERVAL;
    bar.style.width = '100%';

    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
        remaining--;
        bar.style.width = `${(remaining / REFRESH_INTERVAL) * 100}%`;
        if (remaining <= 0) {
            clearInterval(countdownTimer);
            fetchCryptoPrices();
        }
    }, 1000);
}

async function fetchAndStart() {
    await fetchCryptoPrices();
    startCountdown();
}

fetchAndStart(); // Initial fetch and start countdown
