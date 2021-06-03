const express = require('express');
const { auth } = require('../middleware/auth');
const { File } = require('../models/Files');
const { getTotalSize } = require('../Controller/fileController')
const router = express.Router();


router.post('/inUseSize', auth, async (req, res) => {
    let { _id } = req.user;
    try {
        let totalSize = await getTotalSize(_id)

        return res.status(200).send({ success: true, totalSize })
    } catch (error) {
        return res.status(400).send({ success: false })
    }
})



module.exports = router