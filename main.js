import './components/coin-card.js';
import { register, login, logout, getCurrentUser, buyCoin, sellCoin } from './auth.js';

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

// --- Fear & Greed Index ---
function getFngColor(value) {
    if (value <= 25) return '#ea4335';
    if (value <= 45) return '#f59e42';
    if (value <= 55) return '#facc15';
    if (value <= 75) return '#66bb6a';
    return '#22c55e';
}

function updateFngGauge(value, classification) {
    const needle = document.getElementById('fng-needle');
    const valueEl = document.getElementById('fng-value');
    const labelEl = document.getElementById('fng-label');
    if (!needle || !valueEl || !labelEl) return;

    // Needle rotation: 0 = -90deg (left), 100 = 90deg (right)
    const angle = -90 + (value / 100) * 180;
    needle.style.transform = `rotate(${angle}deg)`;

    // Color the needle to match the value
    const color = getFngColor(value);
    const poly = needle.querySelector('polygon');
    if (poly) {
        poly.setAttribute('fill', color);
        poly.setAttribute('filter', `drop-shadow(0 0 6px ${color})`);
    }

    valueEl.textContent = value;
    valueEl.style.color = color;
    labelEl.textContent = classification;
    labelEl.style.color = color;
}

async function fetchFearAndGreed() {
    try {
        const res = await fetch('https://api.alternative.me/fng/?limit=1');
        const json = await res.json();
        const data = json.data[0];
        updateFngGauge(parseInt(data.value), data.value_classification);
    } catch (err) {
        console.error('Fear & Greed fetch failed:', err);
        const labelEl = document.getElementById('fng-label');
        if (labelEl) labelEl.textContent = 'Unavailable';
    }
}

fetchFearAndGreed();

// --- Floating bouncing coins (XP screensaver style) ---
const FLOATING_COINS = [
    { symbol: '₿', color: '#F7931A' },   // Bitcoin
    { symbol: 'Ξ', color: '#627EEA' },    // Ethereum
    { symbol: '✕', color: '#23292F' },    // XRP
    { symbol: '⬡', color: '#375BD2' },    // Chainlink
    { symbol: 'τ', color: '#00e5ff' },    // Bittensor
    { symbol: 'N', color: '#12B4C0' },    // Numeraire
    { symbol: '₿', color: '#F7931A' },   // Bitcoin (extra)
    { symbol: 'Ξ', color: '#627EEA' },    // Ethereum (extra)
];

function initFloatingCoins() {
    const container = document.getElementById('floating-coins');
    if (!container) return;

    const coins = FLOATING_COINS.map(({ symbol, color }) => {
        const el = document.createElement('span');
        el.className = 'floating-coin';
        el.textContent = symbol;
        el.style.color = color;
        container.appendChild(el);

        // Random starting position
        const x = Math.random() * (window.innerWidth - 40);
        const y = Math.random() * (window.innerHeight - 40);
        // Random speed (1~2.5px per frame) and direction
        const speed = 0.5 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;

        return {
            el,
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: el.offsetWidth || 32,
        };
    });

    function animate() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        coins.forEach(coin => {
            coin.x += coin.vx;
            coin.y += coin.vy;

            // Bounce off edges
            if (coin.x <= 0) { coin.x = 0; coin.vx *= -1; }
            if (coin.x >= w - coin.size) { coin.x = w - coin.size; coin.vx *= -1; }
            if (coin.y <= 0) { coin.y = 0; coin.vy *= -1; }
            if (coin.y >= h - coin.size) { coin.y = h - coin.size; coin.vy *= -1; }

            coin.el.style.transform = `translate(${coin.x}px, ${coin.y}px)`;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

initFloatingCoins();

// --- Auth UI ---
function updateAuthUI() {
    const user = getCurrentUser();
    const loginBtn = document.getElementById('nav-login-btn');
    const logoutBtn = document.getElementById('nav-logout-btn');
    const portfolioLink = document.getElementById('nav-portfolio');
    const balanceEl = document.getElementById('nav-balance');

    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = '';
        portfolioLink.style.display = '';
        balanceEl.style.display = '';
        balanceEl.textContent = `$${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        loginBtn.style.display = '';
        logoutBtn.style.display = 'none';
        portfolioLink.style.display = 'none';
        balanceEl.style.display = 'none';
    }
}

// Login modal
const loginModal = document.getElementById('login-modal');
let isRegisterMode = false;

document.getElementById('nav-login-btn').addEventListener('click', () => {
    loginModal.style.display = 'flex';
    isRegisterMode = false;
    updateModalMode();
});

document.getElementById('modal-close').addEventListener('click', () => {
    loginModal.style.display = 'none';
    document.getElementById('auth-error').textContent = '';
});

loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
        document.getElementById('auth-error').textContent = '';
    }
});

document.getElementById('auth-switch-link').addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    updateModalMode();
});

function updateModalMode() {
    document.getElementById('modal-title').textContent = isRegisterMode ? 'Register' : 'Login';
    document.getElementById('auth-submit').textContent = isRegisterMode ? 'Create Account' : 'Login';
    document.getElementById('auth-switch-text').textContent = isRegisterMode ? 'Already have an account?' : "Don't have an account?";
    document.getElementById('auth-switch-link').textContent = isRegisterMode ? 'Login' : 'Register';
    document.getElementById('auth-error').textContent = '';
}

document.getElementById('auth-submit').addEventListener('click', () => {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const result = isRegisterMode ? register(username, password) : login(username, password);

    if (result.ok) {
        loginModal.style.display = 'none';
        document.getElementById('auth-username').value = '';
        document.getElementById('auth-password').value = '';
        document.getElementById('auth-error').textContent = '';
        updateAuthUI();
    } else {
        document.getElementById('auth-error').textContent = result.msg;
    }
});

document.getElementById('nav-logout-btn').addEventListener('click', () => {
    logout();
    updateAuthUI();
});

updateAuthUI();

// --- Trade modal ---
let tradeMode = 'buy';
let tradeCoin = null;

window.openTradeModal = function(coinId) {
    const user = getCurrentUser();
    if (!user) {
        loginModal.style.display = 'flex';
        return;
    }

    const coin = currentCryptoPrices.find(c => c.id === coinId);
    if (!coin) return;
    tradeCoin = coin;
    tradeMode = 'buy';

    const modal = document.getElementById('trade-modal');
    document.getElementById('trade-title').textContent = `Trade ${coin.name}`;
    document.getElementById('trade-price').textContent = `$${coin.current_price.toLocaleString()}`;
    document.getElementById('trade-balance').textContent = `$${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('trade-amount').value = '';
    document.getElementById('trade-coin-amount').textContent = '= 0 coins';
    document.getElementById('trade-error').textContent = '';
    updateTradeTab();
    modal.style.display = 'flex';
};

document.getElementById('trade-close').addEventListener('click', () => {
    document.getElementById('trade-modal').style.display = 'none';
});

document.getElementById('trade-modal').addEventListener('click', (e) => {
    if (e.target.id === 'trade-modal') e.target.style.display = 'none';
});

document.getElementById('trade-buy-tab').addEventListener('click', () => {
    tradeMode = 'buy';
    updateTradeTab();
});

document.getElementById('trade-sell-tab').addEventListener('click', () => {
    tradeMode = 'sell';
    updateTradeTab();
});

function updateTradeTab() {
    const buyTab = document.getElementById('trade-buy-tab');
    const sellTab = document.getElementById('trade-sell-tab');
    const submitBtn = document.getElementById('trade-submit');

    buyTab.classList.toggle('active', tradeMode === 'buy');
    buyTab.classList.remove('sell-active');
    sellTab.classList.toggle('sell-active', tradeMode === 'sell');
    sellTab.classList.toggle('active', false);

    submitBtn.textContent = tradeMode === 'buy' ? 'Buy' : 'Sell';
    submitBtn.style.background = tradeMode === 'buy' ? 'var(--primary-color)' : '#ff5555';

    document.getElementById('trade-amount').value = '';
    document.getElementById('trade-coin-amount').textContent = '= 0 coins';
    document.getElementById('trade-error').textContent = '';
}

document.getElementById('trade-amount').addEventListener('input', (e) => {
    const usd = parseFloat(e.target.value) || 0;
    if (tradeCoin) {
        const coins = usd / tradeCoin.current_price;
        document.getElementById('trade-coin-amount').textContent = `= ${coins.toFixed(6)} ${tradeCoin.symbol.toUpperCase()}`;
    }
});

// Quick percentage buttons
document.querySelectorAll('.trade-quick').forEach(btn => {
    btn.addEventListener('click', () => {
        const pct = parseInt(btn.dataset.pct);
        const user = getCurrentUser();
        if (!user || !tradeCoin) return;

        let maxAmount;
        if (tradeMode === 'buy') {
            maxAmount = user.balance;
        } else {
            const holding = user.holdings[tradeCoin.id];
            maxAmount = holding ? holding.amount * tradeCoin.current_price : 0;
        }

        const amount = (maxAmount * pct / 100).toFixed(2);
        document.getElementById('trade-amount').value = amount;
        document.getElementById('trade-amount').dispatchEvent(new Event('input'));
    });
});

document.getElementById('trade-submit').addEventListener('click', () => {
    const usdAmount = parseFloat(document.getElementById('trade-amount').value);
    if (!usdAmount || usdAmount <= 0 || !tradeCoin) {
        document.getElementById('trade-error').textContent = 'Enter a valid amount';
        return;
    }

    const coinAmount = usdAmount / tradeCoin.current_price;
    let result;

    if (tradeMode === 'buy') {
        result = buyCoin(tradeCoin.id, tradeCoin.name, coinAmount, tradeCoin.current_price);
    } else {
        result = sellCoin(tradeCoin.id, coinAmount, tradeCoin.current_price);
    }

    if (result.ok) {
        document.getElementById('trade-modal').style.display = 'none';
        updateAuthUI();
    } else {
        document.getElementById('trade-error').textContent = result.msg;
    }
});
