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
            step: undefined,
            threshold: 30, 
            acceleration: true,
            preventVert: true,
            preventVertThreshold: 5
        };

        options = $.extend(defaults, options);

        options.step = options.step || window.innerWidth; // step or the whole screen width

        return this.each(function(i, el) {

            var x1, shiftX,
                y1, shiftY,
                t1,
                width = $(el).outerWidth(), // actual width
                currentX = (new WebKitCSSMatrix(getComputedStyle(el).webkitTransform)).m41, // initial shift
                currentI = ~~(-currentX / options.step), // initial index
                limitX = window.innerWidth - width, // max shift
                limitI = ~~(-limitX / options.step) || 1; // max index

            if (width > window.innerWidth) {

                function slide(shift) {
                    shiftAbs = Math.abs(shift);

                    var timeShift = Date.now() - t1,
                        speed = shiftAbs / timeShift,
                        accel = 1,
                        animationTime = '0.2',
                        step = options.step;

                    if (options.acceleration) {
                        accel = speed > 0.3 && speed < 0.6 ? 2 :
                                speed >= 0.6 && speed < 1 ? 3 :
                                speed >= 1 ? 4 :
                                1;

                        animationTime = accel >= 3 ? '0.3' : '0.2';
                    }

                    if (shiftAbs > options.threshold || !t1) {
                        if (shiftAbs > step) {
                            currentX += ~~(shift/step)*step;
                        }

                        if (shift > 0) {
                            currentX += step * accel;
                            currentI -= accel;
                        } else if (shift < 0) {
                            currentX -= step * accel;
                            currentI += accel;
                        }

                        if (currentX > 0) {
                            currentX = currentI = 0;
                        } else if (currentX < limitX) {
                            currentX = limitX;
                            currentI = limitI;
                        }
                    }

                    $(el)
                        .css({
                            '-webkit-transition':'-webkit-transform ' + animationTime + 's ease-out',
                            '-webkit-transform': 'translate3d(' + currentX + 'px, 0, 0)'
                        })
                        .trigger('slide', {
                            currentX: currentX,
                            limitX: limitX,
                            currentI: currentI,
                            limitI: limitI,
                            speed: speed.toFixed(2),
                            timeShift: timeShift,
                            acceleration: accel,
                            animationTime: animationTime
                        });

                    x1 = y1 = shiftX = shiftY = t1 = undefined;
                };


                $(el)
                    .css('-webkit-transform', 'translateZ(0)')
                    .bind({
                        'touchstart.touchSlides': function(e) {
                            var eo = e.originalEvent.touches[0];
                            x1 = eo.pageX;
                            y1 = eo.pageY;
                            $(this).css('-webkit-transition', 'none');
                            t1 = Date.now();
                        },

                        'touchmove.touchSlides': function(e) {
                            var eo = e.originalEvent.touches[0];
                            shiftX = eo.pageX - x1;
                            shiftY = eo.pageY - y1;

                            $(el).css('-webkit-transform', 'translate3d(' + (currentX + shiftX ) + 'px, 0, 0)');
                            if (options.preventVert && Math.abs(shiftY) > options.preventVertThreshold) {
                                e.preventDefault();
                            }
                        },

                        'touchend.touchSlides': function(e) {
                            slide(shiftX);
                        },

                        'touchcancel.touchSlides': function() {
                            x1 = y1 = shiftX = shiftY = t1 = undefined;
                        },

                        'slideLeft.touchSlides': function(e, step) {
                            slide(step || options.step);
                        },

                        'slideRight.touchSlides': function(e, step) {
                            slide(-step || -options.step);
                        }
                    });

                $(window).bind('orientationchange', function() {
                    if (Math.abs(window.orientation) == 90 && currentX - limitX <= window.innerWidth) {
                        currentX = limitX = window.innerWidth - width;
                        slide(0);
                    } else {
                        limitX = window.innerWidth - width;
                    }
                });

            }
        });

    };

    $.fn.yaUntouchSlider = function() {

        return this.each(function(i, el) {
            $(el).unbind('.touchSlides');
        });

    };

})(jQuery);
