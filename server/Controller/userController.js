const { User } = require('../models/User');
const getUserList = (findArgs, limit, skip) => {

    return new Promise((resolve, reject) => {
        User.find(findArgs)
            .limit(limit)
            .skip(skip)
            .exec(async (err, list) => {
                if (err) reject(err);
                resolve(list)
            });
    })

}

module.exports = {
    getUserList,
}