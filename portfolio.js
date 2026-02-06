import { getCurrentUser, logout } from './auth.js';

const COIN_COLORS = {
    bitcoin: '#F7931A',
    ethereum: '#627EEA',
    ripple: '#00AAE4',
    chainlink: '#375BD2',
    bittensor: '#00e5ff',
    numeraire: '#12B4C0',
};

function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/';
        return null;
    }
    document.getElementById('nav-user').textContent = user.username;
    return user;
}

document.getElementById('nav-logout').addEventListener('click', () => {
    logout();
    window.location.href = '/';
});

async function fetchPricesWithRetry(ids, retries = 3) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`
            );
            if (res.status === 429 && attempt < retries) {
                await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
                continue;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            if (attempt < retries) {
                await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
                continue;
            }
            throw e;
        }
    }
}

function getCachedPrices() {
    try {
        const cached = JSON.parse(localStorage.getItem('ci_priceCache'));
        if (cached && cached.prices) return cached.prices;
    } catch (e) {}
    return {};
}

function renderPieChart(holdingsData, cashBalance) {
    const chartEl = document.getElementById('pie-chart');
    const legendEl = document.getElementById('chart-legend');
    const cashEl = document.getElementById('chart-cash');
    if (!chartEl || !legendEl) return;

    // Pie chart = coin holdings only (no cash)
    const segments = [];
    holdingsData.forEach(h => {
        if (h.value > 0) {
            segments.push({
                label: h.name,
                value: h.value,
                color: COIN_COLORS[h.id] || '#888',
            });
        }
    });

    const totalCoins = segments.reduce((sum, s) => sum + s.value, 0);

    if (totalCoins === 0) {
        chartEl.style.background = '#1a2332';
        legendEl.innerHTML = '<p style="color:#8899aa;font-size:0.85rem;">No coin holdings</p>';
    } else {
        // Build conic-gradient (coins only)
        let cumPercent = 0;
        const gradientParts = [];
        segments.forEach(s => {
            const pct = (s.value / totalCoins) * 100;
            gradientParts.push(`${s.color} ${cumPercent}% ${cumPercent + pct}%`);
            cumPercent += pct;
        });
        chartEl.style.background = `conic-gradient(${gradientParts.join(', ')})`;

        // Update center label with total coin value
        const centerLabel = document.querySelector('.pie-center-label');
        if (centerLabel) {
            centerLabel.textContent = `$${totalCoins.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        }

        // Build legend (coins only)
        legendEl.innerHTML = '';
        segments.forEach(s => {
            const pct = ((s.value / totalCoins) * 100).toFixed(1);
            const item = document.createElement('div');
            item.className = 'legend-item';
            item.innerHTML = `
                <span class="legend-dot" style="background:${s.color}"></span>
                <span class="legend-label">${s.label}</span>
                <span class="legend-pct">${pct}%</span>
                <span class="legend-val">$${s.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            `;
            legendEl.appendChild(item);
        });
    }

    // Cash shown separately
    if (cashEl) {
        const totalAssets = totalCoins + cashBalance;
        const cashPct = totalAssets > 0 ? ((cashBalance / totalAssets) * 100).toFixed(1) : '0.0';
        cashEl.innerHTML = `
            <span class="cash-icon">💵</span>
            <span class="cash-label">Cash</span>
            <span class="cash-amount">$${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span class="cash-pct">${cashPct}% of total</span>
        `;
    }
}

async function loadPortfolio() {
    const user = checkAuth();
    if (!user) return;

    // Display cash balance
    document.getElementById('cash-balance').textContent =
        `$${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Fetch current prices for holdings
    const holdingIds = Object.keys(user.holdings);
    let prices = {};

    if (holdingIds.length > 0) {
        try {
            const apiPrices = await fetchPricesWithRetry(holdingIds);
            prices = {};
            holdingIds.forEach(id => {
                prices[id] = apiPrices[id]?.usd || 0;
            });
        } catch (e) {
            console.warn('API fetch failed, using cached prices:', e);
        }

        // Fallback to cached prices from main dashboard
        const cached = getCachedPrices();
        holdingIds.forEach(id => {
            if (!prices[id]) {
                prices[id] = cached[id] || 0;
            }
        });
    }

    // Render holdings
    const holdingsList = document.getElementById('holdings-list');
    let totalHoldingsValue = 0;
    let totalCost = 0;
    const holdingsForChart = [];

    if (holdingIds.length === 0) {
        holdingsList.innerHTML = '<p class="empty-msg">No holdings yet. Go to the Dashboard to start trading!</p>';
    } else {
        holdingsList.innerHTML = '';
        holdingIds.forEach(coinId => {
            const h = user.holdings[coinId];
            const currentPrice = prices[coinId] || 0;
            const currentValue = h.amount * currentPrice;
            const costBasis = h.amount * h.avgCost;
            const pnl = currentValue - costBasis;
            const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

            totalHoldingsValue += currentValue;
            totalCost += costBasis;

            holdingsForChart.push({ id: coinId, name: h.name || coinId, value: currentValue });

            const row = document.createElement('div');
            row.className = 'holding-row';
            row.innerHTML = `
                <div class="holding-name">${h.name || coinId}<small>${h.amount.toFixed(6)}</small></div>
                <div class="holding-avg">Avg: $${h.avgCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div class="holding-value">$${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div class="holding-pnl ${pnl >= 0 ? 'positive' : 'negative'}">
                    ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%)
                </div>
            `;
            holdingsList.appendChild(row);
        });
    }

    // Total value & P&L
    const totalValue = user.balance + totalHoldingsValue;
    const totalPnl = totalValue - 100000;

    document.getElementById('total-value').textContent =
        `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const pnlEl = document.getElementById('total-pnl');
    pnlEl.textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
    pnlEl.style.color = totalPnl >= 0 ? '#00ff7f' : '#ff5555';

    // Pie chart
    renderPieChart(holdingsForChart, user.balance);

    // Render transactions
    const txList = document.getElementById('tx-list');
    if (user.transactions.length === 0) {
        txList.innerHTML = '<p class="empty-msg">No transactions yet.</p>';
    } else {
        txList.innerHTML = '';
        user.transactions.slice(0, 20).forEach(tx => {
            const row = document.createElement('div');
            row.className = 'tx-row';
            const date = new Date(tx.date);
            row.innerHTML = `
                <span class="tx-type ${tx.type}">${tx.type}</span>
                <span class="tx-coin">${tx.coinName} (${tx.amount.toFixed(6)})</span>
                <span class="tx-amount">$${tx.total.toFixed(2)}</span>
                <span class="tx-date">${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            `;
            txList.appendChild(row);
        });
    }
}

loadPortfolio();
