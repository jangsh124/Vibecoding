import { cryptoData } from './data/cryptoData.js';

function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return `${r}, ${g}, ${b}`;
}

function parsePrice(priceStr) {
    return parseFloat(priceStr.replace(/[^\d.-]/g, ''));
}

function createPriceChart(predictions) {
    if (!predictions || predictions.length === 0) return '';

    const prices = predictions.map(p => parsePrice(p.price));
    const maxPrice = Math.max(...prices);

    const chartItems = predictions.map((p, index) => {
        const priceValue = prices[index];
        const barHeight = maxPrice > 0 ? (priceValue / maxPrice) * 100 : 0;
        // Add staggered delay for animation
        const delay = index * 100;
        return `
            <div class="chart-item">
                <div class="bar-wrapper">
                    <div class="chart-bar" style="height: ${barHeight}%; transition-delay: ${delay}ms;"></div>
                </div>
                <span class="firm-label">${p.firm}</span>
                <span class="price-label">${p.price}</span>
            </div>
        `;
    }).join('');

    return `
        <div class="price-chart-container">
            <h3>Institutional Price Targets (2030)</h3>
            <div class="chart-area">${chartItems}</div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('detail-container');
    const urlParams = new URLSearchParams(window.location.search);
    const coinId = urlParams.get('coin');

    if (coinId && cryptoData[coinId]) {
        const coin = cryptoData[coinId];
        const detailContainer = document.getElementById('detail-container');

        const brandRgb = hexToRgb(coin.brandColor);
        detailContainer.style.setProperty('--primary-glow', coin.brandColor);
        detailContainer.style.setProperty('--primary-glow-rgb', brandRgb);

        document.body.style.background = `
            radial-gradient(ellipse at center, ${coin.brandColor}33 0%, var(--background-color) 70%),
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
        `;
        document.body.style.backgroundSize = '100% 100%, 50px 50px, 50px 50px';
        document.body.style.backgroundAttachment = 'fixed';

        const priceChartSection = createPriceChart(coin.institutionalPredictions);
        
        let roadmapSection = '';
        if (coin.roadmap) {
            roadmapSection = `
                <div class="time-travel-container">
                    <h3>Time-Travel Roadmap</h3>
                    <div id="milestone-display">
                        <span id="milestone-year">2026</span>
                        <p id="milestone-text"></p>
                    </div>
                    <input type="range" id="time-slider" min="2026" max="2030" value="2026" step="1">
                </div>
            `;
        }

        // TradingView chart section (Bitcoin only for now)
        let tradingViewSection = '';
        if (coinId === 'bitcoin') {
            tradingViewSection = `
                <div class="tradingview-section">
                    <h3>Live Chart</h3>
                    <div class="tradingview-widget-container" id="tv-widget"></div>
                </div>
            `;
        }

        container.innerHTML = `
            <a href="/" class="back-button">← Back to List</a>
            <div class="coin-header"><h1>${coinId.charAt(0).toUpperCase() + coinId.slice(1)}</h1></div>
            <div class="vision-2030"><h2>2030 Vision</h2><p>"${coin.vision2030}"</p></div>
            ${priceChartSection}
            <div class="metadata-grid">
                 <div class="metadata-item"><h3>Founder & Origin</h3><p><strong>${coin.founder}</strong></p><p>${coin.origin}</p></div>
                 <div class="metadata-item"><h3>Hardware Wallet Compatibility</h3><div class="wallet-logos"><span>Trezor</span><span>Keystone Pro</span><span>Coldcard</span></div></div>
            </div>
            ${roadmapSection}
            ${tradingViewSection}
        `;

        // Inject TradingView widget script for Bitcoin
        if (coinId === 'bitcoin') {
            const tvContainer = document.getElementById('tv-widget');
            const iframe = document.createElement('iframe');
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            tvContainer.appendChild(iframe);

            const config = JSON.stringify({
                "symbols": [["BINANCE:BTCUSDT|1D"]],
                "lineWidth": 2,
                "lineType": 0,
                "chartType": "area",
                "dateRanges": ["1d|1","1m|30","3m|60","12m|1D","60m|1W","all|1M"],
                "colorTheme": "dark",
                "isTransparent": true,
                "locale": "en",
                "chartOnly": false,
                "scalePosition": "right",
                "scaleMode": "Normal",
                "fontFamily": "Poppins, sans-serif",
                "fontSize": "10",
                "headerFontSize": "medium",
                "noTimeScale": false,
                "valuesTracking": "1",
                "changeMode": "price-and-percent",
                "fontColor": "#aaa",
                "gridLineColor": "rgba(255, 255, 255, 0.06)",
                "backgroundColor": "rgba(0, 0, 0, 0)",
                "widgetFontColor": "#f0f2f5",
                "upColor": "#00ff7f",
                "downColor": "#ff005a",
                "borderUpColor": "#00ff7f",
                "borderDownColor": "#ff005a",
                "volumeUpColor": "rgba(0, 255, 127, 0.3)",
                "volumeDownColor": "rgba(255, 0, 90, 0.3)",
                "autosize": true,
                "width": "100%",
                "height": "100%",
                "hideDateRanges": false,
                "hideMarketStatus": false,
                "hideSymbolLogo": false
            });

            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write(`<!DOCTYPE html>
<html><head><style>body{margin:0;padding:0;overflow:hidden;background:transparent;}</style></head>
<body>
<div class="tradingview-widget-container">
  <div class="tradingview-widget-container__widget"></div>
  <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js" async>${config}<\/script>
</div>
</body></html>`);
            iframeDoc.close();
        }

        const chartArea = document.querySelector('.chart-area');
        if (chartArea) {
            setTimeout(() => {
                chartArea.classList.add('loaded');
            }, 100);
        }

        if (coin.roadmap) {
            const slider = document.getElementById('time-slider');
            const yearDisplay = document.getElementById('milestone-year');
            const textDisplay = document.getElementById('milestone-text');

            const updateRoadmap = (year) => {
                yearDisplay.textContent = year;
                textDisplay.textContent = coin.roadmap[year];
                textDisplay.classList.remove('glitch-effect');
                void textDisplay.offsetWidth;
                textDisplay.classList.add('glitch-effect');

                const intensity = (year - 2026) / (2030 - 2026);
                detailContainer.style.setProperty('--glow-intensity', intensity);
            };

            slider.addEventListener('input', (e) => {
                updateRoadmap(e.target.value);
            });

            updateRoadmap(slider.value);
        }
    } else {
        container.innerHTML = `<h1>Coin not found</h1><a href="/" class="back-button">← Back to List</a>`;
    }
});
