// Імпортуємо типи User та UsersState з файлу типів
// Це забезпечує строгу типізацію для даних користувачів та стану менеджера
import { User, UsersState } from '../../types/index.js';

// Імпортуємо клас ThemeManager для керування темами інтерфейсу
// Він відповідає за перемикання між світлою та темною темами
import { ThemeManager } from '../theme/ThemeManager.js';

// Імпортуємо набір допоміжних функцій з утиліт
// showElement - показує елемент на сторінці
// hideElement - ховає елемент зі сторінки  
// showError - показує повідомлення про помилку
import { showElement, hideElement, showError } from '../../utils/helpers.js';

// Оголошуємо головний клас для керування користувачами
// Ключове слово export дозволяє використовувати цей клас в інших модулях
export class UsersManager {
    // Приватне поле state для зберігання стану менеджера користувачів
    // Вказуємо тип UsersState для контролю структури об'єкта
    private state: UsersState = {
        users: [],              // Масив всіх завантажених користувачів
        filteredUsers: [],      // Масив користувачів після застосування фільтрів
        searchQuery: '',        // Пошуковий запит користувача
        statusFilter: 'all',    // Обраний фільтр статусу (active/inactive/all)
        sortBy: 'name-asc',     // Спосіб сортування користувачів
        viewMode: 'grid',       // Режим відображення (сітка або список)
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
        // Викликаємо метод ініціалізації менеджера користувачів
        this.init();
    }

    // Приватний асинхронний метод ініціалізації менеджера користувачів
    // Promise<void> означає, що функція не повертає значення
    private async init(): Promise<void> {
        // Налаштовуємо обробники подій для елементів інтерфейсу
        this.bindEvents();
        // Завантажуємо збережену тему з локального сховища браузера
        this.loadTheme();
        // Завантажуємо користувачів з API (чекаємо на завершення)
        await this.loadUsers();
        // Застосовуємо фільтри та сортування до завантажених користувачів
        this.applyFiltersAndSort();
    }

    // Приватний асинхронний метод завантаження користувачів з зовнішнього API
    private async loadUsers(): Promise<void> {
        // Встановлюємо стан завантаження в true для показу індикатора завантаження
        this.setState({ isLoading: true });
        
        // Блок try-catch для обробки можливих помилок при завантаженні даних
        try {
            // Виконуємо запит до JSONPlaceholder API для отримання користувачів
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            // Перетворюємо відповідь сервера у JSON формат
            const users = await response.json();
            
            // Обробляємо отриманих користувачів та додаємо додаткові поля
            const enrichedUsers = users.map((user: User, index: number) => ({
                ...user,  // Копіюємо всі властивості оригінального об'єкта користувача
                
                // Генеруємо URL аватара з сервісу pravatar.cc з циклічними зображеннями
                avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
                
                // Встановлюємо статус користувача (кожен третій неактивний)
                status: index % 3 === 0 ? 'inactive' : 'active',
                
                // Генеруємо дату приєднання (випадкова дата в 2023 році) та обрізаємо час
                joinDate: new Date(2023, index % 12, (index % 28) + 1).toISOString().split('T')[0]
            }));
            
            // Оновлюємо стан з новими даними користувачів
            this.setState({ 
                users: enrichedUsers,           // Зберігаємо всіх користувачів
                filteredUsers: enrichedUsers,   // Спочатку всі користувачі відфільтровані
                isLoading: false                // Скидаємо стан завантаження
            });
            
        } catch (error) {
            // Обробка помилок - логуємо в консоль та показуємо повідомлення користувачеві
            console.error('Error loading users:', error);
            // Скидаємо стан завантаження навіть при помилці
            this.setState({ isLoading: false });
            // Показуємо повідомлення про помилку користувачеві
            showError('Failed to load users. Please try again later.');
        }
    }

    // Приватний метод для прив'язки обробників подій до елементів DOM
    private bindEvents(): void {
        // Знаходимо кнопку перемикача теми в DOM та вказуємо тип HTMLButtonElement
        const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
        // Додаємо обробник кліку на кнопку теми (перевіряємо чи існує елемент)
        themeToggle?.addEventListener('click', () => this.themeManager.toggleTheme());

        // Знаходимо поле пошуку та кнопку очищення пошуку
        const userSearch = document.getElementById('userSearch') as HTMLInputElement;
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        // Додаємо обробники подій для пошуку та очищення
        userSearch?.addEventListener('input', (e) => this.handleSearch(e));
        clearSearch?.addEventListener('click', () => this.clearSearch());

        // Знаходимо всі елементи фільтрів та сортування
        const statusFilter = document.getElementById('statusFilter') as HTMLSelectElement;
        const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
        // Додаємо обробники змін для кожного фільтра
        statusFilter?.addEventListener('change', (e) => this.handleStatusFilter(e));
        sortSelect?.addEventListener('change', (e) => this.handleSortChange(e));

        // Знаходимо кнопки перемикання режиму перегляду
        const gridViewBtn = document.getElementById('gridViewBtn') as HTMLButtonElement;
        const listViewBtn = document.getElementById('listViewBtn') as HTMLButtonElement;
        // Додаємо обробники кліку для перемикання режимів перегляду
        gridViewBtn?.addEventListener('click', () => this.setViewMode('grid'));
        listViewBtn?.addEventListener('click', () => this.setViewMode('list'));

        // Знаходимо кнопку скидання фільтрів та додаємо обробник кліку
        const resetFilters = document.getElementById('resetFilters') as HTMLButtonElement;
        resetFilters?.addEventListener('click', () => this.resetFilters());

        // Знаходимо елементи модального вікна та кнопку закриття
        const closeModal = document.getElementById('closeModal') as HTMLButtonElement;
        const modal = document.getElementById('userModal') as HTMLDivElement;
        // Додаємо обробники для закриття модального вікна
        closeModal?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => this.handleModalClick(e));

        // Додаємо обробник події прокручування вікна для анімації карток
        window.addEventListener('scroll', () => this.handleScroll());
    }

    // Обробник події прокручування сторінки для анімації карток користувачів
    private handleScroll(): void {
        // Знаходимо всі картки користувачів на сторінці
        const cards = document.querySelectorAll('.user-card');
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

    // Обробник події введення тексту в поле пошуку користувачів
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

    // Метод для очищення поля пошуку користувачів
    private clearSearch(): void {
        // Знаходимо поле пошуку в DOM
        const userSearch = document.getElementById('userSearch') as HTMLInputElement;
        // Очищаємо значення поля пошуку
        if (userSearch) userSearch.value = '';
        // Оновлюємо стан - очищуємо пошуковий запит
        this.setState({ searchQuery: '' });
        
        // Знаходимо кнопку очищення пошуку та ховаємо її
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        hideElement(clearSearch);
        
        // Застосовуємо фільтри та сортування з очищеним пошуком
        this.applyFiltersAndSort();
    }

    // Обробник зміни фільтра статусу користувачів
    private handleStatusFilter(event: Event): void {
        // Отримуємо елемент select з події
        const select = event.target as HTMLSelectElement;
        // Оновлюємо стан з обраним фільтром статусу
        this.setState({ statusFilter: select.value });
        // Застосовуємо фільтри з новими параметрами
        this.applyFiltersAndSort();
    }

    // Обробник зміни способу сортування користувачів
    private handleSortChange(event: Event): void {
        // Отримуємо елемент select з події
        const select = event.target as HTMLSelectElement;
        // Оновлюємо стан з обраним способом сортування
        this.setState({ sortBy: select.value });
        // Застосовуємо фільтри та сортування з новими параметрами
        this.applyFiltersAndSort();
    }

    // Основний метод для застосування фільтрів та сортування до користувачів
    private applyFiltersAndSort(): void {
        // Фільтруємо користувачів на основі всіх активних фільтрів
        let filtered = this.state.users.filter(user => {
            // Перевіряємо відповідність пошуковому запиту
            const matchesSearch = !this.state.searchQuery || 
                // Пошук в імені користувача
                user.name.toLowerCase().includes(this.state.searchQuery) ||
                // Пошук в email користувача
                user.email.toLowerCase().includes(this.state.searchQuery) ||
                // Пошук в місті користувача
                user.address.city.toLowerCase().includes(this.state.searchQuery);

            // Перевіряємо відповідність обраному статусу
            const matchesStatus = this.state.statusFilter === 'all' || 
                user.status === this.state.statusFilter;

            // Користувач включається в результат якщо відповідає всім умовам
            return matchesSearch && matchesStatus;
        });

        // Сортуємо відфільтрованих користувачів згідно обраного способу сортування
        filtered.sort((a, b) => {
            // Використовуємо switch для різних способів сортування
            switch (this.state.sortBy) {
                case 'name-asc': 
                    // Сортування за іменем (A-Z)
                    return a.name.localeCompare(b.name);
                case 'name-desc': 
                    // Сортування за іменем (Z-A)
                    return b.name.localeCompare(a.name);
                case 'join-desc': 
                    // Сортування за датою приєднання (новіші перші)
                    return new Date(b.joinDate!).getTime() - new Date(a.joinDate!).getTime();
                case 'join-asc': 
                    // Сортування за датою приєднання (старіші перші)
                    return new Date(a.joinDate!).getTime() - new Date(b.joinDate!).getTime();
                default: return 0;  // Стандартне сортування (без змін)
            }
        });

        // Оновлюємо стан з відфільтрованими та відсортованими користувачами
        this.setState({ filteredUsers: filtered });
        // Відображаємо оновлений список користувачів
        this.displayUsers();
        // Показуємо або ховаємо стан "немає результатів"
        this.toggleEmptyState();
    }

    // Метод для відображення користувачів в інтерфейсі
    private displayUsers(): void {
        // Знаходимо контейнер для користувачів та індикатор завантаження
        const usersContainer = document.getElementById('usersContainer');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        // Якщо дані ще завантажуються, показуємо індикатор та ховаємо контейнер
        if (this.state.isLoading) {
            showElement(loadingSpinner!);        // Використовуємо non-null assertion
            hideElement(usersContainer!);
            return;  // Виходимо з методу, щоб не відображати користувачів
        }
        
        // Коли дані завантажились, ховаємо індикатор та показуємо контейнер
        hideElement(loadingSpinner!);
        showElement(usersContainer!);
        
        // Якщо контейнер не знайдено, виходимо з методу
        if (!usersContainer) return;
        
        // Встановлюємо CSS клас контейнера в залежності від режиму перегляду
        usersContainer.className = this.state.viewMode === 'list' ? 'users-grid list-view' : 'users-grid';
        
        // Генеруємо HTML для всіх відфільтрованих користувачів
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
                    <p><i class="fas fa-calendar"></i> Joined ${new Date(user.joinDate!).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');  // join('') перетворює масив рядків в один рядок

        // Знаходимо всі створені картки користувачів
        const userCards = document.querySelectorAll('.user-card');
        // Для кожної картки додаємо обробник кліку для відкриття деталей
        userCards.forEach(card => {
            card.addEventListener('click', () => {
                // Отримуємо ID користувача з атрибуту data-user-id
                const userId: number = parseInt(card.getAttribute('data-user-id') || '0');
                // Показуємо детальну інформацію про користувача
                this.showUserDetails(userId);
            });
        });

        // Запускаємо анімацію появи карток
        this.animateCards();
    }

    // Метод для анімації появи карток користувачів
    private animateCards(): void {
        // Знаходимо всі картки користувачів
        const cards = document.querySelectorAll('.user-card');
        // Для кожної картки встановлюємо затримку анімації
        cards.forEach((card, index) => {
            // Встановлюємо CSS властивість animation-delay зі зростаючою затримкою
            (card as HTMLElement).style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Метод для відображення детальної інформації про користувача в модальному вікні
    private showUserDetails(userId: number): void {
        // Знаходимо користувача за ID
        const user = this.state.users.find(u => u.id === userId);
        // Якщо користувач не знайдено, виходимо з методу
        if (!user) return;

        // Знаходимо елементи модального вікна
        const modal = document.getElementById('userModal') as HTMLDivElement;
        const modalTitle = document.getElementById('modalTitle') as HTMLHeadingElement;
        const modalUserInfo = document.getElementById('modalUserInfo') as HTMLDivElement;

        // Встановлюємо заголовок модального вікна з іконкою
        modalTitle.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
        // Генеруємо вміст модального вікна з детальною інформацією про користувача
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
                    <p><strong>Join Date:</strong> ${new Date(user.joinDate!).toLocaleDateString()}</p>
                    <p><strong>Company:</strong> ${user.company.name}</p>
                    <p><strong>Catchphrase:</strong> "${user.company.catchPhrase}"</p>
                    <p><strong>Business:</strong> ${user.company.bs}</p>
                    <p><strong>Address:</strong> ${user.address.street}, ${user.address.suite}</p>
                    <p><strong>City:</strong> ${user.address.city}, ${user.address.zipcode}</p>
                    <p><strong>Coordinates:</strong> Lat: ${user.address.geo.lat}, Lng: ${user.address.geo.lng}</p>
                </div>
            </div>
        `;

        // Показуємо модальне вікно
        showElement(modal);
    }

    // Приватний метод для закриття модального вікна
    private closeModal(): void {
        // Знаходимо модальне вікно
        const modal = document.getElementById('userModal') as HTMLDivElement;
        // Ховаємо модальне вікно
        hideElement(modal);
    }

    // Обробник кліку по модальному вікну для закриття при кліку на затемнену область
    private handleModalClick(event: MouseEvent): void {
        // Знаходимо модальне вікно
        const modal = document.getElementById('userModal') as HTMLDivElement;
        // Якщо клікнули безпосередньо на модальне вікно (не на його вміст)
        if (event.target === modal) {
            // Закриваємо модальне вікно
            this.closeModal();
        }
    }

    // Метод для зміни режиму перегляду користувачів
    private setViewMode(mode: 'grid' | 'list'): void {
        // Оновлюємо стан з новим режимом перегляду
        this.setState({ viewMode: mode });
        // Знаходимо кнопки перемикання режиму перегляду
        const gridViewBtn = document.getElementById('gridViewBtn') as HTMLButtonElement;
        const listViewBtn = document.getElementById('listViewBtn') as HTMLButtonElement;

        // Встановлюємо активний стан для кнопок відповідно до обраного режиму
        gridViewBtn?.classList.toggle('active', mode === 'grid');
        listViewBtn?.classList.toggle('active', mode === 'list');

        // Відображаємо користувачів з новим режимом перегляду
        this.displayUsers();
    }

    // Метод для скидання всіх фільтрів до початкових значень
    private resetFilters(): void {
        // Знаходимо всі елементи фільтрів в DOM
        const userSearch = document.getElementById('userSearch') as HTMLInputElement;
        const statusFilter = document.getElementById('statusFilter') as HTMLSelectElement;
        const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;

        // Скидаємо значення всіх елементів до значень за замовчуванням
        if (userSearch) userSearch.value = '';
        if (statusFilter) statusFilter.value = 'all';
        if (sortSelect) sortSelect.value = 'name-asc';

        // Оновлюємо стан зі значеннями за замовчуванням
        this.setState({
            searchQuery: '',
            statusFilter: 'all',
            sortBy: 'name-asc'
        });

        // Очищуємо пошук (це також ховає кнопку очищення)
        this.clearSearch();
        // Застосовуємо фільтри зі скинутими значеннями
        this.applyFiltersAndSort();
    }

    // Метод для перемикання стану "немає результатів"
    private toggleEmptyState(): void {
        // Знаходимо елементи для стану "немає результатів" та контейнер користувачів
        const emptyState = document.getElementById('emptyState') as HTMLDivElement;
        const usersContainer = document.getElementById('usersContainer') as HTMLDivElement;

        // Якщо немає відфільтрованих користувачів, але є завантажені користувачі
        if (this.state.filteredUsers.length === 0 && this.state.users.length > 0) {
            // Показуємо повідомлення "немає результатів" та ховаємо контейнер користувачів
            showElement(emptyState);
            hideElement(usersContainer);
        } else {
            // Ховаємо повідомлення "немає результатів" та показуємо контейнер користувачів
            hideElement(emptyState);
            showElement(usersContainer);
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

    // Приватний метод для оновлення стану менеджера користувачів
    // Partial<UsersState> означає, що можна передати тільки частину полів стану
    private setState(newState: Partial<UsersState>): void {
        // Оновлюємо стан злиттям поточного стану та нових значень
        // Оператор spread (...) розпинає об'єкти для створення нового об'єкта
        this.state = { ...this.state, ...newState };
    }
}