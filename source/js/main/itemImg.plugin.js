var ajxLoader = require('../lib/ajxLoader');
require('jquery-zoom');

  $.fn.itemImg = function(options){
      var def = {
              containerImg: '',
              item : '.slider-item',
              link : '.pitem-slider__link',
              resizeImg: false

          };

      var opt = $.extend({}, def, options || {});

      $(this).data('plugin','itemImg');

      var fullscrinImgHeight = {
          img: '',
          setHeight: function() {
              var $img = this.img.parent();
              var p = $img.parent();
              var winHeight = window.innerHeight;
              var offsetImg = $img.offset().top - $('.pitem-fullscreen').offset().top;
              $img.height(winHeight - offsetImg);
          }
      };

      $(window).bind('resize', function(){
          if (opt.resizeImg && fullscrinImgHeight.img) {
              fullscrinImgHeight.setHeight();
          }
      })

      this.each(function(){
          //Initialize
          var $self = $(this),
              $link = $(opt.link, $self),

              $containerImg = $(opt.containerImg),
              $containerVideo = $(opt.containerVideo),
              $containerParent = $containerImg.closest('.pitem-preview-main'),
              $video = $('video',$containerVideo),
              $linkVideo = $link.filter('.link_video'),
              $item = $(opt.item,$self),
              $oldImg,
              videoPlay = false,
              activeInd = 0,
              loadImages = [];

          $item.click(function(e){
              e.preventDefault();
              var $this = $(this),
                  thisIndex = $this.index(),
                  $thisLink = $this.find($link);
              if ($thisLink.is('.active')) return;
              $link.removeClass('active');
              $thisLink.addClass('active');

              activeInd = thisIndex;

              if ($oldImg) {
                  $oldImg.stop().fadeOut(490, function(){
                      $oldImg.detach();
                      $containerImg.trigger('zoom.destroy');
                  });
              }

              if ($thisLink.is($linkVideo)) return;

              if (videoPlay) {
                  toggleVideo();
              }

              $containerVideo.fadeOut();

              if (!!loadImages[thisIndex]) {
                  switchImg(loadImages[thisIndex], $thisLink);
              } else {
                  var img = new Image();
                  img.onload = function () {
                      $(this).hide();
                      loadImages[thisIndex] = $(this);
                      switchImg(loadImages[thisIndex], $thisLink);
                  };
                  img.src = $thisLink.data('img');
              }
          });

          function switchImg (img, link) {
              $containerImg.append(img);
              ajxLoader.attachTo($containerParent);

              img.stop().fadeIn(500, function(){
                  $oldImg = img;

                  if (opt.resizeImg) {
                      fullscrinImgHeight.img = img;
                      fullscrinImgHeight.setHeight();
                  }
                  if (link.data('zoom')) {
                      $containerImg.zoom({
                          url: link.data('zoom'),
                          callback: function() {
                              ajxLoader._detach();
                          }
                      })
                  } else {
                      ajxLoader._detach();
                  }
              });
          }

          $linkVideo.click(function(){
              toggleVideo();
          });

          function toggleVideo() {
              if (videoPlay) {
                  $linkVideo.removeClass('pause');
                  $video[0].pause();
              } else {
                  $containerVideo.fadeIn(500,function(){
                      $linkVideo.addClass('pause');
                      $video[0].play();
                  });
              }
              videoPlay = !videoPlay;
              $oldImg = null;
          }

          $item.eq(0).trigger('click');
      })
  }
