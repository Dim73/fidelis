(function($){
    'use strict';

    $.fn.prlx = function(options){
        var def = {
            bannerClass: '.bg'
        };


        var opt = $.extend({}, def, options || {}),
            windowSelector = $(window),
            documentSelector = $(document),
            windowHeight = windowSelector.outerHeight();


        this.each(function(){
            var $self = $(this),
                $img = $(opt.bannerClass, $self);
            var bannerHeight = $self.height(),
                bannerOffsetTop, bannerEnd, halfImg, speedRatio;
            var startScrollTop, endScrollTop;
            var newPositionTop;
            updateParams();

            $(window).bind('scroll.banner', function() {
                var documentScrollTop;
                documentScrollTop = documentSelector.scrollTop();
                if (
                        !$self.is(':visible')
                        ||
                        (
                            (documentScrollTop < startScrollTop) || (documentScrollTop > endScrollTop)
                        )
                    )
                    return;



                newPositionTop =  parseInt((documentScrollTop - (bannerEnd - bannerHeight/2)) * speedRatio);
                $img.css({ top: newPositionTop});
            });

            function updateParams() {
                bannerOffsetTop = $self.offset().top;
                bannerEnd = bannerOffsetTop + bannerHeight;
                windowHeight = windowSelector.outerHeight();
                halfImg = ($img.height() - bannerHeight)/2;
                speedRatio = halfImg/(windowHeight/2);
                startScrollTop = bannerOffsetTop - windowHeight;
                endScrollTop = bannerOffsetTop + bannerHeight;
                $img.css('opacity',1);
                $(window).trigger('scroll.banner');
            }

            $self.bind('setHeight', function(){
                bannerHeight = $self.height();
            })
                .bind('update', updateParams);

            $(window).on('resize', updateParams);
        })
    }
})(jQuery);