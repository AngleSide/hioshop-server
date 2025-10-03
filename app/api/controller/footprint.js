function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');
module.exports = class extends Base {
    /**
     *
     * @returns {Promise<void|Promise|PreventPromise>}
     */
    deleteAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const footprintId = _this.post('footprintId');
            const userId = _this.getLoginUserId();;
            // 删除当天的同一个商品的足迹
            yield _this.model('footprint').where({
                user_id: userId,
                id: footprintId
            }).delete();
            return _this.success('删除成功');
        })();
    }
    /**
     * list action
     * @return {Promise} []
     */
    listAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const page = _this2.get('page');
            const size = _this2.get('size');
            const userId = _this2.getLoginUserId();;
            const list = yield _this2.model('footprint').alias('f').join({
                table: 'goods',
                join: 'left',
                as: 'g',
                on: ['f.goods_id', 'g.id']
            }).where({
                user_id: userId
            }).page(page, size).order({
                add_time: 'desc'
            }).field('id,goods_id,add_time').countSelect();
            for (const item of list.data) {
                let goods = yield _this2.model('goods').where({
                    id: item.goods_id
                }).field('name,goods_brief,retail_price,list_pic_url,goods_number,min_retail_price').find();
                item.add_time = moment.unix(item.add_time).format('YYYY-MM-DD');
                item.goods = goods;
                if (moment().format('YYYY-MM-DD') == item.add_time) {
                    item.add_time = '今天';
                }
            }
            return _this2.success(list);
        })();
    }
};