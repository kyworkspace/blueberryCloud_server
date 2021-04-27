const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { File } = require('../models/Files');
const ffmpeg = require("fluent-ffmpeg");
var formidable = require('formidable');
const { ffprobe } = require('fluent-ffmpeg');

//사진 올릴때 쓸 multer Storage
//이미지를 여러개 받을때는 array('키',최대 갯수)로 한다. 하면 되는데 안되서...files를 map으로 돌려서 업로드 하도록 함
let fileUpload = (filePath) => {
    let str = multer.diskStorage({
        //파일이 저장되는 물리적인 경로
        destination: function (req, file, cb) {
            //console.log('경로', req)
            cb(null, filePath)
        },
        filename: function (req, file, cb) {
            cb(null, `${Date.now()}_${file.originalname}`)
        },
        fileFilter: (req, file, cb) => { //파일 필터 -- 현재는 .mp4와 .png만 허용
            // const ext = path.extname(file.originalname);
            // if (ext !== '.mp4' || ext !== '.png') {
            //     return cb(res.status(400).end('only mp4, png is allowd'), false);
            // }
            // cb(null, true);
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


router.post('/file/upload/pictures', (req, res) => {
    // var upload = multer({ dest: 'uploads/pictures/' }); //경로 설정
    // upload.single('file'), //저장 파일명을 난수로 바꿔 버림
    //var form = formidable.IncomingForm();
    // 폴더가 있는지 없는지 확인 & 생성
    // 날짜 별로 폴더 생성 및 저장.. 사용자 ID 가져와서 유동적으로 바꾸고 싶은데 왜 안되는지 모르겠음...
    makeFolder(`./uploads/tempfolder`)
    fileUpload(`uploads/tempfolder`)(req, res, (err) => {
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
})


/***
 * 사진's(파일들) 업로드
 * ***/
router.post('/pictures/save', (req, res) => {
    const fileList = req.body;
    fileList.forEach((item) => {
        // 동영상 저장될 폴더
        makeFolder(`./uploads/${item.originalpath}`)
        let oldpath = item.path;
        let newPath = `uploads/${item.originalpath}/${item.filename}`;
        fs.rename(oldpath, newPath, () => { })
        item.originalpath = newPath;
    })
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
    let theme = req.body.theme;
    let limit = req.body.limit ? parseInt(req.body.limit) : 20;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    let cloudpath = req.body.cloudpath ? req.body.cloudpath : 'ALL';
    //let term = req.body.searchTerm; 검색어

    //필터 적용하기 req.body.filters
    let findArgs = {
        cloudpath: cloudpath,
        $or: [
            { mimetype: "Folder" }
            , { mimetype: { "$regex": theme === "all" ? '' : theme } }
        ]
    };
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
router.post('/file/upload/video/thumbnail', (req, res) => {
    let filePath = "";
    let fileDuration = "";
    let outputFilenames = []
    console.log('~~~~~~~~~~~~~~~~~~~~~~', req.body)
    //비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.url, function (err, metadata) {
        //ffprobe는 ffmpeg 받을때 같이 딸려오는것
        fileDuration = metadata.format.duration;
    })
    let convert = 'output.mp4' //저장경로/ 파일명
    console.log(req.body.url);
    ffmpeg(req.body.url)
        .videoCodec('libx264')
        .format('mp4')
        .on('error', (err) => {
            console.log("Video Convert Error" + err)
        })
        .on("end", () => {
            console.log("Precessing finished")
        })
        .saveToFile(convert)
    // 썸네일 생성
    ffmpeg(req.body.url) //클라이언트에서 들어온 비디오저장 경로
        .on('filenames', function (filenames) { //비디오 썸네일 파일명 셍성
            outputFilenames = filenames
            filePath = `uploads/${dateToString(new Date(), false)}/thumbnails/` + filenames[0];
        })
        .on('end', function () { //썸네일이 전부 생성되고 난 다음에 무엇을 할것인지
            console.log("ScreenShot Taken");
            return res.json({
                success: true
                , url: filePath
                , fileDuration: fileDuration
                , filenames: outputFilenames
            })
        })
        .on('error', function (err) { //에러가 났을시
            console.error(err);
            return res.json({ success: false, err })
        })
        .screenshot({ //
            count: 1, //1개의 썸네일 가능
            folder: `uploads/${dateToString(new Date(), false)}/thumbnails/`,//업로드 경로
            size: '320x240', //사이즈
            filename: '%b-thumbnail.png' //파일명 %b는 extension을 뺀 파일 네임
        })
})
// 파일 업로드
router.post('/file/upload/video', (req, res) => {
    makeFolder(`./uploads/tempfolder`)
    // 비디오 파일을 루트 폴더에 업로드 한다.
    fileUpload(`./uploads/tempfolder`)(req, res, err => {
        if (err) {
            //client 의 videoUploadPage에서 Line.52 에서 success true로 갈지 아닐지 판단
            return res.json({ success: false, err })
        }
        return res.json({
            success: true,
            fileInfo: res.req.file
        })
    })
})
// 동영상 정보 저장
router.post(`/video/save`, (req, res) => {
    //정크 폴더에 있던 파일을 옮겨 줄거임
    let newPath = req.body.originalpath;
    let oldPath = req.body.path;
    let filename = req.body.filename;
    let thumbnailpath = req.body.thumbnailpath;
    let thumbnailname = req.body.thumbnailname;
    // 동영상 저장될 폴더
    makeFolder(`./uploads/${newPath}`)
    // 썸네일 저장될 폴더
    makeFolder(`./uploads/${newPath}/thumbnail`)
    //동영상 파일 옮김
    fs.rename(oldPath, `uploads/${newPath}/${filename}`, function () {
        console.log(`${dateToString(new Date(), true)} ==> video success`)
    })
    //썸네일 파일 옮김
    fs.rename(thumbnailpath, `uploads/${newPath}/thumbnail/${thumbnailname}`, function () {
        console.log(`${dateToString(new Date(), true)} ==> thumbnail success`)
    })

    req.body.originalpath = `uploads/${newPath}/${filename}`;
    req.body.thumbnailpath = `uploads/${newPath}/thumbnail/${thumbnailname}`;

    const file = new File(req.body);
    file.save((err, fileInfo) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true })
    })
})




/***********************동영상 업로드 끝**************************************/



module.exports = router;