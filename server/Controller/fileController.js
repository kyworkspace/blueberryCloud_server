const { File } = require('../models/Files');

const getUserFileList = async (userList) => {
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
};

const getFileList = async (findArgs, skip, limit) => {

    return new Promise((resolve, reject) => {
        File
            .find(findArgs) //폴더경로 검색
            .populate('writer')
            .skip(skip)
            //파일 중요도, 파일명, 아이디, 생성일자로 정렬
            .sort({ "importance": 1, "createdAt": -1, "filename": 1, "_id": 1, })
            .limit(limit)
            .exec((err, fileList) => {
                if (err) reject(err)
                resolve(fileList)
            })

    })
}
const getFileCount = async (findArgs) => {
    return new Promise((resolve, reject) => {
        File.count(findArgs, (err, count) => {
            if (err) reject(err);
            resolve(count);
        })
    })
}

module.exports = {
    getUserFileList,
    getFileCount,
    getFileList
}