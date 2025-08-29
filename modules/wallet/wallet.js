// ========================================
// ArbiInvest - Модуль кошелька
// ========================================

export class WalletModule {
    constructor(app) {
        this.app = app;
        this.address = null;
        this.balance = 0;
        this.network = null;
        this.provider = null;
        this.isConnecting = false;
    }
    
    // Инициализация модуля
    async init() {
        // Проверяем наличие Web3
        if (!this.isWeb3Available()) {
            console.log('Web3 не доступен');
            return;
        }
        
        // Подключаем обработчики событий
        this.bindEvents();
        
        // Проверяем сохраненное подключение
        await this.checkSavedConnection();
    }
    
    // Проверка доступности Web3
    isWeb3Available() {
        return typeof window.ethereum !== 'undefined';
    }
    
    // Проверка сохраненного подключения
    async checkSavedConnection() {
        const savedAddress = this.app.storage.get('walletAddress');
        
        if (savedAddress && this.isWeb3Available()) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                });
                
                if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
                    await this.onConnect(accounts[0]);
                }
            } catch (error) {
                console.error('Ошибка проверки подключения:', error);
            }
        }
    }
    
    // Обработка подключения кошелька
    async handleConnect() {
        if (this.isConnecting) return;
        
        if (!this.isWeb3Available()) {
            this.showInstallPrompt();
            return;
        }
        
        if (this.address) {
            this.showAccountModal();
            return;
        }
        
        this.isConnecting = true;
        
        try {
            // Запрашиваем доступ к аккаунтам
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length > 0) {
                await this.onConnect(accounts[0]);
            }
        } catch (error) {
            if (error.code === 4001) {
                this.app.notifications.warning('Подключение отменено');
            } else {
                this.app.notifications.error('Ошибка подключения кошелька');
                console.error('Ошибка подключения:', error);
            }
        } finally {
            this.isConnecting = false;
        }
    }
    
    // Обработка успешного подключения
    async onConnect(address) {
        this.address = address;
        this.app.state.isWalletConnected = true;
        this.app.state.walletAddress = address;
        
        // Сохраняем адрес
        this.app.storage.set('walletAddress', address);
        
        // Получаем сеть
        await this.updateNetwork();
        
        // Получаем баланс
        await this.updateBalance();
        
        // Обновляем UI
        this.updateUI();
        
        // Показываем уведомление
        this.app.notifications.success(
            `Кошелек подключен: ${this.app.utils.formatAddress(address)}`
        );
        
        // Запускаем мониторинг
        this.startMonitoring();
    }
    
    // Отключение кошелька
    async disconnect() {
        this.address = null;
        this.balance = 0;
        this.network = null;
        
        this.app.state.isWalletConnected = false;
        this.app.state.walletAddress = null;
        
        // Удаляем из хранилища
        this.app.storage.remove('walletAddress');
        
        // Останавливаем мониторинг
        this.stopMonitoring();
        
        // Обновляем UI
        this.updateUI();
        
        // Показываем уведомление
        this.app.notifications.info('Кошелек отключен');
    }
    
    // Обновление сети
    async updateNetwork() {
        if (!this.isWeb3Available()) return;
        
        try {
            const chainId = await window.ethereum.request({
                method: 'eth_chainId'
            });
            
            const networkId = parseInt(chainId, 16);
            this.network = this.app.config.NETWORKS[networkId] || {
                name: 'Unknown Network',
                symbol: 'ETH'
            };
            
            this.app.state.networkId = networkId;
            this.app.storage.set('networkId', networkId);
        } catch (error) {
            console.error('Ошибка получения сети:', error);
        }
    }
    
    // Обновление баланса
    async updateBalance() {
        if (!this.address || !this.isWeb3Available()) return;
        
        try {
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [this.address, 'latest']
            });
            
            this.balance = parseInt(balance, 16);
            
            // Обновляем отображение баланса
            this.updateBalanceDisplay();
        } catch (error) {
            console.error('Ошибка получения баланса:', error);
        }
    }
    
    // Переключение сети
    async switchNetwork(chainId) {
        if (!this.isWeb3Available()) return;
        
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x' + chainId.toString(16) }]
            });
        } catch (error) {
            if (error.code === 4902) {
                // Сеть не добавлена
                await this.addNetwork(chainId);
            } else {
                console.error('Ошибка переключения сети:', error);
                this.app.notifications.error('Не удалось переключить сеть');
            }
        }
    }
    
    // Добавление сети
    async addNetwork(chainId) {
        const network = this.app.config.NETWORKS[chainId];
        if (!network) return;
        
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x' + chainId.toString(16),
                    chainName: network.name,
                    nativeCurrency: {
                        name: network.symbol,
                        symbol: network.symbol,
                        decimals: network.decimals
                    },
                    rpcUrls: [network.rpc],
                    blockExplorerUrls: [network.explorer]
                }]
            });
        } catch (error) {
            console.error('Ошибка добавления сети:', error);
            this.app.notifications.error('Не удалось добавить сеть');
        }
    }
    
    // Отправка транзакции
    async sendTransaction(params) {
        if (!this.address || !this.isWeb3Available()) {
            this.app.notifications.error('Кошелек не подключен');
            return null;
        }
        
        try {
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [params]
            });
            
            // Показываем уведомление
            const notificationId = this.app.notifications.showTransaction('pending', txHash);
            
            // Ждем подтверждения
            this.waitForTransaction(txHash, notificationId);
            
            return txHash;
        } catch (error) {
            if (error.code === 4001) {
                this.app.notifications.warning('Транзакция отменена');
            } else {
                this.app.notifications.error('Ошибка отправки транзакции');
                console.error('Ошибка транзакции:', error);
            }
            return null;
        }
    }
    
    // Ожидание подтверждения транзакции
    async waitForTransaction(txHash, notificationId) {
        try {
            const receipt = await this.waitForReceipt(txHash);
            
            // Скрываем уведомление о pending
            if (notificationId) {
                this.app.notifications.hide(notificationId);
            }
            
            if (receipt.status === '0x1') {
                this.app.notifications.showTransaction('success', txHash, 'Транзакция успешно выполнена');
            } else {
                this.app.notifications.showTransaction('failed', txHash, 'Транзакция отклонена');
            }
            
            // Обновляем баланс
            await this.updateBalance();
        } catch (error) {
            console.error('Ошибка ожидания транзакции:', error);
        }
    }
    
    // Ожидание чека транзакции
    async waitForReceipt(txHash, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                const receipt = await window.ethereum.request({
                    method: 'eth_getTransactionReceipt',
                    params: [txHash]
                });
                
                if (receipt) {
                    return receipt;
                }
            } catch (error) {
                console.error('Ошибка получения чека:', error);
            }
            
            // Ждем 2 секунды перед следующей попыткой
            await this.app.utils.sleep(2000);
        }
        
        throw new Error('Превышено время ожидания транзакции');
    }
    
    // Подпись сообщения
    async signMessage(message) {
        if (!this.address || !this.isWeb3Available()) {
            this.app.notifications.error('Кошелек не подключен');
            return null;
        }
        
        try {
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, this.address]
            });
            
            return signature;
        } catch (error) {
            if (error.code === 4001) {
                this.app.notifications.warning('Подпись отменена');
            } else {
                this.app.notifications.error('Ошибка подписи сообщения');
                console.error('Ошибка подписи:', error);
            }
            return null;
        }
    }
    
    // Запуск мониторинга
    startMonitoring() {
        // Обновляем баланс каждые 10 секунд
        this.balanceInterval = setInterval(() => {
            this.updateBalance();
        }, 10000);
        
        // Слушаем события
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
            window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
        }
    }
    
    // Остановка мониторинга
    stopMonitoring() {
        if (this.balanceInterval) {
            clearInterval(this.balanceInterval);
        }
        
        // Удаляем слушатели
        if (window.ethereum) {
            window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', this.handleChainChanged);
        }
    }
    
    // Обработка изменения аккаунтов
    async handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            await this.disconnect();
        } else if (accounts[0] !== this.address) {
            await this.onConnect(accounts[0]);
        }
    }
    
    // Обработка изменения сети
    async handleChainChanged(chainId) {
        await this.updateNetwork();
        await this.updateBalance();
        this.updateUI();
    }
    
    // Привязка событий
    bindEvents() {
        // События MetaMask уже обрабатываются в startMonitoring
    }
    
    // Обновление UI
    updateUI() {
        const walletBtn = document.getElementById('walletBtn');
        if (!walletBtn) return;
        
        const btnText = walletBtn.querySelector('.wallet-btn__text');
        
        if (this.address) {
            walletBtn.classList.add('connected');
            if (btnText) {
                btnText.textContent = this.app.utils.formatAddress(this.address);
            }
        } else {
            walletBtn.classList.remove('connected');
            if (btnText) {
                btnText.textContent = 'Подключить кошелек';
            }
        }
        
        // Обновляем отображение сети
        this.updateNetworkDisplay();
    }
    
    // Обновление отображения баланса
    updateBalanceDisplay() {
        const elements = document.querySelectorAll('.wallet-balance');
        elements.forEach(el => {
            el.textContent = this.app.utils.formatETH(this.balance) + ' ' + (this.network?.symbol || 'ETH');
        });
    }
    
    // Обновление отображения сети
    updateNetworkDisplay() {
        const elements = document.querySelectorAll('.network-name');
        elements.forEach(el => {
            el.textContent = this.network?.name || 'Unknown';
        });
        
        const indicators = document.querySelectorAll('.network-indicator');
        indicators.forEach(el => {
            el.className = 'network-indicator';
            if (this.network) {
                el.classList.add('network-' + this.app.state.networkId);
            }
        });
    }
    
    // Показ модального окна установки
    showInstallPrompt() {
        const modal = `
            <div class="modal-content">
                <h3>Установите MetaMask</h3>
                <p>Для работы с ArbiInvest необходим кошелек MetaMask.</p>
                <div class="modal-actions">
                    <a href="https://metamask.io/download/" target="_blank" class="btn btn-primary">
                        Установить MetaMask
                    </a>
                </div>
            </div>
        `;
        
        this.app.showModal(modal);
    }
    
    // Показ модального окна аккаунта
    showAccountModal() {
        const modal = `
            <div class="modal-content">
                <h3>Кошелек</h3>
                <div class="account-info">
                    <div class="account-address">
                        <label>Адрес:</label>
                        <div class="address-display">
                            <span>${this.address}</span>
                            <button class="copy-btn" data-copy="${this.address}">📋</button>
                        </div>
                    </div>
                    <div class="account-balance">
                        <label>Баланс:</label>
                        <span>${this.app.utils.formatETH(this.balance)} ${this.network?.symbol || 'ETH'}</span>
                    </div>
                    <div class="account-network">
                        <label>Сеть:</label>
                        <span>${this.network?.name || 'Unknown'}</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" onclick="window.ArbiInvest.modules.wallet.disconnect()">
                        Отключить
                    </button>
                    <a href="${this.network?.explorer}/address/${this.address}" target="_blank" class="btn btn-primary">
                        Открыть в Explorer
                    </a>
                </div>
            </div>
        `;
        
        this.app.showModal(modal);
    }
    
    // Рендеринг модуля (не используется для wallet)
    async render() {
        return '';
    }
    
    // Уничтожение модуля
    destroy() {
        this.stopMonitoring();
    }
}

// Экспорт по умолчанию
export default WalletModule;
