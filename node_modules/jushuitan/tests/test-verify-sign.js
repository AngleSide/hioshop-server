const test = require('tape');

const Jushuitan = require('../');
const jushuitan = new Jushuitan();


test('验证签名', (t) => {
    const urlVerified = jushuitan.verify('/jushuitan?ts=1547048796&partnerid=erp&method=cancel.order&type=cancelOrder&sign=6be7466d0b6a89b9c12cf04a2a1e356c');
    const qsVerified = jushuitan.verify({
        ts: '1547048796',
        partnerid: 'erp',
        method: 'cancel.order',
        type: 'cancelOrder',
        sign: '6be7466d0b6a89b9c12cf04a2a1e356c'
    });
    const unverified = jushuitan.verify({
        ts: '1547048796',
        partnerid: 'erp',
        method: 'cancel.order',
        type: 'cancelOrder',
        sign: 'x'
    });
    t.ok(urlVerified, 'url模式');
    t.ok(qsVerified, 'qs模式');
    t.notOk(unverified, '错误签名');
    t.end();
});