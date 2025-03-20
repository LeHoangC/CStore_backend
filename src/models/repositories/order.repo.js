function generateRandomCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomNumber = String(Math.floor(100000 + Math.random() * 900000)); // 6 số ngẫu nhiên

    return `${year}${month}${day}${randomNumber}`;
}

module.exports = { generateRandomCode }