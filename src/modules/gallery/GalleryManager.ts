// Імпортуємо типи Photo та GalleryState з файлу типів
// Це дозволяє використовувати строгу типізацію для даних фотографій та стану галереї
import { Photo, GalleryState } from '../../types/index.js';

// Імпортуємо клас ThemeManager для керування темами інтерфейсу
// Він відповідає за перемикання між світлою та темною темами
import { ThemeManager } from '../theme/ThemeManager.js';

// Імпортуємо набір допоміжних функцій з утиліт
// showElement - показує елемент на сторінці
// hideElement - ховає елемент зі сторінки  
// showError - показує повідомлення про помилку
// showToast - показує спливаюче повідомлення
// generateStarRating - генерує HTML для відображення зірочок рейтингу
import { showElement, hideElement, showError, showToast, generateStarRating } from '../../utils/helpers.js';

// Оголошуємо головний клас для керування галереєю продуктів
// Ключове слово export дозволяє використовувати цей клас в інших модулях
export class GalleryManager {
    // Приватне поле state для зберігання стану галереї
    // Вказуємо тип GalleryState для контролю структури об'єкта
    private state: GalleryState = {
        products: [],           // Масив всіх завантажених продуктів
        filteredProducts: [],   // Масив продуктів після застосування фільтрів
        searchQuery: '',        // Пошуковий запит користувача
        categoryFilter: 'all',  // Обраний фільтр категорії
        priceFilter: 'all',     // Обраний фільтр ціни
        sortBy: 'name-asc',     // Спосіб сортування продуктів
        inStockOnly: false,     // Прапорець "тільки в наявності"
        maxPrice: 100,          // Максимальна ціна для фільтрації
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
        // Викликаємо метод ініціалізації галереї
        this.init();
    }

    // Приватний асинхронний метод ініціалізації галереї
    // Promise<void> означає, що функція не повертає значення
    private async init(): Promise<void> {
        // Налаштовуємо обробники подій для елементів інтерфейсу
        this.bindEvents();
        // Завантажуємо збережену тему з локального сховища браузера
        this.loadTheme();
        // Завантажуємо продукти з API (чекаємо на завершення)
        await this.loadProducts();
        // Застосовуємо фільтри та сортування до завантажених продуктів
        this.applyFiltersAndSort();
    }

    // Приватний асинхронний метод завантаження продуктів з зовнішнього API
    private async loadProducts(): Promise<void> {
        // Встановлюємо стан завантаження в true для показу індикатора завантаження
        this.setState({ isLoading: true });
        
        // Блок try-catch для обробки можливих помилок при завантаженні даних
        try {
            // Виконуємо запит до JSONPlaceholder API для отримання фотографій
            // _limit=20 обмежує кількість результатів 20 елементами
            const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=20');
            // Перетворюємо відповідь сервера у JSON формат
            const photos = await response.json();

            // Обробляємо отримані дані та додаємо додаткові поля для багатшого функціоналу
            const enrichedProducts = photos.map((photo: Photo, index: number) => ({
                ...photo,  // Копіюємо всі властивості оригінального об'єкта фотографії
                
                // Додаємо категорію з циклічного масиву (index % 5 забезпечує циклічність)
                category: ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'][index % 5],
                
                // Генеруємо випадкову ціну від 10 до 1009
                price: Math.floor(Math.random() * 1000) + 10,
                
                // Генеруємо рейтинг від 3.0 до 5.0 з одним знаком після коми
                rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
                
                // Генеруємо випадкову кількість відгуків від 0 до 499
                reviews: Math.floor(Math.random() * 500),
                
                // Створюємо опис продукту на основі заголовку фотографії
                description: `This is a wonderful product ${photo.title.toLowerCase()}. High quality and great value.`,
                
                // Встановлюємо наявність товару (80% ймовірність що товар в наявності)
                inStock: Math.random() > 0.2,
                
                // Вибираємо 2-4 випадкові характеристики з масиву
                features: ['Premium Quality', 'Fast Delivery', 'Eco Friendly', 'Warranty Included'].slice(0, (index % 3) + 2),
                
                // Вибираємо 1-4 випадкові теги для продукту
                tags: ['popular', 'new', 'bestseller', 'featured'].slice(0, (index % 3) + 1)
            }));

            // Оновлюємо стан з новими даними продуктів
            this.setState({
                products: enrichedProducts,          // Зберігаємо всі продукти
                filteredProducts: enrichedProducts,  // Спочатку всі продукти відфільтровані
                isLoading: false                     // Скидаємо стан завантаження
            });

        } catch (error) {
            // Обробка помилок - логуємо в консоль та показуємо повідомлення користувачеві
            console.error('Error loading products:', error);
            // Скидаємо стан завантаження навіть при помилці
            this.setState({ isLoading: false });
            // Показуємо повідомлення про помилку користувачеві
            showError('Failed to load products. Please try again later.');
        }
    }

    // Приватний метод для прив'язки обробників подій до елементів DOM
    private bindEvents(): void {
        // Знаходимо кнопку перемикача теми в DOM та вказуємо тип HTMLButtonElement
        const themeToggle = document.getElementById('themeToggle') as HTMLButtonElement;
        // Додаємо обробник кліку на кнопку теми (перевіряємо чи існує елемент)
        themeToggle?.addEventListener('click', () => this.themeManager.toggleTheme());

        // Знаходимо поле пошуку та кнопку очищення пошуку
        const productSearch = document.getElementById('productSearch') as HTMLInputElement;
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        // Додаємо обробники подій для пошуку та очищення
        productSearch?.addEventListener('input', (e) => this.handleSearch(e));
        clearSearch?.addEventListener('click', () => this.clearSearch());

        // Знаходимо всі елементи фільтрів та сортування
        const categoryFilter = document.getElementById('categoryFilter') as HTMLSelectElement;
        const priceFilter = document.getElementById('priceFilter') as HTMLSelectElement;
        const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
        const inStockOnly = document.getElementById('inStockOnly') as HTMLInputElement;

        // Додаємо обробники змін для кожного фільтра
        categoryFilter?.addEventListener('change', (e) => this.handleCategoryFilter(e));
        priceFilter?.addEventListener('change', (e) => this.handlePriceFilter(e));
        sortSelect?.addEventListener('change', (e) => this.handleSortChange(e));
        inStockOnly?.addEventListener('change', (e) => this.handleInStockChange(e));

        // Знаходимо повзунок ціни та додаємо обробник події input
        const priceRange = document.getElementById('priceRange') as HTMLInputElement;
        priceRange?.addEventListener('input', (e) => this.handlePriceRange(e));

        // Знаходимо кнопку скидання фільтрів та додаємо обробник кліку
        const resetFilters = document.getElementById('resetFilters') as HTMLButtonElement;
        resetFilters?.addEventListener('click', () => this.resetFilters());

        // Знаходимо елементи модального вікна та кнопку закриття
        const closeModal = document.getElementById('closeProductModal') as HTMLButtonElement;
        const modal = document.getElementById('productModal') as HTMLDivElement;
        // Додаємо обробники для закриття модального вікна
        closeModal?.addEventListener('click', () => this.closeModal());
        modal?.addEventListener('click', (e) => this.handleModalClick(e));

        // Додаємо обробник події прокручування вікна для анімації карток
        window.addEventListener('scroll', () => this.handleScroll());
    }

    // Обробник події прокручування сторінки для анімації карток продуктів
    private handleScroll(): void {
        // Знаходимо всі картки продуктів на сторінці
        const cards = document.querySelectorAll('.product-card');
        // Для кожної картки перевіряємо чи вона у видимій області
        cards.forEach(card => {
            // Отримуємо геометричні параметри картки відносно вікна перегляду
            const rect = card.getBoundingClientRect();
            // Перевіряємо чи картка знаходиться у видимій області (з запасом 50px знизу)
            if (rect.top < window.innerHeight - 50) {
                // Додаємо CSS-клас для запуску анімації появи
                card.classList.add('slide-in');
            }
        });
    }

    // Обробник події введення тексту в поле пошуку
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

    // Метод для очищення поля пошуку
    private clearSearch(): void {
        // Знаходимо поле пошуку в DOM
        const productSearch = document.getElementById('productSearch') as HTMLInputElement;
        // Очищаємо значення поля пошуку
        if (productSearch) productSearch.value = '';
        // Оновлюємо стан - очищуємо пошуковий запит
        this.setState({ searchQuery: '' });
        
        // Знаходимо кнопку очищення пошуку та ховаємо її
        const clearSearch = document.getElementById('clearSearch') as HTMLButtonElement;
        hideElement(clearSearch);
        
        // Застосовуємо фільтри та сортування з очищеним пошуком
        this.applyFiltersAndSort();
    }

    // Обробник зміни фільтра категорії
    private handleCategoryFilter(event: Event): void {
        // Отримуємо елемент select з події
        const select = event.target as HTMLSelectElement;
        // Оновлюємо стан з обраною категорією
        this.setState({ categoryFilter: select.value });
        // Застосовуємо фільтри з новими параметрами
        this.applyFiltersAndSort();
    }

    // Обробник зміни фільтра ціни
    private handlePriceFilter(event: Event): void {
        // Отримуємо елемент select з події
        const select = event.target as HTMLSelectElement;
        // Оновлюємо стан з обраним фільтром ціни
        this.setState({ priceFilter: select.value });
        // Застосовуємо фільтри з новими параметрами
        this.applyFiltersAndSort();
    }

    // Обробник зміни способу сортування
    private handleSortChange(event: Event): void {
        // Отримуємо елемент select з події
        const select = event.target as HTMLSelectElement;
        // Оновлюємо стан з обраним способом сортування
        this.setState({ sortBy: select.value });
        // Застосовуємо фільтри та сортування з новими параметрами
        this.applyFiltersAndSort();
    }

    // Обробник зміни прапорця "тільки в наявності"
    private handleInStockChange(event: Event): void {
        // Отримуємо елемент checkbox з події
        const checkbox = event.target as HTMLInputElement;
        // Оновлюємо стан з значенням прапорця наявності
        this.setState({ inStockOnly: checkbox.checked });
        // Застосовуємо фільтри з новими параметрами
        this.applyFiltersAndSort();
    }

    // Обробник зміни значення повзунка ціни
    private handlePriceRange(event: Event): void {
        // Отримуємо елемент повзунка з події
        const slider = event.target as HTMLInputElement;
        // Оновлюємо стан з новим значенням максимальної ціни (перетворюємо в число)
        this.setState({ maxPrice: parseInt(slider.value) });
        // Знаходимо елемент для відображення поточного діапазону цін
        const priceRangeValue = document.getElementById('priceRangeValue') as HTMLSpanElement;
        // Оновлюємо текст з поточним діапазоном цін
        if (priceRangeValue) priceRangeValue.textContent = `0 - ${this.state.maxPrice}`;
        // Застосовуємо фільтри з новими параметрами ціни
        this.applyFiltersAndSort();
    }

    // Основний метод для застосування фільтрів та сортування до продуктів
    private applyFiltersAndSort(): void {
        // Фільтруємо продукти на основі всіх активних фільтрів
        let filtered = this.state.products.filter(product => {
            // Перевіряємо відповідність пошуковому запиту
            const matchesSearch = !this.state.searchQuery || 
                // Пошук в заголовку продукту
                product.title.toLowerCase().includes(this.state.searchQuery) ||
                // Пошук в описі продукту (використовуємо non-null assertion operator !)
                product.description!.toLowerCase().includes(this.state.searchQuery) ||
                // Пошук в тегах продукту (перевіряємо чи хоча б один тег містить запит)
                product.tags!.some(tag => tag.toLowerCase().includes(this.state.searchQuery));

            // Перевіряємо відповідність обраній категорії
            const matchesCategory = this.state.categoryFilter === 'all' || 
                product.category === this.state.categoryFilter;

            // Перевіряємо відповідність фільтру наявності
            const matchesStock = !this.state.inStockOnly || product.inStock;

            // Перевіряємо чи ціна продукту не перевищує максимальну
            const matchesPrice = product.price! <= this.state.maxPrice;

            // Перевіряємо відповідність обраному діапазону цін
            let matchesPriceFilter = true;
            if (this.state.priceFilter !== 'all') {
                const priceRange = this.state.priceFilter;
                // Перевіряємо різні діапазони цін
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

            // Продукт включається в результат якщо відповідає всім умовам
            return matchesSearch && matchesCategory && matchesStock && matchesPrice && matchesPriceFilter;
        });

        // Сортуємо відфільтровані продукти згідно обраного способу сортування
        filtered.sort((a, b) => {
            // Використовуємо switch для різних способів сортування
            switch (this.state.sortBy) {
                case 'name-asc': return a.title.localeCompare(b.title);  // За назвою A-Z
                case 'name-desc': return b.title.localeCompare(a.title); // За назвою Z-A
                case 'price-asc': return a.price! - b.price!;           // За ціною (зростання)
                case 'price-desc': return b.price! - a.price!;          // За ціною (спадання)
                case 'rating-desc': return b.rating! - a.rating!;       // За рейтингом (спадання)
                default: return 0;  // Стандартне сортування (без змін)
            }
        });

        // Оновлюємо стан з відфільтрованими та відсортованими продуктами
        this.setState({ filteredProducts: filtered });
        // Відображаємо оновлений список продуктів
        this.displayProducts();
        // Оновлюємо лічильник знайдених продуктів
        this.updateResultsCount();
        // Показуємо або ховаємо стан "немає результатів"
        this.toggleEmptyState();
    }

    // Метод для відображення продуктів в інтерфейсі
    private displayProducts(): void {
        // Знаходимо контейнер для продуктів та індикатор завантаження
        const productsContainer = document.getElementById('productsContainer');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        // Якщо дані ще завантажуються, показуємо індикатор та ховаємо контейнер
        if (this.state.isLoading) {
            showElement(loadingSpinner!);        // Використовуємо non-null assertion
            hideElement(productsContainer!);
            return;  // Виходимо з методу, щоб не відображати продукти
        }
        
        // Коли дані завантажились, ховаємо індикатор та показуємо контейнер
        hideElement(loadingSpinner!);
        showElement(productsContainer!);
        
        // Якщо контейнер не знайдено, виходимо з методу
        if (!productsContainer) return;
        
        // Генеруємо HTML для всіх відфільтрованих продуктів
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
                            ${generateStarRating(product.rating!)}
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
        `).join('');  // join('') перетворює масив рядків в один рядок

        // Знаходимо всі створені картки продуктів
        const productCards = document.querySelectorAll('.product-card');
        // Для кожної картки додаємо обробник кліку для відкриття деталей
        productCards.forEach(card => {
            card.addEventListener('click', () => {
                // Отримуємо ID продукту з атрибуту data-product-id
                const productId: number = parseInt(card.getAttribute('data-product-id') || '0');
                // Показуємо детальну інформацію про продукт
                this.showProductDetails(productId);
            });
        });

        // Запускаємо анімацію появи карток
        this.animateProducts();
    }

    // Метод для анімації появи карток продуктів
    private animateProducts(): void {
        // Знаходимо всі картки продуктів
        const cards = document.querySelectorAll('.product-card');
        // Для кожної картки додаємо анімацію з затримкою
        cards.forEach((card, index) => {
            // Встановлюємо таймаут зі зростаючою затримкою для кожного наступного елемента
            setTimeout(() => {
                // Додаємо CSS-клас який запускає анімацію появи
                card.classList.add('fade-in');
            }, index * 100);  // Затримка 100мс між кожним елементом
        });
    }

    // Метод для відображення детальної інформації про продукт в модальному вікні
    private showProductDetails(productId: number): void {
        // Знаходимо продукт за ID
        const product = this.state.products.find(p => p.id === productId);
        // Якщо продукт не знайдено, виходимо з методу
        if (!product) return;

        // Знаходимо елементи модального вікна
        const modal = document.getElementById('productModal') as HTMLDivElement;
        const modalTitle = document.getElementById('productModalTitle') as HTMLHeadingElement;
        const modalContent = document.getElementById('productModalContent') as HTMLDivElement;

        // Встановлюємо заголовок модального вікна з іконкою
        modalTitle.innerHTML = `<i class="fas fa-shopping-bag"></i> ${product.title}`;
        // Генеруємо вміст модального вікна з детальною інформацією про продукт
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
                        <span class="rating-stars">${generateStarRating(product.rating!)}</span>
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
                        <button class="btn btn-primary" onclick="window.galleryManager.addToCart(${product.id})" 
                                ${!product.inStock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn btn-outline" onclick="window.galleryManager.shareProduct(${product.id})">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Показуємо модальне вікно
        showElement(modal);
    }

    // Публічний метод для додавання продукту до кошика
    // public дозволяє викликати цей метод з глобального об'єкта window
    public addToCart(productId: number): void {
        // Знаходимо продукт за ID
        const product = this.state.products.find(p => p.id === productId);
        if (product) {
            // Показуємо спливаюче повідомлення про успішне додавання
            showToast(`Added ${product.title} to cart!`, 'success');
            
            // Отримуємо кнопку, на яку клікнули (з глобального об'єкта event)
            const button = (event as any)?.target as HTMLButtonElement;
            if (button) {
                // Зберігаємо оригінальний текст кнопки
                const originalText = button.innerHTML;
                // Змінюємо текст кнопки на "Added!" та робимо її неактивною
                button.innerHTML = '<i class="fas fa-check"></i> Added!';
                button.disabled = true;
                
                // Через 2 секунди повертаємо оригінальний стан кнопки
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            }
        }
    }

    // Публічний метод для спільного доступу до продукту
    public shareProduct(productId: number): void {
        // Знаходимо продукт за ID
        const product = this.state.products.find(p => p.id === productId);
        if (product) {
            // Формуємо текст для спільного доступу
            const shareText = `Check out ${product.title} - $${product.price}`;
            // Перевіряємо чи підтримує браузер Web Share API
            if (navigator.share) {
                // Використовуємо нативний механізм спільного доступу
                navigator.share({
                    title: product.title,
                    text: shareText,
                    url: window.location.href
                });
            } else {
                // Якщо Web Share API не підтримується, копіюємо в буфер обміну
                navigator.clipboard.writeText(shareText);
                // Показуємо повідомлення про успішне копіювання
                showToast('Product info copied to clipboard!', 'success');
            }
        }
    }

    // Приватний метод для закриття модального вікна
    private closeModal(): void {
        // Знаходимо модальне вікно
        const modal = document.getElementById('productModal') as HTMLDivElement;
        // Ховаємо модальне вікно
        hideElement(modal);
    }

    // Обробник кліку по модальному вікну для закриття при кліку на затемнену область
    private handleModalClick(event: MouseEvent): void {
        // Знаходимо модальне вікно
        const modal = document.getElementById('productModal') as HTMLDivElement;
        // Якщо клікнули безпосередньо на модальне вікно (не на його вміст)
        if (event.target === modal) {
            // Закриваємо модальне вікно
            this.closeModal();
        }
    }

    // Метод для оновлення лічильника знайдених продуктів
    private updateResultsCount(): void {
        // Знаходимо елемент для відображення кількості результатів
        const resultsCount = document.getElementById('resultsCount') as HTMLSpanElement;
        if (resultsCount) {
            // Оновлюємо текст з кількістю відфільтрованих продуктів
            resultsCount.textContent = `${this.state.filteredProducts.length} products found`;
        }
    }

    // Метод для скидання всіх фільтрів до початкових значень
    private resetFilters(): void {
        // Знаходимо всі елементи фільтрів в DOM
        const productSearch = document.getElementById('productSearch') as HTMLInputElement;
        const categoryFilter = document.getElementById('categoryFilter') as HTMLSelectElement;
        const priceFilter = document.getElementById('priceFilter') as HTMLSelectElement;
        const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
        const inStockOnly = document.getElementById('inStockOnly') as HTMLInputElement;
        const priceRange = document.getElementById('priceRange') as HTMLInputElement;

        // Скидаємо значення всіх елементів до значень за замовчуванням
        if (productSearch) productSearch.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (priceFilter) priceFilter.value = 'all';
        if (sortSelect) sortSelect.value = 'name-asc';
        if (inStockOnly) inStockOnly.checked = false;
        if (priceRange) priceRange.value = '100';

        // Оновлюємо стан зі значеннями за замовчуванням
        this.setState({
            searchQuery: '',
            categoryFilter: 'all',
            priceFilter: 'all',
            sortBy: 'name-asc',
            inStockOnly: false,
            maxPrice: 100
        });

        // Оновлюємо відображення діапазону цін
        const priceRangeValue = document.getElementById('priceRangeValue') as HTMLSpanElement;
        if (priceRangeValue) priceRangeValue.textContent = '0 - 100';

        // Очищуємо пошук (це також ховає кнопку очищення)
        this.clearSearch();
        // Застосовуємо фільтри зі скинутими значеннями
        this.applyFiltersAndSort();
    }

    // Метод для перемикання стану "немає результатів"
    private toggleEmptyState(): void {
        // Знаходимо елементи для стану "немає результатів" та контейнер продуктів
        const emptyState = document.getElementById('emptyState') as HTMLDivElement;
        const productsContainer = document.getElementById('productsContainer') as HTMLDivElement;

        // Якщо немає відфільтрованих продуктів, але є завантажені продукти
        if (this.state.filteredProducts.length === 0 && this.state.products.length > 0) {
            // Показуємо повідомлення "немає результатів" та ховаємо контейнер продуктів
            showElement(emptyState);
            hideElement(productsContainer);
        } else {
            // Ховаємо повідомлення "немає результатів" та показуємо контейнер продуктів
            hideElement(emptyState);
            showElement(productsContainer);
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

    // Приватний метод для оновлення стану галереї
    // Partial<GalleryState> означає, що можна передати тільки частину полів стану
    private setState(newState: Partial<GalleryState>): void {
        // Оновлюємо стан злиттям поточного стану та нових значень
        // Оператор spread (...) розпинає об'єкти для створення нового об'єкта
        this.state = { ...this.state, ...newState };
    }
}

// Створюємо глобальний екземпляр GalleryManager для доступу з HTML
// (window as any) використовується для обходу типізації TypeScript
(window as any).galleryManager = new GalleryManager();