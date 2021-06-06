const { Comment } = require('../models/Comments');

const getCommentList = (findArgs) => {
    return new Promise((resolve, reject) => {
        Comment.find(findArgs)
            .sort({ 'createdAt': -1 })
            .populate('writer')
            .exec((err, list) => {
                if (err) reject(err);
                resolve(list);
            })
    })
}
const removeAllComments = () => {
    return new Promise((resolve, reject) => {
        Comment.deleteMany().exec(err => {
            if (err) reject(err);
            resolve({ success: true });
        })
    })
}

module.exports = {
    getCommentList,
    removeAllComments
}