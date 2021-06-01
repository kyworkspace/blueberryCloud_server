const express = require('express');
const { getCommentList } = require('../Controller/commentController');
const router = express.Router();
const { Comment } = require("../models/Comments");

router.post('/list', async (req, res) => {
    let { contentsId } = req.body
    let findArgs = { postId: contentsId };
    let list = await getCommentList(findArgs).catch(err => { return res.status(400).send({ success: false }) });
    return res.status(200).send({ success: true, list })
})

router.post('/post', (req, res) => {
    let { contentsId, userId, content } = req.body
    let param = {
        writer: userId,
        postId: contentsId,
        content
    }
    const comment = new Comment(param);
    comment.save((err, commentInfo) => {
        if (err) return res.status(400).send({ success: false, err });
        return res.status(200).send({ success: true })
    })
})

router.post('/update', async (req, res) => {
    let { id, content } = req.body
    await Comment.findOneAndUpdate(
        { _id: id },
        { $set: { content: content } }
        , { new: true }
        , (err, comment) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true })
        })
});
router.post('/delete', async (req, res) => {
    let { id } = req.body
    Comment.findOneAndDelete({ _id: id })
        .exec((err, result) => {
            if (err) return res.status(400).send({ success: false });
            return res.status(200).send({ success: true })
        })
})


module.exports = router;