$(function(){

    var $adrs_holder = $('.header .address-info__holder'),
        $adrs_inner = $('.address-info__inner',$adrs_holder),
        $adrs_info = $('.address-info',$adrs_holder),
        $adrs_town = $('.town-changer',$adrs_holder),
        $adrs_townSlider = $('.town-changer__slider',$adrs_holder),
        $adrs_body = $('.dropdown__body',$adrs_holder),
        $adrs_form = $('.town-changer__form',$adrs_holder),
        $adrs_townInpt = $('.inputtext', $adrs_form),
        $adrs_autoComplete,
        keyTimer;


    if (!$adrs_holder.length) return;

    $adrs_holder.dropdown({
        link: '.js-address-popup',
        onClose: function() {
            $adrs_body.off('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
            $adrs_inner.show();
            $adrs_town.removeClass('active');
            $adrs_holder.css({
                width: $adrs_inner.width() + 4
            });
            $adrs_body.css('height',$adrs_inner.outerHeight());
            $adrs_autoComplete.hide();
            //map init in html
        }
    });

    $('body').append($('#town-change').html());
    $adrs_autoComplete = $('.town-autocomplete');
    (function(){
        var offsetInpt = $adrs_townInpt.offset();
        $adrs_autoComplete.css({
            top: offsetInpt.top + $adrs_townInpt.outerHeight(),
            left: offsetInpt.left
        });
    })();


    $adrs_body.css('height',$adrs_inner.outerHeight());

    $('.js-change-town').click(function(e){
        e.preventDefault();
        $adrs_body.css('height',$adrs_town.outerHeight());
        $adrs_inner.hide();
        $adrs_autoComplete.hide();
        $adrs_holder.css({
            width: $adrs_town.outerWidth() + 4
        });

        $adrs_body.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
            $adrs_holder.height($adrs_info.outerHeight());
        });
        $adrs_town.addClass('active');
    });

    $(document).on('click','.js-town', function(e){
        e.preventDefault();
        e.stopPropagation();
        $adrs_townInpt.val($(this).text());
        $adrs_autoComplete.hide();
    });

    function getTown(e) {
        clearTimeout(keyTimer);

        $.ajax({
            url: $adrs_form.data('autocompleteurl'),
            data: {town: $adrs_townInpt.val()},
            type: 'post',
            dataType: 'html',
            success: function(data,status,xhr){
                if (e && e.type === 'submit') {
                    if (data) {
                        $adrs_form.off('submit').submit();
                    } else {
                        $adrs_townInpt.parent().addClass('error');
                    }
                }
                else if (data) {
                    $adrs_autoComplete.find('[data-action=load]').html(data);
                    $adrs_townInpt.parent().removeClass('error');
                    $adrs_autoComplete.show();
                } else {
                    $adrs_autoComplete.hide();
                }
            }
        });
    }


    function startTimer() {
        clearTimeout(keyTimer);
        keyTimer = setTimeout(getTown, 1000);
    }
    $adrs_townInpt.bind('keyup',function(e){
        if (e.keyCode === 27) {
            getTown();
        } else {
            startTimer();
        }
    });

    $adrs_form.bind('submit',function(e){
        e.preventDefault();
        getTown(e);
    });

});