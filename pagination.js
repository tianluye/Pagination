!(function($) {
    var ulHtml = `<ul class="pagination"></ul>`;
    var spanHtml = `<span class="page-total">`
                   + `到第<input class="page-skip" value="1">/&nbsp;&nbsp;<span></span>&nbsp;&nbsp;页  `
                   + `<button type="button" class="page-btn">确定</button>`
                   + `</span>`;
    $.widget('ui.pagination', {
        options: {
            /**
             * @cfg {Number} perPage 每个分页展示的记录数
            */
            perPage: 0,
            /**
             * @cfg {Number} totalRecords 总的数据量，分页数 = Math.ceil(totalRecords / perPage)
            */
            totalRecords : 0,
            /**
             * @cfg {Number} curr 初始化完成，默认展示的当前页码
            */
            curr : 1,
            /**
             * @cfg {String} selectedColor 当前页码展示的颜色
            */
            selectedColor : '#1E9FFF',
            /**
             * @cfg {Function} jump 改变页码后的回调
             * @param {Object} e
             * @param {Number} curr 改变后的页码
             * @param {Number} perPage 每个分页展示的记录数
            */
            jump : null,
            /**
             * @cfg {Function} create 实例创建后的回调函数
             * @param {Object} e
             * @param {Object} createEventData
            */
            create: null
        },
        _create: function() {
            console.log('--- create ---');
            // 包装节点
            this.element.empty().append(ulHtml).append(spanHtml).addClass('ui-pagination');
            
            this.$ul = this.element.find('ul');
            
            this._initPage();
            this._delegateEvent();
        },
        /**
            控件第一次初始化的时候，会执行 this._trigger( "create", null, this._getCreateEventData() );
        */
        _getCreateEventData: function() {
            console.log('--- getCreateEventData ---');
            return '_create()方法执行完，返回自定义的值给 options.create(null, xxx)做第二个参数';
        },
        _init: function() {
            console.log('--- init ---');
        },
        _setOptions: function(options) {
            for (var key in options) {
                this._setOption(key, options[key]);
            }
            return this;
        },
        _setOption: function (key, value) {
            // 调用 Widget原型上的 _setOption方法设置参数
            $.Widget.prototype._setOption.apply(this, arguments);
            // 分页就不再去支持 disable、enable两个方法了
            return this;
        },
        _getDefaultPerPage: function() {
            return 10;
        },
        /**
            根据 options，对分页进行 dom初始化操作
        */
        _initPage: function() {
            console.log('--- start init pagination ---');
            this.$ul.empty();

            // 当 options中每页记录数不是数字或者小于等于 0，取默认值 10
            this.options.perPage = +this.options.perPage;
            if (!$.isNumeric(this.options.perPage) || this.options.perPage <= 0) {
                this.options.perPage = this._getDefaultPerPage();
            }
            var perPage = this.options.perPage;

            // 当 options中总记录数不是数字或者小于等于 0，抛出异常
            this.options.totalRecords = +this.options.totalRecords;
            if (!$.isNumeric(this.options.totalRecords) || this.options.totalRecords <= 0) {
                throw new Error('totalRecords can not be empty and must more than zero.');
            }
            var totalRecords = this.options.totalRecords;

            var totalPages = Math.ceil(totalRecords / perPage);
            this.totalPages = totalPages;
            // 若只有不到一页的数据，则不展示分页控件
            if(perPage >= totalRecords) {
                this.element.hide();
                // 虽然不展示，但是事件还是需要被触发的
                this._trigger('jump', null, 1, perPage);
                return;
            }

            this.element.find('span > span').text(this.totalPages);
            
            this.$ul.append('<li class="previous" title="上一页" value="previous"><a href="javascript: void(0)">上一页</a></li>');
            this.$ul.append('<li class="start" title="首页" value="start"><a href="javascript: void(0)">首页</a></li>');
            this.$ul.append('<li class="skeletonize disabled"><a href="javascript: void(0)">...</a></li>');
            for(var i = 1; i <= totalPages; i++) {
                this.$ul.append('<li class="number" title=' + i + ' value=' + i + '><a href="javascript:void(0);">&nbsp;' + i + '&nbsp;</a></li>');
            }
            this.$ul.append('<li class="skeletonize disabled"><a href="javascript:void(0);">...</a></li>');
            this.$ul.append('<li class="end" title="末页" value="end"><a href="javascript:void(0);">末页</a></li>');
            this.$ul.append('<li class="next" title="下一页" value="next"><a href="javascript:void(0);">下一页</a></li>');
            
            // 得到数据后初始化操作，即默认展示第一页
            this._changePage(this.options.curr);
            return this;
        },
        /**
        * 绑定事件
        */
        _delegateEvent: function() {
            var _this = this;
            this._on(this.element, {
                'click li:not(.skeletonize)': '_clickPage',
                'click .page-btn': '_pageSkip',
                'keyup': '_onKeyUp'
            });
        },
        _clickPage: function(e, curr) {
            // 获取点击的是哪一个分页按钮
            curr = curr || $(e.currentTarget).attr('value');
            switch (curr) {
                case 'previous':
                    this._changePage(this.options.curr - 1);
                    break;
                case 'start':
                    this._changePage(1);
                    break;
                case 'next': 
                    this._changePage(this.options.curr + 1);
                    break;
                case 'end':
                    this._changePage(this.totalPages);
                    break;
                default:
                    this._changePage(+curr);
                    break;
            }
        },
        _pageSkip: function() {
            var value = this.element.find(".page-skip").val();
            if("" === value) {
                return;
            }
            this._changePage(+value);
        },
        _onKeyUp: function(e) {
            if (e.keyCode === $.ui.keyCode.ENTER) {
                this._pageSkip();
            }
        },
        _changePage: function(currNum) {
            currNum = +currNum;
            if (!$.isNumeric(currNum) || currNum > this.totalPages) {
                console.log('More than the limit page.');
                return;
            }
            this.element.find(".number").addClass('hide');
            // 点击的是第一页
            if(currNum == 1) {
                this.element.find('.previous').addClass('hide').end()
                            .find(".start").addClass('hide').end()
                            .find(".skeletonize:eq(0)").addClass('hide').end()
                            .find(".next").removeClass('hide');
                if(this.totalPages > 5) {
                    this.element.find(".end").removeClass('hide').end()
                                .find(".skeletonize:eq(1)").removeClass('hide');
                }
                var tmpNum = this.totalPages > 5 ? 5 : this.totalPages;
                for (var i = 0; i < 5; i++) {
                    this.element.find(".number:eq(" + i + ")").removeClass('hide');
                }
            } else { 
                if (currNum < 5) { // 2 - 4
                    this.element.find(".number:eq(0)").removeClass('hide').end()
                                .find(".number:eq(1)").removeClass('hide').end()
                                .find(".number:eq(2)").removeClass('hide').end()
                                .find(".number:eq(3)").removeClass('hide').end()
                                .find(".number:eq(4)").removeClass('hide').end()
                                .find('.previous').removeClass('hide').end()
                                .find(".start").addClass('hide').end()
                                .find(".skeletonize:eq(0)").addClass('hide').end()
                                .find(".next").removeClass('hide');
                    if(this.totalPages > 5) {
                        this.element.find(".end").removeClass('hide').end()
                                    .find(".skeletonize:eq(1)").removeClass('hide');
                    }
                } else { // currNum >= 5
                    if (this.totalPages - currNum === 0) {
                        this.element.find(".skeletonize:eq(1)").addClass('hide').end()
                                    .find(".end").addClass('hide').end()
                                    .find(".next").addClass('hide');
                        for (var i = 1; i <= 5; i++) {
                            this.element.find(".number:eq(" + (currNum - i) + ")").removeClass('hide');
                        }
                    } else if (this.totalPages - currNum <= 2) {
                        this.element.find(".skeletonize:eq(1)").addClass('hide').end()
                                    .find(".end").addClass('hide').end()
                                    .find(".next").removeClass('hide');
                        for (var i = 1; i <= 5; i++) {
                            this.element.find(".number:eq(" + (this.totalPages - i) + ")").removeClass('hide');
                        }
                    } else {
                        this.element.find(".skeletonize:eq(1)").removeClass('hide').end()
                                    .find(".end").removeClass('hide').end()
                                    .find(".next").removeClass('hide');
                        var tmpNum = currNum - 1;
                        for (var i = 0; i < 3; i++) {
                            this.element.find(".number:eq(" + (tmpNum - i) + ")").removeClass('hide').end()
                                        .find(".number:eq(" + (tmpNum + i) + ")").removeClass('hide');
                        }
                    }
                    this.element.find('.previous').removeClass('hide').end()
                            .find(".start").removeClass('hide').end()
                            .find(".skeletonize:eq(0)").removeClass('hide').end();
                }
            }
            this.element.find("li").find('a').css('backgroundColor', '#fff').end().end()
                        .find(".number:eq(" + (currNum - 1) + ")").find('a')
                        .css('backgroundColor', this.options.selectedColor);
            this.element.find(".page-skip").val(currNum);
            this.options.curr = currNum;
            // 执行回调函数，当前页码作为参数
            this._trigger('jump', null, this.options.curr, this.options.perPage);
        },
        showPage: function(curr) {
            this._clickPage(null, curr);
        },
        allRecords: function(total) {
            if (arguments.length === 0) {
                return this.options.totalRecords;
            }
            if (!$.isNumeric(+total)) {
                return;
            }
            this.option('totalRecords', total);
            return this._initPage();
        },
        perPage: function(per) {
            if (arguments.length === 0) {
                return this.options.perPage;
            }
            if (!$.isNumeric(+per)) {
                return;
            }
            this.option('perPage', per);
            return this._initPage();
        }
    });
})(jQuery)