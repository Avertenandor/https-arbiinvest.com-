// ========================================
// ArbiInvest - Модуль транзакций
// ========================================

export class TransactionsModule {
    constructor(app) {
        this.app = app;
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentPage = 1;
        this.perPage = 20;
        this.filters = {
            type: 'all',
            status: 'all',
            pair: 'all',
            dateFrom: null,
            dateTo: null
        };
        this.sortBy = 'timestamp';
        this.sortOrder = 'desc';
        this.updateInterval = null;
    }
    
    // Инициализация модуля
    async init() {
        await this.loadTransactions();
        this.bindEvents();
        this.startUpdates();
    }
    
    // Загрузка транзакций
    async loadTransactions() {
        try {
            // Здесь будет загрузка реальных данных
            // Пока используем моковые данные
            this.transactions = this.generateMockTransactions(100);
            this.applyFilters();
        } catch (error) {
            console.error('Ошибка загрузки транзакций:', error);
            this.app.notifications.error('Не удалось загрузить транзакции');
        }
    }
    
    // Рендеринг модуля
    async render() {
        return `
            <div class="transactions-section animate-fadeIn">
                <!-- Заголовок -->
                <div class="section-header">
                    <h1 class="page-title">История транзакций</h1>
                    <div class="header-actions">
                        <button class="btn btn-secondary" onclick="window.ArbiInvest.modules.transactions.exportTransactions()">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 14l-5-5h3V3h4v6h3l-5 5zm-5 2v2h10v-2H5z"/>
                            </svg>
                            Экспорт
                        </button>
                    </div>
                </div>
                
                <!-- Статистика -->
                <div class="transaction-stats">
                    <div class="stat-card">
                        <div class="stat-label">Всего транзакций</div>
                        <div class="stat-value">${this.transactions.length}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Успешных</div>
                        <div class="stat-value text-success">${this.getSuccessfulCount()}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Неудачных</div>
                        <div class="stat-value text-danger">${this.getFailedCount()}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">В ожидании</div>
                        <div class="stat-value text-warning">${this.getPendingCount()}</div>
                    </div>
                </div>
                
                <!-- Фильтры -->
                <div class="filters-section card">
                    <div class="filters-header">
                        <h3 class="filters-title">Фильтры</h3>
                        <button class="btn btn-sm btn-ghost" onclick="window.ArbiInvest.modules.transactions.resetFilters()">
                            Сбросить
                        </button>
                    </div>
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label class="form-label">Тип</label>
                            <select class="form-select" id="filterType">
                                <option value="all">Все</option>
                                <option value="buy">Покупка</option>
                                <option value="sell">Продажа</option>
                                <option value="arbitrage">Арбитраж</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="form-label">Статус</label>
                            <select class="form-select" id="filterStatus">
                                <option value="all">Все</option>
                                <option value="success">Успешные</option>
                                <option value="failed">Неудачные</option>
                                <option value="pending">В ожидании</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="form-label">Пара</label>
                            <select class="form-select" id="filterPair">
                                <option value="all">Все пары</option>
                                <option value="WETH/USDT">WETH/USDT</option>
                                <option value="USDC/DAI">USDC/DAI</option>
                                <option value="WBTC/ETH">WBTC/ETH</option>
                                <option value="LINK/ETH">LINK/ETH</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label class="form-label">Период</label>
                            <div class="date-range">
                                <input type="date" class="form-control" id="filterDateFrom">
                                <span class="date-separator">—</span>
                                <input type="date" class="form-control" id="filterDateTo">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Таблица транзакций -->
                <div class="transactions-table-wrapper card">
                    <div class="table-header">
                        <div class="table-title">Транзакции</div>
                        <div class="table-actions">
                            <div class="search-box">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="search-icon">
                                    <path d="M8 14c3.3 0 6-2.7 6-6s-2.7-6-6-6-6 2.7-6 6 2.7 6 6 6zm6.3-.7l4.4 4.4-1.4 1.4-4.4-4.4c-1.2.9-2.7 1.3-4.3 1.3C4.5 16 1 12.5 1 8s3.5-8 7.5-8S16 3.5 16 8c0 1.6-.5 3.1-1.3 4.3z"/>
                                </svg>
                                <input type="text" class="search-input" placeholder="Поиск по хешу..." id="searchInput">
                            </div>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th class="sortable" data-sort="timestamp">
                                        Время
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" class="sort-icon">
                                            <path d="M6 8L2 4h8z"/>
                                        </svg>
                                    </th>
                                    <th>Хеш</th>
                                    <th class="sortable" data-sort="type">
                                        Тип
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" class="sort-icon">
                                            <path d="M6 8L2 4h8z"/>
                                        </svg>
                                    </th>
                                    <th>Пара</th>
                                    <th class="sortable" data-sort="amount">
                                        Сумма
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" class="sort-icon">
                                            <path d="M6 8L2 4h8z"/>
                                        </svg>
                                    </th>
                                    <th class="sortable" data-sort="profit">
                                        Прибыль
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" class="sort-icon">
                                            <path d="M6 8L2 4h8z"/>
                                        </svg>
                                    </th>
                                    <th>Газ</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody id="transactionsTableBody">
                                <!-- Транзакции будут загружены здесь -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Пагинация -->
                    <div class="table-footer">
                        <div class="table-info">
                            Показано <span id="showingFrom">1</span>-<span id="showingTo">20</span> 
                            из <span id="totalCount">${this.filteredTransactions.length}</span>
                        </div>
                        <div class="pagination" id="pagination">
                            <!-- Пагинация будет сгенерирована здесь -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Генерация моковых транзакций
    generateMockTransactions(count) {
        const types = ['buy', 'sell', 'arbitrage'];
        const pairs = ['WETH/USDT', 'USDC/DAI', 'WBTC/ETH', 'LINK/ETH', 'UNI/USDT'];
        const statuses = ['success', 'failed', 'pending'];
        const transactions = [];
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const profit = type === 'arbitrage' ? Math.random() * 0.5 : Math.random() * 0.2 - 0.1;
            
            transactions.push({
                id: i + 1,
                hash: '0x' + Math.random().toString(16).substr(2, 64),
                type,
                pair: pairs[Math.floor(Math.random() * pairs.length)],
                amount: Math.random() * 50,
                profit,
                gas: Math.random() * 0.01,
                gasPrice: 20 + Math.random() * 30,
                status,
                timestamp: Date.now() / 1000 - Math.random() * 86400 * 7,
                blockNumber: 18500000 + Math.floor(Math.random() * 10000),
                from: '0x' + Math.random().toString(16).substr(2, 40),
                to: '0x' + Math.random().toString(16).substr(2, 40)
            });
        }
        
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    // Применение фильтров
    applyFilters() {
        this.filteredTransactions = this.transactions.filter(tx => {
            if (this.filters.type !== 'all' && tx.type !== this.filters.type) return false;
            if (this.filters.status !== 'all' && tx.status !== this.filters.status) return false;
            if (this.filters.pair !== 'all' && tx.pair !== this.filters.pair) return false;
            
            if (this.filters.dateFrom) {
                const from = new Date(this.filters.dateFrom).getTime() / 1000;
                if (tx.timestamp < from) return false;
            }
            
            if (this.filters.dateTo) {
                const to = new Date(this.filters.dateTo).getTime() / 1000 + 86400;
                if (tx.timestamp > to) return false;
            }
            
            return true;
        });
        
        // Применяем сортировку
        this.sortTransactions();
        
        // Обновляем отображение
        this.updateTable();
        this.updatePagination();
    }
    
    // Сортировка транзакций
    sortTransactions() {
        this.filteredTransactions.sort((a, b) => {
            const aVal = a[this.sortBy];
            const bVal = b[this.sortBy];
            
            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }
    
    // Обновление таблицы
    updateTable() {
        const tbody = document.getElementById('transactionsTableBody');
        if (!tbody) return;
        
        const start = (this.currentPage - 1) * this.perPage;
        const end = start + this.perPage;
        const pageTransactions = this.filteredTransactions.slice(start, end);
        
        tbody.innerHTML = pageTransactions.map(tx => `
            <tr>
                <td>${this.app.utils.formatDateTime(tx.timestamp)}</td>
                <td>
                    <div class="hash-cell">
                        <span class="font-mono">${this.app.utils.formatAddress(tx.hash, 8, 6)}</span>
                        <button class="copy-btn small" data-copy="${tx.hash}">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M10 2H4C3 2 2 3 2 4v6h2V4h6V2zm2 2H8C7 4 6 5 6 6v8c0 1 1 2 2 2h4c1 0 2-1 2-2V6c0-1-1-2-2-2z"/>
                            </svg>
                        </button>
                    </div>
                </td>
                <td>
                    <span class="badge badge-${this.getTypeBadgeClass(tx.type)}">
                        ${this.getTypeLabel(tx.type)}
                    </span>
                </td>
                <td>${tx.pair}</td>
                <td>${tx.amount.toFixed(4)} ETH</td>
                <td>
                    <span class="${tx.profit > 0 ? 'text-success' : tx.profit < 0 ? 'text-danger' : ''}">
                        ${tx.profit > 0 ? '+' : ''}${tx.profit.toFixed(4)} ETH
                    </span>
                </td>
                <td>
                    <span class="text-muted">${tx.gas.toFixed(4)} ETH</span>
                    <br>
                    <span class="text-xs text-tertiary">${tx.gasPrice.toFixed(0)} Gwei</span>
                </td>
                <td>
                    <span class="status-badge status-${tx.status}">
                        ${this.getStatusLabel(tx.status)}
                    </span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon btn-sm" onclick="window.ArbiInvest.modules.transactions.viewDetails('${tx.hash}')" title="Подробности">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 3C4.5 3 1.6 5.4 0 8c1.6 2.6 4.5 5 8 5s6.4-2.4 8-5c-1.6-2.6-4.5-5-8-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"/>
                            </svg>
                        </button>
                        <a href="https://etherscan.io/tx/${tx.hash}" target="_blank" class="btn-icon btn-sm" title="Etherscan">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M14 3v10h-4v2h6V3h-2zm-2 0H2v10h10V3zm-2 8H4V5h6v6z"/>
                            </svg>
                        </a>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Обновляем информацию о показанных записях
        document.getElementById('showingFrom').textContent = start + 1;
        document.getElementById('showingTo').textContent = Math.min(end, this.filteredTransactions.length);
        document.getElementById('totalCount').textContent = this.filteredTransactions.length;
    }
    
    // Обновление пагинации
    updatePagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(this.filteredTransactions.length / this.perPage);
        let html = '';
        
        // Кнопка "Предыдущая"
        html += `
            <button class="page-item ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="window.ArbiInvest.modules.transactions.goToPage(${this.currentPage - 1})">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M10 12L6 8l4-4"/>
                </svg>
            </button>
        `;
        
        // Номера страниц
        const maxButtons = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        if (startPage > 1) {
            html += `<button class="page-item" onclick="window.ArbiInvest.modules.transactions.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += `<span class="page-dots">...</span>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="page-item ${i === this.currentPage ? 'active' : ''}" 
                        onclick="window.ArbiInvest.modules.transactions.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="page-dots">...</span>`;
            }
            html += `<button class="page-item" onclick="window.ArbiInvest.modules.transactions.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Кнопка "Следующая"
        html += `
            <button class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="window.ArbiInvest.modules.transactions.goToPage(${this.currentPage + 1})">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 12l4-4-4-4"/>
                </svg>
            </button>
        `;
        
        pagination.innerHTML = html;
    }
    
    // Переход на страницу
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.perPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.updateTable();
        this.updatePagination();
    }
    
    // Просмотр деталей транзакции
    viewDetails(hash) {
        const tx = this.transactions.find(t => t.hash === hash);
        if (!tx) return;
        
        // Здесь будет модальное окно с деталями
        this.app.notifications.info('Загрузка деталей транзакции...');
    }
    
    // Получение количества успешных транзакций
    getSuccessfulCount() {
        return this.transactions.filter(tx => tx.status === 'success').length;
    }
    
    // Получение количества неудачных транзакций
    getFailedCount() {
        return this.transactions.filter(tx => tx.status === 'failed').length;
    }
    
    // Получение количества ожидающих транзакций  
    getPendingCount() {
        return this.transactions.filter(tx => tx.status === 'pending').length;
    }
    
    // Получение класса для типа
    getTypeBadgeClass(type) {
        const classes = {
            buy: 'info',
            sell: 'warning',
            arbitrage: 'success'
        };
        return classes[type] || 'secondary';
    }
    
    // Получение метки типа
    getTypeLabel(type) {
        const labels = {
            buy: 'Покупка',
            sell: 'Продажа',
            arbitrage: 'Арбитраж'
        };
        return labels[type] || type;
    }
    
    // Получение метки статуса
    getStatusLabel(status) {
        const labels = {
            success: 'Успешно',
            failed: 'Неудачно',
            pending: 'Ожидание'
        };
        return labels[status] || status;
    }
    
    // Сброс фильтров
    resetFilters() {
        this.filters = {
            type: 'all',
            status: 'all',
            pair: 'all',
            dateFrom: null,
            dateTo: null
        };
        
        // Сбрасываем значения в форме
        document.getElementById('filterType').value = 'all';
        document.getElementById('filterStatus').value = 'all';
        document.getElementById('filterPair').value = 'all';
        document.getElementById('filterDateFrom').value = '';
        document.getElementById('filterDateTo').value = '';
        
        this.applyFilters();
    }
    
    // Экспорт транзакций
    exportTransactions() {
        const data = this.filteredTransactions.map(tx => ({
            timestamp: new Date(tx.timestamp * 1000).toISOString(),
            hash: tx.hash,
            type: tx.type,
            pair: tx.pair,
            amount: tx.amount,
            profit: tx.profit,
            gas: tx.gas,
            gasPrice: tx.gasPrice,
            status: tx.status,
            blockNumber: tx.blockNumber
        }));
        
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${Date.now()}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.app.notifications.success('Транзакции экспортированы');
    }
    
    // Конвертация в CSV
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        
        return [headers, ...rows].join('\n');
    }
    
    // Привязка событий
    bindEvents() {
        // Фильтры
        document.getElementById('filterType')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('filterStatus')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('filterPair')?.addEventListener('change', (e) => {
            this.filters.pair = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('filterDateFrom')?.addEventListener('change', (e) => {
            this.filters.dateFrom = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('filterDateTo')?.addEventListener('change', (e) => {
            this.filters.dateTo = e.target.value;
            this.applyFilters();
        });
        
        // Поиск
        document.getElementById('searchInput')?.addEventListener('input', this.app.utils.debounce((e) => {
            this.searchTransactions(e.target.value);
        }, 300));
        
        // Сортировка
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.dataset.sort;
                if (this.sortBy === field) {
                    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortBy = field;
                    this.sortOrder = 'desc';
                }
                this.applyFilters();
            });
        });
    }
    
    // Поиск транзакций
    searchTransactions(query) {
        if (!query) {
            this.applyFilters();
            return;
        }
        
        const lowercaseQuery = query.toLowerCase();
        this.filteredTransactions = this.transactions.filter(tx => {
            return tx.hash.toLowerCase().includes(lowercaseQuery) ||
                   tx.pair.toLowerCase().includes(lowercaseQuery);
        });
        
        this.currentPage = 1;
        this.updateTable();
        this.updatePagination();
    }
    
    // Запуск обновлений
    startUpdates() {
        this.updateInterval = setInterval(() => {
            this.checkPendingTransactions();
        }, 10000);
    }
    
    // Остановка обновлений
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
    
    // Проверка ожидающих транзакций
    async checkPendingTransactions() {
        const pending = this.transactions.filter(tx => tx.status === 'pending');
        
        // Здесь будет логика проверки статуса транзакций
        // Обновляем случайные транзакции для демонстрации
        if (pending.length > 0 && Math.random() > 0.7) {
            const tx = pending[0];
            tx.status = Math.random() > 0.2 ? 'success' : 'failed';
            this.applyFilters();
            
            this.app.notifications.showTransaction(
                tx.status,
                tx.hash,
                `Транзакция ${tx.status === 'success' ? 'выполнена' : 'отклонена'}`
            );
        }
    }
    
    // Уничтожение модуля
    destroy() {
        this.stopUpdates();
    }
}

// Экспорт по умолчанию
export default TransactionsModule;
