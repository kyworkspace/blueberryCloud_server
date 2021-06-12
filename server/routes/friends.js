const express = require('express');
const router = express.Router();
const { Friends } = require('../models/Friends');
const { auth } = require('../middleware/auth');
const { getFriendList } = require('../Controller/friendController');
const { getUserFileList } = require('../Controller/fileController')

//친구 추가 요청
router.post('/add', auth, (req, res) => {
    let me = req.user._id;
    let { target } = req.body;

    Friends.findOneAndUpdate(
        { userTo: target, userFrom: me },
        { $set: { level: 2 } },
        { upsert: true }
        , (err, friend) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true })
        });
});
//친구 삭제
router.post('/delete', auth, (req, res) => {
    let { target } = req.body;
    let me = req.user._id
    Friends.findOneAndUpdate(
        {
            $or: [
                { userTo: target, userFrom: me },
                { userTo: me, userFrom: target }
            ]
        },
        { $set: { level: 0 } },
        { upsert: true }
        , (err, friend) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true })
        });
})

// 친구 요청 목록
router.post('/receive/list', auth, (req, res) => {

    let findArgs = {
        'userTo': req.user._id,
        'level': 2
    }
    Friends.find(findArgs)
        .populate('userFrom')
        .exec((err, list) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true, list })
        })
});

router.post('/handler', auth, (req, res) => {
    let { userFrom, level } = req.body;

    Friends.findOneAndUpdate({
        userFrom: userFrom,
        userTo: req.user._id,
    },
        {
            level: level
        }, (err, friend) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true });
        })
});
//친구 목록
router.post('/list', auth, async (req, res) => {
    let { level } = req.body;
    let friendList = await getFriendList(level, req.user).catch(err => { return res.status(400).send({ success: false }) })
    let fileList = await getUserFileList(friendList).catch(err => res.status(400).send({ success: false }));
    friendList.map(item => {
        let fileCount = fileList.filter(x => String(x.writer) === String(item._id));
        if (fileCount) {
            item.totalPost = fileCount.length;
        } else {
            item.totalPost = 0;
        }
        return item;
    });
    return res.status(200).send({ success: true, list: friendList })
})



module.exports = router;