import { cryptoData } from './data/cryptoData.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('detail-container');
    const urlParams = new URLSearchParams(window.location.search);
    const coinId = urlParams.get('coin');

    if (coinId && cryptoData[coinId]) {
        const coin = cryptoData[coinId];

        document.documentElement.style.setProperty('--primary-glow', coin.brandColor);

        document.body.style.background = `
            radial-gradient(ellipse at center, ${coin.brandColor}33 0%, var(--background-color) 70%),
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `;
        document.body.style.backgroundSize = '100% 100%, 50px 50px, 50px 50px';
        document.body.style.backgroundAttachment = 'fixed';

        let predictionsSection = '';
        if (coin.institutionalPredictions && coin.institutionalPredictions.length > 0) {
            const predictionsHtml = coin.institutionalPredictions.map(p => `
                <div class="prediction-item">
                    <span class="firm">${p.firm}</span>
                    <span class="price">${p.price}</span>
                </div>
            `).join('');
            
            predictionsSection = `
                <div class="price-predictions">
                    <h3>Institutional Price Targets (2030)</h3>
                    <div class="prediction-grid">
                        ${predictionsHtml}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <a href="/" class="back-button">← Back to List</a>
            <div class="coin-header">
                <h1>${coinId.charAt(0).toUpperCase() + coinId.slice(1)}</h1>
            </div>
            <div class="vision-2030">
                <h2>2030 Vision</h2>
                <p>“${coin.vision2030}”</p>
            </div>
            ${predictionsSection}
            <div class="metadata-grid">
                <div class="metadata-item">
                    <h3>Founder & Origin</h3>
                    <p><strong>${coin.founder}</strong></p>
                    <p>${coin.origin}</p>
                </div>
                <div class="metadata-item">
                    <h3>Hardware Wallet Compatibility</h3>
                    <div class="wallet-logos">
                        <span>Trezor</span>
                        <span>Keystone Pro</span>
                        <span>Coldcard</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `<h1>Coin not found</h1><a href="/" class="back-button">← Back to List</a>`;
    }
});
