var testData = {
	Warehouse: {
		data: [{
			id: 1,
			name: 'Север'
		}, {
			id: 2,
			name: 'Юг'
		}, {
			id: 3,
			name: 'Восток'
		}]
	},
	Customer: {
		data: [{
			id: 1,
			name: 'ИП',
			address: 'Москва',
			warehouse: 1,
			partner: 'вфыв'
		}]
	},
	SaleOrder: {
		data: [{
			id: 1,
			date: '20.09.2011',
			isWhite: true,
			incassNeeded: true,
			customer: 1,
			totalPrice: '0'
		}]
	},
	Category: {
		data: [{
			id: 1,
			name: 'Консервы',
			ord: 1,
			packageName: 'Коробка',
			totalPrice: '0'
		}, {
			id: 2,
			name: 'Консервы2',
			ord: 1,
			packageName: 'Коробка',
			totalPrice: '0'
		}]
	},
	Offer: {
		data: [{
			id: 1,
			name: 'Мясные консервы. Говядина',
			firstName: 'Мясные',
			factor: 2,
			rel: 12,
			category: 1,
			price: 22.22,
			customer: 1
		}, {
			id: 2,
			name: 'Говядина',
			firstName: 'Мясные',
			factor: 2,
			rel: 12,
			category: 2,
			price: 22.22,
			customer: 1
		}]
	}
};