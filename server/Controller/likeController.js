const { Like } = require("../models/Like");
const { Dislike } = require("../models/Dislike");


const removeAllLike = () => {
    return new Promise((resolve, reject) => {
        Like.deleteMany().exec((err) => {
            if (err) reject(err);
            resolve({ success: true })
        })
    })

}
const removeAllDisLike = () => {
    return new Promise((resolve, reject) => {
        Dislike.deleteMany().exec((err) => {
            if (err) reject(err);
            resolve({ success: true })
        })
    })
}
const getLikeList = async (findArgs) => {
    return new Promise((resolve, reject) => {
        Like.find(findArgs)
            .populate('userId')
            .limit(8)
            .sort({ createdAt: -1 })
            .exec((err, list) => {
                if (err) reject(err)
                resolve(list)
            })


    })

}

module.exports = {
    removeAllDisLike,
    removeAllLike,
    getLikeList

}