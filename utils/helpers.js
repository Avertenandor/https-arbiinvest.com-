// ========================================
// ArbiInvest - Вспомогательные функции
// ========================================

window.ArbiHelpers = {
    // Форматирование чисел
    formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    },
    
    // Форматирование адреса
    formatAddress(address, start = 6, end = 4) {
        if (!address) return '0x0000...0000';
        return `${address.slice(0, start)}...${address.slice(-end)}`;
    },
    
    // Форматирование даты
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Форматирование относительного времени
    formatRelativeTime(timestamp) {
        const now = Date.now() / 1000;
        const diff = now - timestamp;
        
        if (diff < 60) return 'Только что';
        if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} д. назад`;
        
        return this.formatDate(timestamp);
    },
    
    // Форматирование суммы в USD
    formatUSD(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },
    
    // Копирование в буфер обмена
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },
    
    // Задержка выполнения
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Дебаунс функции
    debounce(func, wait) {
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
    
    // Троттлинг функции
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Проверка валидности адреса Ethereum/BSC
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
    
    // Конвертация Wei в ETH/BNB
    weiToEth(wei, decimals = 18) {
        return parseFloat(wei) / Math.pow(10, decimals);
    },
    
    // Конвертация ETH/BNB в Wei
    ethToWei(eth, decimals = 18) {
        return Math.floor(parseFloat(eth) * Math.pow(10, decimals));
    },
    
    // Получение случайного цвета для графиков
    getRandomColor() {
        const colors = [
            '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
            '#f59e0b', '#10b981', '#14b8a6', '#3b82f6'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // Сокращение больших чисел
    abbreviateNumber(value) {
        if (value < 1000) return value.toString();
        if (value < 1000000) return (value / 1000).toFixed(1) + 'K';
        if (value < 1000000000) return (value / 1000000).toFixed(1) + 'M';
        return (value / 1000000000).toFixed(1) + 'B';
    },
    
    // Генерация уникального ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Проверка мобильного устройства
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Получение параметров URL
    getUrlParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    },
    
    // Анимация числа
    animateValue(element, start, end, duration = 1000) {
        if (!element) return;
        
        const startTime = Date.now();
        const update = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const value = start + (end - start) * this.easeOutQuad(progress);
            
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            
            if (element) {
                element.textContent = Math.floor(value);
            }
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    },
    
    // Функция плавности анимации
    easeOutQuad(t) {
        return t * (2 - t);
    },
    
    // Парсинг хэша транзакции
    parseTransactionHash(hash) {
        if (!hash || !hash.startsWith('0x')) return null;
        
        return {
            full: hash,
            short: this.formatAddress(hash, 10, 8),
            explorer: `https://bscscan.com/tx/${hash}`
        };
    },
    
    // Расчет процентного изменения
    calculatePercentageChange(oldValue, newValue) {
        if (oldValue === 0) return 0;
        return ((newValue - oldValue) / oldValue) * 100;
    },
    
    // Проверка темной темы
    isDarkMode() {
        return document.body.getAttribute('data-theme') === 'dark' ||
               document.body.classList.contains('theme-dark');
    }
};

// Делаем помощники доступными глобально
window.helpers = window.ArbiHelpers;