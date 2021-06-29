const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const { auth } = require('../middleware/auth');
const { File } = require('../models/Files');
const { getUserList } = require('../Controller/userController');
const { getUserFileList } = require('../Controller/fileController');
const { getFriendList } = require('../Controller/friendController');
const { generateRandom, emailAuthConfig } = require('../Controller/emailAuthController');

const bcrypt = require('bcrypt');
//salt를 이용해서 비밀번호 암호화
const saltRounds = 10;


router.post("/register", (req, res) => {
    //회원가입할때 필요한 정보를 client에서 가져오면
    //그것들을 DB에 넣어준다.
    const user = new User(req.body)

    //비밀번호 암호화

    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        })
    });//몽고디비 메서드(콜백함수)

});

router.post('/login', (req, res) => {
    //요청된 이메일을 데이터 베이스에서 있는지 찾는다.
    console.log(`${new Date().toLocaleString()}------${req.body.email} 로그인`)
    User.findOne({ email: req.body.email }, (err, user) => { //몽고디비 함수
        if (!user) { //반환된 유저정보가 없는 경우
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        //요청된 이메일이 데이터 베이스에 있다면 비밀번호 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({ loginSuccess: false, message: "비밀번호가 다릅니다." })
            }
            //비밀번호가 맞으면 Token 생성  
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                // 토큰을 저장한다. 어디? 쿠키, 로컬 스토리지, 등등에 저장가능
                // 이번에는 쿠키
                // res.header('Access-Control-Allow-Credentials', 'true');
                return res.cookie("x_auth", user.token, {
                    httpOnly: false,
                    sameSite: false,
                    signed: false,
                    secure: false,
                })
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })
                // return res.status(200).json({ loginSuccess: true, userId: user._id, token: user.token })
            })
        })
    })
})

//auth 권한 처리
router.get('/auth', auth, (req, res) => {
    //auth 는 미들웨어
    // 여기까지 통과되면 req.token, req.user 정보 확인가능

    //클라이언트에 정보 전달 가능
    //role 0 ->일반 유저
    //role 1 -> 관리자
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        profileImage: req.user.profileImage,
        backgroundImage: req.user.backgroundImage,
        birthDay: req.user.birthDay,
        phoneNumber: req.user.phoneNumber,
        greeting: req.user.greeting,
        cloudSize: req.user.cloudSize,
        nickName: req.user.nickName
    })
})


router.get('/logout', auth, (req, res) => {
    //로그인 된 상태이기 때문에 auth를 가져와 쓸수 있음
    User.findOneAndUpdate(
        { _id: req.user._id }, //아이디로 해당 정보를 찾아서
        { token: "" }, //token을 초기화 해주고
        (err, user) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            })
        })
})

// 회원 목록 가져옴
router.post('/list', auth, async (req, res) => {
    let { searchTerm,
        limit,
        skip,
    } = req.body;
    let findArgs = {
        _id: { $ne: req.user._id }
    }
    if (searchTerm) {
        findArgs.$or = [ //유형
            { name: { "$regex": searchTerm } }
            , { email: { "$regex": searchTerm } }
            , { phoneNumber: { "$regex": searchTerm } }
        ]
    }
    let userList = await getUserList(findArgs, limit, skip).catch(err => res.status(200).send({ success: false }));
    let friendList = await getFriendList({ $in: [1, 3] }, req.user).catch(err => res.status(200).send({ success: false }));
    let fileList = await getUserFileList(userList).catch(err => res.status(200).send({ success: false }));
    userList.map(item => {
        let fileCount = fileList.filter(x => String(x.writer) === String(item._id));
        if (fileCount) {
            item.totalPost = fileCount.length;
        } else {
            item.totalPost = 0;
        }
        let friendFlag = friendList.filter(x => String(x._id) === String(item._id));
        if (friendFlag.length > 0) {
            item.friends = true;
        } else {
            item.friends = false;
        }
        return item;
    });
    return res.status(200).send({ success: true, list: userList })
});
// 비밀번호 변경함
router.post('/password/update', auth, (req, res) => {
    const { password, newPassword } = req.body;
    const { _id } = req.user;
    User.findOne({ _id }, (err, user) => {
        user.comparePassword(password, (err, isMatch) => {
            if (!isMatch) {
                return res.json({ loginSuccess: false, message: "비밀번호가 다릅니다." })
            }
            bcrypt.genSalt(saltRounds, function (err, salt) {
                if (err) return res.json({ success: false, err, message: '비밀번호 변경 오류가 발생하였습니다.' })
                bcrypt.hash(newPassword, salt, function (err, hash) {
                    if (err) return res.json({ success: false, err, message: '비밀번호 변경 오류가 발생하였습니다.' })
                    let hashedPass = hash;
                    User.updateOne(
                        { _id }, //아이디로 해당 정보를 찾아서
                        { password: hashedPass }, //token을 초기화 해주고
                        (err, user) => {
                            if (err) return res.json({ success: false, err, message: '비밀번호 변경 오류가 발생하였습니다.' });
                            return res.status(200).send({
                                success: true, message: '비밀번호 변경에 성공하였습니다.'
                            })
                        })
                })
            })
        })
    })

})
router.post('/dupCheck', (req, res) => {
    const { email } = req.body;

    User.findOne({ "email": email }, (err, user) => {
        if (err) return res.status(400).send({ success: false });
        if (user) {
            return res.status(200).send({ success: true, available: false });
        } else {
            return res.status(200).send({ success: true, available: true });
        }
    })
})

//인증 메일 전송
router.post('/sendAuthCheckMail', (req, res) => {
    const { email } = req.body;
    const number = generateRandom(111111, 999999);
    const mailOptions = {
        from: 'blueberry_manager@naver.com',
        to: email,
        subject: "[블루베리 클라우드]인증 관련 이메일 입니다",
        text: "오른쪽 숫자 6자리를 입력해주세요 : " + number
    };
    emailAuthConfig.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(400).send({ success: false })
        console.log("Auth mail Sended", info.response)
        emailAuthConfig.close();
        return res.status(200).send({ success: true, number })
    })
})



module.exports = router;