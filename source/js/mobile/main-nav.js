(function($) {

    $(function(){

        var $mainNav = $('.main-nav-line'),
            $mainNavHolder = $('.main-nav-line__holder'),
            $mainNavLink = $('.js-menu-toggle'),
            $submenu = $('.main-nav__submenu'),
            hasSubmenuClass = '.hasSubmenu > .link';

        //var submenuFirstOpen = true;

        $mainNavLink.click(function(e){
            e.preventDefault();
            var isOpen = $mainNavLink.is('.open');
            toggleLinkMenu(!isOpen);
            toggleMainMenu(!isOpen);
        });

        $(hasSubmenuClass, $mainNav).click(function(e){
            e.preventDefault();
            var $self = $(this);
            var isOpen = $self.is('.open');
            toggleLinkSubMenu($self, !isOpen);
            toggleSubMenu($self.siblings($submenu), !isOpen);
        });

        function toggleMainMenu(open) {
            if (!open) {
                //$mainNav.css({'min-height':0});
                toggleHeight($mainNav,$mainNavHolder, true);
                //submenuFirstOpen = true;
            }
            toggleHeight($mainNav,$mainNavHolder, open);
        }

        function toggleSubMenu($submenu, open) {
            //submenuFirstOpen && $mainNav.css({'min-height':$mainNav.height(),'height':'auto'});
            $mainNav.css('height','auto');
            //submenuFirstOpen = false;
            toggleHeight($submenu,$('.main-nav-line__list', $submenu), open);
        }

        function toggleLinkMenu(flag) {
            $mainNavLink.toggleClass('open',flag);
        }

        function toggleLinkSubMenu($link, flag) {
            $link.toggleClass('open',flag);
        }

        function toggleHeight($parent, $container, flag) {
            $parent.height(flag?$container.outerHeight():0);
        }
    });
})(jQuery);