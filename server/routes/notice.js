const express = require('express');
const router = express.Router();
const { Notice } = require('../models/Notice');

//공지사항 목록
router.post('/list', (req, res) => {
    const { skip, limit } = req.body;
    Notice.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec((err, list) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true, list });
        })
})
//공지사항 등록
router.post('/upload', (req, res) => {
    const notice = new Notice(req.body);
    notice.save((err, info) => {
        if (err) return res.status(400).send({ success: false });
        return res.status(200).send({ success: true });
    })
})

//공지사항 수정
router.post('/update', (req, res) => {
    const { id, title, subTitle, contents } = req.body;
    Notice.findOneAndUpdate({ _id: id }, { title, subTitle, contents }, (err, notice) => {
        if (err) return res.status(400).send({ success: false });
        return res.status(200).send({ success: true });
    })
})


//공지사항 삭제
router.post('/delete', (req, res) => {
    const { _id } = req.body;
    Notice.findOneAndDelete({ _id })
        .exec((err, result) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true });
        })
});

module.exports = router;