/* 
 * zhuozhuo.org javascript library core code
 * Shi,Zhuolin
 * http://www.zhuozhuo.org
 * shizhuolin@hotmail.com
 * 2011-03-01
 */
(function(scope){
    var zz = scope.zhuozhuo = scope.zhuozhuo || {};
    //library version
    zz.version = 3.0;
    //register namespace
    zz.namespace = function(ns){
        if (!ns || !ns.length) return null;
        var levels = ns.split('.'), nsobj = scope;
        for (var i = 0; i < levels.length; i++) {
            nsobj[levels[i]] = nsobj[levels[i]] || {};
            nsobj = nsobj[levels[i]];
        }
        return nsobj;
    }
    //create javascript class
    zz.zclass = function(){
        var zclass, baseclass, method, superclass = (function(){}).prototype;
        zclass = function(){
            this.initialize.apply(this, arguments);
        }
        superclass.initialize = zclass.prototype.initialize = function(){};
        superclass.finalize = zclass.prototype.finalize = function(){
            for(var key in this) this[key] = null;
        }
        for(var i = 0, length = arguments.length; i < length; i++){
            if(zz.util.isFunction(arguments[i])){
                baseclass = function(){};
                baseclass.prototype = arguments[i].prototype;
                baseclass = new baseclass;
                for(method in baseclass) superclass[method] = baseclass[method];
            }else {
                baseclass = arguments[i];
            }
            for(method in baseclass)
                if(!/^(toString|valueOf)$/.test(method))
                    if(zz.util.isFunction(baseclass[method])) zclass.prototype[method] = baseclass[method];
            if(baseclass.toString!== Object.prototype.toString) zclass.prototype.toString= baseclass.toString;
            if(baseclass.valueOf !== Object.prototype.valueOf) zclass.prototype.valueOf = baseclass.valueOf;
        }
        zclass.superclass = superclass;
        return zclass;
    }
    //zhuozhuo.getById
    zz.getById = function(){
        if (arguments.length > 1) {
            for (var i = 0, elements = [], length = arguments.length; i < length; i++) elements.push(zz.getById(arguments[i]));
            return elements;
        }
        return zz.element.extend(zz.util.isString(arguments[0]) ? document.getElementById(arguments[0]) : arguments[0]);
    }
    //zhuozhuo.getBySelector
    zz.getBySelector = function(selectors, isAll){
        return zz.getById(document).getBySelector(selectors, isAll);
    }
})(this);
//browser information
(function(scope){
    var agent = navigator.userAgent;
    scope.zhuozhuo.browser = {
        version : (/MSIE\s(\d+(\.\d+)*)/.exec(agent) || /rv:(\d+(\.\d+)*)/.exec(agent) || /AppleWebKit\/(\d+(\.\d+)*)/.exec(agent) || /Opera.(\d+(\.\d+)*)?/.exec(agent) || /Presto\/(\d+(\.\d+)*)/.exec(agent) || /KHTML\/(\d+(\.\d+)*)/.exec(agent) || /Konqueror\/(\d+(\.\d+)*)/.exec(agent) || /[;\(]\s*(\w?\d+(\.\d+)*)\s*\)?/.exec(agent) || [,null])[1],
        kernel : {
            isTrident : agent.indexOf("MSIE") > -1,
            isGecko   : agent.indexOf("Gecko/") > -1,
            isPresto  : agent.indexOf("Presto/") > -1 || agent.indexOf("Opera/") > -1,
            isWebKit  : agent.indexOf("AppleWebKit/") > -1,
            isKHTML   : agent.indexOf("KHTML/") > -1 || agent.indexOf("Konqueror/") > -1
        },
        features : {
            isXPath        : !!document.evaluate,
            isSelectorsAPI : !!document.querySelector
        }
    }
})(this);
//zhuozhuo.util.*
(function(scope){
    var zz = scope.zhuozhuo;
    zz.util = {
        getClass : function(object){
            return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1];
        },
        extend : function(destination, source){
            for(var property in source) destination[property] = source[property];
            return destination;
        },
        clone : function(object){
            return zz.util.extend({}, object);
        },
        isArray : function(object){
            return zz.util.getClass(object) === "Array";
        },
        isUndefined : function(object){
            return typeof object === "undefined";
        },
        isFunction : function(object){
            return typeof object === "function";
        },
        isString : function(object){
            return typeof object === "string";
        },
        isNumber : function(object){
            return typeof object === "number";
        },
        toArray : function(iterable){
            if (!iterable) return [];
            if ("toArray" in iterable) return iterable.toArray();
            var length = iterable.length || 0, results = new Array(length);
            while (length--) results[length] = iterable[length];
            return results;
        },
        fnEmpty : function(){},
        fnTrue : function(){
            return true;
        },
        param : function(object){
            var array = [];
            for(var key in object) array.push(encodeURIComponent(key) + '=' + encodeURIComponent(object[key]));
            return array.join('&');
        },
        trys : function(){
            var result;
            for (var i = 0, length = arguments.length; i < length; i++) try {
                result = arguments[i]();
                break;
            }
            catch (e) {}
            return result;
        }
    }
    zz.util.string = {
        trim : function(value){
            return value.replace(/(^\s+)|(\s+$)/g, '');
        },
        wlength : function(value){
            return value.replace(/[^\x00-\xff]/g, "rr").length;
        },
        wsubstr : function(value, wstart, wlength){
            wlength = isNaN(wlength) ? Number.MAX_VALUE : wlength;
            return wlength == 0 ? "" : zz.util.string.wsubstring(value, wstart, wstart + wlength - 1);
        },
        wsubstring : function(value, wstart, wend){
            var ws = Math.min(wstart, wend), we = Math.max(wstart, wend);
            var i = 0, length = value.length, retult = "";
            for(; i < length; i++){
                var wl = value.substring(0, i).wlength();
                if(wl > we) break;
                if(wl >= ws) retult += value.substr(i, 1);
            }
            return retult;
        }
    }
    zz.util.array = {
        each : function(arr, handler){
            var retus = [];
            for (var i = 0, length = arr.length; i < length; i++) retus.push(handler(arr[i], i));
            return retus;
        },
        uniq : function(arr){
            var array = [];
            for(var i = 0, length = arr.length; i < length; i++)
                if(zz.util.array.indexOf(array, arr[i]) == -1) array.push(arr[i]);
            return array;
        },
        indexOf : function(arr, object, startIndex){
            startIndex = startIndex || 0;
            var length = arr.length;
            if(startIndex < 0) startIndex = 0;
            if(startIndex > length) startIndex = length;
            for(; startIndex < length; startIndex++)
                if(arr[startIndex] === object) return startIndex;
            return -1;
        }
    }
})(this);
//zhuozhuo.event.*
(function(scope){
    var zz = scope.zhuozhuo;
    var util = zz.util;
    zz.event = {
        Event : zz.zclass({
            initialize : function(event){
                this.event   = event;
                this.altKey  = event.altKey;
                this.clientX = event.clientX;
                this.clientY = event.clientY;
                this.ctrlKey = event.ctrlKey;
                this.keyCode = event.keyCode;
                this.screenX = event.screenX;
                this.screenY = event.screenY;
                this.layerX  = event.offsetX || event.layerX;
                this.layerY  = event.offsetY || event.layerY;
                this.shiftKey= event.shiftKey;
                this.detail  = event.detail ? event.detail > 0 ? 1 : -1 : event.wheelDelta > 0 ? -1 : 1;
                this.target  = event.srcElement || event.target;
                this.type    = event.type;
                this.relatedTarget= event.fromElement || event.relatedTarget;
                this.currentTarget= event.toElement || event.currentTarget;
            },
            stopPropagation : function(){
                var event = this.event;
                event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
                return this;
            },
            preventDefault : function(){
                var event = this.event;
                event.preventDefault ? event.preventDefault() : event.returnValue = false;
                return this;
            },
            getTarget : function(){
                var node = this.target, type = this.type;
                var currentTarget = this.currentTarget;
                if ((currentTarget && currentTarget.tagName) && (type === "load" || type === "error" || (type === "click" && currentTarget.tagName.toLowerCase() === "input" && currentTarget.type === "radio"))) node = currentTarget;
                if(node.nodeType === 3) node = node.parentNode;
                return zz.element.extend(node);
            }
        }),
        Listener : zz.zclass({
            initialize : function(){
                this.listeners = [];
            },
            addListener : function(eventName, handler){
                if(!util.isFunction(handler)) return;
                for(var i = 0, length = this.listeners.length; i < length; i++)
                    if(this.listeners[i].eventName === eventName && this.listeners[i].handler === handler)
                        return;
                this.listeners.push({
                    eventName : eventName,
                    handler : handler
                });
            },
            removeListener : function(eventName, handler){
                if(!util.isFunction(handler)) return;
                for(var i = 0, length = this.listeners.length; i < length; i++)
                    if(this.listeners[i].eventName === eventName && this.listeners[i].handler === handler)
                    {
                        this.listeners[i] = this.listeners[i].eventName = this.listeners[i].handler = null;
                        this.listeners.splice(i, 1);
                        return;
                    }
            },
            notifyEvent : function(eName, eobj){
                for(var i = 0, length = this.listeners.length; i < length; i++)
                    if(this.listeners[i].eventName === eName)
                        this.listeners[i].handler(eobj);
            },
            finalize : function(){
                for(var i = 0, length = this.listeners.length; i < length; i++)
                    this.listeners[i].eventName = this.listeners[i].handler = null;
                zz.event.Listener.superclass.finalize.apply(this)
            }
        })
    }
})(this);
//window and document and other element
(function(scope){
    var zz = scope.zhuozhuo;
    var util = zz.util;
    zz.namespace("zhuozhuo.element.tag");
    zz.element.zdomcache = [];
    zz.element.syncCache = function(){
        var newcache = [];
        for(var i = 0, length = zz.element.zdomcache.length; i < length; i++){
            if(!checkin(zz.element.zdomcache[i].element)){
                zz.element.zdomcache[i].finalize();
                zz.element.zdomcache[i] = null;
            }else newcache.push(zz.element.zdomcache[i]);
        }
        zz.element.zdomcache = newcache;
        function checkin(ele){
            while(ele){
                if(ele === window.document.body) return true
                if(ele === window.document) return true;
                if(ele === window) return true;
                ele = ele.parentNode;
            }
            return false;
        }
    };
    zz.element.extend = function(element){
        if(!element || util.isFunction(element) || !!element.element || !!element.initialize) return element;
        var byClass;
        if(element === window) byClass = zz.element.window;
        else{
            if(element === document) byClass = zz.element.document;
            else{
                if(element.nodeType != 1) return element;
                byClass = zz.element.tag[element.tagName.toUpperCase()] || zz.element.document;
            }
        }
        for(var i=0, length = zz.element.zdomcache.length; i < length ; i++)
            if(zz.element.zdomcache[i].element === element) return zz.element.zdomcache[i];
        var zdom = new byClass(element);
        zz.element.zdomcache.push(zdom);
        return zdom;
    }
    zz.element.createTable = function(rows, cells){
        var table = document.createElement("table");
        for(var i = 0; i < rows; i++){
            table.insertRow(i);
            for(var j = 0; j < cells; j++) table.rows[i].insertCell(j);
        }
        return zz.element.extend(table);
    }
    zz.element.createElement= function(tagName){
        return zz.element.extend(document.createElement(tagName));
    }
    zz.element.view = {
        getDimensions : function(){
            var scrW, scrH, win = window, doc = document;
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
        },
        getScrollOffsets : function(){
            var top = 0, left = 0, win = window, doc = document;
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
    }
    zz.element.getElementsBySelector = function(selectors, zdom){
        var element = zdom.element;
        var _re0 = "(?=([^\"\']*[\"\'][^\"']*[\"'])*(?![^\"']*[\"']))";
        var _re1 = "(?=([^\\[]*\\[[^\\]]*\\])*(?![^\\]]*\\]))";
        var elements = zz.browser.features.isSelectorsAPI ? util.toArray(element.querySelectorAll(selectors)) : zz.browser.features.isXPath ? _querySelectorAllByXPath(selectors, element) : _querySelectorAllByJavaScript(selectors, element);
        for(var i = 0, length = elements.length; i < length; i++) elements[i] = zz.element.extend(elements[i]);
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
            var expression = util.string.trim(selectors);
            expression = expression.replace(new RegExp("(^|\\s|,|>|\\+|~)(#|\\.|\\[)" + _re0, 'g'), "$1*$2");
            expression = expression.replace(new RegExp("\\s{2,}" + _re0, 'g'), ' ');
            expression = expression.replace(new RegExp("\\s*(>|\\+|~|,)\\s*" + _re0, 'g'), '$1');
            expression = expression.replace(new RegExp("#(\\w+)" + _re0, 'g'), "[id='$1']");
            expression = expression.replace(new RegExp("\\.(\\w+)" + _re0, 'g'), "[class~='$1']");
            var ElementArray = [], elements, child, selector;
            util.array.each(util.string.trim(expression).split(new RegExp(',' + _re1, 'g')), function(strSelector){
                if(strSelector == '') return false;
                elements = [element];
                strSelector = strSelector.replace(new RegExp("(\\s|>|\\+|~)(\\w|\\*)" + _re1, 'g'), "\n$1$2").split('\n');
                for (var i = 0, length = strSelector.length; i < length; i++){
                    child = strSelector[i].substr(0, 1);
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
            function __getTagAttrs(selector){
                var TAASL   = selector.replace(new RegExp("(\\[|])" + _re0, 'g'), '\n').split('\n');
                var tagName = TAASL[0], attrs=[];
                TAASL.shift();
                util.array.each(TAASL, function(v){
                    v = util.string.trim(v);
                    if(v != '' ) attrs.push('['+v+']');
                });
                attrs = attrs.join('');
                return {
                    tagName : tagName,
                    attrs   : attrs
                };
            }
            function __getAttr(element, attributeName){
                if(attributeName == "class" && zz.browser.kernel.isTrident) return element.className;
                if(attributeName == "style" && zz.browser.kernel.isTrident) return element.style.cssText;
                return element.getAttribute(attributeName);
            }
            function __checkAttr(element, attrs){
                var TAASL = attrs.replace(new RegExp("\\[|]" + _re0, 'g'), '\n').split('\n'), value, returs = true;
                if(element.nodeType != 1) return false;
                for(var i = 0, length = TAASL.length; i < length; i++){
                    attrs = util.string.trim(TAASL[i]);
                    if(attrs == '') continue;
                    attrs = attrs.replace(new RegExp("([~\\|\\^\\$\\*]?=)" + _re0, 'g'), "\n$1\n").split('\n');
                    attrs[0] = util.string.trim(attrs[0]);
                    value = __getAttr(element, attrs[0]);
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
            return util.array.uniq(ElementArray);
        }
        return elements;
    }
    zz.element.window = zz.zclass(zz.event.Listener, {
        initialize : function(element){
            zz.element.window.superclass.initialize.apply(this, arguments)
            this.element = element;
            this.eventsmaps = [];
        },
        addEvent : function(eventName, callback){
            var handler = function(event){
                callback(new zz.event.Event(event));
            }
            this.eventsmaps.push({
                key    : callback,
                handler: handler
            });
            this.addListener(eventName, handler);
            var element = this.element;
            if(eventName.toLowerCase() == "mousewheel" && zz.browser.kernel.isGecko) eventName = "DOMMouseScroll";
            element.attachEvent ? element.attachEvent("on" + eventName, handler) : element.addEventListener(eventName, handler, false);
            return this;
        },
        removeEvent : function(eventName, callback){
            for(var i = 0, length = this.eventsmaps.length; i < length; i++){
                if(this.eventsmaps[i].key === callback){
                    var element = this.element;
                    var handler = this.eventsmaps[i].handler;
                    this.removeListener(eventName, handler);
                    if(eventName.toLowerCase() == "mousewheel" && zz.browser.kernel.isGecko) eventName = "DOMMouseScroll";
                    element.detachEvent ? element.detachEvent("on" + eventName, handler) : element.removeEventListener(eventName, handler, false);
                    this.eventsmaps[i] = this.eventsmaps[i].key = this.eventsmaps[i].handler = null;
                    this.eventsmaps.splice(i, 1);
                    return this;
                }
            }
            return this;
        },
        startCapture : function(){
            var element = this.element;
            element.setCapture ? element.setCapture() : window.captureEvents ? (zz.browser.kernel.isGecko && parseFloat(zz.browser.version) >= 1.9) ? util.fnEmpty() : window.captureEvents(Event.MOUSEMOVE) : util.fnEmpty();
            return this;
        },
        stopCapture : function(){
            var element = this.element;
            element.releaseCapture ? element.releaseCapture() : window.releaseEvents ? (zz.browser.kernel.isGecko && parseFloat(zz.browser.version) >= 1.9) ? util.fnEmpty() : window.releaseEvents(Event.MOUSEMOVE) : util.fnEmpty();
            return this;
        },
        finalize : function(){
            for(i = 0, length = this.listeners.length; i < length; i++)
                this.removeEvent(this.listeners[i].eventName, this.listeners[i].handler);
            for(var i = 0, length = this.eventsmaps.length; i < length; i++)
                this.eventsmaps[i] = this.eventsmaps[i].key = this.eventsmaps[i].handler = null;
            zz.element.window.superclass.finalize.apply(this);
        }
    });
    zz.element.document = zz.zclass(zz.element.window,{
        getBySelector : function(selectors, isAll){
            var result = zz.element.getElementsBySelector(selectors, this);
            return isAll ? result : result.length == 0 ? null : result[0];
        },
        hasClassName : function(className){
            var value = this.element.className;
            return (value.length > 0 && (value == className || new RegExp("(^|\\s)" + className + "(\\s|$)").test(value)));
        },
        addClassName : function(className){
            var element = this.element;
            if(!this.hasClassName(className)) element.className += (element.className ? ' ' : '') + className;
            return this;
        },
        removeClassName : function(className){
            var element = this.element;
            element.className = util.string.trim(element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' '));
            return this;
        },
        hasAttribute : function(attributeName) {
            if(this.hasAttribute) return this.hasAttribute(attributeName);
            return this.getAttribute(attributeName) != null;
        },
        setAttribute : function(property, value){
            if(arguments.length == 1) for(var name in property) this.setAttribute(name, property[name]);
            else{
                var element = this.element;
                if(property == "style" && zz.browser.kernel.isTrident) element.style.cssText = value;
                else element.setAttribute(property, value);
            }
            return this;
        },
        getAttribute : function(attributeName){
            var element = this.element;
            if(attributeName == "class" && ZHUOZHUO.BrowserKernel.Trident) return element.className;
            if(attributeName == "style" && ZHUOZHUO.BrowserKernel.Trident) return element.style.cssText;
            return element.getAttribute(attributeName);
        },
        setStyle : function(property, value){
            if(arguments.length == 1) for(var style in property) this.setStyle(style, property[style]);
            else{
                if(zz.browser.kernel.isTrident && parseFloat(zz.browser.version) < 8.0 && property == "zIndex" && value == "auto") value = "";
                property == "alphaImage" ? this.setAlphaImage(value) : property == "opacity" ? this.setOpacity(value) : this.element.style[property == "styleFloat" ? document.defaultView ? "cssFloat" : property : property] = value;
            }
            return this;
        },
        getStyle : function(styleName){
            var element = this.element;
            if(styleName == "opacity") return this.getOpacity();
            if(styleName == "alphaImage") return this.getAlphaImage();
            styleName = styleName == "styleFloat" ? document.defaultView ? "cssFloat" : styleName : styleName;
            styleName = styleName == "${opacity}" ? "opacity" : styleName;
            var value = element.currentStyle ? element.currentStyle[styleName] : document.defaultView.getComputedStyle(element, null) ? document.defaultView.getComputedStyle(element, null)[styleName] : element.style[styleName];
            if(/^(width|height)$/.test(styleName) && (isNaN(parseFloat(value)) || value.indexOf('%') > -1)){
                var values = styleName == "width" ? ["Left", "Right"] : ["Top", "Bottom"];
                var padding = 0, border = 0;
                value = (styleName == "width") ? element.offsetWidth : element.offsetHeight;
                for(var i = 0, length = values.length; i < length; i++){
                    padding += parseFloat(this.getStyle("padding" + values[i])) || 0;
                    border += parseFloat(this.getStyle("border" + values[i] + "Width")) || 0;
                }
                value = value - padding - border + "px";
            }
            return value ? value : null;
        },
        setAlphaImage : function(url){
            var element = this.element;
            if(element.filters){
                var filterName = "DXImageTransform.Microsoft.AlphaImageLoader";
                var AlphaImageLoader = element.filters[filterName];
                if(AlphaImageLoader){
                    AlphaImageLoader.src = url;
                    AlphaImageLoader.sizingMethod = "crop";
                    AlphaImageLoader.Enabled = !!url;
                }else if(url) element.style.filter = "progid:" + filterName + "(sizingMethod=\"crop\", src=\"" + url + "\")";
            }else{
                if(url){
                    element.style.backgroundImage = "url(\"" + url + "\")";
                    element.style.backgroundRepeat= "no-repeat";
                }else element.style.backgroundImage = "none";
            }
            return this;
        },
        getAlphaImage : function(){
            if(this.element.filters){
                var AlphaImageLoader = this.element.filters["DXImageTransform.Microsoft.AlphaImageLoader"];
                return (AlphaImageLoader && AlphaImageLoader.Enabled) ? AlphaImageLoader.src : null;
            }else return this.getStyle("backgroundImage").replace(/^\s*url\s*\(\s*["']?\s*([^"'\)]+)\s*['"]?\s*\)\s*$/i,"$1") || null;
        },
        setOpacity : function(opacity){
            var element = this.element;
            if(element.filters){
                var filterName = "DXImageTransform.Microsoft.Alpha";
                var Alpha = element.filters[filterName];
                opacity = opacity * 100;
                if(Alpha){
                    Alpha.Enabled = opacity !== 100;
                    Alpha.Opacity = opacity;
                }else if(opacity !== 100) element.style.filter = "progid:" + filterName + "(opacity = " + opacity + ")";
            }else{
                element.style.opacity     = opacity;
                element.style.MozOpacity  = opacity;
                element.style.KhtmlOpacity= opacity;
            }
            return this;
        },
        getOpacity : function(){
            var opacity = NaN;
            if(this.element.filters){
                var Alpha = this.element.filters["DXImageTransform.Microsoft.Alpha"];
                opacity = (Alpha && Alpha.Enabled) ? Alpha.Opacity / 100 : NaN;
            }
            if(isNaN(opacity)) opacity = parseFloat(this.getStyle("${opacity}"));
            if(isNaN(opacity)) opacity = parseFloat(this.getStyle("MozOpacity"));
            if(isNaN(opacity)) opacity = parseFloat(this.getStyle("KhtmlOpacity"));
            if(isNaN(opacity)) opacity = 1;
            return opacity;
        },
        setText : function(value){
            var element = this.element;
            element.innerHTML = '';
            element.innerText ? element.innerText = value : element.appendChild(document.createTextNode(value));
            return this;
        },
        getText : function(){
            var element = this.element;
            if(element.innerText) return element.innerText;
            var value = undefined;
            try{
                value = element.textContent;
            }catch(e){}
            return value || element.innerHTML.replace(/<[^<>]*>/g, '').replace("&nbsp;", ' ').replace("&lt;", '<').replace("&gt;", '>').replace("&amp;", '&').replace("&quot;", '"');
        },
        setHTML : function(value){
            this.element.innerHTML = value;
            return this;
        },
        getHTML : function(){
            return this.element.innerHTML;
        },
        show : function(value){
            this.element.style.display = value || "block";
            return this;
        },
        hide : function(){
            this.element.style.display = "none";
            return this;
        },
        toggle : function(value){
            return this.getStyle("display") == "none" ? this.show(value) : this.hide();
        },
        getOffsets : function(){
            var top = 0, left = 0, element = this.element;
            do{
                top += element.offsetTop  || 0;
                left+= element.offsetLeft || 0;
                element = element.offsetParent;
                if(element){
                    if(element.tagName.toUpperCase() == 'BODY') break;
                    if((element.currentStyle ? element.currentStyle["position"] : document.defaultView.getComputedStyle(element, null) ? document.defaultView.getComputedStyle(element, null)["position"] : element.style["position"]) !== "static") break;
                }
            }while(element);
            return {
                left : left,
                top  : top
            };
        },
        getDimensions : function(){
            var element = this.element;
            var display = this.getStyle("display");
            if (display != "none" && display != null) return {
                width  : element.offsetWidth,
                height : element.offsetHeight
            };
            var originalVisibility= this.getStyle("visibility");
            var originalPosition  = this.getStyle("position");
            var originalDisplay   = this.getStyle("display");
            element.style.visibility = "hidden";
            element.style.position   = "absolute";
            element.style.display    = "block";
            var originalWidth     = element.clientWidth;
            var originalHeight    = element.clientHeight;
            element.style.visibility = originalVisibility;
            element.style.position   = originalPosition;
            element.style.display    = originalDisplay;
            return {
                width  : originalWidth,
                height : originalHeight
            };
        },
        remove : function(){
            var element = this.element;
            if(zz.browser.kernel.isTrident){
                var div = document.createElement("div");
                div.appendChild(element);
                div.innerHTML = '';
            }else element.parentNode.removeChild(element);
            zz.element.syncCache();
            return this;
        },
        append :  function(o){
            if(util.isString(o)) this.element.innerHTML += o;
            else this.element.appendChild(o.element);
            return o;
        },
        insert : function(sWhere, oElement){
            var newobj  = oElement.element, element = this.element;
            if(element.insertAdjacentElement) element.insertAdjacentElement(sWhere, newobj);
            else{
                sWhere = sWhere.toLowerCase();
                var parentNode = element.parentNode;
                switch(sWhere){
                    case "beforebegin" :
                        parentNode.insertBefore(newobj, element);
                        break;
                    case "afterbegin" :
                        element.insertBefore(newobj, element.firstChild);
                        break;
                    case "beforeend" :
                        element.appendChild(newobj);
                        break;
                    case "afterend" :
                        element.nextSibling ? parentNode.insertBefore(newobj, element.nextSibling) : parentNode.appendChild(newobj);
                        break;
                    default :
                        throw "function insertElement(element, sWhere{error!}, oElement)";
                }
            }
            return oElement;
        },
        animate : function(styles, frames, delay, factor, callback){
            if(util.isFunction(frames)){
                callback = frames;
                frames  = 6;
            }
            if(util.isFunction(delay)){
                callback = delay;
                delay   = 50;
            }
            if(util.isFunction(factor)){
                callback = factor;
                factor  = "average";
            }
            frames      = frames ? frames : 6;
            delay       = delay ? delay : 50;
            factor      = factor ? factor : "average";
            callback     = callback ? callback : util.fnEmpty;
            var toStyles = util.clone(styles);
            var newStyles = util.clone(styles);
            var average = util.isNumber(factor) ? factor : frames;
            for(var style in newStyles){
                var newStyle = parseFloat(this.getStyle(style));
                var toStyle  = parseFloat(toStyles[style]);
                var nowStyle = (newStyle < toStyle) ? newStyle + (toStyle - newStyle) / average : newStyle - (newStyle - toStyle) / average;
                nowStyle = Math.round(nowStyle * 100) / 100;
                nowStyle = toStyles[style].toString().replace(toStyle, nowStyle);
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
    });
    zz.element.tag.FORM = zz.zclass(zz.element.document,{});
    zz.element.tag.INPUT = zz.zclass(zz.element.document,{
        getValue : function(){
            return this.element.value;
        },
        setValue : function(value){
            this.element.value = value;
            return this;
        }
    });
    zz.element.tag.TEXTAREA = zz.zclass(zz.element.tag.INPUT,{});
    zz.element.tag.SELECT = zz.zclass(zz.element.tag.INPUT,{});
})(this);

(function(scope){
    var zz = scope.zhuozhuo, util = scope.zhuozhuo.util;
    /* Ajax */
    zz.ajax = {
        /* class ajax.Response */
        Response : zz.zclass({
            initialize : function(xmlHttp){
                zz.ajax.Response.superclass.initialize.apply(this);
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
        Request : zz.zclass(zz.event.Listener, {
            initialize : function(){
                zz.ajax.Request.superclass.initialize.apply(this);
                this.xmlHttp = util.trys(function(){
                    return new XMLHttpRequest();
                }, function(){
                    return new ActiveXObject("Msxml2.XMLHTTP");
                }, function(){
                    return new ActiveXObject("Microsoft.XMLHTTP");
                }) || null;
                this.encoding = "UTF-8";
            },
            open : function(url, method, async, user, password){
                this.url           = url;
                this.method        = (method || "POST").toUpperCase();
                this.async         = async !== undefined ? async : true;
                this.user          = user || null;
                this.password      = password || null;
                this.requestHeaders= {};
                if(this.method == "POST") this.setHeader("Content-Type", "application/x-www-form-urlencoded; charset=" + this.encoding);
            },
            setHeader : function(header, value){
                this.requestHeaders[header] = value;
            },
            setHeaders : function(headers){
                Object.extend(this.requestHeaders, headers);
            },
            send : function(params){
                params = util.param(util.extend(util.clone(params),{
                    _:''
                }));
                var runtime = this;
                this.url += this.method == "GET" ? (this.url.indexOf('?') > -1 ? '&' : '?') + params : '';
                this.xmlHttp.open(this.method, this.url, this.async, this.user, this.password);
                if(this.async) this.xmlHttp.onreadystatechange = function(){
                    runtime.onreadystatechange(runtime);
                };
                for(var header in this.requestHeaders) this.xmlHttp.setRequestHeader(header, this.requestHeaders[header]);
                this.xmlHttp.send(this.method == "POST" ? params : null);
                if(!this.async) this.onreadystatechange(runtime);
            },
            abort : function(){
                this.xmlHttp.abort();
            },
            onreadystatechange : function(runtime){
                runtime.notifyEvent("request", runtime.xmlHttp.readyState);
                if(runtime.xmlHttp.readyState == 4)
                    runtime.notifyEvent(runtime.xmlHttp.status == 200 ? "success" : "failure", new zz.ajax.Response(runtime.xmlHttp));
            }
        }),
        /* get Function */
        get : function(conf,method){
            var cf = util.extend(util.clone({
                url:"",
                data:null,
                async:true,
                user:null,
                password:null,
                request:util.fnEmpty,
                success:util.fnEmpty,
                failure:util.fnEmpty
            }),conf);
            var ajax = new zz.ajax.Request();
            ajax.open(cf.url, method || "GET", cf.async, cf.user, cf.password);
            ajax.addListener("request",cf.request);
            ajax.addListener("success",cf.success);
            ajax.addListener("failure",cf.failure);
            ajax.send(cf.data);
            return ajax;
        },
        /* post Function */
        post : function(conf){
            return zz.ajax.get(conf, "POST");
        }
    }
})(this);