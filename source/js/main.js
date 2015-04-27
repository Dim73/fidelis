//////////////////
/****MAIN.JS****/
////////////////
Array.prototype.unique = function() {
        var o = {}, i, l = this.length, r = [];
        for(i=0; i<l;i+=1) o[this[i]] = this[i];
        for(i in o) r.push(o[i]);
        return r;
};

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
	var strReplace = "Р";
	$( ".rub" ).html( strReplace );
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
	$.each($('#sliders div'), function(ind, k) {
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
	});
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

   //Tooltips
   $('.specs .params span[title]').tooltip({position: { my: "left center+18", at: "right center" }});
   $('.specs .buttons .buttons a').tooltip({position: { my: "left center+18", at: "right center" }});
   $('.item .buttons a').tooltip({position: { my: "left center+18", at: "right center" }});
   $('.basket .tip').tooltip({position: { my: "left center+18", at: "right center" }});
  //scrollbars
   function scrollbar_event(deltay,list,scrbarui,scrbox){
      var maxmargin = scrbox.height()-list.height()+(parseInt(scrbox.css('padding-top'))+parseInt(scrbox.css('padding-bottom')));
      var newvalue = scrbarui.slider( "option", "value" );
      var modifier = 19/(maxmargin/100); //19 ~ one item

      newvalue = parseInt(newvalue+deltay*modifier);
      if(newvalue<0) newvalue=0; else
      if(newvalue>100) newvalue=100;

      scrbarui.slider( "option", "value", newvalue );

      scrbox.css('margin-top',-1*parseInt((maxmargin/100)*(100-newvalue)));
   }
     //scrollbar right block
     $.each($('.right .block .list'),function(ind,elem){
      var list = $(this);
      var scrbox = list.children('.scrollbox');
      var scrbar = list.children('.scrollbar');
      var scrbarui = list.children('.scrollbar').children('.scrui');
      scrbarui.css('height',list.height()-93);
      if(list.height()>=(scrbox.height()+parseInt(scrbox.css('padding-top'))+parseInt(scrbox.css('padding-bottom')))) {
         list.children('.scrollbar').css('display','none');
      }
      else {
        list.children('.scrollbar').css('display','block');
        scrbarui.slider({
           orientation: "vertical",
              range: "min",
              min: 0,
              max: 100,
              value: 100,
              slide: function( event, ui ) {
                var maxmargin = scrbox.height()-list.height()+parseInt(scrbox.css('padding-top'))+parseInt(scrbox.css('padding-bottom'));
                scrbox.css('margin-top',-1*parseInt((maxmargin/100)*(100-ui.value)));
              }});
         scrbox.mousewheel(function(e,delta,deltax,deltay) {
            e.preventDefault;
            scrollbar_event(deltay,list,scrbarui,scrbox);
            return false;
         });
         scrbar.mousewheel(function(e,delta,deltax,deltay){
            e.preventDefault;
            scrollbar_event(deltay,list,scrbarui,scrbox);
            return false;
         });

      }
    });
     //scrollbar comments
     $.each($('.left .comments .list'),function(ind,elem){
      var list = $(this);
      var scrbox = list.children('.scrollbox');
      var scrbar = list.children('.scrollbar');
      var scrbarui = list.children('.scrollbar').children('.scrui');
      scrbarui.css('height',list.height()-93);
      if(list.height()>=(scrbox.height()+parseInt(scrbox.css('padding-top'))+parseInt(scrbox.css('padding-bottom')))) {
         list.children('.scrollbar').css('display','none');
      }
      else {
        list.children('.scrollbar').css('display','block');
        scrbarui.slider({
           orientation: "vertical",
              range: "min",
              min: 0,
              max: 100,
              value: 100,
              slide: function( event, ui ) {
                var maxmargin = scrbox.height()-list.height()+parseInt(scrbox.css('padding-top'))+parseInt(scrbox.css('padding-bottom'));
                scrbox.css('margin-top',-1*parseInt((maxmargin/100)*(100-ui.value)));
              }});
         scrbox.mousewheel(function(e,delta,deltax,deltay) {
            e.preventDefault;
            scrollbar_event(deltay,list,scrbarui,scrbox);
            return false;
         });
         scrbar.mousewheel(function(e,delta,deltax,deltay){
            e.preventDefault;
            scrollbar_event(deltay,list,scrbarui,scrbox);
            return false;
         });

      }
    });

  $('#subscribe input[type=submit]').click(function(e){
	e.preventDefault();
	var mail = $('#subscribe input[name=subscribe]').val();
	if(validateEmail(mail)) {
		$.ajax({
			url:'/ajax/forms.html',cache:false,type:'post',dataType:'json',
			data:{subscribe:mail},
			success: function(data,status,xhr){
				alert(data['result']);
				$('#subscribe input[name=subscribe]').val('');
			}
		});

	} else alert('Введите существующий e-mail адрес.');
  });

  //fancybox
  $('.zoom').fancybox({padding:5});
  $('.loginbtn').fancybox({padding:0,'hideOnContentClick': false, closeBtn:false, autoSize:false, modal:true, width:'550px', height:'208px'});


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
        $('select, input[type=checkbox]').not('.no-styler').styler({selectSearch:false});

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
            }
        ];
        sliderConstructor(allSliders);
        $('.select_size').CustomSelect({visRows:4});
        $('.pitem-specs__spoilers .folding').folding({openHeight: 163});
    });
})(jQuery);