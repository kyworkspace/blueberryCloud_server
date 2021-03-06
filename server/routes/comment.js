const express = require('express');
const { getCommentList } = require('../Controller/commentController');
const router = express.Router();
const { Comment } = require("../models/Comments");
const { auth } = require("../middleware/auth");
const { getFileList } = require('../Controller/fileController');
router.post('/list', async (req, res) => {
    let { contentsId } = req.body
    let findArgs = { postId: contentsId };
    let list = await getCommentList(findArgs).catch(err => {
        console.log(`댓글 목록 오류`);
        return res.status(400).send({ success: false })
    });
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
        if (err) {
            console.log(`댓글 업로드 오류`);
            return res.status(400).send({ success: false, err });
        }
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
            if (err) {
                console.log('댓글 수정 오류');
                return res.status(400).send({ success: false });
            }
            return res.status(200).send({ success: true })
        })
});
router.post('/delete', async (req, res) => {
    let { id } = req.body
    Comment.findOneAndDelete({ _id: id })
        .exec((err, result) => {
            if (err) {
                console.log('댓글 삭제 오류');
                return res.status(400).send({ success: false });
            }
            return res.status(200).send({ success: true })
        })
})
router.post('/main/list', auth, async (req, res) => {
    const { _id } = req.user;
    try {
        const filelist = await getFileList({ "writer": _id });
        const fileIdList = filelist.map(itme => itme._id)
        const commentsList = await getCommentList({ "postId": { $in: fileIdList } });
        const list = commentsList.slice(0, 8).map((item, index) => {
            let obj = new Object();
            obj.id = item._id;
            const file = filelist.find(x => String(x._id) === String(item.postId))
            obj.file = file;
            obj.user = item.writer;
            obj.content = item.content;
            return obj;
        })
        return res.status(200).send({ success: true, list });
    } catch (error) {
        console.log('메인화면 댓글 오류')
        return res.status(400).send({ success: false });
    }
})



module.exports = router;