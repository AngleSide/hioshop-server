function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
module.exports = class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const page = _this.get('page') || 1;
            const size = _this.get('size') || 10;
            const name = _this.get('name') || '';
            const model = _this.model('cart');
            const data = yield model.where({ goods_name: ['like', `%${name}%`] }).order(['id DESC']).page(page, size).countSelect();
            for (const item of data.data) {
                item.add_time = moment.unix(item.add_time).format('YYYY-MM-DD HH:mm:ss');
                let userInfo = yield _this.model('user').where({ id: item.user_id }).find();
                if (!think.isEmpty(userInfo)) {
                    item.nickname = Buffer.from(userInfo.nickname, 'base64').toString();
                } else {
                    item.nickname = '已删除';
                }
            }

            return _this.success(data);
        })();
    }

};