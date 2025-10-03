function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
const generate = require('nanoid/generate');
const Jushuitan = require('jushuitan');
module.exports = class extends Base {
    /**
     * 获取支付的请求参数
     * @returns {Promise<PreventPromise|void|Promise>}
     */
    // 测试时付款，将真实接口注释。 在小程序的services/pay.js中按照提示注释和打开
    preWeixinPayaAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const orderId = _this.get('orderId');
            const orderInfo = yield _this.model('order').where({
                id: orderId
            }).find();
            let userId = orderInfo.user_id;
            let result = {
                transaction_id: 123123123123,
                time_end: parseInt(new Date().getTime() / 1000)
            };
            const orderModel = _this.model('order');
            yield orderModel.updatePayData(orderInfo.id, result);
            _this.afterPay(orderInfo);
            return _this.success();
        })();
    }
    // 真实的付款接口
    preWeixinPayAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const orderId = _this2.get('orderId');
            const orderInfo = yield _this2.model('order').where({
                id: orderId
            }).find();
            // 再次确认库存和价格
            let orderGoods = yield _this2.model('order_goods').where({
                order_id: orderId,
                is_delete: 0
            }).select();
            let checkPrice = 0;
            let checkStock = 0;
            for (const item of orderGoods) {
                let product = yield _this2.model('product').where({
                    id: item.product_id
                }).find();
                if (item.number > product.goods_number) {
                    checkStock++;
                }
                if (item.retail_price != product.retail_price) {
                    checkPrice++;
                }
            }
            if (checkStock > 0) {
                return _this2.fail(400, '库存不足，请重新下单');
            }
            if (checkPrice > 0) {
                return _this2.fail(400, '价格发生变化，请重新下单');
            }
            if (think.isEmpty(orderInfo)) {
                return _this2.fail(400, '订单已取消');
            }
            if (parseInt(orderInfo.pay_status) !== 0) {
                return _this2.fail(400, '订单已支付，请不要重复操作');
            }
            const openid = yield _this2.model('user').where({
                id: orderInfo.user_id
            }).getField('weixin_openid', true);
            if (think.isEmpty(openid)) {
                return _this2.fail(400, '微信支付失败，没有openid');
            }
            const WeixinSerivce = _this2.service('weixin', 'api');
            try {
                const returnParams = yield WeixinSerivce.createUnifiedOrder({
                    openid: openid,
                    body: '[海风小店]：' + orderInfo.order_sn,
                    out_trade_no: orderInfo.order_sn,
                    total_fee: parseInt(orderInfo.actual_price * 100),
                    spbill_create_ip: ''
                });
                return _this2.success(returnParams);
            } catch (err) {
                return _this2.fail(400, '微信支付失败?');
            }
        })();
    }
    notifyAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const WeixinSerivce = _this3.service('weixin', 'api');
            const data = _this3.post('xml');
            const result = WeixinSerivce.payNotify(_this3.post('xml'));

            if (!result) {
                let echo = 'FAIL';
                return _this3.json(echo);
            }
            const orderModel = _this3.model('order');
            const orderInfo = yield orderModel.getOrderByOrderSn(result.out_trade_no);
            if (think.isEmpty(orderInfo)) {
                let echo = 'FAIL';
                return _this3.json(echo);
            }
            let bool = yield orderModel.checkPayStatus(orderInfo.id);
            if (bool == true) {
                if (orderInfo.order_type == 0) {
                    //普通订单和秒杀订单
                    yield orderModel.updatePayData(orderInfo.id, result);
                    _this3.afterPay(orderInfo);
                }
            } else {
                return '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单已支付]]></return_msg></xml>';
            }
            let echo = 'SUCCESS';
            return _this3.json(echo);
        })();
    }
    afterPay(orderInfo) {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            if (orderInfo.order_type == 0) {
                let orderGoodsList = yield _this4.model('order_goods').where({
                    order_id: orderInfo.id
                }).select();
                for (const cartItem of orderGoodsList) {
                    let goods_id = cartItem.goods_id;
                    let product_id = cartItem.product_id;
                    let number = cartItem.number;
                    let specification = cartItem.goods_specifition_name_value;
                    yield _this4.model('goods').where({
                        id: goods_id
                    }).decrement('goods_number', number);
                    yield _this4.model('goods').where({
                        id: goods_id
                    }).increment('sell_volume', number);
                    yield _this4.model('product').where({
                        id: product_id
                    }).decrement('goods_number', number);
                }
                // version 1.01
            }
        })();
    }
};