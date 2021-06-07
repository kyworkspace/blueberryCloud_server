const nodemailer = require('nodemailer');

const emailAuthConfig = nodemailer.createTransport({
    service: "Naver",
    host: "smtp.naver.com",
    port: 587,
    auth: {
        user: process.env.MANAGER_ID,
        pass: process.env.MANAGER_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
/* min ~ max까지 랜덤으로 숫자를 생성하는 함수 */
const generateRandom = (min, max) => {
    let ranNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return ranNum;
}

module.exports = {
    emailAuthConfig,
    generateRandom,
}