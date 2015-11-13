global.jQuery = $ =  require("jquery");
var Mustache = require('mustache');
require('jquery.browser');

require('./vendor/jquery.maskedinput');
require('./vendor/size.scroll');
require('./vendor/jquery.formstyler.min');

require('./vendor/jquery.bxslider');
require('./lib/folding.plugin');
require('./lib/dropdown.plugin');
require('./lib/subscribe');

require('./mobile/changeTown');
require('./mobile/main-nav');
var sliderConstructor = require('./lib/constructor.bxslider');
var Basket = require('./components/basket');

    $(function(){

        setTimeout(function() {
            $('input[type=checkbox]').not('.no-styler').styler({selectSearch:false});
        }, 100);

        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {

            function setViewPort() {
                var ww = ( $(window).width() < window.screen.width ) ? $(window).width() : window.screen.width; //get proper width
                var mw = 480; // min width of site
                var ratio =  ww / mw; //calculate ratio
                if( ww < mw){ //smaller than minimum size
                    $('#Viewport').attr('content', 'initial-scale=' + ratio + ', maximum-scale=' + ratio + ', minimum-scale=' + ratio + ', user-scalable=yes, width=' + ww);
                }else{ //regular size
                    $('#Viewport').attr('content', 'initial-scale=1.0, maximum-scale=2, minimum-scale=1.0, user-scalable=yes, width=' + ww);
                }
            }
            $(window).bind('orientationchange', setViewPort);
            setViewPort();
        }


        $('.pitem-specs__spoilers .folding, .filter-pane__items .folding').folding();
        $('.content-text__side .folding').folding({openHeight: 500});
        $('.order-spoiler').folding({closeOther: '.order-spoiler'});
        $(".phone-mask").mask("+7 (999) 999-99-99");

        $('.popup .close').click(function(e){
            e.preventDefault();
            closePopup($(this).closest('.popup'));
        });

        $('.btn_cart-added').hover(function(){
            $(this).removeClass('btn_red').text('купить');
        });

        $('body').on('click','.size_empty',function() {
            $(this).removeClass('size_empty');
        });

        /*$('.basket-items__holder').dropdown({
            link: '.js-basket-open',
            fade: false
        });*/

        $('.login-dropdown__holder').dropdown({
            link: '.js-login-open'
        });



        //subscribe
        $('.subscribe').subscribe();


        //scrollTop
        var $st = $('.scroll-top'),
            $stLink = $('.scroll-top__link');

        $stLink.click(function(e){
            e.preventDefault();
            $('html, body').animate({
                scrollTop: 0
            })
        });

        $(window).scroll(function(){
            var $this = $(this);
            var thisScroll = $this.scrollTop();
            if (thisScroll > 300) {
                if (!$st.is(':visible')) {
                    $st.stop().fadeIn();
                }
            } else {
                if ($st.is(':visible') && !$st.is(':animated')) {
                    $st.stop().fadeOut();
                }
            }
        });


        //catalog slider + video

        //all sliders
        var allSliders = [
            {
                sliderClass: '.pitem-slider_full',
                options: {
                    pager: false,
                    maxSlides: 1,
                    infiniteLoop: false,
                    mode: 'horizontal',
                    responsive: true,
                    onSliderLoad: function() {

                    }
                }
            },
            {
                sliderClass: '.complect-slider',
                options: {
                    pager: false,
                    maxSlides: 3,
                    infiniteLoop: false,
                    slideMargin: 15,
                    slideWidth: 108,
                    responsive: true,
                    mode: 'horizontal',
                    onSliderLoad: function() {

                    }
                }
            },
            {
                sliderClass: '.itemlist-slider',
                options: {
                    pager: false,
                    maxSlides: 1,
                    infiniteLoop: false,
                    slideMargin: 0,
                    responsive: true,
                    mode: 'horizontal',
                    onSliderLoad: function() {

                    }
                }
            },
            {
                sliderClass: '.main-banner__slider',
                options: {
                    infiniteLoop: true,
                    slideMargin: 0,
                    controls: false,
                    responsive: true,
                    pager: true,
                    auto: false,
                    onSliderLoad: function(currentIndex) {

                        this.$self.addClass('loaded');
                    },
                    onSlideAfter: function($item) {

                    }
                }
            },
            {
                sliderClass: '.item-preview__slider',
                checkLength: 1,
                options: {
                    slideWidth: 255,
                    infiniteLoop: false,
                    pager: false,
                    auto: false,
                    responsive: true,
                    controls: false,
                    mode: 'horizontal',
                    onSliderLoad: function() {
                    }
                }
            }
        ];
        sliderConstructor(allSliders);

        ///basket
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

            function setPopupPosition()
            {
                var thisOffset = $('.js-buy', $curItem).offset();
                $sizePopup.css({top: thisOffset.top - 121, left: thisOffset.left - 28});
            }

            $(window).resize(setPopupPosition);
            $('.itemlist').on('click','.js-buy',function(e) {
                e.preventDefault();
                if ($(this).is('.btn_cart-added')) return;
                $curItem = $(this).closest('.js-item-data');
                var itemData = eval('('+$curItem.data('item')+')');
                var imgSrc = $curItem.find('.slider-item:first-child img').attr('src');
                self.id = itemData.id;
                if (itemData.sizes && itemData.sizes.length) {
                    var renderData = {
                        sizes: itemData.sizes,
                        size: function() {
                            for ( property in this ) {
                                return property;
                            }
                        },
                        img: imgSrc
                    };
                    var rendered = Mustache.render(htmlInner, renderData);
                    $sizePopupInner.html(rendered);
                    setPopupPosition();
                    $sizePopup.show();
                    $selectSize = $('.select_size',$sizePopup);
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
                $btn.text('ТОВАР В КОРЗИНЕ').addClass('btn_cart-added');
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
            window.isSizeSelect = itemData.sizes&&itemData.sizes.length?false:true;

            var optionsHtml = '<option value="">размер</option>';
            for (var i in itemData.sizes) {
                for (var property in itemData.sizes[i] ) {
                    optionsHtml += '<option value="'+property+'">'+property+'</option>';
                }
            }

            $selectSize.html(optionsHtml).trigger('update');

            $selectSize.change(function(){
                var valSize = self.size = $(this).val(),
                    costRender,
                    cost;
                if (valSize) {
                    $selectSize.find('option[value=""]').remove();
                    $selectSize.trigger('update');
                    for (var i in itemData.sizes) {
                        for (var property in itemData.sizes[i] ) {

                            if (property === valSize) {
                                cost = itemData.sizes[i][property];
                                break;
                            }
                        }
                    }
                    $cost.html(cost);
                    window.isSizeSelect = true;
                } else {
                    window.isSizeSelect = false;
                }
                $('.js-buy').removeClass('btn_red').text('купить');
                $('.js-quick-order').removeClass('btn_red').text('быстрый заказ');
            });

            $('.js-buy').click(function(){
                var $this = $(this);
                if ($this.is('.btn_cart-added') || $this.is('.btn_red')) return false;
                if ($selectSize.val() == '' && itemData.sizes) {
                    $selectSize.closest('.pitem-size').addClass('size_empty');
                    $this.addClass('btn_red').text('выберите размер');
                } else {
                    itemAdd();
                }
                return false;
            });

            function itemAdd() {
                var $btn = $curItem.find('.js-buy');
                $btn.text('ТОВАР В КОРЗИНЕ').addClass('btn_cart-added');
                basket.addItem({id: self.id, size: self.size}, true);
            }
        })();
    });


function closePopup ($popup) {
    $popup.fadeOut();
    $('.fade:visible').fadeOut();
    $(window).trigger('popupClosed', [$popup]);
}
