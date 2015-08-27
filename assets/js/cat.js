(function($){

    var AppUtils = { //вспомогашки
        hasClass: function(el, cls) {
            return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
        },
        uniqueArr: function(arr) {
            var prevItem;
            return arr.filter(function(item, index){
                if (arr.indexOf(item) === index) {
                    return item;
                }
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
        },
        _pushEach: function(arr) {

        }
    };

    var goodsUrl = '';
    if(window.location.host && (/localhost/.test(window.location.host))) {
        goodsUrl = '../../source/back/catalogue.json?';
    } else {
        goodsUrl = '/ajax/catalogue.html?';
    }

    /**** Filter components ****/
    var IdentifySection = {
        init: function(controller) {
            this.controller = controller;
            this.state = {};
            this.filterName = '';
            this.view();
        },
        isName: function(name) {
            return  this.filterName === name;
        },
        getState: function() {
            return  this.state;
        },
        getStateRaw: function() {

        },
        setName: function(name) {
            this.filterName = name;
        },
        updateState: function(data) {
            if (!this.filterName) return;
            this.state[this.filterName] = data;
        },
        view: function() {
            var $activeLink = $('.category-section-block .list .selected');
            this.setName($activeLink.data('filter'));
            this.updateState($activeLink.data('value'));

        },
        returnState: function(state) {

        },
        render: function() {

        }
    };

    var popularFilter = {
        init: function(controller) {
            this.controller = controller;
            this.state = {};
            this.filterName = 'popular_categ';

            var urlPop = location.pathname.split("/");
            if ( urlPop.length > 1 && urlPop[1] == "popular_categ" )
            {
                var tmpStr = urlPop[2];
                this.state[this.filterName] = tmpStr.replace('.html', '');
            }
        },
        isName: function(name) {
            return  this.filterName === name;
        },
        getState: function() {
            return  this.state;
        },
        getStateRaw: function() {

        },
        returnState: function(state) {

        },
        render: function() {

        }
    };

    var OtherFilter = {
        init: function(controller) {
            this.controller = controller;
            this.state = {};
            this.filterName = 'OtherFilter';

            var otherVal = $('#other').val();
            this.state[this.filterName] = otherVal?otherVal:null;
        },
        isName: function(name) {
            return  this.filterName === name;
        },
        getState: function() {
            return  this.state;
        },
        getStateRaw: function() {

        },
        returnState: function(state) {

        },
        render: function() {

        }
    };

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
            if (!this.state[this.filterName] || this.state[this.filterName].join() === this.defaultRange.join()) return;
            var rawObj = {};
            rawObj[this.filterName] = [{'0':'от '+this.state[this.filterName][0]+' до '+this.state[this.filterName][1]}];
            return rawObj;
        },
        returnState: function(state) {
            var isFinded = false;
            for (var fName in state) {
                if (this.filterName === fName) {
                    this.state[this.filterName] = state[fName];
                    isFinded = true;
                }
            }
            if (!isFinded) {
                this.state[this.filterName] = this.defaultRange;
            }
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
            this.defaultRange = [$('#mincost').data('min'), $('#maxcost').data('max')];
            this.view.priceFilter
                .slider({
                    min: this.defaultRange[0],
                    max: this.defaultRange[1],
                    range: true,
                    values: [this.defaultRange[0], this.defaultRange[1]],
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
            this.namesCheckboxes = {};
            this.backState = [];
            this.viewInit();
        },
        addFilterName: function(name) {
            this.filterName.push(name);
        },
        getState: function() {
            var stateObj = {};
            for (var group in this.activeCheckboxes) {
                stateObj[group] = [];
                this.activeCheckboxes[group].forEach(function (item) {
                    for (var val in item) {
                        stateObj[group].push(val);
                    }
                })
            }
            return stateObj; //{filter: [1,2,3],....}
        },
        getStateRaw: function() {
            return this.activeCheckboxes;
        },
        returnState: function(state) {
            this.activeCheckboxes = {};
            for (var fName in state) {
                if (this.filterName.indexOf(fName) > -1) {
                    state[fName].forEach(function(item){
                       this.addActiveCheckbox({type: fName, value: item, label : this.getNameCheckbox({fName: fName, value : item})});
                    }.bind(this));
                }
            }
            this.renderCheckboxes();
        },
        isName: function(name) {
            return (this.filterName.join(',').indexOf(name) > -1);
        },
        removeFilter: function(data){
            this.removeActiveCheckbox(data);
            this.renderCheckboxes();
        },
        addNameCheckbox: function(data) {
            if (!this.namesCheckboxes[data.type]) {
                this.namesCheckboxes[data.type] = [];
            }
            var objValue = {};
            objValue[data.value] = data.label;
            this.namesCheckboxes[data.type].push(objValue);
        },
        getNameCheckbox: function(data) {
            var lbl = '';
            for (var filter in this.namesCheckboxes) {
                if (lbl) break; //finded
                if (filter !== data.fName) continue; //next Filter name
                this.namesCheckboxes[filter].forEach(function(values){
                    if (lbl) return; //finded
                    for (var value in values) {
                        if (value === data.value) {
                            lbl =  values[value];
                        }
                    }
                });
            }
            return lbl;
        },
        updateActiveCheckbox: function(data, isInit) {
            if (data.checked) {
                this.addActiveCheckbox(data);
            } else {
                this.removeActiveCheckbox(data);
            }
            !isInit && this.controller.updateFilters();
        },
        addActiveCheckbox: function(data) {
            if (!this.activeCheckboxes[data.type]) {
                this.activeCheckboxes[data.type] = [];
            }
            var objValue = {};
            objValue[data.value] = data.label;
            this.activeCheckboxes[data.type].push(objValue); //{filterName: [val:lbl,val:lbl,....],....}
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
        getActiveCheckboxes: function() {
          return this.getState();
        },
        viewInit: function() {
            var self = this;
            this.view = {};
            this.view.checkoxFilters = $('.block .list input[type=checkbox], .square_sizes .squaresize');

            this.view.checkoxFilters.each(function(){
                var $item = $(this);
                var filterName = $item.data('filter');
                filterName && self.addFilterName(filterName);
                self.addNameCheckbox({type: filterName,value: parseInt($item.data('value')), label: $item.closest('label').text()});
                if ($item.is(':checked') && !$item.is(':disabled')) {
                    self.updateActiveCheckbox({type: $item.data('filter'),value: parseInt($item.data('value')), checked: $item.is(':checked'), label: $item.closest('label').text()}, true);
                }
            });
            this.filterName = AppUtils.uniqueArr(this.filterName);

            this.view.checkoxFilters.on('change', function(event){
                var $item = $(this);
                self.updateActiveCheckbox({type: $item.data('filter'),value: $item.data('value'), checked: $item.is(':checked'), label: $item.closest('label').text()});
            });
        },
        render: function() { //рендер доступных чекбоксов
            var $li;
            var filtersData = this.getAvailableCheckboxes();

            for (var filter in filtersData) {
                this.view.checkoxFilters.filter('[data-filter=' + filter + ']').each(function () {
                    var $item = $(this);
                    $li = $item.closest('li');
                    //console.log(filtersData[filter], typeof $item.data('value'), filtersData[filter].indexOf($item.data('value')));
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
        renderCheckboxes: function() { //рендер состояния чекбоксов
            var activeCheckboxes = this.getActiveCheckboxes();
            this.view.checkoxFilters.not(':disabled').prop('checked',false);
            for (var fName in activeCheckboxes) {
                activeCheckboxes[fName].forEach(function(val){
                    this.view.checkoxFilters.filter('[data-filter='+fName+'][data-value="'+val+'"]').prop('checked',true);
                }.bind(this));
            }
            this.view.checkoxFilters.trigger('refresh');
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
            /*if (component instanceof Object) {

            }*/
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
        returnState: function(state) {
            this.components.forEach(function(component){
                //возврат состояния каждого компонента (активное состояние)
                component.returnState(state);
            });
        },
        updateFilters: function() {
            this.sendMessage('filtersChange');
        },
        getFilterRenderData: function(filter) {
            var obj = {};
            if (filter) {
                if (filter instanceof  Array) {//проверка на массив имен, например группы чекбоксов
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
        render: function() {//рендер FiltersView
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

            //console.log(filters);
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
            this.filterName = ['items_per_page', 'items_sort_order'];
            this.defaultValue = {};
            this.view();
            this.render();
        },
        getState: function() {
            return this.state;
        },
        returnState: function(state) {
            var isFinded = false;
            if (state.length) {
                for (var fName in state) {
                    isFinded = false;
                    if (this.filterName.indexOf(fName) > -1) {
                        this.setState({type: fName, value: state[fName]}, false);
                        isFinded = true;
                    }
                    if (!isFinded) {
                        this.setState({type: fName, value: this.defaultValue[fName]});
                    }
                }
            } else {
                for (fName in this.defaultValue) {
                    this.setState({type: fName, value: this.defaultValue[fName]});
                }
            }
            this.renderSelect();
        },
        sendMessage: function(type) {
            this.manager.getMessage(type);
        },
        getMessage: function(type, data) {
            switch (type) {
                case 'newData' :
                    this.responseData = data;
                    this.render();
                    break;
            }
        },
        setState: function(data, isUpdate) {
            this.state[data.type] = data.value;
            if (!this.defaultValue[data.type]){
                this.defaultValue[data.type] = data.value;
            }
            this.setViewMode(data);
            isUpdate && this.sendMessage('filtersChange');
        },
        setViewMode: function(data) {
            if (data.type === 'items_per_page')
                this.manager.setViewMode(data.value);
        },
        getPager: function() {
            return this.responseData.pageswitch;
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
            var pager = this.getPager();
            if (this.getState()["items_per_page"] === 'all' || pager === '') {
                this.view.pager.hide();
            } else {
                this.view.pager.show();
                this.view.pager.html(pager);
            }
        },
        renderSelect: function() {
            var data = this.getState();
            for (var sName in data) {
                this.view.select.filter('[data-type='+sName+']').val(data[sName]);
            }
            this.view.select.trigger('refresh');
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
            this.view.item = $('.item', this.view.container);
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
            isEndOfGoods = false,
            isBlankState = false,
            documentTitle = document.title,
            firstPopState = true,
            currentXhr = null;

        var historyState = {
            init: function() {
                setTimeout( function(){
                    window.addEventListener('popstate', historyState.onpopstate, false);
                },0);
            },
            push: function() {
//                lastData.activeComponentsState = getActiveComponentsState();
//                console.log(getActiveComponentsState());
                history.pushState( {stateData:getActiveComponentsState() }, documentTitle, '?' + getParam());
            },
            onpopstate: function(e) {
                if (!e.state && firstPopState) { //safari & old chrome fix
                    return false;
                }
                firstPopState = false;
                historyState.isReturn();
                //var fil =  history.state == null?makeUri().join('&'):history.state.filters;
            },
            isReturn: function() {
                if (!history.state) {
                    isBlankState = true;
                }
                (timeCapsule && timeCapsule instanceof Function) && timeCapsule(history.state?history.state.stateData:{});
            }
        };

        function timeCapsule(state) {
            catalogComponents.forEach(function(component){
                component.returnState(state);
            });
               getMessage('filtersChange', {back: true});
        }

        function getActiveComponentsState() {
            var stateArr = [];
            catalogComponents.forEach(function(component){
                stateArr.push(component.getState()); //{filterName: [val,val,...], filterName: ...}
            });
            return AppUtils.concatObj(stateArr);
        }

        function getBlankState() {

        }

        function init(oGoods, components) {
            viewGoods = oGoods;
            catalogComponents = components;
            historyState.init();
            viewScroll();
            try  {
                !!avfilters && newDataIsRecived({filters: avfilters}, true);
            } catch(e) {

            }
           // historyState.isReturn();
        }

        function setViewMode(type) {
            //console.log(type);
            viewMode = type;
        }

        function getPage() {
            return pageToView;
        }

        function getGoods() {
            if (!lastData.items) {
                isEndOfGoods = true;
            } else {
                return lastData.items;
            }
        }

        function addToParam() {
            var params;

            for (var i = 0, argLngt = arguments.length; i < argLngt; i++) {
                params = arguments[i];

                if (params instanceof Object) {
                    for (var key in params) {
                        if (params[key] !== null) {
                            paramToPost += key + '=' + (params[key] instanceof Array ? params[key].join(',') : params[key]) + '&';
                        }
                    }
                }
            }
        }

        function getParam() {
            paramToPost = '';
           /* if (isBlankState) {
                isBlankState = false;
                return paramToPost;
            }*/
            addToParam(getActiveComponentsState());
            addToParam({actpage: pageToView});
            return paramToPost.substring(0, paramToPost.length - 1);
        }

        function sendFilters(callback) {
            if (currentXhr && currentXhr.readyState != 4) {
                currentXhr.abort();
            }
            currentXhr = $.ajax(goodsUrl + getParam(), {///ajax/catalogue.html?  '../../source/back/catalogue.html?'
                    cache: false,
                    type: 'get',
                    dataType: 'json',
                    beforeSend: function (xhr, setting) {
                        ajxLoader.attachTo($GoodsBlock);
                    },
                    success: function (data, status, xhr) {
                        lastData = data;
                        callback(data);
                    },
                    complete: function (xhr, status) {
                        currentXhr = null;
                        ajxLoader._detach();
                    },
                    error: function (xhr, status) {
                        console.log(xhr);
                        console.log(status);
                    }
            });
        }

        function getAjaxStatus() {
        }

        function newDataIsRecived (data, initData) {
            sendMessage('newData', data);
            !initData && viewGoods.render();
        }

        function getMessage(type, data) {
            switch (type) {
                case 'filtersChange':
                    pageToView = 1;
                    isEndOfGoods = false;
                    sendFilters(newDataIsRecived);
                    if (data && !data.back) {
                        historyState.push();
                    } else {
                        if (!data)
                            historyState.push();
                    }
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
                if (viewMode === 'all' && !currentXhr && !isEndOfGoods) {
                    var blockTop = $GoodsBlock.offset().top,
                        blockHeight = $GoodsBlock.height(),
                        winScroll = $(window).scrollTop();

                    if (winScroll + winHeight > (blockTop + blockHeight)*1) {
                        pageToView++;
                        sendFilters(viewGoods.render.bind(viewGoods));
                    }
                } else  if (viewMode !== 'all' && !isEndOfGoods) {
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
        Filters.addComponent(popularFilter);
        Filters.addComponent(IdentifySection);
        Filters.addComponent(OtherFilter);
        Filters.render();
        ShowOptions.init(CatalogManager);
        Goods.init(CatalogManager);
        CatalogManager.init(Goods, [Filters, ShowOptions]);
    })

})(jQuery);