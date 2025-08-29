// ========================================
// ArbiInvest - Конфигурация
// ========================================

const CONFIG = {
    // Основные настройки
    APP_NAME: 'ArbiInvest',
    VERSION: '1.0.0',
    DEBUG: false,
    
    // Адрес робота (замените на реальный адрес вашего робота)
    ROBOT_ADDRESS: '0x0000000000000000000000000000000000000000', // TODO: Добавить реальный адрес
    
    // BSCScan API (Binance Smart Chain)
    BSCSCAN_API_KEY: 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1', // Ваш валидный ключ
    BSCSCAN_API_URL: 'https://api.bscscan.com/api',
    
    // Основная сеть - BSC
    DEFAULT_NETWORK: 56,
    
    // Настройки сети
    NETWORKS: {
        56: {
            name: 'Binance Smart Chain',
            rpc: 'https://bsc-dataseed.binance.org/',
            explorer: 'https://bscscan.com',
            symbol: 'BNB',
            decimals: 18,
            apiUrl: 'https://api.bscscan.com/api',
            apiKey: 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1'
        },
        1: {
            name: 'Ethereum Mainnet',
            rpc: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
            explorer: 'https://etherscan.io',
            symbol: 'ETH',
            decimals: 18
        },
        137: {
            name: 'Polygon',
            rpc: 'https://polygon-rpc.com/',
            explorer: 'https://polygonscan.com',
            symbol: 'MATIC',
            decimals: 18
        },
        42161: {
            name: 'Arbitrum',
            rpc: 'https://arb1.arbitrum.io/rpc',
            explorer: 'https://arbiscan.io',
            symbol: 'ETH',
            decimals: 18
        }
    },
    
    // Настройки обновления данных (в миллисекундах)
    UPDATE_INTERVALS: {
        BALANCE: 10000,        // 10 секунд
        TRANSACTIONS: 15000,   // 15 секунд
        MEMPOOL: 5000,        // 5 секунд
        CHART: 30000,         // 30 секунд
        GAS_PRICE: 10000      // 10 секунд
    },
    
    // Настройки графиков
    CHART_CONFIG: {
        COLORS: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            grid: '#27272a',
            text: '#a1a1aa'
        },
        FONT_FAMILY: 'Inter, sans-serif',
        ANIMATIONS: true
    },
    
    // Настройки пагинации
    PAGINATION: {
        TRANSACTIONS_PER_PAGE: 20,
        MEMPOOL_PER_PAGE: 50
    },
    
    // DEX для мониторинга на BSC
    DEX_CONTRACTS: {
        PANCAKESWAP_V2: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        PANCAKESWAP_V3: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
        BISWAP: '0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8',
        APESWAP: '0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7'
    },
    
    // Токены для отслеживания на BSC
    TRACKED_TOKENS: {
        WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        USDT: '0x55d398326f99059fF775485246999027B3197955',
        USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        ETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8'
    },
    
    // Локальное хранилище
    STORAGE_KEYS: {
        WALLET_ADDRESS: 'arbi_wallet_address',
        NETWORK_ID: 'arbi_network_id',
        THEME: 'arbi_theme',
        LANGUAGE: 'arbi_language',
        FAVORITES: 'arbi_favorites',
        SETTINGS: 'arbi_settings'
    },
    
    // Настройки уведомлений
    NOTIFICATIONS: {
        ENABLED: true,
        SOUND: true,
        DESKTOP: true,
        TYPES: {
            NEW_TRANSACTION: true,
            LARGE_PROFIT: true,
            ERROR: true,
            OPPORTUNITY: true
        }
    },
    
    // Пороговые значения
    THRESHOLDS: {
        MIN_PROFIT_ETH: 0.001,
        MIN_ARBITRAGE_PERCENT: 0.5,
        HIGH_GAS_GWEI: 100,
        MAX_SLIPPAGE: 3
    },
    
    // API endpoints (для будущего бэкенда)
    API_ENDPOINTS: {
        BASE_URL: 'https://api.arbiinvest.com',
        WEBSOCKET: 'wss://ws.arbiinvest.com'
    },
    
    // Форматирование чисел
    FORMATTING: {
        DECIMALS: {
            ETH: 4,
            USD: 2,
            PERCENT: 2,
            GWEI: 1
        },
        LOCALE: 'ru-RU'
    }
};

// Функции-помощники
const Utils = {
    // Форматирование адреса
    formatAddress: (address, start = 6, end = 4) => {
        if (!address) return '0x0000...0000';
        return `${address.slice(0, start)}...${address.slice(-end)}`;
    },
    
    // Форматирование чисел
    formatNumber: (number, decimals = 2) => {
        return new Intl.NumberFormat(CONFIG.FORMATTING.LOCALE, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    },
    
    // Форматирование ETH
    formatETH: (wei) => {
        const eth = wei / 1e18;
        return Utils.formatNumber(eth, CONFIG.FORMATTING.DECIMALS.ETH);
    },
    
    // Форматирование времени
    formatTime: (timestamp) => {
        const date = new Date(timestamp * 1000);
        return new Intl.DateTimeFormat(CONFIG.FORMATTING.LOCALE, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    },
    
    // Форматирование даты
    formatDate: (timestamp) => {
        const date = new Date(timestamp * 1000);
        return new Intl.DateTimeFormat(CONFIG.FORMATTING.LOCALE, {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    },
    
    // Получение цвета для изменения
    getChangeColor: (change) => {
        if (change > 0) return 'var(--success)';
        if (change < 0) return 'var(--danger)';
        return 'var(--text-secondary)';
    },
    
    // Задержка
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Копирование в буфер обмена
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    },
    
    // Получение из localStorage
    getStorageItem: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },
    
    // Сохранение в localStorage
    setStorageItem: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },
    
    // Дебаунс
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, Utils };
}