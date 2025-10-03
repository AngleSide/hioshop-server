function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
const _ = require('lodash');
// const Jushuitan = require('jushuitan');
module.exports = class extends Base {
    /**
     * index action
     * @return {Promise} []
     */
    indexAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const page = _this.get('page') || 1;
            const size = _this.get('size') || 10;
            const orderSn = _this.get('orderSn') || '';
            const consignee = _this.get('consignee') || '';
            const logistic_code = _this.get('logistic_code') || '';
            const status = _this.get('status') || '';
            let data = {};
            const model = _this.model('order');
            if (logistic_code == '') {
                data = yield model.where({
                    order_sn: ['like', `%${orderSn}%`],
                    consignee: ['like', `%${consignee}%`],
                    order_status: ['IN', status],
                    order_type: ['<', 7]
                }).order(['id DESC']).page(page, size).countSelect();
                console.log(data);
            } else {
                let orderData = yield _this.model('order_express').where({
                    logistic_code: logistic_code
                }).find();
                let order_id = orderData.order_id;
                data = yield model.where({
                    id: order_id
                }).order(['id DESC']).page(page, size).countSelect();
            }
            for (const item of data.data) {
                item.goodsList = yield _this.model('order_goods').field('goods_name,goods_aka,list_pic_url,number,goods_specifition_name_value,retail_price').where({
                    order_id: item.id,
                    is_delete: 0
                }).select();
                item.goodsCount = 0;
                item.goodsList.forEach(function (v) {
                    item.goodsCount += v.number;
                });
                let user = yield _this.model('user').where({
                    id: item.user_id
                }).field('nickname,name,mobile,avatar').find();
                if (!think.isEmpty(user)) {
                    user.nickname = Buffer.from(user.nickname, 'base64').toString();
                } else {
                    user.nickname = '已删除';
                }
                item.userInfo = user;
                let province_name = yield _this.model('region').where({
                    id: item.province
                }).getField('name', true);
                let city_name = yield _this.model('region').where({
                    id: item.city
                }).getField('name', true);
                let district_name = yield _this.model('region').where({
                    id: item.district
                }).getField('name', true);
                item.full_region = province_name + city_name + district_name;
                item.postscript = Buffer.from(item.postscript, 'base64').toString();
                item.add_time = moment.unix(item.add_time).format('YYYY-MM-DD HH:mm:ss');
                if (item.pay_time != 0) {
                    item.pay_time = moment.unix(item.pay_time).format('YYYY-MM-DD HH:mm:ss');
                } else {
                    item.pay_time = 0;
                }
                item.order_status_text = yield _this.model('order').getOrderStatusText(item.id);
                let express = yield _this.model('order_express').where({
                    order_id: item.id
                }).find();
                if (!think.isEmpty(express)) {
                    item.expressInfo = express.shipper_name + express.logistic_code;
                } else {
                    item.expressInfo = '';
                }
                // item.button_text = await this.model('order').getOrderBtnText(item.id);
            }
            return _this.success(data);
        })();
    }
    getAutoStatusAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            let status = yield _this2.model('settings').where({
                id: 1
            }).field('autoDelivery').find();
            let info = status.autoDelivery;
            return _this2.success(info);
        })();
    }
    toDeliveryAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const page = _this3.get('page') || 1;
            const size = _this3.get('size') || 10;
            const status = _this3.get('status') || '';
            const model = _this3.model('order');
            const data = yield model.where({
                order_status: status
            }).order(['id DESC']).page(page, size).countSelect();
            for (const item of data.data) {
                item.goodsList = yield _this3.model('order_goods').field('goods_name,list_pic_url,number,goods_specifition_name_value,retail_price').where({
                    order_id: item.id
                }).select();
                item.goodsCount = 0;
                item.goodsList.forEach(function (v) {
                    item.goodsCount += v.number;
                });
                let province_name = yield _this3.model('region').where({
                    id: item.province
                }).getField('name', true);
                let city_name = yield _this3.model('region').where({
                    id: item.city
                }).getField('name', true);
                let district_name = yield _this3.model('region').where({
                    id: item.district
                }).getField('name', true);
                item.address = province_name + city_name + district_name + item.address;
                item.postscript = Buffer.from(item.postscript, 'base64').toString();
                item.add_time = moment.unix(item.add_time).format('YYYY-MM-DD HH:mm:ss');
                item.order_status_text = yield _this3.model('order').getOrderStatusText(item.id);
                item.button_text = yield _this3.model('order').getOrderBtnText(item.id);
            }
            return _this3.success(data);
        })();
    }
    saveGoodsListAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            // console.log(typeof(data));
            let id = _this4.post('id');
            let order_id = _this4.post('order_id');
            let number = _this4.post('number');
            let price = _this4.post('retail_price');
            let addOrMinus = _this4.post('addOrMinus');
            let changePrice = Number(number) * Number(price);
            console.log(order_id);
            console.log(changePrice);
            if (addOrMinus == 0) {
                yield _this4.model('order_goods').where({
                    id: id
                }).decrement('number', number);
                yield _this4.model('order').where({
                    id: order_id
                }).decrement({
                    actual_price: changePrice,
                    order_price: changePrice,
                    goods_price: changePrice
                });
                let order_sn = _this4.model('order').generateOrderNumber();
                yield _this4.model('order').where({
                    id: order_id
                }).update({
                    order_sn: order_sn
                });
                return _this4.success(order_sn);
            } else if (addOrMinus == 1) {
                yield _this4.model('order_goods').where({
                    id: id
                }).increment('number', number);
                yield _this4.model('order').where({
                    id: order_id
                }).increment({
                    actual_price: changePrice,
                    order_price: changePrice,
                    goods_price: changePrice
                });
                let order_sn = _this4.model('order').generateOrderNumber();
                yield _this4.model('order').where({
                    id: order_id
                }).update({
                    order_sn: order_sn
                });
                return _this4.success(order_sn);
            }
        })();
    }
    goodsListDeleteAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            console.log(_this5.post('id'));
            let id = _this5.post('id');
            let order_id = _this5.post('order_id');
            let number = _this5.post('number');
            let price = _this5.post('retail_price');
            let addOrMinus = _this5.post('addOrMinus');
            let changePrice = Number(number) * Number(price);
            console.log(order_id);
            console.log(changePrice);
            yield _this5.model('order_goods').where({
                id: id
            }).update({
                is_delete: 1
            });
            yield _this5.model('order').where({
                id: order_id
            }).decrement({
                actual_price: changePrice,
                order_price: changePrice,
                goods_price: changePrice
            });
            let order_sn = _this5.model('order').generateOrderNumber();
            yield _this5.model('order').where({
                id: order_id
            }).update({
                order_sn: order_sn
            });
            return _this5.success(order_sn);
        })();
    }
    saveAdminMemoAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            const id = _this6.post('id');
            const text = _this6.post('text');
            const model = _this6.model('order');
            let info = {
                admin_memo: text
            };
            let data = yield model.where({
                id: id
            }).update(info);
            return _this6.success(data);
        })();
    }
    savePrintInfoAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const id = _this7.post('id');
            const print_info = _this7.post('print_info');
            const model = _this7.model('order');
            let info = {
                print_info: print_info
            };
            let data = yield model.where({
                id: id
            }).update(info);
            return _this7.success(data);
        })();
    }
    saveExpressValueInfoAction() {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            const id = _this8.post('id');
            const express_value = _this8.post('express_value');
            const model = _this8.model('order');
            let info = {
                express_value: express_value
            };
            let data = yield model.where({
                id: id
            }).update(info);
            return _this8.success(data);
        })();
    }
    saveRemarkInfoAction() {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            const id = _this9.post('id');
            const remark = _this9.post('remark');
            const model = _this9.model('order');
            let info = {
                remark: remark
            };
            let data = yield model.where({
                id: id
            }).update(info);
            return _this9.success(data);
        })();
    }
    detailAction() {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            const id = _this10.get('orderId');
            const model = _this10.model('order');
            let data = yield model.where({
                id: id
            }).find();
            data.goodsList = yield _this10.model('order_goods').field('id,product_id,goods_name,goods_aka,list_pic_url,number,goods_specifition_name_value,retail_price,goods_id').where({
                order_id: data.id,
                is_delete: 0
            }).select();
            data.goodsCount = 0;
            data.goodsList.forEach(function (v) {
                data.goodsCount += v.number;
            });
            for (const item of data.goodsList) {
                let info = yield _this10.model('product').where({
                    id: item.product_id
                }).field('goods_sn').find();
                item.goods_sn = info.goods_sn;
            }
            console.log(data.goodsList);
            let userInfo = yield _this10.model('user').where({
                id: data.user_id
            }).find();
            let _nickname = Buffer.from(userInfo.nickname, 'base64').toString();
            data.user_name = _nickname;
            data.avatar = userInfo.avatar;
            let province_name = yield _this10.model('region').where({
                id: data.province
            }).getField('name', true);
            let city_name = yield _this10.model('region').where({
                id: data.city
            }).getField('name', true);
            let district_name = yield _this10.model('region').where({
                id: data.district
            }).getField('name', true);
            data.full_region = province_name + city_name + district_name;
            data.postscript = Buffer.from(data.postscript, 'base64').toString();
            data.order_status_text = yield _this10.model('order').getOrderStatusText(data.id);
            data.add_time = moment.unix(data.add_time).format('YYYY-MM-DD HH:mm:ss');
            data.allAddress = data.full_region + data.address;
            if (data.pay_time != 0) {
                data.pay_time = moment.unix(data.pay_time).format('YYYY-MM-DD HH:mm:ss');
            }
            if (data.shipping_time != 0) {
                data.shipping_time = moment.unix(data.shipping_time).format('YYYY-MM-DD HH:mm:ss');
            }
            if (data.confirm_time != 0) {
                data.confirm_time = moment.unix(data.confirm_time).format('YYYY-MM-DD HH:mm:ss');
            }
            if (data.dealdone_time != 0) {
                data.dealdone_time = moment.unix(data.dealdone_time).format('YYYY-MM-DD HH:mm:ss');
            }
            let def = yield _this10.model('settings').where({
                id: 1
            }).find();
            let senderInfo = {};
            let receiveInfo = {};
            receiveInfo = {
                name: data.consignee,
                mobile: data.mobile,
                province: province_name,
                province_id: data.province,
                city: city_name,
                city_id: data.city,
                district: district_name,
                district_id: data.district,
                address: data.address
            };
            senderInfo = {
                name: def.Name,
                mobile: def.Tel,
                province: def.ProvinceName,
                city: def.CityName,
                district: def.ExpAreaName,
                province_id: def.province_id,
                city_id: def.city_id,
                district_id: def.district_id,
                address: def.Address
            };
            return _this10.success({
                orderInfo: data,
                receiver: receiveInfo,
                sender: senderInfo
            });
        })();
    }
    getAllRegionAction() {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            // 我写的算法
            const model = _this11.model('region');
            const aData = yield model.where({
                type: 1
            }).select();
            const bData = yield model.where({
                type: 2
            }).select();
            const cData = yield model.where({
                type: 3
            }).select();
            let newData = [];
            for (const item of aData) {
                let children = [];
                for (const bitem of bData) {
                    let innerChildren = [];
                    for (const citem of cData) {
                        if (citem.parent_id == bitem.id) {
                            innerChildren.push({
                                value: citem.id,
                                label: citem.name
                            });
                        }
                    }
                    if (bitem.parent_id == item.id) {
                        children.push({
                            value: bitem.id,
                            label: bitem.name,
                            children: innerChildren
                        });
                    }
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
    orderpackAction() {
        var _this12 = this;

        return _asyncToGenerator(function* () {
            const id = _this12.get('orderId');
            const model = _this12.model('order');
            const data = yield model.where({
                id: id
            }).update({
                order_status: 300
            });
        })();
    }
    orderReceiveAction() {
        var _this13 = this;

        return _asyncToGenerator(function* () {
            const id = _this13.get('orderId');
            let currentTime = parseInt(new Date().getTime() / 1000);
            const model = _this13.model('order');
            const data = yield model.where({
                id: id
            }).update({
                order_status: 302,
                shipping_time: currentTime
            });
        })();
    }
    orderPriceAction() {
        var _this14 = this;

        return _asyncToGenerator(function* () {
            const id = _this14.get('orderId');
            const goodsPrice = _this14.get('goodsPrice');
            const freightPrice = _this14.get('freightPrice');
            const actualPrice = _this14.get('actualPrice');
            const model = _this14.model('order');
            const data = yield model.where({
                id: id
            }).find();
            let newData = {
                actual_price: actualPrice,
                freight_price: freightPrice,
                goods_price: goodsPrice,
                order_sn: model.generateOrderNumber()
            };
            yield model.where({
                id: id
            }).update(newData);
        })();
    }
    getOrderExpressAction() {
        var _this15 = this;

        return _asyncToGenerator(function* () {
            const orderId = _this15.post('orderId');
            const latestExpressInfo = yield _this15.model('order_express').getLatestOrderExpressByAli(orderId);
            return _this15.success(latestExpressInfo);
        })();
    }
    getPrintTestAction() {
        var _this16 = this;

        return _asyncToGenerator(function* () {
            const latestExpressInfo = yield _this16.model('order_express').printExpress();
            return _this16.success(latestExpressInfo);
        })();
    }
    getMianExpressAction() {
        var _this17 = this;

        return _asyncToGenerator(function* () {
            const orderId = _this17.post('orderId');
            const sender = _this17.post('sender');
            const receiver = _this17.post('receiver');
            console.log(orderId);
            console.log(sender);
            console.log(receiver);
            let senderOptions = sender.senderOptions;
            let receiveOptions = receiver.receiveOptions;
            let senderInfo = {
                Name: sender.name,
                Tel: sender.mobile,
                ProvinceName: yield _this17.model('region').where({
                    id: senderOptions[0]
                }).getField('name', true),
                CityName: yield _this17.model('region').where({
                    id: senderOptions[1]
                }).getField('name', true),
                ExpAreaName: yield _this17.model('region').where({
                    id: senderOptions[2]
                }).getField('name', true),
                Address: sender.address
            };
            let receiverInfo = {
                Name: receiver.name,
                Tel: receiver.mobile,
                ProvinceName: yield _this17.model('region').where({
                    id: receiveOptions[0]
                }).getField('name', true),
                CityName: yield _this17.model('region').where({
                    id: receiveOptions[1]
                }).getField('name', true),
                ExpAreaName: yield _this17.model('region').where({
                    id: receiveOptions[2]
                }).getField('name', true),
                Address: receiver.address
            };
            // 每次重新生成一次订单号，这样，不会出现已经下过单的情况了。
            const expressType = _this17.post('expressType');
            const latestExpressInfo = yield _this17.model('order_express').getMianExpress(orderId, senderInfo, receiverInfo, expressType);
            console.log('lastExpressInfo++++++++++++++++++++++');
            console.log(latestExpressInfo);
            if (latestExpressInfo.ResultCode == 100) {
                // 获取快递单号成功，然后存入order_express中
                _this17.orderExpressAdd(latestExpressInfo, orderId);
            }
            return _this17.success({
                latestExpressInfo: latestExpressInfo,
                sender: senderInfo,
                receiver: receiverInfo
            });
        })();
    }
    rePrintExpressAction() {
        var _this18 = this;

        return _asyncToGenerator(function* () {
            const date = new Date();
            let orderId = _this18.get('orderId');
            let order_sn = date.getFullYear() + _.padStart(date.getMonth(), 2, '0') + _.padStart(date.getDay(), 2, '0') + _.padStart(date.getHours(), 2, '0') + _.padStart(date.getMinutes(), 2, '0') + _.padStart(date.getSeconds(), 2, '0') + _.random(100000, 999999);
            let info = yield _this18.model('order').where({
                id: orderId
            }).update({
                order_sn: order_sn
            });
            return _this18.success(info);
        })();
    }
    directPrintExpressAction() {
        var _this19 = this;

        return _asyncToGenerator(function* () {
            let orderId = _this19.get('orderId');
            let express = yield _this19.model('order_express').where({
                order_id: orderId
            }).find();
            let info = {};
            if (express.express_type < 4) {
                info = yield _this19.model('shipper').where({
                    code: 'SF'
                }).find();
            } else {
                info = yield _this19.model('shipper').where({
                    code: 'YTO'
                }).find();
            }
            express.MonthCode = info.MonthCode;
            express.send_time = moment.unix(express.add_time).format('YYYY-MM-DD');
            return _this19.success(express);
        })();
    }
    orderExpressAdd(ele, orderId) {
        var _this20 = this;

        return _asyncToGenerator(function* () {
            let currentTime = parseInt(new Date().getTime() / 1000);
            let info = yield _this20.model('order_express').where({
                order_id: orderId
            }).find();
            if (think.isEmpty(info)) {
                let orderInfo = ele.Order;
                let ShipperCode = orderInfo.ShipperCode;
                let logistic_code = orderInfo.LogisticCode;
                let expressType = ele.expressType;
                let region_code = orderInfo.DestinatioCode;
                if (expressType == 4) {
                    region_code = orderInfo.MarkDestination;
                }
                const model = _this20.model('order');
                let kdInfo = yield _this20.model('shipper').where({
                    code: ShipperCode
                }).find();
                let kdData = {
                    order_id: orderId,
                    shipper_id: kdInfo.id,
                    shipper_name: kdInfo.name,
                    shipper_code: ShipperCode,
                    logistic_code: logistic_code,
                    region_code: region_code,
                    express_type: expressType,
                    add_time: currentTime
                };
                yield _this20.model('order_express').add(kdData);
            } else {
                let orderInfo = ele.Order;
                yield _this20.model('order_express').where({
                    order_id: orderId
                }).update({
                    logistic_code: orderInfo.LogisticCode
                });
            }
            // 如果生成快递单号了。然后又最后没有使用，又去生成快递单号，那么应该重新生成下订单号，用新订单号去生成快递单号，然后update掉旧的order_express
        })();
    }
    // 点击打印并发货按钮后，就将订单的状态改成已发货
    goDeliveryAction() {
        var _this21 = this;

        return _asyncToGenerator(function* () {
            let orderId = _this21.post('order_id');
            let currentTime = parseInt(new Date().getTime() / 1000);
            let updateData = {
                order_status: 301,
                print_status: 1,
                shipping_status: 1,
                shipping_time: currentTime
            };
            let data = yield _this21.model('order').where({
                id: orderId
            }).update(updateData);
            // 发送服务消息
            let orderInfo = yield _this21.model('order').where({
                id: orderId
            }).field('user_id').find();
            let user = yield _this21.model('user').where({
                id: orderInfo.user_id
            }).find();
            let openId = user.weixin_openid;
            // 物品名称
            // 快递单号
            // 快递公司
            // 发货时间
            // 温馨提示
            let goodsInfo = yield _this21.model('order_goods').where({
                order_id: orderId
            }).field('goods_name').select();
            let express = yield _this21.model('order_express').where({
                order_id: orderId
            }).find();
            // 物品名称
            let goodsName = '';
            if (goodsInfo.length == 1) {
                goodsName = goodsInfo[0].goods_name;
            } else {
                goodsName = goodsInfo[0].goods_name + '等' + goodsInfo.length + '件商品';
            }
            // 支付时间
            let shippingTime = moment.unix(currentTime).format('YYYY-MM-DD HH:mm:ss');
            // 订单金额
            // 订阅消息 请先在微信小程序的官方后台设置好订阅消息模板，然后根据自己的data的字段信息，设置好data
            let TEMPLATE_ID = think.config('templateId.deliveryId');
            let message = {
                "touser": openId,
                "template_id": TEMPLATE_ID,
                "page": '/pages/ucenter/index/index',
                "miniprogram_state": "formal",
                "lang": "zh_CN",
                "data": {
                    "thing7": {
                        "value": goodsName
                    },
                    "date2": {
                        "value": shippingTime
                    },
                    "name3": {
                        "value": express.shipper_name
                    },
                    "character_string4": {
                        "value": express.logistic_code
                    },
                    "thing9": {
                        "value": '签收前请检查包裹！'
                    }
                }
            };
            const tokenServer = think.service('weixin', 'api');
            const token = yield tokenServer.getAccessToken();
            const res = yield tokenServer.sendMessage(token, message);
            return _this21.success();
        })();
    }
    goPrintOnlyAction() {
        var _this22 = this;

        return _asyncToGenerator(function* () {
            let orderId = _this22.post('order_id');
            let updateData = {
                print_status: 1
            };
            let data = yield _this22.model('order').where({
                id: orderId
            }).update(updateData);
            return _this22.success(data);
        })();
    }
    orderDeliveryAction() {
        var _this23 = this;

        return _asyncToGenerator(function* () {
            // 发货api
            const orderId = _this23.get('orderId');
            const method = _this23.get('method');
            const deliveryId = _this23.get('shipper') || 0;
            const logistic_code = _this23.get('logistic_code') || 0;
            const model = _this23.model('order');
            let currentTime = parseInt(new Date().getTime() / 1000);
            let expressName = '';
            if (method == 2) {
                let ele = yield _this23.model('order_express').where({
                    order_id: orderId
                }).find();
                if (think.isEmpty(ele)) {
                    let kdInfo = yield _this23.model('shipper').where({
                        id: deliveryId
                    }).find();
                    expressName = kdInfo.name;
                    let kdData = {
                        order_id: orderId,
                        shipper_id: deliveryId,
                        shipper_name: kdInfo.name,
                        shipper_code: kdInfo.code,
                        logistic_code: logistic_code,
                        add_time: currentTime
                    };
                    yield _this23.model('order_express').add(kdData);
                    let updateData = {
                        order_status: 301,
                        shipping_status: 1,
                        shipping_time: currentTime
                    };
                    yield _this23.model('order').where({
                        id: orderId
                    }).update(updateData);
                    // 发送服务消息
                } else {
                    let kdInfo = yield _this23.model('shipper').where({
                        id: deliveryId
                    }).find();
                    expressName = kdInfo.name;
                    let kdData = {
                        order_id: orderId,
                        shipper_id: deliveryId,
                        shipper_name: kdInfo.name,
                        shipper_code: kdInfo.code,
                        logistic_code: logistic_code,
                        add_time: currentTime
                    };
                    yield _this23.model('order_express').where({
                        order_id: orderId
                    }).update(kdData);
                }
            } else if (method == 3) {
                let updateData = {
                    order_status: 301,
                    shipping_time: currentTime
                };
                yield _this23.model('order').where({
                    id: orderId
                }).update(updateData);
                expressName = '自提件';
            }
            yield _this23.deliveryMessage(method, orderId, expressName, logistic_code);
        })();
    }
    deliveryMessage(method, orderId, expressName, logistic_code) {
        var _this24 = this;

        return _asyncToGenerator(function* () {
            let orderInfo = yield _this24.model('order').where({
                id: orderId
            }).field('user_id').find();
            let user = yield _this24.model('user').where({
                id: orderInfo.user_id
            }).field('weixin_openid').find();
            let openId = user.weixin_openid;
            // 物品名称
            // 快递单号
            // 快递公司
            // 发货时间
            // 温馨提示
            let goodsInfo = yield _this24.model('order_goods').where({
                order_id: orderId
            }).field('goods_name').select();
            // 物品名称
            let goodsName = '';
            if (goodsInfo.length == 1) {
                goodsName = goodsInfo[0].goods_name;
            } else {
                goodsName = goodsInfo[0].goods_name + '等' + goodsInfo.length + '件商品';
            }
            // 支付时间
            let currentTime = parseInt(new Date().getTime() / 1000);
            let shippingTime = moment.unix(currentTime).format('YYYY-MM-DD HH:mm:ss');
            // 订单金额
            // 订阅消息 请先在微信小程序的官方后台设置好订阅消息模板，然后根据自己的data的字段信息，设置好data
            let TEMPLATE_ID = think.config('templateId.deliveryId');
            let message = {
                "touser": openId,
                "template_id": TEMPLATE_ID,
                "page": '/pages/ucenter/index/index',
                "miniprogram_state": "formal",
                "lang": "zh_CN",
                "data": {
                    "thing7": {
                        "value": goodsName
                    },
                    "date2": {
                        "value": shippingTime
                    },
                    "name3": {
                        "value": expressName
                    },
                    "character_string4": {
                        "value": logistic_code
                    },
                    "thing9": {
                        "value": '签收前请检查包裹！'
                    }
                }
            };
            const tokenServer = think.service('weixin', 'api');
            const token = yield tokenServer.getAccessToken();
            const res = yield tokenServer.sendMessage(token, message);
        })();
    }
    checkExpressAction() {
        var _this25 = this;

        return _asyncToGenerator(function* () {
            const id = _this25.get('orderId');
            let info = yield _this25.model('order_express').where({
                order_id: id
            }).find();
            if (!think.isEmpty(info)) {
                return _this25.success(info);
            } else {
                return _this25.fail(100, '没找到');
            }
        })();
    }
    saveAddressAction() {
        var _this26 = this;

        return _asyncToGenerator(function* () {
            const sn = _this26.post('order_sn');
            const name = _this26.post('name');
            const mobile = _this26.post('mobile');
            const cAddress = _this26.post('cAddress');
            const addOptions = _this26.post('addOptions');
            const province = addOptions[0];
            const city = addOptions[1];
            const district = addOptions[2];
            let info = {
                consignee: name,
                mobile: mobile,
                address: cAddress,
                province: province,
                city: city,
                district: district
            };
            const model = _this26.model('order');
            const data = yield model.where({
                order_sn: sn
            }).update(info);
            return _this26.success(data);
        })();
    }
    storeAction() {
        var _this27 = this;

        return _asyncToGenerator(function* () {
            if (!_this27.isPost) {
                return false;
            }
            const values = _this27.post();
            const id = _this27.post('id');
            const model = _this27.model('order');
            values.is_show = values.is_show ? 1 : 0;
            values.is_new = values.is_new ? 1 : 0;
            if (id > 0) {
                yield model.where({
                    id: id
                }).update(values);
            } else {
                delete values.id;
                yield model.add(values);
            }
            return _this27.success(values);
        })();
    }
    changeStatusAction() {
        var _this28 = this;

        return _asyncToGenerator(function* () {
            const orderSn = _this28.post('orderSn');
            const value = _this28.post('status');
            const info = yield _this28.model('order').where({
                order_sn: orderSn
            }).update({
                order_status: value
            });
            return _this28.success(info);
        })();
    }
    destoryAction() {
        var _this29 = this;

        return _asyncToGenerator(function* () {
            const id = _this29.post('id');
            yield _this29.model('order').where({
                id: id
            }).limit(1).delete();
            // 删除订单商品
            yield _this29.model('order_goods').where({
                order_id: id
            }).delete();
            // TODO 事务，验证订单是否可删除（只有失效的订单才可以删除）
            return _this29.success();
        })();
    }
    getGoodsSpecificationAction() {
        var _this30 = this;

        return _asyncToGenerator(function* () {
            const goods_id = _this30.post('goods_id');
            let data = yield _this30.model('goods_specification').where({
                goods_id: goods_id,
                is_delete: 0
            }).field('id,value').select();
            return _this30.success(data);
        })();
    }
};