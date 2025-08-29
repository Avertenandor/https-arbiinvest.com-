// ========================================
// ArbiInvest - Менеджер темы
// ========================================

export class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themes = {
            dark: {
                name: 'Темная',
                class: 'theme-dark',
                colors: {
                    primary: '#0c0d0e',
                    secondary: '#151618',
                    accent: '#6366f1'
                }
            },
            light: {
                name: 'Светлая',
                class: 'theme-light',
                colors: {
                    primary: '#ffffff',
                    secondary: '#f5f5f5',
                    accent: '#6366f1'
                }
            },
            auto: {
                name: 'Системная',
                class: 'theme-auto'
            }
        };
        
        this.init();
    }
    
    init() {
        // Загружаем сохраненную тему
        const savedTheme = localStorage.getItem('arbi_theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Слушаем изменения системной темы
        this.watchSystemTheme();
        
        // Добавляем обработчики для переключателей темы
        this.bindToggleButtons();
    }
    
    // Установка темы
    setTheme(theme) {
        if (!this.themes[theme]) {
            theme = 'dark';
        }
        
        this.currentTheme = theme;
        
        // Удаляем все классы тем
        Object.values(this.themes).forEach(t => {
            document.documentElement.classList.remove(t.class);
        });
        
        // Добавляем класс текущей темы
        document.documentElement.classList.add(this.themes[theme].class);
        
        // Обновляем data-атрибут
        document.documentElement.setAttribute('data-theme', theme);
        
        // Обновляем мета-тег theme-color
        this.updateThemeColor(theme);
        
        // Сохраняем в localStorage
        localStorage.setItem('arbi_theme', theme);
        
        // Вызываем событие смены темы
        this.dispatchThemeChange(theme);
    }
    
    // Переключение темы
    toggleTheme() {
        const themes = Object.keys(this.themes);
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.setTheme(nextTheme);
    }
    
    // Получение текущей темы
    getTheme() {
        return this.currentTheme;
    }
    
    // Проверка темной темы
    isDark() {
        if (this.currentTheme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return this.currentTheme === 'dark';
    }
    
    // Слежение за системной темой
    watchSystemTheme() {
        if (!window.matchMedia) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            if (this.currentTheme === 'auto') {
                this.updateAutoTheme(e.matches);
            }
        });
        
        // Первоначальная проверка
        if (this.currentTheme === 'auto') {
            this.updateAutoTheme(mediaQuery.matches);
        }
    }
    
    // Обновление автоматической темы
    updateAutoTheme(isDark) {
        if (isDark) {
            document.documentElement.classList.add('theme-dark');
            document.documentElement.classList.remove('theme-light');
        } else {
            document.documentElement.classList.add('theme-light');
            document.documentElement.classList.remove('theme-dark');
        }
        
        this.updateThemeColor(isDark ? 'dark' : 'light');
    }
    
    // Обновление мета-тега theme-color
    updateThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            const color = theme === 'dark' ? '#0c0d0e' : '#ffffff';
            metaThemeColor.setAttribute('content', color);
        }
    }
    
    // Привязка кнопок переключения темы
    bindToggleButtons() {
        const buttons = document.querySelectorAll('[data-theme-toggle]');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.themeToggle;
                
                if (theme) {
                    this.setTheme(theme);
                } else {
                    this.toggleTheme();
                }
                
                // Обновляем иконку кнопки
                this.updateButtonIcon(button);
            });
        });
    }
    
    // Обновление иконки кнопки
    updateButtonIcon(button) {
        const icon = button.querySelector('.theme-icon');
        if (!icon) return;
        
        const icons = {
            dark: '🌙',
            light: '☀️',
            auto: '🌓'
        };
        
        icon.textContent = icons[this.currentTheme] || icons.dark;
    }
    
    // Отправка события смены темы
    dispatchThemeChange(theme) {
        const event = new CustomEvent('themechange', {
            detail: { theme }
        });
        
        window.dispatchEvent(event);
    }
    
    // Применение пользовательских цветов
    setCustomColors(colors) {
        const root = document.documentElement;
        
        Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });
    }
    
    // Сброс пользовательских цветов
    resetCustomColors() {
        const root = document.documentElement;
        const customProps = Array.from(root.style).filter(prop => prop.startsWith('--color-'));
        
        customProps.forEach(prop => {
            root.style.removeProperty(prop);
        });
    }
    
    // Получение CSS переменной
    getCSSVariable(variable) {
        return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    }
    
    // Установка CSS переменной
    setCSSVariable(variable, value) {
        document.documentElement.style.setProperty(variable, value);
    }
    
    // Анимация смены темы
    animateThemeChange() {
        document.documentElement.classList.add('theme-transition');
        
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 300);
    }
    
    // Предзагрузка темы
    preloadTheme(theme) {
        // Здесь можно предзагрузить ресурсы для темы
        // Например, изображения или шрифты
    }
    
    // Экспорт настроек темы
    exportSettings() {
        return {
            theme: this.currentTheme,
            customColors: this.getCustomColors()
        };
    }
    
    // Импорт настроек темы
    importSettings(settings) {
        if (settings.theme) {
            this.setTheme(settings.theme);
        }
        
        if (settings.customColors) {
            this.setCustomColors(settings.customColors);
        }
    }
    
    // Получение пользовательских цветов
    getCustomColors() {
        const root = document.documentElement;
        const customColors = {};
        
        Array.from(root.style).forEach(prop => {
            if (prop.startsWith('--color-')) {
                const key = prop.replace('--color-', '');
                customColors[key] = root.style.getPropertyValue(prop);
            }
        });
        
        return customColors;
    }
    
    // Уничтожение менеджера
    destroy() {
        // Удаляем обработчики
        const buttons = document.querySelectorAll('[data-theme-toggle]');
        buttons.forEach(button => {
            button.removeEventListener('click', this.toggleTheme);
        });
    }
}

// Экспорт по умолчанию
export default ThemeManager;
