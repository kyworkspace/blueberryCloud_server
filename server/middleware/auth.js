const { User } = require('../models/User');

let auth = (req, res, next) => {
    //인증처리 하는 미들
    //클라이언트 쿠키 가져옴
    let token = req.cookies.x_auth
    //토큰 복호화
    User.findByToken(token, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                isAuth: false,
                error: true
            });
        }

        req.token = token; //리턴된 토큰 저장
        req.user = user;
        next();
    })
}

module.exports = { auth }