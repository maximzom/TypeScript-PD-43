"use strict";
// Головний клас, який керує всією сторінкою користувачів.
class UsersManager {
    // Конструктор - це функція, яка автоматично викликається при створенні об'єкта.
    constructor() {
        // Приватне поле - означає, що тільки цей клас може змінювати ці дані.
        this.state = {
            users: [], // Спочатку список користувачів порожній
            filteredUsers: [], // І відфільтрований список теж порожній
            searchQuery: '', // Пошуковий запит порожній
            statusFilter: 'all', // Показувати всіх користувачів
            sortBy: 'name-asc', // Сортувати за іменем від А до Я
            viewMode: 'grid', // Показувати у вигляді сітки
            currentTheme: 'light', // Світла тема за замовчуванням
            isLoading: false // Не завантажуємо дані
        };
        this.init(); // Запускаємо ініціалізацію нашої програми.
    }
    // Асинхронна функція ініціалізації - вона може "чекати" на завершення інших операцій.
    async init() {
        this.bindEvents(); // Підключаємо всі кнопки та події
        this.loadTheme(); // Завантажуємо збережену тему
        await this.loadUsers(); // Чекаємо, поки завантажаться користувачі
        this.applyFiltersAndSort(); // Застосовуємо фільтри та сортування
    }
    // Функція для завантаження користувачів з інтернету.
    async loadUsers() {
        this.setState({ isLoading: true }); // Вмикаємо індикатор завантаження
        try {
            // Робимо запит до сайту, щоб отримати дані про користувачів.
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const users = await response.json(); // Перетворюємо відповідь у зрозумілий формат.
            // Додаємо додаткову інформацію до кожного користувача.
            const enrichedUsers = users.map((user, index) => ({
                ...user, // Беремо всі дані користувача, які ми отримали
                avatar: `https://i.pravatar.cc/150?img=${index + 1}`, // Додаємо фотографію
                status: index % 3 === 0 ? 'inactive' : 'active', // Кожен третій - неактивний
                joinDate: new Date(2023, index % 12, (index % 28) + 1).toISOString().split('T')[0] // Випадкова дата
            }));
            // Зберігаємо отриманих користувачів у наш стан.
            this.setState({
                users: enrichedUsers,
                filteredUsers: enrichedUsers,
                isLoading: false // Вимикаємо індикатор завантаження
            });
        }
        catch (error) {
            // Якщо щось пішло не так (немає інтернету тощо)...
            console.error('Error loading users:', error);
            this.setState({ isLoading: false });
            this.showError('Failed to load users. Please try again later.'); // Показуємо помилку
        }
    }
    // Ця функція підключає всі кнопки та інші елементи на сторінці.
    bindEvents() {
        // Кнопка зміни теми
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());
        // Поле пошуку та кнопка очищення
        const userSearch = document.getElementById('userSearch');
        const clearSearch = document.getElementById('clearSearch');
        userSearch?.addEventListener('input', (e) => this.handleSearch(e));
        clearSearch?.addEventListener('click', () => this.clearSearch());
        // Фільтри статусу та сортування
        const statusFilter = document.getElementById('statusFilter');
        const sortSelect = document.getElementById('sortSelect');
        statusFilter?.addEventListener('change', (e) => this.handleStatusFilter(e));
        sortSelect?.addEventListener('change', (e) => this.handleSortChange(e));
        // Кнопки перемикання виду (сітка/список)
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        gridViewBtn?.addEventListener('click', () => this.setViewMode('grid'));
        listViewBtn?.addEventListener('click', () => this.setViewMode('list'));
        // Кнопка скидання всіх фільтрів
        const resetFilters = document.getElementById('resetFilters');
        resetFilters?.addEventListener('click', () => this.resetFilters());
        // Модальне вікно (спливаюче вікно з деталями)
        const closeModal = document.getElementById('closeModal');
        const modal = document.getElementById('userModal');
        closeModal?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => this.handleModalClick(e));
        // Подія прокручування сторінки
        window.addEventListener('scroll', () => this.handleScroll());
    }
    // Функція, яка викликається при прокручуванні сторінки.
    handleScroll() {
        const cards = document.querySelectorAll('.user-card'); // Знаходимо всі картки користувачів
        cards.forEach(card => {
            const rect = card.getBoundingClientRect(); // Отримуємо позицію картки на екрані
            // Якщо картка знаходиться у видимій області екрана...
            if (rect.top < window.innerHeight - 100) {
                card.classList.add('visible'); // Робимо її видимою з анімацією
            }
        });
    }
    // Функція, яка викликається при введенні тексту у поле пошуку.
    handleSearch(event) {
        const input = event.target; // Отримуємо поле вводу
        this.setState({ searchQuery: input.value.toLowerCase() }); // Зберігаємо текст пошуку
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
        const userSearch = document.getElementById('userSearch');
        if (userSearch)
            userSearch.value = ''; // Очищаємо поле вводу
        this.setState({ searchQuery: '' }); // Очищаємо пошуковий запит
        const clearSearch = document.getElementById('clearSearch');
        this.hideElement(clearSearch); // Ховаємо кнопку очищення
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для фільтрації за статусом (активний/неактивний).
    handleStatusFilter(event) {
        const select = event.target; // Отримуємо вибране значення
        this.setState({ statusFilter: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для зміни способу сортування.
    handleSortChange(event) {
        const select = event.target; // Отримуємо спосіб сортування
        this.setState({ sortBy: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо сортування
    }
    // Головна функція для фільтрації та сортування користувачів.
    applyFiltersAndSort() {
        // Спочатку фільтруємо користувачів...
        let filtered = this.state.users.filter(user => {
            // Перевіряємо, чи користувач відповідає пошуковому запиту
            const matchesSearch = !this.state.searchQuery ||
                user.name.toLowerCase().includes(this.state.searchQuery) ||
                user.email.toLowerCase().includes(this.state.searchQuery) ||
                user.address.city.toLowerCase().includes(this.state.searchQuery);
            // Перевіряємо, чи відповідає статус вибраному фільтру
            const matchesStatus = this.state.statusFilter === 'all' ||
                user.status === this.state.statusFilter;
            // Залишаємо тільки тих користувачів, які відповідають обом умовам
            return matchesSearch && matchesStatus;
        });
        // Потім сортуємо відфільтрованих користувачів...
        filtered.sort((a, b) => {
            switch (this.state.sortBy) {
                case 'name-asc': return a.name.localeCompare(b.name); // За іменем А-Я
                case 'name-desc': return b.name.localeCompare(a.name); // За іменем Я-А
                case 'join-desc': return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(); // Новіші зверху
                case 'join-asc': return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(); // Старіші зверху
                default: return 0; // Без сортування
            }
        });
        this.setState({ filteredUsers: filtered }); // Зберігаємо результат
        this.displayUsers(); // Показуємо користувачів
        this.toggleEmptyState(); // Перевіряємо, чи є що показувати
    }
    // Функція для відображення користувачів на сторінці.
    displayUsers() {
        const usersContainer = document.getElementById('usersContainer'); // Контейнер для користувачів
        const loadingSpinner = document.getElementById('loadingSpinner'); // Індикатор завантаження
        // Якщо дані ще завантажуються...
        if (this.state.isLoading) {
            this.showElement(loadingSpinner); // Показуємо індикатор
            this.hideElement(usersContainer); // Ховаємо контейнер
            return;
        }
        this.hideElement(loadingSpinner); // Ховаємо індикатор
        this.showElement(usersContainer); // Показуємо контейнер
        if (!usersContainer)
            return; // Якщо контейнер не знайдено, виходимо
        // Встановлюємо клас в залежності від режиму перегляду
        usersContainer.className = this.state.viewMode === 'list' ? 'users-grid list-view' : 'users-grid';
        // Створюємо HTML для кожного користувача
        usersContainer.innerHTML = this.state.filteredUsers.map(user => `
            <div class="user-card fade-in" data-user-id="${user.id}">
                <div class="user-avatar">
                    <img src="${user.avatar}" alt="${user.name}" onerror="this.src='https://i.pravatar.cc/150?img=1'">
                </div>
                <div class="user-info">
                    <h3>${user.name} 
                        <span class="status-badge ${user.status}">${user.status}</span>
                    </h3>
                    <p><i class="fas fa-user"></i> @${user.username}</p>
                    <p><i class="fas fa-envelope"></i> ${user.email}</p>
                    <p><i class="fas fa-phone"></i> ${user.phone}</p>
                    <p><i class="fas fa-building"></i> ${user.company.name}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${user.address.city}</p>
                    <p><i class="fas fa-calendar"></i> Joined ${new Date(user.joinDate).toLocaleDateString()}</p>
                </div>
            </div>
        `).join(''); // Об'єднуємо всі HTML рядки в один
        // Додаємо обробники кліку на кожну картку користувача
        const userCards = document.querySelectorAll('.user-card');
        userCards.forEach(card => {
            card.addEventListener('click', () => {
                const userId = parseInt(card.getAttribute('data-user-id') || '0');
                this.showUserDetails(userId); // Показуємо деталі користувача
            });
        });
        this.animateCards(); // Запускаємо анімацію карток
    }
    // Функція для анімації карток з затримкою.
    animateCards() {
        const cards = document.querySelectorAll('.user-card');
        cards.forEach((card, index) => {
            // Кожна наступна картка з'являється з затримкою 0.1 секунди
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
    // Функція для показу деталей користувача у спливаючому вікні.
    showUserDetails(userId) {
        const user = this.state.users.find(u => u.id === userId); // Знаходимо користувача
        if (!user)
            return; // Якщо не знайшли, виходимо
        const modal = document.getElementById('userModal'); // Спливаюче вікно
        const modalTitle = document.getElementById('modalTitle'); // Заголовок
        const modalUserInfo = document.getElementById('modalUserInfo'); // Контент
        // Заповнюємо вікно інформацією про користувача
        modalTitle.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
        modalUserInfo.innerHTML = `
            <div class="user-details-modal">
                <div class="user-avatar-large">
                    <img src="${user.avatar}" alt="${user.name}">
                </div>
                <div class="user-info-detailed">
                    <p><strong>Username:</strong> @${user.username}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone}</p>
                    <p><strong>Website:</strong> ${user.website}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${user.status}">${user.status}</span></p>
                    <p><strong>Join Date:</strong> ${new Date(user.joinDate).toLocaleDateString()}</p>
                    <p><strong>Company:</strong> ${user.company.name}</p>
                    <p><strong>Catchphrase:</strong> "${user.company.catchPhrase}"</p>
                    <p><strong>Business:</strong> ${user.company.bs}</p>
                    <p><strong>Address:</strong> ${user.address.street}, ${user.address.suite}</p>
                    <p><strong>City:</strong> ${user.address.city}, ${user.address.zipcode}</p>
                    <p><strong>Coordinates:</strong> Lat: ${user.address.geo.lat}, Lng: ${user.address.geo.lng}</p>
                </div>
            </div>
        `;
        this.showElement(modal); // Показуємо спливаюче вікно
    }
    // Функція для закриття спливаючого вікна.
    closeModal() {
        const modal = document.getElementById('userModal');
        this.hideElement(modal); // Ховаємо вікно
    }
    // Функція для закриття вікна при кліку на затемнений фон.
    handleModalClick(event) {
        const modal = document.getElementById('userModal');
        // Якщо клікнули саме на фон (а не на вміст вікна)...
        if (event.target === modal) {
            this.closeModal(); // Закриваємо вікно
        }
    }
    // Функція для зміни режиму перегляду (сітка/список).
    setViewMode(mode) {
        this.setState({ viewMode: mode }); // Зберігаємо вибраний режим
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        // Робимо активну кнопку виділеною
        gridViewBtn?.classList.toggle('active', mode === 'grid');
        listViewBtn?.classList.toggle('active', mode === 'list');
        this.displayUsers(); // Перемальовуємо користувачів
    }
    // Функція для скидання всіх фільтрів до початкових значень.
    resetFilters() {
        const userSearch = document.getElementById('userSearch');
        const statusFilter = document.getElementById('statusFilter');
        const sortSelect = document.getElementById('sortSelect');
        // Очищаємо всі поля та випадаючі списки
        if (userSearch)
            userSearch.value = '';
        if (statusFilter)
            statusFilter.value = 'all';
        if (sortSelect)
            sortSelect.value = 'name-asc';
        // Скидаємо всі значення у стані
        this.setState({
            searchQuery: '',
            statusFilter: 'all',
            sortBy: 'name-asc'
        });
        this.clearSearch(); // Очищаємо пошук
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для показу/приховування повідомлення "нічого не знайдено".
    toggleEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const usersContainer = document.getElementById('usersContainer');
        // Якщо після фільтрації не залишилося користувачів, але вони були...
        if (this.state.filteredUsers.length === 0 && this.state.users.length > 0) {
            this.showElement(emptyState); // Показуємо "нічого не знайдено"
            this.hideElement(usersContainer); // Ховаємо список
        }
        else {
            this.hideElement(emptyState); // Ховаємо повідомлення
            this.showElement(usersContainer); // Показуємо список
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
    // Допоміжна функція для оновлення стану програми.
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
}
// Цей код виконується, коли вся сторінка повністю завантажена.
document.addEventListener('DOMContentLoaded', () => {
    new UsersManager(); // Створюємо наш менеджер користувачів
});
