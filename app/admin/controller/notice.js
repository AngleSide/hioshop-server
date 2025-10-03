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
            const model = _this.model('notice');
            const data = yield model.select();

            for (const item of data) {
                item.end_time = moment.unix(item.end_time).format('YYYY-MM-DD HH:mm:ss');
            }

            return _this.success(data);
        })();
    }

    updateContentAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            const id = _this2.post('id');
            const content = _this2.post('content');
            const model = _this2.model('notice');
            const data = yield model.where({ id: id }).update({ content: content });
            return _this2.success(data);
        })();
    }

    addAction() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const content = _this3.post('content');
            let end_time = _this3.post('time');

            end_time = parseInt(new Date(end_time).getTime() / 1000);

            let info = {
                content: content,
                end_time: end_time
            };
            const model = _this3.model('notice');
            const data = yield model.add(info);
            return _this3.success(data);
        })();
    }

    updateAction() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const content = _this4.post('content');
            let end_time = _this4.post('time');
            let id = _this4.post('id');

            end_time = parseInt(new Date(end_time).getTime() / 1000);
            const currentTime = parseInt(new Date().getTime() / 1000);

            let info = {
                content: content,
                end_time: end_time
            };

            if (end_time > currentTime) {
                info.is_delete = 0;
            } else {
                info.is_delete = 1;
            }
            const model = _this4.model('notice');
            const data = yield model.where({ id: id }).update(info);
            return _this4.success(data);
        })();
    }

    destoryAction() {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            const id = _this5.post('id');
            yield _this5.model('notice').where({ id: id }).limit(1).delete();
            return _this5.success();
        })();
    }
};