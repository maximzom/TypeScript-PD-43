"use strict";
// Головний клас, який керує всією сторінкою постів.
class PostsManager {
    // Конструктор - функція, яка автоматично викликається при створенні об'єкта.
    constructor() {
        // Приватне поле для зберігання стану нашої сторінки постів.
        this.state = {
            posts: [], // Спочатку список постів порожній
            filteredPosts: [], // І відфільтрований список теж порожній
            users: [], // Список авторів порожній
            searchQuery: '', // Пошуковий запит порожній
            categoryFilter: 'all', // Показувати всі категорії
            sortBy: 'newest', // Сортувати за новизною (новіші зверху)
            featuredOnly: false, // Показувати всі пости (не тільки рекомендовані)
            viewMode: 'card', // Режим карток за замовчуванням
            currentTheme: 'light', // Світла тема за замовчуванням
            isLoading: false // Не завантажуємо дані
        };
        this.init(); // Запускаємо ініціалізацію нашої сторінки постів.
    }
    // Асинхронна функція ініціалізації - вона може "чекати" на завершення інших операцій.
    async init() {
        this.bindEvents(); // Підключаємо всі кнопки та події
        this.loadTheme(); // Завантажуємо збережену тему
        await this.loadData(); // Чекаємо, поки завантажаться пости та автори
        this.applyFiltersAndSort(); // Застосовуємо фільтри та сортування
    }
    // Функція для завантаження постів та авторів з інтернету.
    async loadData() {
        this.setState({ isLoading: true }); // Вмикаємо індикатор завантаження
        try {
            // Робимо два запити одночасно: для постів та для авторів.
            const [postsResponse, usersResponse] = await Promise.all([
                fetch('https://jsonplaceholder.typicode.com/posts'), // Запит постів
                fetch('https://jsonplaceholder.typicode.com/users') // Запит авторів
            ]);
            const posts = await postsResponse.json(); // Перетворюємо відповідь у зрозумілий формат
            const users = await usersResponse.json(); // Перетворюємо відповідь у зрозумілий формат
            // Додаємо додаткову інформацію до кожного посту.
            const enrichedPosts = posts.slice(0, 20).map((post, index) => ({
                ...post, // Беремо всі дані посту, які ми отримали
                category: ['Technology', 'Science', 'Arts', 'Business', 'Health'][index % 5], // Вибираємо категорію зі списку
                tags: ['tech', 'science', 'innovation', 'news'].slice(0, (index % 3) + 1), // Вибираємо теги
                createdAt: new Date(2023, index % 12, (index % 28) + 1).toISOString(), // Випадкова дата створення
                likes: Math.floor(Math.random() * 100), // Випадкова кількість вподобань (до 100)
                comments: Math.floor(Math.random() * 50), // Випадкова кількість коментарів (до 50)
                readTime: Math.floor(Math.random() * 10) + 1, // Випадковий час читання (1-10 хвилин)
                featured: index % 4 === 0 // Кожен четвертий пост - рекомендований
            }));
            // Додаємо фотографії до кожного автора.
            const enrichedUsers = users.map((user, index) => ({
                ...user, // Беремо всі дані автора, які ми отримали
                avatar: `https://i.pravatar.cc/150?img=${index + 1}` // Додаємо фотографію
            }));
            // Зберігаємо отримані дані у наш стан.
            this.setState({
                posts: enrichedPosts,
                users: enrichedUsers,
                filteredPosts: enrichedPosts,
                isLoading: false // Вимикаємо індикатор завантаження
            });
        }
        catch (error) {
            // Якщо щось пішло не так (немає інтернету тощо)...
            console.error('Error loading data:', error);
            this.setState({ isLoading: false });
            this.showError('Failed to load posts. Please try again later.'); // Показуємо помилку
        }
    }
    // Ця функція підключає всі кнопки та інші елементи на сторінці постів.
    bindEvents() {
        // Кнопка зміни теми
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());
        // Поле пошуку та кнопка очищення
        const postSearch = document.getElementById('postSearch');
        const clearSearch = document.getElementById('clearSearch');
        postSearch?.addEventListener('input', (e) => this.handleSearch(e));
        clearSearch?.addEventListener('click', () => this.clearSearch());
        // Фільтри категорій, сортування та рекомендованих постів
        const categoryFilter = document.getElementById('categoryFilter');
        const sortSelect = document.getElementById('sortSelect');
        const featuredOnly = document.getElementById('featuredOnly');
        categoryFilter?.addEventListener('change', (e) => this.handleCategoryFilter(e));
        sortSelect?.addEventListener('change', (e) => this.handleSortChange(e));
        featuredOnly?.addEventListener('change', (e) => this.handleFeaturedChange(e));
        // Кнопки перемикання виду (картки/компактний)
        const cardViewBtn = document.getElementById('cardViewBtn');
        const compactViewBtn = document.getElementById('compactViewBtn');
        cardViewBtn?.addEventListener('click', () => this.setViewMode('card'));
        compactViewBtn?.addEventListener('click', () => this.setViewMode('compact'));
        // Кнопка скидання всіх фільтрів
        const resetFilters = document.getElementById('resetFilters');
        resetFilters?.addEventListener('click', () => this.resetFilters());
        // Модальне вікно (спливаюче вікно з деталями посту)
        const closeModal = document.getElementById('closePostModal');
        const modal = document.getElementById('postModal');
        closeModal?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => this.handleModalClick(e));
        // Подія прокручування сторінки для анімацій
        window.addEventListener('scroll', () => this.handleScroll());
    }
    // Функція, яка викликається при прокручуванні сторінки.
    handleScroll() {
        const cards = document.querySelectorAll('.post-card'); // Знаходимо всі картки постів
        cards.forEach(card => {
            const rect = card.getBoundingClientRect(); // Отримуємо позицію картки на екрані
            // Якщо картка знаходиться у видимій області екрана...
            if (rect.top < window.innerHeight - 100) {
                card.classList.add('visible'); // Додаємо клас для анімації з'явлення
            }
        });
    }
    // Функція, яка викликається при введенні тексту у поле пошуку.
    handleSearch(event) {
        const input = event.target; // Отримуємо поле вводу
        this.setState({ searchQuery: input.value.toLowerCase() }); // Зберігаємо текст пошуку у нижньому регістрі
        const clearSearch = document.getElementById('clearSearch');
        // Якщо є текст у пошуку, показуємо кнопку очищення
        if (this.state.searchQuery) {
            this.showElement(clearSearch);
        }
        else {
            this.hideElement(clearSearch);
        }
        this.applyFiltersAndSort(); // Застосовуємо фільтри з новим пошуком
    }
    // Функція для очищення поля пошуку.
    clearSearch() {
        const postSearch = document.getElementById('postSearch');
        if (postSearch)
            postSearch.value = ''; // Очищаємо поле вводу
        this.setState({ searchQuery: '' }); // Очищаємо пошуковий запит
        const clearSearch = document.getElementById('clearSearch');
        this.hideElement(clearSearch); // Ховаємо кнопку очищення
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для фільтрації за категорією посту.
    handleCategoryFilter(event) {
        const select = event.target; // Отримуємо вибрану категорію
        this.setState({ categoryFilter: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для зміни способу сортування постів.
    handleSortChange(event) {
        const select = event.target; // Отримуємо спосіб сортування
        this.setState({ sortBy: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо сортування
    }
    // Функція для фільтрації тільки рекомендованих постів.
    handleFeaturedChange(event) {
        const checkbox = event.target; // Отримуємо стан чекбоксу
        this.setState({ featuredOnly: checkbox.checked }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Головна функція для фільтрації та сортування постів.
    applyFiltersAndSort() {
        // Спочатку фільтруємо пости...
        let filtered = this.state.posts.filter(post => {
            // Перевіряємо, чи пост відповідає пошуковому запиту
            const matchesSearch = !this.state.searchQuery ||
                post.title.toLowerCase().includes(this.state.searchQuery) ||
                post.body.toLowerCase().includes(this.state.searchQuery) ||
                post.tags.some(tag => tag.toLowerCase().includes(this.state.searchQuery));
            // Перевіряємо, чи відповідає категорія вибраному фільтру
            const matchesCategory = this.state.categoryFilter === 'all' ||
                post.category === this.state.categoryFilter;
            // Перевіряємо, чи пост рекомендований (якщо обрано цей фільтр)
            const matchesFeatured = !this.state.featuredOnly || post.featured;
            // Залишаємо тільки ті пости, які відповідають всім умовам
            return matchesSearch && matchesCategory && matchesFeatured;
        });
        // Потім сортуємо відфільтровані пости...
        filtered.sort((a, b) => {
            switch (this.state.sortBy) {
                case 'newest':
                    // Новіші пости зверху (за датою створення)
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    // Старіші пости зверху (за датою створення)
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'popular':
                    // Популярніші пости зверху (за сумою вподобань та коментарів)
                    return (b.likes + b.comments) - (a.likes + a.comments);
                case 'title-asc':
                    // За заголовком від А до Я
                    return a.title.localeCompare(b.title);
                default: return 0; // Без сортування
            }
        });
        this.setState({ filteredPosts: filtered }); // Зберігаємо результат
        this.displayPosts(); // Показуємо пости
        this.toggleEmptyState(); // Перевіряємо, чи є що показувати
    }
    // Функція для відображення постів на сторінці.
    displayPosts() {
        const postsContainer = document.getElementById('postsContainer'); // Контейнер для постів
        const loadingSpinner = document.getElementById('loadingSpinner'); // Індикатор завантаження
        // Якщо дані ще завантажуються...
        if (this.state.isLoading) {
            this.showElement(loadingSpinner); // Показуємо індикатор
            this.hideElement(postsContainer); // Ховаємо контейнер
            return;
        }
        this.hideElement(loadingSpinner); // Ховаємо індикатор
        this.showElement(postsContainer); // Показуємо контейнер
        if (!postsContainer)
            return; // Якщо контейнер не знайдено, виходимо
        // Встановлюємо клас в залежності від режиму перегляду
        postsContainer.className = this.state.viewMode === 'compact' ? 'posts-grid compact-view' : 'posts-grid';
        // Створюємо HTML для кожного посту
        postsContainer.innerHTML = this.state.filteredPosts.map(post => {
            const author = this.state.users.find(user => user.id === post.userId); // Знаходимо автора
            const authorName = author ? author.name : 'Unknown Author'; // Ім'я автора або "Невідомий автор"
            const authorAvatar = author ? author.avatar : 'https://i.pravatar.cc/150?img=1'; // Фотографія автора
            const date = new Date(post.createdAt).toLocaleDateString(); // Форматуємо дату
            // Якщо обрано компактний режим...
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
            // Якщо обрано режим карток (повний)...
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
                        ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="post-stats">
                        <span class="post-stat"><i class="fas fa-heart"></i> ${post.likes}</span>
                        <span class="post-stat"><i class="fas fa-comment"></i> ${post.comments}</span>
                        <span class="post-stat"><i class="fas fa-clock"></i> ${post.readTime} min</span>
                    </div>
                </div>
            `;
        }).join(''); // Об'єднуємо всі HTML рядки в один
        // Додаємо обробники кліку на кожну картку посту
        const postCards = document.querySelectorAll('.post-card');
        postCards.forEach(card => {
            card.addEventListener('click', () => {
                const postId = parseInt(card.getAttribute('data-post-id') || '0');
                this.showPostDetails(postId); // Показуємо деталі посту
            });
        });
        // Запускаємо анімацію карток через невелику затримку
        setTimeout(() => this.animateCards(), 100);
    }
    // Функція для анімації карток постів з затримкою.
    animateCards() {
        const cards = document.querySelectorAll('.post-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in'); // Додаємо клас анімації з затримкою
            }, index * 100); // Кожна наступна картка з'являється з затримкою 0.1 секунди
        });
    }
    // Функція для показу деталей посту у спливаючому вікні.
    showPostDetails(postId) {
        const post = this.state.posts.find(p => p.id === postId); // Знаходимо пост
        if (!post)
            return; // Якщо не знайшли, виходимо
        const author = this.state.users.find(user => user.id === post.userId); // Знаходимо автора
        const authorName = author ? author.name : 'Unknown Author'; // Ім'я автора
        const authorAvatar = author ? author.avatar : 'https://i.pravatar.cc/150?img=1'; // Фотографія автора
        const date = new Date(post.createdAt).toLocaleDateString(); // Форматуємо дату
        const modal = document.getElementById('postModal'); // Спливаюче вікно
        const modalTitle = document.getElementById('postModalTitle'); // Заголовок
        const modalContent = document.getElementById('postModalContent'); // Контент
        // Заповнюємо вікно інформацією про пост
        modalTitle.innerHTML = `<i class="fas fa-newspaper"></i> ${post.title}`;
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
                    ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                </div>

                <div class="post-actions">
                    <button class="btn btn-outline" onclick="postsManager.likePost(${post.id})">
                        <i class="fas fa-heart"></i> Like
                    </button>
                    <button class="btn btn-outline" onclick="postsManager.sharePost(${post.id})">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
        `;
        this.showElement(modal); // Показуємо спливаюче вікно
    }
    // Публічна функція для вподобання посту (викликається з HTML).
    likePost(postId) {
        const post = this.state.posts.find(p => p.id === postId); // Знаходимо пост
        if (post) {
            post.likes++; // Збільшуємо кількість вподобань на 1
            this.applyFiltersAndSort(); // Застосовуємо фільтри (щоб оновити відображення)
            this.showToast('Post liked!', 'success'); // Показуємо повідомлення
        }
    }
    // Публічна функція для поширення посту (викликається з HTML).
    sharePost(postId) {
        const post = this.state.posts.find(p => p.id === postId); // Знаходимо пост
        if (post) {
            const shareText = `Check out this post: "${post.title}"`; // Текст для поширення
            // Перевіряємо, чи підтримує браузер функцію share
            if (navigator.share) {
                navigator.share({
                    title: post.title,
                    text: shareText,
                    url: window.location.href
                });
            }
            else {
                // Якщо не підтримує, копіюємо текст в буфер обміну
                navigator.clipboard.writeText(shareText);
                this.showToast('Post link copied to clipboard!', 'success'); // Показуємо повідомлення
            }
        }
    }
    // Функція для закриття спливаючого вікна.
    closeModal() {
        const modal = document.getElementById('postModal');
        this.hideElement(modal); // Ховаємо вікно
    }
    // Функція для закриття вікна при кліку на затемнений фон.
    handleModalClick(event) {
        const modal = document.getElementById('postModal');
        // Якщо клікнули саме на фон (а не на вміст вікна)...
        if (event.target === modal) {
            this.closeModal(); // Закриваємо вікно
        }
    }
    // Функція для зміни режиму перегляду (картки/компактний).
    setViewMode(mode) {
        this.setState({ viewMode: mode }); // Зберігаємо вибраний режим
        const cardViewBtn = document.getElementById('cardViewBtn');
        const compactViewBtn = document.getElementById('compactViewBtn');
        // Робимо активну кнопку виділеною
        cardViewBtn?.classList.toggle('active', mode === 'card');
        compactViewBtn?.classList.toggle('active', mode === 'compact');
        this.displayPosts(); // Перемальовуємо пости
    }
    // Функція для скидання всіх фільтрів до початкових значень.
    resetFilters() {
        // Отримуємо всі елементи фільтрів зі сторінки
        const postSearch = document.getElementById('postSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortSelect = document.getElementById('sortSelect');
        const featuredOnly = document.getElementById('featuredOnly');
        // Скидаємо всі поля до значень за замовчуванням
        if (postSearch)
            postSearch.value = '';
        if (categoryFilter)
            categoryFilter.value = 'all';
        if (sortSelect)
            sortSelect.value = 'newest';
        if (featuredOnly)
            featuredOnly.checked = false;
        // Скидаємо всі значення у стані
        this.setState({
            searchQuery: '',
            categoryFilter: 'all',
            sortBy: 'newest',
            featuredOnly: false
        });
        this.clearSearch(); // Очищаємо пошук
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для показу/приховування повідомлення "нічого не знайдено".
    toggleEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const postsContainer = document.getElementById('postsContainer');
        // Якщо після фільтрації не залишилося постів, але вони були...
        if (this.state.filteredPosts.length === 0 && this.state.posts.length > 0) {
            this.showElement(emptyState); // Показуємо "нічого не знайдено"
            this.hideElement(postsContainer); // Ховаємо список
        }
        else {
            this.hideElement(emptyState); // Ховаємо повідомлення
            this.showElement(postsContainer); // Показуємо список
        }
    }
    // Функція для перемикання теми (світла/темна).
    toggleTheme() {
        this.setState({
            currentTheme: this.state.currentTheme === 'light' ? 'dark' : 'light'
        });
        this.applyTheme(); // Застосовуємо тему
        this.saveTheme(); // Зберігаємо у пам'яті
        this.updateThemeButton(); // Оновлюємо кнопку
    }
    // Функція для застосування теми до всієї сторінки.
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
    }
    // Функція для збереження теми у пам'яті браузера.
    saveTheme() {
        localStorage.setItem('theme', this.state.currentTheme);
    }
    // Функція для завантаження теми з пам'яті браузера.
    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setState({ currentTheme: savedTheme }); // Встановлюємо збережену тему
        }
        this.applyTheme(); // Застосовуємо тему
        this.updateThemeButton(); // Оновлюємо кнопку
    }
    // Функція для оновлення вигляду кнопки перемикача теми.
    updateThemeButton() {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            // Для темної теми показуємо сонце, для світлої - місяць
            if (this.state.currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
            }
            else {
                icon.className = 'fas fa-moon';
            }
        }
    }
    // Допоміжна функція для оновлення стану сторінки постів.
    setState(newState) {
        this.state = { ...this.state, ...newState };
    }
    // Функція для показу елемента на сторінці.
    showElement(element) {
        element.classList.remove('hidden'); // Видаляємо клас, який ховає елемент
    }
    // Функція для приховування елемента на сторінці.
    hideElement(element) {
        element.classList.add('hidden'); // Додаємо клас, який ховає елемент
    }
    // Функція для показу повідомлення про помилку.
    showError(message) {
        console.error(message); // Виводимо в консоль
        alert(message); // Показуємо спливаюче вікно
    }
    // Функція для показу спливаючого повідомлення (тост).
    showToast(message, type = 'success') {
        console.log(`[${type.toUpperCase()}] ${message}`); // Виводимо в консоль
        alert(message); // Показуємо спливаюче вікно (у реальному додатку тут був би красивий тост)
    }
}
// Створюємо глобальний об'єкт менеджера постів, щоб він був доступний з HTML.
const postsManager = new PostsManager();
// Робимо менеджер постів доступним у глобальному об'єкті window, щоб HTML кнопки могли до нього звертатися.
window.postsManager = postsManager;
