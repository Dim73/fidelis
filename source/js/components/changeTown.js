$(function(){

    var $adrs_holder = $('.header .address-info__holder'),
        $adrs_inner = $('.address-info__inner',$adrs_holder),
        $adrs_info = $('.address-info',$adrs_holder),
        $adrs_town = $('.town-changer',$adrs_holder),
        $adrs_townSlider = $('.town-changer__slider',$adrs_holder),
        $adrs_body = $('.dropdown__body',$adrs_holder),
        $adrs_form = $('.town-changer__form',$adrs_holder),
        $adrs_townInpt = $('.inputtext', $adrs_form);



    $adrs_holder.dropdown({
        link: '.js-address-popup',
        onClose: function() {
            $adrs_inner.show();
            $adrs_town.removeClass('active');
            $adrs_holder.css({
                width: $adrs_inner.width() + 4
                //height: $adrs_body.outerHeight()
            });
            $adrs_body.css('height',$adrs_inner.outerHeight());
            //map init in html
        }
    });

    $adrs_townSlider.on('init', function() {
        //$adrs_body.css('height',$adrs_body.outerHeight());
    });
    $adrs_townSlider.slick({
        dots: false,
        infinite: true,
        slidesToShow: 1,
        autoplay: false,
        arrows: true
    });

    $('.js-change-town').click(function(e){
        e.preventDefault();
        $adrs_body.css('height',$adrs_town.outerHeight());
        $adrs_inner.hide();
        $adrs_holder.css({
            width: $adrs_town.outerWidth() + 4,
            height: 450//$adrs_info.height()
        });
        $adrs_town.addClass('active');
    });

    $('.js-town').click(function(e){
        e.preventDefault();
        $adrs_townInpt.val($(this).text());
    })

});