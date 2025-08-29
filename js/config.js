// ========================================
// ArbiInvest - Конфигурация приложения
// ========================================

window.CONFIG = {
    // Основные настройки
    APP_NAME: 'ArbiInvest',
    APP_VERSION: '1.0.0',
    APP_URL: 'https://arbiinvest.com',
    
    // Сеть Binance Smart Chain
    NETWORK: {
        name: 'Binance Smart Chain',
        chainId: 56,
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        explorer: 'https://bscscan.com',
        symbol: 'BNB',
        decimals: 18
    },
    
    // API ключи
    API_KEYS: {
        bscscan: 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1',
        // Добавьте другие ключи по необходимости
    },
    
    // Адрес робота (замените на реальный)
    ROBOT_ADDRESS: '0x0000000000000000000000000000000000000000',
    
    // Настройки обновления данных (мс)
    UPDATE_INTERVALS: {
        balance: 30000,      // 30 секунд
        transactions: 60000, // 1 минута
        gasPrice: 10000,     // 10 секунд
        mempool: 5000        // 5 секунд
    },
    
    // Настройки интерфейса
    UI: {
        defaultTheme: 'dark',
        animationsEnabled: true,
        soundEnabled: false,
        language: 'ru'
    },
    
    // Лимиты
    LIMITS: {
        maxTransactionsPerPage: 20,
        maxChartPoints: 100,
        maxMempoolItems: 50
    },
    
    // Контракты (добавьте адреса нужных контрактов)
    CONTRACTS: {
        // Пример:
        // pancakeRouter: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        // pancakeFactory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
    },
    
    // Токены для отслеживания
    TRACKED_TOKENS: [
        {
            symbol: 'BNB',
            address: 'native',
            decimals: 18
        },
        {
            symbol: 'BUSD',
            address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            decimals: 18
        },
        {
            symbol: 'USDT',
            address: '0x55d398326f99059fF775485246999027B3197955',
            decimals: 18
        },
        {
            symbol: 'CAKE',
            address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
            decimals: 18
        }
    ],
    
    // DEX для арбитража
    DEXES: [
        {
            name: 'PancakeSwap',
            router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
            factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
        },
        {
            name: 'BiSwap',
            router: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
            factory: '0x858E3312ed3A876947EA49d572A7C42DE08af7EE'
        }
    ],
    
    // Настройки арбитража
    ARBITRAGE: {
        minProfitThreshold: 0.001, // Минимальная прибыль в BNB
        maxGasPrice: 10,            // Максимальная цена газа в Gwei
        slippageTolerance: 0.5      // Допустимое проскальзывание в %
    },
    
    // Настройки уведомлений
    NOTIFICATIONS: {
        enabled: true,
        pushEnabled: false,
        soundEnabled: false,
        transactionAlerts: true,
        arbitrageAlerts: true,
        errorAlerts: true
    },
    
    // Режим разработки
    DEBUG: false,
    
    // Функции помощники
    getApiUrl(module, action, params = {}) {
        const baseUrl = 'https://api.bscscan.com/api';
        const queryParams = new URLSearchParams({
            module: module,
            action: action,
            apikey: this.API_KEYS.bscscan,
            ...params
        });
        return `${baseUrl}?${queryParams}`;
    },
    
    getExplorerUrl(type, value) {
        const types = {
            tx: 'tx',
            address: 'address',
            block: 'block',
            token: 'token'
        };
        return `${this.NETWORK.explorer}/${types[type]}/${value}`;
    }
};

// Замораживаем конфигурацию от изменений
Object.freeze(window.CONFIG);
Object.freeze(window.CONFIG.NETWORK);
Object.freeze(window.CONFIG.API_KEYS);
Object.freeze(window.CONFIG.UI);
Object.freeze(window.CONFIG.LIMITS);
Object.freeze(window.CONFIG.ARBITRAGE);
Object.freeze(window.CONFIG.NOTIFICATIONS);