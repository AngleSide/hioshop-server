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
            const model = _this.model('ad');
            const data = yield model.where({
                is_delete: 0
            }).order(['id ASC']).page(page, size).countSelect();
            for (const item of data.data) {
                if (item.end_time != 0) {
                    item.end_time = moment.unix(item.end_time).format('YYYY-MM-DD HH:mm:ss');
                }
                if (item.enabled == 1) {
                    item.enabled = true;
                } else {
                    item.enabled = false;
                }
            }
            return _this.success(data);
        })();
    }
    updateSortAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const id = _this2.post('id');
            const sort = _this2.post('sort');
            const model = _this2.model('ad');
            const data = yield model.where({
                id: id
            }).update({
                sort_order: sort
            });
            return _this2.success(data);
        })();
    }
    infoAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const id = _this3.get('id');
            const model = _this3.model('ad');
            const data = yield model.where({
                id: id
            }).find();
            return _this3.success(data);
        })();
    }
    storeAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            if (!_this4.isPost) {
                return false;
            }
            const values = _this4.post();
            console.log(values);
            values.end_time = parseInt(new Date(values.end_time).getTime() / 1000);
            const id = _this4.post('id');
            const model = _this4.model('ad');
            if (id > 0) {
                yield model.where({
                    id: id
                }).update(values);
            } else {
                let ex = yield model.where({
                    goods_id: values.goods_id,
                    is_delete: 0
                }).find();
                if (think.isEmpty(ex)) {
                    delete values.id;
                    if (values.link_type == 0) {
                        values.link = '';
                    } else {
                        values.goods_id = 0;
                    }
                    yield model.add(values);
                } else {
                    return _this4.fail(100, '发生错误');
                }
            }
            return _this4.success(values);
        })();
    }
    getallrelateAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            let data = yield _this5.model('goods').where({
                is_on_sale: 1,
                is_delete: 0
            }).field('id,name,list_pic_url').select();
            return _this5.success(data);
        })();
    }
    destoryAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            const id = _this6.post('id');
            yield _this6.model('ad').where({
                id: id
            }).limit(1).update({
                is_delete: 1
            });
            return _this6.success();
        })();
    }
    saleStatusAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const id = _this7.get('id');
            const status = _this7.get('status');
            let sale = 0;
            if (status == 'true') {
                sale = 1;
            }
            const model = _this7.model('ad');
            yield model.where({
                id: id
            }).update({
                enabled: sale
            });
        })();
    }
};