(function ($) {
  $.fn.labelmaker = function(labelmakerPoints, options) {
    // var $imgTag;
    var $imgTagContainer;
    var imgWidth;
    var imgHeight;

    function addPointsAndBubbles() {
      labelmakerPoints.forEach(function (point) {
        $imgTagContainer
        .append('<div class="labelmaker-point" style="top:' + point.top +'%; left:' + point.left + '%;"></div>')
        .append('<div class="labelmaker-bubble"><div class="labelmaker-bubble-inner">' + point.text + '</div></div>');
      });
    }

    function removePointsAndBubbles() {
      $('.labelmaker-point, .labelmaker-bubble').remove();
    }

    function hideAllBubbles() {
      $('.labelmaker-bubble').removeClass('active').removeAttr('style');
    }

    function preventPageScrollWhenScrollingBlock($block) {
      // prevent page from scrolling when scrolling block
      // http://stackoverflow.com/a/16324663/4312174
      $block.on('DOMMouseScroll mousewheel', function(ev) {
        var $this = $(this),
            scrollTop = this.scrollTop,
            scrollHeight = this.scrollHeight,
            height = $this.outerHeight(),
            delta = (ev.type == 'DOMMouseScroll' ?
                ev.originalEvent.detail * -40 :
                ev.originalEvent.wheelDelta),
            up = delta > 0;

        var prevent = function() {
            ev.stopPropagation();
            ev.preventDefault();
            ev.returnValue = false;
            return false;
        };

        if (!up && -delta > scrollHeight - height - scrollTop) {
            // Scrolling down, but this will take us past the bottom.
            $this.scrollTop(scrollHeight);
            return prevent();
        } else if (up && delta > scrollTop) {
            // Scrolling up, but this will take us past the top.
            $this.scrollTop(0);
            return prevent();
        }
      });
    }

    function showBubble($point, $bubble) {
      var pointSize = $point.outerWidth();
      var pointPosition = $point.position();
      var bubbleHeight = $bubble.outerHeight();
      var bubbleWidth = $bubble.outerWidth();
      var fromPointToBottom = imgHeight - pointPosition.top - pointSize;
      var fromPointToRight = imgWidth - pointPosition.left - pointSize;

      var bubblePositionTop = pointPosition.top + pointSize;
      var bubblePositionLeft = pointPosition.left + pointSize;
      var spaceLacking;

      // Rule for top/bottom
      if (fromPointToBottom < bubbleHeight) {
        spaceLacking = (imgHeight - bubblePositionTop - bubbleHeight) * -1;
        bubblePositionTop = bubblePositionTop - spaceLacking - pointSize / 2;
        // console.log(spaceLacking);
        // console.log('rule 1');
      }

      //Rule for left/right
      if (fromPointToRight < bubbleWidth) {
        spaceLacking = (imgWidth - bubblePositionLeft - bubbleWidth) * -1;
        bubblePositionLeft = bubblePositionLeft - spaceLacking - pointSize / 2;
        // console.log(spaceLacking);
        // console.log('rule 2');
      }

      $bubble.css({ top: bubblePositionTop, left: bubblePositionLeft }).addClass('active');

      if (bubbleHeight < $bubble.find('.labelmaker-bubble-inner').prop('scrollHeight')) {
        $bubble.addClass('scrollable');
        preventPageScrollWhenScrollingBlock($('.scrollable .labelmaker-bubble-inner'));
      }
    }

    function init(that) {
        var $imgTag = $(that);
        console.log($imgTag);
        $(document).on('click', '.labelmaker-point', function(e) {
          e.stopPropagation();
          hideAllBubbles();
          $bubble = $(this).next();
          $point = $(this);
          showBubble($point, $bubble);
        });

        // TODO: add on hover option
        // $(document).on({
        //     mouseenter: function(e) {
        //         e.stopPropagation();
        //         hideAllBubbles();
        //         $bubble = $(this).next();
        //         $point = $(this);
        //         showBubble($point, $bubble);
        //     },
        //     mouseleave: function(e) {
        //         hideAllBubbles();
        //     }
        // },'.labelmaker-point, .labelmaker-bubble');

        $(document).on('click', '.labelmaker-bubble', function(e) {
          e.stopPropagation();
        });

        $(document).on('click', function(e) {
          hideAllBubbles();
        });

        // $( document ).ready(function() {
        //   $($imgTag).wrap('<div class="labelmaker-container" />');
        //   $imgTagContainer = $(that).parent('.labelmaker-container');
        // });


        // console.log($imgTagContainer);

        // check that the image is loaded, even if cached
        // http://stackoverflow.com/a/3877079
        // console.log($labelmaker);
        // $imgTag.one('load', function() {
        //   imgWidth = $(this).width();
        //   imgHeight = $(this).height();
        //   console.log(imgWidth);
        //   $imgTag.wrap('<div class="labelmaker-container" />');
        //   $imgTagContainer = $imgTag.parent('.labelmaker-container');
        //   // $imgTagContainer.width(imgWidth).height(imgHeight);
        //   // console.log(imgWidth + '/' + imgHeight);
        //   addPointsAndBubbles();
        //
        //   $(window).on('resize orientationChanged', function() {
        //     imgWidth = $imgTag.width();
        //     imgHeight = $imgTag.height();
        //     $imgTagContainer.width(imgWidth).height(imgHeight);
        //     removePointsAndBubbles();
        //     addPointsAndBubbles();
        //   });
        // }).each(function() {
        //   if(this.complete) $(this).load();
        // });

        imagesLoaded( $imgTag, function( image ) {
          imgWidth = $(image).width();
          console.log(imgWidth);
          // console.log( $images.length + ' images have been loaded in ' + this );
        });


    }

      return this.each(function() {
        init(this);
      });

    // $( document ).ready(function() {
    //   init();
    // });
    // return this;
  };
}(jQuery));
