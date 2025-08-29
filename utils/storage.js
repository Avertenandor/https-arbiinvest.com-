// ========================================
// ArbiInvest - Менеджер хранилища
// ========================================

export class StorageManager {
    constructor() {
        this.prefix = 'arbi_';
        this.storage = window.localStorage;
        this.sessionStorage = window.sessionStorage;
        this.cache = new Map();
        this.init();
    }
    
    init() {
        // Проверяем доступность localStorage
        this.isAvailable = this.checkAvailability();
        
        // Загружаем кэш
        this.loadCache();
        
        // Очищаем устаревшие данные
        this.cleanup();
    }
    
    // Проверка доступности localStorage
    checkAvailability() {
        try {
            const test = '__localStorage_test__';
            this.storage.setItem(test, test);
            this.storage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage недоступен:', e);
            return false;
        }
    }
    
    // Получение значения
    get(key, defaultValue = null) {
        // Проверяем кэш
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        if (!this.isAvailable) {
            return defaultValue;
        }
        
        try {
            const item = this.storage.getItem(this.prefix + key);
            
            if (item === null) {
                return defaultValue;
            }
            
            const data = JSON.parse(item);
            
            // Проверяем срок действия
            if (data.expiry && data.expiry < Date.now()) {
                this.remove(key);
                return defaultValue;
            }
            
            // Сохраняем в кэш
            this.cache.set(key, data.value);
            
            return data.value;
        } catch (e) {
            console.error('Ошибка чтения из localStorage:', e);
            return defaultValue;
        }
    }
    
    // Установка значения
    set(key, value, ttl = null) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const data = {
                value,
                timestamp: Date.now(),
                expiry: ttl ? Date.now() + ttl : null
            };
            
            this.storage.setItem(this.prefix + key, JSON.stringify(data));
            
            // Обновляем кэш
            this.cache.set(key, value);
            
            return true;
        } catch (e) {
            console.error('Ошибка записи в localStorage:', e);
            
            // Пытаемся очистить место
            if (e.name === 'QuotaExceededError') {
                this.cleanup();
                
                // Повторная попытка
                try {
                    this.storage.setItem(this.prefix + key, JSON.stringify({ value }));
                    return true;
                } catch (e2) {
                    console.error('Не удалось сохранить после очистки:', e2);
                }
            }
            
            return false;
        }
    }
    
    // Удаление значения
    remove(key) {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            this.storage.removeItem(this.prefix + key);
            this.cache.delete(key);
            return true;
        } catch (e) {
            console.error('Ошибка удаления из localStorage:', e);
            return false;
        }
    }
    
    // Проверка существования ключа
    has(key) {
        if (this.cache.has(key)) {
            return true;
        }
        
        if (!this.isAvailable) {
            return false;
        }
        
        return this.storage.getItem(this.prefix + key) !== null;
    }
    
    // Очистка всех данных
    clear() {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            // Удаляем только наши ключи
            const keys = Object.keys(this.storage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this.storage.removeItem(key);
                }
            });
            
            this.cache.clear();
            return true;
        } catch (e) {
            console.error('Ошибка очистки localStorage:', e);
            return false;
        }
    }
    
    // Получение всех ключей
    keys() {
        if (!this.isAvailable) {
            return [];
        }
        
        const keys = [];
        const storageKeys = Object.keys(this.storage);
        
        storageKeys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                keys.push(key.replace(this.prefix, ''));
            }
        });
        
        return keys;
    }
    
    // Получение размера хранилища
    getSize() {
        if (!this.isAvailable) {
            return 0;
        }
        
        let size = 0;
        const keys = Object.keys(this.storage);
        
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                size += this.storage.getItem(key).length + key.length;
            }
        });
        
        return size;
    }
    
    // Получение размера в удобном формате
    getFormattedSize() {
        const bytes = this.getSize();
        
        if (bytes < 1024) {
            return bytes + ' B';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }
    
    // Очистка устаревших данных
    cleanup() {
        if (!this.isAvailable) {
            return;
        }
        
        const now = Date.now();
        const keys = this.keys();
        
        keys.forEach(key => {
            try {
                const item = this.storage.getItem(this.prefix + key);
                if (item) {
                    const data = JSON.parse(item);
                    
                    // Удаляем устаревшие данные
                    if (data.expiry && data.expiry < now) {
                        this.remove(key);
                    }
                    
                    // Удаляем очень старые данные (больше 30 дней)
                    if (data.timestamp && now - data.timestamp > 30 * 24 * 60 * 60 * 1000) {
                        this.remove(key);
                    }
                }
            } catch (e) {
                // Удаляем поврежденные данные
                this.remove(key);
            }
        });
    }
    
    // Загрузка кэша
    loadCache() {
        // Загружаем часто используемые данные в кэш
        const importantKeys = [
            'walletAddress',
            'networkId',
            'theme',
            'language',
            'settings'
        ];
        
        importantKeys.forEach(key => {
            const value = this.get(key);
            if (value !== null) {
                this.cache.set(key, value);
            }
        });
    }
    
    // Сохранение в сессионное хранилище
    setSession(key, value) {
        if (!this.sessionStorage) {
            return false;
        }
        
        try {
            this.sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Ошибка записи в sessionStorage:', e);
            return false;
        }
    }
    
    // Получение из сессионного хранилища
    getSession(key, defaultValue = null) {
        if (!this.sessionStorage) {
            return defaultValue;
        }
        
        try {
            const item = this.sessionStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Ошибка чтения из sessionStorage:', e);
            return defaultValue;
        }
    }
    
    // Удаление из сессионного хранилища
    removeSession(key) {
        if (!this.sessionStorage) {
            return false;
        }
        
        try {
            this.sessionStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            console.error('Ошибка удаления из sessionStorage:', e);
            return false;
        }
    }
    
    // Экспорт всех данных
    export() {
        const data = {};
        const keys = this.keys();
        
        keys.forEach(key => {
            data[key] = this.get(key);
        });
        
        return data;
    }
    
    // Импорт данных
    import(data) {
        Object.entries(data).forEach(([key, value]) => {
            this.set(key, value);
        });
    }
    
    // Создание резервной копии
    backup() {
        const data = this.export();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arbiinvest_backup_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Восстановление из резервной копии
    restore(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.import(data);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    // Подписка на изменения
    subscribe(key, callback) {
        window.addEventListener('storage', (e) => {
            if (e.key === this.prefix + key) {
                const newValue = e.newValue ? JSON.parse(e.newValue).value : null;
                const oldValue = e.oldValue ? JSON.parse(e.oldValue).value : null;
                callback(newValue, oldValue);
            }
        });
    }
    
    // Уничтожение менеджера
    destroy() {
        this.cache.clear();
    }
}

// Экспорт по умолчанию
export default StorageManager;
