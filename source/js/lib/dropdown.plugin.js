(function($){
    'use strict';

    $.fn.dropdown = function(options){
        var def = {
                link: '',
                onOpen: function(){},
                onClose: function(){},
                afterClose: function(){},
                fadeTo: '.dropdown-fade-to',
                closeClass: '.icon-x',
                fade: true
            };

        var opt = $.extend({}, def, options || {});

        this.each(function(){
            //Initialize
            var $self = $(this),
                $link = $(opt.link),
                $close = $(opt.closeClass, $self),
                $dropContent = $self.children(),
                isOpen = false,
                fadeTop = 0,
                $fade = $('.fade-fixed');// $('<div class="fade fade-fixed"></div>');//            $('.fade-fixed');// $('<div class="fade fade-fixed"></div>');

            if (opt.fade) {
               // $('body').append($fade);
                $fade.css({
                    "z-index": 400
                });
            }

            $link.click(function(e){
                e.preventDefault();
                isOpen = !isOpen;
                toggleSelf(isOpen);
            });

            $close.click(function(e){
                e.preventDefault();
                $self.trigger('close');
            });

            function toggleSelf (flag) {
                if (flag) {
                    opt.onOpen();
                    $self.height($dropContent.outerHeight());
                   /* if (!fadeTop) {
                        fadeTop = $(opt.fadeTo, $self).offset().top;
                        $fade.css({top: fadeTop, height: $fade.height() - fadeTop});
                    }*/
                    opt.fade && $fade.stop().fadeIn(400);
                } else {
                    $self.height(0);
                    opt.fade && $fade.stop().fadeOut(400);
                    opt.onClose();
                    $self.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
                       !isOpen && opt.afterClose();
                    });
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
                .bind('open',function(){
                    toggleSelf(true);
                    isOpen = true;
                })


        })
    }
})(jQuery);