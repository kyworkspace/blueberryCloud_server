const express = require('express');
const router = express.Router();
const { User } = require('../models/User');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const fs = require('fs');
const { makeFolder, CloudFileMotherPath } = require('../config/fileInit');
const { getFileList } = require('../Controller/fileController');
const { checkFriend } = require('../Controller/friendController');


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
    await fileUpload(`${CloudFileMotherPath}/tempfolder/`)(req, res, (err) => {
        if (err) return res.json({ success: false, err });
        return res.json({ success: true, fileInfo: res.req.file })
    })
})
//프로필 변경후 폴더 변경
router.post('/image/save', auth, async (req, res) => {
    const { file, flag } = req.body;
    const oldPath = file.path;
    const hostPath = `uploads/${req.user._id}/profile/${file.filename}`;
    const physicalPath = `${CloudFileMotherPath}/${req.user._id}/profile/${file.filename}`;
    makeFolder(`${CloudFileMotherPath}/${req.user._id}/profile`);
    try {
        //파일 경로 이동
        fs.renameSync(oldPath, physicalPath);
        let updateTarget = {};
        switch (flag) {
            case 'avatar':
                updateTarget.profileImage = hostPath;
                break;
            case 'background':
                updateTarget.backgroundImage = hostPath;
                break;
        }

        User.updateOne({ _id: req.user._id }, {
            $set: updateTarget
        }, (err, response) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({ success: true, url: hostPath });
        })
    } catch (error) {
        console.error(error)
        return res.status(400).json({ success: false, error });
    }


})
//프로필 수정
router.post(`/info/update`, auth, async (req, res) => {
    let { _id } = req.user;
    const { email, birthDay, phoneNumber, greeting, name, nickName } = req.body;
    User.findOneAndUpdate({ _id: _id }, { email, birthDay, phoneNumber, greeting, name, nickName }, (err, profile) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        })
    })
})
//유저 프로필 
router.post('/info/user', auth, async (req, res) => {
    const { userId } = req.body;
    User.findById({ _id: userId }).exec((err, user) => {
        if (err) res.status(400).send({ success: false });
        return res.status(200).send({ success: true, userInfo: user })
    })
})
//유저 사진 가져옴
router.post('/list/user/media', auth, async (req, res) => {
    const { userId, skip, limit } = req.body;
    const { _id } = req.user;

    //친구 여부 판단
    const FriendFlag = await checkFriend(userId, _id);
    let search = { 'writer': userId, 'openrating': { $in: [0] } };
    if (userId == _id || FriendFlag) { //친구 일때
        search.openrating = { $in: [0, 1] };
    } else {// 친구 아닐때
        search.openrating = { $in: [0] };
    }
    const list = await getFileList(search, skip, limit).catch(err => { return res.status(400).send({ success: false }) })
    return res.status(200).send({ success: true, list })

})

module.exports = router;