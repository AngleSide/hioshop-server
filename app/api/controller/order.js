function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
const rp = require('request-promise');
const fs = require('fs');
const http = require("http");
module.exports = class extends Base {
    /**
     * 获取订单列表
     * @return {Promise} []
     */
    listAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            // const userId = this.getLoginUserId();;
            const userId = _this.getLoginUserId();
            const showType = _this.get('showType');
            const page = _this.get('page');
            const size = _this.get('size');
            let status = [];
            status = yield _this.model('order').getOrderStatus(showType);
            let is_delete = 0;
            const orderList = yield _this.model('order').field('id,add_time,actual_price,freight_price,offline_pay').where({
                user_id: userId,
                is_delete: is_delete,
                order_type: ['<', 7],
                order_status: ['IN', status]
            }).page(page, size).order('add_time DESC').countSelect();
            const newOrderList = [];
            for (const item of orderList.data) {
                // 订单的商品
                item.goodsList = yield _this.model('order_goods').field('id,list_pic_url,number').where({
                    user_id: userId,
                    order_id: item.id,
                    is_delete: 0
                }).select();
                item.goodsCount = 0;
                item.goodsList.forEach(function (v) {
                    item.goodsCount += v.number;
                });
                item.add_time = moment.unix((yield _this.model('order').getOrderAddTime(item.id))).format('YYYY-MM-DD HH:mm:ss');
                // item.dealdone_time = moment.unix(await this.model('order').getOrderAddTime(item.id)).format('YYYY-MM-DD HH:mm:ss');
                // item.add_time =this.timestampToTime(await this.model('order').getOrderAddTime(item.id));
                // 订单状态的处理
                item.order_status_text = yield _this.model('order').getOrderStatusText(item.id);
                // 可操作的选项
                item.handleOption = yield _this.model('order').getOrderHandleOption(item.id);
                newOrderList.push(item);
            }
            orderList.data = newOrderList;
            return _this.success(orderList);
        })();
    }
    // 获得订单数量
    //
    countAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const showType = _this2.get('showType');
            const userId = _this2.getLoginUserId();;
            let status = [];
            status = yield _this2.model('order').getOrderStatus(showType);
            let is_delete = 0;
            const allCount = yield _this2.model('order').where({
                user_id: userId,
                is_delete: is_delete,
                order_status: ['IN', status]
            }).count('id');
            return _this2.success({
                allCount: allCount
            });
        })();
    }
    // 获得订单数量状态
    //
    orderCountAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            // const user_id = this.getLoginUserId();;
            const user_id = _this3.getLoginUserId();
            if (user_id != 0) {
                let toPay = yield _this3.model('order').where({
                    user_id: user_id,
                    is_delete: 0,
                    order_type: ['<', 7],
                    order_status: ['IN', '101,801']
                }).count('id');
                let toDelivery = yield _this3.model('order').where({
                    user_id: user_id,
                    is_delete: 0,
                    order_type: ['<', 7],
                    order_status: 300
                }).count('id');
                let toReceive = yield _this3.model('order').where({
                    user_id: user_id,
                    order_type: ['<', 7],
                    is_delete: 0,
                    order_status: 301
                }).count('id');
                let newStatus = {
                    toPay: toPay,
                    toDelivery: toDelivery,
                    toReceive: toReceive
                };
                return _this3.success(newStatus);
            }
        })();
    }
    detailAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const orderId = _this4.get('orderId');
            const userId = _this4.getLoginUserId();;
            const orderInfo = yield _this4.model('order').where({
                user_id: userId,
                id: orderId
            }).find();
            const currentTime = parseInt(new Date().getTime() / 1000);
            if (think.isEmpty(orderInfo)) {
                return _this4.fail('订单不存在');
            }
            orderInfo.province_name = yield _this4.model('region').where({
                id: orderInfo.province
            }).getField('name', true);
            orderInfo.city_name = yield _this4.model('region').where({
                id: orderInfo.city
            }).getField('name', true);
            orderInfo.district_name = yield _this4.model('region').where({
                id: orderInfo.district
            }).getField('name', true);
            orderInfo.full_region = orderInfo.province_name + orderInfo.city_name + orderInfo.district_name;
            orderInfo.postscript = Buffer.from(orderInfo.postscript, 'base64').toString();
            const orderGoods = yield _this4.model('order_goods').where({
                user_id: userId,
                order_id: orderId,
                is_delete: 0
            }).select();
            var goodsCount = 0;
            for (const gitem of orderGoods) {
                goodsCount += gitem.number;
            }
            // 订单状态的处理
            orderInfo.order_status_text = yield _this4.model('order').getOrderStatusText(orderId);
            if (think.isEmpty(orderInfo.confirm_time)) {
                orderInfo.confirm_time = 0;
            } else orderInfo.confirm_time = moment.unix(orderInfo.confirm_time).format('YYYY-MM-DD HH:mm:ss');
            if (think.isEmpty(orderInfo.dealdone_time)) {
                orderInfo.dealdone_time = 0;
            } else orderInfo.dealdone_time = moment.unix(orderInfo.dealdone_time).format('YYYY-MM-DD HH:mm:ss');
            if (think.isEmpty(orderInfo.pay_time)) {
                orderInfo.pay_time = 0;
            } else orderInfo.pay_time = moment.unix(orderInfo.pay_time).format('YYYY-MM-DD HH:mm:ss');
            if (think.isEmpty(orderInfo.shipping_time)) {
                orderInfo.shipping_time = 0;
            } else {
                orderInfo.confirm_remainTime = orderInfo.shipping_time + 10 * 24 * 60 * 60;
                orderInfo.shipping_time = moment.unix(orderInfo.shipping_time).format('YYYY-MM-DD HH:mm:ss');
            }
            // 订单支付倒计时
            if (orderInfo.order_status === 101 || orderInfo.order_status === 801) {
                // if (moment().subtract(60, 'minutes') < moment(orderInfo.add_time)) {
                orderInfo.final_pay_time = orderInfo.add_time + 24 * 60 * 60; //支付倒计时2小时
                if (orderInfo.final_pay_time < currentTime) {
                    //超过时间不支付，更新订单状态为取消
                    let updateInfo = {
                        order_status: 102
                    };
                    yield _this4.model('order').where({
                        id: orderId
                    }).update(updateInfo);
                }
            }
            orderInfo.add_time = moment.unix(orderInfo.add_time).format('YYYY-MM-DD HH:mm:ss');
            orderInfo.order_status = '';
            // 订单可操作的选择,删除，支付，收货，评论，退换货
            const handleOption = yield _this4.model('order').getOrderHandleOption(orderId);
            const textCode = yield _this4.model('order').getOrderTextCode(orderId);
            return _this4.success({
                orderInfo: orderInfo,
                orderGoods: orderGoods,
                handleOption: handleOption,
                textCode: textCode,
                goodsCount: goodsCount
            });
        })();
    }
    /**
     * order 和 order-check 的goodslist
     * @return {Promise} []
     */
    orderGoodsAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            const userId = _this5.getLoginUserId();;
            const orderId = _this5.get('orderId');
            if (orderId > 0) {
                const orderGoods = yield _this5.model('order_goods').where({
                    user_id: userId,
                    order_id: orderId,
                    is_delete: 0
                }).select();
                var goodsCount = 0;
                for (const gitem of orderGoods) {
                    goodsCount += gitem.number;
                }
                return _this5.success(orderGoods);
            } else {
                const cartList = yield _this5.model('cart').where({
                    user_id: userId,
                    checked: 1,
                    is_delete: 0,
                    is_fast: 0
                }).select();
                return _this5.success(cartList);
            }
        })();
    }
    /**
     * 取消订单
     * @return {Promise} []
     */
    cancelAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            const orderId = _this6.post('orderId');
            const userId = _this6.getLoginUserId();;
            // 检测是否能够取消
            const handleOption = yield _this6.model('order').getOrderHandleOption(orderId);
            // console.log('--------------' + handleOption.cancel);
            if (!handleOption.cancel) {
                return _this6.fail('订单不能取消');
            }
            // 设置订单已取消状态
            let updateInfo = {
                order_status: 102
            };
            let orderInfo = yield _this6.model('order').field('order_type').where({
                id: orderId,
                user_id: userId
            }).find();
            //取消订单，还原库存
            const goodsInfo = yield _this6.model('order_goods').where({
                order_id: orderId,
                user_id: userId
            }).select();
            for (const item of goodsInfo) {
                let goods_id = item.goods_id;
                let product_id = item.product_id;
                let number = item.number;
                yield _this6.model('goods').where({
                    id: goods_id
                }).increment('goods_number', number);
                yield _this6.model('product').where({
                    id: product_id
                }).increment('goods_number', number);
            }
            const succesInfo = yield _this6.model('order').where({
                id: orderId
            }).update(updateInfo);
            return _this6.success(succesInfo);
        })();
    }
    /**
     * 删除订单
     * @return {Promise} []
     */
    deleteAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const orderId = _this7.post('orderId');
            // 检测是否能够取消
            const handleOption = yield _this7.model('order').getOrderHandleOption(orderId);
            if (!handleOption.delete) {
                return _this7.fail('订单不能删除');
            }
            const succesInfo = yield _this7.model('order').orderDeleteById(orderId);
            return _this7.success(succesInfo);
        })();
    }
    /**
     * 确认订单
     * @return {Promise} []
     */
    confirmAction() {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            const orderId = _this8.post('orderId');
            // 检测是否能够取消
            const handleOption = yield _this8.model('order').getOrderHandleOption(orderId);
            if (!handleOption.confirm) {
                return _this8.fail('订单不能确认');
            }
            // 设置订单已取消状态
            const currentTime = parseInt(new Date().getTime() / 1000);
            let updateInfo = {
                order_status: 401,
                confirm_time: currentTime
            };
            const succesInfo = yield _this8.model('order').where({
                id: orderId
            }).update(updateInfo);
            return _this8.success(succesInfo);
        })();
    }
    /**
     * 完成评论后的订单
     * @return {Promise} []
     */
    completeAction() {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            const orderId = _this9.get('orderId');
            // 设置订单已完成
            const currentTime = parseInt(new Date().getTime() / 1000);
            let updateInfo = {
                order_status: 401,
                dealdone_time: currentTime
            };
            const succesInfo = yield _this9.model('order').where({
                id: orderId
            }).update(updateInfo);
            return _this9.success(succesInfo);
        })();
    }
    /**
     * 提交订单
     * @returns {Promise.<void>}
     */
    submitAction() {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            // 获取收货地址信息和计算运费
            const userId = _this10.getLoginUserId();;
            const addressId = _this10.post('addressId');
            const freightPrice = _this10.post('freightPrice');
            const offlinePay = _this10.post('offlinePay');
            let postscript = _this10.post('postscript');
            const buffer = Buffer.from(postscript); // 留言
            const checkedAddress = yield _this10.model('address').where({
                id: addressId
            }).find();
            if (think.isEmpty(checkedAddress)) {
                return _this10.fail('请选择收货地址');
            }
            // 获取要购买的商品
            const checkedGoodsList = yield _this10.model('cart').where({
                user_id: userId,
                checked: 1,
                is_delete: 0
            }).select();
            if (think.isEmpty(checkedGoodsList)) {
                return _this10.fail('请选择商品');
            }
            let checkPrice = 0;
            let checkStock = 0;
            for (const item of checkedGoodsList) {
                let product = yield _this10.model('product').where({
                    id: item.product_id
                }).find();
                if (item.number > product.goods_number) {
                    checkStock++;
                }
                if (item.retail_price != item.add_price) {
                    checkPrice++;
                }
            }
            if (checkStock > 0) {
                return _this10.fail(400, '库存不足，请重新下单');
            }
            if (checkPrice > 0) {
                return _this10.fail(400, '价格发生变化，请重新下单');
            }
            // 获取订单使用的红包
            // 如果有用红包，则将红包的数量减少，当减到0时，将该条红包删除
            // 统计商品总价
            let goodsTotalPrice = 0.00;
            for (const cartItem of checkedGoodsList) {
                goodsTotalPrice += cartItem.number * cartItem.retail_price;
            }
            // 订单价格计算
            const orderTotalPrice = goodsTotalPrice + freightPrice; // 订单的总价
            const actualPrice = orderTotalPrice - 0.00; // 减去其它支付的金额后，要实际支付的金额 比如满减等优惠
            const currentTime = parseInt(new Date().getTime() / 1000);
            let print_info = '';
            for (const item in checkedGoodsList) {
                let i = Number(item) + 1;
                print_info = print_info + i + '、' + checkedGoodsList[item].goods_aka + '【' + checkedGoodsList[item].number + '】 ';
            }
            let def = yield _this10.model('settings').where({
                id: 1
            }).find();
            let sender_name = def.Name;
            let sender_mobile = def.Tel;
            // let sender_address = '';
            let userInfo = yield _this10.model('user').where({
                id: userId
            }).find();
            // const checkedAddress = await this.model('address').where({id: addressId}).find();
            const orderInfo = {
                order_sn: _this10.model('order').generateOrderNumber(),
                user_id: userId,
                // 收货地址和运费
                consignee: checkedAddress.name,
                mobile: checkedAddress.mobile,
                province: checkedAddress.province_id,
                city: checkedAddress.city_id,
                district: checkedAddress.district_id,
                address: checkedAddress.address,
                order_status: 101, // 订单初始状态为 101
                // 根据城市得到运费，这里需要建立表：所在城市的具体运费
                freight_price: freightPrice,
                postscript: buffer.toString('base64'),
                add_time: currentTime,
                goods_price: goodsTotalPrice,
                order_price: orderTotalPrice,
                actual_price: actualPrice,
                change_price: actualPrice,
                print_info: print_info,
                offline_pay: offlinePay
            };
            // 开启事务，插入订单信息和订单商品
            const orderId = yield _this10.model('order').add(orderInfo);
            orderInfo.id = orderId;
            if (!orderId) {
                return _this10.fail('订单提交失败');
            }
            // 将商品信息录入数据库
            const orderGoodsData = [];
            for (const goodsItem of checkedGoodsList) {
                orderGoodsData.push({
                    user_id: userId,
                    order_id: orderId,
                    goods_id: goodsItem.goods_id,
                    product_id: goodsItem.product_id,
                    goods_name: goodsItem.goods_name,
                    goods_aka: goodsItem.goods_aka,
                    list_pic_url: goodsItem.list_pic_url,
                    retail_price: goodsItem.retail_price,
                    number: goodsItem.number,
                    goods_specifition_name_value: goodsItem.goods_specifition_name_value,
                    goods_specifition_ids: goodsItem.goods_specifition_ids
                });
            }
            yield _this10.model('order_goods').addMany(orderGoodsData);
            yield _this10.model('cart').clearBuyGoods();
            return _this10.success({
                orderInfo: orderInfo
            });
        })();
    }
    updateAction() {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            const addressId = _this11.post('addressId');
            const orderId = _this11.post('orderId');
            // 备注
            // let postscript = this.post('postscript');
            // const buffer = Buffer.from(postscript);
            const updateAddress = yield _this11.model('address').where({
                id: addressId
            }).find();
            const currentTime = parseInt(new Date().getTime() / 1000);
            const orderInfo = {
                // 收货地址和运费
                consignee: updateAddress.name,
                mobile: updateAddress.mobile,
                province: updateAddress.province_id,
                city: updateAddress.city_id,
                district: updateAddress.district_id,
                address: updateAddress.address
                // TODO 根据地址计算运费
                // freight_price: 0.00,
                // 备注
                // postscript: buffer.toString('base64'),
                // add_time: currentTime
            };
            const updateInfo = yield _this11.model('order').where({
                id: orderId
            }).update(orderInfo);
            return _this11.success(updateInfo);
        })();
    }
    /**
     * 查询物流信息asd
     * @returns {Promise.<void>}
     */
    expressAction() {
        var _this12 = this;

        return _asyncToGenerator(function* () {
            const currentTime = parseInt(new Date().getTime() / 1000);
            const orderId = _this12.get('orderId');
            let info = yield _this12.model('order_express').where({
                order_id: orderId
            }).find();
            if (think.isEmpty(info)) {
                return _this12.fail(400, '暂无物流信息');
            }
            const expressInfo = yield _this12.model('order_express').where({
                order_id: orderId
            }).find();
            // 如果is_finish == 1；或者 updateTime 小于 1分钟，
            let updateTime = info.update_time;
            let com = (currentTime - updateTime) / 60;
            let is_finish = info.is_finish;
            if (is_finish == 1) {
                return _this12.success(expressInfo);
            } else if (updateTime != 0 && com < 20) {
                return _this12.success(expressInfo);
            } else {
                let shipperCode = expressInfo.shipper_code;
                let expressNo = expressInfo.logistic_code;
                let lastExpressInfo = yield _this12.getExpressInfo(shipperCode, expressNo);
                let deliverystatus = lastExpressInfo.deliverystatus;
                let newUpdateTime = lastExpressInfo.updateTime;
                newUpdateTime = parseInt(new Date(newUpdateTime).getTime() / 1000);
                deliverystatus = yield _this12.getDeliverystatus(deliverystatus);
                let issign = lastExpressInfo.issign;
                let traces = lastExpressInfo.list;
                traces = JSON.stringify(traces);
                let dataInfo = {
                    express_status: deliverystatus,
                    is_finish: issign,
                    traces: traces,
                    update_time: newUpdateTime
                };
                yield _this12.model('order_express').where({
                    order_id: orderId
                }).update(dataInfo);
                let express = yield _this12.model('order_express').where({
                    order_id: orderId
                }).find();
                return _this12.success(express);
            }
            // return this.success(latestExpressInfo);
        })();
    }
    getExpressInfo(shipperCode, expressNo) {
        return _asyncToGenerator(function* () {
            let appCode = "APPCODE " + think.config('aliexpress.appcode');
            const options = {
                method: 'GET',
                url: 'http://wuliu.market.alicloudapi.com/kdi?no=' + expressNo + '&type=' + shipperCode,
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": appCode
                }
            };
            let sessionData = yield rp(options);
            sessionData = JSON.parse(sessionData);
            return sessionData.result;
        })();
    }
    getDeliverystatus(status) {
        return _asyncToGenerator(function* () {
            if (status == 0) {
                return '快递收件(揽件)';
            } else if (status == 1) {
                return '在途中';
            } else if (status == 2) {
                return '正在派件';
            } else if (status == 3) {
                return '已签收';
            } else if (status == 4) {
                return '派送失败(无法联系到收件人或客户要求择日派送，地址不详或手机号不清)';
            } else if (status == 5) {
                return '疑难件(收件人拒绝签收，地址有误或不能送达派送区域，收费等原因无法正常派送)';
            } else if (status == 6) {
                return '退件签收';
            }
        })();
    }
};