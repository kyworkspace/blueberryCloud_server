const { File } = require('../models/Files');

const getUserFileList = (userList) => {
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

const getFileList = (findArgs, skip, limit) => {

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
const getFileCount = (findArgs) => {
    return new Promise((resolve, reject) => {
        File.find(findArgs, (err, list) => {
            if (err) reject(err);
            resolve(list.length);
        })
    })
}
const getTotalSize = (userId) => {
    return new Promise((resolve, reject) => {
        File.find({ writer: userId })
            .exec((err, list) => {
                if (err) reject(err);
                let totalSize = 0;
                list.map(item => {
                    totalSize += item.size;
                })
                resolve(totalSize);
            })
    })
}
const removeAllFiles = () => {
    return new Promise((resolve, reject) => {
        File.deleteMany().exec(err => {
            if (err) reject(err);
            resolve({ success: true });
        })
    })
}

module.exports = {
    getUserFileList,
    getFileCount,
    getFileList,
    getTotalSize,
    removeAllFiles
}