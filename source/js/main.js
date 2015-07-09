//////////////////
/****MAIN.JS****/
////////////////
Object.defineProperty(Array.prototype,"unique", {
    enumerable: false,
    value: function() {
        var o = {}, i, l = this.length, r = [];
        for(i=0; i<l;i+=1) o[this[i]] = this[i];
        for(i in o) r.push(o[i]);
        return r;
    }
});


function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
//pressed buy button
  function InitAddBasket() {
	$('.disabled').click(function(e){
	  var th = $(this);
	  if (th.hasClass('disabled'))
		return false;
	});

	$('.btnbuy').click(function(e){
	var btn = $(this);
	if (btn.attr('href')!='#') return true;
	e.preventDefault();
	var code = $(this).attr('data-item');
	var indicator = $('#goodies_total');
	var size = $('#item_size').val();
	$.ajax('/ajax/basket.html',{
		cache:false,
		type:'post',
		dataType:'json',
		data:{item:code,count:1,size:size},
		success: function(data,status,xhr){
			//if (data>0) {
				indicator.html(data);
				indicator.parent('a').removeClass('hidden'); //remove it later
				indicator.parent('a').removeClass('disabled');
				btn.html('В корзине');
				btn.attr('href','/basket/');
			//}
			//Добавлено в корзину..сообщение бы что ли
		}
	});

     });
  }
$(document).ready(function() {
    $('#requestcall').click(function(e){
        e.preventDefault();
        $('#callmeform').css('display','block');
    });
    $('#callmeform').find('input[name=cancel]').click(function(e){
        $('#callmeform').css('display','none');
    });
    $('#callmeform').find('input[name=send]').click(function(e){
        var form = $('#callmeform');
        var fio = form.find('input[name=fio]').val();
        var phone = form.find('input[name=phone]').val();
        if (fio.length<2) alert('Введите свои ФИО'); else
        if (phone.length<7) alert('Введите свой телефон'); else
        {
            $.ajax({
                url:'/ajax/forms.html',cache:false,type:'post',dataType:'json',
                data:{callme:{'fio':fio,'phone':phone,'who':'scr'}},
                success: function(data,status,xhr) {
                    alert(data['result']);
                    $('#callmeform').css('display','none');
                }
            });

        }
    });


    //rates
    $.each($('.rate div'), function(ind, k) {
        $(this).attr('data-bpos', $(this).attr('class'));
    });
    $('.rate').mousemove(function(e) {
        $(this).children('div').attr('class', '');
        $(this).children('div').addClass('stars' + Math.ceil(Math.floor(e.pageX - $(this).offset().left) / 14));
    });
    $('.rate').mouseleave(function(e) {
        $(this).children('div').attr('class', $(this).children('div').attr('data-bpos'));
    });
    //sliders
    /*$.each($('#sliders div'), function(ind, k) {
     if ($(this).children('a').size() > 1) {
     var nav_name = 'prb_nav' + ind;
     var mThis = $(this);
     $('body').append($('<div id="' + nav_name + '" class="prb_nav"></div>'));
     nav_name = '#' + nav_name;
     $(nav_name).css({
     top : mThis.position().top + mThis.height() - 20,
     left : mThis.position().left + 7,
     });
     //http://jquery.malsup.com/cycle/options.html
     mThis.cycle({
     fx : 'fade',
     speed : '1000',
     timeout : 1000,
     pager : nav_name

     });

     }
     });*/
    //DropDown


    //Viewport
    var minWidth = 1024;
    var scale = 1;
    if (window.screen.availWidth < minWidth)
        scale = window.screen.availWidth / minWidth;
    function setViewPort() {
        if (window.orientation == 0) {
            $('meta[name=viewport]').attr('content', 'initial-scale=' + scale + ', width=device-width')
        } else {
            $('meta[name=viewport]').attr('content', 'initial-scale=' + scale * (window.screen.availHeight / window.screen.availWidth) + ', width=device-height')
        }
    }

    if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
        $(window).bind('orientationchange', setViewPort);
    }
    setViewPort();
    //totop-a ^_^
    $('#totop a').click(function(e){
        e.preventDefault();
        $('html, body').animate({scrollTop:0});
    });



    $('.images .mini a').click(function(e){
        e.preventDefault();
        var th=$(this);
        var big = th.parent('.mini').parent('.images').children('.big');
        big.children('a').attr('href',th.attr('data-zoom-image'));
        big.children('img').attr('src',th.attr('data-image'));
    });

    $('#loginform .title a').click(function(e){$.fancybox.close()});
    $('#loginform input[name=ps]').click(function(e){
        $.ajax('/ajax/auth.html',{
            cache:false,type:'post',dataType:'json',
            data:{login:$('#loginform input[name=mail]').val(),password:$('#loginform input[name=password]').val()},
            success: function(data,status,xhr){
                if (data==true) {
                    window.location.reload();
                } else alert('Не верный e-mail или пароль.');
            }
        });
    });
    InitAddBasket();

});



$(document).ready(function() {
	$.each($('img[data-alternative]'),function(ind,val){
		var aimg = new Image;
		var img = $(val);
		aimg.src = img.attr('data-alternative')
		img.attr('data-original',img.attr('src'));
		$(aimg).load(function(e){
			img.hover(function(e){
				$(this).attr('src',$(this).attr('data-alternative'));
			},function(e){
				$(this).attr('src',$(this).attr('data-original'));

			});
		});
	});


});


(function($){
    $(function(){
        if ($.browser.msie) {
            $("html").addClass("ie");
        }

        setTimeout(function() {
            $('select, input[type=checkbox]').not('.no-styler').styler({selectSearch:false});
        }, 100);


        $('.select_size, .select_size-order ').CustomSelect({visRows:4});
        $('.select-scroll').CustomSelect({visRows:8});
        $('.pitem-specs__spoilers .folding').folding({openHeight: 163, closeOther: '.pitem-specs__spoilers .spoiler-item'});
        $('.left .folding').folding({openHeight: 200});
        $('.content-text__side .folding').folding({openHeight: 500});
        $('.order-spoiler').folding({closeOther: '.order-spoiler'});


        $(".phone-mask").mask("+7 (999) 999-99-99");

        $('.popup .close').click(function(e){
            e.preventDefault();
            closePopup($(this).closest('.popup'));
        });

        $('.btn_cart-added').hover(function(){
            //$(this).removeClass('btn_red').text('купить');
        });

        $('body').on('click','.size_empty',function() {
            $(this).removeClass('size_empty');
        });

        $('.basket-items__holder').dropdown({
            link: '.js-basket-open',
            afterClose: function() {
              $('.basket-item.a' +
                  'ctive').removeClass('active');
            }
        });

        $('.shipment-info__holder').dropdown({
            link: '.js-shipment-info'
        });

        $('.call-info__holder').dropdown({
            link: '.js-call'
        });

        $('.login-dropdown__holder').dropdown({
            link: '.js-login-open'
        });

        $('.call-form').callForm({
            msgCont: '.call-info__body'
        });



        //subscribe
        $('.subscribe').subscribe();



        //tooltips
        Tipped.create('.tooltip', '', {
            maxWidth: 290
        });

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

        //main menu
        var $h= $('.header-menu'),
            hTop = $h.offset().top,
            $fade =  $('<div class="fade fade-fixed"></div>');

        $fade.css('z-index',400);
        $('body').append($fade);

        $(window).bind('scroll.menu',function(e){
            var $this = $(this),
                thisScroll = $this.scrollTop();
            if (!$h.is('.fixed') && thisScroll > hTop) {
                $('.dropdown_top').trigger('close');
            }
            $h.toggleClass('fixed',thisScroll > hTop);
        });

        $('.main-menu__item',$h).hover(function(){
            if ($('.main-menu__collection',$(this)).length) {
                $fade.stop().fadeIn(400);
            }
        },function(){
           //if (!window.dropDownIsOpen) {
               $fade.stop().fadeOut(400);
           //}
        });
        $(window).trigger('scroll.menu');


        //catalog slider + video
        var $itemList = $('.itemlist'),
            isSlide = false;
        $itemList.on('mouseenter','.item',function(){
            var $self = $(this),
                $slider = $('.slider-contaniner', $self);

            if ($self.find('.stop').length) return;
            if ($slider.data('plugin') == 'bxslider') {
                $slider.data('bxslider').startAuto();
            } else {
                var thisSlider = $slider.bxSlider({
                    mode: 'fade',
                    slideWidth: 255,
                    pause: 300,
                    speed: 200,
                    auto: true,
                    pager: false,
                    controls: false,
                    onSlideBefore: function() {
                        if (!isSlide) {
                            thisSlider.stopAuto();
                            thisSlider.updatePause(1300);
                            thisSlider.startAuto();
                            isSlide = true;
                        }
                    }
                });

                $slider.data('bxslider',thisSlider);
            }
            $self.addClass('hovered');
        });

        $itemList.on('mouseleave','.item',function(){
            var $self = $(this),
                $slider = $('.slider-contaniner', $self);
            if ($slider.data('plugin') == 'bxslider') {
                $slider.data('bxslider').goToSlide(0);
                $slider.data('bxslider').stopAuto();
                $slider.data('bxslider').updatePause(200);
                isSlide = false;
            }
            $self.removeClass('hovered');
        });

        var videoPlay = false;

        $itemList.on('click','.play',function(){
            var $self = $(this),
                $parent =  $self.closest('.item'),
                $containerVideo = $('.item-preview__video', $parent),
                $video = $('video',$containerVideo),
                $slider = $('.slider-contaniner',$parent);

            if ($self.is('.stop')) {
                $self.removeClass('stop');
                $video[0].pause();
                $containerVideo.fadeOut(500, function(){
                    if ($slider.data('bxslider') && $parent.is('.hovered')) {
                        $slider.data('bxslider').startAuto();
                    }
                })
            } else {
                $self.addClass('stop');
                $containerVideo.fadeIn(500, function(){
                    if ($slider.data('bxslider')) {
                        $slider.data('bxslider').stopAuto();
                        $slider.data('bxslider').goToSlide(0);
                    }
                    $video[0].play();
                })
            }
        });

        //all sliders
        var allSliders = [
            {
                sliderClass: '.catdes_catalog .catdes-slider',
                options: {
                    pager: false,
                    maxSlides: 5,
                    infiniteLoop: false,
                    slideMargin: 2,
                    slideWidth: 222,
                    mode: 'horizontal',
                    onSliderLoad: function() {

                    }
                }
            },
            {
                sliderClass: '.catdes_pitem .catdes-slider',
                options: {
                    pager: false,
                    maxSlides: 4,
                    infiniteLoop: false,
                    slideMargin: 0,
                    slideWidth: 234,
                    mode: 'horizontal',
                    onSliderLoad: function() {

                    }
                }
            },
            {
                sliderClass: '.pitem-slider_side',
                checkLength: 4,
                options: {
                    pager: false,
                    minSlides: 4,
                    infiniteLoop: false,
                    slideMargin: 23,
                    mode: 'vertical',
                    onSliderLoad: function() {

                    }
                }
            },
            {
                sliderClass: '.pitem-slider_full',
                options: {
                    pager: false,
                    maxSlides: 4,
                    infiniteLoop: false,
                    slideMargin: 23,
                    slideWidth: 108,
                    mode: 'horizontal',
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
                    slideMargin: 9,
                    slideWidth: 108,
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
                    slideWidth: 1020,
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
                    controls: true,
                    pager: true,
                    auto: false,
                    responsive: true,
                    onSliderLoad: function(currentIndex) {
                       /* var $item = $('.slider-item',this.$self).eq(currentIndex);
                        if ($item.is('.slider-item__prlx')) {
                            console.log($item.find('.bg'));
                            initBannerPrlx($item.find('.bg'));
                        }*/
                        this.$self.addClass('loaded');
                        $('.main-banner .prlx-item').prlx();
                    },
                    onSlideAfter: function($item) {
                        /*$(window).off('scroll.banner');*/
                        if ($item.is('.prlx-item')) {
                            $item.trigger('update');
                        }
                    }
                }
            }
        ];
        sliderConstructor(allSliders);

        //smooth scroll
        smoothScrollInit();

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

            $('.itemlist').on('click','.js-buy',function(e) {
                e.preventDefault();
                if ($(this).is('.btn_cart-added')) return false;
                $curItem = $(this).closest('.js-item-data');
                var itemData = eval('('+$curItem.data('item')+')');
                var imgSrc = $curItem.find('.slider-item:first-child img').attr('src');
                self = itemData;
                if (itemData.sizes  && itemData.sizes.length) {
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
                $btn.text('ТОВАР В КОРЗИНЕ').addClass('btn_cart-added');
                console.log(self);
                basket.addItem(self, true);
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

                            if (property === valSize) {
                                cost = itemData.sizes[i][property];
                                break;
                            }
                        }
                    }
                    $cost.html(cost);
                }
                $('.js-buy').removeClass('btn_red').text('купить');
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

    $(window).load(function(){
        //banner prlx
        $('.seo-main').prlx();
    })



})(jQuery);

function smoothScrollInit () {
    var platform = navigator.platform.toLowerCase();
    if (platform.indexOf('win') == 0 || platform.indexOf('linux') == 0) {
        if  (!$.browser.opera) {
            $.srSmoothscroll({
                step: 100,
                speed: 600,
                preventOn: '.nano-scroll, .b-custom-select__dropdown__inner'
            });
        }
    }
}

function closePopup ($popup) {
    $popup.fadeOut();
    $('.fade:visible').fadeOut();
    $(window).trigger('popupClosed', [$popup]);
}


var ajxLoader  = (function() {

    return {
        attachTo: function ($elm, posProc) {
            if (!$elm) return false;
            this.attechedTo = $elm;
            var $self = $('.loader'),
                $icon = $('.loader .loader__icon');
            var pos = this.attechedTo.offset();
            var posIcon = posProc;
            this.attechedTo.prepend($self);
            this.attechedTo.addClass('ajx-loader');
        },
        _detach: function () {
            if (this.attechedTo) {
                this.attechedTo.removeClass('ajx-loader');
                //$self.detach();
                this.attechedTo = null;
            }
        }
    }
})();