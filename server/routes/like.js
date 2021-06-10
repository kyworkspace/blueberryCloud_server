const express = require('express');
const router = express.Router();
const { Like } = require("../models/Like");
const { Dislike } = require("../models/Dislike");
const { getLikeList } = require('../Controller/likeController');
const { auth } = require('../middleware/auth');
const { getFileList } = require('../Controller/fileController')

//=================================
//             Like
//=================================

router.post("/getLikes", (req, res) => {
    let { contentsId, commentId } = req.body
    let variable = {};
    if (req.body.contentsId) {
        variable = { contentsId }
    } else {
        variable = { commentId }
    }

    Like.find(variable)
        .exec((err, list) => {
            if (err) return res.status(400).send(err);
            return res.status(200).json({ success: true, list })
        })
})

router.post("/getDislikes", (req, res) => {
    let { contentsId, commentId } = req.body
    let variable = {};
    if (req.body.contentsId) {
        variable = { contentsId }
    } else {
        variable = { commentId }
    }
    Dislike.find(variable)
        .exec((err, list) => {
            if (err) return res.status(400).send(err);
            return res.status(200).json({ success: true, list })
        })
})

router.post("/upLike", (req, res) => {
    let { contentsId, commentId, userId, userTo } = req.body
    let variable = {};
    if (req.body.contentsId) {
        variable = { contentsId, userId, userTo }
    } else {
        variable = { commentId, userId, userTo }
    }

    //Like Collection에 클릭 정보를 넣어줄것
    const like = new Like(variable);
    like.save((err, likeResult) => {
        if (err) return res.json({ success: false, err })
        // 싫어요가 눌러져있는 경우 Dislike를 1 줄여준다.
        Dislike.findOneAndDelete(variable)
            .exec((err, dislikeResult) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true });
            })
    });

})

router.post("/unLike", (req, res) => {
    let { contentsId, commentId, userId } = req.body
    let variable = {};
    if (req.body.contentsId) {
        variable = { contentsId, userId }
    } else {
        variable = { commentId, userId }
    }
    Like.findOneAndDelete(variable)
        .exec((err, likeResult) => {
            if (err) return res.status(400).json({ success: false, err })
            res.status(200).json({ success: true })
        })

})
router.post("/unDisLike", (req, res) => {
    let { contentsId, commentId, userId } = req.body
    let variable = {};
    if (req.body.contentsId) {
        variable = { contentsId, userId }
    } else {
        variable = { commentId, userId }
    }
    Dislike.findOneAndDelete(variable)
        .exec((err, likeResult) => {
            if (err) return res.status(400).json({ success: false, err })
            res.status(200).json({ success: true })
        })

})
router.post("/upDislike", (req, res) => {
    let { contentsId, commentId, userId } = req.body
    let variable = {};
    if (req.body.contentsId) {
        variable = { contentsId, userId }
    } else {
        variable = { commentId, userId }
    }
    //Like Collection에 클릭 정보를 넣어줄것
    const dislike = new Dislike(variable);
    dislike.save((err, likeResult) => {
        if (err) return res.json({ success: false, err })
        // 좋아요 눌러져있는 경우 Dislike를 1 줄여준다.
        Like.findOneAndDelete(variable)
            .exec((err, dislikeResult) => {
                if (err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true });
            })
    });

})

router.post('/main/list', auth, async (req, res) => {
    const { _id } = req.user;
    try {
        const filelist = await getFileList({ "writer": _id });
        const fileIdList = filelist.map(itme => itme._id)
        const LikeList = await getLikeList({ contentsId: { $in: fileIdList } });
        const list = LikeList.map(item => {
            let obj = new Object();

            const file = filelist.find(x => {
                return String(x._id) === String(item.contentsId)
            })
            obj.id = item._id;
            obj.user = item.userId;
            obj.file = file;
            return obj;
        });
        return res.status(200).send({ success: true, list })
    } catch (error) {
        console.error(new Date().toLocaleString(), _id, error);
        return res.status(400).send({ success: false })
    }


})

module.exports = router;
