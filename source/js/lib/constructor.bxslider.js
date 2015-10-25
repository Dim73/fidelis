
var sc =
    (function(bx) {
        return function (sliders) {
            jQuery.fn.bxSlider = bx;
            var sliderConfig =
            {
                _options: {
                    minSlides: 0,
                    maxSlides: 1,
                    responsive: false,
                    infiniteLoop: true,
                    autoHover: true,
                    autoDelay: 0,
                    auto: false,
                    pause: 5000,
                    hideControlOnEnd: true,
                    pager: false,
                    slideMargin: 0,
                    autoStart: true,
                    stopAuto: false,
                    mode: 'fade'
                },
                _class: {
                    container: '.slider-container',
                    item: '.slider-item',
                    controls: ['.bx-prev', '.bx-next', '.bx-pager-link']
                },
                slidersArr: sliders
            };


            var sliderInit = function () {
                var opt,
                    configClass = sliderConfig._class,
                    configOpt = sliderConfig._options;

                jQuery.each(sliderConfig.slidersArr, function (ind, slider) {
                    var self = slider;
                    var restartAuto;
                    var $selfSlider = (typeof self.sliderClass === 'object') ? self.sliderClass : jQuery(self.sliderClass);
                    var checkLength = self.checkLength ? self.checkLength : 0;
                    $selfSlider.each(function () {
                        var $slider = jQuery(this);
                        if ($slider.find(configClass.item).length > checkLength) {
                            self.options.$self = $slider;
                            opt = jQuery.extend({}, configOpt, self.options);
                            var objSlider = $slider.find(configClass.container).bxSlider(opt);
                            if (opt.auto) { //autoStart fix
                                var allControls = configClass.controls.toString();

                                function autoStart(e) {
                                    clearTimeout(restartAuto);
                                    restartAuto = setTimeout(function () {
                                        objSlider.startAuto();
                                    }, 500);
                                    return false;
                                }

                                $slider.on('click', allControls, function () {
                                    autoStart(this);
                                });
                                if (!!opt.pagerCustom) {
                                    jQuery(opt.pagerCustom).on('click', 'a', function (e) {
                                        e.preventDefault();
                                        autoStart(this);
                                    });
                                }
                            }
                        } else if (!!self.falseLength) {
                            self.falseLength();
                        }
                    });
                })
            };
            return sliderInit();
        }
    })(jQuery.fn.bxSlider);

module.exports = sc;