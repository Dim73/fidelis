$(document).ready(function() {
  var filter = $('#itemsfilterresult');
  var filters = {};
  var viewed = 0;
  var total = 0;
  var requeststatus=false;
  var $costSlider = $("#price-slider");
  //filter.html('');
 //right toggle
  /*$('.left .block .rheader a').click(function(e){
    e.preventDefault();ч
    var par = $(this);
    $(this).parent('.rheader').parent('.block').children('.list').slideToggle(300,function(){
      if($(this).css('display')=='none')
          par.html('<img src="/images/toggle_btnr.png">'); else
          par.html('<img src="/images/toggle_btn.png">');
    });
  });
  //right checkboxes
  $('.left .block .scrollbox label, .left .block .square_sizes label').click(function(e){
    var th = $(this);
    var chbox = th.children('input[type=checkbox]:checked').length;
    if(chbox==1) th.addClass('checked'); else th.removeClass('checked');
  });
  $.each($('.left .block .scrollbox label, .left .block .square_sizes label'),function(ind,val){
    var th = $(val);
    var chbox = th.children('input[type=checkbox]:checked').length;
    if(chbox==1) th.addClass('checked'); else th.removeClass('checked');
  });*/

  //right cost slider
    $costSlider

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
    })
    .slider("float");

  /*$('.left .cost .slider').slider({
    orientation: "horizontal",
      range: true,
      min: 0,//parseInt($('#mincost').attr('data-min')),
      max: parseInt($('#maxcost').attr('data-max')),
      step: 1,
      values: [ *//*parseInt($('#mincost').attr('data-min'))*//*0, parseInt($('#maxcost').attr('data-max')) ],
      slide: function( event, ui ) {
        $('#mincost').val(ui.values[0]);
        $('#maxcost').val(ui.values[1]);
    }});*/
  if($('#mincost').val()!='' && $('#maxcost').val()!='')
      $costSlider.slider( "option", "values", [ parseInt($('#mincost').val()), parseInt($('#maxcost').val())]);

  function filtersidebars(ind,val) {
    if (val.length == 0) {
      $('input[data-filter='+ind+']:not(:checked)').closest('li').hide();

    } else {

      $.each($('input[data-filter='+ind+']'),function(ind2,val2) {

        if($.inArray($(val2).data('value'),val) > -1)
          $(val2).closest('li').show(); else
          $(val2).closest('li').hide()
      });
        $('.left .nano-scroll').nanoScroller();
    }
    //alert(ind+' '+val);
    //Hide clear lists
    /*Example
     *$('tr').filter(function() {
      return $(this).css('display') !== 'none';
    }).length;*/
  }

  function filterappend(html) {
    var t = $(html);
    //update top panel filter events
    if(t.hasClass('filter_item')) {
        t.on('click',function (e) {
            e.preventDefault();
//        var filt = $(this).parent('.filter_item');
            var type = t.data('filter');
            var value = t.data('value');
            switch (type) {
                case 'type':
                case 'style':
                case 'collection':
                case 'brand':
                case 'insert':
                case 'cover':
                case 'metals':
                case 'size':         //////????
                    $('.left input[type=checkbox][data-filter=' + type + '][data-value="' + value + '"]').prop('checked',false).trigger('change');
                    t.remove();
                    break;
                case 'cost':
                    $costSlider.slider("option", "min", null);
                    $costSlider.slider("option", "values", [null, null]);
                    $('#mincost').val('');
                    $('#maxcost').val('');
                    t.remove();
                    break;
            }
        });
    }

    filter.append(t);
  }

    var documentTitle = document.title;

    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var curState = History.getState(); // Note: We are using History.getState() instead of event.state
        makefilter(curState.data.filters);
    });


    function makeUri() {
        var f =[];
        $.each(filters,function(ind,val){if(val!='') f.push(ind+'='+val);});
        if(filters['items_per_page']=='all'){
            viewed = $('.itemlist .item').length;
            f.push('actpage='+((viewed/12)+1));
        } else {
            if($('.pageswitch .active').length>0) f.push('actpage='+$($('.pageswitch .active').get(0)).text());
        }
        return f;
    }

    function changeState() {
        var f = makeUri();
        var uri  = f.join('&');
        History.pushState({filters:uri }, documentTitle, '?'+uri);
    }

    function makefilter(f){
      //begin request
        var uri  = f || '';
     //update static links ^_^
     $('.left .list ul a').attr('href',window.location.pathname+(uri?'?'+uri:''));
     if (!requeststatus) {

     $.ajax('../../source/back/catalogue.html?'+uri,{///ajax/catalogue.html?
       cache:false,
       type:'get',
       dataType:'json',
       beforeSend: function(xhr,setting) {
          requeststatus = true;
           ajxLoader.attachTo($('.right'));
       },
       success: function(data,status,xhr) {
         if(filters['items_per_page']!='all'){
          $('.itemlist').html('');
         }


           //if (data['debug']!==null) alert(data['debug']);
         $.each(data['filters'],filtersidebars);
         $('.itemlist').append(data['items']);
         $('.pageswitch').html(data['pageswitch']);
         $costSlider.slider( "option", "min",  /*parseInt(data['cost']['min'])*/0 );
         $costSlider.slider( "option", "max", /*parseInt(data['cost']['max'])*/ parseInt($('#maxcost').attr('data-max')) );

         viewed = $('.itemlist .item').length;
         total = data['count'];
//         InitAddBasket();
          $('.left .nano-scroll').nanoScroller();
           $('.left .folding').trigger('update');
       },
       complete:function(xhr,status) {
         requeststatus = false;
           ajxLoader._detach();
       }
      });
     }
     //no ajax version
     //window.location.href = window.location.protocol+'//'+window.location.hostname+window.location.pathname+'?'+f.join('&');
  }

  filters['items_sort_order']=$('.setcatorder').val();
  filters['items_per_page']=$('.setcatcount').val();
  filters['collection']=[];filters['brand']=[];filters['style']=[];filters['type']=[]; //single checks
  filters['cover']=[];filters['insert']=[]; //multi checks
  filters['size']=[]; //alternate multi checks
  filters['metals']=[];


  if (typeof avfilters == 'object' ) $.each(avfilters,filtersidebars);


  if(window.location.pathname.indexOf('/collection/sale/')>-1) filters['isSale']=true;
  if(window.location.search.indexOf('isSale=')>-1) filters['isSale']=true;

  var extra = $('input[name=extra]').val();
  if (extra != '') filters['extra']=extra;


  viewed = $('.itemlist .item').length;
  total = parseInt($('.itemlist').attr('data-count'));

  //add data-attrs to adding divs
  $.each($('#fcollections input[type=checkbox]:checked'),function(ind,val){filters['collection'].push($(val).attr('data-value'));
      filterappend('<div class="filter_item" data-filter="'+$(val).attr('data-filter')+'" data-value="'+$(val).attr('data-value')+'">'+$(val).parent('label').text()+'</div>');});

  $.each($('#fbrands input[type=checkbox]:checked'),function(ind,val){filters['brand'].push($(val).attr('data-value'));
      filterappend('<div class="filter_item" data-filter="'+$(val).attr('data-filter')+'" data-value="'+$(val).attr('data-value')+'">'+$(val).parent('label').text()+'</div>');});

      //filterappend('<div class="filter_item">'+$(val).parent('label').text()+'</div>');});

  $.each($('#fstyles input[type=checkbox]:checked'),function(ind,val){filters['style'].push($(val).attr('data-value'));
      //filterappend('<div class="filter_item">'+$(val).parent('label').text()+'</div>');});
      filterappend('<div class="filter_item" data-filter="'+$(val).attr('data-filter')+'" data-value="'+$(val).attr('data-value')+'">'+$(val).parent('label').text()+'</div>');});
  $.each($('#ftypes input[type=checkbox]:checked'),function(ind,val){filters['type'].push($(val).attr('data-value'));
      //filterappend('<div class="filter_item">'+$(val).parent('label').text()+'</div>');});
      filterappend('<div class="filter_item" data-filter="'+$(val).attr('data-filter')+'" data-value="'+$(val).attr('data-value')+'">'+$(val).parent('label').text()+'</div>');});
  $.each($('#finserts input[type=checkbox]:checked'),function(ind,val){filters['insert'].push($(val).attr('data-value'));
      //filterappend('<div class="filter_item">'+$(val).parent('label').text()+'</div>');});
      filterappend('<div class="filter_item" data-filter="'+$(val).attr('data-filter')+'" data-value="'+$(val).attr('data-value')+'">'+$(val).parent('label').text()+'</div>');});
  $.each($('#fcovers input[type=checkbox]:checked'),function(ind,val){filters['cover'].push($(val).attr('data-value'));
      //filterappend('<div class="filter_item">'+$(val).parent('label').text()+'</div>');});
      filterappend('<div class="filter_item" data-filter="'+$(val).attr('data-filter')+'" data-value="'+$(val).attr('data-value')+'">'+$(val).parent('label').text()+'</div>');});
    $.each($('#fmetals input[type=checkbox]:checked'),function(ind,val){filters['metals'].push($(val).attr('data-value'));
        filterappend('<div class="filter_item" data-filter="'+$(val).attr('data-filter')+'" data-value="'+$(val).attr('data-value')+'">'+$(val).parent('label').text()+'</div>');});
  $.each($('#fsizes input[type=checkbox]:checked'),function(ind,val){filters['size'].push($(val).attr('data-value'));
      filterappend('<div class="filter_item" data-filter="'+$(val).attr('data-filter')+'" data-value="'+$(val).attr('data-value')+'">'+$(val).parent('label').text()+'</div>');});

  if($('#ftypes .selected').length==1) filters['type'].push($('#ftypes .selected').attr('data-value'));
  if($('#fcollections .selected').length==1) filters['collection'].push($('#fcollections .selected').attr('data-value'));
  if($('#fbrands .selected').length==1) filters['brand'].push($('#fbrands .selected').attr('data-value'));
  if($('#fstyles .selected').length==1) filters['style'].push($('#fstyles .selected').attr('data-value'));
  if($('#finserts .selected').length==1) filters['insert'].push($('#finserts .selected').attr('data-value'));
  if($('#fcovers .selected').length==1) filters['cover'].push($('#fcovers .selected').attr('data-value'));
  if($('#fsizes .selected').length==1) filters['size'].push($('#fsizes .selected').attr('data-value'));
  if($('#fmetals .selected').length==1) filters['metals'].push($('#fmetals .selected').attr('data-value'));

  /*filterappend('<div class="clear"></div>');*/

$(window).scroll(function() {
  if(filters['items_per_page']=='all'){
    //here will be additional load
    if (!requeststatus) {
      if (viewed<total) {

            if (        (
                 $(window).scrollTop()+
                 $(window).height()+
                 $('.itemlist .item').height()
                )>(
                  $('.itemlist').offset().top+
                  $('.itemlist').height()
                )) {
              makefilter();
              //console.log( (wtop+wheight) +' '+(ilisttop+ilisth));
            }
      }
    }
  }
});

  /*$('.filter_item').click(function(e){
    $(this).remove();
  });*/


  //$('.setcatcount option').click(function(e){filters['items_per_page']=$(this).val();makefilter();});
  $('.setcatcount').change(function(e){
    $('.itemlist').html('');
    filters['items_per_page']=$(this).val();
    $('.setcatcount').val($(this).val());
      changeState();
    //makefilter();

  });
  //$('.setcatorder option').click(function(e){filters['items_sort_order']=$(this).val();makefilter();});
  $('.setcatorder').change(function(e){
    $('.itemlist').html('');
    filters['items_sort_order']=$(this).val();
    $('.setcatorder').val($(this).val());
      changeState();
    //makefilter();
  });

  //sidefilters with single check

  $('.list ul[data-seltype=check] input[type=checkbox]').change(function(e){
    var chk = $(this);
    var si = $.inArray(chk.attr('data-value'),filters[chk.attr('data-filter')]);
      console.log(filters);

    if(si==-1) {
       filters[chk.attr('data-filter')].push(chk.attr('data-value'));
       filterappend('<div class="filter_item" data-filter="'+chk.attr('data-filter')+'" data-value="'+chk.attr('data-value')+'">'+chk.closest('label').text()+'</div>');
       filter.find('.clear').appendTo(filter);
       //add deltag by click on it
    }
      else {
         filter.find('div[data-filter="'+chk.attr('data-filter')+'"][data-value="'+chk.attr('data-value')+'"]').remove();
         filters[chk.attr('data-filter')].splice(si,1);
      }

      console.log(filters);
    //var ul = chk.parent('label').parent('li').parent('ul[data-seltype=check]');
    //if(ul.find('input[type=checkbox]:checked').length>0) {//hide unchecked
    //  ul.find('input[type=checkbox]:not(:checked)').parent('label').parent('li').css('display','none');
    //} else {//show unchecked
    //  ul.find('input[type=checkbox]').parent('label').parent('li').css('display','block');
    //}

   // $('.itemlist').html('');
   // makefilter();
      changeState();
  });
  //sidefilters with multiple checks
  $('.list ul[data-seltype=multi] input[type=checkbox], .square_sizes .squaresize').change(function(e){
    var chk = $(this);
    var si = $.inArray(chk.attr('data-value'),filters[chk.attr('data-filter')]);
    if(si==-1) {
       filters[chk.attr('data-filter')].push(chk.attr('data-value'));
       filterappend('<div class="filter_item" data-filter="'+chk.attr('data-filter')+'" data-value="'+chk.attr('data-value')+'">'+chk.closest('label').text()+'</div>');
       filter.find('.clear').appendTo(filter);
       //add deltag by click on it
    } else {
         filter.find('div[data-filter='+chk.attr('data-filter')+'][data-value="'+chk.attr('data-value')+'"]').remove();
         filters[chk.attr('data-filter')].splice(si,1);
    }
    //var ul = chk.parent('label').parent('li').parent('ul[data-seltype=multi]'); //18_08_2014...
    //$('.itemlist').html('');
    //makefilter();
      changeState();
  });


  $costSlider.on( "slidechange", function( event, ui ) {
    if (ui.values[0]!=null && ui.values[1]!=null) {

    filters['cost']=JSON.stringify({'min':ui.values[0],'max':ui.values[1]});
    //filter.find('div[data-filter=cost]').remove();
    //filterappend('<div class="filter_item" data-filter="cost" data-value="true">Цена: от '+ui.values[0]+' до '+ui.values[1]+'</div>');
    //filter.find('.clear').appendTo(filter);
    }
    /*$('.itemlist').html('');
    makefilter();*/
      changeState();
  });
  $('.block .list .cost #mincost').blur(function(){
    var v1 = parseInt($(this).val());
    if (v1>0) {$(this).val(v1);} else {v1=0;$(this).val('0');}
    $(".left .cost .slider").slider( "values", 0, v1);

  });
  $('.block .list .cost #maxcost').blur(function(){
    var v1 = parseInt($(this).val());
    if (v1>0) {$(this).val(v1);} else {v1=0;$(this).val('0');}
    $(".left .cost .slider").slider( "values", 1, v1);
  });




});

//preload
/*
preloadImg=new Image();
preloadImg.src= "/images/toggle_btnr.png";
*/

