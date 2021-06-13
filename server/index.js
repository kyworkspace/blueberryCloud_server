//환경 설정
const dotenv = require("dotenv");
//서버 설정
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
//모델 설정
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { CloudFileMotherPath } = require('./config/fileInit')
//서버 포트 번호
const port = 5000

//application/x-www-form-urlencoded
/**
 * body-parser의 사용목적
 * req.body의 데이터에 접근하기 위해 사용함
 * bodyParser.json() 은 application/json 방식의 content-Type데이터를 받아준다.
 * url encoded의 타입은 Jquery ajax 의 기본타입인 application/x-www-form-urlencoded 의 데이터를 받아준다.
 * extended는 인코딩하느 방식을 선택하는 옵션
 * false로 하는 경우 depth가 있는 json 데이터는 최상단 데이터를 기준으로 1개 오브젝트로만 받아오는 반면
 * true의 경우 다중 오브젝트를 가져올 수 있도록 한다.
 * 즉, 보낸대로 받고 싶으면 true를 사용하여야 함.
 * ***/
//app.use(bodyParser.urlencoded({ extended: true }));
//express 의 빌트인 body-Parser
// app.use(express.json());
app.use(express.json());
//cookie-parser
app.use(cookieParser());
//cors
app.use(cors());

dotenv.config({
    path: "./env/.env",
});
//entity too large issue
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }))

//프론트쪽 클라이언트 
const clientApp = path.join(__dirname, '../../BluberryCloud_front/build');

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    //기존에 사용되던 몽구스 서비스가 일부 교체 & 중단 되기 때문에 새로운 모듈을 사용하겠다는 의미
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log("Mongo DB Connected..."))
    .catch((err) => console.log(err))

const { removeAllComments } = require('./Controller/commentController');
const { removeAllFiles } = require('./Controller/fileController');
const { removeAllDisLike, removeAllLike } = require('./Controller/likeController');

app.get('/', (req, res) => {
    res.send('Welcome To BlueBerry CLOUD');
})
//라우터 교통 정리
app.use('/api/users', require('./routes/user'));
app.use('/api/cloud', require('./routes/files'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/sns', require('./routes/sns'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/like', require('./routes/like'));
app.use('/api/comment', require('./routes/comment'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/notice', require('./routes/notice'));

//로컬 업로드 파일 url과 경로
app.use('/uploads', express.static(`${CloudFileMotherPath}`));
app.use('/basicBackground', express.static('BasicBackground'));

// 빌드할때 해당 부분 삭제할것~!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// app.use(express.static(clientApp));
// app.get('/', (req, res) => {
//     console.log("sended?")
//     res.send(express.static(`${clientApp}/index.html`));
// })
/////////////////////////////////////////////////////////////////////////////////////////

// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(clientApp));
//     app.get('/', (req, res) => {
//         res.send(express.static("C:/React/blueberrycloud_front/build/index.html"));
//     })
//     // app.get("*", (req, res) => {
//     //     res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
//     // });
// }

// 파일 전체 삭제
app.post('/allRemove', async (req, res) => {
    console.log('모든 파일을 삭제합니다.')
    try {
        await removeAllComments();
        await removeAllDisLike();
        await removeAllLike();
        await removeAllFiles();
        return res.status(200).send({ success: true })
    } catch (error) {
        console.log(error)
        return res.status(400).send({ success: false })
    }
});


app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
})