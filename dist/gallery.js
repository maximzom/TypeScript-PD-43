"use strict";
// Головний клас, який керує всією сторінкою галереї продуктів.
class GalleryManager {
    // Конструктор - функція, яка автоматично викликається при створенні об'єкта.
    constructor() {
        // Приватне поле для зберігання стану нашої галереї.
        this.state = {
            products: [], // Спочатку список продуктів порожній
            filteredProducts: [], // І відфільтрований список теж порожній
            searchQuery: '', // Пошуковий запит порожній
            categoryFilter: 'all', // Показувати всі категорії
            priceFilter: 'all', // Показувати всі ціни
            sortBy: 'name-asc', // Сортувати за назвою від А до Я
            inStockOnly: false, // Показувати всі товари (не тільки в наявності)
            maxPrice: 100, // Максимальна ціна за замовчуванням
            currentTheme: 'light', // Світла тема за замовчуванням
            isLoading: false // Не завантажуємо дані
        };
        this.init(); // Запускаємо ініціалізацію нашої галереї.
    }
    // Асинхронна функція ініціалізації - вона може "чекати" на завершення інших операцій.
    async init() {
        this.bindEvents(); // Підключаємо всі кнопки та події
        this.loadTheme(); // Завантажуємо збережену тему
        await this.loadProducts(); // Чекаємо, поки завантажаться продукти
        this.applyFiltersAndSort(); // Застосовуємо фільтри та сортування
    }
    // Функція для завантаження продуктів з інтернету.
    async loadProducts() {
        this.setState({ isLoading: true }); // Вмикаємо індикатор завантаження
        try {
            // Робимо запит до сайту, щоб отримати дані про фото (обмежуємо 20 штук).
            const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=20');
            const photos = await response.json(); // Перетворюємо відповідь у зрозумілий формат.
            // Додаємо додаткову інформацію до кожного продукту, щоб зробити його схожим на реальний товар.
            const enrichedProducts = photos.map((photo, index) => ({
                ...photo, // Беремо всі дані фото, які ми отримали
                category: ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'][index % 5], // Вибираємо категорію зі списку
                price: Math.floor(Math.random() * 1000) + 10, // Випадкова ціна від 10 до 1009
                rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Випадковий рейтинг від 3.0 до 5.0
                reviews: Math.floor(Math.random() * 500), // Випадкова кількість відгуків (до 500)
                description: `This is a wonderful product ${photo.title.toLowerCase()}. High quality and great value.`, // Опис товару
                inStock: Math.random() > 0.2, // 80% товарів в наявності, 20% - немає
                features: ['Premium Quality', 'Fast Delivery', 'Eco Friendly', 'Warranty Included'].slice(0, (index % 3) + 2), // Особливості товару
                tags: ['popular', 'new', 'bestseller', 'featured'].slice(0, (index % 3) + 1) // Теги для товару
            }));
            // Зберігаємо отримані продукти у наш стан.
            this.setState({
                products: enrichedProducts,
                filteredProducts: enrichedProducts,
                isLoading: false // Вимикаємо індикатор завантаження
            });
        }
        catch (error) {
            // Якщо щось пішло не так (немає інтернету тощо)...
            console.error('Error loading products:', error);
            this.setState({ isLoading: false });
            this.showError('Failed to load products. Please try again later.'); // Показуємо помилку
        }
    }
    // Ця функція підключає всі кнопки та інші елементи на сторінці галереї.
    bindEvents() {
        // Кнопка зміни теми
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());
        // Поле пошуку та кнопка очищення
        const productSearch = document.getElementById('productSearch');
        const clearSearch = document.getElementById('clearSearch');
        productSearch?.addEventListener('input', (e) => this.handleSearch(e));
        clearSearch?.addEventListener('click', () => this.clearSearch());
        // Фільтри категорій, цін та сортування
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        const sortSelect = document.getElementById('sortSelect');
        const inStockOnly = document.getElementById('inStockOnly');
        categoryFilter?.addEventListener('change', (e) => this.handleCategoryFilter(e));
        priceFilter?.addEventListener('change', (e) => this.handlePriceFilter(e));
        sortSelect?.addEventListener('change', (e) => this.handleSortChange(e));
        inStockOnly?.addEventListener('change', (e) => this.handleInStockChange(e));
        // Повзунок для вибору максимальної ціни
        const priceRange = document.getElementById('priceRange');
        priceRange?.addEventListener('input', (e) => this.handlePriceRange(e));
        // Кнопка скидання всіх фільтрів
        const resetFilters = document.getElementById('resetFilters');
        resetFilters?.addEventListener('click', () => this.resetFilters());
        // Модальне вікно (спливаюче вікно з деталями товару)
        const closeModal = document.getElementById('closeProductModal');
        const modal = document.getElementById('productModal');
        closeModal?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => this.handleModalClick(e));
        // Подія прокручування сторінки для анімацій
        window.addEventListener('scroll', () => this.handleScroll());
    }
    // Функція, яка викликається при прокручуванні сторінки.
    handleScroll() {
        const cards = document.querySelectorAll('.product-card'); // Знаходимо всі картки продуктів
        cards.forEach(card => {
            const rect = card.getBoundingClientRect(); // Отримуємо позицію картки на екрані
            // Якщо картка знаходиться у видимій області екрана...
            if (rect.top < window.innerHeight - 50) {
                card.classList.add('slide-in'); // Додаємо клас для анімації з'явлення
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
        const productSearch = document.getElementById('productSearch');
        if (productSearch)
            productSearch.value = ''; // Очищаємо поле вводу
        this.setState({ searchQuery: '' }); // Очищаємо пошуковий запит
        const clearSearch = document.getElementById('clearSearch');
        this.hideElement(clearSearch); // Ховаємо кнопку очищення
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для фільтрації за категорією товару.
    handleCategoryFilter(event) {
        const select = event.target; // Отримуємо вибрану категорію
        this.setState({ categoryFilter: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для фільтрації за діапазоном цін.
    handlePriceFilter(event) {
        const select = event.target; // Отримуємо вибраний діапазон цін
        this.setState({ priceFilter: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для зміни способу сортування товарів.
    handleSortChange(event) {
        const select = event.target; // Отримуємо спосіб сортування
        this.setState({ sortBy: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо сортування
    }
    // Функція для фільтрації тільки товарів в наявності.
    handleInStockChange(event) {
        const checkbox = event.target; // Отримуємо стан чекбоксу
        this.setState({ inStockOnly: checkbox.checked }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для зміни максимальної ціни за допомогою повзунка.
    handlePriceRange(event) {
        const slider = event.target; // Отримуємо значення повзунка
        this.setState({ maxPrice: parseInt(slider.value) }); // Зберігаємо максимальну ціну
        const priceRangeValue = document.getElementById('priceRangeValue');
        // Оновлюємо текст, який показує поточний діапазон цін
        if (priceRangeValue)
            priceRangeValue.textContent = `0 - ${this.state.maxPrice}`;
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Головна функція для фільтрації та сортування продуктів.
    applyFiltersAndSort() {
        // Спочатку фільтруємо продукти...
        let filtered = this.state.products.filter(product => {
            // Перевіряємо, чи продукт відповідає пошуковому запиту
            const matchesSearch = !this.state.searchQuery ||
                product.title.toLowerCase().includes(this.state.searchQuery) ||
                product.description.toLowerCase().includes(this.state.searchQuery) ||
                product.tags.some(tag => tag.toLowerCase().includes(this.state.searchQuery));
            // Перевіряємо, чи відповідає категорія вибраному фільтру
            const matchesCategory = this.state.categoryFilter === 'all' ||
                product.category === this.state.categoryFilter;
            // Перевіряємо, чи товар в наявності (якщо обрано цей фільтр)
            const matchesStock = !this.state.inStockOnly || product.inStock;
            // Перевіряємо, чи ціна товару не перевищує максимальну
            const matchesPrice = product.price <= this.state.maxPrice;
            // Додаткова фільтрація за вибраним діапазоном цін
            let matchesPriceFilter = true;
            if (this.state.priceFilter !== 'all') {
                const priceRange = this.state.priceFilter;
                if (priceRange === '0-100') {
                    matchesPriceFilter = product.price >= 0 && product.price <= 100;
                }
                else if (priceRange === '100-500') {
                    matchesPriceFilter = product.price >= 100 && product.price <= 500;
                }
                else if (priceRange === '500-1000') {
                    matchesPriceFilter = product.price >= 500 && product.price <= 1000;
                }
                else if (priceRange === '1000+') {
                    matchesPriceFilter = product.price >= 1000;
                }
            }
            // Залишаємо тільки ті товари, які відповідають всім умовам
            return matchesSearch && matchesCategory && matchesStock && matchesPrice && matchesPriceFilter;
        });
        // Потім сортуємо відфільтровані товари...
        filtered.sort((a, b) => {
            switch (this.state.sortBy) {
                case 'name-asc': return a.title.localeCompare(b.title); // За назвою А-Я
                case 'name-desc': return b.title.localeCompare(a.title); // За назвою Я-А
                case 'price-asc': return a.price - b.price; // За ціною (від дешевих до дорогих)
                case 'price-desc': return b.price - a.price; // За ціною (від дорогих до дешевих)
                case 'rating-desc': return b.rating - a.rating; // За рейтингом (від високого до низького)
                default: return 0; // Без сортування
            }
        });
        this.setState({ filteredProducts: filtered }); // Зберігаємо результат
        this.displayProducts(); // Показуємо товари
        this.updateResultsCount(); // Оновлюємо лічильник результатів
        this.toggleEmptyState(); // Перевіряємо, чи є що показувати
    }
    // Функція для відображення продуктів на сторінці.
    displayProducts() {
        const productsContainer = document.getElementById('productsContainer'); // Контейнер для товарів
        const loadingSpinner = document.getElementById('loadingSpinner'); // Індикатор завантаження
        // Якщо дані ще завантажуються...
        if (this.state.isLoading) {
            this.showElement(loadingSpinner); // Показуємо індикатор
            this.hideElement(productsContainer); // Ховаємо контейнер
            return;
        }
        this.hideElement(loadingSpinner); // Ховаємо індикатор
        this.showElement(productsContainer); // Показуємо контейнер
        if (!productsContainer)
            return; // Якщо контейнер не знайдено, виходимо
        // Створюємо HTML для кожного продукту
        productsContainer.innerHTML = this.state.filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.thumbnailUrl}" alt="${product.title}" 
                         onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=200&fit=crop'">
                    <div class="product-badge ${product.inStock ? '' : 'out-of-stock'}">
                        ${product.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                </div>
                <div class="product-content">
                    <div class="product-category">${product.category}</div>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-rating">
                        <div class="rating-stars">
                            ${this.generateStarRating(product.rating)}
                        </div>
                        <span class="rating-value">${product.rating}</span>
                        <span class="rating-count">(${product.reviews} reviews)</span>
                    </div>
                    <div class="product-features">
                        ${product.features.slice(0, 2).map(feature => `
                            <div class="product-feature">${feature}</div>
                        `).join('')}
                    </div>
                    <div class="product-tags">
                        ${product.tags.map(tag => `
                            <span class="product-tag">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join(''); // Об'єднуємо всі HTML рядки в один
        // Додаємо обробники кліку на кожну картку продукту
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('click', () => {
                const productId = parseInt(card.getAttribute('data-product-id') || '0');
                this.showProductDetails(productId); // Показуємо деталі продукту
            });
        });
        this.animateProducts(); // Запускаємо анімацію карток
    }
    // Функція для анімації карток продуктів з затримкою.
    animateProducts() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in'); // Додаємо клас анімації з затримкою
            }, index * 100); // Кожна наступна картка з'являється з затримкою 0.1 секунди
        });
    }
    // Функція для генерації зірочок рейтингу.
    generateStarRating(rating) {
        const fullStars = Math.floor(rating); // Кількість повних зірок
        const halfStar = rating % 1 >= 0.5; // Чи є половина зірки
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // Кількість порожніх зірок
        // Повертаємо рядок з зірочками: ★ - повна, ½ - половина, ☆ - порожня
        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }
    // Функція для показу деталей продукту у спливаючому вікні.
    showProductDetails(productId) {
        const product = this.state.products.find(p => p.id === productId); // Знаходимо продукт
        if (!product)
            return; // Якщо не знайшли, виходимо
        const modal = document.getElementById('productModal'); // Спливаюче вікно
        const modalTitle = document.getElementById('productModalTitle'); // Заголовок
        const modalContent = document.getElementById('productModalContent'); // Контент
        // Заповнюємо вікно інформацією про продукт
        modalTitle.innerHTML = `<i class="fas fa-shopping-bag"></i> ${product.title}`;
        modalContent.innerHTML = `
            <div class="product-details-modal">
                <div class="product-image-modal">
                    <img src="${product.url}" alt="${product.title}" 
                         onerror="this.src='https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop'">
                </div>
                <div class="product-info-detailed">
                    <p><strong>Category:</strong> ${product.category}</p>
                    <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
                    <p><strong>Rating:</strong> 
                        <span class="rating-stars">${this.generateStarRating(product.rating)}</span>
                        ${product.rating} (${product.reviews} reviews)
                    </p>
                    <p><strong>Availability:</strong> 
                        <span class="status-badge ${product.inStock ? 'active' : 'inactive'}">
                            ${product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </p>
                    <p><strong>Description:</strong> ${product.description}</p>
                    
                    <div class="product-features-detailed">
                        <strong>Features:</strong>
                        <ul>
                            ${product.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="product-tags-detailed">
                        <strong>Tags:</strong>
                        ${product.tags.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
                    </div>

                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="galleryManager.addToCart(${product.id})" 
                                ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline" onclick="galleryManager.shareProduct(${product.id})">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `;
        this.showElement(modal); // Показуємо спливаюче вікно
    }
    // Публічна функція для додавання товару до кошика (викликається з HTML).
    addToCart(productId) {
        const product = this.state.products.find(p => p.id === productId); // Знаходимо продукт
        if (product) {
            this.showToast(`Added ${product.title} to cart!`, 'success'); // Показуємо повідомлення
            // Анімація додавання до кошика
            const button = event?.target;
            if (button) {
                const originalText = button.innerHTML; // Зберігаємо оригінальний текст кнопки
                button.innerHTML = '<i class="fas fa-check"></i> Added!'; // Змінюємо текст
                button.disabled = true; // Робимо кнопку неактивною
                // Через 2 секунди повертаємо початковий стан кнопки
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            }
        }
    }
    // Публічна функція для поширення інформації про товар (викликається з HTML).
    shareProduct(productId) {
        const product = this.state.products.find(p => p.id === productId); // Знаходимо продукт
        if (product) {
            const shareText = `Check out ${product.title} - $${product.price}`; // Текст для поширення
            // Перевіряємо, чи підтримує браузер функцію share
            if (navigator.share) {
                navigator.share({
                    title: product.title,
                    text: shareText,
                    url: window.location.href
                });
            }
            else {
                // Якщо не підтримує, копіюємо текст в буфер обміну
                navigator.clipboard.writeText(shareText);
                this.showToast('Product info copied to clipboard!', 'success'); // Показуємо повідомлення
            }
        }
    }
    // Функція для закриття спливаючого вікна.
    closeModal() {
        const modal = document.getElementById('productModal');
        this.hideElement(modal); // Ховаємо вікно
    }
    // Функція для закриття вікна при кліку на затемнений фон.
    handleModalClick(event) {
        const modal = document.getElementById('productModal');
        // Якщо клікнули саме на фон (а не на вміст вікна)...
        if (event.target === modal) {
            this.closeModal(); // Закриваємо вікно
        }
    }
    // Функція для оновлення лічильника знайдених товарів.
    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            // Показуємо кількість знайдених товарів
            resultsCount.textContent = `${this.state.filteredProducts.length} products found`;
        }
    }
    // Функція для скидання всіх фільтрів до початкових значень.
    resetFilters() {
        // Отримуємо всі елементи фільтрів зі сторінки
        const productSearch = document.getElementById('productSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        const sortSelect = document.getElementById('sortSelect');
        const inStockOnly = document.getElementById('inStockOnly');
        const priceRange = document.getElementById('priceRange');
        // Скидаємо всі поля до значень за замовчуванням
        if (productSearch)
            productSearch.value = '';
        if (categoryFilter)
            categoryFilter.value = 'all';
        if (priceFilter)
            priceFilter.value = 'all';
        if (sortSelect)
            sortSelect.value = 'name-asc';
        if (inStockOnly)
            inStockOnly.checked = false;
        if (priceRange)
            priceRange.value = '100';
        // Скидаємо всі значення у стані
        this.setState({
            searchQuery: '',
            categoryFilter: 'all',
            priceFilter: 'all',
            sortBy: 'name-asc',
            inStockOnly: false,
            maxPrice: 100
        });
        // Оновлюємо текст діапазону цін
        const priceRangeValue = document.getElementById('priceRangeValue');
        if (priceRangeValue)
            priceRangeValue.textContent = '0 - 100';
        this.clearSearch(); // Очищаємо пошук
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }
    // Функція для показу/приховування повідомлення "нічого не знайдено".
    toggleEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const productsContainer = document.getElementById('productsContainer');
        // Якщо після фільтрації не залишилося товарів, але вони були...
        if (this.state.filteredProducts.length === 0 && this.state.products.length > 0) {
            this.showElement(emptyState); // Показуємо "нічого не знайдено"
            this.hideElement(productsContainer); // Ховаємо список
        }
        else {
            this.hideElement(emptyState); // Ховаємо повідомлення
            this.showElement(productsContainer); // Показуємо список
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
    // Допоміжна функція для оновлення стану галереї.
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
// Створюємо глобальний об'єкт галереї, щоб він був доступний з HTML.
const galleryManager = new GalleryManager();
// Робимо галерею доступною у глобальному об'єкті window, щоб HTML кнопки могли до неї звертатися.
window.galleryManager = galleryManager;
