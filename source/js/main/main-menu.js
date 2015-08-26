$(function(){

    var $mainMenu = $('.header-menu');
    //collection submenu
    var $collectionSubmenu = $('.main-menu__collection_asis'),
        $collectionLink = $('.collection__link', $collectionSubmenu);
    $collectionLink.menuImg({
        collImg: function(self){
            return self.closest('.main-menu__collection').find('.collection__preview');
        }
    });

    //goods submenu
    $collectionSubmenu = $('.main-menu__collection_goods');
    $collectionLink = $('.goods-category__item', $collectionSubmenu);
    $collectionLink.menuImg({
        collImg: function(self){
            return self.closest('.main-menu__collection').find('.collection__preview');
        }
    });

    var $goodsItem = $('.goods__item',$collectionSubmenu),
        $goodsCatList = $('.goods-category__items-list', $collectionSubmenu),
        $listActive;


    $goodsItem.on('mouseenter', function(){
       $(this).trigger('onHover');
    });

    $goodsItem.bind('onHover', function() {
        var $this = $(this);
        $goodsItem.removeClass('hover');
        $this.addClass('hover');

        $goodsCatList.stop().fadeOut(300);
        $goodsCatList.eq($this.index()).stop().fadeIn(300);
    });

    $collectionSubmenu.mouseleave(function(){
        $goodsItem.removeClass('hover');
        $goodsCatList.stop().fadeOut(300);
    });

    $('.hasSubmenu',$mainMenu).on('mouseenter', function(){
        if ($(this).find('.goods__list').length) {
            $(this).find('.goods__item').eq(0).trigger('onHover');
        }
    });

    //style submenu

    function styleSubmenu($el) {


        var model = {
            items: [],
            curLink: null,
            getText: function(id, callback) {
                $.ajax({
                    url: _url,
                    cache: false,
                    type: 'post',
                    data: {id: id},
                    dataType: 'html',
                    success: function(data,status,xhr){
                        callback(id, data);
                    },
                    error: function(res,err) {
                        console.log(err);
                    }
                });
            }
        };

        var controller = {
            locker: -1,
            init: function() {
                viewLink.init();
                viewText.init();
            },
            addLink: function(link, id) {
              model.items.push({$link: link, id: id});
            },
            setActive: function(id) {
                model.curLink = this.getLinkByid(id);
                this.locker = id;
                if (model.curLink) {
                    viewLink.render();
                    if (!model.curLink.$submenu || !model.curLink.subIsAppend) {
                        model.getText(id, this.addSubMenu);
                    } else {
                        viewText.render();
                    }
                }
            },
            addSubMenu: function(id, data) {
                var $link = controller.getLinkByid(id);
                console.log(controller.locker, '~', id,controller.locker);
                $link.$submenu = $(data);
                if (controller.locker === id)
                    viewText.render();
            },
            getLinkByid: function(id) {
                for (var i in model.items) {
                    if (model.items[i].id === id) {
                        return model.items[i];
                    }
                }
                return null;
            },
            getActiveLink: function() {
                return model.curLink;
            },
            setActiveAppend: function(id) {
                model.curLink.subIsAppend = true;
            },
            closeAll: function() {
                controller.setActive(-1);
                viewText.render();
                viewLink.render();
            }
        };

        var viewLink = {
            init: function() {
                this.$styleCatLink = $('.goods__item', _submenu);

                this.$styleCatLink.each(function(){
                    controller.addLink($(this), $(this).data('id'));
                });

                this.$styleCatLink.bind('onHover', function(){
                    controller.setActive($(this).data('id'));
                });

                this.$styleCatLink.on('mouseenter', function(){
                    $(this).trigger('onHover');
                });
            },
            render: function() {
                var cur = controller.getActiveLink();
                viewLink.$styleCatLink.removeClass('hover');
                if (cur)
                    cur.$link.addClass('hover');
            }
        };

        var viewText = {
            init: function() {
               this.$holder =  $('.styles-list', _submenu);
               this.item = '.styles-list__item';
                this.$holder.height(0);
            },
            render: function() {
                var cur = controller.getActiveLink();
                $(this.item, _submenu).stop().fadeOut(450,function(){
                    if (!cur) {
                        viewText.$holder.height(0);
                    }
                });

                if (cur) {
                    if (!cur.subIsAppend) {
                        this.$holder.append(cur.$submenu);
                        controller.setActiveAppend();
                    }
                    this.$holder.height(cur.$submenu.height());
                    cur.$submenu.stop().fadeIn();
                }
            }
        };

        var _submenu = $el,
            _url = _submenu.data('url');

        _submenu.mouseleave(controller.closeAll);

        controller.init();
    }

    styleSubmenu.call(null, $('.main-menu__collection_style'));
    styleSubmenu.call(null, $('.main-menu__collection_brand'));

});