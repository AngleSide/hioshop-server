function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require("./base.js");
module.exports = class extends Base {
  showSettingsAction() {
    var _this = this;

    return _asyncToGenerator(function* () {
      let info = yield _this.model("show_settings").where({
        id: 1
      }).find();
      return _this.success(info);
    })();
  }
  saveAction() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      let userId = _this2.getLoginUserId();
      let name = _this2.post("name");
      let mobile = _this2.post("mobile");
      let nickName = _this2.post("nickName");
      let avatar = _this2.post("avatar");
      let name_mobile = 0;
      if (name != "" && mobile != "") {
        name_mobile = 1;
      }
      const newbuffer = Buffer.from(nickName);
      let nickname = newbuffer.toString("base64");
      let data = {
        name: name,
        mobile: mobile,
        nickname: nickname,
        avatar: avatar,
        name_mobile: name_mobile
      };
      let info = yield _this2.model("user").where({
        id: userId
      }).update(data);
      return _this2.success(info);
    })();
  }
  userDetailAction() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      let userId = _this3.getLoginUserId();
      if (userId != 0) {
        let info = yield _this3.model("user").where({
          id: userId
        }).field("id,mobile,name,nickname,avatar").find();
        info.nickname = Buffer.from(info.nickname, "base64").toString();
        return _this3.success(info);
      } else {
        return _this3.fail(100, '未登录');
      }
    })();
  }
};