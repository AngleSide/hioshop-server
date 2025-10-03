function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
const fs = require('fs');
const path = require("path");
const qiniu = require('qiniu');
module.exports = class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const page = _this.get('page') || 1;
            const size = _this.get('size');
            const name = _this.get('name') || '';
            const model = _this.model('goods');
            const data = yield model.where({
                name: ['like', `%${name}%`],
                is_delete: 0
            }).order(['sort_order asc']).page(page, size).countSelect();
            // let newData = data;
            for (const item of data.data) {
                const info = yield _this.model('category').where({
                    id: item.category_id
                }).find();
                item.category_name = info.name;
                if (item.is_on_sale == 1) {
                    item.is_on_sale = true;
                } else {
                    item.is_on_sale = false;
                }
                if (item.is_index == 1) {
                    item.is_index = true;
                } else {
                    item.is_index = false;
                }
                let product = yield _this.model('product').where({
                    goods_id: item.id,
                    is_delete: 0
                }).select();
                for (const ele of product) {
                    let spec = yield _this.model('goods_specification').where({
                        id: ele.goods_specification_ids,
                        is_delete: 0
                    }).find();
                    ele.value = spec.value;
                    ele.is_on_sale = ele.is_on_sale ? "1" : "0";
                }
                item.product = product;
            }
            return _this.success(data);
        })();
    }
    getExpressDataAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            let kd = [];
            let cate = [];
            const kdData = yield _this2.model('freight_template').where({
                is_delete: 0
            }).select();
            for (const item of kdData) {
                kd.push({
                    value: item.id,
                    label: item.name
                });
            }
            const cateData = yield _this2.model('category').where({
                parent_id: 0
            }).select();
            for (const item of cateData) {
                cate.push({
                    value: item.id,
                    label: item.name
                });
            }
            let infoData = {
                kd: kd,
                cate: cate
            };
            return _this2.success(infoData);
        })();
    }
    copygoodsAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const goodsId = _this3.post('id');
            let data = yield _this3.model('goods').where({
                id: goodsId
            }).find();
            delete data.id;
            data.is_on_sale = 0;
            let insertId = yield _this3.model('goods').add(data);
            let goodsGallery = yield _this3.model('goods_gallery').where({
                goods_id: goodsId,
                is_delete: 0
            }).select();
            for (const item of goodsGallery) {
                let gallery = {
                    img_url: item.img_url,
                    sort_order: item.sort_order,
                    goods_id: insertId
                };
                yield _this3.model('goods_gallery').add(gallery);
            }
            return _this3.success(insertId);
        })();
    }
    updateStock(goods_sn, goods_number) {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            console.log('存在，现在就更新');
            yield _this4.model('product').where({
                goods_sn: goods_sn
            }).update({
                goods_number: goods_number
            });
        })();
    }
    updateGoodsNumberAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            let all_goods = yield _this5.model('goods').where({
                is_delete: 0,
                is_on_sale: 1
            }).select();
            for (const item of all_goods) {
                let goodsSum = yield _this5.model('product').where({
                    goods_id: item.id
                }).sum('goods_number');
                yield _this5.model('goods').where({
                    id: item.id
                }).update({
                    goods_number: goodsSum
                });
                yield think.timeout(2000);
            }
            return _this5.success();
        })();
    }
    onsaleAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            const page = _this6.get('page') || 1;
            const size = _this6.get('size');
            const model = _this6.model('goods');
            const data = yield model.where({
                is_delete: 0,
                is_on_sale: 1
            }).order(['sort_order asc']).page(page, size).countSelect();
            for (const item of data.data) {
                const info = yield _this6.model('category').where({
                    id: item.category_id
                }).find();
                item.category_name = info.name;
                // if (info.parent_id != 0) {
                //     const parentInfo = await this.model('category').where({id: info.parent_id}).find();
                //     item.category_p_name = parentInfo.name;
                // }
                if (item.is_on_sale == 1) {
                    item.is_on_sale = true;
                } else {
                    item.is_on_sale = false;
                }
                if (item.is_index == 1) {
                    item.is_index = true;
                } else {
                    item.is_index = false;
                }
                let product = yield _this6.model('product').where({
                    goods_id: item.id,
                    is_delete: 0
                }).select();
                for (const ele of product) {
                    let spec = yield _this6.model('goods_specification').where({
                        id: ele.goods_specification_ids,
                        is_delete: 0
                    }).find();
                    ele.value = spec.value;
                    ele.is_on_sale = ele.is_on_sale ? "1" : "0";
                }
                item.product = product;
            }
            return _this6.success(data);
        })();
    }
    outAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const page = _this7.get('page') || 1;
            const size = _this7.get('size');
            const model = _this7.model('goods');
            const data = yield model.where({
                is_delete: 0,
                goods_number: ['<=', 0]
            }).order(['sort_order asc']).page(page, size).countSelect();
            for (const item of data.data) {
                const info = yield _this7.model('category').where({
                    id: item.category_id
                }).find();
                item.category_name = info.name;
                if (item.is_on_sale == 1) {
                    item.is_on_sale = true;
                } else {
                    item.is_on_sale = false;
                }
                if (item.is_index == 1) {
                    item.is_index = true;
                } else {
                    item.is_index = false;
                }
                let product = yield _this7.model('product').where({
                    goods_id: item.id,
                    is_delete: 0
                }).select();
                for (const ele of product) {
                    let spec = yield _this7.model('goods_specification').where({
                        id: ele.goods_specification_ids,
                        is_delete: 0
                    }).find();
                    ele.value = spec.value;
                    ele.is_on_sale = ele.is_on_sale ? "1" : "0";
                }
                item.product = product;
            }
            return _this7.success(data);
        })();
    }
    dropAction() {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            const page = _this8.get('page') || 1;
            const size = _this8.get('size');
            const model = _this8.model('goods');
            const data = yield model.where({
                is_delete: 0,
                is_on_sale: 0
            }).order(['id DESC']).page(page, size).countSelect();
            for (const item of data.data) {
                const info = yield _this8.model('category').where({
                    id: item.category_id
                }).find();
                item.category_name = info.name;
                if (item.is_on_sale == 1) {
                    item.is_on_sale = true;
                } else {
                    item.is_on_sale = false;
                }
                if (item.is_index == 1) {
                    item.is_index = true;
                } else {
                    item.is_index = false;
                }
                let product = yield _this8.model('product').where({
                    goods_id: item.id,
                    is_delete: 0
                }).select();
                for (const ele of product) {
                    let spec = yield _this8.model('goods_specification').where({
                        id: ele.goods_specification_ids,
                        is_delete: 0
                    }).find();
                    ele.value = spec.value;
                    ele.is_on_sale = ele.is_on_sale ? "1" : "0";
                }
                item.product = product;
            }
            return _this8.success(data);
        })();
    }
    sortAction() {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            const page = _this9.get('page') || 1;
            const size = _this9.get('size');
            const model = _this9.model('goods');
            const index = _this9.get('index');
            if (index == 1) {
                const data = yield model.where({
                    is_delete: 0
                }).order(['sell_volume DESC']).page(page, size).countSelect();
                for (const item of data.data) {
                    const info = yield _this9.model('category').where({
                        id: item.category_id
                    }).find();
                    item.category_name = info.name;
                    if (item.is_on_sale == 1) {
                        item.is_on_sale = true;
                    } else {
                        item.is_on_sale = false;
                    }
                    if (item.is_index == 1) {
                        item.is_index = true;
                    } else {
                        item.is_index = false;
                    }
                    let product = yield _this9.model('product').where({
                        goods_id: item.id,
                        is_delete: 0
                    }).select();
                    for (const ele of product) {
                        let spec = yield _this9.model('goods_specification').where({
                            id: ele.goods_specification_ids,
                            is_delete: 0
                        }).find();
                        ele.value = spec.value;
                        ele.is_on_sale = ele.is_on_sale ? "1" : "0";
                    }
                    item.product = product;
                }
                return _this9.success(data);
            } else if (index == 2) {
                const data = yield model.where({
                    is_delete: 0
                }).order(['retail_price DESC']).page(page, size).countSelect();
                for (const item of data.data) {
                    const info = yield _this9.model('category').where({
                        id: item.category_id
                    }).find();
                    item.category_name = info.name;
                    if (item.is_on_sale == 1) {
                        item.is_on_sale = true;
                    } else {
                        item.is_on_sale = false;
                    }
                    if (item.is_index == 1) {
                        item.is_index = true;
                    } else {
                        item.is_index = false;
                    }
                    let product = yield _this9.model('product').where({
                        goods_id: item.id,
                        is_delete: 0
                    }).select();
                    for (const ele of product) {
                        let spec = yield _this9.model('goods_specification').where({
                            id: ele.goods_specification_ids,
                            is_delete: 0
                        }).find();
                        ele.value = spec.value;
                        ele.is_on_sale = ele.is_on_sale ? "1" : "0";
                    }
                    item.product = product;
                }
                return _this9.success(data);
            } else if (index == 3) {
                const data = yield model.where({
                    is_delete: 0
                }).order(['goods_number DESC']).page(page, size).countSelect();
                for (const item of data.data) {
                    const info = yield _this9.model('category').where({
                        id: item.category_id
                    }).find();
                    item.category_name = info.name;
                    if (item.is_on_sale == 1) {
                        item.is_on_sale = true;
                    } else {
                        item.is_on_sale = false;
                    }
                    if (item.is_index == 1) {
                        item.is_index = true;
                    } else {
                        item.is_index = false;
                    }
                    let product = yield _this9.model('product').where({
                        goods_id: item.id,
                        is_delete: 0
                    }).select();
                    for (const ele of product) {
                        let spec = yield _this9.model('goods_specification').where({
                            id: ele.goods_specification_ids,
                            is_delete: 0
                        }).find();
                        ele.value = spec.value;
                        ele.is_on_sale = ele.is_on_sale ? "1" : "0";
                    }
                    item.product = product;
                }
                return _this9.success(data);
            }
        })();
    }
    saleStatusAction() {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            const id = _this10.get('id');
            const status = _this10.get('status');
            let sale = 0;
            if (status == 'true') {
                sale = 1;
            }
            const model = _this10.model('goods');
            yield model.where({
                id: id
            }).update({
                is_on_sale: sale
            });
            yield _this10.model('cart').where({
                goods_id: id
            }).update({
                is_on_sale: sale,
                checked: sale
            });
        })();
    }
    productStatusAction() {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            const id = _this11.get('id');
            const status = _this11.get('status');
            const model = _this11.model('product');
            yield model.where({
                id: id
            }).update({
                is_on_sale: status
            });
            // 4.14更新
            yield _this11.model('cart').where({
                product_id: id,
                is_delete: 0
            }).update({
                is_on_sale: status
            });
        })();
    }
    indexShowStatusAction() {
        var _this12 = this;

        return _asyncToGenerator(function* () {
            const id = _this12.get('id');
            const status = _this12.get('status');
            let stat = 0;
            if (status == 'true') {
                stat = 1;
            }
            const model = _this12.model('goods');
            yield model.where({
                id: id
            }).update({
                is_index: stat
            });
        })();
    }
    infoAction() {
        var _this13 = this;

        return _asyncToGenerator(function* () {
            const id = _this13.get('id');
            const model = _this13.model('goods');
            const data = yield model.where({
                id: id
            }).find();
            let category_id = data.category_id;
            let infoData = {
                info: data,
                category_id: category_id
            };
            return _this13.success(infoData);
        })();
    }
    getAllSpecificationAction() {
        var _this14 = this;

        return _asyncToGenerator(function* () {
            const specInfo = yield _this14.model('specification').where({
                id: ['>', 0]
            }).select();
            let specOptionsData = [];
            for (const spitem of specInfo) {
                let info = {
                    value: spitem.id,
                    label: spitem.name
                };
                specOptionsData.push(info);
            }
            return _this14.success(specOptionsData);
        })();
    }
    getAllCategory1Action() {
        var _this15 = this;

        return _asyncToGenerator(function* () {
            // 我写的算法
            const model = _this15.model('category');
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
            return _this15.success(newData);
        })();
    }
    getAllCategoryAction() {
        var _this16 = this;

        return _asyncToGenerator(function* () {
            // 老婆的算法
            const model = _this16.model('category');
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
            return _this16.success(newData);
        })();
    }
    storeAction() {
        var _this17 = this;

        return _asyncToGenerator(function* () {
            const values = _this17.post('info');
            const specData = _this17.post('specData');
            const specValue = _this17.post('specValue');
            const cateId = _this17.post('cateId');
            const model = _this17.model('goods');
            let picUrl = values.list_pic_url;
            let goods_id = values.id;
            values.category_id = cateId;
            values.is_index = values.is_index ? 1 : 0;
            values.is_new = values.is_new ? 1 : 0;
            let id = values.id;
            if (id > 0) {
                yield model.where({
                    id: id
                }).update(values);
                yield _this17.model('cart').where({
                    goods_id: id
                }).update({
                    checked: values.is_on_sale,
                    is_on_sale: values.is_on_sale,
                    list_pic_url: picUrl,
                    freight_template_id: values.freight_template_id
                });
                yield _this17.model('product').where({
                    goods_id: id
                }).update({
                    is_delete: 1
                });
                yield _this17.model('goods_specification').where({
                    goods_id: id
                }).update({
                    is_delete: 1
                });
                for (const item of specData) {
                    if (item.id > 0) {
                        yield _this17.model('cart').where({
                            product_id: item.id,
                            is_delete: 0
                        }).update({
                            retail_price: item.retail_price,
                            goods_specifition_name_value: item.value,
                            goods_sn: item.goods_sn
                        });
                        delete item.is_delete;
                        item.is_delete = 0;
                        yield _this17.model('product').where({
                            id: item.id
                        }).update(item);
                        let specificationData = {
                            value: item.value,
                            specification_id: specValue,
                            is_delete: 0
                        };
                        yield _this17.model('goods_specification').where({
                            id: item.goods_specification_ids
                        }).update(specificationData);
                    } else {
                        let specificationData = {
                            value: item.value,
                            goods_id: id,
                            specification_id: specValue
                        };
                        let specId = yield _this17.model('goods_specification').add(specificationData);
                        item.goods_specification_ids = specId;
                        item.goods_id = id;
                        yield _this17.model('product').add(item);
                    }
                }
                for (const [index, item] of values.gallery.entries()) {
                    if (item.is_delete == 1 && item.id > 0) {
                        yield _this17.model('goods_gallery').where({
                            id: item.id
                        }).update({
                            is_delete: 1
                        });
                    } else if (item.is_delete == 0 && item.id > 0) {
                        yield _this17.model('goods_gallery').where({
                            id: item.id
                        }).update({
                            sort_order: index
                        });
                    } else if (item.is_delete == 0 && item.id == 0) {
                        yield _this17.model('goods_gallery').add({
                            goods_id: id,
                            img_url: item.url,
                            sort_order: index
                        });
                    }
                }
            } else {
                delete values.id;
                goods_id = yield model.add(values);
                for (const item of specData) {
                    let specificationData = {
                        value: item.value,
                        goods_id: goods_id,
                        specification_id: specValue
                    };
                    let specId = yield _this17.model('goods_specification').add(specificationData);
                    item.goods_specification_ids = specId;
                    item.goods_id = goods_id;
                    item.is_on_sale = 1;
                    yield _this17.model('product').add(item);
                }
                for (const [index, item] of values.gallery.entries()) {
                    yield _this17.model('goods_gallery').add({
                        goods_id: goods_id,
                        img_url: item.url,
                        sort_order: index
                    });
                }
            }
            let pro = yield _this17.model('product').where({
                goods_id: goods_id,
                is_on_sale: 1,
                is_delete: 0
            }).select();
            if (pro.length > 1) {
                let goodsNum = yield _this17.model('product').where({
                    goods_id: goods_id,
                    is_on_sale: 1,
                    is_delete: 0
                }).sum('goods_number');
                let retail_price = yield _this17.model('product').where({
                    goods_id: goods_id,
                    is_on_sale: 1,
                    is_delete: 0
                }).getField('retail_price');
                let maxPrice = Math.max(...retail_price);
                let minPrice = Math.min(...retail_price);
                let cost = yield _this17.model('product').where({
                    goods_id: goods_id,
                    is_on_sale: 1,
                    is_delete: 0
                }).getField('cost');
                let maxCost = Math.max(...cost);
                let minCost = Math.min(...cost);
                let goodsPrice = '';
                if (minPrice == maxPrice) {
                    goodsPrice = minPrice;
                } else {
                    goodsPrice = minPrice + '~' + maxPrice;
                }
                let costPrice = minCost + '~' + maxCost;
                yield _this17.model('goods').where({
                    id: goods_id
                }).update({
                    goods_number: goodsNum,
                    retail_price: goodsPrice,
                    cost_price: costPrice,
                    min_retail_price: minPrice,
                    min_cost_price: minCost
                });
            } else {
                let info = {
                    goods_number: pro[0].goods_number,
                    retail_price: pro[0].retail_price,
                    cost_price: pro[0].cost,
                    min_retail_price: pro[0].retail_price,
                    min_cost_price: pro[0].cost
                };
                yield _this17.model('goods').where({
                    id: goods_id
                }).update(info);
            }
            return _this17.success(goods_id);
        })();
    }
    updatePriceAction() {
        var _this18 = this;

        return _asyncToGenerator(function* () {
            let data = _this18.post('');
            let goods_id = data.goods_id;
            yield _this18.model('goods_specification').where({
                id: data.goods_specification_ids
            }).update({
                value: data.value
            });
            yield _this18.model('product').where({
                id: data.id
            }).update(data);
            let pro = yield _this18.model('product').where({
                goods_id: goods_id,
                is_on_sale: 1,
                is_delete: 0
            }).select();
            if (pro.length == 0) {
                return _this18.fail(100, '商品的规格数量至少1个');
            }
            yield _this18.model('cart').where({
                product_id: data.id,
                is_delete: 0
            }).update({
                retail_price: data.retail_price,
                goods_specifition_name_value: data.value,
                goods_sn: data.goods_sn
            });
            delete data.value;

            if (pro.length > 1) {
                let goodsNum = yield _this18.model('product').where({
                    goods_id: goods_id,
                    is_on_sale: 1,
                    is_delete: 0
                }).sum('goods_number');
                let retail_price = yield _this18.model('product').where({
                    goods_id: goods_id,
                    is_on_sale: 1,
                    is_delete: 0
                }).getField('retail_price');
                let maxPrice = Math.max(...retail_price);
                let minPrice = Math.min(...retail_price);
                let cost = yield _this18.model('product').where({
                    goods_id: goods_id,
                    is_on_sale: 1,
                    is_delete: 0
                }).getField('cost');
                let maxCost = Math.max(...cost);
                let minCost = Math.min(...cost);
                let goodsPrice = '';
                if (minPrice == maxPrice) {
                    goodsPrice = minPrice;
                } else {
                    goodsPrice = minPrice + '~' + maxPrice;
                }
                let costPrice = minCost + '~' + maxCost;
                yield _this18.model('goods').where({
                    id: goods_id
                }).update({
                    goods_number: goodsNum,
                    retail_price: goodsPrice,
                    cost_price: costPrice,
                    min_retail_price: minPrice,
                    min_cost_price: minCost
                });
            } else if (pro.length == 1) {
                let info = {
                    goods_number: pro[0].goods_number,
                    retail_price: pro[0].retail_price,
                    cost_price: pro[0].cost,
                    min_retail_price: pro[0].retail_price,
                    min_cost_price: pro[0].cost
                };
                yield _this18.model('goods').where({
                    id: goods_id
                }).update(info);
            }
            return _this18.success();
        })();
    }
    checkSkuAction() {
        var _this19 = this;

        return _asyncToGenerator(function* () {
            const info = _this19.post('info');
            if (info.id > 0) {
                const model = _this19.model('product');
                const data = yield model.where({
                    id: ['<>', info.id],
                    goods_sn: info.goods_sn,
                    is_delete: 0
                }).find();
                if (!think.isEmpty(data)) {
                    return _this19.fail(100, '重复');
                } else {
                    return _this19.success();
                }
            } else {
                const model = _this19.model('product');
                const data = yield model.where({
                    goods_sn: info.goods_sn,
                    is_delete: 0
                }).find();
                if (!think.isEmpty(data)) {
                    return _this19.fail(100, '重复');
                } else {
                    return _this19.success();
                }
            }
        })();
    }
    updateSortAction() {
        var _this20 = this;

        return _asyncToGenerator(function* () {
            const id = _this20.post('id');
            const sort = _this20.post('sort');
            const model = _this20.model('goods');
            const data = yield model.where({
                id: id
            }).update({
                sort_order: sort
            });
            return _this20.success(data);
        })();
    }
    updateShortNameAction() {
        var _this21 = this;

        return _asyncToGenerator(function* () {
            const id = _this21.post('id');
            const short_name = _this21.post('short_name');
            const model = _this21.model('goods');
            const data = yield model.where({
                id: id
            }).update({
                short_name: short_name
            });
            return _this21.success(data);
        })();
    }
    galleryListAction() {
        var _this22 = this;

        return _asyncToGenerator(function* () {
            const id = _this22.get('id');
            const model = _this22.model('goods_gallery');
            const data = yield model.where({
                goods_id: id,
                is_delete: 0
            }).select();
            // console.log(data);
            return _this22.success(data);
        })();
    }
    galleryAction() {
        var _this23 = this;

        return _asyncToGenerator(function* () {
            const url = _this23.post('url');
            const id = _this23.post('goods_id');
            let info = {
                goods_id: id,
                img_url: url
            };
            yield _this23.model('goods_gallery').add(info);
            return _this23.success();
        })();
    }
    getGalleryListAction() {
        var _this24 = this;

        return _asyncToGenerator(function* () {
            const goodsId = _this24.post('goodsId');
            const data = yield _this24.model('goods_gallery').where({
                goods_id: goodsId,
                is_delete: 0
            }).order('sort_order asc').select();
            let galleryData = [];
            for (const item of data) {
                let pdata = {
                    id: item.id,
                    url: item.img_url,
                    is_delete: 0
                };
                galleryData.push(pdata);
            }
            let info = {
                galleryData: galleryData
            };
            return _this24.success(info);
        })();
    }
    deleteGalleryFileAction() {
        var _this25 = this;

        return _asyncToGenerator(function* () {
            const url = _this25.post('url');
            const id = _this25.post('id');
            yield _this25.model('goods_gallery').where({
                id: id
            }).limit(1).update({
                is_delete: 1
            });
            return _this25.success('文件删除成功');
        })();
    }
    galleryEditAction() {
        var _this26 = this;

        return _asyncToGenerator(function* () {
            if (!_this26.isPost) {
                return false;
            }
            const values = _this26.post();
            let data = values.data;
            // console.log(data);
            const model = _this26.model('goods_gallery');
            for (const item of data) {
                let id = item.id;
                let sort = parseInt(item.sort_order);
                // console.log(sort);
                yield _this26.model('goods_gallery').where({
                    id: id
                }).update({
                    sort_order: sort
                });
            }
            return _this26.success();
        })();
    }
    deleteListPicUrlAction() {
        var _this27 = this;

        return _asyncToGenerator(function* () {
            const id = _this27.post('id');
            console.log(id);
            yield _this27.model('goods').where({
                id: id
            }).limit(1).update({
                list_pic_url: 0
            });
            return _this27.success();
        })();
    }
    destoryAction() {
        var _this28 = this;

        return _asyncToGenerator(function* () {
            const id = _this28.post('id');
            yield _this28.model('goods').where({
                id: id
            }).limit(1).update({
                is_delete: 1
            });
            yield _this28.model('product').where({
                goods_id: id
            }).update({
                is_delete: 1
            });
            yield _this28.model('goods_specification').where({
                goods_id: id
            }).update({
                is_delete: 1
            });
            return _this28.success();
        })();
    }
    uploadHttpsImageAction() {
        var _this29 = this;

        return _asyncToGenerator(function* () {
            let url = _this29.post('url');
            let accessKey = think.config('qiniuHttps.access_key');
            let secretKey = think.config('qiniuHttps.secret_key');
            let domain = think.config('qiniuHttps.domain');
            var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
            var config = new qiniu.conf.Config();
            let zoneNum = think.config('qiniuHttps.zoneNum');
            if (zoneNum == 0) {
                config.zone = qiniu.zone.Zone_z0;
            } else if (zoneNum == 1) {
                config.zone = qiniu.zone.Zone_z1;
            } else if (zoneNum == 2) {
                config.zone = qiniu.zone.Zone_z2;
            } else if (zoneNum == 3) {
                config.zone = qiniu.zone.Zone_na0;
            } else if (zoneNum == 4) {
                config.zone = qiniu.zone.Zone_as0;
            }
            var bucketManager = new qiniu.rs.BucketManager(mac, config);
            let bucket = think.config('qiniuHttps.bucket');
            let key = think.uuid(32);
            yield think.timeout(500);
            const uploadQiniu = (() => {
                var _ref = _asyncToGenerator(function* () {
                    return new Promise(function (resolve, reject) {
                        try {
                            bucketManager.fetch(url, bucket, key, function (err, respBody, respInfo) {
                                if (err) {
                                    console.log(err);
                                    //throw err;
                                } else {
                                    if (respInfo.statusCode == 200) {
                                        resolve(respBody.key);
                                    } else {
                                        console.log(respInfo.statusCode);
                                    }
                                }
                            });
                        } catch (e) {
                            return resolve(null);
                        }
                    });
                });

                return function uploadQiniu() {
                    return _ref.apply(this, arguments);
                };
            })();
            const httpsUrl = yield uploadQiniu();
            console.log(httpsUrl);
            let lastUrl = domain + httpsUrl;
            return _this29.success(lastUrl);
        })();
    }
};