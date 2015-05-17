(function($) {
	$.fn.subscribe = function(opt) {
		var opt = $.extend({
			submitClass : '.submit',
			inputClass : '.inputtext',
			errorMessage : '.inner-error',
			url : '../../source/back/qo.json'
		}, opt);
		
		return this.each(function() {
			var $self = $(this),
                $form = $('.subscribe__form', $self),
                $msg = $('.subscribe__body', $self),
                $input = $(opt.inputClass,$self),
                alreadySend = false;

            function validate () {
                var isValidate,
                    errorArr = [],
                    formValidate = false;

                $input.each(function(){
                    if ($(this).is('[type=email]')) {
                       var email = $.trim($(this).val()).toLowerCase();
                       var isValidate = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email);
                    } else {
                       isValidate = $(this).val() != '';
                    }
                    if (isValidate)
                        formValidate = true;
                });
                if (!formValidate)
                    $input.closest('.row').addClass('error');
                // ' - закрытие ковычки (глюк редактора)
                return formValidate;
            }

            function triggerError(input, flag) {
                input.closest('.row').toggleClass('error',flag);
            }

            $form.bind({
				'submit' : function(e) {
					e.preventDefault();

                    if (validate() && !alreadySend) {

                        $.ajax({
                            url: opt.url,
                            type: 'post',
                            dataType: 'json',
                            data: {
                                data: $form.serialize()
                            },
                            success: function(data,status,xhr){
                                if (data) {
                                    alreadySend = true;
                                    $form.fadeOut(500, function(){
                                        $msg.text('Подписано')
                                    });
                                }
                            }
                        });
                    }
				}
			});
			
		});
	};
})(jQuery);