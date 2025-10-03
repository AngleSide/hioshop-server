function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
module.exports = class extends Base {
    indexAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const model = _this.model('goods');
            const goodsList = yield model.select();
            return _this.success(goodsList);
        })();
    }
    /**
     * 商品详情页数据
     * @returns {Promise.<Promise|PreventPromise|void>}
     */
    detailAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const goodsId = _this2.get('id');
            const userId = _this2.getLoginUserId();;
            const model = _this2.model('goods');
            let info = yield model.where({
                id: goodsId,
                is_delete: 0
            }).find();
            if (think.isEmpty(info)) {
                return _this2.fail('该商品不存在或已下架');
            }
            const gallery = yield _this2.model('goods_gallery').where({
                goods_id: goodsId,
                is_delete: 0
            }).order('sort_order').limit(6).select();
            yield _this2.model('footprint').addFootprint(userId, goodsId);
            let productList = yield model.getProductList(goodsId);
            let goodsNumber = 0;
            for (const item of productList) {
                if (item.goods_number > 0) {
                    goodsNumber = goodsNumber + item.goods_number;
                }
            }
            let specificationList = yield model.getSpecificationList(goodsId);
            info.goods_number = goodsNumber;
            return _this2.success({
                info: info,
                gallery: gallery,
                specificationList: specificationList,
                productList: productList
            });
        })();
    }
    goodsShareAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const goodsId = _this3.get('id');
            const info = yield _this3.model('goods').where({
                id: goodsId
            }).field('name,retail_price').find();
            return _this3.success(info);
        })();
    }
    /**
     * 获取商品列表
     * @returns {Promise.<*>}
     */
    listAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const userId = _this4.getLoginUserId();;
            const keyword = _this4.get('keyword');
            const sort = _this4.get('sort');
            const order = _this4.get('order');
            const sales = _this4.get('sales');
            const model = _this4.model('goods');
            const whereMap = {
                is_on_sale: 1,
                is_delete: 0
            };
            if (!think.isEmpty(keyword)) {
                whereMap.name = ['like', `%${keyword}%`];
                // 添加到搜索历史
                yield _this4.model('search_history').add({
                    keyword: keyword,
                    user_id: userId,
                    add_time: parseInt(new Date().getTime() / 1000)
                });
                //    TODO 之后要做个判断，这个词在搜索记录中的次数，如果大于某个值，则将他存入keyword
            }
            // 排序
            let orderMap = {};
            if (sort === 'price') {
                // 按价格
                orderMap = {
                    retail_price: order
                };
            } else if (sort === 'sales') {
                // 按价格
                orderMap = {
                    sell_volume: sales
                };
            } else {
                // 按商品添加时间
                orderMap = {
                    sort_order: 'asc'
                };
            }
            const goodsData = yield model.where(whereMap).order(orderMap).select();
            return _this4.success(goodsData);
        })();
    }
    /**
     * 在售的商品总数
     * @returns {Promise.<Promise|PreventPromise|void>}
     */
    countAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            const goodsCount = yield _this5.model('goods').where({
                is_delete: 0,
                is_on_sale: 1
            }).count('id');
            return _this5.success({
                goodsCount: goodsCount
            });
        })();
    }
};