const express = require('express');
const router = express.Router();
const { Friends } = require('../models/Friends');
const { auth } = require('../middleware/auth');

router.post('/add', auth, (req, res) => {
    let adder = req.user._id;
    let { target } = req.body;

    Friends.findOneAndUpdate(
        { userTo: target, userFrom: adder },
        { $set: { level: 2 } },
        { upsert: true }
        , (err, friend) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true })
        });
});

router.post('/receive/list', auth, (req, res) => {

    let findArgs = {
        'userTo': req.user._id,
        'level': 2
    }
    console.log(findArgs)
    Friends.find({ 'level': 2 })
        .populate('userFrom')
        .exec((err, list) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true, list })
        })


})



module.exports = router;