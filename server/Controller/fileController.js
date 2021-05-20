const { File } = require('../models/Files');

const getFileList = async (userList) => {
    let idList = userList.map(item => (item._id));
    return new Promise((resolve, reject) => {
        File.find(
            {
                writer: { $in: idList }
                , openrating: { $in: [0, 1] }
            },
        )
            .exec((err, files) => {
                if (err) reject(err);
                resolve(files);
            })
    })



}

module.exports = {
    getFileList
}