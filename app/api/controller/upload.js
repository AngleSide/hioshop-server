function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require("./base.js");
const fs = require("fs");
const path = require("path");

module.exports = class extends Base {
  uploadAvatarAction() {
    var _this = this;

    return _asyncToGenerator(function* () {
      const file = _this.file('upload_file');
      let fileType = file.type;
      const spliceLength = fileType.lastIndexOf("/");
      let fileTypeText = fileType.slice(spliceLength + 1);
      if (think.isEmpty(file)) {
        return _this.fail("保存失败");
      }
      const that = _this;
      let name = think.uuid(32) + "." + fileTypeText;
      const filename = "/static/upload/avatar/" + name;
      const is = fs.createReadStream(file.path);
      const os = fs.createWriteStream(think.ROOT_PATH + "/www" + filename);
      is.pipe(os);
      return that.success({
        name: name,
        fileUrl: filename
      });
    })();
  }

  // async deleteFileAction() {
  //     const url = this.post('para');
  //     let newUrl = url.lastIndexOf("/");
  //     let fileName = url.substring(newUrl + 1);
  //     let delePath = './www/static/upload/goods/detail/' + fileName;
  //     fs.unlink(delePath, function (err) {
  //         if (err) throw err;
  //         return false;
  //     });
  //     return this.success('文件删除成功');
  // }
};