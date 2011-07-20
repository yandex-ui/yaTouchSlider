/**
 * jQuery yaTouchSlider plugin
 *
 * Copyright (c) 2010-2011 Kir Belevich (deepsweet@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 0.2
 */

(function($) {

    $.fn.yaTouchSlider = function(options) {

        var defaults = {
            step: undefined, // step
            threshold: 30, // threshold (pixels) that must be overcome
            acceleration: true, // enable/disable slider acceleration boost
            preventVert: true, // prevent vertical scroll while sliding
            preventVertThreshold: 5 // vertical scroll preventing threshold (pixels)
        },
        step;

        options = $.extend(defaults, options);

        step = options.step || window.innerWidth; // step or the whole screen width

        return this.each(function(i, el) {

            var x1, shiftX,
                y1, shiftY,
                t1,
                width = $(el).outerWidth(), // actual width
                currentX = (new WebKitCSSMatrix(getComputedStyle(el).webkitTransform)).m41, // initial shift
                currentI = ~~(-currentX / step), // initial index
                limitX = window.innerWidth - width, // max shift
                limitI = Math.ceil(-limitX / step) || 1; // max index

            if (width > window.innerWidth) {

                function slide(shift) {
                    shiftAbs = Math.abs(shift);

                    var timeShift = Date.now() - t1,
                        speed = shiftAbs / timeShift, // pixels in ms
                        accel = 1,
                        animationTime = '0.2';

                    // slider acceleration
                    if (options.acceleration) {
                        accel = speed > 0.3 && speed < 0.6 ? 2 :
                                speed >= 0.6 && speed < 1 ? 3 :
                                speed >= 1 ? 4 :
                                1;

                        animationTime = accel >= 3 ? '0.3' : '0.2';
                    }

                    if (shiftAbs > options.threshold || !t1) {
                        // more than one step
                        if (shiftAbs > step) {
                            currentX += ~~(shift/step)*step;
                        }

                        // left or right direction
                        if (shift > 0) {
                            currentX += step * accel;
                            currentI -= accel;
                        } else if (shift < 0) {
                            currentX -= step * accel;
                            currentI += accel;
                        }

                        // left or right limit
                        if (currentX > 0) {
                            currentX = currentI = 0;
                        } else if (currentX < limitX) {
                            currentX = limitX;
                            currentI = limitI;
                        }
                    }

                    // callback after each slide
                    if (options.callback) {
                        $(el).one('webkitTransitionEnd', function() {
                            options.callback({
                                currentX: currentX,
                                limitX: limitX,
                                currentI: currentI,
                                limitI: limitI,
                                speed: speed.toFixed(2),
                                timeShift: timeShift,
                                acceleration: accel,
                                animationTime: animationTime
                            });
                        });
                    }

                    // animate to calculated position
                    $(el).css({
                        '-webkit-transition':'-webkit-transform ' + animationTime + 's ease-out',
                        '-webkit-transform': 'translate3d(' + currentX + 'px, 0, 0)'
                    });

                    // reset
                    x1 = y1 = shiftX = shiftY = t1 = undefined;
                };


                $(el)
                    .css('-webkit-transform', 'translateZ(0)')
                    .bind({
                        // start
                        'touchstart.touchSlides': function(e) {
                            var eo = e.originalEvent.touches[0];
                            x1 = eo.pageX;
                            y1 = eo.pageY;
                            $(this).css('-webkit-transition', 'none');
                            t1 = Date.now();
                        },

                        // move
                        'touchmove.touchSlides': function(e) {
                            var eo = e.originalEvent.touches[0];
                            shiftX = eo.pageX - x1;
                            shiftY = eo.pageY - y1;

                            $(el).css('-webkit-transform', 'translate3d(' + (currentX + shiftX ) + 'px, 0, 0)');
                            if (options.preventVert && Math.abs(shiftY) > options.preventVertThreshold) {
                                e.preventDefault();
                            }
                        },

                        // end
                        'touchend.touchSlides': function(e) {
                            slide(shiftX);
                        },

                        // cancel / reset
                        'touchcancel.touchSlides': function() {
                            x1 = y1 = shiftX = shiftY = t1 = undefined;
                        },

                        // left custom slide event
                        'slideLeft.touchSlides': function(e, customStep) {
                            slide(customStep || step);
                        },

                        // right custom slide event
                        'slideRight.touchSlides': function(e, customStep) {
                            slide(-customStep || -step);
                        }
                    });

                // correction of current position after device rotation
                $(window).bind('orientationchange', function() {
                    step = options.step || window.innerWidth;

                    if (Math.abs(window.orientation) == 90 && currentX - limitX <= window.innerWidth) {
                        currentX = limitX = window.innerWidth - width;
                        currentI++;
                        slide(0);
                    } else {
                        limitX = window.innerWidth - width;
                        currentI = currentI - Math.ceil((currentX - limitX)/step);
                        slide(0);
                    }
                });

            }
        });

    };

    // untouch
    $.fn.yaUntouchSlider = function() {

        return this.each(function(i, el) {
            $(el).unbind('.touchSlides');
        });

    };

})(jQuery);
