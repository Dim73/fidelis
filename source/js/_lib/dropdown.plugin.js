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
                $fade =  $('<div class="fade fade-fixed"></div>');//            $('.fade-fixed');// $('<div class="fade fade-fixed"></div>');

            $('body').append($fade);

            $fade.css({
                "z-index": 400
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
                   /* if (!fadeTop) {
                        fadeTop = $(opt.fadeTo, $self).offset().top;
                        $fade.css({top: fadeTop, height: $fade.height() - fadeTop});
                    }*/
                    $fade.stop().fadeIn(400);
                } else {
                    $self.height(0);
                    $fade.stop().fadeOut(400);
                }
                $link.toggleClass('active',flag);
                window.dropDownIsOpen = flag;
            }

            $(window).bind('click',function(e){
                if ($(e.target).closest($self).length || $(e.target).closest($link).length) return;
                if (isOpen) {
                    toggleSelf(false);
                    isOpen = !isOpen;
                }
            });

            $self.bind('close',function(){
                toggleSelf(false);
                isOpen = false;
            })
        })
    }
})(jQuery);