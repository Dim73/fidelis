function checkboxOption(data) {
    var self = this;
    self.data = data;
    self.isChecked = ko.observable(data.isActive || false);
    self.name = data.name;
    self.id = data.id;
}

function CheckboxFilter(data) {
    var self = this;
    self.name = data.name;
    self.id = data.id;
    self.filterOption = ko.observableArray([]);

    self.checkChecked = ko.computed(function() {
        var total = 0;
        for (var i = 0; i < this.filterOption().length; i++) {
            total = this.filterOption()[i].isChecked()? total + 1 : total;
        }
        return total;
    }, this);

    self.filterOption($.map(data.options, function(item){
        return new checkboxOption(item);
    }));
}

function CatalogViewModel() {
    var self = this;
    self.checkboxFilters = ko.observableArray([]);

    $.ajax({
        type: 'GET',
        url: 'http://jsonstub.com/filters/',
        contentType: 'application/json',
        beforeSend: function (request) {
            request.setRequestHeader('JsonStub-User-Key', '9e0566f5-b235-4525-b0a9-e10957792544');
            request.setRequestHeader('JsonStub-Project-Key', 'f0a88501-213b-4baf-b72d-53c2c9dcb40c');
        }
    }).done(function (data) {
        console.log(data);
        var fCheckboxes = $.map(data.checkbox, function(item){
            return new CheckboxFilter(item);
        });
        self.checkboxFilters(fCheckboxes);
    });
}

ko.applyBindings(new CatalogViewModel());

ko.bindingHandlers.folding = {
    init: function(element, valueAccessor) {
        $(element).folding({openHeight: 200});
    },
    update: function(element, valueAccessor) {
        $(element).find('.nano-scroll').nanoScroller();
        $(element).trigger('update');
    }
};