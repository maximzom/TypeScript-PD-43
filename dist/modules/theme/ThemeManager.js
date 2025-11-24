// Менеджер теми для керування світлою/темною темою інтерфейсу
// Експортуємо клас для використання в інших модулях
export class ThemeManager {
    // Конструктор класу викликається при створенні нового об'єкта ThemeManager
    constructor() {
        // Приватне поле для зберігання поточної теми
        // Значення за замовчуванням - 'light' (світла тема)
        this.currentTheme = 'light';
        // Викликаємо метод завантаження теми з локального сховища
        this.loadTheme();
    }
    // Публічний метод для перемикання теми (звітлої на темну і навпаки)
    // void означає, що метод не повертає значення
    toggleTheme() {
        // Змінюємо поточну тему на протилежну
        // Якщо зараз 'light' - стає 'dark', якщо 'dark' - стає 'light'
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        // Застосовуємо нову тему до документа
        this.applyTheme();
        // Зберігаємо вибір теми в локальне сховище браузера
        this.saveTheme();
        // Оновлюємо вигляд кнопки перемикача теми
        this.updateThemeButton();
    }
    // Публічний метод для застосування поточної теми до документа
    applyTheme() {
        // Встановлюємо атрибут 'data-theme' кореневого елемента документа (html)
        // Цей атрибут використовується в CSS для застосування стилів теми
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
    // Публічний метод для збереження теми в локальне сховище браузера
    saveTheme() {
        // Зберігаємо поточну тему під ключем 'theme' в localStorage
        // Це дозволяє зберігати вибір користувача між сесіями
        localStorage.setItem('theme', this.currentTheme);
    }
    // Публічний метод для завантаження теми з локального сховища
    loadTheme() {
        // Отримуємо збережену тему з localStorage за ключем 'theme'
        // Тип string | null - може повернути рядок або null, якщо значення не знайдено
        const savedTheme = localStorage.getItem('theme');
        // Перевіряємо чи є збережена тема
        if (savedTheme) {
            // Якщо тема знайдена, встановлюємо її як поточну
            this.currentTheme = savedTheme;
        }
        // Застосовуємо тему (або завантажену, або за замовчуванням)
        this.applyTheme();
    }
    // Публічний метод для оновлення вигляду кнопки перемикача теми
    updateThemeButton() {
        // Знаходимо кнопку перемикача теми в DOM за її ID
        const themeToggle = document.getElementById('themeToggle');
        // Знаходимо елемент іконки всередині кнопки (перший елемент <i>)
        const icon = themeToggle?.querySelector('i');
        // Перевіряємо чи іконка існує
        if (icon) {
            // В залежності від поточної теми змінюємо клас іконки
            if (this.currentTheme === 'dark') {
                // Для темної теми встановлюємо іконку сонця (fa-sun)
                icon.className = 'fas fa-sun';
            }
            else {
                // Для світлої теми встановлюємо іконку місяця (fa-moon)
                icon.className = 'fas fa-moon';
            }
        }
    }
    // Публічний метод для отримання поточної теми
    // Повертає рядок - назву поточної теми
    getCurrentTheme() {
        return this.currentTheme;
    }
}
