function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
const md5 = require('md5');
module.exports = class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const data = yield _this.model('admin').where({
                // is_show: 1,
                is_delete: 0
            }).select();
            for (const item of data) {
                if (item.last_login_time != 0) {
                    item.last_login_time = moment.unix(item.last_login_time).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    item.last_login_time = '还没登录过';
                }
                item.password = '';
            }
            return _this.success(data);
        })();
    }
    adminDetailAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            let id = _this2.post('id');
            let info = yield _this2.model('admin').where({
                id: id
            }).find();
            return _this2.success(info);
        })();
    }
    adminAddAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            let user = _this3.post('user');
            let password = user.password;
            let upData = {
                username: info.username,
                password_salt: 'HIOLABS'
            };
            if (password.replace(/(^\s*)|(\s*$)/g, "").length != 0) {
                password = md5(info.password + '' + upData.password_salt);
                upData.password = password;
            }
            yield _this3.model('admin').add(upData);
            return _this3.success();
        })();
    }
    adminSaveAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            let user = _this4.post('user');
            let change = _this4.post('change');
            let upData = {
                username: user.username
            };
            if (change == true) {
                let newPassword = user.newpassword;
                if (newPassword.replace(/(^\s*)|(\s*$)/g, "").length != 0) {
                    newPassword = md5(user.newpassword + '' + user.password_salt);
                    upData.password = newPassword;
                }
            }
            let ex = yield _this4.model('admin').where({
                username: user.username,
                id: ['<>', user.id]
            }).find();
            if (!think.isEmpty(ex)) {
                return _this4.fail(400, '重名了');
            }
            // if (user.id == 14) {
            //     return this.fail(400, '演示版后台的管理员密码不能修改!本地开发，删除这个判断')
            // }
            yield _this4.model('admin').where({
                id: user.id
            }).update(upData);
            return _this4.success();
        })();
    }
    infoAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            const id = _this5.get('id');
            const model = _this5.model('user');
            const data = yield model.where({
                id: id
            }).find();
            return _this5.success(data);
        })();
    }
    storeAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            if (!_this6.isPost) {
                return false;
            }
            const values = _this6.post();
            const id = _this6.post('id');
            const model = _this6.model('user');
            values.is_show = values.is_show ? 1 : 0;
            values.is_new = values.is_new ? 1 : 0;
            if (id > 0) {
                yield model.where({
                    id: id
                }).update(values);
            } else {
                delete values.id;
                yield model.add(values);
            }
            return _this6.success(values);
        })();
    }
    deleAdminAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const id = _this7.post('id');
            yield _this7.model('admin').where({
                id: id
            }).limit(1).delete();
            return _this7.success();
        })();
    }
    showsetAction() {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            const model = _this8.model('show_settings');
            let data = yield model.find();
            return _this8.success(data);
        })();
    }
    showsetStoreAction() {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            let id = 1;
            const values = _this9.post();
            const model = _this9.model('show_settings');
            yield model.where({
                id: id
            }).update(values);
            return _this9.success(values);
        })();
    }
    changeAutoStatusAction() {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            const status = _this10.post('status');
            yield _this10.model('settings').where({
                id: 1
            }).update({
                autoDelivery: status
            });
            return _this10.success();
        })();
    }
    storeShipperSettingsAction() {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            const values = _this11.post();
            yield _this11.model('settings').where({
                id: values.id
            }).update(values);
            return _this11.success();
        })();
    }
    senderInfoAction() {
        var _this12 = this;

        return _asyncToGenerator(function* () {
            let info = yield _this12.model('settings').where({
                id: 1
            }).find();
            return _this12.success(info);
        })();
    }
};