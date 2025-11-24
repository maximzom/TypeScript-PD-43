// Імпортуємо типи Post, Author та PostsState з файлу типів
// Це забезпечує строгу типізацію для даних постів, авторів та стану менеджера
import { Post, Author, PostsState } from '../../types/index.js';

// Імпортуємо клас ThemeManager для керування темами інтерфейсу
// Він відповідає за перемикання між світлою та темною темами
import { ThemeManager } from '../theme/ThemeManager.js';

// Імпортуємо набір допоміжних функцій з утиліт
// showElement - показує елемент на сторінці
// hideElement - ховає елемент зі сторінки  
// showError - показує повідомлення про помилку
// showToast - показує спливаюче повідомлення
import { showElement, hideElement, showError, showToast } from '../../utils/helpers.js';

// Оголошуємо головний клас для керування постами
// Ключове слово export дозволяє використовувати цей клас в інших модулях
export class PostsManager {
    // Приватне поле state для зберігання стану менеджера постів
    // Вказуємо тип PostsState для контролю структури об'єкта
    private state: PostsState = {
        posts: [],              // Масив всіх завантажених постів
        filteredPosts: [],      // Масив постів після застосування фільтрів
        users: [],              // Масив всіх авторів постів
        searchQuery: '',        // Пошуковий запит користувача
        categoryFilter: 'all',  // Обраний фільтр категорії
        sortBy: 'newest',       // Спосіб сортування постів
        featuredOnly: false,    // Прапорець "тільки рекомендовані"
        viewMode: 'card',       // Режим відображення (картки або компактний)
        currentTheme: 'light',  // Поточна тема інтерфейсу
        isLoading: false        // Стан завантаження даних
    };

    // Приватне поле для екземпляра менеджера тем
    // Використовуємо композицію для делегування відповідальності за теми
    private themeManager: ThemeManager;

    // Конструктор класу викликається при створенні нового об'єкта
    constructor() {
        // Створюємо новий екземпляр ThemeManager для керування темами
        this.themeManager = new ThemeManager();
        // Викликаємо метод ініціалізації менеджера постів
        this.init();
    }

    // Приватний асинхронний метод ініціалізації менеджера постів
    // Promise<void> означає, що функція не повертає значення
    private async init(): Promise<void> {
        // Налаштовуємо обробники подій для елементів інтерфейсу
        this.bindEvents();
        // Завантажуємо збережену тему з локального сховища браузера
        this.loadTheme();
        // Завантажуємо пости та авторів з API (чекаємо на завершення)
        await this.loadData();
        // Застосовуємо фільтри та сортування до завантажених постів
        this.applyFiltersAndSort();
    }

    // Приватний асинхронний метод завантаження даних з зовнішнього API
    private async loadData(): Promise<void> {
        // Встановлюємо стан завантаження в true для показу індикатора завантаження
        this.setState({ isLoading: true });
        
        // Блок try-catch для обробки можливих помилок при завантаженні даних
        try {
            // Виконуємо паралельні запити до JSONPlaceholder API для отримання постів та авторів
            // Promise.all чекає на завершення всіх запитів одночасно
            const [postsResponse, usersResponse] = await Promise.all([
                fetch('https://jsonplaceholder.typicode.com/posts'),    // Запит для отримання постів
                fetch('https://jsonplaceholder.typicode.com/users')     // Запит для отримання авторів
            ]);

            // Перетворюємо відповіді сервера у JSON формат
            const posts = await postsResponse.json();
            const users = await usersResponse.json();

            // Обробляємо отримані пости та додаємо додаткові поля для багатшого функціоналу
            // slice(0, 20) обмежує кількість постів 20 елементами
            const enrichedPosts = posts.slice(0, 20).map((post: Post, index: number) => ({
                ...post,  // Копіюємо всі властивості оригінального об'єкта поста
                
                // Додаємо категорію з циклічного масиву (index % 5 забезпечує циклічність)
                category: ['Technology', 'Science', 'Arts', 'Business', 'Health'][index % 5],
                
                // Вибираємо 1-4 випадкові теги для поста
                tags: ['tech', 'science', 'innovation', 'news'].slice(0, (index % 3) + 1),
                
                // Генеруємо дату створення поста (випадкова дата в 2023 році)
                createdAt: new Date(2023, index % 12, (index % 28) + 1).toISOString(),
                
                // Генеруємо випадкову кількість лайків від 0 до 99
                likes: Math.floor(Math.random() * 100),
                
                // Генеруємо випадкову кількість коментарів від 0 до 49
                comments: Math.floor(Math.random() * 50),
                
                // Генеруємо випадковий час читання від 1 до 10 хвилин
                readTime: Math.floor(Math.random() * 10) + 1,
                
                // Кожен четвертий пост робимо рекомендованим (25% ймовірність)
                featured: index % 4 === 0
            }));

            // Обробляємо отриманих авторів та додаємо аватари
            const enrichedUsers = users.map((user: Author, index: number) => ({
                ...user,  // Копіюємо всі властивості оригінального об'єкта автора
                
                // Генеруємо URL аватара з сервісу pravatar.cc з циклічними зображеннями
                avatar: `https://i.pravatar.cc/150?img=${index + 1}`
            }));

            // Оновлюємо стан з новими даними постів та авторів
            this.setState({
                posts: enrichedPosts,           // Зберігаємо всі пости
                users: enrichedUsers,           // Зберігаємо всіх авторів
                filteredPosts: enrichedPosts,   // Спочатку всі пости відфільтровані
                isLoading: false                // Скидаємо стан завантаження
            });

        } catch (error) {
            // Обробка помилок - логуємо в консоль та показуємо повідомлення користувачеві
            console.error('Error loading data:', error);
            // Скидаємо стан завантаження навіть при помилці
            this.setState({ isLoading: false });
            // Показуємо повідомлення про помилку користувачеві
            showError('Failed to load posts. Please try again later.');
        }
    }

    // Приватний метод для прив'язки обробників подій до елементів DOM
    private bindEvents(): void {
        // Знаходимо кнопку перемикача теми в DOM та вказуємо тип HTMLButtonElement
        const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
        // Додаємо обробник кліку на кнопку теми (перевіряємо чи існує елемент)
        themeToggle?.addEventListener('click', () => this.themeManager.toggleTheme());

        // Знаходимо поле пошуку та кнопку очищення пошуку
        const postSearch = document.getElementById('postSearch') as HTMLInputElement;
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        // Додаємо обробники подій для пошуку та очищення
        postSearch?.addEventListener('input', (e) => this.handleSearch(e));
        clearSearch?.addEventListener('click', () => this.clearSearch());

        // Знаходимо всі елементи фільтрів та сортування
        const categoryFilter = document.getElementById('categoryFilter') as HTMLSelectElement;
        const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
        const featuredOnly = document.getElementById('featuredOnly') as HTMLInputElement;

        // Додаємо обробники змін для кожного фільтра
        categoryFilter?.addEventListener('change', (e) => this.handleCategoryFilter(e));
        sortSelect?.addEventListener('change', (e) => this.handleSortChange(e));
        featuredOnly?.addEventListener('change', (e) => this.handleFeaturedChange(e));

        // Знаходимо кнопки перемикання режиму перегляду
        const cardViewBtn = document.getElementById('cardViewBtn') as HTMLButtonElement;
        const compactViewBtn = document.getElementById('compactViewBtn') as HTMLButtonElement;
        // Додаємо обробники кліку для перемикання режимів перегляду
        cardViewBtn?.addEventListener('click', () => this.setViewMode('card'));
        compactViewBtn?.addEventListener('click', () => this.setViewMode('compact'));

        // Знаходимо кнопку скидання фільтрів та додаємо обробник кліку
        const resetFilters = document.getElementById('resetFilters') as HTMLButtonElement;
        resetFilters?.addEventListener('click', () => this.resetFilters());

        // Знаходимо елементи модального вікна та кнопку закриття
        const closeModal = document.getElementById('closePostModal') as HTMLButtonElement;
        const modal = document.getElementById('postModal') as HTMLDivElement;
        // Додаємо обробники для закриття модального вікна
        closeModal?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => this.handleModalClick(e));

        // Додаємо обробник події прокручування вікна для анімації карток
        window.addEventListener('scroll', () => this.handleScroll());
    }

    // Обробник події прокручування сторінки для анімації карток постів
    private handleScroll(): void {
        // Знаходимо всі картки постів на сторінці
        const cards = document.querySelectorAll('.post-card');
        // Для кожної картки перевіряємо чи вона у видимій області
        cards.forEach(card => {
            // Отримуємо геометричні параметри картки відносно вікна перегляду
            const rect = card.getBoundingClientRect();
            // Перевіряємо чи картка знаходиться у видимій області (з запасом 100px знизу)
            if (rect.top < window.innerHeight - 100) {
                // Додаємо CSS-клас для запуску анімації появи
                card.classList.add('visible');
            }
        });
    }

    // Обробник події введення тексту в поле пошуку постів
    private handleSearch(event: Event): void {
        // Отримуємо елемент input з події
        const input = event.target as HTMLInputElement;
        // Оновлюємо стан пошукового запиту (переводимо в нижній регістр для нечутливого пошуку)
        this.setState({ searchQuery: input.value.toLowerCase() });
        
        // Знаходимо кнопку очищення пошуку
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        // Якщо є текст пошуку - показуємо кнопку очищення, інакше ховаємо
        if (this.state.searchQuery) {
            showElement(clearSearch);
        } else {
            hideElement(clearSearch);
        }
        
        // Застосовуємо фільтри та сортування з оновленими параметрами
        this.applyFiltersAndSort();
    }

    // Метод для очищення поля пошуку постів
    private clearSearch(): void {
        // Знаходимо поле пошуку в DOM
        const postSearch = document.getElementById('postSearch') as HTMLInputElement;
        // Очищаємо значення поля пошуку
        if (postSearch) postSearch.value = '';
        // Оновлюємо стан - очищуємо пошуковий запит
        this.setState({ searchQuery: '' });
        
        // Знаходимо кнопку очищення пошуку та ховаємо її
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        hideElement(clearSearch);
        
        // Застосовуємо фільтри та сортування з очищеним пошуком
        this.applyFiltersAndSort();
    }

    // Обробник зміни фільтра категорії постів
    private handleCategoryFilter(event: Event): void {
        // Отримуємо елемент select з події
        const select = event.target as HTMLSelectElement;
        // Оновлюємо стан з обраною категорією
        this.setState({ categoryFilter: select.value });
        // Застосовуємо фільтри з новими параметрами
        this.applyFiltersAndSort();
    }

    // Обробник зміни способу сортування постів
    private handleSortChange(event: Event): void {
        // Отримуємо елемент select з події
        const select = event.target as HTMLSelectElement;
        // Оновлюємо стан з обраним способом сортування
        this.setState({ sortBy: select.value });
        // Застосовуємо фільтри та сортування з новими параметрами
        this.applyFiltersAndSort();
    }

    // Обробник зміни прапорця "тільки рекомендовані"
    private handleFeaturedChange(event: Event): void {
        // Отримуємо елемент checkbox з події
        const checkbox = event.target as HTMLInputElement;
        // Оновлюємо стан з значенням прапорця рекомендованих постів
        this.setState({ featuredOnly: checkbox.checked });
        // Застосовуємо фільтри з новими параметрами
        this.applyFiltersAndSort();
    }

    // Основний метод для застосування фільтрів та сортування до постів
    private applyFiltersAndSort(): void {
        // Фільтруємо пости на основі всіх активних фільтрів
        let filtered = this.state.posts.filter(post => {
            // Перевіряємо відповідність пошуковому запиту
            const matchesSearch = !this.state.searchQuery || 
                // Пошук в заголовку поста
                post.title.toLowerCase().includes(this.state.searchQuery) ||
                // Пошук в тексті поста
                post.body.toLowerCase().includes(this.state.searchQuery) ||
                // Пошук в тегах поста (перевіряємо чи хоча б один тег містить запит)
                post.tags!.some(tag => tag.toLowerCase().includes(this.state.searchQuery));

            // Перевіряємо відповідність обраній категорії
            const matchesCategory = this.state.categoryFilter === 'all' || 
                post.category === this.state.categoryFilter;

            // Перевіряємо відповідність фільтру рекомендованих постів
            const matchesFeatured = !this.state.featuredOnly || post.featured;

            // Пост включається в результат якщо відповідає всім умовам
            return matchesSearch && matchesCategory && matchesFeatured;
        });

        // Сортуємо відфільтровані пости згідно обраного способу сортування
        filtered.sort((a, b) => {
            // Використовуємо switch для різних способів сортування
            switch (this.state.sortBy) {
                case 'newest': 
                    // Сортування за датою створення (найновіші перші)
                    return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
                case 'oldest': 
                    // Сортування за датою створення (найстаріші перші)
                    return new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime();
                case 'popular': 
                    // Сортування за популярністю (сума лайків та коментарів)
                    return (b.likes! + b.comments!) - (a.likes! + a.comments!);
                case 'title-asc': 
                    // Сортування за алфавітом (A-Z)
                    return a.title.localeCompare(b.title);
                default: return 0;  // Стандартне сортування (без змін)
            }
        });

        // Оновлюємо стан з відфільтрованими та відсортованими постами
        this.setState({ filteredPosts: filtered });
        // Відображаємо оновлений список постів
        this.displayPosts();
        // Показуємо або ховаємо стан "немає результатів"
        this.toggleEmptyState();
    }

    // Метод для відображення постів в інтерфейсі
    private displayPosts(): void {
        // Знаходимо контейнер для постів та індикатор завантаження
        const postsContainer = document.getElementById('postsContainer');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        // Якщо дані ще завантажуються, показуємо індикатор та ховаємо контейнер
        if (this.state.isLoading) {
            showElement(loadingSpinner!);        // Використовуємо non-null assertion
            hideElement(postsContainer!);
            return;  // Виходимо з методу, щоб не відображати пости
        }
        
        // Коли дані завантажились, ховаємо індикатор та показуємо контейнер
        hideElement(loadingSpinner!);
        showElement(postsContainer!);
        
        // Якщо контейнер не знайдено, виходимо з методу
        if (!postsContainer) return;
        
        // Встановлюємо CSS клас контейнера в залежності від режиму перегляду
        postsContainer.className = this.state.viewMode === 'compact' ? 'posts-grid compact-view' : 'posts-grid';
        
        // Генеруємо HTML для всіх відфільтрованих постів
        postsContainer.innerHTML = this.state.filteredPosts.map(post => {
            // Знаходимо автора поста за userId
            const author = this.state.users.find(user => user.id === post.userId);
            // Встановлюємо ім'я автора або "Unknown Author" якщо автор не знайдений
            const authorName = author ? author.name : 'Unknown Author';
            // Встановлюємо аватар автора або стандартний аватар якщо автор не знайдений
            const authorAvatar = author ? author.avatar : 'https://i.pravatar.cc/150?img=1';
            // Форматуємо дату створення поста в локальний формат
            const date = new Date(post.createdAt!).toLocaleDateString();

            // Якщо обраний компактний режим перегляду
            if (this.state.viewMode === 'compact') {
                return `
                    <div class="post-card compact" data-post-id="${post.id}">
                        <div class="post-header-compact">
                            <img src="${authorAvatar}" alt="${authorName}" class="author-avatar">
                            <div class="post-meta-compact">
                                <span class="author-name">${authorName}</span>
                                <span class="post-date">${date}</span>
                            </div>
                            ${post.featured ? '<span class="featured-badge">Featured</span>' : ''}
                        </div>
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-excerpt">${post.body.substring(0, 100)}...</p>
                        <div class="post-stats-compact">
                            <span class="post-stat"><i class="fas fa-heart"></i> ${post.likes}</span>
                            <span class="post-stat"><i class="fas fa-comment"></i> ${post.comments}</span>
                            <span class="post-category">${post.category}</span>
                        </div>
                    </div>
                `;
            }

            // Стандартний режим перегляду (картки)
            return `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-header">
                        <span class="post-category">${post.category}</span>
                        ${post.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <div class="author-info">
                            <img src="${authorAvatar}" alt="${authorName}" class="author-avatar">
                            <span class="author-name">${authorName}</span>
                        </div>
                        <span class="post-date">${date}</span>
                        <span class="read-time">${post.readTime} min read</span>
                    </div>
                    <p class="post-body">${post.body}</p>
                    <div class="post-tags">
                        ${post.tags!.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="post-stats">
                        <span class="post-stat"><i class="fas fa-heart"></i> ${post.likes}</span>
                        <span class="post-stat"><i class="fas fa-comment"></i> ${post.comments}</span>
                        <span class="post-stat"><i class="fas fa-clock"></i> ${post.readTime} min</span>
                    </div>
                </div>
            `;
        }).join('');  // join('') перетворює масив рядків в один рядок

        // Знаходимо всі створені картки постів
        const postCards = document.querySelectorAll('.post-card');
        // Для кожної картки додаємо обробник кліку для відкриття деталей
        postCards.forEach(card => {
            card.addEventListener('click', () => {
                // Отримуємо ID поста з атрибуту data-post-id
                const postId: number = parseInt(card.getAttribute('data-post-id') || '0');
                // Показуємо детальну інформацію про пост
                this.showPostDetails(postId);
            });
        });

        // Запускаємо анімацію появи карток з невеликою затримкою
        setTimeout(() => this.animateCards(), 100);
    }

    // Метод для анімації появи карток постів
    private animateCards(): void {
        // Знаходимо всі картки постів
        const cards = document.querySelectorAll('.post-card');
        // Для кожної картки додаємо анімацію з затримкою
        cards.forEach((card, index) => {
            // Встановлюємо таймаут зі зростаючою затримкою для кожного наступного елемента
            setTimeout(() => {
                // Додаємо CSS-клас який запускає анімацію появи
                card.classList.add('fade-in');
            }, index * 100);  // Затримка 100мс між кожним елементом
        });
    }

    // Метод для відображення детальної інформації про пост в модальному вікні
    private showPostDetails(postId: number): void {
        // Знаходимо пост за ID
        const post = this.state.posts.find(p => p.id === postId);
        // Якщо пост не знайдено, виходимо з методу
        if (!post) return;

        // Знаходимо автора поста за userId
        const author = this.state.users.find(user => user.id === post.userId);
        // Встановлюємо ім'я автора або "Unknown Author" якщо автор не знайдений
        const authorName = author ? author.name : 'Unknown Author';
        // Встановлюємо аватар автора або стандартний аватар якщо автор не знайдений
        const authorAvatar = author ? author.avatar : 'https://i.pravatar.cc/150?img=1';
        // Форматуємо дату створення поста в локальний формат
        const date = new Date(post.createdAt!).toLocaleDateString();

        // Знаходимо елементи модального вікна
        const modal = document.getElementById('postModal') as HTMLDivElement;
        const modalTitle = document.getElementById('postModalTitle') as HTMLHeadingElement;
        const modalContent = document.getElementById('postModalContent') as HTMLDivElement;

        // Встановлюємо заголовок модального вікна з іконкою
        modalTitle.innerHTML = `<i class="fas fa-newspaper"></i> ${post.title}`;
        // Генеруємо вміст модального вікна з детальною інформацією про пост
        modalContent.innerHTML = `
            <div class="post-details-modal">
                <div class="post-header-modal">
                    <div class="author-info-modal">
                        <img src="${authorAvatar}" alt="${authorName}" class="author-avatar-large">
                        <div class="author-details">
                            <h4>${authorName}</h4>
                            <span class="post-date">${date}</span>
                        </div>
                    </div>
                    <div class="post-meta-modal">
                        <span class="post-category">${post.category}</span>
                        ${post.featured ? '<span class="featured-badge">Featured</span>' : ''}
                    </div>
                </div>
                
                <div class="post-stats-modal">
                    <span class="post-stat"><i class="fas fa-heart"></i> ${post.likes} likes</span>
                    <span class="post-stat"><i class="fas fa-comment"></i> ${post.comments} comments</span>
                    <span class="post-stat"><i class="fas fa-clock"></i> ${post.readTime} min read</span>
                </div>

                <div class="post-content-modal">
                    <p>${post.body}</p>
                </div>

                <div class="post-tags-modal">
                    <strong>Tags:</strong>
                    ${post.tags!.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                </div>

                <div class="post-actions">
                    <button class="btn btn-outline" onclick="window.postsManager.likePost(${post.id})">
                        <i class="fas fa-heart"></i> Like
                    </button>
                    <button class="btn btn-outline" onclick="window.postsManager.sharePost(${post.id})">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
        `;

        // Показуємо модальне вікно
        showElement(modal);
    }

    // Публічний метод для вподобання поста
    // public дозволяє викликати цей метод з глобального об'єкта window
    public likePost(postId: number): void {
        // Знаходимо пост за ID
        const post = this.state.posts.find(p => p.id === postId);
        if (post) {
            // Збільшуємо лічильник лайків на 1
            post.likes!++;
            // Застосовуємо фільтри та сортування для оновлення відображення
            this.applyFiltersAndSort();
            // Показуємо спливаюче повідомлення про успішне вподобання
            showToast('Post liked!', 'success');
        }
    }

    // Публічний метод для спільного доступу до поста
    public sharePost(postId: number): void {
        // Знаходимо пост за ID
        const post = this.state.posts.find(p => p.id === postId);
        if (post) {
            // Формуємо текст для спільного доступу
            const shareText = `Check out this post: "${post.title}"`;
            // Перевіряємо чи підтримує браузер Web Share API
            if (navigator.share) {
                // Використовуємо нативний механізм спільного доступу
                navigator.share({
                    title: post.title,
                    text: shareText,
                    url: window.location.href
                });
            } else {
                // Якщо Web Share API не підтримується, копіюємо в буфер обміну
                navigator.clipboard.writeText(shareText);
                // Показуємо повідомлення про успішне копіювання
                showToast('Post link copied to clipboard!', 'success');
            }
        }
    }

    // Приватний метод для закриття модального вікна
    private closeModal(): void {
        // Знаходимо модальне вікно
        const modal = document.getElementById('postModal') as HTMLDivElement;
        // Ховаємо модальне вікно
        hideElement(modal);
    }

    // Обробник кліку по модальному вікну для закриття при кліку на затемнену область
    private handleModalClick(event: MouseEvent): void {
        // Знаходимо модальне вікно
        const modal = document.getElementById('postModal') as HTMLDivElement;
        // Якщо клікнули безпосередньо на модальне вікно (не на його вміст)
        if (event.target === modal) {
            // Закриваємо модальне вікно
            this.closeModal();
        }
    }

    // Метод для зміни режиму перегляду постів
    private setViewMode(mode: 'card' | 'compact'): void {
        // Оновлюємо стан з новим режимом перегляду
        this.setState({ viewMode: mode });
        // Знаходимо кнопки перемикання режиму перегляду
        const cardViewBtn = document.getElementById('cardViewBtn') as HTMLButtonElement;
        const compactViewBtn = document.getElementById('compactViewBtn') as HTMLButtonElement;

        // Встановлюємо активний стан для кнопок відповідно до обраного режиму
        cardViewBtn?.classList.toggle('active', mode === 'card');
        compactViewBtn?.classList.toggle('active', mode === 'compact');

        // Відображаємо пости з новим режимом перегляду
        this.displayPosts();
    }

    // Метод для скидання всіх фільтрів до початкових значень
    private resetFilters(): void {
        // Знаходимо всі елементи фільтрів в DOM
        const postSearch = document.getElementById('postSearch') as HTMLInputElement;
        const categoryFilter = document.getElementById('categoryFilter') as HTMLSelectElement;
        const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
        const featuredOnly = document.getElementById('featuredOnly') as HTMLInputElement;

        // Скидаємо значення всіх елементів до значень за замовчуванням
        if (postSearch) postSearch.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (sortSelect) sortSelect.value = 'newest';
        if (featuredOnly) featuredOnly.checked = false;

        // Оновлюємо стан зі значеннями за замовчуванням
        this.setState({
            searchQuery: '',
            categoryFilter: 'all',
            sortBy: 'newest',
            featuredOnly: false
        });

        // Очищуємо пошук (це також ховає кнопку очищення)
        this.clearSearch();
        // Застосовуємо фільтри зі скинутими значеннями
        this.applyFiltersAndSort();
    }

    // Метод для перемикання стану "немає результатів"
    private toggleEmptyState(): void {
        // Знаходимо елементи для стану "немає результатів" та контейнер постів
        const emptyState = document.getElementById('emptyState') as HTMLDivElement;
        const postsContainer = document.getElementById('postsContainer') as HTMLDivElement;

        // Якщо немає відфільтрованих постів, але є завантажені пости
        if (this.state.filteredPosts.length === 0 && this.state.posts.length > 0) {
            // Показуємо повідомлення "немає результатів" та ховаємо контейнер постів
            showElement(emptyState);
            hideElement(postsContainer);
        } else {
            // Ховаємо повідомлення "немає результатів" та показуємо контейнер постів
            hideElement(emptyState);
            showElement(postsContainer);
        }
    }

    // Метод для завантаження теми з локального сховища браузера
    private loadTheme(): void {
        // Отримуємо збережену тему з localStorage
        const savedTheme: string | null = localStorage.getItem('theme');
        // Якщо тема збережена, оновлюємо стан
        if (savedTheme) {
            this.setState({ currentTheme: savedTheme });
        }
        // Застосовуємо тему через менеджер тем
        this.themeManager.applyTheme();
    }

    // Приватний метод для оновлення стану менеджера постів
    // Partial<PostsState> означає, що можна передати тільки частину полів стану
    private setState(newState: Partial<PostsState>): void {
        // Оновлюємо стан злиттям поточного стану та нових значень
        // Оператор spread (...) розпинає об'єкти для створення нового об'єкта
        this.state = { ...this.state, ...newState };
    }
}

// Створюємо глобальний екземпляр PostsManager для доступу з HTML
// (window as any) використовується для обходу типізації TypeScript
(window as any).postsManager = new PostsManager();