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

module.exports = {
    removeAllDisLike,
    removeAllLike

}