var $ = require('jquery');

var ajxLoader  =  (function() {
        return {
            attachTo: function ($elm, posProc) {
                if (!$elm) return false;
                this.attechedTo = $elm;
                var $self = $('.loader'),
                    $icon = $('.loader .loader__icon');
                var pos = this.attechedTo.offset();
                var posIcon = posProc;
                this.attechedTo.prepend($self);
                this.attechedTo.addClass('ajx-loader');
            },
            _detach: function () {
                if (this.attechedTo) {
                    this.attechedTo.removeClass('ajx-loader');
                    //$self.detach();
                    this.attechedTo = null;
                }
            }
      }
})()


module.exports = ajxLoader;
