function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = class extends think.Controller {
	__before() {
		var _this = this;

		return _asyncToGenerator(function* () {
			// 根据token值获取用户id
			const token = _this.ctx.header['x-hioshop-token'] || '';
			const tokenSerivce = think.service('token', 'api');
			think.userId = tokenSerivce.getUserId(token);
		})();
	}
	/**
  * 获取时间戳
  * @returns {Number}
  */
	getTime() {
		return parseInt(Date.now() / 1000);
	}
	/**
  * 获取当前登录用户的id
  * @returns {*}
  */
	getLoginUserId() {
		const token = this.ctx.header['x-hioshop-token'] || '';
		const tokenSerivce = think.service('token', 'api');
		return tokenSerivce.getUserId(token);
	}
};