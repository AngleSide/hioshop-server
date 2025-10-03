function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
module.exports = class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const model = _this.model('category');
            const data = yield model.order(['sort_order ASC']).select();
            const topCategory = data.filter(function (item) {
                return item.parent_id === 0;
            });
            const categoryList = [];
            topCategory.map(function (item) {
                item.level = 1;
                categoryList.push(item);
                data.map(function (child) {
                    if (child.parent_id === item.id) {
                        child.level = 2;
                        categoryList.push(child);
                    }
                    if (child.is_show == 1) {
                        child.is_show = true;
                    } else {
                        child.is_show = false;
                    }
                    if (child.is_channel == 1) {
                        child.is_channel = true;
                    } else {
                        child.is_channel = false;
                    }
                    if (child.is_category == 1) {
                        child.is_category = true;
                    } else {
                        child.is_category = false;
                    }
                });
            });
            return _this.success(categoryList);
        })();
    }
    updateSortAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const id = _this2.post('id');
            const sort = _this2.post('sort');
            const model = _this2.model('category');
            const data = yield model.where({
                id: id
            }).update({
                sort_order: sort
            });
            return _this2.success(data);
        })();
    }
    topCategoryAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const model = _this3.model('category');
            const data = yield model.where({
                parent_id: 0
            }).order(['id ASC']).select();
            return _this3.success(data);
        })();
    }
    infoAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const id = _this4.get('id');
            const model = _this4.model('category');
            const data = yield model.where({
                id: id
            }).find();
            return _this4.success(data);
        })();
    }
    storeAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            if (!_this5.isPost) {
                return false;
            }
            const values = _this5.post();
            const id = _this5.post('id');
            const model = _this5.model('category');
            values.is_show = values.is_show ? 1 : 0;
            values.is_channel = values.is_channel ? 1 : 0;
            values.is_category = values.is_category ? 1 : 0;
            if (id > 0) {
                yield model.where({
                    id: id
                }).update(values);
            } else {
                delete values.id;
                yield model.add(values);
            }
            return _this5.success(values);
        })();
    }
    destoryAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            const id = _this6.post('id');
            let data = yield _this6.model('category').where({
                parent_id: id
            }).select();
            if (data.length > 0) {
                return _this6.fail();
            } else {
                yield _this6.model('category').where({
                    id: id
                }).limit(1).delete();
                return _this6.success();
            }
        })();
    }
    showStatusAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const id = _this7.get('id');
            const status = _this7.get('status');
            let ele = 0;
            if (status == 'true') {
                ele = 1;
            }
            const model = _this7.model('category');
            yield model.where({
                id: id
            }).update({
                is_show: ele
            });
        })();
    }
    channelStatusAction() {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            const id = _this8.get('id');
            const status = _this8.get('status');
            let stat = 0;
            if (status == 'true') {
                stat = 1;
            }
            const model = _this8.model('category');
            yield model.where({
                id: id
            }).update({
                is_channel: stat
            });
        })();
    }
    categoryStatusAction() {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            const id = _this9.get('id');
            const status = _this9.get('status');
            let stat = 0;
            if (status == 'true') {
                stat = 1;
            }
            const model = _this9.model('category');
            yield model.where({
                id: id
            }).update({
                is_category: stat
            });
        })();
    }
    deleteBannerImageAction() {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            let id = _this10.post('id');
            yield _this10.model('category').where({
                id: id
            }).update({
                img_url: ''
            });
            return _this10.success();
        })();
    }
    deleteIconImageAction() {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            let id = _this11.post('id');
            yield _this11.model('category').where({
                id: id
            }).update({
                icon_url: ''
            });
            return _this11.success();
        })();
    }
};