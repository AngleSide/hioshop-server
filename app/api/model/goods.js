function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = class extends think.Model {
    /**
     * 获取商品的product
     * @param goodsId
     * @returns {Promise.<*>}
     */
    getProductList(goodsId) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const goods = yield _this.model('product').where({ goods_id: goodsId, is_delete: 0 }).select();
            return goods;
        })();
    }

    /**
     * 获取商品的规格信息
     * @param goodsId
     * @returns {Promise.<Array>}
     */
    getSpecificationList(goodsId) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            // 根据sku商品信息，查找规格值列表
            let info = yield _this2.model('goods_specification').where({ goods_id: goodsId, is_delete: 0 }).select();
            for (const item of info) {
                let product = yield _this2.model('product').where({
                    goods_specification_ids: item.id,
                    is_delete: 0
                }).find();
                item.goods_number = product.goods_number;
            }
            let spec_id = info[0].specification_id;
            let specification = yield _this2.model('specification').where({ id: spec_id }).find();
            let name = specification.name;
            let data = {
                specification_id: spec_id,
                name: name,
                valueList: info
            };
            return data;
        })();
    }
};