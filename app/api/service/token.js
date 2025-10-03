function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const jwt = require('jsonwebtoken');
const secret = 'sdfsdfsdf123123!ASDasdasdasdasda';
module.exports = class extends think.Service {
    /**
     * 根据header中的x-hioshop-token值获取用户id
     */
    getUserId(token) {
        if (!token) {
            return 0;
        }
        const result = this.parse(token);
        if (think.isEmpty(result) || result.user_id <= 0) {
            return 0;
        }
        return result.user_id;
    }
    parse(token) {
        if (token) {
            try {
                return jwt.verify(token, secret);
            } catch (err) {
                return null;
            }
        }
        return null;
    }
    create(userInfo) {
        return _asyncToGenerator(function* () {
            const token = jwt.sign(userInfo, secret);
            return token;
        })();
    }
    /**
     * 根据值获取用户信息
     */
    getUserInfo() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const userId = yield _this.getUserId();
            if (userId <= 0) {
                return null;
            }
            const userInfo = yield _this.model('user').field(['id', 'username', 'nickname', 'gender', 'avatar', 'birthday']).where({
                id: userId
            }).find();
            return think.isEmpty(userInfo) ? null : userInfo;
        })();
    }
    verify() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const result = yield _this2.parse();
            if (think.isEmpty(result)) {
                return false;
            }
            return true;
        })();
    }
};