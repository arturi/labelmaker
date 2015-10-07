/*!
 * Labelmaker
 * by Artur Paikin, http://arturpaikin.com
 * https://github.com/arturi/labelmaker
 * MIT License
 */

(function ($) {
  'use strict';

  $.fn.labelmaker = function($pointsContainer, options) {

    var settings = $.extend({
          showOn: 'click',
        }, options);

    function getPoints() {
      return $pointsContainer.children().map(function() {
        return {
          top: parseInt($(this).data('top'), 10),
          left: parseInt($(this).data('left'), 10),
          text: $(this).html()
        };
      }).toArray().sort(function(x, y){
        if (x.top != y.top) {
          // From top to bottom
          return x.top - y.top;
        }
        else {
          // and from left to right when top is equal
          return x.left - y.left;
        }
      });
    }

    function template(point) {
      var html = '<div class="labelmaker-point" tabindex="1" style="top:' + point.top +'%; left:' + point.left + '%;"></div>';
      html += '<div class="labelmaker-bubble"><div class="labelmaker-bubble-inner">' + point.text + '</div></div>';
      return html;
    }

    function addPointsAndBubbles($imgContainer, labelmakerPoints) {
      var html = '';
      labelmakerPoints.forEach(function (point) {
        html += template(point);
      });
      $imgContainer.append(html);
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
      var labelmakerPoints = getPoints();
      addPointsAndBubbles($imgContainer, labelmakerPoints);

      function actionOnPointActive(e, that) {
        e.stopPropagation();
        e.preventDefault();
        hideAllBubbles($imgContainer);
        var $bubble = $(that).next();
        var $point = $(that);
        showBubble($point, $bubble, imgWidth, imgHeight);
      }

      $imgContainer.on('click touchstart focus', '.labelmaker-point', function(e) {
        actionOnPointActive(e, this);
      });

      if (settings.showOn === 'hover') {
        $imgContainer.on({
            'mouseenter': function(e) {
                actionOnPointActive(e, this);
            },
            'mouseleave': hideAllBubbles.bind(null, $imgContainer)
        }, '.labelmaker-point');
      }

      $imgContainer.on('click touchstart', '.labelmaker-bubble', function(e) {
        e.stopPropagation();
      });

      $(document).on('click', function(e) {
        hideAllBubbles($imgContainer);
      });

      $(document).on('keydown', function(e) {
        if (e.keyCode === 27) {
          hideAllBubbles($imgContainer);
        }
      });

      function actionOnWindowResize() {
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
        resizeTimeout = setTimeout(actionOnWindowResize, 100);
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
}(window.jQuery));
