function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = class extends think.Model {
    addFootprint(userId, goodsId) {
        var _this = this;

        return _asyncToGenerator(function* () {
            // 用户已经登录才可以添加到足迹

            const currentTime = parseInt(new Date().getTime() / 1000);

            if (userId > 0 && goodsId > 0) {
                let info = yield _this.where({
                    goods_id: goodsId,
                    user_id: userId
                }).find();
                if (think.isEmpty(info)) {
                    yield _this.add({
                        goods_id: goodsId,
                        user_id: userId,
                        add_time: currentTime
                    });
                } else {
                    const add_time = currentTime;
                    yield _this.where({
                        goods_id: goodsId,
                        user_id: userId
                    }).update({ add_time: add_time });
                }
            }
        })();
    }
};