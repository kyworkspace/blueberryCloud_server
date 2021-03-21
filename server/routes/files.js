const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

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

module.exports = router;