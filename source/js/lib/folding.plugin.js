(function($){
    'use strict';

    $.fn.folding = function(options){
        var def = {
            openHeight: 99999,
            openClass: 'opened',
            closeOther: ''
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

            try{
                $scroller.nanoScroller()
            }
            catch(e) {}




            $self.is('.'+opt.openClass) && toggleC(true);


            $link.click(function(e){
                e.preventDefault();
                toggleC();
            });


            function toggleC (flag) {
                isOpened = flag || !isOpened;
                isOpened && opt.closeOther && $(opt.closeOther).filter('.'+opt.openClass).trigger('close');
                console.log($inner.outerHeight(), openHeight)
                if ($inner.outerHeight() < optHeight) {
                    openHeight = $inner.outerHeight();
                }
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
            })
                .bind('close', function(){
                    toggleC(false);
                })

        })
    }
})(jQuery);