(function($) {

    $(function(){

        var $mainNav = $('.main-nav-line'),
            $mainNavHolder = $('.main-nav-line__holder'),
            $mainNavLink = $('.js-menu-toggle'),
            $submenu = $('.main-nav__submenu'),
            hasSubmenuClass = '.hasSubmenu .link';

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
                toggleHeight($mainNav,$mainNavHolder, true);
            }
            toggleHeight($mainNav,$mainNavHolder, open);
        }

        function toggleSubMenu($submenu, open) {
            $mainNav.css('height','auto');
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