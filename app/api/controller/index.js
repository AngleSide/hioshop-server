function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');
// const view = require('think-view');
const moment = require('moment');
const Jushuitan = require('jushuitan');
const rp = require('request-promise');
const http = require("http");
module.exports = class extends Base {
				indexAction() {
								var _this = this;

								return _asyncToGenerator(function* () {
												//auto render template file index_index.html
												return _this.display();
								})();
				}
				appInfoAction() {
								var _this2 = this;

								return _asyncToGenerator(function* () {
												const banner = yield _this2.model('ad').where({
																enabled: 1,
																is_delete: 0
												}).field('link_type,goods_id,image_url,link').order('sort_order asc').select();
												const notice = yield _this2.model('notice').where({
																is_delete: 0
												}).field('content').select();
												const channel = yield _this2.model('category').where({
																is_channel: 1,
																parent_id: 0
												}).field('id,icon_url,name,sort_order').order({
																sort_order: 'asc'
												}).select();
												const categoryList = yield _this2.model('category').where({
																parent_id: 0,
																is_show: 1
												}).field('id,name,img_url as banner, p_height as height').order({
																sort_order: 'asc'
												}).select();
												for (const categoryItem of categoryList) {
																const categoryGoods = yield _this2.model('goods').where({
																				category_id: categoryItem.id,
																				goods_number: ['>=', 0],
																				is_on_sale: 1,
																				is_index: 1,
																				is_delete: 0
																}).field('id,list_pic_url,is_new,goods_number,name,min_retail_price').order({
																				sort_order: 'asc'
																}).select();
																categoryItem.goodsList = categoryGoods;
												}
												const userId = _this2.getLoginUserId();
												let cartCount = yield _this2.model('cart').where({
																user_id: userId,
																is_delete: 0
												}).sum('number');
												if (cartCount == null) {
																cartCount = 0;
												}
												let data = {
																channel: channel,
																banner: banner,
																notice: notice,
																categoryList: categoryList,
																cartCount: cartCount
												};
												return _this2.success(data);
								})();
				}
};