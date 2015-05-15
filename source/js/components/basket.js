(function($){

    var BasketItem = function(basket, data) {
        var self = this;

        this.basket = basket;
        this.data = data;
        this.id = data.id;
        this.count = data.count;
        this.sizes = data.sizes;

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

            this.$sizes.on('change',this,this._sizeChange);
            this.$countControl.on('click',this,this._countChange);
            this.$delete.on('click',this,this._remove);

            this.$items = this.basket.renderItem(this);

            this.$price = this.$items.find('.basket-item__price');
            this.$sizes.CustomSelect({visRows:4});
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
            this.$price.text(this.total);
            !onlyItem && this.basket.updateTotal();
        }
    };

    function Basket () {
        var self = this;

        this.init = function() {
            self.loadItems();
            self.$couponForm.on('submit', self.setCoupon);
        };

        this.loadItems = function() {
          self.getItem(function(data){
              for (var i in data) {
                  self.addToBasket(data[i]);
              }
          });
        };

        this.addItem = function (data, newItem) {

            $.ajax({
                url: '../../source/back/additem.json',
                cache: false,
                type: 'post',
                dataType: 'json',
                data: {data: data}, // data.id, data.count, data.size
                success: function(data,status,xhr){
                    newItem && self.addToBasket(data);
                }
            });

        };

        this.removeItem = function(item) {
            $.ajax({
                url: '../../source/back/deleteitem.json',
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

        this.addToBasket = function(data) {
            items.push(new BasketItem(self, data));
            self.updateBasket();
        };

        this.renderItem = function (item) {
            return item.$self.appendTo(self.$list);
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
                url: '../../source/back/item.json',
                cache: false,
                type: 'post',
                dataType: 'json',
                data: {id : id},
                success: function(data,status,xhr){
                    typeof callback == 'function' && callback(data);
                }
            });
        };

        this.setCoupon = function(e) {

            $inpt = $('input[type=text]',self.$couponForm);
            var val = $inpt.val();
            if (val) {
                $.ajax({
                    url: '../../source/back/coupon.json',
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
            self.$scroller.nanoScroller();
        };

        this.updateTotal = function() {
            self.total = 0;
            for (var i in items) {
                self.total += items[i].total;
            }
            self.$total.text(self.total);
            if (self.sale) {
                self.saleTotal = Math.round((100-self.sale)/100 * self.total);
                self.$coupon.text(self.saleTotal);
            }
            self.$self.trigger('updateTotal');
        };

        this.getTotal = function() {
            return self.sale?self.saleTotal:self.total;
        };

        this.updateCount = function() {
            self.$topCount.text(items.length);
        };

        var items = [];
        self.$self = $('.basket');
        self.$list = $('.basket-items__list', self.$self);
        self.$totalCont = $('.total', self.$self);
        self.$total = $('.total__summ .summ', self.$self);
        self.$scroller = $('.nano-scroll', self.$self);
        self.$topCount = $('.basket-top__icon .count',self.$self);
        self.tplItem = $('#basket-item').html();
        self.tplSale = $('#basket-sale').html();
        self.$couponForm = $('.basket-promocode__form');

        Mustache.parse(self.tplItem);
        Mustache.parse(self.tplSale);

        self.init();
    }

    function Checkout (basket) {
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
                    if ($sel.data('plugin') != 'select')
                        $sel.CustomSelect({visRows:5, modifier: 'delivery'});
                    break;
                case self.steps.length - 1:
                    self.$self.addClass('order-done');
                    self.basket.$self.addClass('order-done');
            }
        };

        this._deliverySelect = function() {
            var dType = $(this).val();
            self.setDelivery(dType);
        };


        this.setDelivery = function(dType) {
            self.dType = dType || self.$typeSel.val();
            self.validateAdd = [];
            switch (self.dType) {
                case 'courier':
                    self.$addresss.show();
                    self.getDeliveryInfo();
                    self.validateAdd = ['s-address'];
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
                    if (!selInit) {
                        $('.post-select', self.$self).CustomSelect({visRows:5, modifier: 'delivery'});
                    }
                    selInit = true;
                    self.validateAdd = ['s-address', 's-region', 's-city'];
                    break;
            }
        };

        this.getDeliveryInfo = function(dest) {

            $.ajax({
                url: '../../source/back/deliveryInfo.json',
                cache: false,
                type: 'post',
                dataType: 'json',
                data: {type: self.dType, destination: dest || ''},
                success: function(data,status,xhr){
                    if (data) {
                        self.shipCost = data.summ;
                        self.$deliverySumm.text(data.summ);
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
                url: '../../source/back/town.html',
                cache: false,
                type: 'post',
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
                    url: '../../source/back/deliverySubmit.json',
                    cache: false,
                    type: 'post',
                    dataType: 'json',
                    data: {data: self.$form.serialize()},
                    success: function(data,status,xhr){
                        if (data.order) {
                            self.$orderNum.text(data.order);
                            self.nextStep();
                        }
                    }
                });
            }
        };

        this.updateTotal = function() {
            var total = self.shipCost + self.basket.getTotal();
            self.$total.text(total);
        };

        self.$self = $('.order');
        if (!self.$self.length) return;
        self.$typeSel = $('#s-delivery');
        self.$regionSel = $('#s-region');
        self.$citySel = $('#s-city');
        self.$destSel = $('.selected_delivery',self.$self);
        self.$deliveryInfo = $('.delivery__info',self.$self);
        self.$deliverySumm = $('.delivery-summ', self.$deliveryInfo);
        self.$deliveryDays = $('.delivery-day', self.$deliveryInfo);
        self.$addresss = $('.delivery__address',self.$self);
        self.$total = $('.order__total .summ', self.$self);
        self.$form = $('.delivery-form', self.$self);
        self.$orderNum = $('.order-num',self.$self);
        self.$step = $('.order-step');
        self.steps = [];
        self.curStep = -1;
        self.shipCost = 0;

        self.validate = [
            's-name', 's-phone', 's-email'
        ];

        self.basket = basket;

        var selInit = false;
        self.init();
        self.nextStep();
        self.setDelivery();
    }


    $(function(){
        var basket = new Basket();
        var order = new Checkout(basket);
        //checkout
        $('.btn_checkout').click(function(e){
            e.preventDefault();
            order.nextStep(1);
        });
        //catalog item add
        $('.itemlist').length && (function(){
            //size option
            var self = {};

            var $sizePopup = $('.size-popup'),
                $sizePopupInner = $('.size__inner',$sizePopup),
                htmlInner = $('#template-popup-size').html(),
                htmlCost = $('#template-popup-cost').html(),
                $selectSize, $cost, $curItem,
                $fade = $('.fade-fixed');

            Mustache.parse(htmlInner);
            Mustache.parse(htmlCost);

            $fade.click(function(){
                $sizePopup.find('.close').trigger('click');
            });

            $('.itemlist').on('click','.js-buy',function(e) {
                e.preventDefault();
                if ($(this).is('.btn_cart-added')) return;
                $curItem = $(this).closest('.js-item-data');
                var itemData = eval('('+$curItem.data('item')+')');
                self.id = itemData.id;
                if (itemData.sizes) {
                    var renderData = {
                        sizes: itemData.sizes,
                        size: function() {
                            for ( property in this ) {
                                return property;
                            }
                        }
                    };
                    var rendered = Mustache.render(htmlInner, renderData);
                    $sizePopupInner.html(rendered);
                    var thisOffset = $('.description', $curItem).offset();
                    $sizePopup.css({top: thisOffset.top, left: thisOffset.left}).show();
                    $selectSize = $('.select_size',$sizePopup);
                    $selectSize.CustomSelect({visRows:4});
                    $sizePopup.hide().css({opacity:1}).fadeIn();
                    $fade.fadeIn();

                    $cost = $('.cost',$sizePopup);
                    $selectSize.change(function(){
                        var valSize = self.size = $(this).val(),
                            costRender,
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
                            costRender = Mustache.render(htmlCost, {price: cost});
                        } else {
                            costRender = '';
                        }
                        $cost.html(costRender);
                    })
                } else {
                    self.size = 0;
                    itemAdd();
                }
            });


            $sizePopup
                .on('click','.btn',function() {
                    if ($selectSize.val() == '') {
                        $selectSize.closest('.pitem-size').addClass('size_empty');
                    } else {
                        closePopup($sizePopup);
                        itemAdd();
                    }
                    return false;
                });

            function itemAdd() {
                var $btn = $curItem.find('.js-buy');
                $btn.text('ТОВАР В КОРЗИНЕ').addClass('btn_red btn_cart-added');
                basket.addItem({id: self.id, size: self.size}, true);
            }
        })();


        //item add
        $('.pitem').length && (function(){
            var $curItem = $('.js-item-data'),
                itemData = eval('('+$curItem.data('item')+')'),
                $selectSize = $('.select_size',$curItem),
                $cost = $('.count',$curItem);

            var self = {};
            self.id = itemData.id;

            $selectSize.change(function(){
                var valSize = self.size = $(this).val(),
                    costRender,
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

            $('.js-buy').click(function(){
                if ($(this).is('.btn_cart-added')) return false;
                if ($selectSize.val() == '') {
                    $selectSize.closest('.pitem-size').addClass('size_empty');
                } else {
                    itemAdd();
                }
                return false;
            });

            function itemAdd() {
                var $btn = $curItem.find('.js-buy');
                $btn.text('ТОВАР В КОРЗИНЕ').addClass('btn_red btn_cart-added');
                basket.addItem({id: self.id, size: self.size}, true);
            }
        })();

    });
})(jQuery);