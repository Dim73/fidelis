(function($){
    'use strict';

    $.fn.folding = function(options){
        var def = {
                openHeight: 100,
                openClass: 'opened'
            };

        var opt = $.extend({}, def, options || {}),
            pluginPrefix = '.folding';

        this.each(function(){
            //Initialize
            var $self = $(this),
                $link = $(pluginPrefix+'__title',$self),
                $content = $(pluginPrefix+'__wrap',$self),
                $inner = $(pluginPrefix+'__inner',$self),
                $scroller = $('.nano-scroll', $self),
                optHeight = opt.openHeight,
                openHeight  = opt.openHeight,
                isOpened = false;

            $scroller.css('max-height',openHeight);
            $scroller.nanoScroller();

            if ($inner.outerHeight() < openHeight) {
                openHeight = $inner.outerHeight();
            }

            $self.is('.'+opt.openClass) && toggleC(true);


            $link.click(function(e){
                e.preventDefault();
                toggleC();
            });

            function toggleC (flag) {
                isOpened = flag || !isOpened;
                $self.toggleClass(opt.openClass, isOpened);
                $content.height(!isOpened?0:openHeight);
            }

            $self.bind('update', function(){
                if ($inner.outerHeight() < optHeight) {
                    openHeight = $inner.outerHeight();
                } else {
                    openHeight = optHeight
                }
                if (isOpened) {
                    $content.height(openHeight);
                }
            });

        })
    }
})(jQuery);