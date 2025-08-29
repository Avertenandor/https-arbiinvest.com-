// ========================================
// ArbiInvest - Модуль мониторинга Mempool
// ========================================

class MempoolModule {
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.updateInterval = null;
        this.pendingTransactions = [];
        this.wsConnection = null;
        this.maxTransactions = 100;
        
        // BSC конфигурация
        this.bscScanKey = 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1';
        this.bscApiUrl = 'https://api.bscscan.com/api';
        
        // Адреса популярных DEX на BSC
        this.dexAddresses = {
            'PancakeSwap': '0x10ED43C718714eb63d5aA57B78B54704E256024E',
            'Biswap': '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
            'ApeSwap': '0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7',
            'BakerySwap': '0xCDe540d7eAFE93aC5fE6233Bee57E1270D3E330F'
        };
        
        // Фильтры
        this.filters = {
            minValue: 0.1, // Минимальная сумма в BNB
            showOnlyArbitrage: false,
            dexFilter: 'all'
        };
    }
    
    // Инициализация модуля
    async init() {
        console.log('🔄 Initializing Mempool Module...');
        this.renderUI();
        this.initEventListeners();
        
        // Начинаем мониторинг при загрузке
        await this.startMonitoring();
    }
    
    // Отрисовка интерфейса
    renderUI() {
        const section = document.getElementById('mempool');
        if (!section) return;
        
        section.innerHTML = `
            <div class="mempool-container">
                <div class="section-header">
                    <h2 class="section-title">
                        <span class="pulse-indicator"></span>
                        Мониторинг Mempool
                    </h2>
                    <div class="mempool-controls">
                        <div class="filter-group">
                            <label class="filter-label">
                                <span>Мин. сумма (BNB):</span>
                                <input type="number" 
                                       id="mempool-min-value" 
                                       class="filter-input" 
                                       value="${this.filters.minValue}" 
                                       min="0" 
                                       step="0.01">
                            </label>
                            <label class="filter-label">
                                <span>DEX:</span>
                                <select id="mempool-dex-filter" class="filter-select">
                                    <option value="all">Все</option>
                                    ${Object.keys(this.dexAddresses).map(dex => 
                                        `<option value="${dex}">${dex}</option>`
                                    ).join('')}
                                </select>
                            </label>
                            <label class="filter-checkbox">
                                <input type="checkbox" id="mempool-arbitrage-only">
                                <span>Только арбитраж</span>
                            </label>
                        </div>
                        <div class="mempool-actions">
                            <button id="mempool-clear" class="btn-secondary">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 4h12M5 4V2.5C5 2.22386 5.22386 2 5.5 2h5c.2761 0 .5.22386.5.5V4m1 0v9.5c0 .2761-.2239.5-.5.5h-7c-.27614 0-.5-.2239-.5-.5V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                                Очистить
                            </button>
                            <button id="mempool-toggle" class="btn-primary">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                                    <path d="M6 6v4l3.5-2L6 6z" fill="currentColor"/>
                                </svg>
                                <span class="toggle-text">Запустить</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Статистика -->
                <div class="mempool-stats">
                    <div class="stat-item">
                        <div class="stat-label">Всего транзакций</div>
                        <div class="stat-value" id="mempool-total">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Арбитражных</div>
                        <div class="stat-value" id="mempool-arbitrage">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Средний газ</div>
                        <div class="stat-value" id="mempool-avg-gas">0 Gwei</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Объем (24ч)</div>
                        <div class="stat-value" id="mempool-volume">0 BNB</div>
                    </div>
                </div>
                
                <!-- Таблица транзакций -->
                <div class="mempool-table-container">
                    <table class="mempool-table">
                        <thead>
                            <tr>
                                <th>Время</th>
                                <th>Хеш</th>
                                <th>Тип</th>
                                <th>От</th>
                                <th>К</th>
                                <th>Сумма</th>
                                <th>Gas</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody id="mempool-tbody">
                            <tr class="empty-state">
                                <td colspan="8">
                                    <div class="empty-message">
                                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
                                            <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/>
                                            <path d="M16 24h16M24 16v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                                        </svg>
                                        <p>Ожидание транзакций...</p>
                                        <span>Мониторинг начнется автоматически</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Визуализация потока -->
                <div class="mempool-flow">
                    <canvas id="mempool-canvas"></canvas>
                    <div class="flow-legend">
                        <div class="legend-item">
                            <span class="legend-dot" style="background: #4F46E5;"></span>
                            <span>Обычные</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot" style="background: #10B981;"></span>
                            <span>Арбитраж</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot" style="background: #F59E0B;"></span>
                            <span>Высокий газ</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем стили для мемпула
        this.injectStyles();
    }
    
    // Внедрение стилей
    injectStyles() {
        if (document.getElementById('mempool-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'mempool-styles';
        styles.innerHTML = `
            .mempool-container {
                padding: 20px;
            }
            
            .pulse-indicator {
                display: inline-block;
                width: 8px;
                height: 8px;
                background: #10B981;
                border-radius: 50%;
                margin-right: 8px;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(1.2); }
            }
            
            .mempool-controls {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .filter-group {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .filter-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                color: var(--text-secondary);
            }
            
            .filter-input {
                width: 80px;
                padding: 4px 8px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-primary);
            }
            
            .filter-select {
                padding: 4px 8px;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                color: var(--text-primary);
            }
            
            .filter-checkbox {
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
            }
            
            .mempool-actions {
                display: flex;
                gap: 10px;
                margin-left: auto;
            }
            
            .mempool-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 20px;
                margin: 30px 0;
                padding: 20px;
                background: var(--bg-secondary);
                border-radius: 12px;
                border: 1px solid var(--border-color);
            }
            
            .mempool-table-container {
                background: var(--bg-secondary);
                border-radius: 12px;
                border: 1px solid var(--border-color);
                overflow: hidden;
                margin-bottom: 30px;
            }
            
            .mempool-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .mempool-table thead {
                background: var(--bg-tertiary);
                border-bottom: 1px solid var(--border-color);
            }
            
            .mempool-table th {
                padding: 12px;
                text-align: left;
                font-weight: 500;
                color: var(--text-secondary);
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .mempool-table tbody tr {
                border-bottom: 1px solid var(--border-color);
                transition: background 0.2s;
            }
            
            .mempool-table tbody tr:hover {
                background: var(--bg-tertiary);
            }
            
            .mempool-table td {
                padding: 12px;
                font-size: 14px;
                color: var(--text-primary);
            }
            
            .mempool-table .empty-state td {
                padding: 60px 20px;
                text-align: center;
            }
            
            .empty-message {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                color: var(--text-secondary);
            }
            
            .empty-message p {
                font-size: 16px;
                margin: 0;
            }
            
            .empty-message span {
                font-size: 13px;
                opacity: 0.7;
            }
            
            .tx-hash {
                font-family: 'SF Mono', Monaco, monospace;
                font-size: 12px;
                color: var(--primary-color);
                text-decoration: none;
            }
            
            .tx-hash:hover {
                text-decoration: underline;
            }
            
            .tx-type {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
                text-transform: uppercase;
            }
            
            .tx-type.swap { background: #4F46E520; color: #4F46E5; }
            .tx-type.arbitrage { background: #10B98120; color: #10B981; }
            .tx-type.transfer { background: #6B728020; color: #6B7280; }
            
            .tx-status {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
            }
            
            .tx-status.pending { background: #F59E0B20; color: #F59E0B; }
            .tx-status.success { background: #10B98120; color: #10B981; }
            .tx-status.failed { background: #EF444420; color: #EF4444; }
            
            .mempool-flow {
                background: var(--bg-secondary);
                border-radius: 12px;
                border: 1px solid var(--border-color);
                padding: 20px;
                position: relative;
                height: 200px;
            }
            
            #mempool-canvas {
                width: 100%;
                height: 160px;
            }
            
            .flow-legend {
                display: flex;
                gap: 20px;
                margin-top: 15px;
                justify-content: center;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: var(--text-secondary);
            }
            
            .legend-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            .new-tx {
                animation: slideIn 0.3s ease-out;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Инициализация обработчиков событий
    initEventListeners() {
        // Кнопка запуска/остановки
        const toggleBtn = document.getElementById('mempool-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMonitoring();
            });
        }
        
        // Кнопка очистки
        const clearBtn = document.getElementById('mempool-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearTransactions();
            });
        }
        
        // Фильтры
        document.getElementById('mempool-min-value')?.addEventListener('change', (e) => {
            this.filters.minValue = parseFloat(e.target.value) || 0;
            this.applyFilters();
        });
        
        document.getElementById('mempool-dex-filter')?.addEventListener('change', (e) => {
            this.filters.dexFilter = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('mempool-arbitrage-only')?.addEventListener('change', (e) => {
            this.filters.showOnlyArbitrage = e.target.checked;
            this.applyFilters();
        });
    }
    
    // Запуск мониторинга
    async startMonitoring() {
        if (