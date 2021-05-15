const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { File } = require('../models/Files');

router.post('/timeline/list', async (req, res) => {
    let { limit, skip, userId } = req.body;

    let findArgs = {
        writer: userId, //경로
        // $or: [ //유형
        //     {
        //         mimetype: { "$regex": 'image' },
        //         mimetype: { "$regex": 'video' },
        //     },
        // ],
        openrating: { $in: [0, 1] }

    };

    await File
        .find(findArgs) //폴더경로 검색
        .populate('writer')
        .skip(skip)
        //파일 중요도, 파일명, 아이디, 생성일자로 정렬
        .sort({ "createdAt": -1, "_id": 1, })
        .limit(limit)
        .exec((err, list) => {
            if (err) return res.status(400).json({ success: false, err })
            return res.status(200).json({ success: true, list })
        })

})

module.exports = router;