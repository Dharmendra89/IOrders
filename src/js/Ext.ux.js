Ext.ns('Ext.ux.form');

Ext.override(Ext.Interaction, {controller: 'Main'});

Ext.override(Ext.List, {
	listeners: {
		itemtap: function(list, idx, item, e) {
			Ext.dispatch({action: 'onListItemTap', list: list, idx: idx, item: item, event: e});
		}
	}
});

/**
 * Scope указывает на панель, в которой лежит кнопка
 */
Ext.override(Ext.Button, {
	handler: function(btn, e) {

		Ext.dispatch({action: 'onButtonTap', view: this, btn: btn, event: e});
	}
});

Ext.override(Ext.form.Select, {
	onMaskTap: function() {

		if(this.disabled || this.disablePicker) {
			return;
		}

		this.showComponent();
	}
});

Ext.override(Ext.form.Toggle, {
	setValue: function(value) {
	
		value = (value === true || value === 1 ? 1 : 0);
		Ext.form.Toggle.superclass.setValue.call(this, value, this.animationDuration);
	
		var fieldEl = this.fieldEl;
	
		if(this.constrain(value) === this.minValue) {
			fieldEl.addCls(this.minValueCls);
			fieldEl.removeCls(this.maxValueCls);
		} else {
			fieldEl.addCls(this.maxValueCls);
			fieldEl.removeCls(this.minValueCls);
		}
	}
});


Ext.override(Ext.plugins.ListPagingPlugin, {
	
	onListUpdate: function() {
		
		var store = this.list.store;
		
		if( !this.rendered) {
			this.render();
		}
		
		if (!(store.pageSize && store.data.items.length % store.pageSize))
			this.el.appendTo(this.list.getTargetEl());
		else
			this.el.remove();
		
		if(!this.autoPaging) {
			this.el.removeCls('x-loading');
		}
		
		this.el.hide();
		this.loading = false;
	},
	
	onScrollEnd: function(scroller, pos) {
		if(pos.y >= Math.abs(scroller.offsetBoundary.top)) {
			this.loading = true;
			this.list.store.nextPage();
			this.el.show();
		}
	}
	
});


Ext.ux.form.ReadOnlyText = Ext.extend(Ext.form.Text, {
    readOnly: true,
    onRender: function() {
    	Ext.ux.form.ReadOnlyText.superclass.onRender.apply(this, arguments);
        this.fieldEl.dom.readOnly = true;
    }
});
Ext.reg('Ext.ux.form.readonlytextfield', Ext.ux.form.ReadOnlyText);

Ext.ux.form.TextWithButton = Ext.extend(Ext.ux.form.ReadOnlyText, {
    btnIconCls: '',
    useClearIcon: false,
    useBtnIcon: true,
    renderSelectors: {btnIconEl: '.x-field-btn',
            btnIconContainerEl: '.x-field-btn-container'},
    renderTpl: [
        '<tpl if="label">',
            '<div class="x-form-label"><span>{label}</span></div>',
        '</tpl>',
        '<tpl if="fieldEl">',
            '<div class="x-form-field-container"><input id="{inputId}" type="{inputType}" name="{name}" class="{fieldCls}"',
                '<tpl if="tabIndex">tabIndex="{tabIndex}" </tpl>',
                '<tpl if="placeHolder">placeholder="{placeHolder}" </tpl>',
                '<tpl if="style">style="{style}" </tpl>',
                '<tpl if="maxlength">maxlength="{maxlength}" </tpl>',
                '<tpl if="autoComplete">autocomplete="{autoComplete}" </tpl>',
                '<tpl if="autoCapitalize">autocapitalize="{autoCapitalize}" </tpl>',
                '<tpl if="autoCorrect">autocorrect="{autoCorrect}" </tpl> />',
            '<tpl if="useMask"><div class="x-field-mask"></div></tpl>',
            '</div>',
            '<tpl if="useBtnIcon"><div class="x-field-btn-container"><img class="x-field-btn x-hidden-visibility" src="{btnIconSrc}" class="x-icon-mask"></div></tpl>',
        '</tpl>'
    ],
    onRender : function() {
        Ext.apply(this.renderData, {useBtnIcon: this.useBtnIcon, btnIconSrc: this.btnIconSrc});                                
        Ext.ux.form.TextWithButton.superclass.onRender.apply(this, arguments);
    },
    initEvents: function() {
    	Ext.ux.form.TextWithButton.superclass.initEvents.apply(this, arguments);
        if (this.fieldEl && this.btnIconEl){
            this.mon(this.fieldEl, {
                paste: this.updateBtnIconVisibility,
                scope: this
            });
            this.mon(this.btnIconContainerEl, {
                scope: this.scope || this,
                tap: this.onBtnIconTap
            });
        }
    },
    onEnable: function() {
    	Ext.ux.form.TextWithButton.superclass.onEnable.apply(this, arguments);
        this.updateBtnIconVisibility();
    },
    afterRender: function() {
    	Ext.ux.form.TextWithButton.superclass.afterRender.call(this);
        this.updateBtnIconVisibility();
    },
    onBlur: function(e) {
    	Ext.ux.form.TextWithButton.superclass.onBlur.apply(this, arguments);
        this.updateBtnIconVisibility();
    },
    setValue: function() {
    	Ext.ux.form.TextWithButton.superclass.setValue.apply(this, arguments);
        this.updateBtnIconVisibility();
    },   
    onKeyUp: function(e) {
        this.updateBtnIconVisibility();
        Ext.ux.form.TextWithButton.superclass.onKeyUp.apply(this, arguments);
    },
    onBtnIconTap: Ext.emptyFn,
    updateBtnIconVisibility: function() {
        var value = this.getValue();
        if (!value) {
            value = '';
        }
        this.showBtnIcon();
        return this;
    },
    showBtnIcon: function() {
        if (!this.disabled && this.fieldEl && this.btnIconEl && !this.isBtnIconVisible) {
            this.isBtnIconVisible = true;
            this.btnIconEl.removeCls('x-hidden-visibility');
        }
        return this;
    },   
    hideBtnIcon: function() {
        if (this.fieldEl && this.btnIconEl && this.isBtnIconVisible) {
            this.isBtnIconVisible = false;
            this.btnIconEl.addCls('x-hidden-visibility');
        }
        return this;
    }
});
Ext.reg('Ext.ux.form.textwithbutton', Ext.ux.form.TextWithButton);

Ext.ux.form.Date = Ext.extend(Ext.ux.form.TextWithButton, {
	btnIconSrc: '../senchaTouch/resources/themes/images/default/pictos/locate.png',
	onBtnIconTap: function(event, img) {
		Ext.dispatch({
			controller: 'Main',
			action: 'onDatePickerTap',
			img: img,
			event: event,
			dateField: this
		});
	}
});
Ext.reg('Ext.ux.form.Date', Ext.ux.form.Date);

/**
 * iCalendar like date picker component.
 *
 * @cfg {Date} value Initially selected date (default is today)
 * @cfg {String[]} days Day names.
 * @cfg {String[]} months Month names.
 * @cfg {Number} weekstart Starting day of the week. (1 for monday, 7 for sunday)
 * @cfg {Date} minDate The lowest selectable date.
 * @cfg {Date} maxDate The highest selectable date.
 */
Ext.ux.DatePicker = Ext.extend(Ext.Panel, {

        days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], 
        cls: 'ux-date-picker',
        minDate: null,
        maxDate: null,
        autoHeight: true,

        /**
         * Create new date picker.
         */
        constructor: function(config) {

                Ext.apply(this, config || {}, {
                        value: new Date(),
                        weekstart: 1
                });


                this.addEvents('refresh', 'change');

                Ext.ux.DatePicker.superclass.constructor.call(this, config);

                this.minDate = this.minDate ? this.minDate.clearTime(true) : null;
                this.maxDate = this.maxDate ? this.maxDate.clearTime(true) : null;
        },

        /**
         * Set selected date.
         * @cfg {Date} v Date to select.
         */
        setValue: function(v) {
                if (Ext.isDate(v)) {
                        this.value = v;
                } else {
                        this.value = null;
                }

                this.refresh();
        },

        /**
         * Get selected date.
         * @return {Date} Selected date.
         */
        getValue: function() {
                return this.value;
        },

        onRender: function(ct, position) {
                Ext.ux.DatePicker.superclass.onRender.apply(this, arguments);

                this.refresh();

                // handle events
                this.body.on("click", function(e, t) {
                        t = Ext.fly(t);

                        if (!t.hasCls('unselectable')) {
                                this.setValue(this.getCellDate(t));
                                this.fireEvent('change', this, this.getCellDate(t));
                        }
                }, this, {delegate: 'td'});

                this.body.on("click", function(e, t) {
                        t = Ext.fly(t);

                        if (t.hasCls("goto-prevmonth")) {
                                this.loadMonthDelta(-1);
                        }

                        if (t.hasCls("goto-nextmonth")) {
                                this.loadMonthDelta(1);
                        }
                }, this, {delegate: 'th'});
        },

        refresh: function() {
                var d = this.value || new Date();
                this.body.update(this.generateCalendar(d.getMonth(), d.getFullYear()));
                // will force repaint() on iPod Touch 4G
                this.body.getHeight();

                this.setToday();
                if (this.value) {
                        this.setSelected(this.value);
                }

                this.fireEvent('refresh');
        },

        dayMarkup: function(format,day,month,year,column) {
                var classes = ['day'];
                if (format === 0) {
                        classes.push('prevmonth');
                } else if (format == 9) {
                        classes.push('nextmonth');
                }

                if (column === 0 || column == 6) {
                        classes.push('weekend');
                }

                var datetime = year + '-' + (month + 1) + '-' + day;
                var date = new Date(year, month, day);

                if ((this.minDate && date < this.minDate) || (this.maxDate && date > this.maxDate)) {
                        classes.push('unselectable');
                }

                var this_day = '<td class="' + classes.join(' ') + '" datetime="' + datetime + '">';
                this_day += day;
                this_day += '</td>';

                return this_day;
        },

        monthLength: function(month, year) {
                var dd = new Date(year, month, 0);
                return dd.getDate();
        },

        monthMarkup: function(month, year) {
                var c = new Date();
                c.setDate(1);
                c.setMonth(month);
                c.setFullYear(year);

                var x = parseInt(this.weekstart, 10);
                var s = (c.getDay() - x) % 7;
                if (s < 0) {
                        s += 7;
                }

                var dm = this.monthLength(month, year);

                var this_month = '<table cellspacing="0"><thead><tr>';

                this_month += '<th class="goto-prevmonth">' + this.days[(0+x)%7]+'</th>';
                this_month += '<th>' + this.days[(1+x)%7]+'</th>';
                this_month += '<th>' + this.days[(2+x)%7]+'</th>';
                this_month += '<th><span>' + this.months[month] + ' ' + year + '</span>' + this.days[(3+x)%7] + '</th>';
                this_month += '<th>' + this.days[(4+x)%7]+'</th>';
                this_month += '<th>' + this.days[(5+x)%7]+'</th>';
                this_month += '<th class="goto-nextmonth">' + this.days[(6+x)%7]+'</th>';
                this_month += '</tr>';
                this_month += '</thead>';

                this_month += '<tbody>';
                this_month += '<tr>';

                for ( var i=s; i>0; i-- ) {
                        var this_y = (month-1)<0?year-1:year;
                        this_month += this.dayMarkup(0, dm-i+1 , (month+11)%12, this_y, (s-i+x)%7);
                }

                dm = this.monthLength(month+1,year);
                for(i = 1; i <= dm; i++) {
                        if ( (s%7) === 0 ) {
                                this_month += '</tr>';
                                this_month += '<tr>';
                                s = 0;
                        }
                        this_month += this.dayMarkup(1, i , month, year, (s+x)%7);
                        s++;
                }

                var j = 1;
                for (i = s; i < 7; i++ ) {
                         this_y = (month+1)>11?year+1:year;
                         this_month += this.dayMarkup(9, j , (month+1)%12, this_y, (i+x)%7);
                         j++;
                 }

                this_month += '</tr>';
                this_month += '</tbody>';
                this_month += '</table>';

                //this_month += '<tfoot><tr><th colspan="7">&nbsp;</th></tr></tfoot>';

                return this_month;
        },

        generateCalendar: function(month, year) {
                return this.monthMarkup(month, year);
        },

        getCellDate: function(dateCell) {
                var date = dateCell.dom.getAttribute('datetime');
                return this.stringToDate(date);
        },

        stringToDate: function(dateString) {
                var a = dateString.split('-');
                return new Date(Number(a[0]), (a[1]-1), Number(a[2]));
        },

        dateToString: function(date) {
                return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
        },

        removeSelectedCell: function() {
                this.body.select('.selected').removeCls('selected');
        },

        setToday: function() {
                var date = new Date();
                this.body.select('td[datetime="' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '"]').addCls('today');
        },

        sameDay: function(date1, date2) {
                return (date1.getDate && date2.getDate) && date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear();
        },

        setSelected: function(date) {
                this.removeSelectedCell();
                
                this.body.select('td').each(function(td) {
                        var clickedDate = this.getCellDate(td);
                        if (!td.hasCls("prevmonth") && !td.hasCls("nextmonth") && this.sameDay(date, clickedDate)) {
                                td.addCls('selected');
                        }
                }, this);

                this.setToday();
        },

        loadMonthDelta: function(delta) {
                var day;

                var selected = this.body.down('.selected');
                if (selected) {
                        day = this.stringToDate(selected.dom.getAttribute('datetime')).getDate();
                } else {
                        day = new Date().getDate();
                }

                var v = this.value || new Date();

                var newDay = new Date(v.getFullYear(), v.getMonth() + delta, day);

                if (this.minDate && newDay.getLastDateOfMonth() < this.minDate) {
                        return;
                }

                if (this.maxDate && newDay.getFirstDateOfMonth() > this.maxDate) {
                        return;
                }

                if (this.minDate && newDay < this.minDate) {
                        newDay = this.minDate.clone();
                }

                if (this.maxDate && newDay > this.maxDate) {
                        newDay = this.maxDate.clone();
                }

                this.setValue(newDay);
        }
});
Ext.reg('Ext.ux.DatePicker', Ext.ux.DatePicker);