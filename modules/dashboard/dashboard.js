// ========================================
// ArbiInvest - Модуль панели управления
// ========================================

export class DashboardModule {
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
    }
    
    // Инициализация модуля
    async init() {
        await this.loadData();
        this.initCharts();
        this.bindEvents();
        this.startUpdates();
    }
    
    // Загрузка данных
    async loadData() {
        try {
            // Здесь будет загрузка реальных данных с API
            // Пока используем моковые данные
            this.data = {
                totalProfit: 12.5847,
                todayProfit: 0.8234,
                totalTransactions: 1847,
                successRate: 87.3,
                activePositions: 5,
                volume24h: 284.7,
                chartData: this.generateMockChartData(),
                recentTransactions: this.generateMockTransactions()
            };
            
            this.updateMetrics();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            this.app.notifications.error('Не удалось загрузить данные');
        }
    }
    
    // Рендеринг модуля
    async render() {
        return `
            <div class="dashboard-section animate-fadeIn">
                <!-- Заголовок -->
                <div class="section-header">
                    <h1 class="page-title">Панель управления</h1>
                    <div class="header-actions">
                        <button class="btn btn-secondary" onclick="window.ArbiInvest.modules.dashboard.exportData()">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 14l-5-5h3V3h4v6h3l-5 5zm-5 2v2h10v-2H5z"/>
                            </svg>
                            Экспорт
                        </button>
                        <button class="btn btn-primary" onclick="window.ArbiInvest.modules.dashboard.refresh()">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 3v2a5 5 0 0 0-3.54 8.54L5 15A7 7 0 0 1 10 3zm0 14v-2a5 5 0 0 0 3.54-8.54L15 5a7 7 0 0 1-5 12z"/>
                            </svg>
                            Обновить
                        </button>
                    </div>
                </div>
                
                <!-- Статус робота -->
                <div class="status-hero">
                    <div class="status-hero__content">
                        <h2 class="status-hero__title">Арбитражный робот</h2>
                        <div class="status-hero__info">
                            <div class="status-indicator active">
                                <span class="status-indicator__dot"></span>
                                <span>Активен</span>
                            </div>
                            <div class="status-hero__address">
                                <span class="text-muted">Адрес:</span>
                                <span class="address font-mono">${this.app.utils.formatAddress(this.app.config.ROBOT_ADDRESS)}</span>
                                <button class="copy-btn" data-copy="${this.app.config.ROBOT_ADDRESS}">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M10 2H4C3 2 2 3 2 4v6h2V4h6V2zm2 2H8C7 4 6 5 6 6v8c0 1 1 2 2 2h4c1 0 2-1 2-2V6c0-1-1-2-2-2z"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="network-display">
                                <span class="text-muted">Сеть:</span>
                                <span class="network-name">Ethereum Mainnet</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Метрики -->
                <div class="metrics-grid">
                    <div class="metric-card hover-lift" data-metric="profit">
                        <div class="metric-card__icon text-success">📈</div>
                        <div class="metric-card__content">
                            <div class="metric-card__label">Общая прибыль</div>
                            <div class="metric-card__value">
                                <span id="totalProfit">0.0000</span> ETH
                            </div>
                            <div class="metric-card__change positive">
                                <span>↑</span>
                                <span>+12.5%</span>
                            </div>
                            <div class="metric-card__subtext">≈ $31,462 USD</div>
                        </div>
                    </div>
                    
                    <div class="metric-card hover-lift" data-metric="today">
                        <div class="metric-card__icon text-info">📊</div>
                        <div class="metric-card__content">
                            <div class="metric-card__label">Прибыль сегодня</div>
                            <div class="metric-card__value">
                                <span id="todayProfit">0.0000</span> ETH
                            </div>
                            <div class="metric-card__change positive">
                                <span>↑</span>
                                <span>+8.3%</span>
                            </div>
                            <div class="metric-card__subtext">≈ $2,058 USD</div>
                        </div>
                    </div>
                    
                    <div class="metric-card hover-lift" data-metric="transactions">
                        <div class="metric-card__icon text-primary">💱</div>
                        <div class="metric-card__content">
                            <div class="metric-card__label">Всего транзакций</div>
                            <div class="metric-card__value">
                                <span id="totalTransactions">0</span>
                            </div>
                            <div class="metric-card__change neutral">
                                <span>→</span>
                                <span>147 сегодня</span>
                            </div>
                            <div class="metric-card__subtext">Средняя комиссия: 25 Gwei</div>
                        </div>
                    </div>
                    
                    <div class="metric-card hover-lift" data-metric="success">
                        <div class="metric-card__icon text-success">✅</div>
                        <div class="metric-card__content">
                            <div class="metric-card__label">Успешность</div>
                            <div class="metric-card__value">
                                <span id="successRate">0</span>%
                            </div>
                            <div class="metric-card__change positive">
                                <span>↑</span>
                                <span>+2.1%</span>
                            </div>
                            <div class="metric-card__subtext">1613 успешных</div>
                        </div>
                    </div>
                    
                    <div class="metric-card hover-lift" data-metric="positions">
                        <div class="metric-card__icon text-warning">🎯</div>
                        <div class="metric-card__content">
                            <div class="metric-card__label">Активные позиции</div>
                            <div class="metric-card__value">
                                <span id="activePositions">0</span>
                            </div>
                            <div class="metric-card__change">
                                <span>→</span>
                                <span>В работе</span>
                            </div>
                            <div class="metric-card__subtext">Потенциал: 0.24 ETH</div>
                        </div>
                    </div>
                    
                    <div class="metric-card hover-lift" data-metric="volume">
                        <div class="metric-card__icon text-info">💰</div>
                        <div class="metric-card__content">
                            <div class="metric-card__label">Объем за 24ч</div>
                            <div class="metric-card__value">
                                <span id="volume24h">0</span> ETH
                            </div>
                            <div class="metric-card__change positive">
                                <span>↑</span>
                                <span>+18.7%</span>
                            </div>
                            <div class="metric-card__subtext">≈ $711,750 USD</div>
                        </div>
                    </div>
                </div>
                
                <!-- График прибыли -->
                <div class="chart-section">
                    <div class="section-header">
                        <h3 class="section-title">График прибыли</h3>
                        <div class="time-selector">
                            <button class="time-btn" data-period="1h">1Ч</button>
                            <button class="time-btn" data-period="24h">24Ч</button>
                            <button class="time-btn active" data-period="7d">7Д</button>
                            <button class="time-btn" data-period="30d">30Д</button>
                            <button class="time-btn" data-period="all">Все</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="profitChart"></canvas>
                    </div>
                </div>
                
                <!-- Последние транзакции -->
                <div class="recent-transactions">
                    <div class="section-header">
                        <h3 class="section-title">Последние транзакции</h3>
                        <a href="#transactions" class="section-link">
                            Все транзакции
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M6 12l4-4-4-4"/>
                            </svg>
                        </a>
                    </div>
                    <div class="transactions-list" id="recentTransactionsList">
                        <div class="loading-skeleton">
                            <div class="skeleton-item"></div>
                            <div class="skeleton-item"></div>
                            <div class="skeleton-item"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Активные пары -->
                <div class="active-pairs mt-xl">
                    <div class="section-header">
                        <h3 class="section-title">Активные пары</h3>
                        <button class="btn btn-sm btn-ghost" onclick="window.ArbiInvest.modules.dashboard.refreshPairs()">
                            Обновить
                        </button>
                    </div>
                    <div class="pairs-grid" id="activePairs">
                        <div class="pair-card">
                            <div class="pair-header">
                                <span class="pair-name">WETH/USDT</span>
                                <span class="badge badge-success">+2.3%</span>
                            </div>
                            <div class="pair-stats">
                                <div class="pair-stat">
                                    <span class="text-muted">Объем:</span>
                                    <span>124.5 ETH</span>
                                </div>
                                <div class="pair-stat">
                                    <span class="text-muted">Арбитраж:</span>
                                    <span class="text-success">0.023 ETH</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="pair-card">
                            <div class="pair-header">
                                <span class="pair-name">USDC/DAI</span>
                                <span class="badge badge-success">+0.8%</span>
                            </div>
                            <div class="pair-stats">
                                <div class="pair-stat">
                                    <span class="text-muted">Объем:</span>
                                    <span>89.2 ETH</span>
                                </div>
                                <div class="pair-stat">
                                    <span class="text-muted">Арбитраж:</span>
                                    <span class="text-success">0.008 ETH</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Инициализация графиков
    initCharts() {
        const canvas = document.getElementById('profitChart');
        if (!canvas) return;
        
        // Создаем график с Chart.js
        const ctx = canvas.getContext('2d');
        
        // Градиент для заливки
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        
        this.charts.profit = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.chartData.map(d => d.label),
                datasets: [{
                    label: 'Прибыль (ETH)',
                    data: this.data.chartData.map(d => d.value),
                    borderColor: '#6366f1',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(32, 33, 36, 0.95)',
                        titleColor: '#e3e3e3',
                        bodyColor: '#a0a0a0',
                        borderColor: '#2a2b2f',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                return `Прибыль: ${context.parsed.y.toFixed(4)} ETH`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#2a2b2f',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6b6b6b',
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: '#2a2b2f',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#6b6b6b',
                            font: {
                                size: 11
                            },
                            callback: (value) => {
                                return value.toFixed(2) + ' ETH';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Обновление метрик
    updateMetrics() {
        // Анимированное обновление чисел
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
            element.textContent = value.toFixed(decimals);
            
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
        
        const html = this.data.recentTransactions.map(tx => `
            <div class="transaction-item">
                <div class="transaction-icon ${tx.type}">
                    ${tx.type === 'buy' ? '🔵' : '🔴'}
                </div>
                <div class="transaction-info">
                    <div class="transaction-pair">${tx.pair}</div>
                    <div class="transaction-time">${this.app.utils.formatRelativeTime(tx.timestamp)}</div>
                </div>
                <div class="transaction-details">
                    <div class="transaction-amount">${tx.amount} ETH</div>
                    <div class="transaction-profit ${tx.profit > 0 ? 'positive' : 'negative'}">
                        ${tx.profit > 0 ? '+' : ''}${tx.profit.toFixed(4)} ETH
                    </div>
                </div>
                <a href="https://etherscan.io/tx/${tx.hash}" target="_blank" class="transaction-link">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M14 3v10h-4v2h6V3h-2zm-2 0H2v10h10V3zm-2 8H4V5h6v6z"/>
                    </svg>
                </a>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    // Генерация моковых данных графика
    generateMockChartData() {
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
        const pairs = ['WETH/USDT', 'USDC/DAI', 'WBTC/ETH', 'LINK/ETH', 'UNI/USDT'];
        const transactions = [];
        
        for (let i = 0; i < 5; i++) {
            transactions.push({
                hash: '0x' + Math.random().toString(16).substr(2, 64),
                pair: pairs[Math.floor(Math.random() * pairs.length)],
                type: Math.random() > 0.5 ? 'buy' : 'sell',
                amount: Math.random() * 10,
                profit: Math.random() * 0.1 - 0.02,
                timestamp: Date.now() / 1000 - Math.random() * 3600
            });
        }
        
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Обновление данных
    async refresh() {
        this.app.notifications.info('Обновление данных...');
        await this.loadData();
        this.app.notifications.success('Данные обновлены');
    }
    
    // Экспорт данных
    exportData() {
        const data = {
            timestamp: Date.now(),
            metrics: this.data,
            transactions: this.data.recentTransactions
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arbiinvest_dashboard_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.app.notifications.success('Данные экспортированы');
    }
    
    // Обновление активных пар
    refreshPairs() {
        // Здесь будет логика обновления пар
        this.app.notifications.info('Обновление пар...');
    }
    
    // Привязка событий
    bindEvents() {
        // Переключение периода графика
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const period = btn.dataset.period;
                this.updateChartPeriod(period);
            });
        });
    }
    
    // Обновление периода графика
    updateChartPeriod(period) {
        // Здесь будет логика обновления периода
        console.log('Обновление периода:', period);
    }
    
    // Запуск обновлений
    startUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateLiveData();
        }, 5000);
    }
    
    // Остановка обновлений
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
    
    // Обновление живых данных
    async updateLiveData() {
        // Здесь будет обновление данных в реальном времени
        // Обновляем только изменяющиеся метрики
    }
    
    // Уничтожение модуля
    destroy() {
        this.stopUpdates();
        
        // Уничтожаем графики
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
    }
}

// Экспорт по умолчанию
export default DashboardModule;
