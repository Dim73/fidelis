function checkboxOption(data) {
    var self = this;
    self.data = data;
    self.isChecked = data.isActive || false;
}

function CheckboxFilter(data) {
    var self = this;
    self.name = data.name;
    self.id = data.id;
    self._options = ko.observableArray([]);

    self._options($.map(data.options, function(item){
        return new checkboxOption(item);
    }));

}

function CatalogViewModel() {
    var self = this,
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
        var fCheckboxes = $.map(data.checkboxes, function(item){
            return new CheckboxFilter(item);
        });
        self.checkboxFilters(fCheckboxes);
    });
}

ko.applyBindings(new CatalogViewModel());