function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const moment = require('moment');
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
            let nickname = _this.get('nickname') || '';
            const buffer = Buffer.from(nickname);
            nickname = buffer.toString('base64');
            const model = _this.model('user');
            const data = yield model.where({
                nickname: ['like', `%${nickname}%`]
            }).order(['id DESC']).page(page, size).countSelect();
            for (const item of data.data) {
                item.register_time = moment.unix(item.register_time).format('YYYY-MM-DD HH:mm:ss');
                item.last_login_time = moment.unix(item.last_login_time).format('YYYY-MM-DD HH:mm:ss');
                item.nickname = Buffer.from(item.nickname, 'base64').toString();
            }
            let info = {
                userData: data
            };
            return _this.success(info);
        })();
    }
    infoAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const id = _this2.get('id');
            const model = _this2.model('user');
            let info = yield model.where({
                id: id
            }).find();
            info.register_time = moment.unix(info.register_time).format('YYYY-MM-DD HH:mm:ss');
            info.last_login_time = moment.unix(info.last_login_time).format('YYYY-MM-DD HH:mm:ss');
            info.nickname = Buffer.from(info.nickname, 'base64').toString();
            return _this2.success(info);
        })();
    }
    datainfoAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const id = _this3.get('id');
            let info = {};
            info.orderSum = yield _this3.model('order').where({
                user_id: id,
                order_type: ['<', 8],
                is_delete: 0
            }).count();
            info.orderDone = yield _this3.model('order').where({
                user_id: id,
                order_status: ['IN', '302,303,401'],
                order_type: ['<', 8],
                is_delete: 0
            }).count();
            info.orderMoney = yield _this3.model('order').where({
                user_id: id,
                order_status: ['IN', '302,303,401'],
                order_type: ['<', 8],
                is_delete: 0
            }).sum('actual_price');
            info.cartSum = yield _this3.model('cart').where({
                user_id: id,
                is_delete: 0
            }).sum('number');
            return _this3.success(info);
        })();
    }
    addressAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const id = _this4.get('id');
            const page = _this4.get('page') || 1;
            const size = _this4.get('size') || 10;
            let addr = yield _this4.model('address').where({
                user_id: id
            }).page(page, size).countSelect();
            for (const item of addr.data) {
                let province_name = yield _this4.model('region').where({
                    id: item.province_id
                }).getField('name', true);
                let city_name = yield _this4.model('region').where({
                    id: item.city_id
                }).getField('name', true);
                let district_name = yield _this4.model('region').where({
                    id: item.district_id
                }).getField('name', true);
                item.full_region = province_name + city_name + district_name + item.address;
            }
            return _this4.success(addr);
        })();
    }
    saveaddressAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            const id = _this5.post('id');
            const user_id = _this5.post('user_id');
            const name = _this5.post('name');
            const mobile = _this5.post('mobile');
            const address = _this5.post('address');
            const addOptions = _this5.post('addOptions');
            const province = addOptions[0];
            const city = addOptions[1];
            const district = addOptions[2];
            let info = {
                name: name,
                mobile: mobile,
                address: address,
                province_id: province,
                district_id: district,
                city_id: city
            };
            yield _this5.model('address').where({
                user_id: user_id,
                id: id
            }).update(info);
            return _this5.success();
        })();
    }
    cartdataAction() {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            const id = _this6.get('id');
            const page = _this6.get('page') || 1;
            const size = _this6.get('size') || 10;
            const model = _this6.model('cart');
            const data = yield model.where({
                user_id: id
            }).order(['add_time DESC']).page(page, size).countSelect();
            for (const item of data.data) {
                item.add_time = moment.unix(item.add_time).format('YYYY-MM-DD HH:mm:ss');
            }
            return _this6.success(data);
        })();
    }
    footAction() {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            const id = _this7.get('id');
            const page = _this7.get('page') || 1;
            const size = _this7.get('size') || 10;
            const model = _this7.model('footprint');
            const data = yield model.alias('f').join({
                table: 'goods',
                join: 'left',
                as: 'g',
                on: ['f.goods_id', 'g.id']
            }).where({
                user_id: id
            }).page(page, size).countSelect();
            console.log(data);
            return _this7.success(data);
        })();
    }
    orderAction() {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            const page = _this8.get('page') || 1;
            const size = _this8.get('size') || 10;
            const user_id = _this8.get('id');
            const model = _this8.model('order');
            const data = yield model.where({
                user_id: user_id,
                order_type: ['<', 8]
            }).order(['id DESC']).page(page, size).countSelect();
            console.log(data.count);
            for (const item of data.data) {
                item.goodsList = yield _this8.model('order_goods').field('goods_name,list_pic_url,number,goods_specifition_name_value,retail_price').where({
                    order_id: item.id,
                    is_delete: 0
                }).select();
                item.goodsCount = 0;
                item.goodsList.forEach(function (v) {
                    item.goodsCount += v.number;
                });
                let province_name = yield _this8.model('region').where({
                    id: item.province
                }).getField('name', true);
                let city_name = yield _this8.model('region').where({
                    id: item.city
                }).getField('name', true);
                let district_name = yield _this8.model('region').where({
                    id: item.district
                }).getField('name', true);
                item.full_region = province_name + city_name + district_name;
                item.postscript = Buffer.from(item.postscript, 'base64').toString();
                item.add_time = moment.unix(item.add_time).format('YYYY-MM-DD HH:mm:ss');
                item.order_status_text = yield _this8.model('order').getOrderStatusText(item.id);
                item.button_text = yield _this8.model('order').getOrderBtnText(item.id);
            }
            return _this8.success(data);
        })();
    }
    getOrderStatusText(orderInfo) {
        return _asyncToGenerator(function* () {
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
                case 202:
                    statusText = '退款中';
                    break;
                case 203:
                    statusText = '已退款';
                    break;
                case 300:
                    statusText = '已备货';
                    break;
                case 301:
                    statusText = '已发货';
                    break;
                case 302:
                    statusText = '待评价';
                    break;
                case 303:
                    statusText = '待评价'; //到时间，未收货的系统自动收货、
                    break;
                case 401:
                    statusText = '交易成功'; //到时间，未收货的系统自动收货、
                    break;
                case 801:
                    statusText = '拼团待付款';
                    break;
                case 802:
                    statusText = '拼团中'; // 如果sum变为0了。则，变成201待发货
                    break;
            }
            return statusText;
        })();
    }
    updateInfoAction() {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            const id = _this9.post('id');
            let nickname = _this9.post('nickname');
            const buffer = Buffer.from(nickname);
            nickname = buffer.toString('base64');
            const model = _this9.model('user');
            const data = yield model.where({
                id: id
            }).update({
                nickname: nickname
            });
            return _this9.success(data);
        })();
    }
    updateNameAction() {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            const id = _this10.post('id');
            const name = _this10.post('name');
            const model = _this10.model('user');
            const data = yield model.where({
                id: id
            }).update({
                name: name
            });
            return _this10.success(data);
        })();
    }
    updateMobileAction() {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            const id = _this11.post('id');
            const mobile = _this11.post('mobile');
            const model = _this11.model('user');
            const data = yield model.where({
                id: id
            }).update({
                mobile: mobile
            });
            return _this11.success(data);
        })();
    }
    storeAction() {
        var _this12 = this;

        return _asyncToGenerator(function* () {
            if (!_this12.isPost) {
                return false;
            }
            const values = _this12.post();
            const id = _this12.post('id');
            const model = _this12.model('user');
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
            return _this12.success(values);
        })();
    }
    destoryAction() {
        var _this13 = this;

        return _asyncToGenerator(function* () {
            const id = _this13.post('id');
            yield _this13.model('user').where({
                id: id
            }).limit(1).delete();
            return _this13.success();
        })();
    }
};