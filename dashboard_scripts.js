class CostOfLivingDashboard {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        this.comparisonHistory = JSON.parse(localStorage.getItem('history') || '[]');
        this.init();
    }
    init() {
        this.setupAdvancedFeatures();
        this.loadFavorites();
        this.setupExportFunctions();
    }
    setupAdvancedFeatures() {
        // Currency converter
        this.addCurrencyConverter();
        // Comparison chart
        this.addComparisonChart();
        // Export functionality
        this.addExportButtons();
        // Favorites system
        this.addFavoritesSystem();
    }
    addCurrencyConverter() {
        const converterHTML = `
            <div class="currency-converter">
                <h3>Quick Currency Converter</h3>
                <div class="converter-grid">
                    <input type="number" class="converter-input" id="amount1" placeholder="Amount">
                    <button class="swap-button" onclick="dashboard.swapCurrencies()">⇄</button>
                    <input type="number" class="converter-input" id="amount2" placeholder="Converted" readonly>
                </div>
            </div>
        `;
        document.querySelector('.results').insertAdjacentHTML('afterbegin', converterHTML);
    }
    addComparisonChart() {
        const chartHTML = `
            <div class="chart-container">
                <h3 class="chart-title">PPP Comparison Chart</h3>
                <div class="bar-chart" id="comparisonChart"></div>
            </div>
        `;

        document.querySelector('.results').insertAdjacentHTML('beforeend', chartHTML);
    }
    addExportButtons() {
        const exportHTML = `
            <div class="export-buttons">
                <button class="export-btn" onclick="dashboard.exportToPDF()">📄 Export PDF</button>
                <button class="export-btn" onclick="dashboard.exportToCSV()">📊 Export CSV</button>
                <button class="export-btn" onclick="dashboard.shareResults()">🔗 Share</button>
            </div>
        `;

        document.querySelector('.results').insertAdjacentHTML('beforeend', exportHTML);
    }
    addFavoritesSystem() {
        const favoritesHTML = `
            <div class="favorites">
                <h4>⭐ Favorite Comparisons</h4>
                <div id="favoritesList"></div>
                <button class="export-btn" onclick="dashboard.addToFavorites()" style="margin-top: 10px;">
                    Add Current Comparison
                </button>
            </div>
        `;

        document.querySelector('.controls').insertAdjacentHTML('afterend', favoritesHTML);
    }
    swapCurrencies() {
        const baseSelect = document.getElementById('baseCountry');
        const targetSelect = document.getElementById('targetCountry');

        const temp = baseSelect.value;
        baseSelect.value = targetSelect.value;
        targetSelect.value = temp;

        calculateComparison();
    }
    updateChart(countries) {
        const chart = document.getElementById('comparisonChart');
        if (!chart || !countries || countries.length === 0) return;

        chart.innerHTML = '';

        countries.slice(0, 10).forEach(country => {
            const ppp = country.ppp_2025 || country.ppp_2024 || 0;
            const height = Math.min((ppp / 10) * 100, 100); // Normalize height

            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = height + '%';
            bar.innerHTML = `
                <div class="bar-value">${ppp.toFixed(2)}</div>
                <div class="bar-label">${country.country}</div>
            `;
            chart.appendChild(bar);
        });
    }
    addToFavorites() {
        const base = document.getElementById('baseCountry').value;
        const target = document.getElementById('targetCountry').value;
        const salary = document.getElementById('baseSalary').value;
        if (!base || !target) return;
        const favorite = {
            id: Date.now(),
            base,
            target,
            salary: parseFloat(salary) || 0,
            date: new Date().toLocaleDateString()
        };

        this.favorites.push(favorite);
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.loadFavorites();
    }
    loadFavorites() {
        const list = document.getElementById('favoritesList');
        if (!list) return;

        list.innerHTML = this.favorites.map(fav => `
            <div class="favorite-item" onclick="dashboard.loadFavorite(${fav.id})">
                ${fav.base} → ${fav.target} (${fav.date})
            </div>
        `).join('');
    }
    loadFavorite(id) {
        const favorite = this.favorites.find(f => f.id === id);
        if (!favorite) return;

        document.getElementById('baseCountry').value = favorite.base;
        document.getElementById('targetCountry').value = favorite.target;
        document.getElementById('baseSalary').value = favorite.salary;

        calculateComparison();
    }
    exportToPDF() {
        // Simple export functionality
        window.print();
    }
    exportToCSV() {
        const csvData = allCountries.map(country => ({
            Country: country.country,
            PPP_2024: country.ppp_2024 || 'N/A',
            PPP_2025: country.ppp_2025 || 'N/A'
        }));
        const csv = this.convertToCSV(csvData);
        this.downloadCSV(csv, 'ppp_data.csv');
    }
    convertToCSV(data) {
        const header = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        return [header, ...rows].join('\n');
    }
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    shareResults() {
        const base = document.getElementById('baseCountry').value;
        const target = document.getElementById('targetCountry').value;
        const url = `${window.location.href}?base=${base}&target=${target}`;
        if (navigator.share) {
            navigator.share({
                title: 'Cost of Living Comparison',
                text: `Compare cost of living between ${base} and ${target}`,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                alert('Link copied to clipboard!');
            });
        }
    }
}
// Initialize the enhanced dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new CostOfLivingDashboard();
});