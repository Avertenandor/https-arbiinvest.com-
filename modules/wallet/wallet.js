// ========================================
// ArbiInvest - Модуль кошелька
// ========================================

class WalletModule {
    constructor(app) {
        this.app = app;
        this.walletAddress = null;
        this.balance = 0;
        this.tokens = [];
        this.updateInterval = null;
        this.bscApiKey = 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1';
        this.bscApiUrl = 'https://api.bscscan.com/api';
    }
    
    // Инициализация модуля
    async init() {
        console.log('💼 Инициализация Wallet модуля...');
        this.walletAddress = localStorage.getItem('robot_wallet') || null;
        
        if (this.walletAddress) {
            await this.loadWalletData();
        }
        
        this.bindEvents();
        this.startUpdates();
        return true;
    }
    
    // Загрузка данных кошелька
    async loadWalletData() {
        try {
            // Получаем баланс BNB
            await this.updateBalance();
            
            // Получаем токены
            await this.loadTokens();
            
            // Обновляем интерфейс
            this.updateUI();
            
        } catch (error) {
            console.error('Ошибка загрузки данных кошелька:', error);
        }
    }
    
    // Обновление баланса
    async updateBalance() {
        if (!this.walletAddress) return;
        
        try {
            const response = await fetch(`${this.bscApiUrl}?module=account&action=balance&address=${this.walletAddress}&apikey=${this.bscApiKey}`);
            const data = await response.json();
            
            if (data.status === '1') {
                this.balance = parseFloat(data.result) / 1e18; // Wei to BNB
                this.updateBalanceDisplay();
            }
        } catch (error) {
            console.error('Ошибка обновления баланса:', error);
        }
    }
    
    // Загрузка токенов
    async loadTokens() {
        if (!this.walletAddress) return;
        
        try {
            // Получаем список токенов BEP-20
            const response = await fetch(`${this.bscApiUrl}?module=account&action=tokentx&address=${this.walletAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${this.bscApiKey}`);
            const data = await response.json();
            
            if (data.status === '1' && data.result) {
                // Группируем токены по контрактам
                const tokenMap = new Map();
                
                data.result.forEach(tx => {
                    if (!tokenMap.has(tx.contractAddress)) {
                        tokenMap.set(tx.contractAddress, {
                            address: tx.contractAddress,
                            symbol: tx.tokenSymbol,
                            name: tx.tokenName,
                            decimals: parseInt(tx.tokenDecimal),
                            balance: 0
                        });
                    }
                });
                
                this.tokens = Array.from(tokenMap.values());
                
                // Получаем балансы токенов
                await this.updateTokenBalances();
            }
        } catch (error) {
            console.error('Ошибка загрузки токенов:', error);
        }
    }
    
    // Обновление балансов токенов
    async updateTokenBalances() {
        // Здесь должна быть логика получения балансов токенов
        // Для примера используем моковые данные
        this.tokens = this.tokens.slice(0, 5).map(token => ({
            ...token,
            balance: Math.random() * 1000,
            value: Math.random() * 1000
        }));
    }
    
    // Обновление отображения баланса
    updateBalanceDisplay() {
        const balanceElements = document.querySelectorAll('[data-wallet-balance]');
        balanceElements.forEach(el => {
            el.textContent = this.balance.toFixed(4);
        });
        
        // Обновляем USD эквивалент (примерная цена BNB)
        const bnbPrice = 250; // Примерная цена
        const usdValue = this.balance * bnbPrice;
        
        const usdElements = document.querySelectorAll('[data-wallet-usd]');
        usdElements.forEach(el => {
            el.textContent = `≈ $${usdValue.toFixed(2)}`;
        });
    }
    
    // Обновление UI
    updateUI() {
        const walletSection = document.getElementById('wallet');
        if (!walletSection) return;
        
        if (!this.walletAddress) {
            walletSection.innerHTML = this.renderConnectWallet();
        } else {
            walletSection.innerHTML = this.renderWalletInfo();
        }
    }
    
    // Рендер подключения кошелька
    renderConnectWallet() {
        return `
            <div class="wallet-connect">
                <div class="connect-icon">💼</div>
                <h2>Подключите кошелек робота</h2>
                <p>Введите адрес кошелька арбитражного робота для мониторинга</p>
                <div class="connect-form">
                    <input type="text" 
                           id="wallet-input" 
                           class="wallet-input" 
                           placeholder="0x..." 
                           maxlength="42">
                    <button class="btn btn-primary" onclick="window.walletModule.connectWallet()">
                        Подключить
                    </button>
                </div>
            </div>
        `;
    }
    
    // Рендер информации о кошельке
    renderWalletInfo() {
        return `
            <div class="wallet-info">
                <div class="wallet-header">
                    <h2>Кошелек робота</h2>
                    <button class="btn btn-secondary" onclick="window.walletModule.disconnectWallet()">
                        Отключить
                    </button>
                </div>
                
                <div class="wallet-address">
                    <span class="label">Адрес:</span>
                    <span class="address">${this.formatAddress(this.walletAddress)}</span>
                    <button class="copy-btn" onclick="window.walletModule.copyAddress()">
                        📋
                    </button>
                </div>
                
                <div class="wallet-balance">
                    <div class="balance-card">
                        <div class="balance-label">Баланс BNB</div>
                        <div class="balance-value">
                            <span data-wallet-balance>${this.balance.toFixed(4)}</span> BNB
                        </div>
                        <div class="balance-usd" data-wallet-usd>≈ $${(this.balance * 250).toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="wallet-tokens">
                    <h3>Токены</h3>
                    <div class="tokens-list">
                        ${this.renderTokensList()}
                    </div>
                </div>
                
                <div class="wallet-actions">
                    <button class="btn btn-primary" onclick="window.walletModule.refresh()">
                        Обновить
                    </button>
                    <a href="https://bscscan.com/address/${this.walletAddress}" 
                       target="_blank" 
                       class="btn btn-secondary">
                        Открыть в BSCScan
                    </a>
                </div>
            </div>
        `;
    }
    
    // Рендер списка токенов
    renderTokensList() {
        if (this.tokens.length === 0) {
            return '<div class="no-tokens">Нет токенов</div>';
        }
        
        return this.tokens.map(token => `
            <div class="token-item">
                <div class="token-info">
                    <div class="token-symbol">${token.symbol}</div>
                    <div class="token-name">${token.name}</div>
                </div>
                <div class="token-balance">
                    <div class="token-amount">${token.balance?.toFixed(2) || '0'}</div>
                    <div class="token-value">≈ $${token.value?.toFixed(2) || '0'}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Подключение кошелька
    async connectWallet() {
        const input = document.getElementById('wallet-input');
        if (!input) return;
        
        const address = input.value.trim();
        
        // Проверка валидности адреса
        if (!this.isValidAddress(address)) {
            if (window.app && window.app.showNotification) {
                window.app.showNotification('error', 'Неверный формат адреса');
            }
            return;
        }
        
        // Сохраняем адрес
        this.walletAddress = address;
        localStorage.setItem('robot_wallet', address);
        
        // Загружаем данные
        await this.loadWalletData();
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification('success', 'Кошелек подключен');
        }
    }
    
    // Отключение кошелька
    disconnectWallet() {
        this.walletAddress = null;
        this.balance = 0;
        this.tokens = [];
        
        localStorage.removeItem('robot_wallet');
        
        this.updateUI();
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification('info', 'Кошелек отключен');
        }
    }
    
    // Копирование адреса
    copyAddress() {
        if (!this.walletAddress) return;
        
        navigator.clipboard.writeText(this.walletAddress).then(() => {
            if (window.app && window.app.showNotification) {
                window.app.showNotification('success', 'Адрес скопирован');
            }
        });
    }
    
    // Проверка валидности адреса
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    
    // Форматирование адреса
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    // Обновление данных
    async refresh() {
        await this.loadWalletData();
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification('success', 'Данные кошелька обновлены');
        }
    }
    
    // Привязка событий
    bindEvents() {
        // Обработка ввода адреса при нажатии Enter
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const input = document.getElementById('wallet-input');
                if (input && document.activeElement === input) {
                    this.connectWallet();
                }
            }
        });
    }
    
    // Запуск автоматических обновлений
    startUpdates() {
        // Обновляем баланс каждые 30 секунд
        this.updateInterval = setInterval(() => {
            if (this.walletAddress) {
                this.updateBalance();
            }
        }, 30000);
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
window.WalletModule = WalletModule;
window.walletModule = null; // Будет инициализирован в app.js