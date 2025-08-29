// ========================================
// ArbiInvest - Модуль транзакций
// ========================================

class TransactionsModule {
    constructor(app) {
        this.app = app;
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.filters = {
            type: 'all',
            status: 'all',
            dateFrom: null,
            dateTo: null
        };
        this.updateInterval = null;
        this.bscApiKey = 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1';
        this.bscApiUrl = 'https://api.bscscan.com/api';
    }
    
    // Инициализация модуля
    async init() {
        console.log('📝 Инициализация Transactions модуля...');
        await this.loadTransactions();
        this.bindEvents();
        this.startUpdates();
        return true;
    }
    
    // Загрузка транзакций
    async loadTransactions() {
        const walletAddress = localStorage.getItem('robot_wallet');
        
        if (!walletAddress) {
            this.transactions = this.generateMockTransactions(50);
        } else {
            await this.loadRealTransactions(walletAddress);
        }
        
        this.applyFilters();
        this.updateUI();
    }
    
    // Загрузка реальных транзакций
    async loadRealTransactions(address) {
        try {
            // Обычные транзакции
            const txResponse = await fetch(`${this.bscApiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${this.bscApiKey}`);
            const txData = await txResponse.json();
            
            // Внутренние транзакции
            const internalResponse = await fetch(`${this.bscApiUrl}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${this.bscApiKey}`);
            const internalData = await internalResponse.json();
            
            // Токен транзакции
            const tokenResponse = await fetch(`${this.bscApiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc&apikey=${this.bscApiKey}`);
            const tokenData = await tokenResponse.json();
            
            // Объединяем и форматируем все транзакции
            this.transactions = this.formatBSCTransactions([
                ...(txData.result || []),
                ...(internalData.result || []),
                ...(tokenData.result || [])
            ]);
            
        } catch (error) {
            console.error('Ошибка загрузки транзакций:', error);
            this.transactions = this.generateMockTransactions(20);
        }
    }
    
    // Форматирование транзакций BSC
    formatBSCTransactions(rawTransactions) {
        const walletAddress = localStorage.getItem('robot_wallet')?.toLowerCase();
        
        return rawTransactions
            .map(tx => ({
                hash: tx.hash,
                type: this.getTransactionType(tx, walletAddress),
                status: tx.isError === '0' ? 'success' : 'failed',
                amount: this.formatAmount(tx),
                token: tx.tokenSymbol || 'BNB',
                from: tx.from,
                to: tx.to,
                timestamp: parseInt(tx.timeStamp),
                gasPrice: parseFloat(tx.gasPrice || 0) / 1e9,
                gasUsed: parseInt(tx.gasUsed || 0),
                profit: this.calculateProfit(tx),
                method: tx.functionName || 'Transfer'
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Определение типа транзакции
    getTransactionType(tx, walletAddress) {
        if (!walletAddress) return 'unknown';
        
        const from = tx.from?.toLowerCase();
        const to = tx.to?.toLowerCase();
        
        if (from === walletAddress && to === walletAddress) return 'self';
        if (from === walletAddress) return 'out';
        if (to === walletAddress) return 'in';
        
        // Для арбитражных операций
        if (tx.functionName?.includes('swap')) return 'swap';
        if (tx.functionName?.includes('arbitrage')) return 'arbitrage';
        
        return 'contract';
    }
    
    // Форматирование суммы
    formatAmount(tx) {
        if (tx.value) {
            return parseFloat(tx.value) / 1e18;
        }
        if (tx.tokenDecimal && tx.value) {
            return parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal));
        }
        return 0;
    }
    
    // Расчет прибыли (примерный)
    calculateProfit(tx) {
        // Здесь должна быть реальная логика расчета прибыли
        // Для демо используем случайные значения
        if (tx.functionName?.includes('arbitrage')) {
            return Math.random() * 0.1;
        }
        return 0;
    }
    
    // Генерация моковых транзакций
    generateMockTransactions(count) {
        const transactions = [];
        const types = ['in', 'out', 'swap', 'arbitrage', 'contract'];
        const tokens = ['BNB', 'BUSD', 'USDT', 'CAKE', 'ETH'];
        const methods = ['Transfer', 'Swap', 'Arbitrage', 'Approve', 'Deposit'];
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const isArbitrage = type === 'arbitrage';
            
            transactions.push({
                hash: '0x' + Math.random().toString(16).substr(2, 64),
                type: type,
                status: Math.random() > 0.1 ? 'success' : 'failed',
                amount: Math.random() * 10,
                token: tokens[Math.floor(Math.random() * tokens.length)],
                from: '0x' + Math.random().toString(16).substr(2, 40),
                to: '0x' + Math.random().toString(16).substr(2, 40),
                timestamp: Date.now() / 1000 - Math.random() * 86400 * 30,
                gasPrice: 3 + Math.random() * 2,
                gasUsed: 21000 + Math.floor(Math.random() * 100000),
                profit: isArbitrage ? Math.random() * 0.1 : 0,
                method: methods[Math.floor(Math.random() * methods.length)]
            });
        }
        
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Применение фильтров
    applyFilters() {
        this.filteredTransactions = this.transactions.filter(tx => {
            // Фильтр по типу
            if (this.filters.type !== 'all' && tx.type !== this.filters.type) {
                return false;
            }
            
            // Фильтр по статусу
            if (this.filters.status !== 'all' && tx.status !== this.filters.status) {
                return false;
            }
            
            // Фильтр по дате
            if (this.filters.dateFrom && tx.timestamp < this.filters.dateFrom) {
                return false;
            }
            if (this.filters.dateTo && tx.timestamp > this.filters.dateTo) {
                return false;
            }
            
            return true;
        });
    }
    
    // Обновление UI
    updateUI() {
        const transactionsSection = document.getElementById('transactions');
        if (!transactionsSection) return;
        
        transactionsSection.innerHTML = this.render();
        this.bindTableEvents();
    }
    
    // Рендер модуля
    render() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = this.filteredTransactions.slice(startIndex, endIndex);
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        
        return `
            <div class="transactions-section">
                <div class="section-header">
                    <h2>История транзакций</h2>
                    <div class="header-actions">
                        <button class="btn btn-secondary" onclick="window.transactionsModule.exportTransactions()">
                            Экспорт CSV
                        </button>
                        <button class="btn btn-primary" onclick="window.transactionsModule.refresh()">
                            Обновить
                        </button>
                    </div>
                </div>
                
                <div class="filters-bar">
                    <select class="filter-select" id="filter-type">
                        <option value="all">Все типы</option>
                        <option value="in">Входящие</option>
                        <option value="out">Исходящие</option>
                        <option value="swap">Обмен</option>
                        <option value="arbitrage">Арбитраж</option>
                    </select>
                    
                    <select class="filter-select" id="filter-status">
                        <option value="all">Все статусы</option>
                        <option value="success">Успешные</option>
                        <option value="failed">Неудачные</option>
                    </select>
                    
                    <input type="date" class="filter-date" id="filter-date-from" placeholder="От">
                    <input type="date" class="filter-date" id="filter-date-to" placeholder="До">
                    
                    <button class="btn btn-secondary" onclick="window.transactionsModule.resetFilters()">
                        Сбросить
                    </button>
                </div>
                
                <div class="transactions-stats">
                    <div class="stat-item">
                        <span class="stat-label">Всего:</span>
                        <span class="stat-value">${this.transactions.length}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Успешных:</span>
                        <span class="stat-value text-success">
                            ${this.transactions.filter(tx => tx.status === 'success').length}
                        </span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Прибыль:</span>
                        <span class="stat-value text-success">
                            ${this.calculateTotalProfit().toFixed(4)} BNB
                        </span>
                    </div>
                </div>
                
                <div class="transactions-table-container">
                    <table class="transactions-table">
                        <thead>
                            <tr>
                                <th>Время</th>
                                <th>Тип</th>
                                <th>Хэш</th>
                                <th>Сумма</th>
                                <th>Прибыль</th>
                                <th>Gas</th>
                                <th>Статус</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pageTransactions.map(tx => this.renderTransactionRow(tx)).join('')}
                        </tbody>
                    </table>
                    
                    ${pageTransactions.length === 0 ? '<div class="no-data">Нет транзакций</div>' : ''}
                </div>
                
                <div class="pagination">
                    <button class="pagination-btn" 
                            onclick="window.transactionsModule.goToPage(${this.currentPage - 1})"
                            ${this.currentPage === 1 ? 'disabled' : ''}>
                        ←
                    </button>
                    
                    <span class="pagination-info">
                        Страница ${this.currentPage} из ${totalPages || 1}
                    </span>
                    
                    <button class="pagination-btn" 
                            onclick="window.transactionsModule.goToPage(${this.currentPage + 1})"
                            ${this.currentPage === totalPages ? 'disabled' : ''}>
                        →
                    </button>
                </div>
            </div>
        `;
    }
    
    // Рендер строки транзакции
    renderTransactionRow(tx) {
        const typeIcon = {
            'in': '📥',
            'out': '📤',
            'swap': '🔄',
            'arbitrage': '⚡',
            'contract': '📜',
            'self': '🔁'
        };
        
        const statusClass = tx.status === 'success' ? 'success' : 'failed';
        const profitClass = tx.profit > 0 ? 'positive' : tx.profit < 0 ? 'negative' : '';
        
        return `
            <tr class="transaction-row">
                <td>${this.formatDate(tx.timestamp)}</td>
                <td>
                    <span class="tx-type">
                        ${typeIcon[tx.type] || '❓'} ${this.getTypeLabel(tx.type)}
                    </span>
                </td>
                <td>
                    <a href="https://bscscan.com/tx/${tx.hash}" 
                       target="_blank" 
                       class="tx-hash">
                        ${this.formatHash(tx.hash)}
                    </a>
                </td>
                <td>${tx.amount.toFixed(4)} ${tx.token}</td>
                <td class="${profitClass}">
                    ${tx.profit !== 0 ? (tx.profit > 0 ? '+' : '') + tx.profit.toFixed(4) : '-'}
                </td>
                <td>${tx.gasPrice.toFixed(1)} Gwei</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${tx.status === 'success' ? '✓' : '✗'}
                    </span>
                </td>
                <td>
                    <button class="btn-icon" onclick="window.transactionsModule.showDetails('${tx.hash}')">
                        ℹ️
                    </button>
                </td>
            </tr>
        `;
    }
    
    // Форматирование даты
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = now - date;
        
        // Если меньше часа
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)} мин. назад`;
        }
        
        // Если сегодня
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Иначе полная дата
        return date.toLocaleDateString('ru-RU', { 
            day: '2-digit', 
            month: '2-digit', 
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Форматирование хэша
    formatHash(hash) {
        return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
    }
    
    // Получение метки типа
    getTypeLabel(type) {
        const labels = {
            'in': 'Входящая',
            'out': 'Исходящая',
            'swap': 'Обмен',
            'arbitrage': 'Арбитраж',
            'contract': 'Контракт',
            'self': 'Себе'
        };
        return labels[type] || 'Неизвестно';
    }
    
    // Расчет общей прибыли
    calculateTotalProfit() {
        return this.transactions
            .filter(tx => tx.status === 'success')
            .reduce((sum, tx) => sum + tx.profit, 0);
    }
    
    // Показ деталей транзакции
    showDetails(hash) {
        const tx = this.transactions.find(t => t.hash === hash);
        if (!tx) return;
        
        // Здесь должно быть модальное окно с деталями
        console.log('Transaction details:', tx);
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification('info', `Детали транзакции: ${hash.slice(0, 10)}...`);
        }
    }
    
    // Переход на страницу
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.updateUI();
    }
    
    // Привязка событий таблицы
    bindTableEvents() {
        // Фильтры
        const typeFilter = document.getElementById('filter-type');
        if (typeFilter) {
            typeFilter.value = this.filters.type;
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.applyFilters();
                this.currentPage = 1;
                this.updateUI();
            });
        }
        
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) {
            statusFilter.value = this.filters.status;
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
                this.currentPage = 1;
                this.updateUI();
            });
        }
    }
    
    // Сброс фильтров
    resetFilters() {
        this.filters = {
            type: 'all',
            status: 'all',
            dateFrom: null,
            dateTo: null
        };
        this.currentPage = 1;
        this.applyFilters();
        this.updateUI();
    }
    
    // Экспорт транзакций
    exportTransactions() {
        const csv = this.convertToCSV(this.filteredTransactions);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification('success', 'Транзакции экспортированы');
        }
    }
    
    // Конвертация в CSV
    convertToCSV(transactions) {
        const headers = ['Время', 'Тип', 'Хэш', 'Сумма', 'Токен', 'Прибыль', 'Gas', 'Статус'];
        const rows = transactions.map(tx => [
            new Date(tx.timestamp * 1000).toISOString(),
            tx.type,
            tx.hash,
            tx.amount,
            tx.token,
            tx.profit,
            tx.gasPrice,
            tx.status
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    // Обновление транзакций
    async updateTransactions() {
        // Загружаем только новые транзакции
        const walletAddress = localStorage.getItem('robot_wallet');
        if (!walletAddress) return;
        
        // Здесь должна быть логика загрузки только новых транзакций
        await this.loadTransactions();
    }
    
    // Обновление данных
    async refresh() {
        await this.loadTransactions();
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification('success', 'Транзакции обновлены');
        }
    }
    
    // Привязка событий
    bindEvents() {
        // Глобальные события уже привязаны в bindTableEvents
    }
    
    // Запуск автоматических обновлений
    startUpdates() {
        // Обновляем транзакции каждую минуту
        this.updateInterval = setInterval(() => {
            this.updateTransactions();
        }, 60000);
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
    }
}

// Делаем модуль доступным глобально
window.TransactionsModule = TransactionsModule;
window.transactionsModule = null; // Будет инициализирован в app.js