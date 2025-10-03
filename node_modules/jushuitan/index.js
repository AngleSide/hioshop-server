const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const url = require('url');

class Jushuitan {

  constructor(args = {}) {
    const defaultConfig = {
      url: 'http://c.sursung.com/api/open/query.aspx',
      qmUrl: 'http://a1q40taq0j.api.taobao.com/router/qmtest',
      partnerid: 'ywv5jGT8ge6Pvlq3FZSPol345asd',
      partnerkey: 'ywv5jGT8ge6Pvlq3FZSPol2323',
      token: '181ee8952a88f5a57db52587472c3798',
      target_app_key: '23060081'
    };
    this.config = Object.assign({}, defaultConfig, args);
  }

  query(method, form) {
    const { url } = this.config;
    const ts = Math.floor((new Date).getTime() / 1000);
    const sign = this.sign({
      method,
      ts
    });
    const qs = {
      partnerid: this.config.partnerid,
      token: this.config.token,
      method,
      ts,
      sign
    };
    const requestUrl = this.config.url + '?' + querystring.stringify(qs);
    return new Promise((resolve, reject) => {
      axios.post(requestUrl, form).then(res => {
        resolve(res.data);
      })
      .catch(reject);
    });
  }

  sign({ method, ts }) {
    const {
      partnerid,
      token,
      partnerkey
    } = this.config;

    const signStr = [ method, partnerid, 'token',
      token, 'ts', ts, partnerkey ].join('');

    const md5 = crypto.createHash('md5');
    return md5.update(signStr).digest('hex');
  }

  verify(requestUrl) {
    const qs = {};
    if(typeof requestUrl === 'string') {
      const parsedUrl = url.parse(requestUrl, true);
      Object.assign(qs, parsedUrl.query);
    } else if(typeof requestUrl === "object" && requestUrl !== null) {
      Object.assign(qs, requestUrl);
    } else {
      throw new Error('Unsupported verfiy type:' + (typeof requestUrl));
    }
    const ignoreFields = [
      'sign',
      'method',
      'partnerid',
      'partnerkey'
    ];
    // 这两个值是固定值：http://open.jushuitan.com/document/1018.html
    // 这样验证签名功能就失去了意义
    // 任何人都可以伪造签名并向接口发起正确签名的请求
    const partnerid = 'erp';
    const partnerkey = 'erp';
    const signParts = [ qs.method, partnerid ];
    for(let key of Object.keys(qs)) {
      if(!ignoreFields.includes(key)) {
        signParts.push(key, qs[key]);
      }
    }
    signParts.push(partnerkey);
    const md5 = crypto.createHash('md5');
    const sign = md5.update(signParts.join('')).digest('hex');
    return sign === qs.sign;
  }
}

module.exports = Jushuitan;