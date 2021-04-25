const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { File } = require('../models/Files');
const ffmpeg = require("fluent-ffmpeg");
var formidable = require('formidable');
const { ffprobe } = require('fluent-ffmpeg');
// const app = express();
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extended: true
// }))
// app.use(express.json());

// var reqParser = bodyParser.urlencoded({
//     extended: true
// })


//사진 올릴때 쓸 multer Storage
//이미지를 여러개 받을때는 array('키',최대 갯수)로 한다. 하면 되는데 안되서...files를 map으로 돌려서 업로드 하도록 함
var storage = multer.diskStorage({
    //파일이 저장되는 물리적인 경로
    destination: function (req, file, cb) {
        cb(null, 'uploads/pictures/')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})
var uploadPicture = multer({ storage: storage }).single("file")

let testUpload = (filePath) => {
    let str = multer.diskStorage({
        //파일이 저장되는 물리적인 경로
        destination: function (req, file, cb) {
            //console.log('경로', req)
            cb(null, `uploads/${filePath}`)
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}_${file.originalname}`)
        }
    })
    let upload = multer({ storage: str }).single("file")

    return upload;
}

const makeFolder = (dir) => {
    if (!fs.existsSync(dir)) {
        //없으면 폴더 생성
        fs.mkdirSync(dir, { recursive: true });
    }
}
// const formParser = (req, res) => {
//     var form = new formidable.IncomingForm();
//     return new Promise((resolve, reject) => {
//         form.parse(req, function (err, fields, files) {
//             folderPath = fields.path
//             resolve({ path: folderPath })
//         });
//     })
// }
const dateToString = (dateTime, Hyphen) => {
    let date = new Date(dateTime)
    const year = date.getFullYear();
    const month = date.getMonth() + 1 > 10 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
    const day = date.getDate() > 10 ? date.getDate() : "0" + (date.getDate());;

    if (Hyphen) { //하이폰 넣어줌
        return year + "-" + month + "-" + day;
    } else {
        return year + month + day;
    }
}


router.post('/file/upload/pictures', async (req, res) => {
    // var upload = multer({ dest: 'uploads/pictures/' }); //경로 설정
    // upload.single('file'), //저장 파일명을 난수로 바꿔 버림
    //var form = formidable.IncomingForm();


    // 폴더가 있는지 없는지 확인 & 생성
    // 날짜 별로 폴더 생성 및 저장.. 사용자 ID 가져와서 유동적으로 바꾸고 싶은데 왜 안되는지 모르겠음...
    makeFolder(`./uploads/${dateToString(new Date(), false)}`)
    testUpload(`${dateToString(new Date(), false)}`)(req, res, (err) => {
        //실패했을때
        if (err) return res.json({ success: false, err });
        return res.json({ success: true, fileInfo: res.req.file })
        /***
       * 성공했을때 파일정보를 전달 fileInfo
       * destination: "uploads/pictures/"
       * encoding: "7bit"
       * fieldname: "file"
       * filename: "1614219520378_1.png"
       * mimetype: "image/png"
       * originalname: "1.png"
       * path: "uploads\pictures\1614219520378_1.png"
       * size: 518107
       * ***/
    })
    // var form = new formidable.IncomingForm();
    // form.encoding = "utf-8";
    // form.uploadDir = "./uploads"
    // form.keepExtensions = true; // 확장자 표시

    // let files = [];
    // let fields = [];



    // form.on('field', function (field, value) {
    //     console.log(field, value)
    //     if (field === "path") {
    //         form.uploadDir = form.uploadDir + `/${value}`
    //         makeFolder(form.uploadDir);
    //     }

    // })
    //     .on('file', function (field, file) {
    //         // console.log('file.name', file.name);
    //         // console.log('form.uploadDir', form.uploadDir);
    //         // console.log('file.path', file.path);
    //         //fs.rename(file.path, form.uploadDir + '/' + file.name);


    //     })
    //     .on('end', function () {
    //         console.log("끝")
    //     })

    // form.parse(req);
})


/***
 * 사진's(파일들) 업로드
 * ***/
router.post('/pictures/save', (req, res) => {
    const fileList = req.body;
    File.insertMany(fileList).then(
        response => { return res.status(200).json({ success: true }) }
    ).catch(
        e => { return res.status(400).json({ success: false, err }) }
    )

})
/**
 * 폴더 생성
 * ***/
router.post('/folder/create', (req, res) => {
    const folder = new File(req.body);

    folder.save((err, folderInfo) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, folderInfo })
    })
})

/**
 * 파일 리스트 가져오기
 * **/
router.post('/files/list', (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 20;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    let cloudpath = req.body.cloudpath ? req.body.cloudpath : 'ALL';
    //let term = req.body.searchTerm; 검색어
    //필터 적용하기 req.body.filters
    let findArgs = { cloudpath: cloudpath };
    // for (let key in req.body.filters) {

    // }
    let totalCount = 0;
    File.count(findArgs, (err, count) => {
        totalCount = count
    })
    File
        .find(findArgs) //폴더경로 검색
        .find()
        .populate('writer')
        .skip(skip)
        //파일 중요도, 파일명, 아이디, 생성일자로 정렬
        .sort({ "importance": 1, "filename": 1, "_id": 1, "createdAt": -1, })
        .limit(limit)
        .exec((err, fileList) => {
            if (err) return res.status(400).json({ success: false, err })
            res.status(200).json({ success: true, fileList, postSize: fileList.length, totalCount: totalCount })
        })
})

/**************************** 파일 삭제 시작*******************************/
router.post('/files/delete', (req, res) => {
    let fileList = req.body.fileList;

    File.deleteMany({ _id: { $in: fileList } }, (err, obj) => {
        if (err) res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, count: obj.deletedCount });
    })
});

/***********************동영상 업로드 **************************************/
//썸네일 자동 생성
router.post('/thumbnail', (req, res) => {
    let filePath = "";
    let fileDuration = "";

    //비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.url, function (err, metadata) {
        //ffprobe는 ffmpeg 받을때 같이 딸려오는것
        //console.dir(metadata);
        //console.log(metadata.format.duration);
        fileDuration = metadata.format.duration;
    })
    // 썸네일 생성
    ffmpeg(req.body.url) //클라이언트에서 들어온 비디오저장 경로
        .on('filenames', function (filenames) { //비디오 썸네일 파일명 셍성
            console.log("Will generate " + filenames.join(', '));
            console.log(filenames)

            filePath = "uploads/thumbnails/" + filenames[0];
        })
        .on('end', function () { //썸네일이 전부 생성되고 난 다음에 무엇을 할것인지
            console.log("ScreenShot Taken");
            return res.json({
                success: true
                , url: filePath
                , fileDuration: fileDuration
            })
        })
        .on('error', function (err) { //에러가 났을시
            console.error(err);
            return res.json({ success: false, err })
        })
        .screenshot({ //
            count: 1, //1개의 썸네일 가능
            folder: "uploads/thumbnails",//업로드 경로
            size: '320x240', //사이즈
            filename: '%b-thumbnail.png' //파일명 %b는 extension을 뺀 파일 네임
        })
})





/***********************동영상 업로드 끝**************************************/



module.exports = router;