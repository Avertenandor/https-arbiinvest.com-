// ========================================
// ArbiInvest - Менеджер уведомлений
// ========================================

export class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }
    
    init() {
        // Создаем контейнер для уведомлений если его нет
        this.container = document.getElementById('notificationContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
        
        // Запрашиваем разрешение на браузерные уведомления
        this.requestPermission();
    }
    
    // Запрос разрешения на уведомления
    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                await Notification.requestPermission();
            } catch (error) {
                console.log('Notification permission denied');
            }
        }
    }
    
    // Показать уведомление
    show(options = {}) {
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 5000,
            closable = true,
            actions = [],
            persistent = false,
            showBrowserNotification = false
        } = options;
        
        // Генерируем ID для уведомления
        const id = this.generateId();
        
        // Создаем элемент уведомления
        const notification = this.createElement({
            id,
            type,
            title,
            message,
            closable,
            actions
        });
        
        // Добавляем в контейнер
        this.container.appendChild(notification);
        
        // Анимация появления
        requestAnimationFrame(() => {
            notification.classList.add('animate-slideInRight');
        });
        
        // Сохраняем в Map
        this.notifications.set(id, {
            element: notification,
            options
        });
        
        // Автоматическое скрытие
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }
        
        // Показываем браузерное уведомление если нужно
        if (showBrowserNotification) {
            this.showBrowserNotification(title, message, type);
        }
        
        return id;
    }
    
    // Создание элемента уведомления
    createElement(props) {
        const { id, type, title, message, closable, actions } = props;
        
        const notification = document.createElement('div');
        notification.className = `toast toast-${type}`;
        notification.dataset.id = id;
        
        // Иконка
        const icon = this.getIcon(type);
        
        // HTML структура
        notification.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                ${message ? `<div class="toast-message">${message}</div>` : ''}
                ${actions.length > 0 ? `
                    <div class="toast-actions">
                        ${actions.map(action => `
                            <button class="btn btn-sm btn-${action.style || 'ghost'}" 
                                    data-action="${action.id}">
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            ${closable ? '<button class="toast-close">×</button>' : ''}
        `;
        
        // Обработчики событий
        if (closable) {
            const closeBtn = notification.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => this.hide(id));
        }
        
        // Обработчики для действий
        actions.forEach(action => {
            const btn = notification.querySelector(`[data-action="${action.id}"]`);
            if (btn && action.handler) {
                btn.addEventListener('click', () => {
                    action.handler();
                    if (action.closeOnClick !== false) {
                        this.hide(id);
                    }
                });
            }
        });
        
        return notification;
    }
    
    // Получение иконки по типу
    getIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm-2 15l-5-5 1.4-1.4L8 12.2l7.6-7.6L17 6l-9 9z"/>
            </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm5 13.6L13.6 15 10 11.4 6.4 15 5 13.6 8.6 10 5 6.4 6.4 5 10 8.6 13.6 5 15 6.4 11.4 10 15 13.6z"/>
            </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"/>
            </svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm1 15H9v-6h2v6zm0-8H9V5h2v2z"/>
            </svg>`
        };
        
        return icons[type] || icons.info;
    }
    
    // Скрыть уведомление
    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        const element = notification.element;
        
        // Анимация исчезновения
        element.style.animation = 'slideOutRight 0.3s ease forwards';
        
        // Удаляем после анимации
        setTimeout(() => {
            element.remove();
            this.notifications.delete(id);
        }, 300);
    }
    
    // Скрыть все уведомления
    hideAll() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
    }
    
    // Показать браузерное уведомление
    showBrowserNotification(title, body, type) {
        if (!('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;
        
        const notification = new Notification(title, {
            body,
            icon: '/images/favicon-192x192.png',
            badge: '/images/favicon-32x32.png',
            tag: type,
            renotify: true,
            requireInteraction: false,
            silent: false,
            vibrate: [200, 100, 200]
        });
        
        // Клик по уведомлению
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        // Автоматическое закрытие
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
    
    // Показать уведомление успеха
    success(message, title = 'Успешно') {
        return this.show({
            type: 'success',
            title,
            message
        });
    }
    
    // Показать уведомление ошибки
    error(message, title = 'Ошибка') {
        return this.show({
            type: 'error',
            title,
            message,
            duration: 7000
        });
    }
    
    // Показать уведомление предупреждения
    warning(message, title = 'Внимание') {
        return this.show({
            type: 'warning',
            title,
            message
        });
    }
    
    // Показать информационное уведомление
    info(message, title = 'Информация') {
        return this.show({
            type: 'info',
            title,
            message
        });
    }
    
    // Показать уведомление подтверждения
    confirm(message, title = 'Подтверждение') {
        return new Promise((resolve) => {
            this.show({
                type: 'warning',
                title,
                message,
                persistent: true,
                closable: false,
                actions: [
                    {
                        id: 'cancel',
                        label: 'Отмена',
                        style: 'secondary',
                        handler: () => resolve(false)
                    },
                    {
                        id: 'confirm',
                        label: 'Подтвердить',
                        style: 'primary',
                        handler: () => resolve(true)
                    }
                ]
            });
        });
    }
    
    // Показать уведомление о транзакции
    showTransaction(type, txHash, message) {
        const types = {
            pending: {
                type: 'info',
                title: 'Транзакция отправлена',
                icon: '⏳'
            },
            success: {
                type: 'success',
                title: 'Транзакция выполнена',
                icon: '✅'
            },
            failed: {
                type: 'error',
                title: 'Транзакция отклонена',
                icon: '❌'
            }
        };
        
        const config = types[type] || types.pending;
        
        return this.show({
            type: config.type,
            title: config.title,
            message: message || `Hash: ${this.formatHash(txHash)}`,
            duration: type === 'pending' ? 0 : 7000,
            persistent: type === 'pending',
            actions: txHash ? [
                {
                    id: 'view',
                    label: 'Посмотреть',
                    style: 'ghost',
                    handler: () => {
                        window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
                    },
                    closeOnClick: false
                }
            ] : []
        });
    }
    
    // Форматирование хеша
    formatHash(hash) {
        if (!hash) return '';
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    }
    
    // Генерация ID
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Уничтожение менеджера
    destroy() {
        this.hideAll();
        if (this.container) {
            this.container.remove();
        }
    }
}

// Экспорт по умолчанию
export default NotificationManager;
