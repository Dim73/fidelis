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
                openHeight = opt.openHeight,
                isOpened = false;

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



        })
    }
})(jQuery);