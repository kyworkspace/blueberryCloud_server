const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { Folder } = require('../models/Folder');


router.post('/create', (req, res) => {
    console.log(req.body)
    const folder = new Folder(req.body);

    folder.save((err, folderInfo) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, folderInfo })
    })
})
//폴더 리스트 가져오기
router.post('/list', (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 20;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
    let term = req.body.searchTerm;
    //필터 적용하기 req.body.filters
    let findArgs = {};
    // for (let key in req.body.filters) {

    // }
    let totalCount = 0;
    Folder.count(findArgs, (err, count) => {
        totalCount = count
    })
    Folder.find()
        .populate('writer')
        .skip(skip)
        .sort({ "createdAt": -1, "foldername": 1 })
        .limit(limit)
        .exec((err, fileList) => {
            if (err) return res.status(400).json({ success: false, err })
            res.status(200).json({ success: true, fileList, postSize: fileList.length, totalCount: totalCount })
        })
})

module.exports = router;