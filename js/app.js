// ========================================
// ArbiInvest - Главный модуль приложения
// ========================================

class ArbiInvestApp {
    constructor() {
        this.isInitialized = false;
        this.currentSection = 'dashboard';
        this.walletAddress = null;
        this.networkId = 56; // BSC по умолчанию
        
        // Приветственный текст для анимации
        this.welcomeText = `Привет. Это настоящий сайт к которому привязан реальный арбитражный бот. И доступен он только своим то есть рептилоидам. 
Если вы думаете что вас сюда пустят просто потому что у вас есть деньги то нет)) Но вы можете смотреть как мы зарабатываем. 
Уважаемые рептилоиды прошу пройти верификацию.`;
        
        this.typingSpeed = 35; // Скорость печатания для людей 62-64 лет (миллисекунды на символ)
        this.modules = {};
    }
    
    // Инициализация приложения
    async init() {
        console.log('🚀 ArbiInvest App starting...');
        
        // Проверяем существующую авторизацию
        if (window.authModule && window.authModule.checkExistingAuth()) {
            console.log('✅ Existing auth found, skipping welcome screen');
            // Прямой вход для авторизованных
            this.quickEnterApp();
        } else {
            // Показываем экран приветствия с анимацией
            await this.showWelcomeScreen();
        }
        
        // Инициализация после входа
        this.initEventListeners();
        this.loadSettings();
        
        console.log('✅ ArbiInvest App initialized');
    }
    
    // Экран приветствия с анимацией печатания
    async showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const typingText = document.getElementById('typing-text');
        const enterButton = document.getElementById('enter-site');
        const cursor = document.querySelector('.cursor');
        
        if (!welcomeScreen || !typingText) return;
        
        // Анимация печатания текста
        let charIndex = 0;
        const lines = this.welcomeText.split('\n');
        
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex].trim();
            if (!line) continue;
            
            // Создаем параграф для каждой строки
            const paragraph = document.createElement('p');
            paragraph.className = 'typing-paragraph';
            typingText.appendChild(paragraph);
            
            // Печатаем символы
            for (let i = 0; i < line.length; i++) {
                paragraph.textContent += line[i];
                
                // Случайная вариация скорости для реалистичности
                const delay = this.typingSpeed + Math.random() * 20 - 10;
                await this.sleep(delay);
                
                // Пауза после знаков препинания
                if (['.', '!', '?', ')'].includes(line[i])) {
                    await this.sleep(200);
                }
            }
            
            // Пауза между строками
            if (lineIndex < lines.length - 1) {
                await this.sleep(400);
            }
        }
        
        // Убираем курсор и показываем кнопку
        cursor.style.display = 'none';
        enterButton.style.display = 'flex';
        enterButton.style.animation = 'fadeIn 0.5s ease-in';
        
        // Обработчик кнопки входа
        enterButton.addEventListener('click', () => {
            this.enterSite();
        });
    }
    
    // Вход на сайт - теперь проверяем авторизацию
    enterSite() {
        console.log('🔐 Enter site clicked');
        
        // Всегда показываем экран авторизации при первом входе
        if (window.authModule) {
            // Проверяем существующую авторизацию
            if (window.authModule.checkExistingAuth()) {
                console.log('✅ User already authorized, entering app');
                // Если уже авторизован, сразу входим
                this.directEnterApp();
            } else {
                console.log('🔐 Showing auth screen');
                // Показываем экран выбора (хомяк или рептилоид)
                window.authModule.showAuthScreen();
            }
        } else {
            console.error('❌ Auth module not loaded!');
            // Попробуем загрузить модуль
            setTimeout(() => {
                if (window.authModule) {
                    window.authModule.showAuthScreen();
                } else {
                    alert('Ошибка загрузки модуля авторизации. Перезагрузите страницу.');
                }
            }, 1000);
        }
    }
    
    // Быстрый вход для авторизованных пользователей
    quickEnterApp() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const app = document.getElementById('app');
        
        // Скрываем приветственный экран
        if (welcomeScreen) {
            welcomeScreen.style.display = 'none';
        }
        
        // Показываем основное приложение
        app.style.display = 'block';
        app.style.opacity = '1';
        
        // Инициализируем модули
        this.initModules();
        this.startUpdates();
        
        // Показываем приветствие для авторизованного пользователя
        const authWallet = localStorage.getItem('auth_wallet');
        if (authWallet) {
            this.showNotification('success', `Добро пожаловать, рептилоид!`, 3000);
        }
    }
    
    // Прямой вход в приложение (после авторизации)
    directEnterApp() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const app = document.getElementById('app');
        
        // Плавная анимация перехода
        welcomeScreen.style.opacity = '0';
        welcomeScreen.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            app.style.display = 'block';
            app.style.opacity = '0';
            
            // Форсируем reflow
            app.offsetHeight;
            
            app.style.transition = 'opacity 0.5s ease-in';
            app.style.opacity = '1';
            
            // Инициализируем модули после показа основного приложения
            this.initModules();
            this.startUpdates();
        }, 500);
    }
    
    // Инициализация модулей
    async initModules() {
        try {
            // Подключение к BSC
            await this.connectToBSC();
            
            // Загрузка модулей
            if (typeof DashboardModule !== 'undefined') {
                this.modules.dashboard = new DashboardModule(this);
                await this.modules.dashboard.init();
            }
            
            if (typeof WalletModule !== 'undefined') {
                this.modules.wallet = new WalletModule(this);
                window.walletModule = this.modules.wallet;
                await this.modules.wallet.init();
            }
            
            if (typeof TransactionsModule !== 'undefined') {
                this.modules.transactions = new TransactionsModule(this);
                window.transactionsModule = this.modules.transactions;
                await this.modules.transactions.init();
            }
            
            // Инициализация секции мемпула
            console.log('🔍 Loading Mempool Section...');
            try {
                const MempoolSection = (await import('../modules/mempool/mempool-section.js')).default;
                this.modules.mempool = new MempoolSection(this);
                await this.modules.mempool.init();
                console.log('✅ Mempool section initialized');
            } catch (error) {
                console.warn('⚠️ Mempool section not loaded:', error);
            }
            
            // Обновляем статус подключения
            this.updateConnectionStatus('connected');
            
        } catch (error) {
            console.error('Error initializing modules:', error);
            this.updateConnectionStatus('error');
        }
    }
    
    // Подключение к Binance Smart Chain
    async connectToBSC() {
        const config = window.CONFIG || {};
        
        // Обновляем конфигурацию для BSC
        this.etherscanApiKey = 'RAI3FTD9W53JPYZ2AHW8IBH9BXUC71NRH1'; // Ваш ключ
        this.apiUrl = 'https://api.bscscan.com/api';
        this.explorerUrl = 'https://bscscan.com';
        
        console.log('🔗 Connected to Binance Smart Chain');
    }
    
    // Обновление статуса подключения
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;
        
        const statusDot = statusElement.querySelector('.status-dot');
        const statusText = statusElement.querySelector('.status-text');
        
        switch (status) {
            case 'connected':
                statusDot.className = 'status-dot connected';
                statusText.textContent = 'Подключено к BSC';
                break;
            case 'connecting':
                statusDot.className = 'status-dot connecting';
                statusText.textContent = 'Подключение...';
                break;
            case 'error':
                statusDot.className = 'status-dot error';
                statusText.textContent = 'Ошибка подключения';
                break;
            default:
                statusDot.className = 'status-dot';
                statusText.textContent = 'Не подключено';
        }
    }
    
    // Инициализация обработчиков событий
    initEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section') || link.getAttribute('href').substring(1);
                this.navigateTo(section);
            });
        });
        
        // Кнопка обновления
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }
        
        // Переключатель темы
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Обработка скролла для хедера
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // Навигация между секциями
    navigateTo(sectionId) {
        // Скрываем все секции
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Показываем нужную секцию
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Обновляем активную ссылку
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}` || 
                    link.getAttribute('data-section') === sectionId) {
                    link.classList.add('active');
                }
            });
            
            // Загружаем данные для секции
            if (this.modules[sectionId]) {
                this.modules[sectionId].load();
            }
        }
    }
    
    // Обновление данных
    async refreshData() {
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.classList.add('loading');
            refreshBtn.disabled = true;
        }
        
        try {
            // Обновляем данные во всех модулях
            const updatePromises = Object.values(this.modules).map(module => {
                if (module.refresh) {
                    return module.refresh();
                }
            });
            
            await Promise.all(updatePromises);
            
            // Показываем уведомление
            this.showNotification('success', 'Данные обновлены');
            
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showNotification('error', 'Ошибка обновления данных');
        } finally {
            if (refreshBtn) {
                refreshBtn.classList.remove('loading');
                refreshBtn.disabled = false;
            }
        }
    }
    
    // Запуск автоматических обновлений
    startUpdates() {
        // Обновление баланса
        setInterval(() => {
            if (this.modules.wallet) {
                this.modules.wallet.updateBalance();
            }
        }, 10000);
        
        // Обновление транзакций
        setInterval(() => {
            if (this.modules.transactions) {
                this.modules.transactions.updateTransactions();
            }
        }, 15000);
        
        // Обновление газа
        setInterval(() => {
            this.updateGasPrice();
        }, 10000);
    }
    
    // Обновление цены газа
    async updateGasPrice() {
        try {
            const response = await fetch(`${this.apiUrl}?module=gastracker&action=gasoracle&apikey=${this.etherscanApiKey}`);
            const data = await response.json();
            
            if (data.status === '1' && data.result) {
                const gasPrice = data.result.SafeGasPrice;
                
                // Обновляем отображение
                const gasPriceElements = document.querySelectorAll('[data-gas-price]');
                gasPriceElements.forEach(el => {
                    el.textContent = gasPrice;
                });
            }
        } catch (error) {
            console.error('Error updating gas price:', error);
        }
    }
    
    // Переключение темы
    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Обновляем иконку
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = newTheme === 'dark' ? 
                '<svg>...</svg>' : '<svg>...</svg>';
        }
    }
    
    // Загрузка настроек
    loadSettings() {
        // Загружаем тему
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        
        // Загружаем адрес кошелька
        this.walletAddress = localStorage.getItem('wallet_address');
        
        // Загружаем другие настройки
        const settings = JSON.parse(localStorage.getItem('settings') || '{}');
        this.settings = { ...this.defaultSettings, ...settings };
    }
    
    // Показ уведомлений
    showNotification(type, message, duration = 3000) {
        // Используем глобальный модуль уведомлений если он доступен
        if (window.notifications) {
            return window.notifications.show(type, message, { duration });
        }
        
        // Fallback на встроенную реализацию
        const container = document.getElementById('notificationContainer') || this.createNotificationContainer();
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${this.getNotificationIcon(type)}</div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
    
    // Создание контейнера для уведомлений
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
        return container;
    }
    
    // Получение иконки для уведомления
    getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
    
    // Вспомогательная функция для задержки
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Форматирование чисел
    formatNumber(number, decimals = 2) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }
    
    // Форматирование адреса
    formatAddress(address, start = 6, end = 4) {
        if (!address) return '0x0000...0000';
        return `${address.slice(0, start)}...${address.slice(-end)}`;
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOMContentLoaded - initializing app');
    
    // Инициализируем модуль авторизации если он загружен
    if (window.authModule && window.authModule.init) {
        console.log('🔐 Initializing auth module');
        window.authModule.init();
    } else {
        console.warn('⚠️ Auth module not found or not loaded');
    }
    
    // Создаем и инициализируем основное приложение
    window.app = new ArbiInvestApp();
    window.app.init();
});