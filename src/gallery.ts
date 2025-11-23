// Цей інтерфейс описує, як виглядає один продукт у нашій галереї.
// Це як анкета для кожного товару, де ми вказуємо, яка інформація має бути.
interface Photo {
    albumId: number;        // Номер альбому, до якого належить фото
    id: number;             // Унікальний номер продукту
    title: string;          // Назва продукту
    url: string;            // Посилання на велике зображення
    thumbnailUrl: string;   // Посилання на маленьке зображення (мініатюра)
    category?: string;      // Категорія продукту (не обов'язково)
    price?: number;         // Ціна продукту (не обов'язково)
    rating?: number;        // Рейтинг продукту (не обов'язково)
    reviews?: number;       // Кількість відгуків (не обов'язково)
    description?: string;   // Опис продукту (не обов'язково)
    inStock?: boolean;      // Чи є товар в наявності (не обов'язково)
    features?: string[];    // Список особливостей товару (не обов'язково)
    tags?: string[];        // Список тегів для товару (не обов'язково)
}

// Цей інтерфейс описує весь стан нашої галереї продуктів.
interface GalleryState {
    products: Photo[];              // Всі продукти, які ми завантажили
    filteredProducts: Photo[];      // Продукти після застосування фільтрів
    searchQuery: string;            // Текст, який користувач ввів у пошук
    categoryFilter: string;         // Обрана категорія для фільтрації
    priceFilter: string;            // Обраний діапазон цін
    sortBy: string;                 // Спосіб сортування товарів
    inStockOnly: boolean;           // Показувати тільки товари в наявності
    maxPrice: number;               // Максимальна ціна для фільтра
    currentTheme: string;           // Поточна тема (світла/темна)
    isLoading: boolean;             // Чи зараз йде завантаження даних
}

// Головний клас, який керує всією сторінкою галереї продуктів.
class GalleryManager {
    // Приватне поле для зберігання стану нашої галереї.
    private state: GalleryState = {
        products: [],               // Спочатку список продуктів порожній
        filteredProducts: [],       // І відфільтрований список теж порожній
        searchQuery: '',            // Пошуковий запит порожній
        categoryFilter: 'all',      // Показувати всі категорії
        priceFilter: 'all',         // Показувати всі ціни
        sortBy: 'name-asc',         // Сортувати за назвою від А до Я
        inStockOnly: false,         // Показувати всі товари (не тільки в наявності)
        maxPrice: 100,              // Максимальна ціна за замовчуванням
        currentTheme: 'light',      // Світла тема за замовчуванням
        isLoading: false            // Не завантажуємо дані
    };

    // Конструктор - функція, яка автоматично викликається при створенні об'єкта.
    constructor() {
        this.init(); // Запускаємо ініціалізацію нашої галереї.
    }

    // Асинхронна функція ініціалізації - вона може "чекати" на завершення інших операцій.
    private async init(): Promise<void> {
        this.bindEvents();          // Підключаємо всі кнопки та події
        this.loadTheme();           // Завантажуємо збережену тему
        await this.loadProducts();  // Чекаємо, поки завантажаться продукти
        this.applyFiltersAndSort(); // Застосовуємо фільтри та сортування
    }

    // Функція для завантаження продуктів з інтернету.
    private async loadProducts(): Promise<void> {
        this.setState({ isLoading: true }); // Вмикаємо індикатор завантаження
        
        try {
            // Робимо запит до сайту, щоб отримати дані про фото (обмежуємо 20 штук).
            const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=20');
            const photos = await response.json(); // Перетворюємо відповідь у зрозумілий формат.

            // Додаємо додаткову інформацію до кожного продукту, щоб зробити його схожим на реальний товар.
            const enrichedProducts = photos.map((photo: Photo, index: number) => ({
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

        } catch (error) {
            // Якщо щось пішло не так (немає інтернету тощо)...
            console.error('Error loading products:', error);
            this.setState({ isLoading: false });
            this.showError('Failed to load products. Please try again later.'); // Показуємо помилку
        }
    }

    // Ця функція підключає всі кнопки та інші елементи на сторінці галереї.
    private bindEvents(): void {
        // Кнопка зміни теми
        const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Поле пошуку та кнопка очищення
        const productSearch = document.getElementById('productSearch') as HTMLInputElement;
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        productSearch?.addEventListener('input', (e) => this.handleSearch(e));
        clearSearch?.addEventListener('click', () => this.clearSearch());

        // Фільтри категорій, цін та сортування
        const categoryFilter = document.getElementById('categoryFilter') as HTMLSelectElement;
        const priceFilter = document.getElementById('priceFilter') as HTMLSelectElement;
        const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
        const inStockOnly = document.getElementById('inStockOnly') as HTMLInputElement;

        categoryFilter?.addEventListener('change', (e) => this.handleCategoryFilter(e));
        priceFilter?.addEventListener('change', (e) => this.handlePriceFilter(e));
        sortSelect?.addEventListener('change', (e) => this.handleSortChange(e));
        inStockOnly?.addEventListener('change', (e) => this.handleInStockChange(e));

        // Повзунок для вибору максимальної ціни
        const priceRange = document.getElementById('priceRange') as HTMLInputElement;
        priceRange?.addEventListener('input', (e) => this.handlePriceRange(e));

        // Кнопка скидання всіх фільтрів
        const resetFilters = document.getElementById('resetFilters') as HTMLButtonElement;
        resetFilters?.addEventListener('click', () => this.resetFilters());

        // Модальне вікно (спливаюче вікно з деталями товару)
        const closeModal = document.getElementById('closeProductModal') as HTMLButtonElement;
        const modal = document.getElementById('productModal') as HTMLDivElement;
        closeModal?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => this.handleModalClick(e));

        // Подія прокручування сторінки для анімацій
        window.addEventListener('scroll', () => this.handleScroll());
    }

    // Функція, яка викликається при прокручуванні сторінки.
    private handleScroll(): void {
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
    private handleSearch(event: Event): void {
        const input = event.target as HTMLInputElement; // Отримуємо поле вводу
        this.setState({ searchQuery: input.value.toLowerCase() }); // Зберігаємо текст пошуку у нижньому регістрі
        
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        // Якщо є текст у пошуку, показуємо кнопку очищення
        if (this.state.searchQuery) {
            this.showElement(clearSearch);
        } else {
            this.hideElement(clearSearch);
        }
        
        this.applyFiltersAndSort(); // Застосовуємо фільтри з новим пошуком
    }

    // Функція для очищення поля пошуку.
    private clearSearch(): void {
        const productSearch = document.getElementById('productSearch') as HTMLInputElement;
        if (productSearch) productSearch.value = ''; // Очищаємо поле вводу
        this.setState({ searchQuery: '' }); // Очищаємо пошуковий запит
        
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        this.hideElement(clearSearch); // Ховаємо кнопку очищення
        
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }

    // Функція для фільтрації за категорією товару.
    private handleCategoryFilter(event: Event): void {
        const select = event.target as HTMLSelectElement; // Отримуємо вибрану категорію
        this.setState({ categoryFilter: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }

    // Функція для фільтрації за діапазоном цін.
    private handlePriceFilter(event: Event): void {
        const select = event.target as HTMLSelectElement; // Отримуємо вибраний діапазон цін
        this.setState({ priceFilter: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }

    // Функція для зміни способу сортування товарів.
    private handleSortChange(event: Event): void {
        const select = event.target as HTMLSelectElement; // Отримуємо спосіб сортування
        this.setState({ sortBy: select.value }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо сортування
    }

    // Функція для фільтрації тільки товарів в наявності.
    private handleInStockChange(event: Event): void {
        const checkbox = event.target as HTMLInputElement; // Отримуємо стан чекбоксу
        this.setState({ inStockOnly: checkbox.checked }); // Зберігаємо вибір
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }

    // Функція для зміни максимальної ціни за допомогою повзунка.
    private handlePriceRange(event: Event): void {
        const slider = event.target as HTMLInputElement; // Отримуємо значення повзунка
        this.setState({ maxPrice: parseInt(slider.value) }); // Зберігаємо максимальну ціну
        const priceRangeValue = document.getElementById('priceRangeValue') as HTMLSpanElement;
        // Оновлюємо текст, який показує поточний діапазон цін
        if (priceRangeValue) priceRangeValue.textContent = `0 - ${this.state.maxPrice}`;
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }

    // Головна функція для фільтрації та сортування продуктів.
    private applyFiltersAndSort(): void {
        // Спочатку фільтруємо продукти...
        let filtered = this.state.products.filter(product => {
            // Перевіряємо, чи продукт відповідає пошуковому запиту
            const matchesSearch = !this.state.searchQuery || 
                product.title.toLowerCase().includes(this.state.searchQuery) ||
                product.description!.toLowerCase().includes(this.state.searchQuery) ||
                product.tags!.some(tag => tag.toLowerCase().includes(this.state.searchQuery));

            // Перевіряємо, чи відповідає категорія вибраному фільтру
            const matchesCategory = this.state.categoryFilter === 'all' || 
                product.category === this.state.categoryFilter;

            // Перевіряємо, чи товар в наявності (якщо обрано цей фільтр)
            const matchesStock = !this.state.inStockOnly || product.inStock;

            // Перевіряємо, чи ціна товару не перевищує максимальну
            const matchesPrice = product.price! <= this.state.maxPrice;

            // Додаткова фільтрація за вибраним діапазоном цін
            let matchesPriceFilter = true;
            if (this.state.priceFilter !== 'all') {
                const priceRange = this.state.priceFilter;
                if (priceRange === '0-100') {
                    matchesPriceFilter = product.price! >= 0 && product.price! <= 100;
                } else if (priceRange === '100-500') {
                    matchesPriceFilter = product.price! >= 100 && product.price! <= 500;
                } else if (priceRange === '500-1000') {
                    matchesPriceFilter = product.price! >= 500 && product.price! <= 1000;
                } else if (priceRange === '1000+') {
                    matchesPriceFilter = product.price! >= 1000;
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
                case 'price-asc': return a.price! - b.price!; // За ціною (від дешевих до дорогих)
                case 'price-desc': return b.price! - a.price!; // За ціною (від дорогих до дешевих)
                case 'rating-desc': return b.rating! - a.rating!; // За рейтингом (від високого до низького)
                default: return 0; // Без сортування
            }
        });

        this.setState({ filteredProducts: filtered }); // Зберігаємо результат
        this.displayProducts(); // Показуємо товари
        this.updateResultsCount(); // Оновлюємо лічильник результатів
        this.toggleEmptyState(); // Перевіряємо, чи є що показувати
    }

    // Функція для відображення продуктів на сторінці.
    private displayProducts(): void {
        const productsContainer = document.getElementById('productsContainer'); // Контейнер для товарів
        const loadingSpinner = document.getElementById('loadingSpinner'); // Індикатор завантаження
        
        // Якщо дані ще завантажуються...
        if (this.state.isLoading) {
            this.showElement(loadingSpinner!); // Показуємо індикатор
            this.hideElement(productsContainer!); // Ховаємо контейнер
            return;
        }
        
        this.hideElement(loadingSpinner!); // Ховаємо індикатор
        this.showElement(productsContainer!); // Показуємо контейнер
        
        if (!productsContainer) return; // Якщо контейнер не знайдено, виходимо
        
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
                    <div class="product-price">$${product.price!.toFixed(2)}</div>
                    <div class="product-rating">
                        <div class="rating-stars">
                            ${this.generateStarRating(product.rating!)}
                        </div>
                        <span class="rating-value">${product.rating}</span>
                        <span class="rating-count">(${product.reviews} reviews)</span>
                    </div>
                    <div class="product-features">
                        ${product.features!.slice(0, 2).map(feature => `
                            <div class="product-feature">${feature}</div>
                        `).join('')}
                    </div>
                    <div class="product-tags">
                        ${product.tags!.map(tag => `
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
                const productId: number = parseInt(card.getAttribute('data-product-id') || '0');
                this.showProductDetails(productId); // Показуємо деталі продукту
            });
        });

        this.animateProducts(); // Запускаємо анімацію карток
    }

    // Функція для анімації карток продуктів з затримкою.
    private animateProducts(): void {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in'); // Додаємо клас анімації з затримкою
            }, index * 100); // Кожна наступна картка з'являється з затримкою 0.1 секунди
        });
    }

    // Функція для генерації зірочок рейтингу.
    private generateStarRating(rating: number): string {
        const fullStars = Math.floor(rating); // Кількість повних зірок
        const halfStar = rating % 1 >= 0.5; // Чи є половина зірки
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // Кількість порожніх зірок

        // Повертаємо рядок з зірочками: ★ - повна, ½ - половина, ☆ - порожня
        return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
    }

    // Функція для показу деталей продукту у спливаючому вікні.
    private showProductDetails(productId: number): void {
        const product = this.state.products.find(p => p.id === productId); // Знаходимо продукт
        if (!product) return; // Якщо не знайшли, виходимо

        const modal = document.getElementById('productModal') as HTMLDivElement; // Спливаюче вікно
        const modalTitle = document.getElementById('productModalTitle') as HTMLHeadingElement; // Заголовок
        const modalContent = document.getElementById('productModalContent') as HTMLDivElement; // Контент

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
                    <p><strong>Price:</strong> $${product.price!.toFixed(2)}</p>
                    <p><strong>Rating:</strong> 
                        <span class="rating-stars">${this.generateStarRating(product.rating!)}</span>
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
                            ${product.features!.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="product-tags-detailed">
                        <strong>Tags:</strong>
                        ${product.tags!.map(tag => `<span class="product-tag">${tag}</span>`).join('')}
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
    public addToCart(productId: number): void {
        const product = this.state.products.find(p => p.id === productId); // Знаходимо продукт
        if (product) {
            this.showToast(`Added ${product.title} to cart!`, 'success'); // Показуємо повідомлення
            
            // Анімація додавання до кошика
            const button = event?.target as HTMLButtonElement;
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
    public shareProduct(productId: number): void {
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
            } else {
                // Якщо не підтримує, копіюємо текст в буфер обміну
                navigator.clipboard.writeText(shareText);
                this.showToast('Product info copied to clipboard!', 'success'); // Показуємо повідомлення
            }
        }
    }

    // Функція для закриття спливаючого вікна.
    private closeModal(): void {
        const modal = document.getElementById('productModal') as HTMLDivElement;
        this.hideElement(modal); // Ховаємо вікно
    }

    // Функція для закриття вікна при кліку на затемнений фон.
    private handleModalClick(event: MouseEvent): void {
        const modal = document.getElementById('productModal') as HTMLDivElement;
        // Якщо клікнули саме на фон (а не на вміст вікна)...
        if (event.target === modal) {
            this.closeModal(); // Закриваємо вікно
        }
    }

    // Функція для оновлення лічильника знайдених товарів.
    private updateResultsCount(): void {
        const resultsCount = document.getElementById('resultsCount') as HTMLSpanElement;
        if (resultsCount) {
            // Показуємо кількість знайдених товарів
            resultsCount.textContent = `${this.state.filteredProducts.length} products found`;
        }
    }

    // Функція для скидання всіх фільтрів до початкових значень.
    private resetFilters(): void {
        // Отримуємо всі елементи фільтрів зі сторінки
        const productSearch = document.getElementById('productSearch') as HTMLInputElement;
        const categoryFilter = document.getElementById('categoryFilter') as HTMLSelectElement;
        const priceFilter = document.getElementById('priceFilter') as HTMLSelectElement;
        const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
        const inStockOnly = document.getElementById('inStockOnly') as HTMLInputElement;
        const priceRange = document.getElementById('priceRange') as HTMLInputElement;

        // Скидаємо всі поля до значень за замовчуванням
        if (productSearch) productSearch.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (priceFilter) priceFilter.value = 'all';
        if (sortSelect) sortSelect.value = 'name-asc';
        if (inStockOnly) inStockOnly.checked = false;
        if (priceRange) priceRange.value = '100';

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
        const priceRangeValue = document.getElementById('priceRangeValue') as HTMLSpanElement;
        if (priceRangeValue) priceRangeValue.textContent = '0 - 100';

        this.clearSearch(); // Очищаємо пошук
        this.applyFiltersAndSort(); // Застосовуємо фільтри
    }

    // Функція для показу/приховування повідомлення "нічого не знайдено".
    private toggleEmptyState(): void {
        const emptyState = document.getElementById('emptyState') as HTMLDivElement;
        const productsContainer = document.getElementById('productsContainer') as HTMLDivElement;

        // Якщо після фільтрації не залишилося товарів, але вони були...
        if (this.state.filteredProducts.length === 0 && this.state.products.length > 0) {
            this.showElement(emptyState); // Показуємо "нічого не знайдено"
            this.hideElement(productsContainer); // Ховаємо список
        } else {
            this.hideElement(emptyState); // Ховаємо повідомлення
            this.showElement(productsContainer); // Показуємо список
        }
    }

    // Функція для перемикання теми (світла/темна).
    private toggleTheme(): void {
        this.setState({ 
            currentTheme: this.state.currentTheme === 'light' ? 'dark' : 'light' 
        });
        this.applyTheme();  // Застосовуємо тему
        this.saveTheme();   // Зберігаємо у пам'яті
        this.updateThemeButton(); // Оновлюємо кнопку
    }

    // Функція для застосування теми до всієї сторінки.
    private applyTheme(): void {
        document.documentElement.setAttribute('data-theme', this.state.currentTheme);
    }

    // Функція для збереження теми у пам'яті браузера.
    private saveTheme(): void {
        localStorage.setItem('theme', this.state.currentTheme);
    }

    // Функція для завантаження теми з пам'яті браузера.
    private loadTheme(): void {
        const savedTheme: string | null = localStorage.getItem('theme');
        if (savedTheme) {
            this.setState({ currentTheme: savedTheme }); // Встановлюємо збережену тему
        }
        this.applyTheme(); // Застосовуємо тему
        this.updateThemeButton(); // Оновлюємо кнопку
    }

    // Функція для оновлення вигляду кнопки перемикача теми.
    private updateThemeButton(): void {
        const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
        const icon = themeToggle?.querySelector('i') as HTMLElement;
        
        if (icon) {
            // Для темної теми показуємо сонце, для світлої - місяць
            if (this.state.currentTheme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }

    // Допоміжна функція для оновлення стану галереї.
    private setState(newState: Partial<GalleryState>): void {
        this.state = { ...this.state, ...newState };
    }

    // Функція для показу елемента на сторінці.
    private showElement(element: HTMLElement): void {
        element.classList.remove('hidden'); // Видаляємо клас, який ховає елемент
    }

    // Функція для приховування елемента на сторінці.
    private hideElement(element: HTMLElement): void {
        element.classList.add('hidden'); // Додаємо клас, який ховає елемент
    }

    // Функція для показу повідомлення про помилку.
    private showError(message: string): void {
        console.error(message); // Виводимо в консоль
        alert(message);         // Показуємо спливаюче вікно
    }

    // Функція для показу спливаючого повідомлення (тост).
    private showToast(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
        console.log(`[${type.toUpperCase()}] ${message}`); // Виводимо в консоль
        alert(message); // Показуємо спливаюче вікно (у реальному додатку тут був би красивий тост)
    }
}

// Створюємо глобальний об'єкт галереї, щоб він був доступний з HTML.
const galleryManager = new GalleryManager();
// Робимо галерею доступною у глобальному об'єкті window, щоб HTML кнопки могли до неї звертатися.
(window as any).galleryManager = galleryManager;