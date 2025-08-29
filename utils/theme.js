// ========================================
// ArbiInvest - Модуль темы
// ========================================

class ThemeModule {
    constructor() {
        this.currentTheme = 'dark';
        this.themes = {
            dark: {
                name: 'Темная',
                class: 'theme-dark',
                colors: {
                    primary: '#6366f1',
                    background: '#0f0f0f',
                    surface: '#1a1a1a',
                    text: '#e3e3e3'
                }
            },
            light: {
                name: 'Светлая',
                class: 'theme-light',
                colors: {
                    primary: '#4f46e5',
                    background: '#ffffff',
                    surface: '#f3f4f6',
                    text: '#111827'
                }
            }
        };
    }
    
    init() {
        // Загружаем сохраненную тему
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Привязываем обработчики
        this.bindEvents();
    }
    
    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        
        // Удаляем все классы тем
        Object.values(this.themes).forEach(t => {
            document.body.classList.remove(t.class);
        });
        
        // Добавляем новый класс темы
        document.body.classList.add(theme.class);
        document.body.setAttribute('data-theme', themeName);
        
        // Обновляем CSS переменные
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });
        
        // Сохраняем выбор
        localStorage.setItem('theme', themeName);
        
        // Обновляем иконку переключателя
        this.updateToggleIcon();
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    updateToggleIcon() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;
        
        const icon = this.currentTheme === 'dark' ? 
            '☀️' : '🌙';
        
        toggle.innerHTML = `<span style="font-size: 20px;">${icon}</span>`;
    }
    
    bindEvents() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Автоматическая смена темы по времени суток
        if (window.matchMedia) {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeQuery.addEventListener('change', (e) => {
                if (localStorage.getItem('theme-auto') === 'true') {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
}

// Создаем и инициализируем модуль темы
window.themeModule = new ThemeModule();
document.addEventListener('DOMContentLoaded', () => {
    window.themeModule.init();
});