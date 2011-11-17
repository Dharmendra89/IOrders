var NumericKeyboard = Ext.extend(Ext.Panel, {

	cls: 'x-keyboard',
	floating: true,
	//enter: 'down',
	
	listeners: {
		hide: function() {
			this.onConfirmButtonTap('cancel', this.field.getValue() || '');
		}
	},
	renderSelectors: {
		field: 'input.keyboard-value'
	},
	renderTpl: [
		'<div class="{baseCls}-body<tpl if="bodyCls"> {bodyCls}</tpl>"<tpl if="bodyStyle"> style="{bodyStyle}"</tpl>>',
			'<div class="x-form-field-container"><input class="keyboard-value" value="{value}"/><div class="x-field-mask"></div></div>',
			'<div class="keyboard-button-line">',
				'<div class="x-button">1</div>',
				'<div class="x-button">2</div>',
				'<div class="x-button">3</div>',
			'</div>',
			'<div class="keyboard-button-line">',
				'<div class="x-button">4</div>',
				'<div class="x-button">5</div>',
				'<div class="x-button">6</div>',
			'</div>',
			'<div class="keyboard-button-line">',
				'<div class="x-button">7</div>',
				'<div class="x-button">8</div>',
				'<div class="x-button">9</div>',
			'</div>',
			'<div class="keyboard-button-line">',
				'<div class="x-button">0</div>',
				'<div class="x-button">.</div>',
				'<div class="x-button">C</div>',
			'</div>',
			'<div class="keyboard-button-line">',
				'<div class="x-button">OK</div>',
				'<div class="x-button">Отмена</div>',
			'</div>',
		'</div>'
	],

	setPos : function(update) {
        if (this.rendered && update) {
            var x, y,
				el = !this.ownerCt ? Ext.Element : this.ownerCt
			;
			
            x = el.getViewportWidth() - this.getWidth() - 10;
            y = el.getViewportHeight() - this.getHeight() - 150;
			
            this.setPosition(x, y);
        }
		
        return this;
    },

    onShow: function() {

    	NumericKeyboard.superclass.onShow.apply(this, arguments);
    	//this.setPos(true);
    },

	onRender: function() {

		Ext.apply(this.renderData, {value: this.value});
		NumericKeyboard.superclass.onRender.apply(this, arguments);

		this.getTargetEl().addListener('tap', this.onButtonTap, this, {delegate: '.x-button'});
	},

	onButtonTap: function(evt, el, o) {

		var value = this.field.getValue() || '',
			oper = el.innerText
		;

		switch(oper) {
			case 'C' : {
				this.setValue(value.substring(0, value.length - 1));
				break;
			}
			case '?' : {
				break;
			}
			case 'OK' : {
				this.onConfirmButtonTap('ok', value);
				this.hide();
				break;
			}
			case 'Отмена' : {
				this.onConfirmButtonTap('cancel', value);
				this.hide();
				break;
			}
			default: {
				this.setValue(value + oper);
				this.value = value + oper;
			}
		}
	},

	setValue: function(value) {

		this.field.set({value: value || ''});
	}
});
Ext.reg('numkeyboard', NumericKeyboard);