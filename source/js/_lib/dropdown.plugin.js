(function($){
    'use strict';

    $.fn.dropdown = function(options){
        var def = {
                link: '',
                onOpen: function(){},
                fadeTo: '.dropdown-fade-to'
            };

        var opt = $.extend({}, def, options || {});

        this.each(function(){
            //Initialize
            var $self = $(this),
                $link = $(opt.link),
                $dropContent = $self.children(),
                isOpen = false,
                fadeTop = 0,
                $fade = $('<div class="fade"></div>');

            $('body').append($fade);

            $fade.css({
                position: 'absolute'
            });

            $link.click(function(e){
                e.preventDefault();
                isOpen = !isOpen;
                toggleSelf(isOpen);
            });

            function toggleSelf (flag) {
                if (flag) {
                    opt.onOpen();
                    $self.height($dropContent.outerHeight());
                    console.log($fade.offset().top, !$fade.offset().top);
                    if (!fadeTop) {
                        fadeTop = $(opt.fadeTo, $self).offset().top;
                        $fade.css({top: fadeTop, height: $fade.height() - fadeTop});
                    }
                    $fade.stop().fadeIn();
                } else {
                    $self.height(0);
                    $fade.stop().fadeOut();
                }
                $link.toggleClass('active',flag);
            }

            $(window).bind('click',function(e){
                if ($(e.target).closest($self).length || $(e.target).closest($link).length) return;
                if (isOpen) {
                    toggleSelf(false);
                    isOpen = !isOpen;
                }
            });
        })
    }
})(jQuery);