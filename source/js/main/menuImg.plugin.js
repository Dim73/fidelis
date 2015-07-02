(function($){
    'use strict';

    $.fn.menuImg = function(options){
        var def = {
                collImg: function(){}
            };

        var opt = $.extend({}, def, options || {});

        this.each(function(){
            //Initialize
            var $self = $(this),
                $image,
                $collectionImg = opt.collImg($self),
                imgSrc =  $self.data('img');

            if (!imgSrc) return;

            $self.hover(function(){
                    if ($image) {
                        $collectionImg.append($image);
                        $image.fadeIn(300);
                    } else {
                        var img = new Image();
                        img.onload = function () {
                            $image = $(this);
                            $collectionImg.append($image).fadeIn(300);
                        };
                        img.src = imgSrc;
                    }
                },
                function() {
                    $image.fadeOut(300,function(){
                        $image.detach();
                    })
                }
            );

        })
    }
})(jQuery);