function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
module.exports = class extends Base {
    infoAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            const region = yield _this.model('region').getRegionInfo(_this.get('regionId'));
            return _this.success(region);
        })();
    }
    listAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const regionList = yield _this2.model('region').getRegionList(_this2.get('parentId'));
            return _this2.success(regionList);
        })();
    }
    dataAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            let parentId = _this3.post('parent_id');
            let info = yield _this3.model('region').where({
                parent_id: parentId
            }).getField('id,name');
            return _this3.success(info);
        })();
    }
    codeAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            let province = _this4.post('Province');
            let city = _this4.post('City');
            let country = _this4.post('Country');
            let provinceInfo = yield _this4.model('region').where({
                name: province
            }).field('id').find();
            let province_id = provinceInfo.id;
            let cityInfo = yield _this4.model('region').where({
                name: city
            }).field('id').find();
            let city_id = cityInfo.id;
            let countryInfo = yield _this4.model('region').where({
                name: country
            }).field('id').find();
            let country_id = countryInfo.id;
            let data = {
                province_id: province_id,
                city_id: city_id,
                country_id: country_id
            };
            return _this4.success(data);
        })();
    }
};