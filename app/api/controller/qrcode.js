function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
const rp = require('request-promise');
const fs = require('fs');
const http = require("https");
const path = require('path');
// const mineType = require('mime-types');
module.exports = class extends Base {
    getBase64Action() {
        var _this = this;

        return _asyncToGenerator(function* () {
            let goodsId = _this.post('goodsId');
            let page = "pages/goods/goods";
            let sceneData = goodsId;
            const options = {
                method: 'POST',
                url: 'https://api.weixin.qq.com/cgi-bin/token',
                qs: {
                    grant_type: 'client_credential',
                    secret: think.config('weixin.secret'),
                    appid: think.config('weixin.appid')
                }
            };
            let sessionData = yield rp(options);
            sessionData = JSON.parse(sessionData);
            let token = sessionData.access_token;
            let data = {
                "scene": sceneData, //第一个参数是抽奖ID，第二个是userId，第三个是share=1
                "page": page,
                "width": 200
            };
            data = JSON.stringify(data);
            var options2 = {
                method: "POST",
                host: "api.weixin.qq.com",
                path: "/wxa/getwxacodeunlimit?access_token=" + token,
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": data.length
                }
            };
            const uploadFunc = (() => {
                var _ref = _asyncToGenerator(function* () {
                    return new Promise(function (resolve, reject) {
                        try {
                            var req = http.request(options2, function (res) {
                                res.setEncoding("base64");
                                var imgData = "";
                                res.on('data', function (chunk) {
                                    imgData += chunk;
                                });
                                res.on("end", function () {
                                    return resolve(imgData);
                                });
                            });
                            req.write(data);
                            req.end();
                        } catch (e) {
                            return resolve(null);
                        }
                    });
                });

                return function uploadFunc() {
                    return _ref.apply(this, arguments);
                };
            })();
            const url = yield uploadFunc();
            return _this.success(url);
        })();
    }
};