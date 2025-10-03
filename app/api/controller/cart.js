function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
const pinyin = require("pinyin");
module.exports = class extends Base {
    getCart(type) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const userId = _this.getLoginUserId();
            let cartList = [];
            if (type == 0) {
                cartList = yield _this.model('cart').where({
                    user_id: userId,
                    is_delete: 0,
                    is_fast: 0
                }).select();
            } else {
                cartList = yield _this.model('cart').where({
                    user_id: userId,
                    is_delete: 0,
                    is_fast: 1
                }).select();
            }
            // 获取购物车统计信息
            let goodsCount = 0;
            let goodsAmount = 0;
            let checkedGoodsCount = 0;
            let checkedGoodsAmount = 0;
            let numberChange = 0;
            for (const cartItem of cartList) {
                let product = yield _this.model('product').where({
                    id: cartItem.product_id,
                    is_delete: 0
                }).find();
                if (think.isEmpty(product)) {
                    yield _this.model('cart').where({
                        product_id: cartItem.product_id,
                        user_id: userId,
                        is_delete: 0
                    }).update({
                        is_delete: 1
                    });
                } else {
                    let retail_price = product.retail_price;
                    let productNum = product.goods_number;
                    // 4.14 更新
                    if (productNum <= 0 || product.is_on_sale == 0) {
                        yield _this.model('cart').where({
                            product_id: cartItem.product_id,
                            user_id: userId,
                            checked: 1,
                            is_delete: 0
                        }).update({
                            checked: 0
                        });
                        cartItem.number = 0;
                    } else if (productNum > 0 && productNum < cartItem.number) {
                        cartItem.number = productNum;
                        numberChange = 1;
                    } else if (productNum > 0 && cartItem.number == 0) {
                        cartItem.number = 1;
                        numberChange = 1;
                    }
                    goodsCount += cartItem.number;
                    goodsAmount += cartItem.number * retail_price;
                    cartItem.retail_price = retail_price;
                    if (!think.isEmpty(cartItem.checked && productNum > 0)) {
                        checkedGoodsCount += cartItem.number;
                        checkedGoodsAmount += cartItem.number * Number(retail_price);
                    }
                    // 查找商品的图片
                    let info = yield _this.model('goods').where({
                        id: cartItem.goods_id
                    }).field('list_pic_url').find();
                    cartItem.list_pic_url = info.list_pic_url;
                    cartItem.weight_count = cartItem.number * Number(cartItem.goods_weight);
                    yield _this.model('cart').where({
                        product_id: cartItem.product_id,
                        user_id: userId,
                        is_delete: 0
                    }).update({
                        number: cartItem.number,
                        add_price: retail_price
                    });
                }
            }
            let cAmount = checkedGoodsAmount.toFixed(2);
            let aAmount = checkedGoodsAmount;
            return {
                cartList: cartList,
                cartTotal: {
                    goodsCount: goodsCount,
                    goodsAmount: goodsAmount.toFixed(2),
                    checkedGoodsCount: checkedGoodsCount,
                    checkedGoodsAmount: cAmount,
                    user_id: userId,
                    numberChange: numberChange
                }
            };
        })();
    }
    /**
     * 获取购物车信息，所有对购物车的增删改操作，都要重新返回购物车的信息
     * @return {Promise} []
     */
    indexAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            return _this2.success((yield _this2.getCart(0)));
        })();
    }
    addAgain(goodsId, productId, number) {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const userId = _this3.getLoginUserId();;
            const currentTime = parseInt(new Date().getTime() / 1000);
            const goodsInfo = yield _this3.model('goods').where({
                id: goodsId
            }).find();
            if (think.isEmpty(goodsInfo) || goodsInfo.is_on_sale == 0) {
                return _this3.fail(400, '商品已下架');
            }
            // 取得规格的信息,判断规格库存
            // const productInfo = await this.model('product').where({goods_id: goodsId, id: productId}).find();
            const productInfo = yield _this3.model('product').where({
                id: productId
            }).find();
            // let productId = productInfo.id;
            if (think.isEmpty(productInfo) || productInfo.goods_number < number) {
                return _this3.fail(400, '库存不足');
            }
            // 判断购物车中是否存在此规格商品
            const cartInfo = yield _this3.model('cart').where({
                user_id: userId,
                product_id: productId,
                is_delete: 0
            }).find();
            let retail_price = productInfo.retail_price;
            if (think.isEmpty(cartInfo)) {
                // 添加操作
                // 添加规格名和值
                let goodsSepcifitionValue = [];
                if (!think.isEmpty(productInfo.goods_specification_ids)) {
                    goodsSepcifitionValue = yield _this3.model('goods_specification').where({
                        goods_id: productInfo.goods_id,
                        is_delete: 0,
                        id: {
                            'in': productInfo.goods_specification_ids.split('_')
                        }
                    }).getField('value');
                }
                // 添加到购物车
                const cartData = {
                    goods_id: productInfo.goods_id,
                    product_id: productId,
                    goods_sn: productInfo.goods_sn,
                    goods_name: goodsInfo.name,
                    goods_aka: productInfo.goods_name,
                    goods_weight: productInfo.goods_weight,
                    freight_template_id: goodsInfo.freight_template_id,
                    list_pic_url: goodsInfo.list_pic_url,
                    number: number,
                    user_id: userId,
                    retail_price: retail_price,
                    add_price: retail_price,
                    goods_specifition_name_value: goodsSepcifitionValue.join(';'),
                    goods_specifition_ids: productInfo.goods_specification_ids,
                    checked: 1,
                    add_time: currentTime
                };
                yield _this3.model('cart').add(cartData);
            } else {
                // 如果已经存在购物车中，则数量增加
                if (productInfo.goods_number < number + cartInfo.number) {
                    return _this3.fail(400, '库存都不够啦');
                }
                yield _this3.model('cart').where({
                    user_id: userId,
                    product_id: productId,
                    is_delete: 0,
                    id: cartInfo.id
                }).update({
                    retail_price: retail_price,
                    checked: 1,
                    number: number
                });
            }
        })();
    }
    /**
     * 添加商品到购物车
     * @returns {Promise.<*>}
     */
    addAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const goodsId = _this4.post('goodsId');
            const userId = _this4.getLoginUserId();;
            const productId = _this4.post('productId');
            const number = _this4.post('number');
            const addType = _this4.post('addType');
            const currentTime = parseInt(new Date().getTime() / 1000);
            // 判断商品是否可以购买
            const goodsInfo = yield _this4.model('goods').where({
                id: goodsId
            }).find();
            if (think.isEmpty(goodsInfo) || goodsInfo.is_on_sale == 0) {
                return _this4.fail(400, '商品已下架');
            }
            // 取得规格的信息,判断规格库存
            // const productInfo = await this.model('product').where({goods_id: goodsId, id: productId}).find();
            const productInfo = yield _this4.model('product').where({
                id: productId
            }).find();
            // let productId = productInfo.id;
            if (think.isEmpty(productInfo) || productInfo.goods_number < number) {
                return _this4.fail(400, '库存不足');
            }
            // 判断购物车中是否存在此规格商品
            const cartInfo = yield _this4.model('cart').where({
                user_id: userId,
                product_id: productId,
                is_delete: 0
            }).find();
            let retail_price = productInfo.retail_price;
            if (addType == 1) {
                yield _this4.model('cart').where({
                    is_delete: 0,
                    user_id: userId
                }).update({
                    checked: 0
                });
                let goodsSepcifitionValue = [];
                if (!think.isEmpty(productInfo.goods_specification_ids)) {
                    goodsSepcifitionValue = yield _this4.model('goods_specification').where({
                        goods_id: productInfo.goods_id,
                        is_delete: 0,
                        id: {
                            'in': productInfo.goods_specification_ids.split('_')
                        }
                    }).getField('value');
                }
                // 添加到购物车
                const cartData = {
                    goods_id: productInfo.goods_id,
                    product_id: productId,
                    goods_sn: productInfo.goods_sn,
                    goods_name: goodsInfo.name,
                    goods_aka: productInfo.goods_name,
                    goods_weight: productInfo.goods_weight,
                    freight_template_id: goodsInfo.freight_template_id,
                    list_pic_url: goodsInfo.list_pic_url,
                    number: number,
                    user_id: userId,
                    retail_price: retail_price,
                    add_price: retail_price,
                    goods_specifition_name_value: goodsSepcifitionValue.join(';'),
                    goods_specifition_ids: productInfo.goods_specification_ids,
                    checked: 1,
                    add_time: currentTime,
                    is_fast: 1
                };
                yield _this4.model('cart').add(cartData);
                return _this4.success((yield _this4.getCart(1)));
            } else {
                if (think.isEmpty(cartInfo)) {
                    // 添加操作
                    // 添加规格名和值
                    let goodsSepcifitionValue = [];
                    if (!think.isEmpty(productInfo.goods_specification_ids)) {
                        goodsSepcifitionValue = yield _this4.model('goods_specification').where({
                            goods_id: productInfo.goods_id,
                            is_delete: 0,
                            id: {
                                'in': productInfo.goods_specification_ids.split('_')
                            }
                        }).getField('value');
                    }
                    // 添加到购物车
                    const cartData = {
                        goods_id: productInfo.goods_id,
                        product_id: productId,
                        goods_sn: productInfo.goods_sn,
                        goods_name: goodsInfo.name,
                        goods_aka: productInfo.goods_name,
                        goods_weight: productInfo.goods_weight,
                        freight_template_id: goodsInfo.freight_template_id,
                        list_pic_url: goodsInfo.list_pic_url,
                        number: number,
                        user_id: userId,
                        retail_price: retail_price,
                        add_price: retail_price,
                        goods_specifition_name_value: goodsSepcifitionValue.join(';'),
                        goods_specifition_ids: productInfo.goods_specification_ids,
                        checked: 1,
                        add_time: currentTime
                    };
                    yield _this4.model('cart').add(cartData);
                } else {
                    // 如果已经存在购物车中，则数量增加
                    if (productInfo.goods_number < number + cartInfo.number) {
                        return _this4.fail(400, '库存都不够啦');
                    }
                    yield _this4.model('cart').where({
                        user_id: userId,
                        product_id: productId,
                        is_delete: 0,
                        id: cartInfo.id
                    }).update({
                        retail_price: retail_price
                    });
                    yield _this4.model('cart').where({
                        user_id: userId,
                        product_id: productId,
                        is_delete: 0,
                        id: cartInfo.id
                    }).increment('number', number);
                }
                return _this4.success((yield _this4.getCart(0)));
            }
        })();
    }
    // 更新指定的购物车信息
    updateAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            const productId = _this5.post('productId'); // 新的product_id
            const id = _this5.post('id'); // cart.id
            const number = parseInt(_this5.post('number')); // 不是
            // 取得规格的信息,判断规格库存
            const productInfo = yield _this5.model('product').where({
                id: productId,
                is_delete: 0
            }).find();
            if (think.isEmpty(productInfo) || productInfo.goods_number < number) {
                return _this5.fail(400, '库存不足');
            }
            // 判断是否已经存在product_id购物车商品
            const cartInfo = yield _this5.model('cart').where({
                id: id,
                is_delete: 0
            }).find();
            // 只是更新number
            if (cartInfo.product_id === productId) {
                yield _this5.model('cart').where({
                    id: id,
                    is_delete: 0
                }).update({
                    number: number
                });
                return _this5.success((yield _this5.getCart(0)));
            }
        })();
    }
    // 是否选择商品，如果已经选择，则取消选择，批量操作
    checkedAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            const userId = _this6.getLoginUserId();;
            let productId = _this6.post('productIds').toString();
            const isChecked = _this6.post('isChecked');
            if (think.isEmpty(productId)) {
                return _this6.fail('删除出错');
            }
            productId = productId.split(',');
            yield _this6.model('cart').where({
                product_id: {
                    'in': productId
                },
                user_id: userId,
                is_delete: 0
            }).update({
                checked: parseInt(isChecked)
            });
            return _this6.success((yield _this6.getCart(0)));
        })();
    }
    // 删除选中的购物车商品，批量删除
    deleteAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            let productId = _this7.post('productIds');
            const userId = _this7.getLoginUserId();;
            if (think.isEmpty(productId)) {
                return _this7.fail('删除出错');
            }
            yield _this7.model('cart').where({
                product_id: productId,
                user_id: userId,
                is_delete: 0
            }).update({
                is_delete: 1
            });
            return _this7.success((yield _this7.getCart(0)));
            // return this.success(productId);
        })();
    }
    // 获取购物车商品的总件件数
    goodsCountAction() {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            const cartData = yield _this8.getCart(0);
            const userId = _this8.getLoginUserId();;
            yield _this8.model('cart').where({
                user_id: userId,
                is_delete: 0,
                is_fast: 1
            }).update({
                is_delete: 1
            });
            return _this8.success({
                cartTotal: {
                    goodsCount: cartData.cartTotal.goodsCount
                }
            });
        })();
    }
    /**
     * 订单提交前的检验和填写相关订单信息
     * @returns {Promise.<void>}
     */
    checkoutAction() {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            const currentTime = parseInt(new Date().getTime() / 1000);
            const userId = _this9.getLoginUserId();;
            let orderFrom = _this9.get('orderFrom');
            const type = _this9.get('type'); // 是否团购
            const addressId = _this9.get('addressId'); // 收货地址id
            const addType = _this9.get('addType');
            let goodsCount = 0; // 购物车的数量
            let goodsMoney = 0; // 购物车的总价
            let freightPrice = 0;
            let outStock = 0;
            let cartData = '';
            // 获取要购买的商品
            if (type == 0) {
                if (addType == 0) {
                    cartData = yield _this9.getCart(0);
                } else if (addType == 1) {
                    cartData = yield _this9.getCart(1);
                } else if (addType == 2) {
                    cartData = yield _this9.getAgainCart(orderFrom);
                }
            }
            const checkedGoodsList = cartData.cartList.filter(function (v) {
                return v.checked === 1;
            });
            for (const item of checkedGoodsList) {
                goodsCount = goodsCount + item.number;
                goodsMoney = goodsMoney + item.number * item.retail_price;
                if (item.goods_number <= 0 || item.is_on_sale == 0) {
                    outStock = Number(outStock) + 1;
                }
            }
            if (addType == 2) {
                let againGoods = yield _this9.model('order_goods').where({
                    order_id: orderFrom
                }).select();
                let againGoodsCount = 0;
                for (const item of againGoods) {
                    againGoodsCount = againGoodsCount + item.number;
                }
                if (goodsCount != againGoodsCount) {
                    outStock = 1;
                }
            }
            // 选择的收货地址
            let checkedAddress = null;
            if (addressId == '' || addressId == 0) {
                checkedAddress = yield _this9.model('address').where({
                    is_default: 1,
                    user_id: userId,
                    is_delete: 0
                }).find();
            } else {
                checkedAddress = yield _this9.model('address').where({
                    id: addressId,
                    user_id: userId,
                    is_delete: 0
                }).find();
            }
            if (!think.isEmpty(checkedAddress)) {
                // 运费开始
                // 先将促销规则中符合满件包邮或者满金额包邮的规则找到；
                // 先看看是不是属于偏远地区。
                let province_id = checkedAddress.province_id;
                // 得到数组了，然后去判断这两个商品符不符合要求
                // 先用这个goods数组去遍历
                let cartGoods = checkedGoodsList;
                let freightTempArray = yield _this9.model('freight_template').where({
                    is_delete: 0
                }).select();
                let freightData = [];
                for (const item in freightTempArray) {
                    freightData[item] = {
                        id: freightTempArray[item].id,
                        number: 0,
                        money: 0,
                        goods_weight: 0,
                        freight_type: freightTempArray[item].freight_type
                    };
                }
                // 按件计算和按重量计算的区别是：按件，只要算goods_number就可以了，按重量要goods_number*goods_weight
                // checkedGoodsList = [{goods_id:1,number5},{goods_id:2,number:3},{goods_id:3,number:2}]
                for (const item of freightData) {
                    for (const cartItem of cartGoods) {
                        if (item.id == cartItem.freight_template_id) {
                            // 这个在判断，购物车中的商品是否属于这个运费模版，如果是，则加一，但是，这里要先判断下，这个商品是否符合满件包邮或满金额包邮，如果是包邮的，那么要去掉
                            item.number = item.number + cartItem.number;
                            item.money = item.money + cartItem.number * cartItem.retail_price;
                            item.goods_weight = item.goods_weight + cartItem.number * cartItem.goods_weight;
                        }
                    }
                }
                checkedAddress.province_name = yield _this9.model('region').getRegionName(checkedAddress.province_id);
                checkedAddress.city_name = yield _this9.model('region').getRegionName(checkedAddress.city_id);
                checkedAddress.district_name = yield _this9.model('region').getRegionName(checkedAddress.district_id);
                checkedAddress.full_region = checkedAddress.province_name + checkedAddress.city_name + checkedAddress.district_name;
                for (const item of freightData) {
                    if (item.number == 0) {
                        continue;
                    }
                    let ex = yield _this9.model('freight_template_detail').where({
                        template_id: item.id,
                        area: province_id,
                        is_delete: 0
                    }).find();
                    let freight_price = 0;
                    if (!think.isEmpty(ex)) {
                        // console.log('第一层：非默认邮费算法');
                        let groupData = yield _this9.model('freight_template_group').where({
                            id: ex.group_id,
                            is_delete: 0
                        }).find();
                        // 不为空，说明有模板，那么应用模板，先去判断是否符合指定的包邮条件，不满足，那么根据type 是按件还是按重量
                        let free_by_number = groupData.free_by_number;
                        let free_by_money = groupData.free_by_money;
                        // 4种情况，1、free_by_number > 0  2,free_by_money > 0  3,free_by_number free_by_money > 0,4都等于0
                        let templateInfo = yield _this9.model('freight_template').where({
                            id: item.id,
                            is_delete: 0
                        }).find();
                        let freight_type = templateInfo.freight_type;
                        if (freight_type == 0) {
                            if (item.number > groupData.start) {
                                // 说明大于首件了
                                freight_price = groupData.start * groupData.start_fee + (item.number - 1) * groupData.add_fee; // todo 如果续件是2怎么办？？？
                            } else {
                                freight_price = groupData.start * groupData.start_fee;
                            }
                        } else if (freight_type == 1) {
                            if (item.goods_weight > groupData.start) {
                                // 说明大于首件了
                                freight_price = groupData.start * groupData.start_fee + (item.goods_weight - 1) * groupData.add_fee; // todo 如果续件是2怎么办？？？
                            } else {
                                freight_price = groupData.start * groupData.start_fee;
                            }
                        }
                        if (free_by_number > 0) {
                            if (item.number >= free_by_number) {
                                freight_price = 0;
                            }
                        }
                        if (free_by_money > 0) {
                            if (item.money >= free_by_money) {
                                freight_price = 0;
                            }
                        }
                    } else {
                        // console.log('第二层：使用默认的邮费算法');
                        let groupData = yield _this9.model('freight_template_group').where({
                            template_id: item.id,
                            area: 0,
                            is_delete: 0
                        }).find();
                        let free_by_number = groupData.free_by_number;
                        let free_by_money = groupData.free_by_money;
                        let templateInfo = yield _this9.model('freight_template').where({
                            id: item.id,
                            is_delete: 0
                        }).find();
                        let freight_type = templateInfo.freight_type;
                        if (freight_type == 0) {
                            if (item.number > groupData.start) {
                                // 说明大于首件了
                                freight_price = groupData.start * groupData.start_fee + (item.number - 1) * groupData.add_fee; // todo 如果续件是2怎么办？？？
                            } else {
                                freight_price = groupData.start * groupData.start_fee;
                            }
                        } else if (freight_type == 1) {
                            if (item.goods_weight > groupData.start) {
                                // 说明大于首件了
                                freight_price = groupData.start * groupData.start_fee + (item.goods_weight - 1) * groupData.add_fee; // todo 如果续件是2怎么办？？？
                            } else {
                                freight_price = groupData.start * groupData.start_fee;
                            }
                        }
                        if (free_by_number > 0) {
                            if (item.number >= free_by_number) {
                                freight_price = 0;
                            }
                        }
                        if (free_by_money > 0) {
                            if (item.money >= free_by_money) {
                                freight_price = 0;
                            }
                        }
                    }
                    freightPrice = freightPrice > freight_price ? freightPrice : freight_price;
                    // freightPrice = freightPrice + freight_price;
                    // 会得到 几个数组，然后用省id去遍历在哪个数组
                }
            } else {
                checkedAddress = 0;
            }
            // 计算订单的费用
            let goodsTotalPrice = cartData.cartTotal.checkedGoodsAmount; // 商品总价
            // 获取是否有可用红包
            let money = cartData.cartTotal.checkedGoodsAmount;
            let orderTotalPrice = 0;
            let def = yield _this9.model('settings').where({
                id: 1
            }).find();
            orderTotalPrice = Number(money) + Number(freightPrice); // 订单的总价
            const actualPrice = orderTotalPrice; // 减去其它支付的金额后，要实际支付的金额
            let numberChange = cartData.cartTotal.numberChange;
            return _this9.success({
                checkedAddress: checkedAddress,
                freightPrice: freightPrice,
                checkedGoodsList: checkedGoodsList,
                goodsTotalPrice: goodsTotalPrice,
                orderTotalPrice: orderTotalPrice.toFixed(2),
                actualPrice: actualPrice.toFixed(2),
                goodsCount: goodsCount,
                outStock: outStock,
                numberChange: numberChange
            });
        })();
    }
    getAgainCart(orderFrom) {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            const userId = _this10.getLoginUserId();;
            const againGoods = yield _this10.model('order_goods').where({
                order_id: orderFrom
            }).select();
            yield _this10.model('cart').where({
                is_delete: 0,
                user_id: userId
            }).update({
                checked: 0
            });
            for (const item of againGoods) {
                yield _this10.addAgain(item.goods_id, item.product_id, item.number);
            }
            const cartList = yield _this10.model('cart').where({
                user_id: userId,
                is_fast: 0,
                is_delete: 0
            }).select();
            // 获取购物车统计信息
            let goodsCount = 0;
            let goodsAmount = 0;
            let checkedGoodsCount = 0;
            let checkedGoodsAmount = 0;
            for (const cartItem of cartList) {
                goodsCount += cartItem.number;
                goodsAmount += cartItem.number * cartItem.retail_price;
                if (!think.isEmpty(cartItem.checked)) {
                    checkedGoodsCount += cartItem.number;
                    checkedGoodsAmount += cartItem.number * Number(cartItem.retail_price);
                }
                // 查找商品的图片
                let info = yield _this10.model('goods').where({
                    id: cartItem.goods_id
                }).field('list_pic_url,goods_number,goods_unit').find();
                // cartItem.list_pic_url = await this.model('goods').where({id: cartItem.goods_id}).getField('list_pic_url', true);
                let num = info.goods_number;
                if (num <= 0) {
                    yield _this10.model('cart').where({
                        product_id: cartItem.product_id,
                        user_id: userId,
                        checked: 1,
                        is_delete: 0
                    }).update({
                        checked: 0
                    });
                }
                cartItem.list_pic_url = info.list_pic_url;
                cartItem.goods_number = info.goods_number;
                cartItem.weight_count = cartItem.number * Number(cartItem.goods_weight);
            }
            let cAmount = checkedGoodsAmount.toFixed(2);
            let aAmount = checkedGoodsAmount;
            return {
                cartList: cartList,
                cartTotal: {
                    goodsCount: goodsCount,
                    goodsAmount: goodsAmount.toFixed(2),
                    checkedGoodsCount: checkedGoodsCount,
                    checkedGoodsAmount: cAmount,
                    user_id: userId
                }
            };
        })();
    }
};