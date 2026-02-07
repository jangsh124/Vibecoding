// Simple localStorage-based auth system
const USERS_KEY = 'ci_users';
const SESSION_KEY = 'ci_currentUser';
const STARTING_BALANCE = 100000;

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function register(username, password) {
    if (!username || !password) return { ok: false, msg: 'Username and password required' };
    if (username.length < 2) return { ok: false, msg: 'Username must be at least 2 characters' };
    if (password.length < 4) return { ok: false, msg: 'Password must be at least 4 characters' };

    const users = getUsers();
    if (users[username]) return { ok: false, msg: 'Username already exists' };

    users[username] = {
        password,
        balance: STARTING_BALANCE,
        holdings: {},
        transactions: [],
    };
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, username);
    return { ok: true };
}

export function login(username, password) {
    const users = getUsers();
    const user = users[username];
    if (!user || user.password !== password) return { ok: false, msg: 'Invalid username or password' };

    localStorage.setItem(SESSION_KEY, username);
    return { ok: true };
}

export function logout() {
    localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return null;
    const users = getUsers();
    if (!users[username]) return null;
    return { username, ...users[username] };
}

export function buyCoin(coinId, coinName, amount, pricePerUnit) {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return { ok: false, msg: 'Not logged in' };

    const users = getUsers();
    const user = users[username];
    const totalCost = amount * pricePerUnit;

    if (totalCost > user.balance) return { ok: false, msg: 'Insufficient balance' };

    user.balance -= totalCost;

    if (!user.holdings[coinId]) {
        user.holdings[coinId] = { amount: 0, avgCost: 0, name: coinName };
    }
    const holding = user.holdings[coinId];
    const totalOldCost = holding.amount * holding.avgCost;
    holding.amount += amount;
    holding.avgCost = (totalOldCost + totalCost) / holding.amount;
    holding.name = coinName;

    user.transactions.unshift({
        type: 'buy',
        coinId,
        coinName,
        amount,
        price: pricePerUnit,
        total: totalCost,
        date: new Date().toISOString(),
    });

    saveUsers(users);
    return { ok: true, balance: user.balance };
}

export function sellCoin(coinId, amount, pricePerUnit) {
    const username = localStorage.getItem(SESSION_KEY);
    if (!username) return { ok: false, msg: 'Not logged in' };

    const users = getUsers();
    const user = users[username];
    const holding = user.holdings[coinId];

    if (!holding || holding.amount < amount - 0.00000001) return { ok: false, msg: 'Insufficient holdings' };

    // Clamp to actual holding to avoid floating point overshoot
    const actualAmount = Math.min(amount, holding.amount);
    const totalRevenue = actualAmount * pricePerUnit;
    user.balance += totalRevenue;
    holding.amount -= actualAmount;

    if (holding.amount < 0.00000001) {
        delete user.holdings[coinId];
    }

    user.transactions.unshift({
        type: 'sell',
        coinId,
        coinName: holding?.name || coinId,
        amount,
        price: pricePerUnit,
        total: totalRevenue,
        date: new Date().toISOString(),
    });

    saveUsers(users);
    return { ok: true, balance: user.balance };
}
