function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/* eslint-disable no-multi-spaces */
const Base = require('./base.js');
const crypto = require("crypto");
/**
 *  检验signature对请求进行校验
 */
function checkSignature(params) {
    //token 就是自己填写的令牌
    var key = ['huixianshuichanhuixianshuichan', params.timestamp, params.nonce].sort().join('');
    //将token （自己设置的） 、timestamp（时间戳）、nonce（随机数）三个参数进行字典排序
    var sha1 = crypto.createHash('sha1');
    //将上面三个字符串拼接成一个字符串再进行sha1加密
    sha1.update(key);
    let a = sha1.digest('hex');
    let b = params.signature;
    if (a == b) {
        return true;
    }
    //将加密后的字符串与signature进行对比，若成功，返回success。如果通过验证，则，注释掉这个函数
}
module.exports = class extends Base {
    receiveAction() {
        var _this = this;

        return _asyncToGenerator(function* () {
            // const value = this.post('value');
            yield _this.model('rules').add({
                name: 9,
                rule_content: '哈哈'
            });
            return _this.success('haha');
        })();
    }
    notifyAction() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            /**
             *  服务器配置校验，校验后，注释掉！
             */
            // const info = this.get("");
            // if (checkSignature(info)){
            //     return this.json(info.echostr);
            // }
            // else {
            //     return this.fail("error");
            // }
            yield _this2.model('rules').add({
                name: 9,
                rule_content: '哈哈'
            });
            return _this2.success('haha');
            const data = _this2.post("");
            const {
                ToUserName,
                FromUserName,
                CreateTime,
                MsgType,
                Content,
                MsgId
            } = data;
            // console.log("data: ", JSON.stringify(data));
            const tokenServer = think.service('weixin', 'api');
            const token = yield tokenServer.getAccessToken();
            // console.log(token);
            switch (data.MsgType) {
                case 'text':
                    {
                        //用户在客服会话中发送文本消息
                        yield tokenServer.sendTextMessage(data, token);
                        break;
                    }
                // case 'image': { //用户在客服会话中发送图片消息
                //     await sendImageMessage(data.MediaId, data, access_token);
                //     await tokenServer.sendImageMessage(data, token);
                //     break;
                // }
                case 'event':
                    {
                        if (data.Event == 'user_enter_tempsession') {//用户在小程序“客服会话按钮”进入客服会话,在聊天框进入不会有此事件
                            // await tokenServer.sendTextMessage(data, token);
                            // await sendTextMessage("您有什么问题吗?", data, access_token);
                        } else if (data.Event == 'kf_create_session') {
                            //网页客服进入回话
                            console.log('网页客服进入回话');
                        }
                        break;
                    }
            }
            //  https://www.jianshu.com/p/3d59ae5e69ab
        })();
    }
};