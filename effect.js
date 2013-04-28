/* 版本:20110115 */
/* class Point */
var Point = Class({
    initialize : function(x, y){
        this.x = this.y = 0;
        if(Object.isUndefined(x)) return;
        switch(x.constructor){
            case Point:
                this.x = x.x;
                this.y = x.y;
                break;
            case Object:
                this.x = x.x || x.left|| x.Left|| 0;
                this.y = x.y || x.top || x.Top || 0;
                break;
            default:
                this.x = x;
                this.y = y;
        }
    },
    move : function(x, y){
        this.x = x;
        this.y = y;
    },
    translate : function(x, y){
        this.x += x;
        this.y += y;
    },
    distance : function(x, y){
        var p = new Point(x, y);
        var s = Math.sqrt(Math.pow(Math.abs(p.x - this.x), 2) + Math.pow(Math.abs(p.y - this.y), 2));
        return s;
    }
});
/* class Dimension */
var Dimension = Class({
    initialize : function(width, height){
        this.width = this.height = 0;
        if(Object.isUndefined(width)) return;
        switch(width.constructor){
            case Dimension:
                this.width = width.width;
                this.height= width.height;
                break;
            case Object:
                this.width = width.width || width.Width || width.WIDTH || 0;
                this.height= width.height|| width.Height|| width.HEIGHT|| 0;
                break;
            default:
                this.width = width;
                this.height= height;
        }
    },
    setSize : function(width, height){
        var d = new Dimension(width, height);
        this.width = d.width;
        this.height= d.height;
    }
});
/* class Rectangle */
var Rectangle = Class(Point, Dimension, {
    initialize : function(x, y, width, height){
        this.x = this.y = this.width = this.height = 0;
        if(Object.isUndefined(x)) return;
        switch(x.constructor){
            case Rectangle:
                this.x = x.x;
                this.y = x.y;
                this.width = x.width;
                this.height= x.height;
                break;
            case Dimension:
                this.width = x.width;
                this.height= x.height;
                break;
            case Point:
                this.x = x.x;
                this.y = x.y;
                if(!Object.isUndefined(y)){
                    this.width = y.width;
                    this.height= y.height;
                }
                break;
            default:
                if(Object.isUndefined(width)){
                    this.width = x;
                    this.height= y;
                }else{
                    this.x = x;
                    this.y = y;
                    this.width = width;
                    this.height= height;
                }
        }
    },
    contains : function(X, Y, W, H){
        var minX = this.x, minY = this.y, maxX = this.x + this.width, maxY = this.y + this.height;
        if(X.constructor == Point || arguments.length == 2){
            var point = new Point(X, Y);
            if(point.x >= minX && point.y >= minY && point.x <= maxX && point.y <= maxY) return true;
        }
        if(X.constructor == Rectangle || arguments.length == 4){
            var rectangle = new Rectangle(X, Y, W, H);
            var aminX = rectangle.x, aminY = rectangle.y, amaxX = rectangle.x + rectangle.width, amaxY = rectangle.y + rectangle.height;
            if(aminX >= minX && aminY >= minY && amaxX <= maxX && amaxY <= maxY) return true;
        }
        return false;
    },
    getLocation : function(){
        return new Point(this.x, this.y);
    },
    getSize : function(){
        return new Dimension(this.width, this.height);
    },
    grow : function(h, v){
        this.x -= h;
        this.y -= v;
        this.width += (2 * h);
        this.height+= (2 * v);
    },
    intersection : function(r){
        var retus = new Rectangle();
        var aUp   = this.y, aDown = this.y + this.height, aLeft = this.x, aRight= this.x + this.width;
        var bUp   = r.y, bDown = r.y + r.height, bLeft = r.x, bRight= r.x + r.width;
        retus.x = (aLeft >= bLeft && aLeft <= bRight) ? aLeft : 0;
        retus.x = (bLeft >= aLeft && bLeft <= aRight) ? bLeft : retus.x;
        retus.y = (aUp >= bUp && aUp <= bDown) ? aUp : 0;
        retus.y = (bUp >= aUp && bUp <= aDown) ? bUp : retus.y;
        retus.width = (aRight >= bLeft && aRight <= bRight) ? aRight : 0;
        retus.width = ((bRight >= aLeft && bRight <= aRight) ? bRight : retus.width) - retus.x;
        retus.height= (aDown >= bUp && aDown <= bDown) ? aDown : 0;
        retus.height= ((bDown >= aUp && bDown <= aDown) ? bDown : retus.height) - retus.y;
        return retus;
    },
    intersects : function(r){
        return !this.intersection(r).equals(new Rectangle());
    },
    setLocation : function(x, y){
        var p = new Point(x, y);
        this.move(p.x, p.y);
    },
    setRect : function(x, y, width, height){
        this.setLocation(x, y);
        this.setSize(width, height);
    },
    union : function(r){
        var x = Math.min(this.x, r.x);
        var y = Math.min(this.y, r.y);
        var width = Math.max(this.x + this.width, r.x + r.width) - x;
        var height = Math.max(this.y + this.height, r.y + r.height) - y;
        return new Rectangle(x, y, width, height);
    }
});

/* class Drag */
var Drag = Class(EventListener, {
    initialize : function(listener, target){
        Drag.superclass.initialize.apply(this, arguments);
        var the = this;
        this.disabled = false;
        this.minX = -2147483648;
        this.minY = -2147483648;
        this.maxX = 2147483647;
        this.maxY = 2147483647;
        this._listener = listener;
        this._target = target || listener;
        this._position = $(this._target).getStyle("position");
        this._powermove = /^(absolute|relative)$/.test(this._position);
        this._fnMousedown = function(event){
            if(the.disabled) return;
            the._mousedown(event);
        }
        if(this._powermove) $(this._listener).addEvent("mousedown", this._fnMousedown);
    },
    _mousedown :  function(event){
        var the = this;
        var doc = document;
        var evt = Event.extend(event);
        this.notifyEvent("dragstart", evt);
        Event.stopPropagation(event);
        Event.preventDefault(event);
        Event.addEvent(doc, "mousemove", __mousemove);
        Event.addEvent(doc, "mouseup", __mouseup);
        this._listener.startCapture();
        function __mousemove(event){
            var eve = Event.extend(event);
            var off = the.getOffsets();
            Event.stopPropagation(event);
            Event.preventDefault(event);
            off.translate(eve.clientX - evt.clientX, eve.clientY - evt.clientY);
            off = the._chkOffsets(off);
            off = the.setLocation(off);
            evt.clientX = eve.clientX;
            evt.clientY = eve.clientY;
            the.notifyEvent("drag", off);
        }
        function __mouseup(event){
            the._listener.stopCapture();
            Event.removeEvent(doc, "mousemove", __mousemove);
            Event.removeEvent(doc, "mouseup", __mouseup);
            Event.stopPropagation(event);
            Event.preventDefault(event);
            the.notifyEvent("dragend", Event.extend(event));
        }
    },
    _chkOffsets : function(p){
        if(p.x < this.minX) p.x = this.minX;
        if(p.x > this.maxX) p.x = this.maxX;
        if(p.y < this.minY) p.y = this.minY;
        if(p.y > this.maxY) p.y = this.maxY;
        return p;
    },
    setLocation : function(x, y){
        var p = new Point(x, y);
        this._target.setStyle({
            left: p.x + "px",
            top : p.y + "px"
        });
        return p;
    },
    moveBy : function(x, y){
        var p0 = new Point(x, y);
        var p1 = this.getOffsets();
        p1.translate(p0.x, p0.y);
        p1 = this.moveTo(p1);
        return p1;
    },
    moveTo : function(x, y){
        var p = this.setLocation(x, y);
        this.notifyEvent("move", p);
        return p;
    },
    getOffsets : function(){
        var p = new Point(this._target.getOffsets());
        if(this._position == "relative") p.move(parseFloat(this._target.getStyle("left")) || 0, parseFloat(this._target.getStyle("top")) || 0);
        return p;
    },
    finalize : function(){
        if(this._powermove) $(this._listener).removeEvent("mousedown", this._fnMousedown);
        Drag.superclass.finalize.apply(this);
    }
});
/* class Resizable */
var Resizable = Class(EventListener,{
    initialize : function(element, arstyles, argv){
        Resizable.superclass.initialize.apply(this, arguments);
        var the = this;
        var typea = {
            nw_resize: true,
            n_resize : true,
            ne_resize: true,
            w_resize : true,
            e_resize : true,
            sw_resize: true,
            s_resize : true,
            se_resize: true
        };
        var typeb = Object.extend(Object.clone(typea),{
            nw_resize: false,
            n_resize : false,
            ne_resize: false,
            w_resize : false,
            sw_resize: false
        });
        var tableattrs = {
            border     : 0,
            cellSpacing: 0,
            cellPadding: 0
        };
        var oldrect = new Rectangle(new Point($(element).getOffsets()));
        var conf = {
            minWidth      : 0,
            minHeight     : 0,
            maxWidth      : 2147483647,
            maxHeight     : 2147483647,
            mousewheel    : true,
            initResize    : true,
            resizeWidth   : 0,
            resizeStyle   : {},
            nw_resizeStyle: {},
            n_resizeStyle : {},
            ne_resizeStyle: {},
            w_resizeStyle : {},
            contextStyle  : {},
            e_resizeStyle : {},
            sw_resizeStyle: {},
            s_resizeStyle : {},
            se_resizeStyle: {},
            up0Style      : {},
            up1Style      : {},
            up2Style      : {},
            down0Style    : {},
            down1Style    : {},
            down2Style    : {},
            left0Style    : {},
            left1Style    : {},
            left2Style    : {},
            right0Style   : {},
            right1Style   : {},
            right2Style   : {}
        };
        Object.extend(conf, arstyles);
        Object.extend(conf, argv);
        this._element = element;
        this._fnMousedown = function(event){
            if(the.disabled) return;
            the._mousedown(event);
        };
        this._fnMousewheel= function(event){
            if(the.disabled) return;
            Event.stopPropagation(event);
            Event.preventDefault(event);
            the.zoom(Event.extend(event).detail > 0 ? 1.05 : 0.95, 1);
        };
        this._position = element.getStyle("position");
        this._powermove = /^(absolute|relative)$/.test(this._position);
        this._type = this._powermove ? typea : typeb;
        this.table = $(element.insert("afterend", Document.createTable(3,3))).setAttr(tableattrs);
        Object.extend(this.table, {
            nw_resize: $(this.table.rows[0].cells[0]),
            n_resize : $(this.table.rows[0].cells[1]),
            ne_resize: $(this.table.rows[0].cells[2]),
            w_resize : $(this.table.rows[1].cells[0]),
            context  : $(this.table.rows[1].cells[1]),
            e_resize : $(this.table.rows[1].cells[2]),
            sw_resize: $(this.table.rows[2].cells[0]),
            s_resize : $(this.table.rows[2].cells[1]),
            se_resize: $(this.table.rows[2].cells[2])
        }).context.setStyle(conf.contextStyle).appendChild(element);
        for(var cursorName in this._type){
            this.table[cursorName].setStyle(Object.extend(Object.extend({
                cursor : conf.initResize && this._type[cursorName] ? cursorName.replace('_','-') : "auto",
                width  : /^(nw_resize|se_resize)$/.test(cursorName) ? (conf.resizeWidth + "px") : "auto",
                height : /^(nw_resize|se_resize)$/.test(cursorName) ? (conf.resizeWidth + "px") : "auto"
            },conf.resizeStyle), conf[cursorName + "Style"]));
            if(conf.initResize && this._type[cursorName]) this.table[cursorName].addEvent("mousedown", this._fnMousedown)._resizeType = cursorName;
        }
        this._borderDimension = {
            theight : parseFloat(this.table.n_resize.getDimensions().height),
            bheight : parseFloat(this.table.s_resize.getDimensions().height),
            lwidth  : parseFloat(this.table.w_resize.getDimensions().width),
            rwidth  : parseFloat(this.table.e_resize.getDimensions().width)
        }
        this._uptable   = $(this.table.n_resize.appendChild(Document.createTable(1, 3))).setAttr(tableattrs).setStyle("height",this._borderDimension.theight + "px");
        this._downtable = $(this.table.s_resize.appendChild(Document.createTable(1, 3))).setAttr(tableattrs).setStyle("height",this._borderDimension.bheight + "px");
        this._lefttable = $(this.table.w_resize.appendChild(Document.createTable(3, 1))).setAttr(tableattrs).setStyle("width",this._borderDimension.lwidth + "px");
        this._righttable= $(this.table.e_resize.appendChild(Document.createTable(3, 1))).setAttr(tableattrs).setStyle("width",this._borderDimension.rwidth + "px");
        for(var i = 0; i < 3; i++){
            $(this._uptable.rows[0].cells[i]).setStyle(conf["up" + i + "Style"]);
            $(this._downtable.rows[0].cells[i]).setStyle(conf["down" + i + "Style"]);
            $(this._lefttable.rows[i].cells[0]).setStyle(conf["left" + i + "Style"]);
            $(this._righttable.rows[i].cells[0]).setStyle(conf["right" + i + "Style"]);
        }
        for(i = 0; i < 3 ; i++){
            this._borderDimension["t" + i + "width"] = parseFloat(this._uptable.rows[0].cells[i].getStyle("width"));
            this._borderDimension["b" + i + "width"] = parseFloat(this._downtable.rows[0].cells[i].getStyle("width"));
            this._borderDimension["l" + i + "height"]= parseFloat(this._lefttable.rows[i].cells[0].getStyle("height"));
            this._borderDimension["r" + i + "height"]= parseFloat(this._righttable.rows[i].cells[0].getStyle("height"));
        }
        if(this._position == "relative") oldrect.setLocation(parseFloat(element.getStyle("left")) || 0, parseFloat(element.getStyle("top")) || 0);
        if(this._powermove){
            element.setStyle({
                position: "static",
                left    : "0px",
                top     : "0px"
            });
            this.table.setStyle({
                position: this._position,
                display : "block",
                zIndex	: element.getStyle("zIndex") || "auto"
            });
        }
        oldrect.setSize(new Dimension(element.getDimensions()));
        this.setRect(oldrect);
        this._mousewheel = conf.mousewheel;
        this.minWidth = conf.minWidth;
        this.maxWidth = conf.maxWidth;
        this.minHeight= conf.minHeight;
        this.maxHeight= conf.maxHeight;
        this.disabled = false;
        if(conf.initResize){
            if(this._mousewheel) element.addEvent("mousewheel", this._fnMousewheel);
            if(this._type.n_resize){
                this._uptable.addEvent("mousedown", this._fnMousedown)._resizeType  = "n_resize";
                for(i = 0; i < 3; i++) this._uptable.rows[0].cells[i].addEvent("mousedown", this._fnMousedown)._resizeType  = "n_resize";
            }
            if(this._type.s_resize){
                this._downtable.addEvent("mousedown",this._fnMousedown)._resizeType = "s_resize";
                for(i = 0; i < 3; i++) this._downtable.rows[0].cells[i].addEvent("mousedown",this._fnMousedown)._resizeType = "s_resize";
            }
            if(this._type.w_resize){
                this._lefttable.addEvent("mousedown",this._fnMousedown)._resizeType = "w_resize";
                for(i = 0; i < 3; i++) this._lefttable.rows[i].cells[0].addEvent("mousedown",this._fnMousedown)._resizeType = "w_resize";
            }
            if(this._type.e_resize){
                this._righttable.addEvent("mousedown",this._fnMousedown)._resizeType= "e_resize";
                for(i = 0; i < 3; i++) this._righttable.rows[i].cells[0].addEvent("mousedown",this._fnMousedown)._resizeType= "e_resize";
            }
        }
    },
    _chkRect : function(r){
        var p = this.getRect();
        if(r.width < this.minWidth){
            r.width= this.minWidth;
            r.x = p.x;
        }
        if(r.width > this.maxWidth){
            r.width= this.maxWidth;
            r.x = p.x;
        }
        if(r.height < this.minHeight){
            r.height= this.minHeight;
            r.y = p.y;
        }
        if(r.height > this.maxHeight){
            r.height= this.maxHeight;
            r.y = p.y;
        }
        return r;
    },
    _mousedown : function(event){
        var the = this;
        var evt = Event.extend(event);
        var doc = document;
        var ele = Event.target(event);
        var old = this.getRect();
        if(!ele._resizeType) return;
        Event.stopPropagation(event);
        Event.preventDefault(event);
        Event.addEvent(doc, "mousemove", __mousemove);
        Event.addEvent(doc, "mouseup", __mouseup);
        ele.startCapture();
        the.notifyEvent("resizestart", evt);
        function __mousemove(event){
            Event.stopPropagation(event);
            Event.preventDefault(event);
            var eve = Event.extend(event);
            var ndim = {}, noff = {};
            switch(ele._resizeType){
                case "nw_resize" :
                    ndim.width = evt.clientX - eve.clientX + old.width;
                    ndim.height= evt.clientY - eve.clientY + old.height;
                    noff.left  = eve.clientX - evt.clientX + old.x;
                    noff.top   = eve.clientY - evt.clientY + old.y;
                    break;
                case "n_resize" :
                    ndim.height= evt.clientY - eve.clientY + old.height;
                    noff.top   = eve.clientY - evt.clientY + old.y;
                    break;
                case "ne_resize" :
                    ndim.width = eve.clientX - evt.clientX + old.width;
                    ndim.height= evt.clientY - eve.clientY + old.height;
                    noff.top   = eve.clientY - evt.clientY + old.y;
                    break;
                case "w_resize" :
                    ndim.width = evt.clientX - eve.clientX + old.width;
                    noff.left  = eve.clientX - evt.clientX + old.x;
                    break;
                case "e_resize" :
                    ndim.width = eve.clientX - evt.clientX + old.width;
                    break;
                case "sw_resize" :
                    ndim.width = evt.clientX - eve.clientX + old.width;
                    ndim.height= eve.clientY - evt.clientY + old.height;
                    noff.left  = eve.clientX - evt.clientX + old.x;
                    break;
                case "s_resize" :
                    ndim.height= eve.clientY - evt.clientY + old.height;
                    break;
                case "se_resize" :
                    ndim.width = eve.clientX - evt.clientX + old.width;
                    ndim.height= eve.clientY - evt.clientY + old.height;
                    break;
                default :
                    return;
            }
            ndim.width = Object.isUndefined(ndim.width) ? old.width : ndim.width;
            ndim.height= Object.isUndefined(ndim.height)? old.height: ndim.height;
            noff.left  = Object.isUndefined(noff.left)  ? old.x     : noff.left;
            noff.top   = Object.isUndefined(noff.top)   ? old.y     : noff.top;
            the.setRect(the._chkRect(new Rectangle(noff.left, noff.top, ndim.width, ndim.height)));
        }
        function __mouseup(event){
            ele.stopCapture();
            Event.removeEvent(doc, "mousemove", __mousemove);
            Event.removeEvent(doc, "mouseup", __mouseup);
            Event.stopPropagation(event);
            Event.preventDefault(event);
            the.notifyEvent("resizeend", Event.extend(event));
        }
    },
    resizeBy : function (width, height){
        var r = this.getRect();
        r.width += width;
        r.height+= height;
        return this.setRect(r);
    },
    resizeTo : function(width, height){
        var r = this.getRect();
        r.setSize(width, height);
        return this.setRect(r);
    },
    setRect : function(x, y, width, height){
        var r = new Rectangle(x, y, width, height);
        var WebKit = ZHUOZHUO.BrowserKernel.WebKit && this._powermove ? 1 : 0;
        r.width = Math.max(r.width, 0);
        r.height= Math.max(r.height,0);
        this._element.setStyle({
            width : r.width + "px",
            height: r.height+ "px"
        });
        //WebKit bug
        r.width += WebKit;
        this._uptable.rows[0].cells[1].setStyle("width", Math.max(r.width - this._borderDimension.t0width - this._borderDimension.t2width, 0) + "px");
        this._downtable.rows[0].cells[1].setStyle("width",Math.max(r.width - this._borderDimension.b0width - this._borderDimension.b2width, 0) + "px");
        this._lefttable.rows[1].cells[0].setStyle("height", Math.max(r.height-this._borderDimension.l0height-this._borderDimension.l2height, 0) + "px");
        this._righttable.rows[1].cells[0].setStyle("height",Math.max(r.height-this._borderDimension.r0height-this._borderDimension.r2height, 0) + "px");
        this.table.setStyle({
            width : r.width + this._borderDimension.lwidth + this._borderDimension.rwidth + "px",
            height: r.height+ this._borderDimension.theight+ this._borderDimension.bheight+ "px"
        });
        if(this._powermove){
            this.table.setStyle({
                left: (r.x - this._borderDimension.lwidth) + "px",
                top : (r.y - this._borderDimension.theight)+ "px"
            });
        }
        //WebKit bug
        r.width -= WebKit;
        this.notifyEvent("resize", r);
        return r;
    },
    getRect : function(){
        var e = this._element.getOffsets();
        var r = new Rectangle(new Point(this.table.getOffsets()), new Dimension(this._element.getDimensions()));
        if(this._position == "relative") r.setLocation(parseFloat(this.table.getStyle("left")) || 0, parseFloat(this.table.getStyle("top")) || 0);
        if(!this._powermove) r.setLocation(0, 0);
        r.translate(e.left, e.top);
        return r;
    },
    setLocation : function(x, y){
        var r = this.getRect();
        r.setLocation(x, y);
        return this.setRect(r);
    },
    translate : function(x, y){
        var r = this.getRect();
        r.translate(x, y);
        return this.setRect(r);
    },
    zoom : function(z, c){
        var r = this.getRect();
        var h = Math.round(r.width * (z - 1) / 2);
        var v = Math.round(r.height* (z - 1) / 2);
        r.grow(h, v);
        if(c) r = this._chkRect(r);
        return this.setRect(r);
    },
    finalize : function(){
        var i;
        if(this._powermove){
            var r = this.getRect();
            this._element.setStyle({
                position : this._position,
                zIndex   : this.table.getStyle("zIndex") || "auto",
                left     : r.x + "px",
                top      : r.y + "px"
            });
        }
        if(this._mousewheel) this._element.removeEvent("mousewheel", this._fnMousewheel);
        if(this._type.n_resize){
            this._uptable.removeEvent("mousedown", this._fnMousedown);
            for(i = 0; i < 3; i++) this._uptable.rows[0].cells[i].removeEvent("mousedown", this._fnMousedown);
        }
        if(this._type.s_resize){
            this._downtable.removeEvent("mousedown",this._fnMousedown);
            for(i = 0; i < 3; i++) this._downtable.rows[0].cells[i].removeEvent("mousedown",this._fnMousedown);
        }
        if(this._type.w_resize){
            this._lefttable.removeEvent("mousedown",this._fnMousedown);
            for(i = 0; i < 3; i++) this._lefttable.rows[i].cells[0].removeEvent("mousedown",this._fnMousedown);
        }
        if(this._type.e_resize){
            this._righttable.removeEvent("mousedown",this._fnMousedown);
            for(i = 0; i < 3; i++) this._righttable.rows[i].cells[0].removeEvent("mousedown",this._fnMousedown);
        }
        for(var cursorName in this._type)
            if(this._type[cursorName]) {
                this.table[cursorName].removeEvent("mousedown", this._fnMousedown);
                this.table[cursorName] = null;
            }
        this.table.insert("afterend", this._element);
        this.table.remove();
        Object.gc(this._type);
        Resizable.superclass.finalize.apply(this);
    }
});
/* class AutoTop */
var AutoTop = Class(EventListener, {
    initialize : function(element, argv){
        AutoTop.superclass.initialize.apply(this, arguments);
        var the = this;
        this.disabled = false;
        this._element = element;
        this._conf = Object.extend({
            listener : element,
            eventName: "click"
        },argv);
        this._fn = function(){
            if(this.disabled) return;
            the.setTop();
        }
        this._conf.listener.addEvent(this._conf.eventName, this._fn);
    },
    setTop : function(zIndex){
        if(Object.isUndefined(zIndex)) zIndex = this.getMax() + 1;
        this._element.setStyle("zIndex", zIndex);
        this.notifyEvent("ontop", zIndex);
        return zIndex;
    },
    getMax : function(){
        var elements = document.getElementsByTagName("*");
        var max = 0, styleName = "zIndex";
        for(var i = 0, length = elements.length; i < length; i++){
            var value = elements[i].currentStyle ?
            elements[i].currentStyle[styleName]
            : document.defaultView.getComputedStyle(elements[i], null) ?
            document.defaultView.getComputedStyle(elements[i], null)[styleName]
            : elements[i].style[styleName];
            max = Math.max(max, parseInt(value) || 0);
        }
        return max;
    },
    getZIndex : function(){
        return this._element.getStyle("zIndex");
    },
    finalize : function(){
        this._conf.listener.removeEvent(this._conf.eventName, this._fn);
        Object.gc(this._conf);
        AutoTop.superclass.finalize.apply(this);
    }
});
/* class Dialog */
var Dialog = Class(EventListener, {
    initialize : function(element, argv){
        AutoTop.superclass.initialize.apply(this, arguments);
        element.show();
        var the = this;
        this._conf = Object.extend({
            minWidth : 0,
            minHeight: 0,
            maxWidth : 2147483647,
            maxHeight: 2147483647,
            close    : true,
            drag     : true,
            scroll   : true,
            resizable: true,
            autotop  : true,
            scope    : "window",
            theme    : Theme.Dialog
        }, argv);
        this._box = $(element.insert("afterend", document.createElement("DIV"))).setStyle({
            position : "absolute",
            top      : "0px",
            left     : "0px"
        });
        this._fnScroll = function(){
            var scroll  = Document.view.getScrollOffsets();
            the._resizable.table.setStyle({
                left: (scroll.left + the._tableLeft) + "px",
                top : (scroll.top + the._tableTop) + "px"
            });
        };
        this._fnClose = function(event){
            var evt = Event.extend(event);
            switch(evt.type){
                case "mouseover":
                    the._clo.setStyle(the._conf.theme.Bar.close_mouseover);
                    break;
                case "mouseout":
                    the._clo.setStyle(the._conf.theme.Bar.close_mouseout);
                    break;
                default:
                    the.close();
            }
        };
        if(this._conf.theme.Bar && this._conf.theme.Bar.basic && this._conf.theme.Bar.title){
            this._bar = $(this._box.appendChild(document.createElement("DIV"))).setStyle(this._conf.theme.Bar.basic);
            this._tit = $(this._bar.appendChild(document.createElement("DIV"))).setStyle(this._conf.theme.Bar.title);
            if(this._conf.close && this._conf.theme.Bar.close){
                this._clo = $(this._bar.appendChild(document.createElement("DIV"))).setStyle(this._conf.theme.Bar.close);
                this._clo.addEvent("mouseover", this._fnClose).addEvent("mouseout", this._fnClose).addEvent("click", this._fnClose);
            }
        }
        this._box.appendChild(element);
        this._element = element;
        this._dialogpower = 0;
        this._resizable = new Resizable(this._box, this._conf.theme.resize,{
            initResize : this._conf.resizable
        });
        this._drag = new Drag(this._bar || this._resizable.table, this._resizable.table);
        this._autoTop = new AutoTop(this._resizable.table);
        this._resizable.disabled = !this._conf.resizable;
        this._drag.disabled = !this._conf.drag;
        this._autoTop.disabled = !this._conf.autotop;
        this._drag.addListener("drag", function(){
            the._resizable.table.setOpacity(0.6);
            move();
        });
        this._drag.addListener("dragend", function(){
            the._resizable.table.setOpacity(1);
        });
        this._drag.addListener("move", move);
        this._resizable.addListener("resize", resize);
        this._barHeight = this._tit ? parseFloat(this._tit.getStyle("height")) : 0;
        this._cloWidth  = this._clo ? parseFloat(this._clo.getStyle("width")) : 0;
        this._conf.minWidth = Math.max(this._cloWidth, this._conf.minWidth);
        this._resizable.minWidth = this._conf.minWidth;
        this._resizable.minHeight= this._conf.minHeight + this._barHeight;
        this._resizable.maxWidth = this._conf.maxWidth;
        this._resizable.maxHeight= this._conf.maxHeight + this._barHeight;
        this._resizable.table.hide();
        function setOffsets(){
            var scroll = Document.view.getScrollOffsets();
            the._tableLeft = parseFloat(the._resizable.table.getStyle("left")) - scroll.left;
            the._tableTop = parseFloat(the._resizable.table.getStyle("top")) - scroll.top;
        }
        function move(){
            setOffsets();
            the.notifyEvent("move", the.getRect().getLocation());
        }
        function resize(r){
            setOffsets();
            r = the.getRect(r);
            if(the._tit) the._tit.setStyle("width", Math.max(r.width - the._cloWidth, 0) + "px");
            element.setStyle({
                width : r.width + "px",
                height: r.height+ "px"
            });
            the.notifyEvent("resize", r);
        }
    },
    _ie6bug : function(k){
        if(ZHUOZHUO.BrowserKernel.Trident && parseFloat(ZHUOZHUO.BrowserVersion) <= 6)
            $$("select").each(function(e){
                e = $(e);
                if(k) if(!e.__visibility){
                    e.__visibility = e.getStyle("visibility");
                    e.setStyle("visibility","hidden");
                }
                else if(e.__visibility != null){
                    e.setStyle("visibility",e.__visibility);
                    e.__visibility = null;
                }
            });
    },
    _startMask : function (){
        var pageDimensions = Document.view.getDimensions();
        this._mask = $(document.body.appendChild(document.createElement("div")));
        this._mask.setStyle({
            position       : "absolute",
            left           : "0px",
            top            : "0px",
            width          : "100%",
            height         : "100%",
            zIndex         : this._autoTop.getMax(),
            backgroundColor: "#000",
            opacity        : 0.1
        });
        var disabledDimensions = this._mask.getDimensions();
        if(disabledDimensions.width < pageDimensions.pageWidth - 30)
            this._mask.setStyle("width",pageDimensions.pageWidth + "px");
        if(disabledDimensions.height < pageDimensions.pageHeight - 30)
            this._mask.setStyle("height",pageDimensions.pageHeight + "px");
    },
    _stopMask : function(){
        this._mask.remove();
        this._mask = null;
    },
    open : function(argv){
        if(!this.closed()) return false;
        this._dialogpower = 3;
        this._resizable.table.setOpacity(0).show();
        var openargv = Object.extend({
            modal : true,
            title : null,
            left  : "center",
            top   : "middle",
            width : "auto",
            height: "auto"
        }, argv);
        var docview   = Document.view.getDimensions();
        var docScroll = Document.view.getScrollOffsets();
        var oldrect = this.getRect();
        if(!Object.isNumber(openargv.width)) openargv.width = oldrect.width;
        if(!Object.isNumber(openargv.height)) openargv.height = oldrect.height;
        openargv.width = Math.max(this._conf.minWidth, openargv.width);
        openargv.width = Math.min(this._conf.maxWidth, openargv.width);
        openargv.height = Math.max(this._conf.minHeight, openargv.height);
        openargv.height = Math.min(this._conf.maxHeight, openargv.height)
        if(this._conf.scope == "window" && Object.isNumber(openargv.left)) openargv.left += docScroll.left;
        if(this._conf.scope == "window" && Object.isNumber(openargv.top)) openargv.top += docScroll.top;
        if(!Object.isNumber(openargv.left)) openargv.left = Math.max(parseFloat((docview.screenWidth - openargv.width) / 2 + docScroll.left), 0);
        if(!Object.isNumber(openargv.top))  openargv.top = Math.max(parseFloat((docview.screenHeight - openargv.height) / 2 + docScroll.top), 0);
        if(openargv.modal) this._startMask();
        if(openargv.title) this.setTitle(openargv.title);
        this.resizeTo(openargv.width, openargv.height);
        this.moveTo(openargv.left, openargv.top);
        this.setTop();
        this._ie6bug(true);
        var the = this;
        this._resizable.table.animate({
            opacity : 1
        }, function(node, frames){
            if(frames) return;
            the._dialogpower = 2;
            the.notifyEvent("open");
        });
        if(this._conf.scope == "window") Event.addEvent(window, "scroll", this._fnScroll);
        return true;
    },
    close : function(){
        if(this._dialogpower != 2) return false;
        this._dialogpower = 1;
        var the = this;
        this.notifyEvent("close");
        if(this._mask) this._stopMask();
        this._ie6bug();
        if(this._conf.scope == "window") Event.removeEvent(window, "scroll", this._fnScroll);
        this._resizable.table.animate({
            opacity:0
        }, 6, 50, 1.6, function(node, frames){
            if(frames)return;
            the._resizable.table.hide();
            the._dialogpower = 0;
            the.notifyEvent("closed");
        });
        return true;
    },
    setTitle : function(title){
        if(this._tit) this._tit.setText(title);
    },
    moveTo : function(x, y){
        this._resizable.setLocation(x, y-this._barHeight);
        return new Point(x, y);
    },
    moveBy : function(x, y){
        var p = this.getRect().getLocation();
        p.x += x;
        p.y += y;
        return this.moveTo(p.x, p.y);
    },
    resizeTo : function(width, height){
        this._resizable.resizeTo(width, height + this._barHeight);
        return new Dimension(width, height);
    },
    resizeBy : function(width, height){
        var d = this.getRect().getSize();
        d.width += width;
        d.height+= height;
        return this.resizeTo(d.width, d.height);
    },
    zoom : function(z){
        var r = this.getRect();
        var h = Math.round(r.width * (z - 1) / 2);
        var v = Math.round(r.height* (z - 1) / 2);
        r.grow(h, v);
        this.resizeTo(r.width, r.height);
        this.moveTo(r.x, r.y);
        return r;
    },
    closed : function(){
        return !this._dialogpower;
    },
    getRect : function(rect){
        var r = rect || this._resizable.getRect();
        r.y += this._barHeight;
        r.height -= this._barHeight;
        return r;
    },
    getTitleBarDimension : function(){
        var r = this._resizable.getRect();
        r.height = this._barHeight;
        return r.getSize();
    },
    setTop : function(zIndex){
        return this._autoTop.setTop(zIndex);
    },
    finalize : function(timeoutID){
        if(timeoutID) window.clearTimeout(timeoutID);
        if(this._dialogpower){
            this.close();
            var the = this;
            timeoutID = window.setTimeout(function(){
                the.finalize(timeoutID);
            },60);
            return;
        }
        this._autoTop.finalize();
        this._drag.finalize();
        this._resizable.finalize();
        if(this._clo){
            this._clo.removeEvent("mouseover", this._fnClose);
            this._clo.removeEvent("mouseout", this._fnClose);
            this._clo.removeEvent("click", this._fnClose);
        }
        this._element.hide();
        this._box.insert("afterend",this._element);
        this._box.remove();
        Object.gc(this._conf);
        this.notifyEvent("finalize");
        AutoTop.superclass.finalize.apply(this);
    }
});

/* UI消息提示 */
var MessageBox = {
    base : function(element, argv){
        var conf = Object.extend({
            title   : document.URL,
            buttons : {}
        }, argv);
        function btnAction(){
            var callback = conf.buttons[button];
            return function(event){
                callback.call(dialog, event);
            }
        }
        function mouseover(event){
            Event.target(event).setStyle(Theme.Dialog.Button.mouseover);
        }
        function mouseout(event){
            Event.target(event).setStyle(Theme.Dialog.Button.mouseout);
        }
        var objbtn= {};
        var frame = $(element).insert("beforeBegin", $(document.createElement("DIV")));
        var paddi = $(frame.appendChild(document.createElement("DIV")));
        var btbar = $(frame.appendChild(document.createElement("DIV")));
        paddi.appendChild(element);
        for(var button in conf.buttons) {
            objbtn[button] = $(document.createElement("INPUT")).setAttr({
                value: button,
                type : "button"
            });
            btbar.appendChild(objbtn[button]);
            objbtn[button].setStyle(Theme.Dialog.Button.basic);
            objbtn[button]._fnclick = btnAction();
            objbtn[button].addEvent("click", objbtn[button]._fnclick);
            objbtn[button].addEvent("mouseover", mouseover);
            objbtn[button].addEvent("mouseout", mouseout);
        }
        frame.setStyle("overflow","auto");
        paddi.setStyle(Theme.Dialog.MessageBox.content);
        btbar.setStyle(Theme.Dialog.MessageBox.buttonBar);
        var dialog = new Dialog(frame, conf);
        dialog.addListener("finalize", function(){
            for(var button in objbtn){
                objbtn[button].removeEvent("click", objbtn[button]._fnclick);
                objbtn[button].removeEvent("mouseover", mouseover);
                objbtn[button].removeEvent("mouseout", mouseout);
            }
            frame.insert("beforeBegin", element);
            frame.remove();
        });
        dialog.open(conf);
        return dialog;
    },
    alert : function(value, callback){
        callback = callback || ZHUOZHUO.TRUE;
        var context= $(document.body.appendChild(document.createElement("DIV")));
        context.innerHTML = value;
        var msgBox = MessageBox.base(context, {
            minWidth: 300,
            buttons : {
                "确定" : function(){
                    this.close();
                }
            }
        });
        msgBox.addListener("close",function(){
            msgBox.finalize();
        });
        msgBox.addListener("finalize", function(){
            context.remove();
            callback();
        });
        return msgBox;
    },
    confirm : function(value, callback){
        callback = callback || ZHUOZHUO.TRUE;
        var context= $(document.body.appendChild(document.createElement("DIV")));
        var power = false;
        context.innerHTML = value;
        var msgBox = MessageBox.base(context,{
            minWidth: 300,
            buttons : {
                "确定" : function(){
                    power = true;
                    this.close();
                },
                "取消" : function(){
                    this.close();
                }
            }
        });
        msgBox.addListener("close",function(){
            msgBox.finalize();
        });
        msgBox.addListener("finalize", function(){
            context.remove();
            callback(power);
        });
        return msgBox;
    },
    prompt : function(sMessage, sDefaultValue, callback){
        if(!Object.isString(sDefaultValue)){
            callback = sDefaultValue;
            sDefaultValue = "";
        }
        callback = callback || ZHUOZHUO.TRUE;
        var power = false;
        var context= $(document.body.appendChild(document.createElement("DIV")));
        var input = $(document.createElement("INPUT")).setAttr({
            value: sDefaultValue,
            type : "text",
            style: "display:block; width:98%; height:20px"
        });
        context.innerHTML = sMessage;
        context.appendChild(input);
        function focus(event){
            Event.target(event).setStyle(Theme.Dialog.Input.focus);
        }
        function blur(event){
            Event.target(event).setStyle(Theme.Dialog.Input.blur);
        }
        input.setStyle(Theme.Dialog.Input.base);
        input.addEvent("focus", focus);
        input.addEvent("blur", blur);
        var msgBox = MessageBox.base(context, {
            minWidth: 300,
            buttons : {
                "确定" : function(){
                    power = true;
                    this.close();
                },
                "取消" : function(){
                    this.close();
                }
            }
        });
        msgBox.addListener("close",function(){
            msgBox.finalize();
        });
        msgBox.addListener("finalize", function(){
            sDefaultValue = power ? input.value : undefined;
            input.removeEvent("focus", focus);
            input.removeEvent("blur", blur);
            context.remove();
            callback(sDefaultValue);
        });
        return msgBox;
    }
};

/* 默认主题 */
if(typeof Theme === "undefined") Theme = {};
if(!Theme.Dialog) Theme.Dialog = {};
if(!Theme.Dialog.Button) Theme.Dialog.Button = {};
if(!Theme.Dialog.Input) Theme.Dialog.Input = {};
if(!Theme.Dialog.Bar) Theme.Dialog.Bar = {};
if(!Theme.Dialog.MessageBox) Theme.Dialog.MessageBox = {};
/*图片路径*/
Theme._path = "../zhuozhuo.org/themes/images/";
    /* 主题设置 */
    Theme.Dialog._barHeight = 20;
    Theme.Dialog._cloWidth = 20;
    Theme.Dialog.resize = {
        nw_resizeStyle : {
            alphaImage : Theme._path + "dialog/nw_resize.png",
            width : "4px",
            height: "10px"
        },
        up0Style : {
            alphaImage : Theme._path + "dialog/up0.png",
            width : "6px"
        },
        up1Style : {
            alphaImage : Theme._path + "dialog/up1.png"
        },
        up2Style : {
            alphaImage : Theme._path + "dialog/up2.png",
            width : "6px"
        },
        ne_resizeStyle : {
            alphaImage : Theme._path + "dialog/ne_resize.png"
        },
        w_resizeStyle : {
            alphaImage : Theme._path + "dialog/w_resize.png"
        },
        contextStyle : {
            backgroundColor : "#fff"
        },
        e_resizeStyle : {
            alphaImage : Theme._path + "dialog/e_resize.png"
        },
        sw_resizeStyle : {
            alphaImage : Theme._path + "dialog/sw_resize.png"
        },
        down0Style : {
            alphaImage : Theme._path + "dialog/down0.png",
            width : "6px"
        },
        down1Style : {
            alphaImage : Theme._path + "dialog/down1.png"
        },
        down2Style : {
            alphaImage : Theme._path + "dialog/down2.png",
            width : "6px"
        },
        se_resizeStyle : {
            alphaImage : Theme._path + "dialog/se_resize.png",
            width : "8px",
            height: "15px"
        }
    };
    Theme.Dialog.Bar.basic = {
        backgroundImage : "url(\"" + Theme._path + "dialog/bar.basic.png\")",
        height          : Theme.Dialog._barHeight + "px",
        cursor          : "move"
    };
    Theme.Dialog.Bar.title = {
        height     : Theme.Dialog._barHeight + "px",
        lineHeight : "18px",
        styleFloat : "left",
        overflow   : "hidden",
        textAlign  : "left",
        color      : "#333",
        fontWeight : "bold",
        fontSize   : "12px",
        textIndent : "12px"
    };
    Theme.Dialog.Bar.close = {
        height          : Theme.Dialog._barHeight + "px",
        width           : Theme.Dialog._cloWidth + "px",
        styleFloat      : "right",
        cursor          : "pointer",
        backgroundImage : "url(\"" + Theme._path + "dialog/bar.close.png\")"
    };
    Theme.Dialog.Bar.close_mouseover = {};
    Theme.Dialog.Bar.close_mouseout = {};

    Theme.Dialog.MessageBox.content = {
        padding : "14px",
        lineHeight : "16px"
    };
    Theme.Dialog.MessageBox.buttonBar = {
        textAlign       : "right",
        backgroundColor : "#F5F5F7"
    };
    Theme.Dialog.Button.basic = {
        margin  : "8px",
        padding : "0px 8px",
        height  : "22px",
        border  : "1px solid #888",
        cursor  : "pointer",
        fontWeight : "normal",
        backgroundImage : "url(\"" + Theme._path + "button/basic.png\")"
    };
    Theme.Dialog.Button.mouseover = {};
    Theme.Dialog.Button.mouseout = {};
    Theme.Dialog.Input.base = {
        border  : "1px solid #888"
    };
    Theme.Dialog.Input.focus = {};
    Theme.Dialog.Input.blur = {};