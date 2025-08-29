// ========================================
// ArbiInvest - Web3 Integration Module
// ========================================

class Web3Module {
    constructor() {
        this.web3 = null;
        this.isConnected = false;
        this.userAccount = null;
        this.networkId = null;
        this.BSC_CHAIN_ID = '0x38'; // 56 in decimal
        this.BSC_MAINNET_PARAMS = {
            chainId: '0x38',
            chainName: 'Binance Smart Chain Mainnet',
            nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/']
        };
    }

    // Инициализация Web3
    async init() {
        console.log('🔗 Initializing Web3...');
        
        // Проверка наличия MetaMask или другого Web3 провайдера
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Современный способ подключения через MetaMask
                this.web3 = new Web3(window.ethereum);
                console.log('✅ Web3 initialized with MetaMask');
                return true;
            } catch (error) {
                console.error('Error initializing Web3:', error);
                return false;
            }
        } else if (typeof window.web3 !== 'undefined') {
            // Старый способ подключения
            this.web3 = new Web3(window.web3.currentProvider);
            console.log('✅ Web3 initialized with legacy provider');
            return true;
        } else {
            // Используем публичный RPC если нет кошелька
            try {
                this.web3 = new Web3('https://bsc-dataseed.binance.org/');
                console.log('✅ Web3 initialized with public RPC');
                return true;
            } catch (error) {
                console.error('Failed to initialize Web3:', error);
                return false;
            }
        }
    }

    // Подключение кошелька
    async connectWallet() {
        if (!window.ethereum) {
            throw new Error('MetaMask не установлен');
        }

        try {
            // Запрашиваем доступ к аккаунтам
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length > 0) {
                this.userAccount = accounts[0];
                this.isConnected = true;
                
                // Проверяем сеть
                await this.checkNetwork();
                
                console.log('✅ Wallet connected:', this.userAccount);
                return this.userAccount;
            } else {
                throw new Error('Нет доступных аккаунтов');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    // Проверка и переключение на BSC
    async checkNetwork() {
        if (!window.ethereum) return false;

        try {
            const chainId = await window.ethereum.request({
                method: 'eth_chainId'
            });

            if (chainId !== this.BSC_CHAIN_ID) {
                // Пытаемся переключиться на BSC
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: this.BSC_CHAIN_ID }]
                    });
                    return true;
                } catch (switchError) {
                    // Если сеть не добавлена, добавляем её
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [this.BSC_MAINNET_PARAMS]
                            });
                            return true;
                        } catch (addError) {
                            console.error('Error adding BSC network:', addError);
                            return false;
                        }
                    }
                    console.error('Error switching to BSC:', switchError);
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Error checking network:', error);
            return false;
        }
    }

    // Отправка транзакции PLEX токена
    async sendPLEXToken(toAddress, amount) {
        if (!this.isConnected || !this.userAccount) {
            throw new Error('Кошелек не подключен');
        }

        const plexTokenAddress = '0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1';
        
        // ABI для функции transfer токена ERC20
        const transferABI = [{
            "constant": false,
            "inputs": [
                {"name": "_to", "type": "address"},
                {"name": "_value", "type": "uint256"}
            ],
            "name": "transfer",
            "outputs": [{"name": "", "type": "bool"}],
            "type": "function"
        }];

        try {
            const contract = new this.web3.eth.Contract(transferABI, plexTokenAddress);
            const amountInWei = this.web3.utils.toWei(amount.toString(), 'ether');
            
            // Оценка газа
            const gasEstimate = await contract.methods
                .transfer(toAddress, amountInWei)
                .estimateGas({ from: this.userAccount });

            // Отправка транзакции
            const result = await contract.methods
                .transfer(toAddress, amountInWei)
                .send({ 
                    from: this.userAccount,
                    gas: Math.floor(gasEstimate * 1.2) // Добавляем 20% к оценке газа
                });

            console.log('✅ Transaction successful:', result.transactionHash);
            return result;
        } catch (error) {
            console.error('Error sending PLEX token:', error);
            throw error;
        }
    }

    // Получение баланса PLEX токена
    async getPLEXBalance(address) {
        if (!this.web3) await this.init();
        
        const plexTokenAddress = '0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1';
        
        // ABI для функции balanceOf токена ERC20
        const balanceOfABI = [{
            "constant": true,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "type": "function"
        }];

        try {
            const contract = new this.web3.eth.Contract(balanceOfABI, plexTokenAddress);
            const balance = await contract.methods.balanceOf(address).call();
            const balanceInEther = this.web3.utils.fromWei(balance, 'ether');
            return balanceInEther;
        } catch (error) {
            console.error('Error getting PLEX balance:', error);
            return '0';
        }
    }

    // Получение баланса BNB
    async getBNBBalance(address) {
        if (!this.web3) await this.init();

        try {
            const balance = await this.web3.eth.getBalance(address);
            const balanceInEther = this.web3.utils.fromWei(balance, 'ether');
            return balanceInEther;
        } catch (error) {
            console.error('Error getting BNB balance:', error);
            return '0';
        }
    }

    // Подписка на события аккаунта
    setupAccountChangeListener(callback) {
        if (!window.ethereum) return;

        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                this.userAccount = accounts[0];
                this.isConnected = true;
                callback(accounts[0]);
            } else {
                this.userAccount = null;
                this.isConnected = false;
                callback(null);
            }
        });
    }

    // Подписка на изменение сети
    setupNetworkChangeListener(callback) {
        if (!window.ethereum) return;

        window.ethereum.on('chainChanged', (chainId) => {
            callback(chainId);
            // Перезагружаем страницу при смене сети
            if (chainId !== this.BSC_CHAIN_ID) {
                this.checkNetwork();
            }
        });
    }

    // Отключение кошелька
    disconnectWallet() {
        this.userAccount = null;
        this.isConnected = false;
        console.log('🔌 Wallet disconnected');
    }

    // Форматирование адреса
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    // Проверка транзакции в BSCScan
    async checkTransaction(txHash) {
        const apiKey = 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1';
        const apiUrl = `https://api.bscscan.com/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.status === '1' && data.result) {
                return data.result.status === '1'; // 1 = success, 0 = failed
            }
            return false;
        } catch (error) {
            console.error('Error checking transaction:', error);
            return false;
        }
    }

    // Ожидание подтверждения транзакции
    async waitForTransaction(txHash, confirmations = 1) {
        console.log(`⏳ Waiting for ${confirmations} confirmations...`);
        
        try {
            const receipt = await this.web3.eth.getTransactionReceipt(txHash);
            
            if (receipt) {
                const currentBlock = await this.web3.eth.getBlockNumber();
                const confirmationsCount = currentBlock - receipt.blockNumber;
                
                if (confirmationsCount >= confirmations) {
                    console.log(`✅ Transaction confirmed with ${confirmationsCount} confirmations`);
                    return receipt;
                } else {
                    // Ждём ещё
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    return this.waitForTransaction(txHash, confirmations);
                }
            } else {
                // Транзакция ещё не включена в блок
                await new Promise(resolve => setTimeout(resolve, 3000));
                return this.waitForTransaction(txHash, confirmations);
            }
        } catch (error) {
            console.error('Error waiting for transaction:', error);
            throw error;
        }
    }
}

// Создаём глобальный экземпляр
window.web3Module = new Web3Module();
