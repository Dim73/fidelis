function htmlEncode(value){
  return value.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

$(document).ready(function() {

    function order_success (data,status,xhr) {
      console.log(data);
      console.log(status);
      console.log(xhr);
      console.log(data.yandex);
      
      var yaParams = data.yandex;
      var yaCounter25308683 = new Ya.Metrika({id: 25308683, params:data.yandex});
      
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
      else 
      if (data.type=='ok') {
	     alert('Заказ успешно отправлен. В ближайшее время наш менеджер свяжется с вами.');
	     window.location.href='/';
	   }	    
	   } else {
	       alert('Заказ успешно отправлен. В ближайшее время наш менеджер свяжется с вами.');
	       window.location.href='/';
	   }
    }

    $('#fastorder[data-auth=true] input[type=button][name="order"]').click(function(e){e.preventDefault();
	var formv = {
            name:$('#fastorder input[name=name]').val(),
            family:$('#fastorder input[name=family]').val(),
            phone:$('#fastorder input[name=phone]').val(),
            city:$('#fastorder [name=city]').val(),
            postindex:$('#fastorder input[name=postindex]').val(),
            address:$('#fastorder textarea[name=address]').val(),
            delivery:$('#fastorder select[name=delivery]').val(),
            paytype:$('#fastorder input[name=paytype]:checked').val(),
            confirm:$('#fastorder input[name=confirm]').is(':checked')
        };

	//if ($('.selected_delivery select[name=city]')) {
	//    if($('.selected_delivery select[name=city]').length>0)
	//	formv.spsr_city=$('.selected_delivery select[name=city]').val();
	//}
	if ($('.selected_delivery_cost select[name=spsr_delivery_tariff]')) {
	    if($('.selected_delivery_cost select[name=spsr_delivery_tariff]').length>0)
		formv.spsr_delivery=$('.selected_delivery_cost select[name=spsr_delivery_tariff]').val();
	}

	//if (typeof debugmode !='undefined') {
	//    formv.testmode = true;
	//}

	if (formv['name'].length>2) {
        if (formv['family'].length>2) {
        if (formv['phone'].length>2) {
        if (formv['city'].length>2||formv['city']>0) {
        //if (formv['address'].length>2) {
        if (formv['confirm']) {
	    //if (typeof debugmode !='undefined') console.log(formv); else
            $.ajax({
                url:'/ajax/forms.html',cache:false,type:'post',dataType:'json',
                data:{order:formv},
        	success: order_success
            });
        } else alert('Вы не приняли правила и условия доставки и продажи');
        //} else alert('Вы не указали адрес для доставки');
        } else alert('Вы не указали город');
        } else alert('Введите контактный телефон');
        } else alert('Введите Вашу фамилию');
        } else alert('Введите Ваше имя');

    });
    $('#fastorder[data-auth=false] input[type=button][name="order"]').click(function(e){e.preventDefault();
        var formv = {
            name:$('#fastorder input[name=name]').val(),
            family:$('#fastorder input[name=family]').val(),
            phone:$('#fastorder input[name=phone]').val(),
            mail:$('#fastorder input[name=mail]').val(),
            city:$('#fastorder [name=city]').val(),
            postindex:$('#fastorder input[name=postindex]').val(),
            address:$('#fastorder textarea[name=address]').val(),
            delivery:$('#fastorder select[name=delivery]').val(),
            paytype:$('#fastorder input[name=paytype]:checked').val(),
            confirm:$('#fastorder input[name=confirm]').is(':checked'),
            wannaaction:$('#fastorder input[name=wannaaction]').is(':checked')
        };

	//if ($('.selected_delivery select[name=city]')) {
	//    if($('.selected_delivery select[name=city]').length>0)
	//	formv.spsr_city=$('.selected_delivery select[name=city]').val();
	//}
	if ($('.selected_delivery_cost select[name=spsr_delivery_tariff]')) {
	    if($('.selected_delivery_cost select[name=spsr_delivery_tariff]').length>0)
		formv.spsr_delivery=$('.selected_delivery_cost select[name=spsr_delivery_tariff]').val();
	}

	//if (typeof debugmode !='undefined') {
	//    formv.testmode = true;
	//}

	//console.log(formv['city']);
        if (validateEmail(formv['mail'])) {
        if (formv['name'].length>2) {
        if (formv['family'].length>2) {
        if (formv['phone'].length>2) {
        if (formv['city'].length>2||formv['city']>0) {
        //if (formv['address'].length>2) {
        if (formv['confirm']) {
	    //if (typeof debugmode !='undefined') console.log(formv); else
            $.ajax({
                url:'/ajax/forms.html',cache:false,type:'post',dataType:'json',
                data:{order:formv},
        	success: order_success
            });
        } else alert('Вы не приняли правила и условия доставки и продажи');
        //} else alert('Вы не указали адрес для доставки');
        } else alert('Вы не указали город');
        } else alert('Введите контактный телефон');
        } else alert('Введите Вашу фамилию');
        } else alert('Введите Ваше имя');
        } else alert('Введите существующий email');
    });
    $('#userlogin input[type=button][name="login"]').click(function(e){e.preventDefault();
	var formv = {
	    login:$('#userlogin input[name=login]').val(),
            password:$('#userlogin input[name=password]').val()
	};
	 $.ajax({
                url:'/ajax/auth.html',cache:false,type:'post',dataType:'json',
                data:{auth:formv},
        	success: function(data,status,xhr){
                    if (data) {
			window.location.href='/order.html';
		    } else {
			alert('Неправильный логин или пароль');
		    }
                }
            });
    });

    $('#userlogin #lostpass').click(function(e){e.preventDefault();
        //alert('lost pass');
    });


    $('#register input[type=button][name="register"]').click(function(e){e.preventDefault();
	var formv = {
	name:$('#register input[name=name]').val(),
	family:$('#register input[name=family]').val(),
	phone:$('#register input[name=phone]').val(),
	mail:$('#register input[name=mail]').val(),
	city:$('#register input[name=city]').val(),
	wannaaction:$('#register input[name=wannaaction]').is(':checked')
	};
	if (validateEmail(formv['mail'])) {
        if (formv['name'].length>2) {
        if (formv['family'].length>2) {
	if (formv['phone'].length>6) {
        if (formv['city'].length>2) {
            $.ajax({
                url:'/ajax/forms.html',cache:false,type:'post',dataType:'json',
                data:{register:formv},
        	success: function(data,status,xhr){
                    if(typeof(data) == 'object') alert(data['result']);
		    else if (data) {
			window.location.href='/personal.html';
		    }
                }
            });
        } else alert('Вы не указали город');
	} else alert('Вы не указали телефон');
        } else alert('Введите Вашу фамилию');
        } else alert('Введите Ваше имя');
        } else alert('Введите существующий email');
    });


    var deliveries = {};

    $('select[name=delivery]').change(function(e){
	var v = $(this).val();
	console.log(v);

	if (v=='courier' || v=='self') {
	    $('.selected_delivery_cost').html('');
	    $('.selected_delivery').html(deliveries.courier);
	//    $.each($('select[name=paytype] option'),function(ind,val){
	//	$(val).css('display','block');
	//    });
	} else
	if (v=='spsr_regions') {
	    $('.selected_delivery').html(deliveries.spsr_regions);
	//    $('select[name=paytype] option[value=cashlesscard]').css('display','none');
	//    if ($('select[name=paytype]').val()=='cashlesscard') {
	//	$("select[name=paytype]").val($("select[name=paytype] option:first").val());
	//    }

	    $('select[name=city]').change(function(e){
		$.ajax({
		    url: '/ajax/calculate.html',
		    data: {ToCity:$(this).val()},
		    dataType:'json',
		    success:function(data,status,xhr) {
			if (typeof data.error !='undefined') {
			    $('.selected_delivery_cost').html('Рассчитать стоимость доставки не удалось, уточняйте у оператора');
			} else {
			    $('.selected_delivery_cost').html('');
			    var options = '<label>Варианты доставки:<select name="spsr_delivery_tariff">';
			    $.each(data.tariff,function(ind,val){
				options+='<option value="'+htmlEncode(val.name)+'">'+val.name+' ('+val.days+' дней) - '+val.cost+' руб.</option>';
			    });
			    options+='</select></label>';
			    $('.selected_delivery_cost').append(options);
			}
		    },
		    error:function (xhr,status,error){
		    }
		});

	    });

	    $('select[name=region]').change(function(e){
		var cities = $('select[name=city]');
		cities.empty();
		$.each(region_cities[$(this).val()],function(item,val){
		    cities.append('<option value="'+val.id+'">'+val.name+'</option>');
		});
		$('select[name=city]').change();
	    });

	    $('select[name=region]').change();
	}

    });


    deliveries.courier = $('.delivery_courier').html();
    deliveries.self = deliveries.courier;
    deliveries.spsr_regions = $('.delivery_spsr_regions').html();
    $('.delivery_courier').remove();
    $('.delivery_spsr_regions').remove();
    $('select[name=delivery]').change();


});