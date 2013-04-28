/* 环境检测 */
var ZHUOZHUO = {
    Version : 20110205,
    BrowserKernel : {
        Trident : navigator.userAgent.indexOf("MSIE") > -1,
        Gecko   : navigator.userAgent.indexOf("Gecko/") > -1,
        Presto  : navigator.userAgent.indexOf("Presto/") > -1 || navigator.userAgent.indexOf("Opera/") > -1,
        WebKit  : navigator.userAgent.indexOf("AppleWebKit/") > -1,
        KHTML   : navigator.userAgent.indexOf("KHTML/") > -1 || navigator.userAgent.indexOf("Konqueror/") > -1
    },
    BrowserVersion : (/MSIE\s(\d+(\.\d+)*)/.exec(navigator.userAgent) || /rv:(\d+(\.\d+)*)/.exec(navigator.userAgent) || /AppleWebKit\/(\d+(\.\d+)*)/.exec(navigator.userAgent) || /Opera.(\d+(\.\d+)*)?/.exec(navigator.userAgent) || /Presto\/(\d+(\.\d+)*)/.exec(navigator.userAgent) || /KHTML\/(\d+(\.\d+)*)/.exec(navigator.userAgent) || /Konqueror\/(\d+(\.\d+)*)/.exec(navigator.userAgent) || /[;\(]\s*(\w?\d+(\.\d+)*)\s*\)?/.exec(navigator.userAgent) || [,null])[1],
    BrowserFeatures : {
        XPath        : !!document.evaluate,
        SelectorsAPI : !!document.querySelector
    },
    TRUE : function(){
        return true;
    },
    FALSE : function(){
        return false;
    }
};
/* 定义Object */
(function(){
    function getClass(object){
        return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
    }
    function extend(destination, source){
        for(var property in source) destination[property] = source[property];
        return destination;
    }
    function clone(object){
        return extend({}, object);
    }
    function isString(object){
        return typeof object === "string";
    }
    function isFunction(object){
        return typeof object === "function";
    }
    function isUndefined(object){
        return typeof object === "undefined";
    }
    function isArray(object){
        return getClass(object) === "Array";
    }
    function isNumber(object){
        return typeof object === "number";
    }
    function param(object){
        var array = [];
        for(var key in object) array.push(encodeURIComponent(key) + '=' + encodeURIComponent(object[key]));
        return array.join('&');
    }
    function toArray(iterable){
        if (!iterable) return [];
        if ("toArray" in iterable) return iterable.toArray();
        var length = iterable.length || 0, results = new Array(length);
        while (length--) results[length] = iterable[length];
        return results;
    }
    function tryThese(){
        var result;
        for (var i = 0, length = arguments.length; i < length; i++) try {
            result = arguments[i]();
            break;
        } catch (e) {}
        return result;
    }
    function gc(object){
        for(var key in object) object[key] = null;
    }
    extend(Object,{
        isUndefined : isUndefined,
        isFunction  : isFunction,
        isString    : isString,
        isNumber    : isNumber,
        tryThese    : tryThese,
        isArray     : isArray,
        toArray     : toArray,
        extend      : extend,
        clone       : clone,
        param       : param,
        gc          : gc
    });
})();
/* Event 扩展 */
(function(global){
    function extend(event){
        return {
            altKey        : event.altKey,
            clientX       : event.clientX,
            clientY       : event.clientY,
            ctrlKey       : event.ctrlKey,
            relatedTarget : event.fromElement || event.relatedTarget,
            keyCode       : event.keyCode,
            screenX       : event.screenX,
            screenY       : event.screenY,
            layerX	  : event.offsetX || event.layerX,
            layerY	  : event.offsetY || event.layerY,
            shiftKey	  : event.shiftKey,
            detail	  : event.detail ? event.detail > 0 ? 1 : -1 : event.wheelDelta > 0 ? -1 : 1,
            target        : event.srcElement || event.target,
            currentTarget : event.toElement || event.currentTarget,
            type	  : event.type
        };
    }
    function stopPropagation(event){
        event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    }
    function preventDefault(event){
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    }
    function addEvent(element, eventName, handler){
        if(eventName.toLowerCase() == "mousewheel" && ZHUOZHUO.BrowserKernel.Gecko) eventName = "DOMMouseScroll";
        element.attachEvent ? element.attachEvent("on" + eventName, handler) : element.addEventListener(eventName, handler, false);
        return element;
    }
    function removeEvent(element, eventName, handler){
        if(eventName.toLowerCase() == "mousewheel" && ZHUOZHUO.BrowserKernel.Gecko) eventName = "DOMMouseScroll";
        element.detachEvent ? element.detachEvent("on" + eventName, handler) : element.removeEventListener(eventName, handler, false);
        return element;
    }
    function target(event){
        var properties = extend(event);
        var node = properties.target, type = properties.type;
        var currentTarget = properties.currentTarget;
        if ((currentTarget && currentTarget.tagName) && (type === "load" || type === "error" || (type === "click" && currentTarget.tagName.toLowerCase() === "input" && currentTarget.type === "radio"))) node = currentTarget;
        if(node.nodeType === 3) node = node.parentNode;
        return node;
    }
    var handler = {
        stopPropagation	: stopPropagation,
        preventDefault	: preventDefault,
        removeEvent	: removeEvent,
        addEvent	: addEvent,
        extend          : extend,
        target          : target
    };
    global.Event ? Object.extend(global.Event, handler) : global.Event = handler;
})(this);
/* 扩展DOM */
(function(global){
    function extendElementWith(element, methods){
        for (var property in methods){
            var value = methods[property];
            if(Object.isFunction(value) && !(property in element)) element[property] = methodize(value);
        }
    }
    function methodize(handler){
        if(handler._methodized) return handler._methodized;
        return handler._methodized = function(){
            return handler.apply(this, arguments);
        };
    }
    function extend(element){
        if (!element || !Object.isUndefined(element._extendedByPrototype) || element.nodeType != 1 || element == window) return element;
        var methods = Object.clone(Element.Methods);
        var byTagName = "Methods_" + element.tagName.toUpperCase();
        if (Element[byTagName]) Object.extend(methods, Element[byTagName]);
        extendElementWith(element, methods);
        element._extendedByPrototype = ZHUOZHUO.TRUE;
        return element;
    }
    var handler = {
        extend : extend
    };
    global.Element ? Object.extend(global.Element, handler) : global.Element = handler;
})(this);
/* document 扩展 */
(function(global){
    var win = window, doc = document;
    function getDimensions(){
        var scrW, scrH;
        if(win.innerHeight && win.scrollMaxY) {
            scrW = win.innerWidth + win.scrollMaxX;
            scrH = win.innerHeight + win.scrollMaxY;
        } else if(!doc.body && doc.documentElement && doc.documentElement.scrollWidth){
            scrW = doc.documentElement.scrollWidth;
            scrH = doc.documentElement.scrollHeight;
        } else if(doc.body){
            scrW = doc.body.scrollWidth;
            scrH = doc.body.scrollHeight;
        }
        var winW, winH;
        if(win.innerHeight) {
            winW = win.innerWidth;
            winH = win.innerHeight;
        } else if (doc.documentElement && doc.documentElement.clientHeight){
            winW = doc.documentElement.clientWidth;
            winH = doc.documentElement.clientHeight;
        } else if (doc.body) {
            winW = doc.body.clientWidth;
            winH = doc.body.clientHeight;
        }
        var pageW = scrW < winW ? winW : scrW;
        var pageH = scrH < winH ? winH : scrH;
        return {
            pageWidth   : pageW,
            pageHeight  : pageH,
            screenWidth : winW,
            screenHeight: winH
        };
    }
    function getScrollOffsets(){
        var top = 0, left = 0;
        if(win.pageYOffset){
            top  = win.pageYOffset;
            left = win.pageXOffset;
        }else if(doc.compatMode && doc.compatMode != "BackCompat"){
            top  = doc.documentElement.scrollTop;
            left = doc.documentElement.scrollLeft;
        }else if(doc.body){
            top  = doc.body.scrollTop;
            left = doc.body.scrollLeft;
        }
        return {
            top  : top,
            left : left
        };
    }
    function createTable(rows, cells){
        var table = doc.createElement("table");
        for(var i = 0; i < rows; i++){
            table.insertRow(i);
            for(var j = 0; j < cells; j++) table.rows[i].insertCell(j);
        }
        return table;
    }
    function getElementsBySelector(selectors, element){
        element = element || doc;
        var _re0 = "(?=([^\"\']*[\"\'][^\"']*[\"'])*(?![^\"']*[\"']))";
        var _re1 = "(?=([^\\[]*\\[[^\\]]*\\])*(?![^\\]]*\\]))";
        var elements = ZHUOZHUO.BrowserFeatures.SelectorsAPI ? Object.toArray(element.querySelectorAll(selectors)) : ZHUOZHUO.BrowserFeatures.XPath ? _querySelectorAllByXPath(selectors, element) : _querySelectorAllByJavaScript(selectors, element);
        for(var i = 0, length = elements.length; i < length; i++) Element.extend(elements[i]);
        return elements;
        function _querySelectorAllByXPath(selectors, element){
            var xpath = selectors.trim();
            xpath = xpath.replace(new RegExp("^\\s*|\\s*,\\s*" + _re1, 'g'), function(e){
                return (e.indexOf(',') > -1 ? '|' : '') + ".//*";
            });
            xpath = xpath.replace(new RegExp("\\s*~\\s*" + _re1, 'g'), "/following-sibling::*");
            xpath = xpath.replace(new RegExp("\\s*\\+\\s*" + _re1, 'g'), "/following-sibling::*[1]");
            xpath = xpath.replace(new RegExp("\\s*>\\s*" + _re1, 'g'), "/*");
            xpath = xpath.replace(new RegExp("\\s+" + _re1, 'g'), "//*");
            xpath = xpath.replace(new RegExp("\\*(\\w)" + _re1, 'g'), "$1");
            xpath = xpath.replace(new RegExp("\\[\\s*(\\w+)\\s*]" + _re0, 'g'), "[@$1]");
            xpath = xpath.replace(new RegExp("\\.(\\w+)" + _re0, 'g'), "[class~='$1']");
            xpath = xpath.replace(new RegExp("#(\\w+)" + _re0, 'g'), "[id='$1']");
            xpath = xpath.replace(new RegExp("\\[\\s*(\\w+)\\s*\\^=\\s*'?([^']*)'?\\s*]" + _re0, 'g'), "[starts-with(@$1,'$2')]");
            xpath = xpath.replace(new RegExp("\\[\\s*(\\w+)\\s*\\$=\\s*'?([^']*)'?\\s*]" + _re0, 'g'), "[substring(@$1,(string-length(@$1) - string-length('$2') + 1))='$2']");
            xpath = xpath.replace(new RegExp("\\[\\s*(\\w+)\\s*\\*=\\s*'?([^']*)'?\\s*]" + _re0, 'g'), "[contains(@$1,'$2')]");
            xpath = xpath.replace(new RegExp("\\[\\s*(\\w+)\\s*\\|=\\s*'?([^']*)'?\\s*]" + _re0, 'g'), "[contains(concat('-',@$1,'-'),'-$2-')]");
            xpath = xpath.replace(new RegExp("\\[\\s*(\\w+)\\s*~=\\s*'?([^']*)'?\\s*]" + _re0, 'g'), "[contains(concat(' ',@$1,' '),' $2 ')]");
            xpath = xpath.replace(new RegExp("\\[\\s*(\\w+)\\s*=\\s*'?([^']*)'?\\s*]" + _re0, 'g'), "[@$1='$2']");
            var query = doc.evaluate(xpath, element, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null), results = [];
            for(var i = 0, length = query.snapshotLength; i < length; i++) results.push(query.snapshotItem(i));
            return results;
        }
        function _querySelectorAllByJavaScript(selectors, element){
            var expression = selectors.trim();
            expression = expression.replace(new RegExp("(^|\\s|,|>|\\+|~)(#|\\.|\\[)" + _re0, 'g'), "$1*$2");
            expression = expression.replace(new RegExp("\\s{2,}" + _re0, 'g'), ' ');
            expression = expression.replace(new RegExp("\\s*(>|\\+|~|,)\\s*" + _re0, 'g'), '$1');
            expression = expression.replace(new RegExp("#(\\w+)" + _re0, 'g'), "[id='$1']");
            expression = expression.replace(new RegExp("\\.(\\w+)" + _re0, 'g'), "[class~='$1']");
            var ElementArray = [], elements, child, selector;
            expression.trim().split(new RegExp(',' + _re1, 'g')).each(function(strSelector){
                if(strSelector == '') return false;
                elements = [element];
                strSelector = strSelector.replace(new RegExp("(\\s|>|\\+|~)(\\w|\\*)" + _re1, 'g'), "\n$1$2").split('\n');
                for (var i = 0, length = strSelector.length; i < length; i++){
                    child	= strSelector[i].substr(0, 1);
                    selector= strSelector[i].substr(1);
                    switch(child){
                        case ' ' :
                            elements = __concatMatcher(selector, elements);
                            break;
                        case '>' :
                            elements = __childSelectors(selector, elements);
                            break;
                        case '+' :
                            elements = __nextSiblings(selector, elements);
                            break;
                        case '~' :
                            elements = __nextSiblingAll(selector, elements);
                            break;
                        default :
                            elements = __concatMatcher(strSelector[i], elements);
                    }
                }
                ElementArray = ElementArray.concat(elements);
                return false;
            });
            return ElementArray.uniq();
            function __getTagAttrs(selector){
                var TAASL   = selector.replace(new RegExp("(\\[|])" + _re0, 'g'), '\n').split('\n');
                var tagName = TAASL[0], attrs=[];
                TAASL.shift();
                TAASL.each(function(v){
                    v = v.trim();
                    if(v != '' ) attrs.push('['+v+']');
                });
                attrs = attrs.join('');
                return {
                    tagName : tagName,
                    attrs   : attrs
                };
            }
            function __checkAttr(element, attrs){
                var TAASL = attrs.replace(new RegExp("\\[|]" + _re0, 'g'), '\n').split('\n'), value, returs = true;
                if(element.nodeType != 1) return false;
                for(var i = 0, length = TAASL.length; i < length; i++){
                    attrs = TAASL[i].trim();
                    if(attrs == '') continue;
                    attrs = attrs.replace(new RegExp("([~\\|\\^\\$\\*]?=)" + _re0, 'g'), "\n$1\n").split('\n');
                    attrs[0] = attrs[0].trim();
                    value = Element.Methods.getAttr.call(element, attrs[0]);
                    if(attrs.length == 1){
                        if(!/^(class|style)$/.test(attrs[0]) && (value === null || element[attrs[0]] === undefined)) returs = false;
                    }else{
                        attrs[2] = attrs[2].replace(/(^\s*')|('\s*$)/g, '');
                        switch(attrs[1]){
                            case "|=" :
                                if(!new RegExp("(^|-)" + attrs[2] + "(-|$)", 'g').test(value)) returs = false;
                                break;
                            case "~=" :
                                if(!new RegExp("(^|\\s)" + attrs[2] + "(\\s|$)", 'g').test(value)) returs = false;
                                break;
                            case "*=" :
                                if(!new RegExp(attrs[2], 'g').test(value)) returs = false;
                                break;
                            case "$=" :
                                if(!new RegExp(attrs[2] + '$', 'g').test(value)) returs = false;
                                break;
                            case "^=" :
                                if(!new RegExp('^' + attrs[2], 'g').test(value)) returs = false;
                                break;
                            default :
                                if(!new RegExp('^' + attrs[2] + '$', 'g').test(value)) returs = false;
                        }
                    }
                }
                return returs;
            }
            function __reTagAndAttr(tagAndAttrSelector, element){
                var v = __getTagAttrs(tagAndAttrSelector), returs = [];
                var elements = element.getElementsByTagName(v.tagName);
                for(var i = 0, length = elements.length; i < length; i++)
                    if(__checkAttr(elements[i], v.attrs)) returs.push(elements[i]);
                return returs;
            }
            function __concatMatcher(selector, elements){
                var returs = [];
                for(var i = 0, length = elements.length; i < length; i++) returs = returs.concat(__reTagAndAttr(selector, elements[i]));
                return returs;
            }
            function __childSelectors(selector, elements){
                var v = __getTagAttrs(selector), tmpelements = [], childnodes;
                for(var i = 0, length = elements.length; i < length; i++){
                    childnodes	= elements[i].childNodes;
                    for(var j = 0, len = childnodes.length; j < len; j++)
                        if(childnodes[j].nodeType == 1 && __checkAttr(childnodes[j], v.attrs) && (childnodes[j].tagName.toLowerCase() == v.tagName || v.tagName == '*'))
                            tmpelements.push(childnodes[j]);
                }
                return tmpelements;
            }
            function __nextSiblings(selector, elements){
                var v = __getTagAttrs(selector), tmpelements = [], next;
                for(var i = 0, length = elements.length; i < length; i++){
                    next = elements[i].nextSibling;
                    if(next && next.nodeType == 1 && checkattr(next, v.attrs) && (next.tagName.toLowerCase() == v.tagName || v.tagName == '*')) tmpelements.push(next);
                }
                return tmpelements;
            }
            function __nextSiblingAll(selector, elements){
                var v = __getTagAttrs(selector), tmpelements = [], next;
                for(var i = 0, length = elements.length; i < length; i++){
                    next = elements[i];
                    while(next){
                        if(next && next.nodeType == 1 && checkattr(next, v.attrs) && (next.tagName.toLowerCase() == v.tagName || v.tagName == '*')) tmpelements.push(next);
                        next  = next.nextSibling;
                    }
                }
                return tmpelements;
            }
        }
    }
    var view = {
        getDimensions	: getDimensions,
        getScrollOffsets: getScrollOffsets
    };
    var extend = {
        getElementsBySelector : getElementsBySelector,
        createTable           : createTable,
        view                  : view
    };
    global.Document ? Object.extend(global.Document, extend) : global.Document = extend;
})(this);
/* 扩展 String */
Object.extend(String.prototype, (function(){
    function trim(){
        return this.replace(/(^\s+)|(\s+$)/g, '');
    }
    function wlength(){
        return this.replace(/[^\x00-\xff]/g, "rr").length;
    }
    function wsubstr(wstart, wlength){
        wlength = isNaN(wlength) ? Number.MAX_VALUE : wlength;
        return wlength == 0 ? "" : this.wsubstring(wstart, wstart + wlength - 1);
    }
    function wsubstring(wstart, wend){
        var ws = Math.min(wstart, wend), we = Math.max(wstart, wend);
        var i = 0, length = this.length, retult = "";
        for(; i < length; i++){
            var wl = this.substring(0, i).wlength();
            if(wl > we) break;
            if(wl >= ws) retult += this.substr(i, 1);
        }
        return retult;
    }
    return {
        wsubstring : wsubstring,
        wlength    : wlength,
        wsubstr    : wsubstr,
        trim       : trim
    };
})());
/* 扩展 Array */
Object.extend(Array.prototype, (function(){
    function each(handler){
        var retus = [];
        for (var i = 0, length = this.length; i < length; i++) retus.push(handler(this[i], i));
        return retus;
    }
    function uniq(){
        var array = [];
        for(var i = 0, length = this.length; i < length; i++)
            if(array.indexOf(this[i]) == -1) array.push(this[i]);
        return array;
    }
    function indexOf(object, startIndex){
        startIndex = startIndex || 0;
        var length = this.length;
        if(startIndex < 0) startIndex = 0;
        if(startIndex > length) startIndex = length;
        for(; startIndex < length; startIndex++)
            if(this[startIndex] === object) return startIndex;
        return -1;
    }
    return {
        indexOf	: indexOf,
        each	: each,
        uniq	: uniq
    };
})());
/* 通用扩展 */
Element.Methods = {
    getElementsBySelector : function(selectors){
        return Document.getElementsBySelector(selectors, this);
    },
    addEvent : function(eventName, handler){
        return Event.addEvent(this, eventName, handler);
    },
    removeEvent : function(eventName, handler){
        return Event.removeEvent(this, eventName, handler);
    },
    startCapture : function(){
        this.setCapture ? this.setCapture() : window.captureEvents ? (ZHUOZHUO.BrowserKernel.Gecko && parseFloat(ZHUOZHUO.BrowserVersion) >= 1.9) ? ZHUOZHUO.TRUE() : window.captureEvents(Event.MOUSEMOVE) : ZHUOZHUO.TRUE();
        return this;
    },
    stopCapture : function(){
        this.releaseCapture ? this.releaseCapture() : window.releaseEvents ? (ZHUOZHUO.BrowserKernel.Gecko && parseFloat(ZHUOZHUO.BrowserVersion) >= 1.9) ? ZHUOZHUO.TRUE() : window.releaseEvents(Event.MOUSEMOVE) : ZHUOZHUO.TRUE();
        return this;
    },
    hasClassName : function(className){
        var elementClassName = this.className;
        return (elementClassName.length > 0 && (elementClassName == className || new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
    },
    addClassName : function(className){
        if(!this.hasClassName(className)) this.className += (this.className ? ' ' : '') + className;
        return this;
    },
    removeClassName : function(className){
        this.className = this.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').trim();
        return this;
    },
    hasAttr : function(attributeName) {
        if(this.hasAttribute) return this.hasAttribute(attributeName);
        return this.getAttribute(attributeName) != null;
    },
    setAttr : function(attributes, value){
        if(arguments.length == 2){
            var sets = {};
            sets[attributes] = value;
            return this.setAttr(sets);
        }
        var ieAtt = false;
        for(var property in attributes){
            if(property == "style" && ZHUOZHUO.BrowserKernel.Trident) ieAtt = this.style.cssText = attributes[property];
            if(!ieAtt) this.setAttribute(property, attributes[property]);
        }
        return this;
    },
    getAttr : function(attributeName){
        if(attributeName == "class" && ZHUOZHUO.BrowserKernel.Trident) return this.className;
        if(attributeName == "style" && ZHUOZHUO.BrowserKernel.Trident) return this.style.cssText;
        return this.getAttribute(attributeName);
    },
    setStyle : function(styles, value){
        if(arguments.length == 2){
            var sets = {};
            sets[styles] = value;
            return this.setStyle(sets);
        }
        for(var property in styles){
            if(ZHUOZHUO.BrowserKernel.Trident && parseFloat(ZHUOZHUO.BrowserVersion) < 8.0 && property == "zIndex" && styles[property] == "auto") styles[property] = "";
            property == "alphaImage" ? this.setAlphaImage(styles[property]) : property == "opacity" ? this.setOpacity(styles[property]) : this.style[property == "styleFloat" ? document.defaultView ? "cssFloat" : property : property] = styles[property];
        }
        return this;
    },
    getStyle : function(styleName){
        if(styleName == "opacity") return this.getOpacity();
        if(styleName == "alphaImage") return this.getAlphaImage();
        styleName = styleName == "styleFloat" ? document.defaultView ? "cssFloat" : styleName : styleName;
        styleName = styleName == "${opacity}" ? "opacity" : styleName;
        var value = this.currentStyle ? this.currentStyle[styleName] : document.defaultView.getComputedStyle(this, null) ? document.defaultView.getComputedStyle(this, null)[styleName] : this.style[styleName];
        if(/^(width|height)$/.test(styleName) && (isNaN(parseFloat(value)) || value.indexOf('%') > -1)){
            var values = (styleName == "width") ? ["Left", "Right"] : ["Top", "Bottom"];
            var padding = 0, border = 0;
            value = (styleName == "width") ? this.offsetWidth : this.offsetHeight;
            for(var i = 0, length = values.length; i < length; i++){
                padding += parseFloat(this.getStyle("padding" + values[i])) || 0;
                border += parseFloat(this.getStyle("border" + values[i] + "Width")) || 0;
            }
            value = value - padding - border + "px";
        }
        return value ? value : null;
    },
    setAlphaImage : function(url){
        if(this.filters){
            var filterName = "DXImageTransform.Microsoft.AlphaImageLoader";
            var AlphaImageLoader = this.filters[filterName];
            if(AlphaImageLoader){
                AlphaImageLoader.src = url;
                AlphaImageLoader.sizingMethod = "crop";
                AlphaImageLoader.Enabled = !!url;
            }else if(url) this.style.filter = "progid:" + filterName + "(sizingMethod=\"crop\", src=\"" + url + "\")";
        }else{
            if(url){
                this.style.backgroundImage = "url(\"" + url + "\")";
                this.style.backgroundRepeat= "no-repeat";
            }else this.style.backgroundImage = "none";
        }
        return this;
    },
    getAlphaImage : function(){
        if(this.filters){
            var AlphaImageLoader = this.filters["DXImageTransform.Microsoft.AlphaImageLoader"];
            return (AlphaImageLoader && AlphaImageLoader.Enabled) ? AlphaImageLoader.src : null;
        }else return this.getStyle("backgroundImage").replace(/^\s*url\s*\(\s*["']?\s*([^"'\)]+)\s*['"]?\s*\)\s*$/i,"$1") || null;
    },
    setOpacity : function(opacity){
        if(this.filters){
            var filterName = "DXImageTransform.Microsoft.Alpha";
            var Alpha = this.filters[filterName];
            opacity = opacity * 100;
            if(Alpha){
                Alpha.Enabled = opacity !== 100;
                Alpha.Opacity = opacity;
            }else if(opacity !== 100) this.style.filter = "progid:" + filterName + "(opacity = " + opacity + ")";
        }else{
            this.style.opacity     = opacity;
            this.style.MozOpacity  = opacity;
            this.style.KhtmlOpacity= opacity;
        }
        return this;
    },
    getOpacity : function(){
        var opacity = NaN;
        if(this.filters){
            var Alpha = this.filters["DXImageTransform.Microsoft.Alpha"];
            opacity = (Alpha && Alpha.Enabled) ? Alpha.Opacity / 100 : NaN;
        }
        if(isNaN(opacity)) opacity = parseFloat(this.getStyle("${opacity}"));
        if(isNaN(opacity)) opacity = parseFloat(this.getStyle("MozOpacity"));
        if(isNaN(opacity)) opacity = parseFloat(this.getStyle("KhtmlOpacity"));
        if(isNaN(opacity)) opacity = 1;
        return opacity;
    },
    setText : function(value){
        this.innerHTML = '';
        this.innerText ? this.innerText = value : this.appendChild(document.createTextNode(value));
        return this;
    },
    getText : function(){
        if(this.innerText) return this.innerText;
        var value = undefined;
        try{
            value = this.textContent;
        }catch(e){}
        return value || this.innerHTML.replace(/<[^<>]*>/g, '').replace("&nbsp;", ' ').replace("&lt;", '<').replace("&gt;", '>').replace("&amp;", '&').replace("&quot;", '"');
    },
    show : function(value){
        this.style.display = value || "block";
        return this;
    },
    hide : function(){
        this.style.display = "none";
        return this;
    },
    toggle : function(value){
        return this.getStyle("display") == "none" ? this.show(value) : this.hide();
    },
    getOffsets : function(){
        var top = 0, left = 0, element = this;
        do{
            top += element.offsetTop  || 0;
            left+= element.offsetLeft || 0;
            element = element.offsetParent;
            if(element){
                if(element.tagName.toUpperCase() == 'BODY') break;
                if(Element.Methods.getStyle.call(element, "position") !== "static") break;
            }
        }while(element);
        return {
            left : left,
            top  : top
        };
    },
    getDimensions : function(){
        var display = this.getStyle("display");
        if (display != "none" && display != null) return {
            width  : this.offsetWidth,
            height : this.offsetHeight
        };
        var originalVisibility = this.getStyle("visibility");
        var originalPosition = this.getStyle("position");
        var originalDisplay = this.getStyle("display");
        this.style.visibility = "hidden";
        this.style.position   = "absolute";
        this.style.display    = "block";
        var originalWidth = this.clientWidth;
        var originalHeight = this.clientHeight;
        this.style.visibility = originalVisibility;
        this.style.position   = originalPosition;
        this.style.display    = originalDisplay;
        return {
            width  : originalWidth,
            height : originalHeight
        };
    },
    remove : function(){
        if(ZHUOZHUO.BrowserKernel.Trident){
            var div = document.createElement("div");
            div.appendChild(this);
            div.innerHTML ='';
        }else this.parentNode.removeChild(this);
        return this;
    },
    insert : function(sWhere, oElement){
        if(this.insertAdjacentElement) this.insertAdjacentElement(sWhere, oElement);
        else{
            sWhere = sWhere.toLowerCase();
            var parentNode = this.parentNode;
            switch(sWhere){
                case "beforebegin" :
                    parentNode.insertBefore(oElement, this);
                    break;
                case "afterbegin" :
                    this.insertBefore(oElement, this.firstChild);
                    break;
                case "beforeend" :
                    this.appendChild(oElement);
                    break;
                case "afterend" :
                    this.nextSibling ? parentNode.insertBefore(oElement, this.nextSibling) : parentNode.appendChild(oElement);
                    break;
                default :
                    throw "function insertElement(element, sWhere{error!}, oElement)";
            }
        }
        return oElement;
    },
    animate : function(styles, frames, delay, factor, callback){
        if(Object.isFunction(frames)){
            callback = frames;
            frames  = 6;
        }
        if(Object.isFunction(delay)){
            callback = delay;
            delay   = 50;
        }
        if(Object.isFunction(factor)){
            callback = factor;
            factor  = "average";
        }
        frames      = frames ? frames : 6;
        delay       = delay ? delay : 50;
        factor      = factor ? factor : "average";
        callback     = callback ? callback : ZHUOZHUO.TRUE;
        var toStyles = Object.clone(styles);
        var newStyles = Object.clone(styles);
        var average = Object.isNumber(factor) ? factor : frames;
        for(var style in newStyles){
            var newStyle = parseFloat(this.getStyle(style));
            var toStyle  = parseFloat(toStyles[style]);
            var nowStyle = (newStyle < toStyle) ? newStyle + (toStyle - newStyle) / average : newStyle - (newStyle - toStyle) / average;
            nowStyle = Math.round(nowStyle * 100) / 100;
            nowStyle = toStyles[style].toString().replace(toStyle,nowStyle);
            newStyles[style] = nowStyle;
        }
        var element = this;
        if(this._changeAnimate) window.clearTimeout(this._changeAnimate);
        this._changeAnimate = window.setTimeout(function(){
            if(frames > 1){
                element.setStyle(newStyles);
                element.animate(styles, frames - 1, delay, factor, callback);
            }else{
                window.clearTimeout(element._changeAnimate);
                element._changeAnimate = null;
                element.setStyle(styles);
            }
            callback(element, frames - 1);
        }, delay);
        return this;
    }
};
/* 特殊标签 */
Element.Methods_INPUT = {
    getValue : function(){
        return this.value;
    },
    setValue : function(value){
        this.value = value;
    }
};
Element.Methods_FORM = {};
Element.Methods_TEXTAREA = Object.extend(Object.clone(Element.Methods_INPUT), {});
Element.Methods_SELECT = Object.extend(Object.clone(Element.Methods_INPUT), {});
/* id选择器 */
function $() {
    if (arguments.length > 1) {
        for (var i = 0, elements = [], length = arguments.length; i < length; i++) elements.push($(arguments[i]));
        return elements;
    }
    return Element.extend(Object.isString(arguments[0]) ? document.getElementById(arguments[0]) : arguments[0]);
}
/* css选择器 */
function $$(){
    if (arguments.length > 1) {
        for (var i = 0, elements = [], length = arguments.length; i < length; i++) elements.push($$(arguments[i]));
        return elements;
    }
    return Document.getElementsBySelector(arguments[0]);
}
/* Function Create Class */
function Class(){
    var kclass, baseclass, method, superclass = (function(){}).prototype;
    kclass = function(){
        this.initialize.apply(this, arguments);
    }
    superclass.initialize = kclass.prototype.initialize = function(){};
    superclass.clone = kclass.prototype.clone = function(){
        var object = new this.constructor, property;
        for(property in this)
            if(!Object.isFunction(object[property]))
                object[property] = this[property];
        return object;
    }
    superclass.equals = kclass.prototype.equals = function(object){
        var sthis="", sobject="", key;
        for(key in this) sthis  += key + this[key];
        for(key in object) sobject += key + object[key];
        return sthis === sobject;
    }
    superclass.finalize = kclass.prototype.finalize = function(){
        for(var key in this) this[key] = null;
    }
    for(var i = 0, length = arguments.length; i < length; i++){
        if(Object.isFunction(arguments[i])){
            baseclass = function(){};
            baseclass.prototype = arguments[i].prototype;
            baseclass = new baseclass;
            for(method in baseclass)
                superclass[method] = baseclass[method];
        }else baseclass = arguments[i];
        for(method in baseclass)
            if(!/^(toString|valueOf)$/.test(method))
                if(Object.isFunction(baseclass[method]))
                    kclass.prototype[method] = baseclass[method];
        if(baseclass.toString!== Object.prototype.toString)
            kclass.prototype.toString= baseclass.toString;
        if(baseclass.valueOf !== Object.prototype.valueOf)
            kclass.prototype.valueOf = baseclass.valueOf;
    }
    kclass.superclass = superclass;
    return kclass;
}
/* Class EventListener */
var EventListener = Class({
    initialize : function(){
        EventListener.superclass.initialize.apply(this);
        this._Listeners = [];
    },
    addListener : function(eventName, handler){
        if(!Object.isFunction(handler)) return;
        var i=0, length = this._Listeners.length;
        for(; i < length; i++)
            if(this._Listeners[i].eventName === eventName && this._Listeners[i].handler === handler) return;
        this._Listeners[length] = new Object();
        this._Listeners[length].eventName = eventName;
        this._Listeners[length].handler = handler;
    },
    removeListener : function(eventName, handler){
        if(!Object.isFunction(handler)) return;
        var i=0, length = this._Listeners.length;
        for(; i < length; i++)
            if(this._Listeners[i].eventName === eventName && this._Listeners[i].handler === handler)
                this._Listeners.splice(i, 1);
    },
    notifyEvent : function(eventName, eventObject){
        var i=0, length = this._Listeners.length;
        for(; i < length; i++)
            if(this._Listeners[i].eventName === eventName)
                this._Listeners[i].handler(eventObject);
    },
    finalize : function(){
        for(var i=0, length = this._Listeners.length; i < length; i++)
            this._Listeners[i].eventName = this._Listeners[i].handler = null;
        EventListener.superclass.finalize.apply(this);
    }
});
/* Ajax */
var Ajax = {
    _cf :  {
        url:"",
        data:null,
        async:true,
        user:null,
        password:null,
        request:ZHUOZHUO.FALSE,
        success:ZHUOZHUO.FALSE,
        failure:ZHUOZHUO.FALSE
    },
    /* class Ajax.Response */
    Response : Class({
        initialize : function(xmlHttp){
            Ajax.Response.superclass.initialize.apply(this);
            this.xmlHttp    = xmlHttp;
            this.readyState = xmlHttp.readyState;
            this.text       = xmlHttp.responseText;
            this.xml        = xmlHttp.responseXML;
            this.status     = xmlHttp.status;
            this.length     = this.getHeader("Content-Length");
            this.type       = this.getHeader("Content-Type");
        },
        getAllHeaders : function(){
            return this.xmlHttp.getAllResponseHeaders();
        },
        getHeader : function(header){
            try{
                return this.xmlHttp.getResponseHeader(header);
            }catch(e){}
            return null;
        }
    }),
    /* class Ajax.Request */
    Request : Class(EventListener, {
        initialize : function(){
            Ajax.Request.superclass.initialize.apply(this);
            this.xmlHttp = Object.tryThese(function(){
                return new XMLHttpRequest();
            }, function(){
                return new ActiveXObject("Msxml2.XMLHTTP");
            }, function(){
                return new ActiveXObject("Microsoft.XMLHTTP");
            }) || null;
            this.encoding = "UTF-8";
        },
        open : function(url, method, async, user, password){
            this._url           = url;
            this._method        = (method || "POST").toUpperCase();
            this._async         = async !== undefined ? async : true;
            this._user          = user || null;
            this._password      = password || null;
            this._requestHeaders= {};
            if(this._method == "POST") this.setHeader("Content-Type", "application/x-www-form-urlencoded; charset=" + this.encoding);
        },
        setHeader : function(header, value){
            this._requestHeaders[header] = value;
        },
        setHeaders : function(headers){
            Object.extend(this._requestHeaders, headers);
        },
        send : function(params){
            params = Object.param(Object.extend(Object.clone(params), {
                _ : ''
            }));
            var runtime = this;
            this._url += this._method == "GET" ? (this._url.indexOf('?') > -1 ? '&' : '?') + params : '';
            this.xmlHttp.open(this._method, this._url, this._async, this._user, this._password);
            if(this._async) this.xmlHttp.onreadystatechange = function(){
                runtime._onreadystatechange(runtime);
            };
            for(var header in this._requestHeaders) this.xmlHttp.setRequestHeader(header, this._requestHeaders[header]);
            this.xmlHttp.send(this._method == "POST" ? params : null);
            if(!this._async) this._onreadystatechange(runtime);
        },
        abort : function(){
            this.xmlHttp.abort();
        },
        _onreadystatechange : function(runtime){
            runtime.notifyEvent("request", runtime.xmlHttp.readyState);
            if(runtime.xmlHttp.readyState == 4)
                runtime.notifyEvent(runtime.xmlHttp.status == 200 ? "success" : "failure", new Ajax.Response(runtime.xmlHttp));
        }
    }),
    /* get Function */
    get : function(conf,method){
        var cf = Object.extend(Object.clone(Ajax._cf),conf);
        var ajax = new Ajax.Request();
        ajax.open(cf.url,method || "GET",cf.async,cf.user,cf.password);
        ajax.addListener("request",cf.request);
        ajax.addListener("success",cf.success);
        ajax.addListener("failure",cf.failure);
        ajax.send(cf.data);
        return ajax;
    },
    /* post Function */
    post : function(conf){
        return Ajax.post(conf, "POST");
    }
}