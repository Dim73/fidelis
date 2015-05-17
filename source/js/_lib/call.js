(function($) {
	$.fn.call = function(opt) {
		var opt = $.extend({
			submitClass : '.submit',
			inputClass : '.inputtext',
			errorMessage : '.inner-error',
            msgCont: '',
			url : '../../source/back/qo.json'
		}, opt);
		
		return this.each(function() {
			var $self = $(this),
                $input = $(opt.inputClass,$self),
                $msg = $(opt.msgCont),
                alreadySend = false;

            $msg.height($msg.height());
            function validate () {
                var isValidate,
                    errorArr = [],
                    formValidate = true;

                $input.each(function(){
                    if ($(this).is('[type=email]')) {
                       var email = $.trim($(this).val()).toLowerCase();
                       var isValidate = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email);
                    } else {
                       isValidate = $(this).val() != '';
                    }
                    if (!isValidate) {
                        formValidate = false;
                    }
                    triggerError($(this), !isValidate);
                });
                // ' - закрытие ковычки (глюк редактора)
                return formValidate;
            }

            function triggerError(input, flag) {
                input.closest('.row').toggleClass('error',flag);
            }

            $self.bind({
				'submit' : function(e) {
					e.preventDefault();
                    if (validate() && !alreadySend) {

                        $.ajax({
                            url: opt.url,
                            type: 'post',
                            dataType: 'json',
                            data: {
                                data: $self.serialize()
                            },
                            success: function(data,status,xhr){
                                if (data) {
                                    alreadySend = true;
                                    $self.css('opacity',0);
                                    $msg.addClass('toggle').prepend('<span class="succeful-msg">Мы вам перезвоним</span>');
                                }
                            }
                        });
                    }
				}
			});
			
		});
	};
})(jQuery);