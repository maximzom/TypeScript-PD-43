"use strict";
const userName = "Maksym";
const greeting = `Hello, ${userName}!`;
const age = 21;
const price = 99.99;
const binary = 0b1010;
const isActive = true;
const hasPermission = false;
const numbers = [1, 2, 3, 4, 5];
const names = ["Mykola", "Petro", "Anastasiya"];
const person = ["Olena", 31];
var Status;
(function (Status) {
    Status["Active"] = "ACTIVE";
    Status["Inactive"] = "INACTIVE";
    Status["Pending"] = "PENDING";
})(Status || (Status = {}));
const userStatus = Status.Active;
function add(a, b) {
    return a + b;
}
function greet(name) {
    return `Welcome, ${name}!`;
}
console.log("1. String types:");
console.log(`   Name: ${userName}`);
console.log(`   Greeting: ${greeting}`);
console.log("\n2. Number types:");
console.log(`   Age: ${age}`);
console.log(`   Price: ${price}`);
console.log(`   Binary: ${binary}`);
console.log("\n3. Boolean types:");
console.log(`   Active: ${isActive}`);
console.log(`   Permission: ${hasPermission}`);
console.log("\n4. Arrays:");
console.log(`   Numbers: ${numbers}`);
console.log(`   Names: ${names}`);
console.log("\n5. Tuple:");
console.log(`   Person: ${person}`);
console.log("\n6. Enum:");
console.log(`   Status: ${userStatus}`);
console.log("\n7. Function results:");
console.log(`   Addition: ${add(5, 3)}`);
console.log(`   Greeting: ${greet("Sergey")}`);
