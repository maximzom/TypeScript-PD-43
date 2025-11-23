// Цей інтерфейс описує форму наших даних, як шаблон для інформації.
// Він каже, які поля мають бути в об'єкті стану та якого типу ці поля.
interface AppState {
    currentTheme: string;        // Тема може бути 'light' (світла) або 'dark' (темна)
    stats: {                    // stats - це об'єкт, що містить статистику
        totalUsers: number;     // Загальна кількість користувачів (число)
        totalPosts: number;     // Загальна кількість постів (число)
        totalProducts: number;  // Загальна кількість продуктів (число)
        avgRating: number;      // Середній рейтинг (число з плаваючою точкою)
    };
    isLoading: boolean;         // Прапорець, який показує, чи йде завантаження (true/false)
}

// Це головний клас нашого додатка, він містить всю логіку.
class MainApp {
    // private означає, що ця змінна доступна тільки всередині цього класу.
    // state - це об'єкт, де ми зберігаємо всі дані нашої програми.
    private state: AppState = {
        currentTheme: 'light',  // Початкова тема - світла
        stats: {                // Початкові значення статистики (нулі)
            totalUsers: 0,
            totalPosts: 0,
            totalProducts: 0,
            avgRating: 0
        },
        isLoading: true         // Спочатку програма завантажується, тому true
    };

    // constructor - це спеціальний метод, який автоматично викликається при створенні об'єкта.
    constructor() {
        this.init(); // Викликаємо метод init, щоб запустити нашу програму.
    }

    // async означає, що цей метод може виконувати асинхронні операції (чекати).
    // Promise<void> означає, що метод нічого не повертає, але може чекати.
    private async init(): Promise<void> {
        this.bindEvents();      // Викликаємо метод, який підключає всі кнопки та події.
        this.loadTheme();       // Завантажуємо збережену тему з пам'яті браузера.
        await this.updateStats(); // Оновлюємо статистику, чекаємо поки дані завантажаться.
        this.animateStats();    // Запускаємо анімації для статистичних чисел.
    }

    // Цей метод підключає всі обробники подій (кліки, скрол тощо).
    private bindEvents(): void {
        // Знаходимо кнопку перемикача теми за її ID.
        const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
        // Додаємо обробник події кліку на цю кнопку.
        // Коли користувач клацає на кнопку, викликається метод toggleTheme.
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Додаємо обробник події скролу (прокрутки) вікна.
        // Коли користувач скролить сторінку, викликається метод handleScroll.
        window.addEventListener('scroll', () => this.handleScroll());
    }

    // Цей метод викликається кожен раз, коли користувач скролить сторінку.
    private handleScroll(): void {
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
    private async updateStats(): Promise<void> {
        this.setState({ isLoading: true }); // Встановлюємо isLoading в true, щоб показати, що йде завантаження.
        
        try {
            // Робимо три одночасні запити до різних API.
            // Promise.all чекає, поки всі запити завершаться.
            const [usersResponse, postsResponse, photosResponse] = await Promise.all([
                fetch('https://jsonplaceholder.typicode.com/users'),     // Запит користувачів
                fetch('https://jsonplaceholder.typicode.com/posts'),     // Запит постів
                fetch('https://jsonplaceholder.typicode.com/photos?_limit=20') // Запит фото (обмежуємо 20)
            ]);

            // Перетворюємо відповіді у зрозумілий для JavaScript формат (JSON).
            const users = await usersResponse.json();
            const posts = await postsResponse.json();
            const photos = await photosResponse.json();

            // Генеруємо випадкові рейтинги для кожного продукту (від 3.0 до 5.0).
            const ratings = photos.map(() => parseFloat((Math.random() * 2 + 3).toFixed(1)));
            // Обчислюємо середній рейтинг - сумуємо всі рейтинги та ділимо на їх кількість.
            const averageRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;

            // Оновлюємо стан нашої програми з новими даними.
            this.setState({
                stats: {
                    totalUsers: users.length,           // Кількість користувачів = довжина масиву users
                    totalPosts: posts.length,           // Кількість постів = довжина масиву posts
                    totalProducts: photos.length,       // Кількість продуктів = довжина масиву photos
                    avgRating: parseFloat(averageRating.toFixed(1)) // Середній рейтинг, округлений до 1 знаку
                },
                isLoading: false // Завантаження завершено
            });

            this.displayStats(); // Викликаємо метод для відображення статистики на сторінці.

        } catch (error) {
            // Якщо сталася помилка (наприклад, немає інтернету)...
            console.error('Помилка завантаження статистики:', error);
            this.setState({ isLoading: false }); // Завантаження завершено (з помилкою)
            this.showError('Не вдалося завантажити статистику.'); // Показуємо повідомлення про помилку
        }
    }

    // Цей метод відображає статистичні дані в HTML елементах.
    private displayStats(): void {
        // Знаходимо HTML елементи за їх ID.
        const totalUsers = document.getElementById('totalUsers');
        const totalPosts = document.getElementById('totalPosts');
        const totalProducts = document.getElementById('totalProducts');
        const avgRating = document.getElementById('avgRating');

        // Якщо елемент знайдено, встановлюємо його текстовий вміст.
        if (totalUsers) totalUsers.textContent = this.state.stats.totalUsers.toString();
        if (totalPosts) totalPosts.textContent = this.state.stats.totalPosts.toString();
        if (totalProducts) totalProducts.textContent = this.state.stats.totalProducts.toString();
        if (avgRating) avgRating.textContent = this.state.stats.avgRating.toString();
    }

    // Цей метод додає анімацію для статистичних чисел.
    private animateStats(): void {
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
    private toggleTheme(): void {
        this.setState({ 
            // Якщо поточна тема 'light', змінюємо на 'dark', і навпаки.
            currentTheme: this.state.currentTheme === 'light' ? 'dark' : 'light' 
        });
        this.applyTheme();  // Застосовуємо нову тему до сторінки.
        this.saveTheme();   // Зберігаємо вибір теми в пам'ять браузера.
        this.updateThemeButton(); // Оновлюємо вигляд кнопки перемикача.
    }

    // Цей метод застосовує поточну тему до HTML документа.
    private applyTheme(): void {
        // Встановлюємо атрибут 'data-theme' кореневого елемента HTML.
        // CSS використовує цей атрибут для застосування відповідних стилів.
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
    }

    // Цей метод зберігає вибрану тему в локальному сховищі браузера.
    private saveTheme(): void {
        // localStorage дозволяє зберігати дані між сесіями (після закриття браузера).
        localStorage.setItem('theme', this.state.currentTheme);
    }

    // Цей метод завантажує тему з локального сховища браузера.
    private loadTheme(): void {
        // Отримуємо збережену тему з пам'яті браузера.
        const savedTheme: string | null = localStorage.getItem('theme');
        // Якщо тема була збережена раніше...
        if (savedTheme) {
            this.setState({ currentTheme: savedTheme }); // Встановлюємо збережену тему.
        }
        this.applyTheme();     // Застосовуємо тему (або збережену, або стандартну).
        this.updateThemeButton(); // Оновлюємо кнопку перемикача теми.
    }

    // Цей метод оновлює вигляд кнопки перемикача теми.
    private updateThemeButton(): void {
        // Знаходимо кнопку перемикача та іконку всередині неї.
        const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
        const icon = themeToggle?.querySelector('i') as HTMLElement;
        
        // Якщо іконка знайдена...
        if (icon) {
            // Для темної теми показуємо іконку сонця (fa-sun).
            if (this.state.currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                // Для світлої теми показуємо іконку місяця (fa-moon).
                icon.className = 'fas fa-moon';
            }
        }
    }

    // Цей метод оновлює стан програми.
    // Partial<AppState> означає, що ми можемо передати тільки частину полів стану.
    private setState(newState: Partial<AppState>): void {
        // ... - оператор spread, який копіює всі властивості об'єкта.
        // Спочатку беремо поточний стан, потім замінюємо його частину новими значеннями.
        this.state = { ...this.state, ...newState };
    }

    // Цей метод показує повідомлення про помилку.
    private showError(message: string): void {
        console.error(message); // Виводимо помилку в консоль для розробників.
        alert(message);         // Показуємо спливаюче повідомлення для користувача.
    }
}

// Цей код виконується, коли вся HTML сторінка повністю завантажена.
document.addEventListener('DOMContentLoaded', () => {
    // Створюємо новий екземпляр нашого головного класу.
    // Це запускає весь наш додаток.
    new MainApp();
});

// export {}; робить цей файл модулем TypeScript.
// Це необхідно для ізоляції коду та уникнення конфліктів імен.
export {};