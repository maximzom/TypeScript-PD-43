// Імпортуємо тип AppState з файлу із типами
// Це дозволяє використовувати структуру стану програми в цьому файлі
import { AppState } from '../../types/index.js';

// Імпортуємо клас ThemeManager з модуля керування темами
// Він відповідає за перемикання світлої/темної теми
import { ThemeManager } from '../theme/ThemeManager.js';

// Імпортуємо допоміжну функцію showError з утиліт
// Ця функція показує повідомлення про помилки користувачам
import { showError } from '../../utils/helpers.js';

// Оголошуємо головний клас AppManager для керування додатком
// Ключове слово export дозволяє використовувати цей клас в інших модулях
export class AppManager {
    // Приватне поле state для зберігання стану додатку
    // Вказуємо тип AppState для контролю структури об'єкта
    private state: AppState = {
        // Поточна тема інтерфейсу (за замовчуванням світла)
        currentTheme: 'light',
        // Об'єкт для статистичних даних з початковими нульовими значеннями
        stats: {
            totalUsers: 0,     // Загальна кількість користувачів
            totalPosts: 0,     // Загальна кількість постів
            totalProducts: 0,  // Загальна кількість товарів
            avgRating: 0       // Середній рейтинг
        },
        // Прапорець завантаження (true - дані ще завантажуються)
        isLoading: true
    };

    // Приватне поле для екземпляра менеджера тем
    // Використовуємо композицію для делегування відповідальності
    private themeManager: ThemeManager;

    // Конструктор класу викликається при створенні нового об'єкта
    constructor() {
        // Створюємо новий екземпляр ThemeManager
        this.themeManager = new ThemeManager();
        // Викликаємо метод ініціалізації додатку
        this.init();
    }

    // Приватний асинхронний метод ініціалізації
    // Promise<void> означає, що функція не повертає значення
    private async init(): Promise<void> {
        // Налаштовуємо обробники подій
        this.bindEvents();
        // Оновлюємо статистику (чекаємо на завершення)
        await this.updateStats();
        // Запускаємо анімацію статистичних даних
        this.animateStats();
    }

    // Метод для прив'язки обробників подій до елементів DOM
    private bindEvents(): void {
        // Знаходимо кнопку перемикача теми в DOM
        // as HTMLButtonElement - приведення типу для TypeScript
        const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
        
        // Перевіряємо чи існує елемент (оператор ?.) і додаємо обробник кліку
        // При кліку викликаємо toggleTheme() через стрілочну функцію для коректного this
        themeToggle?.addEventListener('click', () => this.themeManager.toggleTheme());

        // Додаємо обробник події прокручування вікна
        window.addEventListener('scroll', () => this.handleScroll());
    }

    // Обробник події прокручування сторінки
    private handleScroll(): void {
        // Знаходимо всі елементи, які мають анімуватись при скролі
        const elements = document.querySelectorAll('.module-card, .stat-card, .activity-item');
        
        // Для кожного знайденого елемента
        elements.forEach(element => {
            // Отримуємо геометричні параметри елемента відносно вікна перегляду
            const rect = element.getBoundingClientRect();
            // Перевіряємо чи елемент знаходиться у видимій області (з запасом 50px знизу)
            if (rect.top < window.innerHeight - 50) {
                // Додаємо CSS-клас для запуску анімації появи
                element.classList.add('fade-in');
            }
        });
    }

    // Асинхронний метод оновлення статистичних даних
    private async updateStats(): Promise<void> {
        // Встановлюємо стан завантаження в true
        this.setState({ isLoading: true });
        
        // Блок try-catch для обробки помилок при завантаженні даних
        try {
            // Одночасно завантажуємо дані з трьох джерел
            // Promise.all чекає на завершення всіх запитів
            const [usersResponse, postsResponse, photosResponse] = await Promise.all([
                fetch('https://jsonplaceholder.typicode.com/users'),    // Отримуємо користувачів
                fetch('https://jsonplaceholder.typicode.com/posts'),    // Отримуємо пости
                fetch('https://jsonplaceholder.typicode.com/photos?_limit=20')  // Отримуємо фото (обмежуємо 20)
            ]);

            // Перетворюємо відповіді в JSON паралельно
            const users = await usersResponse.json();
            const posts = await postsResponse.json();
            const photos = await photosResponse.json();

            // Генеруємо випадкові рейтинги для кожного фото
            // map створює новий масив з рейтингами від 3.0 до 5.0
            const ratings = photos.map(() => parseFloat((Math.random() * 2 + 3).toFixed(1)));
            // Обчислюємо середній рейтинг
            const averageRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;

            // Оновлюємо стан з новими даними
            this.setState({
                stats: {
                    totalUsers: users.length,      // Кількість користувачів
                    totalPosts: posts.length,      // Кількість постів
                    totalProducts: photos.length,  // Кількість товарів (фото)
                    avgRating: parseFloat(averageRating.toFixed(1))  // Середній рейтинг з одним знаком після коми
                },
                isLoading: false  // Скидаємо стан завантаження
            });

            // Відображаємо оновлену статистику в інтерфейсі
            this.displayStats();

        } catch (error) {
            // Обробка помилок - логуємо в консоль та показуємо повідомлення
            console.error('Помилка завантаження статистики:', error);
            // Скидаємо стан завантаження навіть при помилці
            this.setState({ isLoading: false });
            // Показуємо повідомлення про помилку користувачеві
            showError('Не вдалося завантажити статистику.');
        }
    }

    // Метод для оновлення статистики в DOM елементах
    private displayStats(): void {
        // Знаходимо всі елементи для відображення статистики
        const totalUsers = document.getElementById('totalUsers');
        const totalPosts = document.getElementById('totalPosts');
        const totalProducts = document.getElementById('totalProducts');
        const avgRating = document.getElementById('avgRating');

        // Оновлюємо текстовий вміст кожного елемента, якщо він існує
        if (totalUsers) totalUsers.textContent = this.state.stats.totalUsers.toString();
        if (totalPosts) totalPosts.textContent = this.state.stats.totalPosts.toString();
        if (totalProducts) totalProducts.textContent = this.state.stats.totalProducts.toString();
        if (avgRating) avgRating.textContent = this.state.stats.avgRating.toString();
    }

    // Метод для анімації статистичних значень
    private animateStats(): void {
        // Знаходимо всі елементи з класом 'stat-value'
        const stats = document.querySelectorAll('.stat-value');
        // Для кожного елемента додаємо анімацію з затримкою
        stats.forEach((stat, index) => {
            // Встановлюємо таймаут зі зростаючою затримкою для кожного наступного елемента
            setTimeout(() => {
                // Додаємо CSS-клас який запускає анімацію
                stat.classList.add('count-up');
            }, index * 200);  // Затримка 200мс між кожним елементом
        });
    }

    // Метод для оновлення стану (аналог setState в React)
    // Приймає частковий об'єкт стану (тільки ті поля які треба оновити)
    private setState(newState: Partial<AppState>): void {
        // Оновлюємо стан злиттям поточного стану та нових значень
        // ... - оператор spread, який розпинає об'єкти
        this.state = { ...this.state, ...newState };
    }
}