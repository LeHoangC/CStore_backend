console.time("V8 Speed");
let sum = 0;
for (let i = 0; i < 1e9; i++) {
    sum += i;
}
console.log(sum);

console.timeEnd("V8 Speed");