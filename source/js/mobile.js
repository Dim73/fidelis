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
        //$(window).bind('orientationchange', setViewPort);
    }



   // setViewPort();
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

        setTimeout(function() {
          //  $('select, input[type=checkbox]').not('.no-styler').styler({selectSearch:false});
        }, 100);


        $('.pitem-specs__spoilers .folding').folding({openHeight: 163, closeOther: '.pitem-specs__spoilers .spoiler-item'});
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
            link: '.js-login-open',
            fade: false
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
                    pager: true,
                    auto: false,
                    onSliderLoad: function(currentIndex) {

                        this.$self.addClass('loaded');
                    },
                    onSlideAfter: function($item) {

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

})(jQuery);

function closePopup ($popup) {
    $popup.fadeOut();
    $('.fade:visible').fadeOut();
    $(window).trigger('popupClosed', [$popup]);
}

