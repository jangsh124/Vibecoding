class CoinCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['coin-data', 'price-direction'];
    }

    connectedCallback() {
        this.render();
        this.addEventListener('click', this.handleClick);
        // Trigger flash animation based on price direction
        const direction = this.getAttribute('price-direction');
        if (direction === 'up') {
            this.classList.add('flash-up');
        } else if (direction === 'down') {
            this.classList.add('flash-down');
        }
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.handleClick);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'coin-data' && oldValue !== newValue) {
            this.render();
        }
    }

    handleClick() {
        const coinData = this.getAttribute('coin-data');
        if (coinData) {
            const coin = JSON.parse(coinData);
            window.location.href = `/detail.html?coin=${coin.id}`;
        }
    }

    render() {
        const coinData = this.getAttribute('coin-data');
        if (!coinData) {
            this.shadowRoot.innerHTML = '';
            return;
        }

        const coin = JSON.parse(coinData);
        const priceChange = coin.price_change_percentage_24h;
        const priceChangeColor = priceChange >= 0 ? 'var(--primary-color)' : 'var(--secondary-color)';
        const formattedPrice = coin.current_price ? `$${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';
        const priceChangeArrow = priceChange >= 0 ? '▲' : '▼';
        const formattedPriceChange = priceChange ? `${priceChangeArrow} ${Math.abs(priceChange).toFixed(2)}%` : 'N/A';

        let formattedMarketCap = 'N/A';
        if (coin.market_cap) {
            if (coin.market_cap >= 1_000_000_000) {
                formattedMarketCap = `$${(coin.market_cap / 1_000_000_000).toFixed(2)}B`;
            } else if (coin.market_cap >= 1_000_000) {
                formattedMarketCap = `$${(coin.market_cap / 1_000_000).toFixed(2)}M`;
            } else {
                formattedMarketCap = `$${coin.market_cap.toLocaleString()}`;
            }
        }

        const glowColor = priceChange >= 0 ? '#00ff7f' : '#ff005a'; // Emerald Green or Ruby Red
        const direction = this.getAttribute('price-direction');

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 20px;
                    border-radius: 15px;
                    background: var(--card-background);
                    border: 1px solid ${glowColor};
                    box-shadow: 0 0 20px ${glowColor};
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    cursor: pointer;
                    width: 100%;
                }
                :host(:hover) {
                    transform: translateY(-5px);
                    box-shadow: 0 0 30px ${glowColor};
                }
                .coin-image {
                    width: 60px;
                    height: 60px;
                    margin-bottom: 15px;
                    border-radius: 50%;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .coin-name {
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: var(--text-color);
                    margin: 0 0 5px 0;
                }
                .coin-symbol {
                    font-size: 0.9rem;
                    color: var(--text-secondary-color, #aaa);
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .coin-price {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: var(--text-color);
                    margin: 10px 0 5px 0;
                }
                .price-change {
                    font-size: 1rem;
                    font-weight: 600;
                    color: ${priceChangeColor};
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin-bottom: 10px;
                }
                .price-change .arrow {
                    font-size: 0.75rem;
                }
                .market-cap {
                    font-size: 0.9rem;
                    color: var(--text-secondary-color, #aaa);
                    margin-top: 5px;
                }
                @keyframes flashUp {
                    0% { background: rgba(0, 255, 127, 0.25); }
                    100% { background: var(--card-background); }
                }
                @keyframes flashDown {
                    0% { background: rgba(255, 0, 90, 0.25); }
                    100% { background: var(--card-background); }
                }
                :host(.flash-up) {
                    animation: flashUp 1s ease-out;
                }
                :host(.flash-down) {
                    animation: flashDown 1s ease-out;
                }
            </style>
            <img src="${coin.image}" alt="${coin.name}" class="coin-image">
            <h2 class="coin-name">${coin.name}</h2>
            <p class="coin-symbol">${coin.symbol}</p>
            <p class="coin-price">${formattedPrice}</p>
            <div class="price-change">
                <span>${formattedPriceChange}</span>
            </div>
            <p class="market-cap">Mkt Cap: ${formattedMarketCap}</p>
        `;
    }
}

customElements.define('coin-card', CoinCard);
