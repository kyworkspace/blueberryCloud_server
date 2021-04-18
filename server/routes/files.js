const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { File } = require('../models/Files');

var storage = multer.diskStorage({
    //파일이 저장되는 물리적인 경로
    destination: function (req, file, cb) {
        cb(null, 'uploads/pictures/')
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})
//사진 올릴때 쓸 multer Storage
//이미지를 여러개 받을때는 array('키',최대 갯수)로 한다. 하면 되는데 안되서...files를 map으로 돌려서 업로드 하도록 함
var uploadPicture = multer({ storage: storage }).single("file")

const makeFolder = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    } else {
    }
}


router.post('/file/upload/pictures', (req, res) => {
    //파일 있는지 없는지 확인
    makeFolder(`./uploads/pictures`)
    uploadPicture(req, res, (err) => {
        //실패했을때
        if (err) return res.json({ success: false, err });
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
        return res.json({ success: true, fileInfo: res.req.file })
    })
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
    console.log(req.body)
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
    let findArgs = {};
    // for (let key in req.body.filters) {

    // }
    let totalCount = 0;
    File.count(findArgs, (err, count) => {
        totalCount = count
    })
    File
        .find({ cloudpath: cloudpath }) //폴더경로 검색
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



module.exports = router;