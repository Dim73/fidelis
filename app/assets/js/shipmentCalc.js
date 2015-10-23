function emptyObject(obj) {
    for (var i in obj) {
        return false;
    }
    return true;
}


function shipmentCalc() {
    var pathToAjax = /localhost/gi.test(window.location.hostname)?'../../source/back/':'/ajax/';

    var model = {
        optionsHtml: '',
        curRegion: -1,
        curTown: -1,
        shipmentData: {},
        inProccess: false,
        getHtmlTownList : function(callback) {
            $.ajax({
                url: pathToAjax + 'town.html',
                cache: false,
                type: 'post',
                dataType: 'html',
                data: {region: model.curRegion},
                success: function (data, status, xhr) {
                    model.optionsHtml = data;
                    callback();
                },
                beforeSend: function(xhr,setting) {
                    controller.ajaxProccess(true);
                },
                complete:function(xhr,status) {
                    controller.ajaxProccess(false);
                }
            });
        },
        getShipmentInfo: function(callback) {
            $.ajax({
                url: pathToAjax + 'deliveryInfo.html',
                cache: false,
                type: 'post',
                dataType: 'json',
                data: {type: model.type, destination: model.curTown},
                success: function(data,status,xhr){
                    model.shipmentData = data;
                    callback();
                },
                beforeSend: function(xhr,setting) {
                    controller.ajaxProccess(true);
                },
                complete:function(xhr,status) {
                    controller.ajaxProccess(false);
                }
            });
        }
    };

    var controller = {
        init: function() {
            model.type = 'spsr_regions';
            view.init();
            viewRegion.init();
            viewTown.init();
            viewInfo.init();
        },
        changeTown: function(town) {
            model.curTown = town;
            if (town === '') {
                model.shipmentData = {};
                viewInfo.render();
            } else {
                model.getShipmentInfo(viewInfo.render.bind(viewInfo))
            }
        },
        changeRegion: function(val) {
            model.curRegion = val;
            if (val === '') {
                model.optionsHtml = '';
                model.shipmentData = {};
                viewInfo.render();
                viewTown.render();
            } else {
                model.getHtmlTownList(viewTown.render.bind(viewTown));
            }
        },
        getOptionsHtml: function() {
            return model.optionsHtml;
        },
        getShipmentData: function() {
            return model.shipmentData;
        },
        ajaxProccess: function(status) {
            model.inProccess = status;
            view.render();
        },
        getLoadingStatus: function() {
            return  model.inProccess;
        }
    };

    var view = {
        init: function() {
            var _self = this;
            _self.target = document.querySelector('.shipment-calculator');
        },
        render: function() {
            var inProcess = controller.getLoadingStatus();
            if (inProcess) {
                ajxLoader.attachTo($(this.target));
            } else {
                ajxLoader._detach();
            }
        }
    };

    var viewRegion = {
        init: function() {
            var _self = this;
            _self.select = document.getElementById('s-region');
            $(_self.select).CustomSelect({visRows:5, modifier: 'delivery'});

            $(_self.select).on('change', function(e) {
                console.log(e);
                controller.changeRegion(_self.select.value);
            });
        },
        render: function() {

        }
    };

    var viewTown = {
        init: function() {
            var _self = this;
            _self.select = document.getElementById('s-city');
            $(_self.select).on('change', function(e) {
                controller.changeTown(_self.select.value);
            });
            $(_self.select).CustomSelect({visRows:5, modifier: 'delivery'});

        },
        render: function() {
            var options = controller.getOptionsHtml();
            this.select.innerHTML = '<option value="">Выберите город</option>' + options;
            $(this.select).trigger('update');
            if (options) {
                var event = document.createEvent('HTMLEvents');
                event.initEvent('change', true, false);
                this.select.dispatchEvent(event);
            }
        }
    };

    var viewInfo = {
        init: function() {
            var _self = this;
            _self.target = document.querySelector('.delivery__info');
            _self.days = _self.target.querySelector('.delivery-day');
            _self.total = _self.target.querySelector('.delivery-summ');

        },
        render: function() {
            var data = controller.getShipmentData();
            if (data && !emptyObject(data)) {
                this.target.style.display = 'block';
                this.days.innerText = data.days;
                this.total.innerText = data.summ;
            } else {
                this.target.style.display = 'none';
            }
        }
    };

    controller.init();
}

document.addEventListener('DOMContentLoaded', shipmentCalc);