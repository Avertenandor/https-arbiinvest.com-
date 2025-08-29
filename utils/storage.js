// ========================================
// ArbiInvest - Модуль хранения данных
// ========================================

window.StorageModule = {
    // Префикс для всех ключей
    prefix: 'arbiinvest_',
    
    // Сохранение данных
    set(key, value) {
        try {
            const fullKey = this.prefix + key;
            const data = JSON.stringify({
                value: value,
                timestamp: Date.now()
            });
            localStorage.setItem(fullKey, data);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            return false;
        }
    },
    
    // Получение данных
    get(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const data = localStorage.getItem(fullKey);
            
            if (!data) return defaultValue;
            
            const parsed = JSON.parse(data);
            return parsed.value;
        } catch (error) {
            console.error('Ошибка чтения данных:', error);
            return defaultValue;
        }
    },
    
    // Получение данных с проверкой срока действия
    getWithExpiry(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const data = localStorage.getItem(fullKey);
            
            if (!data) return defaultValue;
            
            const parsed = JSON.parse(data);
            const now = Date.now();
            
            // Проверяем срок действия (24 часа)
            if (parsed.timestamp && (now - parsed.timestamp) > 86400000) {
                this.remove(key);
                return defaultValue;
            }
            
            return parsed.value;
        } catch (error) {
            console.error('Ошибка чтения данных:', error);
            return defaultValue;
        }
    },
    
    // Удаление данных
    remove(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Ошибка удаления данных:', error);
            return false;
        }
    },
    
    // Очистка всех данных приложения
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Ошибка очистки данных:', error);
            return false;
        }
    },
    
    // Проверка существования ключа
    has(key) {
        const fullKey = this.prefix + key;
        return localStorage.getItem(fullKey) !== null;
    },
    
    // Получение всех ключей приложения
    getAllKeys() {
        const keys = [];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        });
        
        return keys;
    },
    
    // Получение размера хранилища
    getSize() {
        let size = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                size += localStorage.getItem(key).length;
            }
        });
        
        return size;
    },
    
    // Сохранение настроек
    saveSettings(settings) {
        return this.set('settings', settings);
    },
    
    // Загрузка настроек
    loadSettings() {
        return this.get('settings', {
            theme: 'dark',
            language: 'ru',
            notifications: true,
            autoRefresh: true,
            refreshInterval: 30000,
            soundEnabled: false,
            compactView: false
        });
    },
    
    // Сохранение кошелька
    saveWallet(address) {
        return this.set('robot_wallet', address);
    },
    
    // Загрузка кошелька
    loadWallet() {
        return this.get('robot_wallet', null);
    },
    
    // Кэширование данных API
    cacheApiData(endpoint, data, ttl = 300000) { // 5 минут по умолчанию
        const cacheData = {
            data: data,
            expiry: Date.now() + ttl
        };
        return this.set(`cache_${endpoint}`, cacheData);
    },
    
    // Получение кэшированных данных API
    getCachedApiData(endpoint) {
        const cached = this.get(`cache_${endpoint}`, null);
        
        if (!cached) return null;
        
        if (Date.now() > cached.expiry) {
            this.remove(`cache_${endpoint}`);
            return null;
        }
        
        return cached.data;
    },
    
    // Сохранение истории транзакций
    saveTransactionHistory(transactions) {
        return this.set('transaction_history', transactions);
    },
    
    // Загрузка истории транзакций
    loadTransactionHistory() {
        return this.get('transaction_history', []);
    },
    
    // Экспорт всех данных
    exportData() {
        const data = {};
        const keys = this.getAllKeys();
        
        keys.forEach(key => {
            data[key] = this.get(key);
        });
        
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            data: data
        };
    },
    
    // Импорт данных
    importData(exportedData) {
        try {
            if (!exportedData.data) return false;
            
            Object.entries(exportedData.data).forEach(([key, value]) => {
                this.set(key, value);
            });
            
            return true;
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            return false;
        }
    }
};

// Делаем модуль доступным глобально
window.storage = window.StorageModule;