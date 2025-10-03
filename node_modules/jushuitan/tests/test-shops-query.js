const test = require('tape');

const Jushuitan = require('../');
const jushuitan = new Jushuitan();


test('店铺查询 shops.query', (t) => {
    jushuitan.query('shops.query', {
        nicks: [
            'pay@sursung.com'
        ]
    }).then(res => {
        const { shops, issuccess, code } = res;
        t.equal(issuccess, true, 'shops.query issuccess');
        t.equal(code, 0, 'shops.query code is 0');
        t.equal(shops.length > 0, true, 'shops.query has shops');
        t.end();
    });
});