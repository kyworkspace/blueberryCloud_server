const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const { Folder } = require('../models/Folder');


router.post('/folder/create', (req, res) => {
    console.log(req.body)
    const folder = new Folder(req.body);

    folder.save((err, folderInfo) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, folderInfo })
    })
})