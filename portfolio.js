import { getCurrentUser, logout } from './auth.js';

const COIN_IDS = 'bitcoin,ethereum,ripple,chainlink,bittensor,numeraire';

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
            const res = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${holdingIds.join(',')}&vs_currencies=usd`
            );
            prices = await res.json();
        } catch (e) {
            console.error('Failed to fetch prices:', e);
        }
    }

    // Render holdings
    const holdingsList = document.getElementById('holdings-list');
    let totalHoldingsValue = 0;
    let totalCost = 0;

    if (holdingIds.length === 0) {
        holdingsList.innerHTML = '<p class="empty-msg">No holdings yet. Go to the Dashboard to start trading!</p>';
    } else {
        holdingsList.innerHTML = '';
        holdingIds.forEach(coinId => {
            const h = user.holdings[coinId];
            const currentPrice = prices[coinId]?.usd || 0;
            const currentValue = h.amount * currentPrice;
            const costBasis = h.amount * h.avgCost;
            const pnl = currentValue - costBasis;
            const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

            totalHoldingsValue += currentValue;
            totalCost += costBasis;

            const row = document.createElement('div');
            row.className = 'holding-row';
            row.innerHTML = `
                <div class="holding-name">${h.name || coinId}<small>${h.amount.toFixed(6)}</small></div>
                <div class="holding-amount">Avg: $${h.avgCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
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
    const totalPnl = totalValue - 100000; // Starting balance was $100k

    document.getElementById('total-value').textContent =
        `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const pnlEl = document.getElementById('total-pnl');
    pnlEl.textContent = `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`;
    pnlEl.style.color = totalPnl >= 0 ? '#00ff7f' : '#ff5555';

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
