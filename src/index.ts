const userName: string = "Maksym";
const greeting: string = `Hello, ${userName}!`;

const age: number = 21;
const price: number = 99.99;
const binary: number = 0b1010;

const isActive: boolean = true;
const hasPermission: boolean = false;

const numbers: number[] = [1, 2, 3, 4, 5];
const names: Array<string> = ["Mykola", "Petro", "Anastasiya"];

const person: [string, number] = ["Olena", 31];

enum Status 
{
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

const userStatus: Status = Status.Active;

function add(a: number, b: number): number 
{
  return a + b;
}

function greet(name: string): string 
{
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