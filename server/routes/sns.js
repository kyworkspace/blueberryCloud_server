const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { File } = require('../models/Files');
const { getFriendList } = require('../Controller/friendController')

router.post('/timeline/list', auth, async (req, res) => {
    let { limit, skip } = req.body;
    let friendsList = await getFriendList([1, 3], req.user)  //친구 아이디 목록 가져와야함
    let findArgs = {
        $or: [
            { openrating: { $in: [0] } },
            { $and: [{ writer: { $in: [req.user._id, ...friendsList] } }, { openrating: 1 }] }
        ]
    };
    await File
        .find(findArgs) //폴더경로 검색
        .populate('writer')
        .skip(skip)
        //파일 중요도, 파일명, 아이디, 생성일자로 정렬
        .sort({ "updatedAt": -1, "_id": 1, })
        .limit(limit)
        .exec((err, list) => {
            if (err) return res.status(400).json({ success: false, err })
            return res.status(200).json({ success: true, list })
        })

})

module.exports = router;