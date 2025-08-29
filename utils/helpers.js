// ========================================
// ArbiInvest - Вспомогательные функции
// ========================================

export const Utils = {
    // Форматирование адреса
    formatAddress: (address, start = 6, end = 4) => {
        if (!address) return '0x0000...0000';
        return `${address.slice(0, start)}...${address.slice(-end)}`;
    },
    
    // Форматирование чисел
    formatNumber: (number, decimals = 2) => {
        if (number === null || number === undefined) return '0';
        
        const num = parseFloat(number);
        if (isNaN(num)) return '0';
        
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },
    
    // Форматирование больших чисел
    formatLargeNumber: (number) => {
        const num = parseFloat(number);
        if (isNaN(num)) return '0';
        
        if (num >= 1e9) {
            return Utils.formatNumber(num / 1e9, 2) + ' млрд';
        } else if (num >= 1e6) {
            return Utils.formatNumber(num / 1e6, 2) + ' млн';
        } else if (num >= 1e3) {
            return Utils.formatNumber(num / 1e3, 2) + ' тыс';
        } else {
            return Utils.formatNumber(num, 2);
        }
    },
    
    // Форматирование ETH
    formatETH: (wei, decimals = 4) => {
        if (!wei) return '0';
        
        const eth = parseFloat(wei) / 1e18;
        return Utils.formatNumber(eth, decimals);
    },
    
    // Форматирование Wei в Gwei
    formatGwei: (wei, decimals = 1) => {
        if (!wei) return '0';
        
        const gwei = parseFloat(wei) / 1e9;
        return Utils.formatNumber(gwei, decimals);
    },
    
    // Форматирование процентов
    formatPercent: (value, decimals = 2) => {
        if (!value) return '0%';
        
        return Utils.formatNumber(value, decimals) + '%';
    },
    
    // Форматирование USD
    formatUSD: (value, decimals = 2) => {
        if (!value) return '$0';
        
        return '$' + Utils.formatNumber(value, decimals);
    },
    
    // Форматирование времени
    formatTime: (timestamp) => {
        if (!timestamp) return '';
        
        const date = new Date(timestamp * 1000);
        return new Intl.DateTimeFormat('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    },
    
    // Форматирование даты
    formatDate: (timestamp) => {
        if (!timestamp) return '';
        
        const date = new Date(timestamp * 1000);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    },
    
    // Форматирование полной даты и времени
    formatDateTime: (timestamp) => {
        if (!timestamp) return '';
        
        const date = new Date(timestamp * 1000);
        return new Intl.DateTimeFormat('ru-RU', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },
    
    // Относительное время
    formatRelativeTime: (timestamp) => {
        const now = Date.now() / 1000;
        const diff = now - timestamp;
        
        if (diff < 60) {
            return 'только что';
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return `${minutes} ${Utils.pluralize(minutes, 'минуту', 'минуты', 'минут')} назад`;
        } else if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return `${hours} ${Utils.pluralize(hours, 'час', 'часа', 'часов')} назад`;
        } else {
            const days = Math.floor(diff / 86400);
            return `${days} ${Utils.pluralize(days, 'день', 'дня', 'дней')} назад`;
        }
    },
    
    // Склонение числительных
    pluralize: (number, one, two, five) => {
        let n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) {
            return five;
        }
        n %= 10;
        if (n === 1) {
            return one;
        }
        if (n >= 2 && n <= 4) {
            return two;
        }
        return five;
    },
    
    // Получение цвета для изменения
    getChangeColor: (change) => {
        if (change > 0) return 'var(--success)';
        if (change < 0) return 'var(--danger)';
        return 'var(--text-secondary)';
    },
    
    // Получение класса для изменения
    getChangeClass: (change) => {
        if (change > 0) return 'positive';
        if (change < 0) return 'negative';
        return 'neutral';
    },
    
    // Получение иконки для изменения
    getChangeIcon: (change) => {
        if (change > 0) return '↑';
        if (change < 0) return '↓';
        return '→';
    },
    
    // Задержка
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Копирование в буфер обмена
    copyToClipboard: async (text) => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    return true;
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                    return false;
                } finally {
                    textArea.remove();
                }
            }
        } catch (err) {
            console.error('Failed to copy:', err);
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
    },
    
    // Генерация уникального ID
    generateId: () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Проверка мобильного устройства
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Проверка iOS
    isIOS: () => {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },
    
    // Проверка Android
    isAndroid: () => {
        return /Android/.test(navigator.userAgent);
    },
    
    // Проверка темной темы системы
    isDarkMode: () => {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    
    // Парсинг URL параметров
    parseUrlParams: (url = window.location.href) => {
        const params = {};
        const parser = document.createElement('a');
        parser.href = url;
        const query = parser.search.substring(1);
        const vars = query.split('&');
        
        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=');
            if (pair[0]) {
                params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
        }
        
        return params;
    },
    
    // Создание URL с параметрами
    buildUrl: (base, params) => {
        const url = new URL(base);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });
        return url.toString();
    },
    
    // Валидация адреса Ethereum
    isValidAddress: (address) => {
        if (!address) return false;
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
    
    // Валидация хеша транзакции
    isValidTxHash: (hash) => {
        if (!hash) return false;
        return /^0x[a-fA-F0-9]{64}$/.test(hash);
    },
    
    // Сокращение строки
    truncate: (str, length = 20, ending = '...') => {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length - ending.length) + ending;
    },
    
    // Экранирование HTML
    escapeHtml: (text) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    
    // Получение цены газа (заглушка)
    getGasPrice: async () => {
        // В реальном приложении здесь будет запрос к API
        return Math.floor(20 + Math.random() * 30);
    },
    
    // Расчет комиссии
    calculateFee: (gasPrice, gasLimit = 21000) => {
        const fee = (gasPrice * gasLimit) / 1e9;
        return fee;
    },
    
    // Конвертация hex в decimal
    hexToDecimal: (hex) => {
        return parseInt(hex, 16);
    },
    
    // Конвертация decimal в hex
    decimalToHex: (decimal) => {
        return '0x' + decimal.toString(16);
    },
    
    // Глубокое копирование объекта
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Слияние объектов
    deepMerge: (target, ...sources) => {
        if (!sources.length) return target;
        
        const source = sources.shift();
        
        if (Utils.isObject(target) && Utils.isObject(source)) {
            for (const key in source) {
                if (Utils.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    Utils.deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        
        return Utils.deepMerge(target, ...sources);
    },
    
    // Проверка объекта
    isObject: (item) => {
        return item && typeof item === 'object' && !Array.isArray(item);
    },
    
    // Группировка массива по ключу
    groupBy: (array, key) => {
        return array.reduce((result, item) => {
            const group = item[key];
            if (!result[group]) result[group] = [];
            result[group].push(item);
            return result;
        }, {});
    },
    
    // Сортировка массива объектов
    sortBy: (array, key, order = 'asc') => {
        return array.sort((a, b) => {
            if (order === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    },
    
    // Поиск в массиве объектов
    searchInArray: (array, query, keys) => {
        const lowercaseQuery = query.toLowerCase();
        
        return array.filter(item => {
            return keys.some(key => {
                const value = item[key];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(lowercaseQuery);
                }
                return false;
            });
        });
    },
    
    // Загрузка скрипта
    loadScript: (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },
    
    // Загрузка стилей
    loadStyle: (href) => {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    },
    
    // Проверка поддержки Web3
    isWeb3Available: () => {
        return typeof window.ethereum !== 'undefined';
    },
    
    // Запрос разрешения на уведомления
    requestNotificationPermission: async () => {
        if (!('Notification' in window)) {
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        return false;
    },
    
    // Показ браузерного уведомления
    showBrowserNotification: (title, options = {}) => {
        if (!('Notification' in window)) {
            return;
        }
        
        if (Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/images/favicon-32x32.png',
                badge: '/images/favicon-16x16.png',
                ...options
            });
        }
    }
};

// Экспорт по умолчанию
export default Utils;
