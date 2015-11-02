$(document).ready(function() {
    $('#refreshbasket').click(function(e){
        var request = [];
        $.each($('.goods input[name=field]'),function(ind,val){
            request.push({item:$(val).attr('data-code'),count:$(val).val()});
        });
        $.ajax({
            url:'/ajax/basket.html',cache:false,type:'post',dataType:'json',
            data:{items:request},
	    success: function(data,status,xhr){
		if (data>0){
                    window.location.reload();
                } else alert('������ �������');
            }
        });
    });
    
    $('#clearbasket').click(function(e){
        $.ajax({
            url:'/ajax/basket.html',cache:false,type:'post',dataType:'json',
            data:{clear:true},
	    success: function(data,status,xhr){
                window.location.href = '/';
            }
        });
    });

    $('.bdelete').click(function(e){
        var code = $(this).attr('data-item');
        //var elem = $(this).parent('td').parent('tr');
        $.ajax({
            url:'/ajax/basket.html',cache:false,type:'post',dataType:'json',data:{items:[{item:code,count:0}]},
	    success: function(data,status,xhr){
		if (data===0) window.location.href = '/'; else
                window.location.reload();
            }
        });
    });


});

