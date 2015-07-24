(function($){

    var AppUtils = { //вспомогашки
        hasClass: function(el, cls) {
            return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
        },
        uniqueArr: function(arr) {
            var prevItem;
            return arr.filter(function(item, index){
                if (prevItem && prevItem === item) {
                    return;
                }
                prevItem = item;
                return item;
            })
        },
        concatObj: function(arr) {
            var obj = {};
            arr.forEach(function(item){
                for (var i in item) {
                    obj[i] = item[i];
                }
            });
            return obj;
        }
    };


    /**** Filter components ****/
    var PriceFilter = { //фильтр цены
        init: function(controller) {
            this.controller = controller;
            this.filterName = 'cost';
            this.state = {};
            this.defaultRange = [];
            this.viewInit();
            this.lockChange = false;
        },
        getState: function() {
          return  this.state;
        },
        getStateRaw: function() {
            if (!this.state[this.filterName]) return;
            var rawObj = {};
            rawObj[this.filterName] = [{'0':this.state[this.filterName][0]+'-'+this.state[this.filterName][1]}];
            return rawObj;
        },
        isName: function(name) {
          return  this.filterName === name;
        },
        updateState: function(data) {
            this.state[this.filterName] = data;
            this.controller.updateFilters();
        },
        removeFilter: function(data) {
            this.state = {};
            this.render();
        },
        resolveConflict: function(priceRange) { //проверка и исправление на - текущая выборка цены выходит за границы новых доступных цен
            var currentRange = this.state[this.filterName];
            if (currentRange && priceRange) {
                this.state[this.filterName][0] = (currentRange[0] < priceRange[0] || currentRange[0] > priceRange[1]) ? priceRange[0]:currentRange[0];
                this.state[this.filterName][1] = (currentRange[1] > priceRange[1]) ? priceRange[1]:currentRange[1];
                if (this.state[this.filterName][0] === priceRange[0] &&  this.state[this.filterName][1] === priceRange[1]) {
                    this.state = {};
                    return priceRange;
                }
                return this.state[this.filterName];
            } else {
                return priceRange;
            }

        },
        setLock: function(flag) {
            this.lockChange = flag;
        },
        isLock: function() {
          return this.lockChange;
        },
        getRangeData: function() {
            return this.controller.getFilterRenderData(this.filterName);
        },
        viewInit: function() {
            this.view = {};
            this.view.priceFilter = $("#price-slider");
            this.view.priceFilter
                .slider({
                    min: 0,
                    max: $('#maxcost').data('max'),
                    range: true,
                    values: [0, $('#maxcost').data('max')],
                    change: function( event, ui ) {
                    },
                    slide: function( event, ui ) {
                        $('#mincost').val(ui.values[0]);
                        $('#maxcost').val(ui.values[1]);
                    }
                }).slider("float");

            this.view.priceFilter.on( "slidechange", function( event, ui ) {
                if (!this.isLock()) {
                    this.updateState([ui.values[0],ui.values[1]]);
                }
            }.bind(this));
        },
        render: function() {
            var priceData = this.getRangeData();
            var currentValue = this.resolveConflict(priceData);
            this.setLock(true);
            (priceData && priceData instanceof Array)
                && this.view.priceFilter.slider("option","values",[currentValue[0],currentValue[1]]).slider("option", "min", priceData[0]).slider("option", "max", priceData[1]).slider("pips").slider("float");
            this.setLock(false);
        }
    };

    var CheckboxFilter = { //фильтры типа чекбокс (коллекции,...,размеры)
        init: function(controller) {
            this.controller = controller;
            this.filterName = [];
            this.activeCheckboxes = {};
            this.viewInit();
        },
        addFilterName: function(name) {
            this.filterName.push(name);
        },
        getState: function() {
            var stateObj = {};
            for (var group in this.activeCheckboxes) {
                stateObj[group] = [];
                this.activeCheckboxes[group].forEach(function(item){
                    for (var val in item) {
                        stateObj[group].push(val);
                    }
                })
            }
            return stateObj;
        },
        getStateRaw: function() {
            return this.activeCheckboxes;
        },
        isName: function(name) {
            return (this.filterName.join(',').indexOf(name) > -1);
        },
        removeFilter: function(data){
            this.renderCheckboxes(data);
            this.removeActiveCheckbox(data);
        },
        updateActiveCheckbox: function(data) {
            if (data.checked) {
                this.addActiveCheckbox(data);
            } else {
                this.removeActiveCheckbox(data);
            }
            this.controller.updateFilters();
        },
        addActiveCheckbox: function(data) {
            if (!this.activeCheckboxes[data.type]) {
                this.activeCheckboxes[data.type] = [];
            }
            var objValue = {};
            objValue[data.value] = data.label;
            this.activeCheckboxes[data.type].push(objValue);
        },
        removeActiveCheckbox: function(data) {
            var indexToDelete;
            var typeFilter = this.activeCheckboxes[data.type];
            for (var i = typeFilter.length - 1 ; i >= 0; i--) {
                if (data.value in typeFilter[i]) {
                    indexToDelete = i;
                    break;
                }
            }
            typeFilter.splice(indexToDelete, 1);
            !typeFilter.length && delete this.activeCheckboxes[data.type];
        },
        getAvailableCheckboxes: function() {
            return this.controller.getFilterRenderData(this.filterName)
        },
        viewInit: function() {
            var self = this;
            this.view = {};
            this.view.checkoxFilters = $('.block .list input[type=checkbox], .square_sizes .squaresize');

            this.view.checkoxFilters.each(function(){
                var filterName = $(this).data('filter');
                filterName && self.addFilterName(filterName);
            });
            this.filterName = AppUtils.uniqueArr(this.filterName);

            this.view.checkoxFilters.on('change', function(event){
                var $item = $(this);
                self.updateActiveCheckbox({type: $item.data('filter'),value: parseInt($item.data('value')), checked: $item.is(':checked'), label: $item.closest('label').text()});
            });
        },
        render: function() { //рендер доступных чекбоксов
            var $li;
            var filtersData = this.getAvailableCheckboxes();

            for (var filter in filtersData) {
                this.view.checkoxFilters.filter('[data-filter=' + filter + ']').each(function () {
                    var $item = $(this);
                    $li = $item.closest('li');
                    if (filtersData[filter].indexOf($item.data('value')) > -1) {
                        $li.show();
                    } else {
                        $li.hide();
                    }
                });
            }
            $('.block .nano-scroll').nanoScroller();
            $('.block.folding').trigger('update');
        },
        renderCheckboxes: function(data) { //рендер состояния чекбоксов
            if (data && data instanceof Object) {
                this.view.checkoxFilters.filter('[data-filter='+data.type+'][data-value='+data.value+']').prop('checked',false).trigger('refresh');
            }/* else {
                for (var i in this.activeFilters) {
                    this.checkoxFilters.filter('[data-filter=' + i + ']').each(function () {
                        $(this).prop('checked', false).trigger('refresh');
                    });
                }
            }*/
        }
    };

    /**** Filters controller ****/
    var Filters = { //контроллер фильтров
        init: function(manager, viewFilters) {
            this.manager = manager;
            this.components = [];
            this.viewFilters = viewFilters;
            this.activeFilters = {};
            this.responseData = {};
            this.view();
        },
        addComponent: function(component) {
            this.components.push(component);
            component.init(this);
        },
        getComponentByName: function(name) {
            var findedComponent;
            this.components.forEach(function(component){
                if (component.isName(name)) {
                    findedComponent = component;
                }
            });
            return findedComponent;
        },
        sendMessage: function(type) {
            this.manager.getMessage(type);
        },
        getMessage: function(type, data) {
          switch (type) {
              case 'newData' :
                  this.responseData = data.filters;
                  this.renderComponents();
                  this.render();
                  break;
          }
        },
        getState: function() {
            var stateArr = [];
            this.components.forEach(function(component){
                stateArr.push(component.getState());
            });
            return AppUtils.concatObj(stateArr);
        },
        updateFilters: function() {
            this.sendMessage('filtersChange');
        },
        getFilterRenderData: function(filter) {
            var obj = {};
            if (filter) {
                if (filter instanceof  Array) {
                    filter.forEach(function (item) {
                        this.responseData[item] && (obj[item] = this.responseData[item]);
                    }.bind(this));
                    return obj;
                } else {
                    return this.responseData[filter] ? this.responseData[filter] : undefined;
                }
            }
        },
        view: function() {
            this.viewFilters.init(this);
        },
        render: function() {
            this.viewFilters.render();
        },
        getViewData: function() {
            var viewData = [];
            this.components.forEach(function(component){
                viewData.push(component.getStateRaw());
            });
            return AppUtils.concatObj(viewData);
        },
        renderComponents: function() {
            this.components.forEach(function(component){
                component.render();
            });
        },
        removeActiveFilter: function(data){ //filterName, value
            this.getComponentByName(data.type).removeFilter(data);
            this.updateFilters();
        }
    };

    var FiltersView = { //линки активных фильтров
        init: function(controller) {
            this.controller = controller;
            this.view();
        },
        deleteLink: function(data) {
            if (data instanceof Object) {
                this.controller.removeActiveFilter(data);
            }
        },
        view: function() {
            this.self = document.getElementById('itemsfilterresult');
            this.$self = $(this.self);
            this.linkClass = 'filter_item';
            this.tpl  = '<div class="'+this.linkClass+'" data-filter="{type}" data-value="{value}">{lbl}</div>';

            this.self.addEventListener('click',function(event){
                var elData = event.target.dataset;
                AppUtils.hasClass(event.target, this.linkClass) && this.deleteLink({type: elData.filter, value: elData.value});
            }.bind(this), false);
        },
        renderTpl: function(data) {
            var replaceTpl = this.tpl;
            for (var i in data) {
                replaceTpl = replaceTpl.replace('{'+i+'}',data[i]);
            }
            return replaceTpl;
        },
        render: function() {
            var filters = this.controller.getViewData(),//{filterName: [{value:label},...],filterName: [...]}
                filtersHtml = '';

            for (var filter in filters) {
                filters[filter].forEach(function(values){
                    for (var value in values) {
                        filtersHtml += this.renderTpl({type: filter, value: value, lbl: values[value]});
                    }
                }.bind(this));

            }
            this.$self.html(filtersHtml);
        }
    };

    /*** sort options ***/
    var ShowOptions = { //показать по, сортировать по и пагинация
        init: function(manager) {
            this.manager = manager;
            this.state = {};
            this.responseData = {};
            this.view();
        },
        getState: function() {
            return this.state;
        },
        sendMessage: function(type) {
            this.manager.getMessage(type);
        },
        getMessage: function(type, data) {
            switch (type) {
                case 'newData' :
                    this.responseData = data.pageswitch;
                    this.render();
                    break;
            }
        },
        setState: function(data, isUpdate) {
            this.state[data.type] = data.value;
            this.setViewMode(data);
            isUpdate && this.sendMessage('filtersChange');
        },
        setViewMode: function(data) {
            if (data.type === 'items_per_page')
                this.manager.setViewMode(data.value);
        },
        getPager: function() {
            return this.responseData;
        },
        view: function() {
            var self = this;
            this.view = {};
            this.view.pager = $('.pageswitch');
            this.view.select = $('.itemsfilter__item select');
            this.view.select.each(function(){
                var $select = $(this);
                self.setState({type: $select.data('type'), value: $select.val()});
            });
            this.view.select.on('change', function(){
                var $select = $(this);
                self.setState({type: $select.data('type'), value: $select.val()}, true);
            });
        },
        render: function() {
            if (this.getState()["items_per_page"] === 'all') {
                this.view.pager.hide();
            } else {
                this.view.pager.show();
                var pager = this.getPager();
                this.view.pager.html(pager);
            }
        }
    };

    var Goods = {
        init: function(manager) {
            this.manager = manager;
            this.view();
        },
        view: function() {
            this.view = {};
            this.view.container = $('.itemlist');
        },
        getPage: function() {
          return this.manager.getPage();
        },
        getGoods: function() {
            return this.manager.getGoods();
        },
        render: function() {
            var page = this.getPage(),
                html = this.getGoods();
            if (page > 1) {
                this.view.container.append(html);
            } else {
                this.view.container.html(html);
            }
        }
    };

    /*** Catalog manager ***/
    var CatalogManager = (function() {//контроллер всего каталога
        var catalogComponents = [],
            paramToPost = '',
            viewMode = '',
            viewGoods = {},
            pageToView = 1,
            $GoodsBlock,
            lastData = {},
            currentXhr = null;

        function init(oGoods, components) {
            viewGoods = oGoods;
            catalogComponents = components;
            viewScroll();
        }

        function setViewMode(type) {
            viewMode = type;
        }

        function getPage() {
            return pageToView;
        }

        function getGoods() {
            return lastData.items;
        }

        function addToParam() {
            var params;
            for (var i = 0, argLngt = arguments.length; i < argLngt; i++) {
                params = arguments[i];
                if (params instanceof Object) {
                    for (var key in params) {
                        paramToPost += key + '=' + (params[key] instanceof Array ? params[key].join(',') : params[key]) + '&';
                    }
                }
            }
        }

        function getParam() {
            paramToPost = '';
            catalogComponents.forEach(function(component){
                addToParam(component.getState());
            });
            addToParam({actpage: pageToView});
            return paramToPost.substring(0, paramToPost.length - 1);
        }

        function sendFilters(callback) {
            if (currentXhr && currentXhr.readyState != 4) {
                currentXhr.abort();
            }
            //if (!getAjaxStatus()) {
                this.currentXhr = $.ajax('../../source/back/catalogue.html?' + getParam(), {///ajax/catalogue.html?  '../../source/back/catalogue.html?'
                    cache: false,
                    type: 'get',
                    dataType: 'json',
                    beforeSend: function (xhr, setting) {
                        ajxLoader.attachTo($GoodsBlock);
                    },
                    success: function (data, status, xhr) {
                        callback(data);
                    },
                    complete: function (xhr, status) {
                        currentXhr = null;
                        ajxLoader._detach();
                    }
                });
            //}
        }

        function getAjaxStatus() {
        }

        function newDataIsRecived (data) {
            pageToView = 1;
            lastData = data;
            sendMessage('newData', data);
            viewGoods.render();
        }

        function getMessage(type, data) {
            switch (type) {
                case 'filtersChange':
                    sendFilters(newDataIsRecived);
                    break;
            }
        }

        function sendMessage(message, data) {
            for (var i in catalogComponents) {
                if (catalogComponents[i] && catalogComponents[i].getMessage instanceof Function) {
                    catalogComponents[i].getMessage(message, data);
                }
            }
        }

        function viewScroll() {
            $GoodsBlock = $('.catalogue .right');
            var winHeight = window.innerHeight;

            $(window).resize(function(){
                winHeight = window.innerHeight;
            });

            $(window).scroll(function(){
                if (viewMode === 'all' && !currentXhr) {
                    var blockTop = $GoodsBlock.offset().top,
                        blockHeight = $GoodsBlock.height(),
                        winScroll = $(window).scrollTop();

                    if (winScroll + winHeight > (blockTop + blockHeight)*.9) {
                        pageToView++;
                        sendFilters(viewGoods.render.bind(viewGoods));
                    }
                } else  if (viewMode !== 'all') {
                    pageToView = 1;
                }
            });
        }

        return { //public
            init:  init,
            getMessage: getMessage,
            setViewMode: setViewMode,
            getPage: getPage,
            getGoods: getGoods
        }
    })();

    $(function(){
        Filters.init(CatalogManager, FiltersView);
        Filters.addComponent(PriceFilter);
        Filters.addComponent(CheckboxFilter);
        ShowOptions.init(CatalogManager);
        Goods.init(CatalogManager);
        CatalogManager.init(Goods, [Filters, ShowOptions]);
    })

})(jQuery);