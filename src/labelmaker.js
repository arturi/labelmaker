/*!
 * Labelmaker
 * MIT License
 */

(function ($) {
  $.fn.labelmaker = function($pointsContainer, options) {

    var settings = $.extend({
          showBubbleOn: 'click',
        }, options);

    function getLabelmakerPoints($pointsContainer) {
      var pointData = [];
      $pointsContainer.children().each(function() {
        var point = {};
        point.top = $(this).data('top');
        point.left = $(this).data('left');
        point.text = $(this).text();
        pointData.push(point);
      });
      return pointData;
    }

    function addPointsAndBubbles($imgContainer, labelmakerPoints) {
      labelmakerPoints.forEach(function (point) {
        $imgContainer
        .append('<div class="labelmaker-point" style="top:' + point.top +'%; left:' + point.left + '%;"></div>')
        .append('<div class="labelmaker-bubble"><div class="labelmaker-bubble-inner">' + point.text + '</div></div>');
      });
    }

    function removePointsAndBubbles($imgContainer) {
      $imgContainer.find('.labelmaker-point, .labelmaker-bubble').remove();
    }

    function hideAllBubbles($imgContainer) {
      $imgContainer.find('.labelmaker-bubble').removeClass('active').removeAttr('style');
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

    function showBubble($point, $bubble, imgWidth, imgHeight) {
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
      }

      //Rule for left/right
      if (fromPointToRight < bubbleWidth) {
        spaceLacking = (imgWidth - bubblePositionLeft - bubbleWidth) * -1;
        bubblePositionLeft = bubblePositionLeft - spaceLacking - pointSize / 2;
      }

      $bubble.css({ top: bubblePositionTop, left: bubblePositionLeft }).addClass('active');

      if (bubbleHeight < $bubble.find('.labelmaker-bubble-inner').prop('scrollHeight')) {
        $bubble.addClass('scrollable');
        preventPageScrollWhenScrollingBlock($('.scrollable .labelmaker-bubble-inner'));
      }
    }

    function labelmaker($img) {
      var imgWidth = $img.width();
      var imgHeight = $img.height();

      $img.wrap('<div class="labelmaker-container" />');
      var $imgContainer = $img.parent('.labelmaker-container');
      $imgContainer.width(imgWidth).height(imgHeight);

      $pointsContainer.hide();
      var labelmakerPoints = getLabelmakerPoints($pointsContainer);
      addPointsAndBubbles($imgContainer, labelmakerPoints);

      if (settings.showBubbleOn === 'hover') {
        $imgContainer.on({
            mouseenter: function(e) {
                e.stopPropagation();
                e.preventDefault();
                hideAllBubbles($imgContainer);
                $bubble = $(this).next();
                $point = $(this);
                showBubble($point, $bubble, imgWidth, imgHeight);
            },
            mouseleave: function(e) {
                hideAllBubbles($imgContainer);
            }
        }, '.labelmaker-point');
      } else {
        $imgContainer.on('click touchstart', '.labelmaker-point', function(e) {
          console.log('click', $(this));
          e.stopPropagation();
          e.preventDefault();
          hideAllBubbles($imgContainer);
          $bubble = $(this).next();
          $point = $(this);
          showBubble($point, $bubble, imgWidth, imgHeight);
        });

        $imgContainer.on('click touchstart', '.labelmaker-bubble', function(e) {
          e.stopPropagation();
        });

        $imgContainer.on('click touchstart', function(e) {
          console.log('hide all');
          hideAllBubbles($imgContainer);
        });
      }

      function actionOnWinowResize() {
        $imgContainer.removeAttr('style');
        imgWidth = $img.width();
        imgHeight = $img.height();
        $imgContainer.width(imgWidth).height(imgHeight);
        removePointsAndBubbles($imgContainer);
        addPointsAndBubbles($imgContainer, labelmakerPoints);
      }

      var resizeTimeout;
      $(window).on('resize orientationChanged', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(actionOnWinowResize, 100);
      });
    }

    return this.each(function() {
      var $img = $(this);
      // make sure that the image is loaded, even if cached
      // http://stackoverflow.com/a/3877079
      $img.one('load', function() {
        labelmaker($img);
      }).each(function() {
        if(this.complete) $(this).load();
      });
    });
  };
}(jQuery));
