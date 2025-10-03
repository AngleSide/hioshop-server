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
            // const product = await this.model('product').where({is_delete:1}).delete()
            const product = yield _this.model('product').field(['c.goods_sn', 'c.goods_id', 'c.goods_specification_ids', 'c.retail_price', 'g.value']).alias('c').join({
                table: 'goods_specification',
                join: 'left',
                as: 'g',
                on: ['c.goods_specification_ids', 'g.id']
            }).select(); // 如果出错了，不会更新数据的
            console.log(product);
            // const goods = await this.model('goods').where({is_delete:0}).select();
            const goods = yield _this.model('goods').where({
                is_delete: 0
            }).select();
            for (const item of product) {
                let goods_id = item.goods_id;
                for (const jtem of goods) {
                    if (goods_id == jtem.id) {
                        // const product = await this.model('product').where({goods_id:jtem.id}).update({is_delete:0})
                        item.name = jtem.name + '-' + item.value;
                        item.is_on_sale = jtem.is_on_sale;
                        item.list_pic_url = jtem.list_pic_url;
                        if (item.is_on_sale == 1) {
                            item.is_on_sale = true;
                        } else {
                            item.is_on_sale = false;
                        }
                    }
                }
            }
            return _this.success(product);
        })();
    }
    onsaleAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const product = yield _this2.model('product').field(['c.goods_sn', 'c.goods_id', 'c.goods_specification_ids', 'c.retail_price', 'g.value']).alias('c').join({
                table: 'goods_specification',
                join: 'left',
                as: 'g',
                on: ['c.goods_specification_ids', 'g.id']
            }).select(); // 如果出错了，不会更新数据的
            const goods = yield _this2.model('goods').where({
                is_on_sale: 1,
                is_delete: 0
            }).select();
            console.log(goods);
            let info = [];
            for (const item of product) {
                let goods_id = item.goods_id;
                for (const jtem of goods) {
                    if (goods_id == jtem.id) {
                        item.name = jtem.name + '-' + item.value;
                        item.is_on_sale = jtem.is_on_sale;
                        item.list_pic_url = jtem.list_pic_url;
                        if (item.is_on_sale == 1) {
                            item.is_on_sale = true;
                            info.push(item);
                        }
                    }
                }
            }
            console.log(product);
            return _this2.success(info);
        })();
    }
    outsaleAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const product = yield _this3.model('product').field(['c.goods_sn', 'c.goods_id', 'c.goods_specification_ids', 'c.retail_price', 'g.value']).alias('c').join({
                table: 'goods_specification',
                join: 'left',
                as: 'g',
                on: ['c.goods_specification_ids', 'g.id']
            }).select(); // 如果出错了，不会更新数据的
            let info = [];
            const goods = yield _this3.model('goods').where({
                is_on_sale: 0,
                is_delete: 0
            }).select();
            console.log(goods);
            for (const item of product) {
                let goods_id = item.goods_id;
                for (const jtem of goods) {
                    if (goods_id == jtem.id) {
                        item.name = jtem.name + '-' + item.value;
                        item.is_on_sale = jtem.is_on_sale;
                        item.list_pic_url = jtem.list_pic_url;
                        if (item.is_on_sale == 0) {
                            item.is_on_sale = false;
                            info.push(item);
                        }
                    }
                }
            }
            console.log(product);
            return _this3.success(info);
        })();
    }
    updatePriceAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const sn = _this4.post('sn');
            const id = _this4.post('id');
            const price = _this4.post('price');
            const info = yield _this4.model('product').where({
                goods_sn: sn
            }).update({
                retail_price: price
            });
            let min = yield _this4.model('product').where({
                goods_id: id
            }).min('retail_price');
            yield _this4.model('cart').where({
                goods_sn: sn
            }).update({
                retail_price: price
            });
            yield _this4.model('goods').where({
                id: id
            }).update({
                retail_price: min
            });
            return _this4.success();
        })();
    }
    outAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            const page = _this5.get('page') || 1;
            const size = _this5.get('size') || 10;
            const model = _this5.model('goods');
            const data = yield model.where({
                is_delete: 0,
                goods_number: ['<=', 0]
            }).order(['id DESC']).page(page, size).countSelect();
            for (const item of data.data) {
                const info = yield _this5.model('category').where({
                    id: item.category_id
                }).find();
                item.category_name = info.name;
                if (info.parent_id != 0) {
                    const parentInfo = yield _this5.model('category').where({
                        id: info.parent_id
                    }).find();
                    item.category_p_name = parentInfo.name;
                }
                if (item.is_on_sale == 1) {
                    item.is_on_sale = true;
                } else {
                    item.is_on_sale = false;
                }
            }
            return _this5.success(data);
        })();
    }
    dropAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            const page = _this6.get('page') || 1;
            const size = _this6.get('size') || 10;
            const model = _this6.model('goods');
            const data = yield model.where({
                is_delete: 0,
                is_on_sale: 0
            }).order(['id DESC']).page(page, size).countSelect();
            for (const item of data.data) {
                const info = yield _this6.model('category').where({
                    id: item.category_id
                }).find();
                item.category_name = info.name;
                if (info.parent_id != 0) {
                    const parentInfo = yield _this6.model('category').where({
                        id: info.parent_id
                    }).find();
                    item.category_p_name = parentInfo.name;
                }
                if (item.is_on_sale == 1) {
                    item.is_on_sale = true;
                } else {
                    item.is_on_sale = false;
                }
            }
            return _this6.success(data);
        })();
    }
    sortAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const page = _this7.get('page') || 1;
            const size = _this7.get('size') || 10;
            const model = _this7.model('goods');
            const index = _this7.get('index');
            if (index == 1) {
                const data = yield model.where({
                    is_delete: 0
                }).order(['sell_volume DESC']).page(page, size).countSelect();
                for (const item of data.data) {
                    const info = yield _this7.model('category').where({
                        id: item.category_id
                    }).find();
                    item.category_name = info.name;
                    if (info.parent_id != 0) {
                        const parentInfo = yield _this7.model('category').where({
                            id: info.parent_id
                        }).find();
                        item.category_p_name = parentInfo.name;
                    }
                    if (item.is_on_sale == 1) {
                        item.is_on_sale = true;
                    } else {
                        item.is_on_sale = false;
                    }
                }
                return _this7.success(data);
            } else if (index == 2) {
                const data = yield model.where({
                    is_delete: 0
                }).order(['retail_price DESC']).page(page, size).countSelect();
                for (const item of data.data) {
                    const info = yield _this7.model('category').where({
                        id: item.category_id
                    }).find();
                    item.category_name = info.name;
                    if (info.parent_id != 0) {
                        const parentInfo = yield _this7.model('category').where({
                            id: info.parent_id
                        }).find();
                        item.category_p_name = parentInfo.name;
                    }
                    if (item.is_on_sale == 1) {
                        item.is_on_sale = true;
                    } else {
                        item.is_on_sale = false;
                    }
                }
                return _this7.success(data);
            } else if (index == 3) {
                const data = yield model.where({
                    is_delete: 0
                }).order(['goods_number DESC']).page(page, size).countSelect();
                for (const item of data.data) {
                    const info = yield _this7.model('category').where({
                        id: item.category_id
                    }).find();
                    item.category_name = info.name;
                    if (info.parent_id != 0) {
                        const parentInfo = yield _this7.model('category').where({
                            id: info.parent_id
                        }).find();
                        item.category_p_name = parentInfo.name;
                    }
                    if (item.is_on_sale == 1) {
                        item.is_on_sale = true;
                    } else {
                        item.is_on_sale = false;
                    }
                }
                return _this7.success(data);
            }
        })();
    }
    saleStatusAction() {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            const id = _this8.get('id');
            const status = _this8.get('status');
            let sale = 0;
            if (status == 'true') {
                sale = 1;
            }
            const model = _this8.model('goods');
            yield model.where({
                id: id
            }).update({
                is_on_sale: sale
            });
        })();
    }
    infoAction() {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            const id = _this9.get('id');
            const model = _this9.model('goods');
            const data = yield model.where({
                id: id
            }).find();
            console.log(data);
            let category_id = data.category_id;
            let cateData = [];
            const c_data = yield _this9.model('category').where({
                id: category_id
            }).find();
            const f_data = yield _this9.model('category').where({
                id: c_data.parent_id
            }).find();
            cateData.push(f_data.id, c_data.id);
            let productInfo = yield _this9.model('product').where({
                goods_id: id
            }).select();
            if (productInfo.length > 1) {}
            let infoData = {
                info: data,
                cateData: cateData
            };
            return _this9.success(infoData);
        })();
    }
    getAllCategory1Action() {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            // 我写的算法
            const model = _this10.model('category');
            const data = yield model.where({
                is_show: 1,
                level: 'L1'
            }).select();
            const c_data = yield model.where({
                is_show: 1,
                level: 'L2'
            }).select();
            let newData = [];
            for (const item of data) {
                let children = [];
                for (const citem of c_data) {
                    if (citem.parent_id == item.id) {
                        children.push({
                            value: citem.id,
                            label: citem.name
                        });
                    }
                }
                newData.push({
                    value: item.id,
                    label: item.name,
                    children: children
                });
            }
            return _this10.success(newData);
        })();
    }
    getAllCategoryAction() {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            // 老婆的算法
            const model = _this11.model('category');
            const data = yield model.where({
                is_show: 1,
                level: 'L1'
            }).field('id,name').select();
            let newData = [];
            for (const item of data) {
                let children = [];
                const c_data = yield model.where({
                    is_show: 1,
                    level: 'L2',
                    parent_id: item.id
                }).field('id,name').select();
                for (const c_item of c_data) {
                    children.push({
                        value: c_item.id,
                        label: c_item.name
                    });
                }
                newData.push({
                    value: item.id,
                    label: item.name,
                    children: children
                });
            }
            return _this11.success(newData);
        })();
    }
    getGoodsSnNameAction() {
        var _this12 = this;

        return _asyncToGenerator(function* () {
            const cateId = _this12.get('cateId');
            const model = _this12.model('goods');
            const data = yield model.where({
                category_id: cateId,
                is_delete: 0
            }).field('goods_sn,name').order({
                'goods_sn': 'DESC'
            }).select();
            return _this12.success(data);
        })();
    }
    storeAction() {
        var _this13 = this;

        return _asyncToGenerator(function* () {
            const values = _this13.post('info');
            const model = _this13.model('goods');
            let picUrl = values.list_pic_url;
            let goods_id = values.id;
            yield _this13.model('cart').where({
                goods_id: goods_id
            }).update({
                list_pic_url: picUrl
            });
            values.is_new = values.is_new ? 1 : 0;
            let id = values.id;
            if (id > 0) {
                yield model.where({
                    id: id
                }).update(values);
            } else {
                delete values.id;
                let goods_id = yield model.add(values);
                yield model.where({
                    id: goods_id
                }).update({
                    goods_sn: goods_id
                });
            }
            return _this13.success(values);
        })();
    }

    destoryAction() {
        var _this14 = this;

        return _asyncToGenerator(function* () {
            const id = _this14.post('id');
            yield _this14.model('goods').where({
                id: id
            }).limit(1).delete();
            return _this14.success();
        })();
    }
};