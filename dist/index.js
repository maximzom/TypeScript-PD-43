"use strict";
const findProduct = (products, id) => {
    if (!Array.isArray(products)) {
        throw new Error('Products must be an array');
    }
    if (typeof id !== 'number' || id <= 0) {
        throw new Error('ID must be a positive number');
    }
    return products.find(product => product.id === id);
};
const filterByPrice = (products, maxPrice) => {
    if (!Array.isArray(products)) {
        throw new Error('Products must be an array');
    }
    if (typeof maxPrice !== 'number' || maxPrice < 0) {
        throw new Error('Max price must be a non-negative number');
    }
    return products.filter(product => product.price <= maxPrice);
};
const filterByCategory = (products, category) => {
    if (!Array.isArray(products)) {
        throw new Error('Products must be an array');
    }
    return products.filter(product => 'category' in product && product.category === category);
};
const addToCart = (cart, product, quantity) => {
    if (!Array.isArray(cart)) {
        throw new Error('Cart must be an array');
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
        throw new Error('Quantity must be a positive number');
    }
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingItemIndex !== -1) {
        const updatedCart = [...cart];
        updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + quantity
        };
        return updatedCart;
    }
    else {
        return [...cart, { product, quantity }];
    }
};
const removeFromCart = (cart, productId) => {
    if (!Array.isArray(cart)) {
        throw new Error('Cart must be an array');
    }
    return cart.filter(item => item.product.id !== productId);
};
const calculateTotal = (cart) => {
    if (!Array.isArray(cart)) {
        throw new Error('Cart must be an array');
    }
    return cart.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
};
const getCartItemsCount = (cart) => {
    if (!Array.isArray(cart)) {
        throw new Error('Cart must be an array');
    }
    return cart.reduce((count, item) => count + item.quantity, 0);
};
const electronicsProducts = [
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
const clothingProducts = [
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
const booksProducts = [
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
const demoFunctions = () => {
    console.log('- ДЕМОНСТРАЦІЯ РОБОТИ ІНТЕРНЕТ-МАГАЗИНУ:\n');
    console.log('1. ПОШУК ТОВАРІВ.');
    const foundPhone = findProduct(electronicsProducts, 1);
    console.log('Знайдений телефон:', foundPhone);
    const foundBook = findProduct(booksProducts, 6);
    console.log('Знайдена книга:', foundBook);
    const notFound = findProduct(electronicsProducts, 999);
    console.log('Неіснуючий товар:', notFound);
    console.log('\n2. ФІЛЬТРАЦІЯ ЗА ЦІНОЮ.');
    const affordableElectronics = filterByPrice(electronicsProducts, 1000);
    console.log('Електроніка до 1000$:', affordableElectronics);
    const affordableClothing = filterByPrice(clothingProducts, 50);
    console.log('Одяг до 50$:', affordableClothing);
    console.log('\n3. ФІЛЬТРАЦІЯ ЗА КАТЕГОРІЄЮ.');
    const allProducts = [...electronicsProducts, ...clothingProducts, ...booksProducts];
    const allElectronics = filterByCategory(allProducts, 'electronics');
    console.log('Вся електроніка:', allElectronics);
    console.log('\n4. РОБОТА З КОШИКОМ.');
    let cart = [];
    if (foundPhone) {
        cart = addToCart(cart, foundPhone, 2);
    }
    if (foundBook) {
        cart = addToCart(cart, foundBook, 1);
    }
    const jeans = findProduct(clothingProducts, 5);
    if (jeans) {
        cart = addToCart(cart, jeans, 1);
    }
    console.log('Кошик після додавання товарів:', cart);
    console.log('Кількість товарів у кошику:', getCartItemsCount(cart));
    console.log('Загальна вартість кошика:', calculateTotal(cart));
    console.log('\n5. ВИДАЛЕННЯ ТОВАРУ З КОШИКА.');
    cart = removeFromCart(cart, 1);
    console.log('Кошик після видалення телефону:', cart);
    console.log('Оновлена кількість товарів:', getCartItemsCount(cart));
    console.log('Оновлена загальна вартість:', calculateTotal(cart));
    console.log('\n6. ДЕМОНСТРАЦІЯ ТИПОБЕЗПЕКИ:');
    console.log('Типобезпека забезпечує коректність даних.');
    console.log('\nДемонстрація завершена успішно.');
};
demoFunctions();
//# sourceMappingURL=index.js.map