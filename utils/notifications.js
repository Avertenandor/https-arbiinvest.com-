// ========================================
// ArbiInvest - Модуль уведомлений
// ========================================

window.NotificationsModule = {
    container: null,
    queue: [],
    isProcessing: false,
    
    // Инициализация модуля
    init() {
        this.createContainer();
        this.requestPermission();
    },
    
    // Создание контейнера для уведомлений
    createContainer() {
        if (document.getElementById('notification-container')) {
            this.container = document.getElementById('notification-container');
            return;
        }
        
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    },
    
    // Запрос разрешения на push-уведомления
    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                await Notification.requestPermission();
            } catch (error) {
                console.log('Не удалось получить разрешение на уведомления');
            }
        }
    },
    
    // Показ уведомления
    show(type, message, options = {}) {
        const notification = {
            type: type,
            message: message,
            duration: options.duration || 3000,
            position: options.position || 'top-right',
            closable: options.closable !== false,
            icon: options.icon || this.getIcon(type),
            id: this.generateId()
        };
        
        // Добавляем в очередь
        this.queue.push(notification);
        
        // Обрабатываем очередь
        this.processQueue();
        
        // Push-уведомление для важных событий
        if (options.push && this.canShowPush()) {
            this.showPushNotification(message, options);
        }
        
        return notification.id;
    },
    
    // Обработка очереди уведомлений
    processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        
        this.isProcessing = true;
        const notification = this.queue.shift();
        
        this.render(notification);
        
        setTimeout(() => {
            this.isProcessing = false;
            this.processQueue();
        }, 100);
    },
    
    // Рендер уведомления
    render(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.id = `notification-${notification.id}`;
        element.style.animation = 'slideIn 0.3s ease-out';
        
        element.innerHTML = `
            <div class="notification-icon">
                ${notification.icon}
            </div>
            <div class="notification-content">
                <div class="notification-message">${notification.message}</div>
            </div>
            ${notification.closable ? `
                <button class="notification-close" onclick="window.notifications.close('${notification.id}')">
                    ×
                </button>
            ` : ''}
        `;
        
        this.container.appendChild(element);
        
        // Автоматическое скрытие
        if (notification.duration > 0) {
            setTimeout(() => {
                this.close(notification.id);
            }, notification.duration);
        }
    },
    
    // Закрытие уведомления
    close(id) {
        const element = document.getElementById(`notification-${id}`);
        if (!element) return;
        
        element.style.animation = 'slideOut 0.3s ease-in';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    },
    
    // Push-уведомление
    showPushNotification(message, options = {}) {
        if (!this.canShowPush()) return;
        
        const notification = new Notification('ArbiInvest', {
            body: message,
            icon: '/favicon-192x192.png',
            badge: '/favicon-32x32.png',
            tag: options.tag || 'arbiinvest',
            requireInteraction: options.requireInteraction || false
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    },
    
    // Проверка возможности показа push-уведомлений
    canShowPush() {
        return 'Notification' in window && 
               Notification.permission === 'granted' &&
               document.hidden;
    },
    
    // Получение иконки по типу
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ',
            loading: '⟳'
        };
        return icons[type] || icons.info;
    },
    
    // Генерация уникального ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Методы-обертки для разных типов
    success(message, options = {}) {
        return this.show('success', message, options);
    },
    
    error(message, options = {}) {
        return this.show('error', message, { ...options, duration: 5000 });
    },
    
    warning(message, options = {}) {
        return this.show('warning', message, { ...options, duration: 4000 });
    },
    
    info(message, options = {}) {
        return this.show('info', message, options);
    },
    
    loading(message, options = {}) {
        return this.show('loading', message, { ...options, duration: 0, closable: false });
    },
    
    // Очистка всех уведомлений
    clearAll() {
        if (!this.container) return;
        
        const notifications = this.container.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        this.queue = [];
    },
    
    // Показ уведомления о транзакции
    showTransaction(type, txData) {
        const messages = {
            pending: `Транзакция отправлена: ${window.helpers.formatAddress(txData.hash)}`,
            success: `Транзакция успешна: ${window.helpers.formatAddress(txData.hash)}`,
            failed: `Транзакция неудачна: ${window.helpers.formatAddress(txData.hash)}`
        };
        
        const types = {
            pending: 'info',
            success: 'success',
            failed: 'error'
        };
        
        return this.show(types[type], messages[type], {
            duration: type === 'pending' ? 0 : 5000,
            push: type !== 'pending'
        });
    },
    
    // Показ уведомления об арбитраже
    showArbitrage(opportunity) {
        const profit = opportunity.profit.toFixed(4);
        const message = `Найдена возможность арбитража! Потенциальная прибыль: ${profit} BNB`;
        
        return this.show('success', message, {
            duration: 10000,
            push: true,
            requireInteraction: true
        });
    },
    
    // Показ уведомления об ошибке API
    showApiError(error) {
        const message = error.message || 'Ошибка при запросе к API';
        return this.error(message, { duration: 5000 });
    },
    
    // Показ уведомления о подключении
    showConnectionStatus(status) {
        const messages = {
            connected: 'Подключено к Binance Smart Chain',
            disconnected: 'Соединение потеряно',
            reconnecting: 'Переподключение...'
        };
        
        const types = {
            connected: 'success',
            disconnected: 'error',
            reconnecting: 'warning'
        };
        
        return this.show(types[status], messages[status]);
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.NotificationsModule.init();
});

// Делаем модуль доступным глобально
window.notifications = window.NotificationsModule;