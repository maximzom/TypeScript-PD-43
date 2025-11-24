// 1. ОСНОВНІ ТИПИ ДАНИХ ДЛЯ ІНТЕРНЕТ-МАГАЗИНУ.

// Базовий тип для всіх товарів в магазині.
type BaseProduct = {
  id: number;        // Унікальний номер товару.
  name: string;      // Назва товару.
  price: number;     // Ціна товару в гривнях.
  description: string; // Опис товару для покупців.
};

// Тип для електроніки, який розширює базовий тип.
type Electronics = BaseProduct & {
  category: 'electronics'; // Категорія товару - електроніка.
  brand: string;           // Бренд виробника товару.
  warranty: number;        // Гарантія в місяцях.
};

// Тип для одягу, який розширює базовий тип.
type Clothing = BaseProduct & {
  category: 'clothing'; // Категорія товару - одяг.
  size: string;         // Розмір одягу.
  color: string;        // Колір одягу.
  material: string;     // Матеріал, з якого зроблено одяг.
};

// Тип для книг, який розширює базовий тип.
type Books = BaseProduct & {
  category: 'books';   // Категорія товару - книги.
  author: string;      // Автор книги.
  publisher: string;   // Видавництво книги.
  pages: number;       // Кількість сторінок у книзі.
};

// Універсальний тип, який об'єднує всі види товарів.
type Product = Electronics | Clothing | Books;

// 2. ФУНКЦІЇ ДЛЯ ПОШУКУ ТА ФІЛЬТРАЦІЇ ТОВАРІВ.

/**
 * Знаходить товар за його унікальним номером.
 * @param products - масив товарів, в якому потрібно шукати.
 * @param id - унікальний номер товару для пошуку.
 * @returns знайдений товар або undefined, якщо товар не знайдено.
 */
const findProduct = <T extends BaseProduct>(products: T[], id: number): T | undefined => {
  // Перевіряємо, чи products дійсно є масивом.
  if (!Array.isArray(products)) {
    // Якщо не масив - викидаємо помилку.
    throw new Error('Products must be an array');
  }
  // Перевіряємо, чи id є додатним числом.
  if (typeof id !== 'number' || id <= 0) {
    // Якщо id некоректний - викидаємо помилку.
    throw new Error('ID must be a positive number');
  }
  
  // Шукаємо товар з вказаним id у масиві товарів.
  return products.find(product => product.id === id);
};

/**
 * Фільтрує товари за максимальною ціною.
 * @param products - масив товарів для фільтрації.
 * @param maxPrice - максимальна ціна для фільтрації.
 * @returns масив товарів, ціна яких не перевищує maxPrice.
 */
const filterByPrice = <T extends BaseProduct>(products: T[], maxPrice: number): T[] => {
  // Перевіряємо, чи products дійсно є масивом.
  if (!Array.isArray(products)) {
    // Якщо не масив - викидаємо помилку.
    throw new Error('Products must be an array');
  }
  // Перевіряємо, чи maxPrice є невід'ємним числом.
  if (typeof maxPrice !== 'number' || maxPrice < 0) {
    // Якщо maxPrice некоректний - викидаємо помилку.
    throw new Error('Max price must be a non-negative number');
  }
  
  // Фільтруємо товари, залишаючи тільки ті, ціна яких <= maxPrice.
  return products.filter(product => product.price <= maxPrice);
};

/**
 * Фільтрує товари за категорією.
 * @param products - масив товарів для фільтрації.
 * @param category - категорія для фільтрації.
 * @returns масив товарів вказаної категорії.
 */
const filterByCategory = <T extends BaseProduct>(
  products: T[], 
  category: string
): T[] => {
  // Перевіряємо, чи products дійсно є масивом.
  if (!Array.isArray(products)) {
    // Якщо не масив - викидаємо помилку.
    throw new Error('Products must be an array');
  }
  
  // Фільтруємо товари, залишаючи тільки ті, що належать до вказаної категорії.
  return products.filter(product => 
    'category' in product && (product as any).category === category
  );
};

// 3. СИСТЕМА КОШИКА.

// Тип для елемента кошика, який містить товар та його кількість.
type CartItem<T> = {
  product: T;     // Товар, який додано до кошика.
  quantity: number; // Кількість одиниць цього товару.
};

/**
 * Додає товар до кошика покупок.
 * @param cart - поточний стан кошика.
 * @param product - товар, який потрібно додати.
 * @param quantity - кількість одиниць товару.
 * @returns оновлений кошик з доданим товаром.
 */
const addToCart = <T extends BaseProduct>(
  cart: CartItem<T>[],
  product: T,
  quantity: number
): CartItem<T>[] => {
  // Перевіряємо, чи cart дійсно є масивом.
  if (!Array.isArray(cart)) {
    // Якщо не масив - викидаємо помилку.
    throw new Error('Cart must be an array');
  }
  // Перевіряємо, чи quantity є додатним числом.
  if (typeof quantity !== 'number' || quantity <= 0) {
    // Якщо quantity некоректний - викидаємо помилку.
    throw new Error('Quantity must be a positive number');
  }
  
  // Шукаємо індекс товару, який вже є в кошику.
  const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
  
  // Перевіряємо, чи товар вже є в кошику.
  if (existingItemIndex !== -1) {
    // Якщо товар вже є в кошику - створюємо копію кошика.
    const updatedCart = [...cart];
    // Оновлюємо кількість існуючого товару.
    updatedCart[existingItemIndex] = {
      ...updatedCart[existingItemIndex], // Копіюємо існуючий елемент.
      quantity: updatedCart[existingItemIndex].quantity + quantity // Додаємо нову кількість.
    };
    // Повертаємо оновлений кошик.
    return updatedCart;
  } else {
    // Якщо товару немає в кошику - додаємо новий елемент.
    return [...cart, { product, quantity }];
  }
};

/**
 * Видаляє товар з кошика за його ID.
 * @param cart - поточний стан кошика.
 * @param productId - ID товару для видалення.
 * @returns оновлений кошик без вказаного товару.
 */
const removeFromCart = <T extends BaseProduct>(
  cart: CartItem<T>[],
  productId: number
): CartItem<T>[] => {
  // Перевіряємо, чи cart дійсно є масивом.
  if (!Array.isArray(cart)) {
    // Якщо не масив - викидаємо помилку.
    throw new Error('Cart must be an array');
  }
  
  // Фільтруємо кошик, залишаючи всі товари крім того, що має вказаний ID.
  return cart.filter(item => item.product.id !== productId);
};

/**
 * Розраховує загальну вартість всіх товарів у кошику.
 * @param cart - кошик з товарами.
 * @returns загальна вартість товарів у кошику.
 */
const calculateTotal = <T extends BaseProduct>(cart: CartItem<T>[]): number => {
  // Перевіряємо, чи cart дійсно є масивом.
  if (!Array.isArray(cart)) {
    // Якщо не масив - викидаємо помилку.
    throw new Error('Cart must be an array');
  }
  
  // Обчислюємо загальну суму, перемножуючи ціну кожного товару на його кількість.
  return cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0); // Початкове значення суми - 0.
};

/**
 * Підраховує загальну кількість товарів у кошику.
 * @param cart - кошик з товарами.
 * @returns загальна кількість всіх товарів у кошику.
 */
const getCartItemsCount = <T extends BaseProduct>(cart: CartItem<T>[]): number => {
  // Перевіряємо, чи cart дійсно є масивом.
  if (!Array.isArray(cart)) {
    // Якщо не масив - викидаємо помилку.
    throw new Error('Cart must be an array');
  }
  
  // Підсумовуємо кількість кожного товару в кошику.
  return cart.reduce((count, item) => count + item.quantity, 0); // Початкове значення - 0.
};

// 4. ТЕСТОВІ ДАНІ ДЛЯ ПЕРЕВІРКИ РОБОТИ СИСТЕМИ.

// Масив товарів з категорії електроніка.
const electronicsProducts: Electronics[] = [
  {
    id: 1,
    name: "iPhone 15",
    price: 999,
    description: "Смартфон від компанії Apple",
    category: 'electronics',
    brand: 'Apple',
    warranty: 24
  },
  {
    id: 2,
    name: "Samsung Galaxy S24",
    price: 899,
    description: "Смартфон від компанії Samsung",
    category: 'electronics',
    brand: 'Samsung',
    warranty: 18
  },
  {
    id: 3,
    name: "MacBook Pro",
    price: 2499,
    description: "Ноутбук для професійних завдань",
    category: 'electronics',
    brand: 'Apple',
    warranty: 36
  }
];

// Масив товарів з категорії одяг.
const clothingProducts: Clothing[] = [
  {
    id: 4,
    name: "Футболка",
    price: 25,
    description: "Бавовняна футболка чорного кольору",
    category: 'clothing',
    size: 'M',
    color: 'Чорний',
    material: 'Бавовна'
  },
  {
    id: 5,
    name: "Джинси",
    price: 89,
    description: "Класичні сині джинси",
    category: 'clothing',
    size: 'L',
    color: 'Синій',
    material: 'Деним'
  }
];

// Масив товарів з категорії книги.
const booksProducts: Books[] = [
  {
    id: 6,
    name: "TypeScript для початківців",
    price: 35,
    description: "Навчальний посібник з TypeScript",
    category: 'books',
    author: "Іван Петренко",
    publisher: "IT Видавництво",
    pages: 300
  },
  {
    id: 7,
    name: "React та його екосистема",
    price: 45,
    description: "Поглиблений посібник по React",
    category: 'books',
    author: "Марія Коваленко",
    publisher: "Frontend Publishing",
    pages: 450
  }
];

// 5. ДЕМОНСТРАЦІЯ РОБОТИ ВСІХ ФУНКЦІЙ.

/**
 * Демонструє роботу всіх створених функцій інтернет-магазину.
 */
const demoFunctions = () => {
  // Виводимо заголовок демонстрації.
  console.log('- ДЕМОНСТРАЦІЯ РОБОТИ ІНТЕРНЕТ-МАГАЗИНУ:\n');
  
  // Демонстрація пошуку товарів.
  console.log('1. ПОШУК ТОВАРІВ.');
  // Шукаємо телефон за ID 1.
  const foundPhone = findProduct(electronicsProducts, 1);
  // Виводимо знайдений телефон.
  console.log('Знайдений телефон:', foundPhone);
  // Шукаємо книгу за ID 6.
  const foundBook = findProduct(booksProducts, 6);
  // Виводимо знайдену книгу.
  console.log('Знайдена книга:', foundBook);
  // Шукаємо неіснуючий товар.
  const notFound = findProduct(electronicsProducts, 999);
  // Виводимо результат пошуку неіснуючого товару.
  console.log('Неіснуючий товар:', notFound);
  
  // Демонстрація фільтрації за ціною.
  console.log('\n2. ФІЛЬТРАЦІЯ ЗА ЦІНОЮ.');
  // Фільтруємо електроніку за ціною до 1000.
  const affordableElectronics = filterByPrice(electronicsProducts, 1000);
  // Виводимо відфільтровану електроніку.
  console.log('Електроніка до 1000$:', affordableElectronics);
  // Фільтруємо одяг за ціною до 50.
  const affordableClothing = filterByPrice(clothingProducts, 50);
  // Виводимо відфільтрований одяг.
  console.log('Одяг до 50$:', affordableClothing);
  
  // Демонстрація фільтрації за категорією.
  console.log('\n3. ФІЛЬТРАЦІЯ ЗА КАТЕГОРІЄЮ.');
  // Об'єднуємо всі товари в один масив.
  const allProducts = [...electronicsProducts, ...clothingProducts, ...booksProducts];
  // Фільтруємо тільки електроніку.
  const allElectronics = filterByCategory(allProducts, 'electronics');
  // Виводимо відфільтровану електроніку.
  console.log('Вся електроніка:', allElectronics);
  
  // Демонстрація роботи з кошиком.
  console.log('\n4. РОБОТА З КОШИКОМ.');
  // Створюємо порожній кошик.
  let cart: CartItem<Product>[] = [];
  // Додаємо телефон до кошика в кількості 2 штук.
  if (foundPhone) {
    cart = addToCart(cart, foundPhone, 2);
  }
  // Додаємо книгу до кошика в кількості 1 штуки.
  if (foundBook) {
    cart = addToCart(cart, foundBook, 1);
  }
  // Знаходимо джинси за ID.
  const jeans = findProduct(clothingProducts, 5);
  // Додаємо джинси до кошика в кількості 1 штуки.
  if (jeans) {
    cart = addToCart(cart, jeans, 1);
  }
  // Виводимо вміст кошика.
  console.log('Кошик після додавання товарів:', cart);
  // Виводимо загальну кількість товарів у кошику.
  console.log('Кількість товарів у кошику:', getCartItemsCount(cart));
  // Виводимо загальну вартість кошика.
  console.log('Загальна вартість кошика:', calculateTotal(cart));
  
  // Демонстрація видалення товару з кошика.
  console.log('\n5. ВИДАЛЕННЯ ТОВАРУ З КОШИКА.');
  // Видаляємо телефон з кошика за ID.
  cart = removeFromCart(cart, 1);
  // Виводимо оновлений кошик.
  console.log('Кошик після видалення телефону:', cart);
  // Виводимо оновлену кількість товарів у кошику.
  console.log('Оновлена кількість товарів:', getCartItemsCount(cart));
  // Виводимо оновлену загальну вартість кошика.
  console.log('Оновлена загальна вартість:', calculateTotal(cart));
  
  // Демонстрація типобезпеки.
  console.log('\n6. ДЕМОНСТРАЦІЯ ТИПОБЕЗПЕКИ:');
  // Цей код викличе помилку TypeScript, якщо розкоментувати.
  // const invalidProduct = { id: 99, name: "Invalid" };
  // cart = addToCart(cart, invalidProduct, 1);
  // Виводимо підтвердження типобезпеки.
  console.log('Типобезпека забезпечує коректність даних.');
  
  // Виводимо завершення демонстрації.
  console.log('\nДемонстрація завершена успішно.');
};

// Запускаємо демонстрацію роботи всіх функцій.
demoFunctions();