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
            const model = _this.model('specification');
            const data = yield model.where({
                id: ['>', 0]
            }).select();
            return _this.success(data);
        })();
    }
    getGoodsSpecAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const id = _this2.post('id');
            const model = _this2.model('product');
            const data = yield model.where({
                goods_id: id,
                is_delete: 0
            }).select();
            //TODO 这里只有一层，以后如果有多重型号，如一件商品既有颜色又有尺寸时，这里的代码是不对的。以后再写。
            let specData = [];
            let specification_id = 0;
            for (const item of data) {
                let goods_spec_id = item.goods_specification_ids;
                let specValueData = yield _this2.model('goods_specification').where({
                    id: goods_spec_id,
                    is_delete: 0
                }).find();
                specification_id = specValueData.specification_id;
                item.value = specValueData.value;
            }
            let dataInfo = {
                specData: data,
                specValue: specification_id
            };
            return _this2.success(dataInfo);
        })();
    }
    productUpdateAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const goods_number = _this3.post('goods_number');
            const goods_weight = _this3.post('goods_weight');
            const goods_sn = _this3.post('goods_sn');
            const retail_price = _this3.post('retail_price');
            const cost = _this3.post('cost');
            const value = _this3.post('value');
            let updateInfo = {
                goods_number: goods_number,
                goods_weight: goods_weight,
                cost: cost,
                retail_price: retail_price
            };
            yield _this3.model('cart').where({
                goods_sn: goods_sn
            }).update({
                retail_price: retail_price
            });
            const model = _this3.model('product');
            yield model.where({
                goods_sn: goods_sn
            }).update(updateInfo);
            let idData = yield model.where({
                goods_sn: goods_sn
            }).field('goods_specification_ids,goods_id').find();
            let goods_specification_id = idData.goods_specification_ids;
            let info = yield _this3.model('goods_specification').where({
                id: goods_specification_id
            }).update({
                value: value
            });
            let goods_id = idData.goods_id;
            // todo 价格显示为区间
            let pro = yield _this3.model('product').where({
                goods_id: goods_id
            }).select();
            if (pro.length > 1) {
                let goodsNum = yield _this3.model('product').where({
                    goods_id: goods_id
                }).sum('goods_number');
                let maxPrice = yield _this3.model('product').where({
                    goods_id: goods_id
                }).max('retail_price');
                let minPrice = yield _this3.model('product').where({
                    goods_id: goods_id
                }).min('retail_price');
                let maxCost = yield _this3.model('product').where({
                    goods_id: goods_id
                }).max('cost');
                let minCost = yield _this3.model('product').where({
                    goods_id: goods_id
                }).min('cost');
                let goodsPrice = minPrice + '-' + maxPrice;
                let costPrice = minCost + '-' + maxCost;
                yield _this3.model('goods').where({
                    id: goods_id
                }).update({
                    goods_number: goodsNum,
                    retail_price: goodsPrice,
                    cost_price: costPrice,
                    min_retail_price: minPrice,
                    min_cost_price: minCost
                });
            } else {
                yield _this3.model('goods').where({
                    id: goods_id
                }).update({
                    goods_number: goods_number,
                    retail_price: retail_price,
                    cost_price: cost,
                    min_retail_price: retail_price,
                    min_cost_price: cost
                });
            }
            return _this3.success(info);
        })();
    }
    productDeleAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const productId = _this4.post('id');
            const model = _this4.model('product');
            let idData = yield model.where({
                id: productId
            }).field('goods_specification_ids,goods_id').find();
            let goods_specification_id = idData.goods_specification_ids;
            let goods_id = idData.goods_id;
            yield model.where({
                id: productId
            }).limit(1).delete();
            let info = yield _this4.model('goods_specification').where({
                id: goods_specification_id
            }).limit(1).delete();
            let lastData = yield model.where({
                goods_id: goods_id
            }).select();
            if (lastData.length != 0) {
                let goodsNum = yield _this4.model('product').where({
                    goods_id: goods_id
                }).sum('goods_number');
                let goodsPrice = yield _this4.model('product').where({
                    goods_id: goods_id
                }).min('retail_price');
                yield _this4.model('goods').where({
                    id: goods_id
                }).update({
                    goods_number: goodsNum,
                    retail_price: goodsPrice
                });
            }
            return _this4.success(info);
        })();
    }
    delePrimarySpecAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            const goods_id = _this5.post('id');
            const model = _this5.model('product');
            yield model.where({
                goods_id: goods_id
            }).delete();
            let info = yield _this5.model('goods_specification').where({
                goods_id: goods_id
            }).delete();
            yield _this5.model('goods').where({
                id: goods_id
            }).update({
                goods_number: 0,
                retail_price: 0
            });
            return _this5.success(info);
        })();
    }
    detailAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            let id = _this6.post('id');
            let info = yield _this6.model('specification').where({
                id: id
            }).find();
            return _this6.success(info);
        })();
    }
    addAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const value = _this7.post('name');
            const sort = _this7.post('sort_order');
            let info = {
                name: value,
                sort_order: sort
            };
            const model = _this7.model('specification');
            const data = yield model.add(info);
            return _this7.success(data);
        })();
    }
    checkSnAction() {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            const sn = _this8.post('sn');
            const model = _this8.model('product');
            const data = yield model.where({
                goods_sn: sn
            }).select();
            if (data.length > 0) {
                return _this8.fail('sn已存在');
            } else {
                return _this8.success(data);
            }
        })();
    }
    updateAction() {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            const id = _this9.post('id');
            const value = _this9.post('name');
            const sort = _this9.post('sort_order');
            let info = {
                name: value,
                sort_order: sort
            };
            const model = _this9.model('specification');
            const data = yield model.where({
                id: id
            }).update(info);
            return _this9.success(data);
        })();
    }
    deleteAction() {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            const id = _this10.post('id');
            const goods_spec = yield _this10.model('goods_specification').where({
                specification_id: id,
                is_delete: 0
            }).select();
            console.log(goods_spec);
            if (goods_spec.length > 0) {
                return _this10.fail('该型号下有商品，暂不能删除');
            } else {
                const model = _this10.model('specification');
                const data = yield model.where({
                    id: id
                }).limit(1).delete();
                return _this10.success(data);
            }
        })();
    }
};