(function($){

    var ajxUrl = {};

    var ENV_CONST = window.location.host && (/\:300/.test(window.location.host))?'dev':'prod';

    function addUrl (name, urls) {
        if(ENV_CONST == 'dev') {
            ajxUrl[name] = '../../source/back/' + urls[0];
        } else {
            ajxUrl[name] = '/ajax/' + urls[1];
        }
    }

    addUrl('town', ['town.html','town.html']);
    addUrl('addItem', ['additem.json','additem.html?']);
    addUrl('removeItem', ['additem.json','basketitemdelete.html?']);
    addUrl('getItem', ['item.json','basketitem.html?']);
    addUrl('setCoupon', ['coupon.json','coupon.html?']);
    addUrl('modalItem', ['item.html','item.html?']);
    addUrl('delivInfo', ['deliveryInfo.json','deliveryInfo.html']);
    addUrl('delivSubmit', ['deliverySubmit.json','deliverySubmit.html']);

    function digitDiv (str) {
        return str.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
    }

    var BasketItem = function(basket, data) {
        var self = this;

        this.basket = basket;
        this.data = data;
        this.id = data.id;
        this.count = data.count;
        this.sizes = data.sizes;
        this.isBuy = data.isBuy;

        $.each(data.sizes, function(i,v){
            var c = 0;
            if (data.sizes[i].selected) {
                for (var n in data.sizes[i]) {
                    if (c) return;
                    self.price = data.sizes[i][n];
                    self.size = n;
                    c++;
                }
            }
            if (c) return;
            if (i === 0) {
                for (var n in data.sizes[i]) {
                    self.price = data.sizes[i][n];
                    self.size = n;
                }
            }

        });

        this.init();
    };

    BasketItem.prototype = {
        init: function() {
            this.render();

            this.$sizes = this.$self.find('.select_size-order');
            this.$delete = this.$self.find('.basket-item__delete');
            this.$countControl = this.$self.find('.counter__control');
            this.$counter = this.$self.find('.counter__val');
            this.$link = this.$self.find('.basket-item__link');

            this.$sizes.on('change',this,this._sizeChange);
            this.$countControl.on('click',this,this._countChange);
            this.$delete.on('click',this,this._remove);
            this.$link.on('click',this,this._linkItem);

            this.$items = this.basket.renderItem(this);

            this.$price = this.$items.find('.basket-item__price .summ');

            if (this.sizes.length === 1) { //нет размеров
                for (var size in this.sizes[0]) {
                    if (!size) {
                        $('.basket-item__size').css('visibility','hidden');
                    }
                }
            }
            !IS_MOBILE && this.$sizes.CustomSelect({visRows:4});
            this.updatePrice(true);
        },
        _sizeChange: function(e) {
            var self = e.data;
            var valSize = $(this).val();
            for (var i in self.sizes) {
                for (var property in self.sizes[i] ) {
                    if (property == valSize) {
                        self.size = property;
                        self.price = self.sizes[i][property];
                        break;
                    }
                }
            }
            self.updatePrice();
            self.updateRefresh();
        },
        _countChange: function(e) {
            e.preventDefault();
            var self = e.data;
            var dir = $(this).data('control');
            switch (dir) {
                case 'inc' :
                    self.count++;
                    break;
                case 'desc' :
                    if (self.count > 1)
                        self.count--;
                    break;
            }
            self.$counter.text(self.count);
            self.updatePrice();
            self.updateRefresh();
        },
        _remove: function(e) {
            e.preventDefault();
            var self = e.data;

            self.$items.fadeOut(500,function(){
                self.$self.remove();
                self.$sizes.off('change');
                self.$countControl.off('click');
                self.$delete.off('click');
                self.basket.removeItem(self);
            })
        },
        _linkItem: function(e) {
            var self = e.data;

            console.log(IS_MOBILE);
            if ($(this).closest('.basket_order').length && !IS_MOBILE) {
                e.preventDefault();
                self.basket.modalItem(self);
            }

        },
        updateRefresh: function() {
            var self = this;
            clearTimeout(self.counterUpdate);
            self.counterUpdate = setTimeout(function(){
                self.basket.addItem({id: self.id, size: self.size, count: self.count});
            },3000)
        },
        render: function() {
            var renderData = this.data;
            renderData.size = function() {
                for ( property in this ) {
                    return property;
                }
            };
            this.$self = $(Mustache.render(this.basket.tplItem, renderData));
        },
        updatePrice: function(onlyItem) {
            this.total = this.price * this.count;

            this.$price.text(digitDiv(this.total));
            !onlyItem && this.basket.updateTotal();
        }
    };

    window.Basket = function  () {
        var self = this;

        this.init = function() {
            self.loadItems();
            self.$couponFormSubmit.on('click', self.setCoupon);
            self.itemModal.on('click', self._modalClick);
        };

        this.loadItems = function() {
          self.getItem(function(data){
              !data.length && self.updateCount();
              for (var i in data) {
                  self.addToBasket(data[i]);
              }
          });
        };

        this.addItem = function (data, newItem) {

            $.ajax({
                url: ajxUrl.addItem,
                cache: false,
                type: 'post',
                dataType: 'json',
                data: {data: data}, // data.id, data.count, data.size
                success: function(resp,status,xhr){
                    if (newItem) {
                        self.addToBasket(data.name?data:resp, true);
                    }
                }
            });

        };

        this.removeItem = function(item) {


            $.ajax({
                url: ajxUrl.removeItem,
                cache: false,
                type: 'post',
                dataType: 'json',
                data: {id: item.id}, // data.id, data.count, data.size
                success: function(data,status,xhr){
                    for (var i = 0, l = items.length; i < l ; i++) {
                        if(items[i] == item)
                            items.splice(i, 1);
                    }
                    var $itemBtn = $('.js-buy[data-item='+item.id+']');
                    $itemBtn.removeClass('btn_red btn_cart-added');
                    $itemBtn.text('купить');
                    self.updateBasket();
                }
            });
        };

        this.addToBasket = function(data, isBuy) {
            self.toggleBasket();
            if (isBuy && !IS_MOBILE) {
                data.isBuy = true
            }
            items.push(new BasketItem(self, data));
            self.updateBasket();
            if (isBuy && !IS_MOBILE) {
                self.$topList.trigger('open');
            }
        };

        this.toggleBasket = function(flag,callback) {
            if (flag) {
                this.isEmpty = true;
                self.$step.fadeOut(500,function(){
                    self.$step.remove();
                    self.$emptyBasket.fadeIn(300);
                });
                !self.$step.length && self.$emptyBasket.fadeIn(300);
            } else {
                this.isEmpty = false;
                self.$emptyBasket.hide();
                self.$self.show();
            }
        };

        this.renderItem = function (item) {
            item.isBuy && item.$self.addClass('active');
            return item.$self.prependTo(self.$list);
        };

        this.findItem = function(id) {
           for (var i in items) {
               if (items[i].id == id) {
                   return items[i];
               }
           }
           return false;
        };

        this.getItem = function(callback, id) {
            var id = id || false;

            $.ajax({
                url: ajxUrl.getItem,
                cache: false,
                type: 'get',
                dataType: 'json',
                data: {id : id},
                success: function(data,status,xhr){
                    typeof callback == 'function' && callback(data);
                },
                error: function(d,msg) {
                    self.toggleBasket(true);
                }
            });
        };

        this.setCoupon = function(e) {

            $inpt = $('input[type=text]',self.$couponForm);
            var val = $inpt.val();
            if (val) {
                $.ajax({
                    url: ajxUrl.setCoupon,
                    cache: false,
                    type: 'post',
                    dataType: 'json',
                    data: {coupon: val}, // data.id, data.count, data.size
                    success: function(data,status,xhr){
                        if (data.count) {
                            self.sale = data.count;
                            self.$sale && self.$sale.remove();
                            self.$sale = $(Mustache.render(self.tplSale, {sale: self.sale}));
                            self.$coupon = $('.summ',self.$sale);
                            self.$couponFormVal.find('span').text(self.sale);
                            self.$couponFormVal.show();
                            self.$couponForm.trigger('update');
                            self.$totalCont.append(self.$sale);
                            $inpt.val('');
                            self.updateTotal();
                        }
                    }
                });
            }
            return false;
        };

        this.updateBasket = function() {
            self.updateTotal();
            self.updateCount();
            try{
                self.$scroller.nanoScroller();
            }
            catch(e) {}
        };

        this.updateTotal = function() {
            self.total = 0;
            for (var i in items) {
                self.total += items[i].total;
            }
            self.$total.text(digitDiv(self.total));
            if (self.sale) {
                self.saleTotal = Math.round((100-self.sale)/100 * self.total);
                self.$coupon.text(digitDiv(self.saleTotal));
            }
            self.$self.trigger('updateTotal');
        };

        this.getTotal = function() {
            return self.sale?self.saleTotal:self.total;
        };

        this.updateCount = function() {
            console.log('update');
            self.$topCount.text(items.length || 0);
            !items.length && self.toggleBasket(true);
        };

        this.modalItem = function(item) {
            this.modalItemToggle(true);
            $.ajax({
                url: ajxUrl.modalItem,
                cache: false,
                type: 'post',
                dataType: 'html',
                data: {id: item.id},
                success: function(data,status,xhr){
                    if (data) {
                        self.$itemCont && self.$itemCont.remove();
                        self.$itemCont = $(data);
                        self.itemModalCont.append(self.$itemCont);
                        self.itemModalInit();
                    }
                },
                error: function(res,err) {
                    console.log(res);
                    console.log(err);
                }
            });
        };

        this.modalItemToggle =  function(flag) {
            self.itemModal.fadeToggle(500, function(){
                $('body').toggleClass('popup-show',flag);
            });
            if (!flag) {
                self.itemModalCont.css({opacity:0});
                smoothScrollInit();
            } else {
                $('body').addClass('popup-show');
            }
        };

        this._modalClick = function(e) {
            if ($(e.target).closest(self.itemModalCont).length && !$(e.target).is('.icon-close')) return false;
            self.modalItemToggle(false);
        };

        this.itemModalInit = function() {
            //slider
            var modalSlider = [
                {
                    sliderClass: '.pitem-slider_side',
                    options: {
                        pager: false,
                        minSlides: 4,
                        infiniteLoop: false,
                        slideMargin: 23,
                        mode: 'vertical',
                        onSliderLoad: function() {

                        }
                    }
                }
            ];
            sliderConstructor(modalSlider);
            self.itemModalCont.css({opacity:1});
            //spoilers
            $('.pitem-specs__spoilers .folding').folding({openHeight: 163, closeOther: '.pitem-specs__spoilers .spoiler-item'});
            //tooltip
            Tipped.create('.tooltip', '', {
                maxWidth: 290
            });
            //big img && zoom
            $('.pitem-slider_side', self.itemModal).itemImg({
                containerImg: '.pitem-preview-main_side .pitem-preview-main__loader',
                containerVideo: '.pitem-preview-main_side .pitem-preview-main__video'
            });
            //select
            !IS_MOBILE && $('.select_size', self.itemModal).CustomSelect({visRows:4});
            var $curItem = $('.js-item-data', self.itemModal),
                itemData = eval('('+$curItem.data('item')+')'),
                $selectSize = $('.select_size',$curItem),
                $cost = $('.count',$curItem);

            $selectSize.change(function(){
                var valSize = self.size = $(this).val(),
                    cost;
                if (valSize) {
                    for (var i in itemData.sizes) {
                        for (var property in itemData.sizes[i] ) {
                            if (property == valSize) {
                                cost = itemData.sizes[i][property];
                                break;
                            }
                        }
                    }
                    $cost.html(cost);
                }

            });
            $('body').off('mousewheel');
        };

        var items = [];
        self.$self = $('.basket');
        self.$list = $('.basket-items__list', self.$self);
        self.$topList = $('.basket-items__holder');
        self.$totalCont = $('.total', self.$self);
        self.$total = $('.total__summ .summ', self.$self);
        self.$scroller = $('.nano-scroll', self.$self);
        self.$topCount = $('.basket-top__icon .count',self.$self);
        self.tplItem = IS_MOBILE?$('#basket-item__mobile').html():$('#basket-item').html();
        self.tplSale = $('#basket-sale').html();
        self.$couponForm = $('.basket-promocode__form');
        self.$couponFormVal = $('.basket-promocode__val');
        self.$couponFormSubmit = $('.btn-submit', self.$couponForm);
        self.itemModal = $('.ajxItemModal');
        self.itemModalCont = $('.ajxItemModal__inner');
        self.$emptyBasket = $('.basket-empty');
        self.$step = $('.order-step');
        Mustache.parse(self.tplItem);
        Mustache.parse(self.tplSale);

        self.init();
    };


    window.Checkout = function  (basket) {
        var self = this;

        this.init = function() {
            self.$typeSel.on('change', self._deliverySelect);
            self.$regionSel.on('change', self.setTown);
            self.$citySel.on('change', self.setPostDelivery);
            self.$form.on('submit',self.submitDelivery);

            self.$step.each(function(){
                self.steps.push($(this));
            });

            self.basket.$self.bind('updateTotal',self.updateTotal);
        };

        this.nextStep = function(step) {
            var curOffset,$curStep;
            self.curStep = step || (self.curStep + 1 > self.steps.length - 1?self.steps.length - 1:self.curStep + 1);

            $curStep = self.steps[self.curStep];
            $curStep.fadeIn(500,self.stepDetect);

            setTimeout(function(){
                curOffset = $curStep.find('.scroll-to').offset().top;
                $("html, body").animate({ scrollTop: curOffset*.95 }, 300);
            },10);
        };


        this.stepDetect = function() {
            switch (self.curStep) {
                case 1:
                    var $sel = $('.select_delivery-start');
                    $('.basket-promocode').folding({});
                    if ($sel.data('plugin') != 'select' && !IS_MOBILE)
                        $sel.CustomSelect({visRows:5, modifier: 'delivery'});
                    break;

            }
        };

        this._deliverySelect = function() {
            var dType = $(this).val();
            self.setDelivery(dType);
        };


        this.setDelivery = function(dType) {
            self.dType = dType || self.$typeSel.val();
            self.validateAdd = [];
            self.$destSel.hide();
            self.$postSel.hide();
            switch (self.dType) {
                case 'courier':
                    self.$addresss.show();
                    self.getDeliveryInfo();
                   // self.validateAdd = ['s-address'];
                    break;
                case 'self':
                    self.toggleDestination(false);
                    self.shipCost = 0;
                    self.updateTotal();
                    break;
                case 'spsr_regions':
                    self.$deliveryInfo.hide();
                    self.$addresss.show();
                    self.$destSel.show();
                    if (!selInit && !IS_MOBILE) {
                        $('.post-select', self.$self).CustomSelect({visRows:5, modifier: 'delivery'});
                    }
                    selInit = true;
                    self.validateAdd = [/*'s-address',*/ 's-region', 's-city'];
                    break;
                case 'post':
                    self.$addresss.show();
                    self.$postSel.show();
                    self.getDeliveryInfo();
                    self.validateAdd = [/*'s-address',*/ 's-postTown'];
                    break;
            }
        };

        this.getDeliveryInfo = function(dest) {

            $.ajax({
                url: ajxUrl.delivInfo,
                cache: false,
                type: 'post',
                dataType: 'json',
                data: {type: self.dType, destination: dest || ''},
                success: function(data,status,xhr){
                    if (data) {
                        self.shipCost = data.summ;
                        self.$deliverySumm.text(digitDiv(data.summ));
                        self.$deliveryDays.text(data.days);
                        self.updateTotal();
                        self.$deliveryInfo.show();
                    }
                }
            });
        };

        this.toggleDestination = function(flag) {
            self.$deliveryInfo.toggle(flag);
            self.$addresss.toggle(flag);
            self.$destSel.toggle(flag);
        };

        this.setTown = function() {
            var region = $(this).val();

            self.$towns && self.$towns.remove();
            $.ajax({
                url: ajxUrl.town,
                cache: false,
                type: 'post',
                dataType: 'html',
                data: {region: region},
                success: function(data,status,xhr){
                    if (data) {
                        self.$towns = $(data);
                        self.$citySel.append(self.$towns).trigger('update');
                    }
                }
            });
        };

        this.setPostDelivery = function() {
            var town = $(this).val();
            town && self.getDeliveryInfo(town);
            if (!town) {
                self.$deliveryInfo.hide();
            }
        };

        this.validateDelivery = function(e) {
            var validateFields = self.validate.concat(self.validateAdd);
            var $field,$fieldRow, isValid = true, forValid;
            for (var i in validateFields) {
                $field = $('#'+validateFields[i]);
                $fieldRow = $field.closest('.row');
                switch ($field.attr('type')) {
                    case 'email':
                        forValid = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test($field.val());
                        break;
                    default :
                        forValid = !!$field.val();
                }
                if (!forValid) {
                    isValid = forValid;
                }
                $fieldRow.toggleClass('error',!forValid);
            }
            return isValid;
        };

        this.submitDelivery = function(e) {
            e.preventDefault();
            if (self.validateDelivery()) {
                $.ajax({
                    url: ajxUrl.delivSubmit,
                    cache: false,
                    type: 'post',
                    dataType: 'json',
                    data: {data: self.$form.serialize()},
                    success: function(data,status,xhr){
                        /*if (data.url) {
                            /!*self.$orderNum.text(data.order);*!/
                            window.location = data.url;
                            self.nextStep();
                        }*/
                        if (typeof data.type != 'undefined') {
                            if (data.type=='form') {
                                var form = $(data.form);
                                $(document.body).append(form);
                                form.submit();
                            }
                            else
                            if (data.type=='url') {
                                window.location.href=data.url;
                            }
                        } else {
                            alert('Заказ успешно отправлен. В ближайшее время наш менеджер свяжется с вами.');
                            window.location.href='/';
                        }
                    }
                });
            }
        };

        this.updateTotal = function() {
            var lbl = '';
            var total = self.shipCost + self.basket.getTotal();
            if (self.shipCost || self.basket.sale ) {
                lbl = 'с учетом';
                self.basket.sale && (lbl+=' скидки');
                lbl+=(self.basket.sale && self.shipCost)?' и':'';
                self.shipCost && (lbl+=' доставки');
            }
            self.$totalLbl.text(lbl);
            self.$total.text(digitDiv(total));
        };

        self.$self = $('.order');
        if (!self.$self.length) return;
        self.$typeSel = $('#s-delivery');
        self.$regionSel = $('#s-region');
        self.$citySel = $('#s-city');
        self.$destSel = $('.selected_delivery',self.$self);
        self.$postSel = $('.selected_post',self.$self);
        self.$deliveryInfo = $('.delivery__info',self.$self);
        self.$deliverySumm = $('.delivery-summ', self.$deliveryInfo);
        self.$deliveryDays = $('.delivery-day', self.$deliveryInfo);
        self.$addresss = $('.delivery__address',self.$self);
        self.$total = $('.order__total .summ', self.$self);
        self.$totalLbl = $('.order__total .lbl__add', self.$self);
        self.$form = $('.delivery-form', self.$self);
        self.$orderNum = $('.order-num',self.$self);
        self.$step = $('.order-step');
        self.steps = [];
        self.curStep = -1;
        self.shipCost = 0;

        self.validate = [
            's-name', 's-phone',  's-paytype', 's-delivery'
        ];

        self.basket = basket;

        var selInit = false;
        self.init();
        self.nextStep();
        self.setDelivery();
    };


    $(function(){


    });
})(jQuery);