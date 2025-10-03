# 聚水潭 jushuitan
聚水潭 Non-Official SDK for nodejs

## 安装
`npm i jushuitan --save`

## 快速上手
```javascript
const Jushuitan = require('jushuitan');
const jushuitan = new Jushuitan({
    // 线上地址是 http://open.erp321.com/api/open/query.aspx
    url: 'http://c.sursung.com/api/open/query.aspx',
    // 合作方编号
    partnerid: 'ywv5jGT8ge6Pvlq3FZSPol345asd',
    // 接入密钥
    patrnerkey: 'ywv5jGT8ge6Pvlq3FZSPol2323',
    // 授权码
    token: '181ee8952a88f5a57db52587472c3798',
});

const method = 'shops.query';
const form = {
    nicks: [
        'pay@sursung.com'
    ]
};
jushuitan.query(method, form)
.then(res => {
    console.log(res);
});
```

这里 `res` 输出的内容是：
```javascript
{ shops:
    [ { shop_id: 82,
        shop_name: '胜商ERP软件旗舰店',
        shop_site: '京东商城',
        shop_url: 'http://shop110721021.taobao.com',
        created: '2016-04-28 09:49:58',
        nick: 'pay@sursung.com',
        session_expired: null,
        short_name: '' } ],
code: 0,
issuccess: true,
msg: null }
```


## 构造函数 new Jushuitan([config])
省略 config 时默认使用聚水潭测试环境。

config 配置项：

- url string 接口地址
- partnerid string 合作方编号
- patrnerkey string 接入密钥
- token string 授权码

## 查询 Jushuitan.prototype.query(method, form)

- method string 聚水潭接口名称
- form 业务参数

## 验证签名 Jushuitan.prototype.verify(url | qs)
用于同步推送接口，可以传入字符串的 url 地址，或已经解析完的 queryString。sign 正确就返回 `true`, 不正确就返回 `false`
- url string 收到请求的接口地址
- qs Object 收到请求的 QueryString

> 然而由于 partnerid 和 partnerkey 都是固定值 erp，所以此安全隐患导致无法验证请求发起者确是聚水潭官方。 http://open.jushuitan.com/document/1017.html

## Todo 
暂不支持奇门接口

## ChangeLog

v1.0.2 
- 修复 typo partnerkey
- 增加 verify 验证 sign 方法

v1.0.1 Add git repository
v1.0.0 初始化版本