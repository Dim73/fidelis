function CheckboxOption(data) {
    var self = this;
    self.data = data;
    self.name = data.name;
    self.id = data.id;
    self.isChecked = ko.observable(data.isActive || false);
}

function CheckboxFilter(data) {
    var self = this;
    self.name = data.name;
    self.id = data.id;
    self.filterOption = ko.observableArray();
    self.activeFilters = ko.observableArray([]);
    self.isChanged = ko.observable(false);

    self.activeOptions = ko.computed(function() {
        self.activeFilters([]);
        for (var i = 0; i < this.filterOption().length; i++) {
            if (this.filterOption()[i].isChecked()) {
                self.activeFilters.push(this.filterOption()[i].id);
            }
        }
        return self.activeFilters().toString();
    }, this);

    self.updatePlugins = ko.computed(function() {

    });



    self.filterOption($.map(data.options, function(item, k){
        return new CheckboxOption(item);
    }));
    console.log(self.filterOption());
}

function CatalogViewModel() {
    var self = this;
    self.checkboxFilters = ko.observableArray([]);
    self.filterData = [];
    self.isChange = ko.observable(false);

    function getFilters() {
        $.ajax({
            type: 'GET',
            url: 'http://jsonstub.com/filters/',
            contentType: 'application/json',
            beforeSend: function (request) {
                request.setRequestHeader('JsonStub-User-Key', '9e0566f5-b235-4525-b0a9-e10957792544');
                request.setRequestHeader('JsonStub-Project-Key', 'f0a88501-213b-4baf-b72d-53c2c9dcb40c');
            }
        }).done(function (data) {
            var fCheckboxes = $.map(data.checkbox, function(item){
                return new CheckboxFilter(item);
            });
            self.checkboxFilters(fCheckboxes);
        });

      /*

        var fCheckboxes = $.map(fakeData.checkbox, function(item){
            return new CheckboxFilter(item);
        });
        self.checkboxFilters(fCheckboxes);*/
    }

    function setFilters() {
        $.ajax({
            type: 'POST',
            url: 'http://jsonstub.com/filters/',
            contentType: 'application/json',
            beforeSend: function (request) {
                request.setRequestHeader('JsonStub-User-Key', '9e0566f5-b235-4525-b0a9-e10957792544');
                request.setRequestHeader('JsonStub-Project-Key', 'f0a88501-213b-4baf-b72d-53c2c9dcb40c');
            }
        }).done(function (data) {
            if (data.added) {
                getFilters();
            }
        });
    }

    ko.computed(function(val) {
        for (var i = 0; i < this.checkboxFilters().length; i++) {
            var _filter = this.checkboxFilters()[i],
                obj = {};
            obj[_filter.id] = _filter.activeFilters();
            self.filterData.push(obj);
        }
        console.log('change');
        //getFilters();
    }, this);

    getFilters();
}

ko.bindingHandlers.folding = {
    init: function(element, valueAccessor) {
        $(element).folding({openHeight: 200});
    },
    update: function(element, valueAccessor) {
        $(element).find('.nano-scroll').nanoScroller();
        $(element).trigger('update');
    }
};

ko.applyBindings(new CatalogViewModel());

var fakeData = {
    "checkbox": [
        {
            "name": "Бренды",
            "id": "brands",
            "options": [
                {
                    "name": "Eugenio Campos",
                    "id": 20,
                    "isActive": true
                },
                {
                    "name": "1One (Италия)",
                    "id": 21,
                    "isActive": true
                },
                {
                    "name": "Dea",
                    "id": 22
                },
                {
                    "name": "Glee",
                    "id": 23
                },
                {
                    "name": "Random",
                    "id": 24
                }
            ]
        },
        {
            "name": "Коллекции",
            "id": "collection",
            "options": [
                {
                    "name": "Вечерний",
                    "id": 20
                },
                {
                    "name": "Деловой",
                    "id": 21
                },
                {
                    "name": "Классический",
                    "id": 22
                },
                {
                    "name": "Ультрамодный",
                    "id": 23
                }
            ]
        },
        {
            "name": "Тип изделия",
            "id": "type",
            "options": [
                {
                    "name": "Браслеты",
                    "id": 20
                },
                {
                    "name": "Броши",
                    "id": 21
                },
                {
                    "name": "Бусы",
                    "id": 22
                },
                {
                    "name": "Колье",
                    "id": 23
                }
            ]
        }
    ]
};