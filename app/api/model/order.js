function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const _ = require('lodash');
module.exports = class extends think.Model {
    /**
     * 生成订单的编号order_sn
     * @returns {string}
     */
    // TODO 这里应该产生一个唯一的订单，但是实际上这里仍然存在两个订单相同的可能性
    generateOrderNumber() {
        const date = new Date();
        return date.getFullYear() + _.padStart(date.getMonth(), 2, '0') + _.padStart(date.getDay(), 2, '0') + _.padStart(date.getHours(), 2, '0') + _.padStart(date.getMinutes(), 2, '0') + _.padStart(date.getSeconds(), 2, '0') + _.random(100000, 999999);
    }
    getOrderStatus(showType) {
        let status = [];
        if (showType == 0) {
            status.push(101, 102, 103, 201, 202, 203, 300, 301, 302, 303, 401);
            // TODO 这里会不会效率不高？
        } else if (showType == 1) {
            // 待付款订单
            status.push(101);
        } else if (showType == 2) {
            // 待发货订单
            status.push(300);
        } else if (showType == 3) {
            // 待收货订单
            status.push(301);
        } else if (showType == 4) {
            // 待评价订单
            status.push(302, 303);
        } else {
            return null;
        }
        return status;
    }
    /**
     * 获取订单可操作的选项
     * @param orderId
     */
    getOrderHandleOption(orderId) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const handleOption = {
                cancel: false, // 取消操作
                delete: false, // 删除操作
                pay: false, // 支付操作
                confirm: false, // 确认收货完成订单操作
                cancel_refund: false
            };
            const orderInfo = yield _this.where({
                id: orderId
            }).find();
            // 订单流程：下单成功－》支付订单－》发货－》收货－》评论
            // 订单相关状态字段设计，采用单个字段表示全部的订单状态
            // 1xx表示订单取消和删除等状态：  101订单创建成功等待付款、102订单已取消、103订单已取消(自动)
            // 2xx表示订单支付状态：        201订单已付款，等待发货、202订单取消，退款中、203已退款
            // 3xx表示订单物流相关状态：     300订单待发货，301订单已发货，302用户确认收货、303系统自动收货
            // 4xx表示订单完成的状态：      401已收货已评价
            // 5xx表示订单退换货相关的状态：  501已收货，退款退货 TODO
            // 如果订单已经取消或是已完成，则可删除和再次购买
            // if (status == 101) "未付款";
            // if (status == 102) "已取消";
            // if (status == 103) "已取消(系统)";
            // if (status == 201) "已付款";
            // if (status == 300) "待发货";
            // if (status == 301) "已发货";
            // if (status == 302) "已收货";
            // if (status == 303) "已收货(系统)";
            //  TODO 设置一个定时器，自动将有些订单设为完成
            // 订单刚创建，可以取消订单，可以继续支付
            if (orderInfo.order_status === 101 || orderInfo.order_status === 801) {
                handleOption.cancel = true;
                handleOption.pay = true;
            }
            // 如果订单被取消
            if (orderInfo.order_status === 102 || orderInfo.order_status === 103) {
                handleOption.delete = true;
            }
            // 如果订单已付款，没有发货，则可退款操作
            if (orderInfo.order_status === 201) {}
            // handleOption.return = true;

            // 如果订单申请退款中，没有相关操作
            if (orderInfo.order_status === 202) {
                handleOption.cancel_refund = true;
            }
            if (orderInfo.order_status === 300) {}
            // 如果订单已经退款，则可删除
            if (orderInfo.order_status === 203) {
                handleOption.delete = true;
            }
            // 如果订单已经发货，没有收货，则可收货操作,
            // 此时不能取消订单
            if (orderInfo.order_status === 301) {
                handleOption.confirm = true;
            }
            if (orderInfo.order_status === 401) {
                handleOption.delete = true;
            }
            return handleOption;
        })();
    }
    getOrderTextCode(orderId) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const textCode = {
                pay: false,
                close: false,
                delivery: false,
                receive: false,
                success: false,
                countdown: false
            };
            const orderInfo = yield _this2.where({
                id: orderId
            }).find();
            if (orderInfo.order_status === 101) {
                textCode.pay = true;
                textCode.countdown = true;
            }
            if (orderInfo.order_status === 102 || orderInfo.order_status === 103) {
                textCode.close = true;
            }
            if (orderInfo.order_status === 201 || orderInfo.order_status === 300) {
                //待发货
                textCode.delivery = true;
            }
            if (orderInfo.order_status === 301) {
                //已发货
                textCode.receive = true;
            }
            if (orderInfo.order_status === 401) {
                textCode.success = true;
            }
            return textCode;
        })();
    }
    // if (status == 101) "未付款";
    // if (status == 102) "已取消";
    // if (status == 103) "已取消(系统)";
    // if (status == 201) "已付款";
    // if (status == 301) "已发货";
    // if (status == 302) "已收货";
    // if (status == 303) "已收货(系统)";
    // if (status == 401) "已完成";
    getOrderStatusText(orderId) {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const orderInfo = yield _this3.where({
                id: orderId
            }).find();
            let statusText = '待付款';
            switch (orderInfo.order_status) {
                case 101:
                    statusText = '待付款';
                    break;
                case 102:
                    statusText = '交易关闭';
                    break;
                case 103:
                    statusText = '交易关闭'; //到时间系统自动取消
                    break;
                case 201:
                    statusText = '待发货';
                    break;
                case 300:
                    statusText = '待发货';
                    break;
                case 301:
                    statusText = '已发货';
                    break;
                case 401:
                    statusText = '交易成功'; //到时间，未收货的系统自动收货、
                    break;
            }
            return statusText;
        })();
    }
    // 返回创建时间
    getOrderAddTime(orderId) {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const orderInfo = yield _this4.where({
                id: orderId
            }).find();
            let add_time = orderInfo.add_time;
            return add_time;
        })();
    }
    // 支付时间
    setOrderPayTime(orderId, payTime) {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            const orderInfo = yield _this5.where({
                id: orderId
            }).update({
                pay_time,
                payTime
            });
            return orderInfo;
        })();
    }
    // 删除订单，将is_delete置为0
    orderDeleteById(orderId) {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            return _this6.where({
                id: orderId
            }).update({
                is_delete: 1
            });
        })();
    }
    /**
     * check订单状态
     * @param orderId
     * @param payStatus
     * @returns {Promise.<boolean>}
     */
    checkPayStatus(orderId) {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            let info = yield _this7.where({
                id: orderId,
                pay_status: 2
            }).select();
            let _length = info.length;
            if (_length > 0) {
                return false;
            } else {
                return true;
            }
        })();
    }
    /**
     * 更改订单支付状态
     * @param orderId
     * @param payStatus
     * @returns {Promise.<boolean>}
     */
    updatePayStatus(orderId, payStatus = 0) {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            return _this8.where({
                id: orderId
            }).limit(1).update({
                pay_status: parseInt(payStatus)
            });
        })();
    }
    /**
     * 更改订单状态
     * @param orderId
     * @param order_Status
     * @returns {Promise.<boolean>}
     */
    updateOrderStatus(orderId, orderStatus = 0) {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            return _this9.where({
                id: orderId
            }).limit(1).update({
                order_status: parseInt(orderStatus)
            });
        })();
    }
    /**
     * 根据订单编号查找订单信息
     * @param orderSn
     * @returns {Promise.<Promise|Promise<any>|T|*>}
     */
    getOrderByOrderSn(orderSn) {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            if (think.isEmpty(orderSn)) {
                return {};
            }
            return _this10.where({
                order_sn: orderSn
            }).find();
        })();
    }
    /**
     * 更新订单状态,包括更新库存数据，现在可以开始写了
     * @param orderId
     * @param
     * @returns {Promise.<boolean>}
     */
    updatePayData(orderId, info) {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            let data = {
                pay_status: 2,
                order_status: 300,
                pay_id: info.transaction_id,
                pay_time: info.time_end
            };
            return _this11.where({
                id: orderId
            }).limit(1).update(data);
        })();
    }
};