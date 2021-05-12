const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const multer = require('multer');
const fs = require('fs');
const { auth } = require('../middleware/auth');

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
    })
    let upload = multer({ storage: str }).single("file")

    return upload;
}

router.post('/image/upload', async (req, res) => {
    await fileUpload('uploads/tempfolder/')(req, res, (err) => {
        if (err) return res.json({ success: false, err });
        return res.json({ success: true, fileInfo: res.req.file })
    })
})
//프로필 변경후 폴더 변경
router.post('/image/save', auth, async (req, res) => {
    let { file, flag } = req.body;
    let oldPath = file.path;
    let newPath = `uploads/${req.user._id}/profile/${file.filename}`;
    makeFolder(`./uploads/${req.user._id}/profile`);
    //파일 경로 이동
    fs.renameSync(oldPath, newPath);
    let updateTarget = {};
    switch (flag) {
        case 'avatar':
            updateTarget.profileImage = newPath;
            break;
        case 'background':
            updateTarget.backgroundImage = newPath;
            break;
    }

    User.updateOne({ _id: req.user._id }, {
        $set: updateTarget
    }, (err, response) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, url: newPath });
    })

})
//프로필 수정
router.post(`/info/update`, auth, async (req, res) => {
    let { _id } = req.user;
    const { email, birthDay, phoneNumber } = req.body;
    User.findOneAndUpdate({ _id: _id }, { email, birthDay, phoneNumber }, (err, profile) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        })
    })
})

const makeFolder = (dir) => {
    if (!fs.existsSync(dir)) {
        //없으면 폴더 생성
        fs.mkdirSync(dir, { recursive: true });
    }
}

module.exports = router;