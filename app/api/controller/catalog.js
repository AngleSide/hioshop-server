function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
module.exports = class extends Base {
    /**
     * 获取分类栏目数据
     * @returns {Promise.<Promise|void|PreventPromise>}
     */
    indexAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const categoryId = _this.get('id');
            const model = _this.model('category');
            const data = yield model.limit(10).where({
                parent_id: 0,
                is_category: 1
            }).order('sort_order ASC').select();
            let currentCategory = null;
            if (categoryId) {
                currentCategory = yield model.where({
                    'id': categoryId
                }).find();
            }
            if (think.isEmpty(currentCategory)) {
                currentCategory = data[0];
            }
            return _this.success({
                categoryList: data
            });
        })();
    }
    currentAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const categoryId = _this2.get('id');
            let data = yield _this2.model('category').where({
                id: categoryId
            }).field('id,name,img_url,p_height').find();
            return _this2.success(data);
        })();
    }
    currentlistAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const page = _this3.post('page');
            const size = _this3.post('size');
            const categoryId = _this3.post('id');
            if (categoryId == 0) {
                let list = yield _this3.model('goods').where({
                    is_on_sale: 1,
                    is_delete: 0
                }).order({
                    sort_order: 'asc'
                }).field('name,id,goods_brief,min_retail_price,list_pic_url,goods_number').page(page, size).countSelect();
                return _this3.success(list);
            } else {
                let list = yield _this3.model('goods').where({
                    is_on_sale: 1,
                    is_delete: 0,
                    category_id: categoryId
                }).order({
                    sort_order: 'asc'
                }).field('name,id,goods_brief,min_retail_price,list_pic_url,goods_number').page(page, size).countSelect();
                return _this3.success(list);
            }
        })();
    }
};