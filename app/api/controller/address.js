function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const pinyin = require("pinyin");
const generate = require('nanoid/generate');
module.exports = class extends Base {
    getAddressesAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const userId = _this.getLoginUserId();;
            const addressList = yield _this.model('address').where({
                user_id: userId,
                is_delete: 0
            }).order('id desc').select();
            let itemKey = 0;
            for (const addressItem of addressList) {
                addressList[itemKey].province_name = yield _this.model('region').getRegionName(addressItem.province_id);
                addressList[itemKey].city_name = yield _this.model('region').getRegionName(addressItem.city_id);
                addressList[itemKey].district_name = yield _this.model('region').getRegionName(addressItem.district_id);
                addressList[itemKey].full_region = addressList[itemKey].province_name + addressList[itemKey].city_name + addressList[itemKey].district_name;
                itemKey += 1;
            }
            return _this.success(addressList);
        })();
    }
    saveAddressAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            let addressId = _this2.post('id');
            const userId = _this2.getLoginUserId();;
            const addressData = {
                name: _this2.post('name'),
                mobile: _this2.post('mobile'),
                province_id: _this2.post('province_id'),
                city_id: _this2.post('city_id'),
                district_id: _this2.post('district_id'),
                address: _this2.post('address'),
                user_id: _this2.getLoginUserId(),
                is_default: _this2.post('is_default')
            };
            if (think.isEmpty(addressId)) {
                addressId = yield _this2.model('address').add(addressData);
            } else {
                yield _this2.model('address').where({
                    id: addressId,
                    user_id: userId
                }).update(addressData);
            }
            // 如果设置为默认，则取消其它的默认
            if (_this2.post('is_default') == 1) {
                yield _this2.model('address').where({
                    id: ['<>', addressId],
                    user_id: userId
                }).update({
                    is_default: 0
                });
            }
            const addressInfo = yield _this2.model('address').where({
                id: addressId
            }).find();
            return _this2.success(addressInfo);
        })();
    }
    deleteAddressAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const id = _this3.post('id');
            const userId = _this3.getLoginUserId();;
            let d = yield _this3.model('address').where({
                user_id: userId,
                id: id
            }).update({
                is_delete: 1
            });
            return _this3.success(d);
        })();
    }
    addressDetailAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const addressId = _this4.get('id');
            const userId = _this4.getLoginUserId();;
            const addressInfo = yield _this4.model('address').where({
                user_id: userId,
                id: addressId
            }).find();
            if (!think.isEmpty(addressInfo)) {
                addressInfo.province_name = yield _this4.model('region').getRegionName(addressInfo.province_id);
                addressInfo.city_name = yield _this4.model('region').getRegionName(addressInfo.city_id);
                addressInfo.district_name = yield _this4.model('region').getRegionName(addressInfo.district_id);
                addressInfo.full_region = addressInfo.province_name + addressInfo.city_name + addressInfo.district_name;
            }
            return _this4.success(addressInfo);
        })();
    }
};