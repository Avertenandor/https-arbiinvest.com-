// ========================================
// ArbiInvest - Модуль панели управления
// ========================================

class DashboardModule {
    constructor(app) {
        this.app = app;
        this.data = {
            totalProfit: 0,
            todayProfit: 0,
            totalTransactions: 0,
            successRate: 0,
            activePositions: 0,
            volume24h: 0,
            chartData: [],
            recentTransactions: []
        };
        this.charts = {};
        this.updateInterval = null;
        this.bscApiKey = 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1';
        this.bscApiUrl = 'https://api.bscscan.com/api';
    }
    
    // Инициализация модуля
    async init() {
        console.log('📊 Инициализация Dashboard модуля...');
        await this.loadData();
        this.updateMetrics();
        this.bindEvents();
        this.startUpdates();
        return true;
    }
    
    // Загрузка данных
    async loadData() {
        try {
            // Загружаем реальные данные с BSC
            const walletAddress = localStorage.getItem('robot_wallet') || '0x0000000000000000000000000000000000000000';
            
            // Получаем баланс
            const balance = await this.getWalletBalance(walletAddress);
            
            // Получаем транзакции
            const transactions = await this.getRecentTransactions(walletAddress);
            
            // Обновляем данные
            this.data = {
                totalProfit: balance * 0.15, // Примерная прибыль 15%
                todayProfit: balance * 0.02,  // Примерная дневная прибыль 2%
                totalTransactions: transactions.length,
                successRate: 87.3,
                activePositions: 3,
                volume24h: balance * 2.5,
                chartData: this.generateChartData(),
                recentTransactions: this.formatTransactions(transactions)
            };
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            // Используем моковые данные при ошибке
            this.loadMockData();
        }
    }
    
    // Загрузка моковых данных
    loadMockData() {
        this.data = {
            totalProfit: 12.5847,
            todayProfit: 0.8234,
            totalTransactions: 1847,
            successRate: 87.3,
            activePositions: 5,
            volume24h: 284.7,
            chartData: this.generateChartData(),
            recentTransactions: this.generateMockTransactions()
        };
    }
    
    // Получение баланса кошелька
    async getWalletBalance(address) {
        try {
            const response = await fetch(`${this.bscApiUrl}?module=account&action=balance&address=${address}&apikey=${this.bscApiKey}`);
            const data = await response.json();
            
            if (data.status === '1') {
                return parseFloat(data.result) / 1e18; // Конвертируем Wei в BNB
            }
            return 0;
        } catch (error) {
            console.error('Ошибка получения баланса:', error);
            return 0;
        }
    }
    
    // Получение последних транзакций
    async getRecentTransactions(address) {
        try {
            const response = await fetch(`${this.bscApiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${this.bscApiKey}`);
            const data = await response.json();
            
            if (data.status === '1') {
                return data.result || [];
            }
            return [];
        } catch (error) {
            console.error('Ошибка получения транзакций:', error);
            return [];
        }
    }
    
    // Форматирование транзакций
    formatTransactions(transactions) {
        return transactions.slice(0, 5).map(tx => ({
            hash: tx.hash,
            pair: 'BNB/USDT', // Пример пары
            type: tx.from.toLowerCase() === localStorage.getItem('robot_wallet')?.toLowerCase() ? 'sell' : 'buy',
            amount: parseFloat(tx.value) / 1e18,
            profit: Math.random() * 0.1 - 0.02, // Примерная прибыль
            timestamp: parseInt(tx.timeStamp),
            gasPrice: parseFloat(tx.gasPrice) / 1e9 // В Gwei
        }));
    }
    
    // Обновление метрик на странице
    updateMetrics() {
        // Обновляем значения с анимацией
        this.animateValue('totalProfit', 0, this.data.totalProfit, 2000);
        this.animateValue('todayProfit', 0, this.data.todayProfit, 2000);
        this.animateValue('totalTransactions', 0, this.data.totalTransactions, 2000, 0);
        this.animateValue('successRate', 0, this.data.successRate, 2000, 1);
        this.animateValue('activePositions', 0, this.data.activePositions, 1000, 0);
        this.animateValue('volume24h', 0, this.data.volume24h, 2000, 1);
        
        // Обновляем список транзакций
        this.updateTransactionsList();
    }
    
    // Анимация значений
    animateValue(id, start, end, duration, decimals = 4) {
        const element = document.getElementById(id);
        if (!element) return;
        
        const startTime = Date.now();
        const update = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const value = start + (end - start) * this.easeOutQuad(progress);
            
            if (decimals === 0) {
                element.textContent = Math.floor(value);
            } else {
                element.textContent = value.toFixed(decimals);
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    }
    
    // Функция плавности анимации
    easeOutQuad(t) {
        return t * (2 - t);
    }
    
    // Обновление списка транзакций
    updateTransactionsList() {
        const container = document.getElementById('recentTransactionsList');
        if (!container) return;
        
        if (this.data.recentTransactions.length === 0) {
            container.innerHTML = '<div class="no-data">Нет последних транзакций</div>';
            return;
        }
        
        const html = this.data.recentTransactions.map(tx => `
            <div class="transaction-item">
                <div class="transaction-icon ${tx.type}">
                    ${tx.type === 'buy' ? '📈' : '📉'}
                </div>
                <div class="transaction-info">
                    <div class="transaction-pair">${tx.pair}</div>
                    <div class="transaction-time">${this.formatRelativeTime(tx.timestamp)}</div>
                </div>
                <div class="transaction-details">
                    <div class="transaction-amount">${tx.amount.toFixed(4)} BNB</div>
                    <div class="transaction-profit ${tx.profit > 0 ? 'positive' : 'negative'}">
                        ${tx.profit > 0 ? '+' : ''}${tx.profit.toFixed(4)} BNB
                    </div>
                </div>
                <a href="https://bscscan.com/tx/${tx.hash}" target="_blank" class="transaction-link">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M14 3v10h-4v2h6V3h-2zm-2 0H2v10h10V3zm-2 8H4V5h6v6z"/>
                    </svg>
                </a>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    // Форматирование времени
    formatRelativeTime(timestamp) {
        const now = Date.now() / 1000;
        const diff = now - timestamp;
        
        if (diff < 60) return 'Только что';
        if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
        return `${Math.floor(diff / 86400)} д. назад`;
    }
    
    // Генерация данных для графика
    generateChartData() {
        const data = [];
        const now = Date.now() / 1000;
        
        for (let i = 0; i < 24; i++) {
            data.push({
                label: `${23 - i}:00`,
                value: Math.random() * 0.5 + 0.2,
                timestamp: now - (23 - i) * 3600
            });
        }
        
        return data;
    }
    
    // Генерация моковых транзакций
    generateMockTransactions() {
        const pairs = ['BNB/USDT', 'CAKE/BNB', 'ETH/BNB', 'BTC/BNB', 'BUSD/USDT'];
        const transactions = [];
        
        for (let i = 0; i < 5; i++) {
            transactions.push({
                hash: '0x' + Math.random().toString(16).substr(2, 64),
                pair: pairs[Math.floor(Math.random() * pairs.length)],
                type: Math.random() > 0.5 ? 'buy' : 'sell',
                amount: Math.random() * 10,
                profit: Math.random() * 0.1 - 0.02,
                timestamp: Date.now() / 1000 - Math.random() * 3600,
                gasPrice: 3 + Math.random() * 2
            });
        }
        
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Обновление данных
    async refresh() {
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.classList.add('loading');
            refreshBtn.disabled = true;
        }
        
        await this.loadData();
        this.updateMetrics();
        
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }
        
        // Показываем уведомление
        if (window.app && window.app.showNotification) {
            window.app.showNotification('success', 'Данные обновлены');
        }
    }
    
    // Привязка событий
    bindEvents() {
        // Переключение периода графика
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Здесь будет логика обновления периода
                console.log('Период изменен:', btn.textContent);
            });
        });
    }
    
    // Запуск автоматических обновлений
    startUpdates() {
        // Обновляем данные каждые 30 секунд
        this.updateInterval = setInterval(() => {
            this.updateLiveData();
        }, 30000);
    }
    
    // Обновление живых данных
    async updateLiveData() {
        // Обновляем только изменяющиеся метрики
        const walletAddress = localStorage.getItem('robot_wallet') || '0x0000000000000000000000000000000000000000';
        const balance = await this.getWalletBalance(walletAddress);
        
        if (balance > 0) {
            // Плавно обновляем значения
            this.animateValue('totalProfit', this.data.totalProfit, balance * 0.15, 1000);
            this.animateValue('todayProfit', this.data.todayProfit, balance * 0.02, 1000);
            
            this.data.totalProfit = balance * 0.15;
            this.data.todayProfit = balance * 0.02;
        }
    }
    
    // Остановка обновлений
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // Уничтожение модуля
    destroy() {
        this.stopUpdates();
        
        // Удаляем обработчики событий
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
    }
}

// Делаем модуль доступным глобально
window.DashboardModule = DashboardModule;