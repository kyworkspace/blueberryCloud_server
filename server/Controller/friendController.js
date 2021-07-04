const { Friends } = require('../models/Friends');
const { User } = require('../models/User');

const getFriendList = (level, user) => {
    let findArgs = {
        $or: [
            {
                'userTo': user._id
            },
            {
                'userFrom': user._id
            }
        ]
        ,
        'level': level
    }
    return new Promise((resolve, reject) => {
        Friends.find(findArgs)
            .populate('userFrom')
            .populate('userTo')
            .exec((err, list) => {
                if (err) return reject(err);
                const userList = list.map(item => {
                    item.friends = true;
                    if (String(item.userFrom._id) === String(user._id)) {
                        const user = new User(item.userTo);
                        user.set({ friends: true })
                        return user;
                    } else if (String(item.userTo._id) === String(user._id)) {
                        const user = new User(item.userFrom);
                        user.set({ friends: true })
                        return user;
                    }
                });
                resolve(userList);
            })
    })
}

const checkFriend = (userId, myId) => {
    let findArgs = {
        $or: [
            {
                'userTo': userId,
                'userFrom': myId
            },
            {
                'userTo': myId,
                'userFrom': userId
            }
        ]
        ,
        'level': [3]
    }

    return new Promise((resolve, reject) => {
        Friends.find(findArgs).exec((err, list) => {
            if (err) reject(err);
            if (list.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    })
}

module.exports = {
    getFriendList,
    checkFriend
}