function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Base = require('./base.js');

module.exports = class extends Base {
	/**
  * index action
  * @return {Promise} []
  */
	indexAction() {
		var _this = this;

		return _asyncToGenerator(function* () {
			const model = _this.model('shipper');
			const info = yield model.where({
				enabled: 1
			}).select();
			const set = yield _this.model('settings').where({
				id: 1
			}).find();
			let data = {
				info: info,
				set: set
			};
			return _this.success(data);
		})();
	}

	listAction() {
		var _this2 = this;

		return _asyncToGenerator(function* () {
			const page = _this2.get('page') || 1;
			const size = _this2.get('size') || 10;
			const name = _this2.get('name') || '';
			const model = _this2.model('shipper');
			const data = yield model.where({
				'name|code': ['like', `%${name}%`]
			}).order('sort_order ASC').page(page, size).countSelect();
			return _this2.success(data);
		})();
	}

	enabledStatusAction() {
		var _this3 = this;

		return _asyncToGenerator(function* () {
			const id = _this3.get('id');
			const status = _this3.get('status');
			let sale = 0;
			if (status == 'true') {
				sale = 1;
			}
			const model = _this3.model('shipper');
			yield model.where({
				id: id
			}).update({
				enabled: sale
			});
			return _this3.success();
		})();
	}

	updateSortAction() {
		var _this4 = this;

		return _asyncToGenerator(function* () {
			const id = _this4.post('id');
			const sort = _this4.post('sort');
			const model = _this4.model('shipper');
			const data = yield model.where({
				id: id
			}).update({
				sort_order: sort
			});
			return _this4.success(data);
		})();
	}

	infoAction() {
		var _this5 = this;

		return _asyncToGenerator(function* () {
			const id = _this5.get('id');
			const model = _this5.model('shipper');
			const data = yield model.where({
				id: id
			}).find();
			return _this5.success(data);
		})();
	}

	storeAction() {
		var _this6 = this;

		return _asyncToGenerator(function* () {
			if (!_this6.isPost) {
				return false;
			}
			const values = _this6.post();
			const id = _this6.post('id');

			const model = _this6.model('shipper');
			if (id > 0) {
				yield model.where({
					id: id
				}).update(values);
			} else {
				delete values.id;
				yield model.add(values);
			}
			return _this6.success(values);
		})();
	}

	destoryAction() {
		var _this7 = this;

		return _asyncToGenerator(function* () {
			const id = _this7.post('id');
			yield _this7.model('shipper').where({
				id: id
			}).limit(1).delete();
			return _this7.success();
		})();
	}

	freightAction() {
		var _this8 = this;

		return _asyncToGenerator(function* () {
			const model = _this8.model('freight_template');
			const data = yield model.where({
				is_delete: 0
			}).select();
			return _this8.success(data);
		})();
	}

	getareadataAction() {
		var _this9 = this;

		return _asyncToGenerator(function* () {
			let all = yield _this9.model('region').where({
				type: 1
			}).field('id,name').select();
			return _this9.success(all);
		})();
	}

	freightdetailAction() {
		var _this10 = this;

		return _asyncToGenerator(function* () {
			let id = _this10.post('id');

			const model = _this10.model('freight_template_group');
			let data = yield model.where({
				template_id: id,
				is_delete: 0,
				area: ['<>', 0]
			}).select();

			for (const item of data) {
				let area = item.area;
				if (item.free_by_money > 0) {
					item.freeByMoney = false;
				}
				if (item.free_by_number > 0) {
					item.freeByNumber = false;
				}
				let areaData = area.split(',');
				let info = yield _this10.model('region').where({
					id: ['IN', areaData]
				}).getField('name');
				item.areaName = info.join(',');
			}

			let defaultData = yield model.where({
				template_id: id,
				area: 0,
				is_delete: 0
			}).select();

			let freight = yield _this10.model('freight_template').where({
				id: id
			}).find();

			let info = {
				freight: freight,
				data: data,
				defaultData: defaultData
			};

			return _this10.success(info);
		})();
	}

	saveTableAction() {
		var _this11 = this;

		return _asyncToGenerator(function* () {
			let data = _this11.post('table');
			let def = _this11.post('defaultData');
			let info = _this11.post('info');
			let idInfo = []; // 是已存在的id。如果大于零，则去循环。等于零，则先将已存在的data删除，然后判断，1，data的length > 0.则，说明有新的数据
			for (const item of data) {
				if (item.id > 0) {
					idInfo.push(item.id);
				}
			}

			if (idInfo.length != 0) {
				let deleData = yield _this11.model('freight_template_group').where({
					id: ['NOTIN', idInfo],
					template_id: info.id,
					is_default: 0,
					is_delete: 0
				}).getField('id');

				for (const ele of deleData) {
					yield _this11.model('freight_template_detail').where({
						template_id: info.id,
						group_id: ele,
						is_delete: 0
					}).update({
						is_delete: 1
					});
				}

				let dbTable = yield _this11.model('freight_template_group').where({
					id: ['NOTIN', idInfo],
					template_id: info.id,
					is_default: 0,
					is_delete: 0
				}).update({
					is_delete: 1
				});

				for (const item of data) {
					let id = item.id; // 这个是group_id
					if (id > 0) {

						let template_id = info.id;

						let val = {
							area: item.area,
							start: item.start,
							start_fee: item.start_fee,
							add: item.add,
							add_fee: item.add_fee,
							free_by_money: item.free_by_money,
							free_by_number: item.free_by_number
						};
						yield _this11.model('freight_template_group').where({
							id: id,
							template_id: template_id,
							is_delete: 0
						}).update(val);

						// 这里要根据area去notin更新


						let area = item.area;
						let arr = area.split(',');

						yield _this11.model('freight_template_detail').where({
							area: ['NOTIN', arr],
							template_id: template_id,
							group_id: id
						}).update({
							is_delete: 1
						});
						for (const item of arr) {
							let e = yield _this11.model('freight_template_detail').where({
								template_id: template_id,
								area: item,
								group_id: id
							}).find();
							if (think.isEmpty(e)) {
								yield _this11.model('freight_template_detail').add({
									template_id: template_id,
									group_id: id,
									area: item
								});
							}
						}
					} else {
						let template_id = info.id;
						let area = item.area.substring(2);
						let val = {
							area: area,
							start: item.start,
							start_fee: item.start_fee,
							add: item.add,
							add_fee: item.add_fee,
							template_id: template_id,
							free_by_money: item.free_by_money,
							free_by_number: item.free_by_number
						};
						let groupId = yield _this11.model('freight_template_group').add(val);
						let areaArr = area.split(',');
						for (const item of areaArr) {
							yield _this11.model('freight_template_detail').add({
								template_id: template_id,
								group_id: groupId,
								area: item
							});
						}
					}
				}
			} else {
				// 这里前台将table全删除了，所以要将原先的数据都删除
				let dbTable = yield _this11.model('freight_template_group').where({
					template_id: info.id,
					is_default: 0,
					is_delete: 0
				}).update({
					is_delete: 1
				});
				// 将detail表也要删除！！！

				if (data.length != 0) {
					for (const item of data) {
						let area = item.area.substring(2);
						let template_id = info.id;
						let val = {
							area: area,
							start: item.start,
							start_fee: item.start_fee,
							add: item.add,
							add_fee: item.add_fee,
							template_id: template_id,
							free_by_money: item.free_by_money,
							free_by_number: item.free_by_number
						};
						let groupId = yield _this11.model('freight_template_group').add(val);
						//根据area 去循环一下另一张detail表
						let areaArr = area.split(',');
						for (const item of areaArr) {
							yield _this11.model('freight_template_detail').add({
								template_id: template_id,
								group_id: groupId,
								area: item
							});
						}
					}
				}
			}

			let upData = {
				start: def[0].start,
				start_fee: def[0].start_fee,
				add: def[0].add,
				add_fee: def[0].add_fee,
				free_by_money: def[0].free_by_money,
				free_by_number: def[0].free_by_number
			};

			yield _this11.model('freight_template_group').where({
				id: def[0].id,
				template_id: info.id,
				is_default: 1
			}).update(upData);

			// await this.model('freight_template_detail').where({
			//     group_id: def[0].id,
			//     template_id: info.id,
			// }).update(upData);


			let tempData = {
				name: info.name,
				package_price: info.package_price,
				freight_type: info.freight_type
			};

			yield _this11.model('freight_template').where({
				id: info.id
			}).update(tempData);
			return _this11.success();
		})();
	}

	addTableAction() {
		var _this12 = this;

		return _asyncToGenerator(function* () {
			let info = _this12.post('info');
			let data = _this12.post('table');
			let def = _this12.post('defaultData');
			// return false;
			let temp_id = yield _this12.model('freight_template').add(info);

			if (temp_id > 0) {
				let upData = {
					start: def[0].start,
					start_fee: def[0].start_fee,
					add: def[0].add,
					add_fee: def[0].add_fee,
					free_by_money: def[0].free_by_money,
					free_by_number: def[0].free_by_number,
					template_id: temp_id,
					is_default: 1
				};

				let groupId = yield _this12.model('freight_template_group').add(upData);
				if (groupId > 0) {
					yield _this12.model('freight_template_detail').add({
						template_id: temp_id,
						group_id: groupId,
						area: 0
					});
				}

				if (data.length > 0) {
					for (const item of data) {
						let area = item.area.substring(2);
						let template_id = temp_id;
						let info = {
							area: area,
							start: item.start,
							start_fee: item.start_fee,
							add: item.add,
							add_fee: item.add_fee,
							template_id: temp_id,
							free_by_money: item.free_by_money,
							free_by_number: item.free_by_number
						};
						let groupId = yield _this12.model('freight_template_group').add(info);
						let areaArr = area.split(',');
						for (const item of areaArr) {
							yield _this12.model('freight_template_detail').add({
								template_id: template_id,
								group_id: groupId,
								area: item
							});
						}
					}
				}
			}

			return _this12.success();
		})();
	}

	exceptareaAction() {
		var _this13 = this;

		return _asyncToGenerator(function* () {
			const model = _this13.model('except_area');
			const data = yield model.where({
				is_delete: 0
			}).select();

			for (const item of data) {
				let area = item.area;
				let areaData = area.split(',');
				let info = yield _this13.model('region').where({
					id: ['IN', areaData]
				}).getField('name');
				item.areaName = info.join(',');
			}

			return _this13.success(data);
		})();
	}

	exceptAreaDeleteAction() {
		var _this14 = this;

		return _asyncToGenerator(function* () {
			const id = _this14.post('id');
			yield _this14.model('except_area').where({
				id: id
			}).limit(1).update({
				is_delete: 1
			});
			yield _this14.model('except_area_detail').where({
				except_area_id: id
			}).update({
				is_delete: 1
			});
			return _this14.success();
		})();
	}

	exceptAreaDetailAction() {
		var _this15 = this;

		return _asyncToGenerator(function* () {
			let id = _this15.post('id');
			const model = _this15.model('except_area');
			let data = yield model.where({
				id: id,
				is_delete: 0
			}).find();
			// let areaData = {}
			let area = data.area;
			let areaData = area.split(',');
			let info = yield _this15.model('region').where({
				id: ['IN', areaData]
			}).getField('name');
			data.areaName = info.join(',');
			return _this15.success(data);
		})();
	}

	saveExceptAreaAction() {
		var _this16 = this;

		return _asyncToGenerator(function* () {
			let table = _this16.post('table');
			let info = _this16.post('info');
			let data = {
				area: table[0].area,
				content: info.content
			};
			yield _this16.model('except_area').where({
				id: info.id
			}).update(data);
			let area = table[0].area;
			let arr = area.split(',');
			yield _this16.model('except_area_detail').where({
				area: ['NOTIN', arr],
				except_area_id: info.id,
				is_delete: 0
			}).update({
				is_delete: 1
			});
			for (const item of arr) {
				let e = yield _this16.model('except_area_detail').where({
					except_area_id: info.id,
					area: item,
					is_delete: 0
				}).find();
				if (think.isEmpty(e)) {
					yield _this16.model('except_area_detail').add({
						except_area_id: info.id,
						area: item
					});
				}
			}
			return _this16.success();
		})();
	}

	addExceptAreaAction() {
		var _this17 = this;

		return _asyncToGenerator(function* () {
			let table = _this17.post('table');
			let info = _this17.post('info');
			let data = {
				area: table[0].area.substring(2),
				content: info.content
			};
			let id = yield _this17.model('except_area').add(data);
			let area = table[0].area.substring(2);
			let arr = area.split(',');
			for (const item of arr) {
				yield _this17.model('except_area_detail').add({
					except_area_id: id,
					area: item
				});
			}
			return _this17.success();
		})();
	}
};