/* Created by Martin Hintzmann 2008 martin [a] hintzmann.dk
 * Created by Ryosuke Otsuya 2011 r.otsuya.co
 * MIT (http://www.opensource.org/licenses/mit-license.php) licensed.
 *
 * Version: 0.1
 * Requires: jQuery 1.2+
 *
 */
(function($) {
    $.fn.ieTextShadow = function(option) {
        if (!$.browser.msie) {
            return;
        }
        var isIE6 = $.browser.version < 7;
        return this.each(function() {
            var $element = $(this);
            $element.ieTextShadowRemove();
            var style = this.currentStyle || document.defaultView.getComputedStyle(this, '');
            var shadows;
            if (option instanceof Object) {
                if ('length' in option) {
                    shadows = option;
                } else {
                    shadows = [option];
                }
            } else {
                shadows = $element.ieTextShadowParse(style['text-shadow']);
            }
            var html = $element.html();
            for (var i = 0, l = shadows.length; i < l; i++) {
                var shadow = shadows[i];
                var tag = $element.get(0).tagName;
                var BLOCKS = ['ADDRESS', 'BLOCKQUOTE', 'CENTER', 'DIV', 'DL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
                    'OL', 'P', 'PRE', 'UL'];
                var INLINES = ['A', 'ABBR', 'ACRONYM', 'B', 'BIG', 'CITE', 'CODE', 'DFN', 'EM', 'FONT', 'I', 'KBD',
                    'LABEL', 'Q', 'S', 'SAMP', 'SMALL', 'SPAN', 'STRIKE', 'STRONG', 'TT', 'U', 'VAR'];
                var isBlock = ($.inArray(tag, BLOCKS) !== -1);
                var isInline = ($.inArray(tag, INLINES) !== -1);
                if (typeof shadow.opacity !== 'undefined' && shadow.opacity === 0) {
                    continue;
                }
                $element.css({
                    'zIndex'    : '0',
                    'height'    : isBlock ? $element.height() : ''
                });
                if ($element.css('position') === 'static') {
                    $element.css({position: 'relative'});
                }
                if (isInline) {
                    $element.css({display: 'inline-block'});
                }
                if (isIE6) {
                    $element.css({zoom: '1'});
                }
                var $div = $('<div></div>')
                    .addClass('jQueryTextShadow')
                    .css({
                        'position':         'absolute',
                        'left':             (parseInt(shadow.x) - Math.ceil(parseFloat(shadow.radius) / 2)) + 'px',
                        'top':              (parseInt(shadow.y) - Math.ceil(parseFloat(shadow.radius) / 2)) + 'px',
                        'margin':           '0',
                        'padding-top':      style['paddingTop'],
                        'padding-right':    style['paddingRight'],
                        'padding-bottom':   style['paddingBottom'],
                        'padding-left':     style['paddingLeft'],
                        'width':            $element.width(),
                        'height':           $element.height(),
                        'line-height':      style['lineHeight'],
                        'zIndex':           '-1',
                        'text-align':       style['textAlign'],
                        'color':            shadow.color || $element.css('color')
                    });
                $('<span></span>')
                    .css({
                        'line-height':      style['lineHeight']
                    })
                    .html(html)
                    .appendTo($div);

                if (shadow.radius) {
                    if (shadow.opacity < 1) {
                        $div.css({
                            filter: 'progid:DXImageTransform.Microsoft.Alpha(Style=0, Opacity='
                                + shadow.opacity * 100 + ') '
                                + 'progid:DXImageTransform.Microsoft.Blur(pixelradius='
                                + Math.ceil(parseFloat(shadow.radius) / 2) + ')'
                        });
                    } else {
                        $div.css({
                            filter: 'progid:DXImageTransform.Microsoft.Blur(pixelradius='
                                + Math.ceil(parseFloat(shadow.radius) / 2) + ')'
                        });
                    }
                } else {
                    if (shadow.opacity < 1) {
                        $div.css({
                            filter: 'progid:DXImageTransform.Microsoft.Alpha(Style=0, Opacity='
                                + shadow.opacity * 100 + ')'
                        });
                    }
                }
                $element.append($div);
            }
        });
    };

    $.fn.ieTextShadowParse = function(valueString) {
        var values
            = valueString
            .match(/(((#[0-9A-Fa-f]{3,6}|rgba?\(.*?\)) (\-?[0-9]+(em|px)? ?){1,3})|((\-?[0-9]+(em|px)? ){1,3}(#[0-9A-Fa-f]{3,6}|rgba?\(.*?\))))/g);
        if (values.length === 0) {
            return;
        }
        var shadows = [];
        for (var i = 0, l = values.length; i < l; i++) {
            var value = values[i];
            value = String(value)
                .replace(/^\s+|\s+$/gi, '')
                .replace(/\s*!\s*important/i, '')
                .replace(/\(\s*([^,\)]+)\s*,\s*([^,\)]+)\s*,\s*([^,\)]+)\s*,\s*([^\)]+)\s*\)/g, '($1/$2/$3/$4)')
                .replace(/\(\s*([^,\)]+)\s*,\s*([^,\)]+)\s*,\s*([^\)]+)\s*\)/g, '($1/$2/$3)');
            var shadow = {
                x      : 0,
                y      : 0,
                radius : 0,
                color  : null
            };
            if (value.length > 1 || value[0].toLowerCase() !== 'none') {
                value = value.replace(/\//g, ',');
                var color;
                if (value.match(/(\#[0-9A-Fa-f]{6}|\#[0-9A-Fa-f]{3}|(rgb)a?\([^\)]*\)|\b[a-z]+\b)/i)
                    && (color = RegExp.$1) ) {
                    shadow.color = color.replace(/^\s+/, '');
                    value = value.replace(shadow.color, '');
                }
                var isRgb = color.match(/rgba?\(.*?\)/);
                if (isRgb) {
                    var rgb = color.replace(/rgba?\(/, '').replace(/\)/, '').split(',');
                    shadow.color = '#'
                        + (parseInt(rgb[0]).toString(16).length === 1 ? '0' : '')
                        + parseInt(rgb[0]).toString(16)
                        + (parseInt(rgb[1]).toString(16).length === 1 ? '0' : '')
                        + parseInt(rgb[1]).toString(16)
                        + (parseInt(rgb[2]).toString(16).length === 1 ? '0' : '')
                        + parseInt(rgb[2]).toString(16);
                    if (rgb.length === 4) {
                        shadow.opacity = rgb[3];
                    }
                }
                value = $.map(value.replace(/^\s+|\s+$/g, '').split(/\s+/), function(_value) {
                    return (_value || '').replace(/^0[a-z]*$/, '') ? _value : 0;
                });

                switch (value.length) {
                    case 1:
                        shadow.x = shadow.y = value[0];
                        break;
                    case 2:
                        shadow.x = value[0];
                        shadow.y = value[1];
                        break;
                    case 3:
                        shadow.x = value[0];
                        shadow.y = value[1];
                        shadow.radius = value[2];
                        break;
                }
                if (shadow.color === 'transparent') {
                    shadow.x = shadow.y = shadow.radius = 0;
                    shadow.color = null;
                }
            }
            shadows.push(shadow);
        }
        return shadows;
    };

    $.fn.ieTextShadowRemove = function() {
        if (!$.browser.msie) {
            return;
        }
        return this.each(function() {
            $(this).children(".jQueryTextShadow").remove();
        });
    };
})(jQuery);
