require('./main/itemImg.plugin');
var DEF_CONST = require('./helpers/constants');

function QuickOrder()  {
    var self = this;

    this.init = function() {
        self.$fade.bind('click', self.close);
        self.$close.bind('click', self.close);
        self.$form.bind('submit', self._submit);
        $('#qo-phone').mask("+7 (999) 999-99-99");
        self.$self.height(self.$self.height());
        //$('body').append(self.$fade);
    };

    this.show = function(){
        self.$fade.fadeIn();
        self.$self.fadeIn();
    };

    this.close = function(e) {
        e.preventDefault();
        self.$fade.fadeOut();
        self.$self.fadeOut();
    };

    this.validated = function() {
        var validated = true;
        self.$form.find('input[type=text]').each(function(){
            var $i = $(this);
            if ($i.val() === '') {
                validated = false;
            }
            $i.closest('.row').toggleClass('error',$i.val() === '');
        });
        return validated;
    };

    this._submit = function(e) {
        e.preventDefault();
        self.$error.text('');
        if (self.validated()) {
            $.ajax({
                url: DEF_CONST.AJX_PATH + 'qo.'+(DEF_CONST.ENV_CONST==='dev'?'json':'html'),
                cache: false,
                type: 'post',
                data: {data: self.$form.serialize()},
                success: function(data,status,xhr){
                    if (data.status) {
                        self.$form.fadeOut(300,function(){
                            self.$self.height(self.$selfInner.outerHeight());
                            self.$desc.html('Спасибо, наши менеджеры свяжутся с вами в ближайщее время');
                        });
                    } else {
                        self.$error.text(data.error);
                    }
                }
            });
        }
    };

    self.$self = $('.quick-order');
    self.$fade = $('.fade-fixed');
    self.$form = $('.quick-order__form', self.$self);
    self.$close = $('.close', self.$self);
    self.$selfInner = $('.quick-order__inner',  self.$self);

    self.$desc = $('.desc',self.$self);
    self.$error = $('.send-error',self.$self);
    self.init();
}

$(document).ready(function() {

    var quickOrder = new QuickOrder();

    $('.js-quick-order').click(function(e){
        e.preventDefault();
        if (!window.isSizeSelect) {
            $(this).addClass('btn_red').text('выберите размер');
            return false;
        }
        quickOrder.show();
    });
    /*$('select#item_size').change(function(e){
        var sval = $(this).val();
        var cost = null;

        $.each($(this).children('option'),function(ind,val){
            if($(val).val()==sval) {
                cost = $(val).attr('data-cost');
            }
        });
        if (cost != null) {
            $('.buttons .cost').html(
              $('.buttons .cost').html().replace(/[0-9]+,[0-9]+/,cost)
            );
        }
    });*/

    var $fullScreen = $('.pitem-fullscreen');

    $('.pitem-slider_side').itemImg({
        containerImg: '.pitem-preview-main_side .pitem-preview-main__loader',
        containerVideo: '.pitem-preview-main_side .pitem-preview-main__video'
    });

    $('.pitem-preview-main__fullscreen-link').click(function(e){
        e.preventDefault();
        var $slider = $('.pitem-slider_full');
        if ($slider.data('plugin') != 'itemImg') {
            $slider.itemImg({
                containerImg: '.pitem-preview-main_full .pitem-preview-main__loader',
                containerVideo: '.pitem-preview-main_full .pitem-preview-main__video',
                resizeImg: true
            });
        }
        $('body').addClass('popup-show');
        $fullScreen.fadeIn();
    });



    $('.close',$fullScreen).click(function(e){
        e.preventDefault();
        closeFullscreen();
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {
            closeFullscreen();
        }
    });

    function closeFullscreen() {
        $fullScreen.fadeOut();
        $('body').removeClass('popup-show');
    }
});
