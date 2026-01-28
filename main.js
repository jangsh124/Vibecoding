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

class InvestmentTracker extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.investments = JSON.parse(localStorage.getItem('investments')) || [];
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                .tracker {
                    background: var(--card-background);
                    padding: 30px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px var(--shadow-color);
                    text-align: center;
                    transition: background-color 0.3s ease;
                }
                .total {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    margin-bottom: 20px;
                }
                .form {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 30px;
                }
                input {
                    flex-grow: 1;
                    padding: 15px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    font-size: 1rem;
                    background-color: var(--background-color);
                    color: var(--text-color);
                }
                button {
                    padding: 15px 25px;
                    border: none;
                    border-radius: 8px;
                    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px var(--glow-color);
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px var(--glow-color);
                }
                .investment-list {
                    text-align: left;
                }
                .investment-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px;
                    border-bottom: 1px solid #eee;
                }
                .investment-item:last-child {
                    border-bottom: none;
                }
                .investment-item .date {
                    color: #999;
                }
            </style>
            <div class="tracker">
                <div class="total" id="total-amount"></div>
                <div class="form">
                    <input type="number" id="amount" placeholder="Enter amount">
                    <button id="add-investment">Add Investment</button>
                </div>
                <div class="investment-list" id="investment-list"></div>
            </div>
        `;

        this.shadowRoot.getElementById('add-investment').addEventListener('click', () => this.addInvestment());
        this.update();
    }

    addInvestment() {
        const amountInput = this.shadowRoot.getElementById('amount');
        const amount = parseFloat(amountInput.value);

        if (!isNaN(amount) && amount > 0) {
            this.investments.push({
                amount,
                date: new Date().toLocaleDateString()
            });
            localStorage.setItem('investments', JSON.stringify(this.investments));
            this.update();
            amountInput.value = '';
        }
    }

    update() {
        const totalAmount = this.investments.reduce((total, inv) => total + inv.amount, 0);
        this.shadowRoot.getElementById('total-amount').textContent = `Total: ₩${totalAmount.toLocaleString()}`;

        const investmentList = this.shadowRoot.getElementById('investment-list');
        investmentList.innerHTML = '';
        this.investments.forEach(inv => {
            const item = document.createElement('div');
            item.className = 'investment-item';
            item.innerHTML = `
                <span>₩${inv.amount.toLocaleString()}</span>
                <span class="date">${inv.date}</span>
            `;
            investmentList.appendChild(item);
        });
    }
}

customElements.define('investment-tracker', InvestmentTracker);
