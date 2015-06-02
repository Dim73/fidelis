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


    $goodsItem.hover(function(){
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

    //style submenu

    (function($submenu){


        var model = {
            items: [],
            curLink: null,
            getText: function(id, callback) {
                $.ajax({
                    url: _url,
                    cache: false,
                    type: 'post',
                    data: {id: id},
                    success: function(data,status,xhr){
                        callback(data);
                    }
                });
            }
        };

        var controller = {
            init: function() {
                viewLink.init();
                viewText.init();
            },
            addLink: function(link, id) {
              model.items.push({$link: link, id: id});
            },
            setHover: function(id) {
                model.curLink = this.getLinkByid(id);
                if (model.curLink) {
                    viewLink.render();
                    if (!model.curLink.$submenu) {
                        model.getText(id, this.addSubMenu);
                    } else {
                        viewText.render();
                    }
                }
            },
            addSubMenu: function(data) {
                model.curLink.$submenu = $(data);
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
            setActiveAppend: function() {
                model.curLink.subIsAppend = true;
            },
            closeAll: function() {
                controller.setHover(-1);
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

                this.$styleCatLink.hover(function(){
                    controller.setHover($(this).data('id'));
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
                } else {

                }

            }
        };

        var _submenu = $submenu,
            _url = _submenu.data('url');

        _submenu.mouseleave(controller.closeAll);

        controller.init();
    }($('.main-menu__collection_style')));

});