(function($){
    'use strict';

    $.fn.prlx = function(options){
        var def = {
               bannerClass: '.bg',
               defRatio: 3
            };

        var opt = $.extend({}, def, options || {}),
            windowSelector = $(window),
            documentSelector = $(document),
            windowHeight = windowSelector.outerHeight();

        this.each(function(){
            var $self = $(this),
                $img = $(opt.bannerClass, $self);
            var bannerHeight = $self.height(),
                bufferRatio = $self.data('ratio') || opt.defRatio,
                bannerOffsetTop = $self.offset().top;

            console.log ('init prlx', $self)
            $(window).bind('scroll.banner', function(){
                console.log (bannerOffsetTop);
                var documentScrollTop,
                    startScrollTop,
                    endScrollTop;

                /*if (!$self.is(':visible')) return;*/

                documentScrollTop = documentSelector.scrollTop();
                startScrollTop = documentScrollTop + windowHeight;
                endScrollTop = documentScrollTop - bannerHeight;

                if((startScrollTop > bannerOffsetTop) && (endScrollTop < bannerOffsetTop)){

                    var y = documentScrollTop - bannerOffsetTop;
                    var newPositionTop =  parseInt(y / bufferRatio);
                    /*if(!parallaxInvert) {
                     newPositionTop =  parseInt(y / bufferRatio);
                     } else {
                     newPositionTop = -parseInt(y / bufferRatio) - parseInt(windowHeight / bufferRatio)
                     }*/

                    $img.css({ top: newPositionTop});
                }
            });


            $self.bind('setHeight', function(){
                bannerHeight = $self.height();
                console.log(bannerHeight);
            })
                .bind('update', function(){
                    bannerOffsetTop = $self.offset().top;
                    $img.css('opacity',1);
                    console.log ('update prlx')
                    $(window).trigger('scroll.banner');
                });

            $(window).trigger('scroll.banner');
        })
    }
})(jQuery);
