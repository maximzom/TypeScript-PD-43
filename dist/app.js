// Це головний клас нашого додатка, він містить всю логіку.
class MainApp {
    // constructor - це спеціальний метод, який автоматично викликається при створенні об'єкта.
    constructor() {
        // private означає, що ця змінна доступна тільки всередині цього класу.
        // state - це об'єкт, де ми зберігаємо всі дані нашої програми.
        this.state = {
            currentTheme: 'light', // Початкова тема - світла
            stats: {
                totalUsers: 0,
                totalPosts: 0,
                totalProducts: 0,
                avgRating: 0
            },
            isLoading: true // Спочатку програма завантажується, тому true
        };
        this.init(); // Викликаємо метод init, щоб запустити нашу програму.
    }
    // async означає, що цей метод може виконувати асинхронні операції (чекати).
    // Promise<void> означає, що метод нічого не повертає, але може чекати.
    async init() {
        this.bindEvents(); // Викликаємо метод, який підключає всі кнопки та події.
        this.loadTheme(); // Завантажуємо збережену тему з пам'яті браузера.
        await this.updateStats(); // Оновлюємо статистику, чекаємо поки дані завантажаться.
        this.animateStats(); // Запускаємо анімації для статистичних чисел.
    }
    // Цей метод підключає всі обробники подій (кліки, скрол тощо).
    bindEvents() {
        // Знаходимо кнопку перемикача теми за її ID.
        const themeToggle = document.getElementById('themeToggle');
        // Додаємо обробник події кліку на цю кнопку.
        // Коли користувач клацає на кнопку, викликається метод toggleTheme.
        themeToggle?.addEventListener('click', () => this.toggleTheme());
        // Додаємо обробник події скролу (прокрутки) вікна.
        // Коли користувач скролить сторінку, викликається метод handleScroll.
        window.addEventListener('scroll', () => this.handleScroll());
    }
    // Цей метод викликається кожен раз, коли користувач скролить сторінку.
    handleScroll() {
        // Знаходимо всі елементи на сторінці, які ми хочемо анімувати.
        const elements = document.querySelectorAll('.module-card, .stat-card, .activity-item');
        // Для кожного знайденого елемента...
        elements.forEach(element => {
            // Отримуємо інформацію про позицію елемента на екрані.
            const rect = element.getBoundingClientRect();
            // Перевіряємо, чи елемент знаходиться у видимій області екрана.
            // window.innerHeight - це висота видимого екрана.
            // Якщо елемент знаходиться вище нижнього краю екрана мінус 50 пікселів...
            if (rect.top < window.innerHeight - 50) {
                // Додаємо клас 'fade-in', який робить елемент видимим з анімацією.
                element.classList.add('fade-in');
            }
        });
    }
    // Цей метод завантажує статистичні дані з API.
    async updateStats() {
        this.setState({ isLoading: true }); // Встановлюємо isLoading в true, щоб показати, що йде завантаження.
        try {
            // Робимо три одночасні запити до різних API.
            // Promise.all чекає, поки всі запити завершаться.
            const [usersResponse, postsResponse, photosResponse] = await Promise.all([
                fetch('https://jsonplaceholder.typicode.com/users'), // Запит користувачів
                fetch('https://jsonplaceholder.typicode.com/posts'), // Запит постів
                fetch('https://jsonplaceholder.typicode.com/photos?_limit=20') // Запит фото (обмежуємо 20)
            ]);
            // Перетворюємо відповіді у зрозумілий для JavaScript формат (JSON).
            const users = await usersResponse.json();
            const posts = await postsResponse.json();
            const photos = await photosResponse.json();
            // Генеруємо випадкові рейтинги для кожного продукту (від 3.0 до 5.0).
            const ratings = photos.map(() => parseFloat((Math.random() * 2 + 3).toFixed(1)));
            // Обчислюємо середній рейтинг - сумуємо всі рейтинги та ділимо на їх кількість.
            const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
            // Оновлюємо стан нашої програми з новими даними.
            this.setState({
                stats: {
                    totalUsers: users.length, // Кількість користувачів = довжина масиву users
                    totalPosts: posts.length, // Кількість постів = довжина масиву posts
                    totalProducts: photos.length, // Кількість продуктів = довжина масиву photos
                    avgRating: parseFloat(averageRating.toFixed(1)) // Середній рейтинг, округлений до 1 знаку
                },
                isLoading: false // Завантаження завершено
            });
            this.displayStats(); // Викликаємо метод для відображення статистики на сторінці.
        }
        catch (error) {
            // Якщо сталася помилка (наприклад, немає інтернету)...
            console.error('Помилка завантаження статистики:', error);
            this.setState({ isLoading: false }); // Завантаження завершено (з помилкою)
            this.showError('Не вдалося завантажити статистику.'); // Показуємо повідомлення про помилку
        }
    }
    // Цей метод відображає статистичні дані в HTML елементах.
    displayStats() {
        // Знаходимо HTML елементи за їх ID.
        const totalUsers = document.getElementById('totalUsers');
        const totalPosts = document.getElementById('totalPosts');
        const totalProducts = document.getElementById('totalProducts');
        const avgRating = document.getElementById('avgRating');
        // Якщо елемент знайдено, встановлюємо його текстовий вміст.
        if (totalUsers)
            totalUsers.textContent = this.state.stats.totalUsers.toString();
        if (totalPosts)
            totalPosts.textContent = this.state.stats.totalPosts.toString();
        if (totalProducts)
            totalProducts.textContent = this.state.stats.totalProducts.toString();
        if (avgRating)
            avgRating.textContent = this.state.stats.avgRating.toString();
    }
    // Цей метод додає анімацію для статистичних чисел.
    animateStats() {
        // Знаходимо всі елементи з класом 'stat-value' (числа статистики).
        const stats = document.querySelectorAll('.stat-value');
        // Для кожного елемента...
        stats.forEach((stat, index) => {
            // Встановлюємо таймер з затримкою (200ms між кожним числом).
            setTimeout(() => {
                // Додаємо клас 'count-up', який запускає анімацію рахунку.
                stat.classList.add('count-up');
            }, index * 200); // Перший елемент - 0ms, другий - 200ms, третій - 400ms тощо.
        });
    }
    // Цей метод перемикає тему між світлою та темною.
    toggleTheme() {
        this.setState({
            // Якщо поточна тема 'light', змінюємо на 'dark', і навпаки.
            currentTheme: this.state.currentTheme === 'light' ? 'dark' : 'light'
        });
        this.applyTheme(); // Застосовуємо нову тему до сторінки.
        this.saveTheme(); // Зберігаємо вибір теми в пам'ять браузера.
        this.updateThemeButton(); // Оновлюємо вигляд кнопки перемикача.
    }
    // Цей метод застосовує поточну тему до HTML документа.
    applyTheme() {
        // Встановлюємо атрибут 'data-theme' кореневого елемента HTML.
        // CSS використовує цей атрибут для застосування відповідних стилів.
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
    }
    // Цей метод зберігає вибрану тему в локальному сховищі браузера.
    saveTheme() {
        // localStorage дозволяє зберігати дані між сесіями (після закриття браузера).
        localStorage.setItem('theme', this.state.currentTheme);
    }
    // Цей метод завантажує тему з локального сховища браузера.
    loadTheme() {
        // Отримуємо збережену тему з пам'яті браузера.
        const savedTheme = localStorage.getItem('theme');
        // Якщо тема була збережена раніше...
        if (savedTheme) {
            this.setState({ currentTheme: savedTheme }); // Встановлюємо збережену тему.
        }
        this.applyTheme(); // Застосовуємо тему (або збережену, або стандартну).
        this.updateThemeButton(); // Оновлюємо кнопку перемикача теми.
    }
    // Цей метод оновлює вигляд кнопки перемикача теми.
    updateThemeButton() {
        // Знаходимо кнопку перемикача та іконку всередині неї.
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle?.querySelector('i');
        // Якщо іконка знайдена...
        if (icon) {
            // Для темної теми показуємо іконку сонця (fa-sun).
            if (this.state.currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
            }
            else {
                // Для світлої теми показуємо іконку місяця (fa-moon).
                icon.className = 'fas fa-moon';
            }
        }
    }
    // Цей метод оновлює стан програми.
    // Partial<AppState> означає, що ми можемо передати тільки частину полів стану.
    setState(newState) {
        // ... - оператор spread, який копіює всі властивості об'єкта.
        // Спочатку беремо поточний стан, потім замінюємо його частину новими значеннями.
        this.state = { ...this.state, ...newState };
    }
    // Цей метод показує повідомлення про помилку.
    showError(message) {
        console.error(message); // Виводимо помилку в консоль для розробників.
        alert(message); // Показуємо спливаюче повідомлення для користувача.
    }
}
// Цей код виконується, коли вся HTML сторінка повністю завантажена.
document.addEventListener('DOMContentLoaded', () => {
    // Створюємо новий екземпляр нашого головного класу.
    // Це запускає весь наш додаток.
    new MainApp();
});
export {};
