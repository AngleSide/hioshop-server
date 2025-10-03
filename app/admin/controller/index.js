function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');

module.exports = class extends Base {
    checkLoginAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            if (think.userId == 0) {
                return _this.fail(404, '请登录');
            }
        })();
    }
    indexAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const goodsOnsale = yield _this2.model('goods').where({ is_on_sale: 1, is_delete: 0 }).count();
            const orderToDelivery = yield _this2.model('order').where({ order_status: 300 }).count();
            const user = yield _this2.model('user').count();
            let data = yield _this2.model('settings').field('countdown').find();
            let timestamp = data.countdown;
            let info = {
                user: user,
                goodsOnsale: goodsOnsale,
                timestamp: timestamp,
                orderToDelivery: orderToDelivery
            };
            return _this2.success(info);
        })();
    }
    getQiniuTokenAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const TokenSerivce = _this3.service('qiniu'); // 服务里返回token
            let data = yield TokenSerivce.getQiniuToken(); // 取得token值 goods
            let qiniuToken = data.uploadToken;
            let domain = data.domain;
            let info = {
                token: qiniuToken,
                url: domain
            };
            return _this3.success(info);
        })();
    }
    mainAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const index = _this4.get('pindex');
            console.log('index:' + index);
            let todayTimeStamp = new Date(new Date().setHours(0, 0, 0, 0)) / 1000; //今天零点的时间戳
            let yesTimeStamp = todayTimeStamp - 86400; //昨天零点的时间戳
            let sevenTimeStamp = todayTimeStamp - 86400 * 7; //7天前零点的时间戳
            let thirtyTimeStamp = todayTimeStamp - 86400 * 30; //30天前零点的时间戳
            let newUser = 1;
            let oldUser = 0;
            let addCart = 0;
            let addOrderNum = 0;
            let addOrderSum = 0;
            let payOrderNum = 0;
            let payOrderSum = 0;
            let newData = [];
            let oldData = [];
            if (index == 0) {
                newData = yield _this4.model('user').where({
                    id: ['>', 0],
                    register_time: ['>', todayTimeStamp]
                }).select();
                newUser = newData.length;
                for (const item of newData) {
                    item.nickname = Buffer.from(item.nickname, 'base64').toString();
                }
                oldData = yield _this4.model('user').where({
                    id: ['>', 0],
                    register_time: ['<', todayTimeStamp],
                    last_login_time: ['>', todayTimeStamp]
                }).select();
                for (const item of oldData) {
                    item.nickname = Buffer.from(item.nickname, 'base64').toString();
                }
                oldUser = oldData.length;
                addCart = yield _this4.model('cart').where({ is_delete: 0, add_time: ['>', todayTimeStamp] }).count();
                addOrderNum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', todayTimeStamp]
                }).count();
                addOrderSum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', todayTimeStamp]
                }).sum('actual_price');
                payOrderNum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', todayTimeStamp],
                    order_status: ['IN', [201, 802, 300, 301]]
                }).count();
                payOrderSum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', todayTimeStamp],
                    order_status: ['IN', [201, 802, 300, 301]]
                }).sum('actual_price');
            } else if (index == 1) {
                newData = yield _this4.model('user').where({
                    id: ['>', 0],
                    register_time: ['BETWEEN', yesTimeStamp, todayTimeStamp]
                }).select();
                for (const item of newData) {
                    item.nickname = Buffer.from(item.nickname, 'base64').toString();
                }
                newUser = newData.length;
                oldData = yield _this4.model('user').where({
                    id: ['>', 0],
                    register_time: ['<', yesTimeStamp],
                    last_login_time: ['BETWEEN', yesTimeStamp, todayTimeStamp]
                }).select();
                for (const item of oldData) {
                    item.nickname = Buffer.from(item.nickname, 'base64').toString();
                }
                oldUser = oldData.length;
                addCart = yield _this4.model('cart').where({
                    is_delete: 0,
                    add_time: ['BETWEEN', yesTimeStamp, todayTimeStamp]
                }).count();
                addOrderNum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['BETWEEN', yesTimeStamp, todayTimeStamp]
                }).count();
                addOrderSum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['BETWEEN', yesTimeStamp, todayTimeStamp]
                }).sum('actual_price');
                payOrderNum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['BETWEEN', yesTimeStamp, todayTimeStamp],
                    order_status: ['IN', [201, 802, 300, 301]]
                }).count();
                console.log('------------321----------');
                console.log(payOrderNum);
                console.log('-----------3321-----------');
                payOrderSum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['BETWEEN', yesTimeStamp, todayTimeStamp],
                    order_status: ['IN', [201, 802, 300, 301]]
                }).sum('actual_price');
                console.log('-----------123-----------');
                console.log(payOrderSum);
                console.log('-----------123-----------');
            } else if (index == 2) {
                newData = yield _this4.model('user').where({
                    id: ['>', 0],
                    register_time: ['>', sevenTimeStamp]
                }).select();
                for (const item of newData) {
                    item.nickname = Buffer.from(item.nickname, 'base64').toString();
                }
                newUser = newData.length;
                oldData = yield _this4.model('user').where({
                    id: ['>', 0],
                    register_time: ['<', sevenTimeStamp],
                    last_login_time: ['>', sevenTimeStamp]
                }).select();
                for (const item of oldData) {
                    item.nickname = Buffer.from(item.nickname, 'base64').toString();
                }
                oldUser = oldData.length;
                addCart = yield _this4.model('cart').where({
                    is_delete: 0,
                    add_time: ['>', sevenTimeStamp]
                }).count();
                addOrderNum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', sevenTimeStamp]
                }).count();
                addOrderSum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', sevenTimeStamp]
                }).sum('actual_price');
                payOrderNum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', sevenTimeStamp],
                    order_status: ['IN', [201, 802, 300, 301]]
                }).count();
                payOrderSum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', sevenTimeStamp],
                    order_status: ['IN', [201, 802, 300, 301]]
                }).sum('actual_price');
            } else if (index == 3) {
                newData = yield _this4.model('user').where({
                    id: ['>', 0],
                    register_time: ['>', thirtyTimeStamp]
                }).select();
                for (const item of newData) {
                    item.nickname = Buffer.from(item.nickname, 'base64').toString();
                }
                newUser = newData.length;
                oldData = yield _this4.model('user').where({
                    id: ['>', 0],
                    register_time: ['<', thirtyTimeStamp],
                    last_login_time: ['>', thirtyTimeStamp]
                }).select();
                for (const item of oldData) {
                    item.nickname = Buffer.from(item.nickname, 'base64').toString();
                }
                oldUser = oldData.length;
                addCart = yield _this4.model('cart').where({
                    is_delete: 0,
                    add_time: ['>', thirtyTimeStamp]
                }).count();
                addOrderNum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', thirtyTimeStamp]
                }).count();
                addOrderSum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', thirtyTimeStamp]
                }).sum('actual_price');
                payOrderNum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', thirtyTimeStamp],
                    order_status: ['IN', [201, 802, 300, 301]]
                }).count();
                payOrderSum = yield _this4.model('order').where({
                    is_delete: 0,
                    add_time: ['>', thirtyTimeStamp],
                    order_status: ['IN', [201, 802, 300, 301]]
                }).sum('actual_price');
            }
            if (addOrderSum == null) {
                addOrderSum = 0;
            }
            if (payOrderSum == null) {
                payOrderSum = 0;
            }
            if (newData.length > 0) {
                for (const item of newData) {
                    item.register_time = moment.unix(item.register_time).format('YYYY-MM-DD HH:mm:ss');
                    item.last_login_time = moment.unix(item.last_login_time).format('YYYY-MM-DD HH:mm:ss');
                }
            }

            if (oldData.length > 0) {
                for (const item of oldData) {
                    item.register_time = moment.unix(item.register_time).format('YYYY-MM-DD HH:mm:ss');
                    item.last_login_time = moment.unix(item.last_login_time).format('YYYY-MM-DD HH:mm:ss');
                }
            }

            let info = {
                newUser: newUser,
                oldUser: oldUser,
                addCart: addCart,
                newData: newData,
                oldData: oldData,
                addOrderNum: addOrderNum,
                addOrderSum: addOrderSum,
                payOrderNum: payOrderNum,
                payOrderSum: payOrderSum
            };
            return _this4.success(info);
        })();
    }

};