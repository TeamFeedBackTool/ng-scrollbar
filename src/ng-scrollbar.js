(() => {

  'use strict';

  const app = angular.module('ngScrollbar', []);

  app.provider('$scrollbar', [function $scrollbarProvider() {
    let config = {
      enableY: true,
      enableX: true,
      enableButtons: false,
      enableWheel: true,
      wheelSpeed: 25,
      rebuildOnResize: true,
      rollToEnd: false
    };

    this.config = function(_config_) {
      Object.assign(config, _config_);
    };

    this.$get = [() => {
      const $scrollbar = {
        config: (_config_ = {}) => {
          return Object.assign(config, _config_);
        }
      };

      return $scrollbar;
    }];
  }]);

  app.directive('ngScrollbar', ['$parse', '$scrollbar', ($parse, $scrollbar) => {
    return {
      restrict: 'A',
      transclude: true,
      template: '<div class="ng-scrollbar-transcluded" ng-transclude></div>' +
                '<div class="ng-scrollbar-track-x">' +
                '  <div class="ng-scrollbar-thumb"></div>' +
                '  <div class="ng-scrollbar-button-left"></div>' +
                '  <div class="ng-scrollbar-button-right"></div>' +
                '</div>' +
                '<div class="ng-scrollbar-track-y">' +
                '  <div class="ng-scrollbar-thumb"></div>' +
                '  <div class="ng-scrollbar-button-top"></div>' +
                '  <div class="ng-scrollbar-button-bottom"></div>' +
                '</div>',
      link: (scope, element, attrs) => {
        element.addClass('ng-scrollbar');

        let config = $scrollbar.config();
        let activeTrack = null;

        let offsetX = 0, lastOffsetX = 0;
        let offsetY = 0, lastOffsetY = 0;

        const transcludedContent = element.children()[0];
        const jqTranscludedContent = angular.element(transcludedContent);

        const trackX = element[0].getElementsByClassName('ng-scrollbar-track-x')[0];
        const jqTrackX = angular.element(trackX);

        const trackY = element[0].getElementsByClassName('ng-scrollbar-track-y')[0];
        const jqTrackY = angular.element(trackY);

        const thumbX = trackX.getElementsByClassName('ng-scrollbar-thumb')[0];
        const jqThumbX = angular.element(thumbX);

        const thumbY = trackY.getElementsByClassName('ng-scrollbar-thumb')[0];
        const jqThumbY = angular.element(thumbY);

        function mousedown(event) {
          event.preventDefault();

          const parent = angular.element(event.target).parent();
          angular.element(parent).addClass('active');

          if (parent.hasClass('ng-scrollbar-track-y')) {
            activeTrack = jqTrackY;
            lastOffsetY = event.pageY - thumbY.offsetTop;
          } else if (parent.hasClass('ng-scrollbar-track-x')) {
            activeTrack = jqTrackX;
            lastOffsetX = event.pageX - thumbX.offsetTop;
          }

          document.addEventListener('mousemove', mousemove);
          document.addEventListener('mouseup', mouseup);
        }

        function mousemove(event) {
          event.stopPropagation();

          let top = 0, left = 0;

          if (activeTrack === jqTrackY) {
            offsetY = event.pageY - thumbY.scrollTop - lastOffsetY;
            top = Math.max(0, Math.min(
              trackY.offsetHeight - thumbY.offsetHeight,
              offsetY
            ));
            moveY(top);
          } else if (activeTrack === jqTrackX) {
            offsetX = event.pageX - thumbX.scrollTop - lastOffsetX;
            left = Math.max(0, Math.min(
              trackX.offsetWidth - thumbX.offsetWidth,
              offsetX
            ));
            moveX(left);
          }
        }

        function mouseup(event) {
          event.preventDefault();

          activeTrack.removeClass('active');

          document.removeEventListener('mousemove', mousemove);
          document.removeEventListener('mouseup', mouseup);
        }

        function mousewheel(event) {
          event.preventDefault();
          event.stopPropagation();

          const normalize = normalizeWheel(event);
          let delta = 0, top = 0, left = 0;

          if (normalize.spinY === 1 || normalize.spinY === -1) {
            delta = config.wheelSpeed * normalize.spinY;
            top = Math.max(0, Math.min(
              element[0].offsetHeight - thumbY.offsetHeight,
              thumbY.offsetTop + delta
            ));
            moveY(top);
          }
          if (normalize.spinX === 1 || normalize.spinX === -1) {
            delta = config.wheelSpeed * normalize.spinX;
            left = Math.max(0, Math.min(
              element[0].offsetWidth - thumbX.offsetWidth,
              thumbX.offsetLeft + delta
            ));
            moveY(left);
          }
        }

        /**
         * @name init
         *
         * @description
         * It's only purpose is to read the config and depending on that it adds or
         * removes event listeners or rebuild the scrollbar tracks.
         */
        function init() {
          const wheelEvent = document.onwheel !== undefined ? 'wheel' : document.mousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';

          if (config.enableX) {
            trackX.addEventListener('mousedown', mousedown);
          } else {
            trackX.removeEventListener('mousedown', mousedown);
          }

          if (config.enableY) {
            thumbY.addEventListener('mousedown', mousedown);
          } else {
            trackY.removeEventListener('mousedown', mousedown);
          }

          if (config.enableWheel) {
            element[0].addEventListener(wheelEvent, mousewheel, false);
          } else {
            element[0].removeEventListener(wheelEvent, mousewheel, false);
          }

          if (config.rollToEnd) {
            moveX(element[0].offsetWidth - thumbX.offsetWidth);
            moveY(element[0].offsetHeight - thumbY.offsetHeight);
          }

          if (config.rebuildOnResize) {
            window.addEventListener('resize', () => {
              buildTrack();
            });
          }

          element[0].addEventListener('mouseover', () => {
            element.addClass('focus');
          });

          element[0].addEventListener('mouseout', () => {
            element.removeClass('focus');
          });

          buildTrack();
        }

        /**
         * @name buildTrack
         *
         * @description
         * Calculates the height or width of the scrollbars with the given width and height
         * of the transcluded content element.
         */
        function buildTrack() {
          let width = transcludedContent.offsetWidth;
          let height = transcludedContent.offsetHeight;

          if (width !== null) {
            width = Math.max(0, Math.min(
              (element[0].offsetWidth / width * element[0].offsetWidth),
              element[0].offsetWidth
            ));
            jqThumbX.css({width: width + 'px'});

            if (width !== element[0].offsetWidth && config.enableY) {
              jqTrackX.addClass('visible');
            } else {
              jqTrackX.removeClass('visible');
            }

            if (config.rollToEnd) {
              moveX(element[0].offsetWidth - thumbX.offsetWidth);
            }
          }

          if (height !== null) {
            height = Math.max(0, Math.min(
              (element[0].offsetHeight / height * element[0].offsetHeight),
              element[0].offsetHeight
            ));
            jqThumbY.css({height: height + 'px'});

            if (height !== element[0].offsetHeight && config.enableY) {
              jqTrackY.addClass('visible');
            } else {
              jqTrackY.removeClass('visible');
            }

            if (config.rollToEnd) {
              moveY(element[0].offsetHeight - height);
            }
          }
        }

        function moveY(offset) {
          // When the main element's height is equal or larger than the transcluded content's height, then do nothing...
          if (element[0].offsetHeight >= transcludedContent.offsetHeight) {
            return;
          }
          jqThumbY.css({top: offset + 'px'});
          jqTranscludedContent.css({top: Math.round(transcludedContent.scrollHeight * (offset / element[0].offsetHeight) * -1) + 'px'});
        }

        function moveX(offset) {
          // When the main element's width is equal or larger than the transcluded content's width, then do nothing...
          if (element[0].offsetWidth >= transcludedContent.offsetWidth) {
            return;
          }
          jqThumbX.css({left: offset + 'px'});
          jqTranscludedContent.css({left: Math.round(transcludedContent.scrollWidth * (offset / element[0].offsetWidth) * -1) + 'px'});
        }

        scope.$watchCollection($parse(attrs.ngScrollbar), val => {
          angular.extend(config, val);
          init();
        });

        scope.$watch(() => transcludedContent.offsetWidth, width => {
          buildTrack(width);
        });

        scope.$watch(() => transcludedContent.offsetHeight, height => {
          buildTrack(null, height);
        });
      }
    };
  }]);

  // @todo Export as an extra module
  // Reasonable defaults
  const PIXEL_STEP  = 10;
  const LINE_HEIGHT = 40;
  const PAGE_HEIGHT = 800;

  // https://github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
  function normalizeWheel(event) {
    var sX = 0, sY = 0,       // spinX, spinY
        pX = 0, pY = 0;       // pixelX, pixelY

    // Legacy
    if ('detail'      in event) { sY = event.detail; }
    if ('wheelDelta'  in event) { sY = -event.wheelDelta / 120; }
    if ('wheelDeltaY' in event) { sY = -event.wheelDeltaY / 120; }
    if ('wheelDeltaX' in event) { sX = -event.wheelDeltaX / 120; }

    // side scrolling on FF with DOMMouseScroll
    if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
      sX = sY;
      sY = 0;
    }

    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;

    if ('deltaY' in event) { pY = event.deltaY; }
    if ('deltaX' in event) { pX = event.deltaX; }

    if ((pX || pY) && event.deltaMode) {
      if (event.deltaMode == 1) {          // delta in LINE units
        pX *= LINE_HEIGHT;
        pY *= LINE_HEIGHT;
      } else {                             // delta in PAGE units
        pX *= PAGE_HEIGHT;
        pY *= PAGE_HEIGHT;
      }
    }

    // Fall-back if spin cannot be determined
    if (pX && !sX) { sX = (pX < 1) ? -1 : 1; }
    if (pY && !sY) { sY = (pY < 1) ? -1 : 1; }

    return { spinX  : sX,
      spinY  : sY,
      pixelX : pX,
      pixelY : pY };
  }

})();