/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
var Graphics = Class({
    initialize : function(element){
        Graphics.superclass.initialize.apply(this, arguments);
        var p = element.getOffsets();
        var d = element.getDimensions();
        this._oldhtml = element.innerHTML;
        this._element = element;
        this._cx = 0;
        this._cy = 0;
        this._width = d.width;
        this._height= d.height;
        this._pen = {
            x : 0,
            y : 0,
            size : 1,
            color: "#000",
            alpha: 1,
            font : "normal 12px normal"
        };
        //canvas
        var canvas = document.createElement("canvas");
        if(canvas.getContext){
            canvas.width = this._width;
            canvas.height= this._height;
            this._element.appendChild(canvas);
            this._canvas = canvas.getContext("2d");
            this.setPen(this._pen);
            return;
        }
        //vml
        if(ZHUOZHUO.BrowserKernel.Trident){
            document.namespaces.add("vml","urn:schemas-microsoft-com:vml");
            document.createStyleSheet().addRule(".vml","behavior:url(#default#VML);display:inline-block");
            this._vml = $(document.createElement("vml:group")).setAttr({
                style    : "position:relative;width:"+this._width+"px;height:"+this._height+"px",
                coordsize: this._width+','+this._height,
                className: "vml"
            });
            this._element.appendChild(this._vml);
            this.setPen(this._pen);
            return;
        }
        //div
        this._cx = p.left;
        this._cy = p.top;
        this.setPen(this._pen);
    },
    _getX : function(x){
        return this._cx + x;
    },
    _getY : function(y){
        return this._cy + y;
    },
    //设置画笔
    setPen : function(pen){
        if(this._canvas){
            this._canvas.fillStyle  = pen.color || this._pen.color;
            this._canvas.strokeStyle= pen.color || this._pen.color;
            this._canvas.globalAlpha= pen.alpha || this._pen.alpha;
            this._canvas.lineWidth  = pen.size  || this._pen.size;
            this._canvas.moveTo(pen.x || this._pen.x, pen.y || this._pen.y);
        }
        Object.extend(this._pen,pen);
    },
    getPen : function(){
        return this._pen;
    },
    //填充区域
    fillRect : function(x,y,w,h){
        if(this._canvas){
            this._canvas.fillRect(x,y,w,h);
            return;
        }
        if(this._vml){
            var fill = $(document.createElement('vml:fill')).setAttr({
                opacity  : this._pen.alpha,
                className: "vml"
            });
            var rect = $(document.createElement('vml:rect')).setAttr({
                className: "vml",
                stroked  : "False",
                fillcolor:this.Pen.color,
                style    : "top:"+y+"px;left:"+x+"px;width:"+w+"px;height:"+h+"px"
            });
            rect.appendChild(fill);
            this._vml.appendChild(rect);
            return;
        }
        var div = $(document.createElement("DIV"));
        this._element.appendChild(div);
        div.setStyle({
            backgroundColor:this._pen.color,
            position: "absolute",
            overflow: "hidden",
            opacity : this._pen.alpha,
            left  : this._getX(x)+"px",
            top   : this._getY(y)+"px",
            width : w+"px",
            height: h+"px"
        });
    },
    clearAll : function(){
        if(this._canvas){
            this._canvas.clearRect(0,0,this._width,this._height);
            return;
        }
        if(this._vml){
            this._vml.innerHTML = '';
            return;
        }
        this._element.innerHTML = '';
    },
    drawArc : function(x, y, radius, startAngle, endAngle){
        if(this._canvas){
            this._canvas.beginPath();
            this._canvas.arc(x, y, radius, startAngle, endAngle, false);
            this._canvas.stroke();
            this.moveTo(x+radius*Math.cos(endAngle), y+radius*Math.sin(endAngle));
            return;
        }
        if(this._vml){
            this.moveTo(x+radius*Math.cos(endAngle), y+radius*Math.sin(endAngle));
            startAngle= startAngle+Math.PI/2;
            endAngle  = endAngle+Math.PI/2;
            startAngle= 360/Math.PI/2*startAngle;
            endAngle  = 360/Math.PI/2*endAngle;
            if(startAngle>360)startAngle -= 360;
            if(endAngle>360)endAngle -= 360;
            if(startAngle==endAngle){
                startAngle=0;
                endAngle=360;
            }
            var stroke = $(document.createElement('vml:stroke')).setAttr({
                opacity:this.Pen.alpha,
                color:this.Pen.color,
                weight:this.Pen.size+'px',
                className:"vml"
            });
            var fill = $(document.createElement('vml:fill')).setAttr({
                className:"vml",
                on:"False"
            });
            var arc = $(document.createElement('vml:arc')).setAttr({
                style:"top:"+y-radius+"px;left:"+x-radius+"px;width:"+radius*2+"px;height:"+radius*2+"px",
                className:"vml",
                startangle:startAngle,
                endangle:endAngle
            });
            arc.appendChild(stroke);
            arc.appendChild(fill);
            this._vml.appendChild(arc);
            return;
        }
        var iMax=(endAngle>startAngle)? endAngle-startAngle : Math.PI*2-startAngle+endAngle;
        var step=2/(Math.sqrt(radius*radius*Math.PI)/this._pen.size*0.57*2);
        if(endAngle>startAngle) for(var i=startAngle;i<=endAngle;i+=step) this.drawDot(x+radius*Math.cos(i),y+radius*Math.sin(i));
        else{
            for(i=startAngle;i<=Math.PI*2;i+=step) this.drawDot(x+radius*Math.cos(i),y+radius*Math.sin(i));
            for(i=0;i<=endAngle;i+=step) this.drawDot(x+radius*Math.cos(i),y+radius*Math.sin(i));
        }
    },
    drawDot : function(x,y){
        this.fillRect(x-(this._pen.size/2),y-(this._pen.size/2),this._pen.size,this._pen.size);
        this.moveTo(x,y);
    },
    drawLine : function(x1,y1,x2,y2){
        if(this._canvas){
            this._canvas.beginPath();
            this._canvas.moveTo(x1, y1);
            this._canvas.lineTo(x2, y2);
            this._canvas.stroke();
            this.moveTo(x2, y2);
            return;
        }
        if(this._vml){
            var stroke = $(document.createElement('vml:stroke')).setAttr({
                opacity: this._pen.alpha,
                color  : this._pen.color,
                weight : this._pen.size+'px',
                className:"vml"
            });
            var line = $(document.createElement('vml:line')).setAttr({
                from:parseInt(x1)+','+parseInt(y1),
                to:parseInt(x2)+','+parseInt(y2),
                className:"vml",
                style:"left:"+parseInt(x1<x2 ? x1:x2)+"px;top:"+parseInt(y1<y2 ? y1:y2)+"px"
            });
            line.appendChild(stroke);
            this._vml.appendChild(line);
            this.moveTo(x2, y2);
            return;
        }
        var r = Math.floor(Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)));
        var tan = Math.atan((y2-y1)/(x2-x1));
        if((x2-x1)<0)tan+=Math.PI;
        var dx = Math.cos(tan);
        var dy = Math.sin(tan);
        if(x1==x2 || y1==y2){
            var w= x1==x2 ? this.Pen.size:x2-x1;
            var h= y1==y2 ? this.Pen.size:y2-y1;
            (x2<x1 || y2<y1)? this.fillRect(x2,y2,w,h):this.fillRect(x1,y1,w,h);
            this.moveTo(x2,y2);
            return;
        }
        for(var i=0;i<r;i+=this._pen.size)this.drawDot(x1+i*dx,y1+i*dy);
    },
    drawRect : function(x,y,width,height){
        if(this._canvas){
            this._canvas.strokeRect(x, y, width, height);
            return;
        }
        if(this._vml){
            var stroke = $(document.createElement('vml:stroke')).setAttr({
                opacity:this.Pen.alpha,
                color:this.Pen.color,
                weight:this.Pen.size+'px',
                className:"vml"
            });
            var fill = $(document.createElement('vml:fill')).setAttr({
                on:'False',
                className:"vml"
            });
            var rect = $(document.createElement('vml:rect')).setAttr({
                style : "top:"+y+"px;left:"+x+"px;width:"+width+"px;height:+"+height+"px",
                className:"vml"
            });
            rect.appendChild(stroke);
            rect.appendChild(fill);
            this._vml.appendChild(rect);
            return;
        }
        var size = this._pen.size/2;
        this.fillRect(x-size,y-size,this.Pen.size,height);
        this.fillRect(x-size,y-size,width,this.Pen.size);
        this.fillRect(x-size+width,y-size,this.Pen.size,height);
        this.fillRect(x-size,y-size+height,width+this.Pen.size,this.Pen.size);
    },
    drawOval : function(x,y,width,height){
        if(this._vml){
            var stroke = $(document.createElement("vml:stroke")).setAttr({
                opacity: this._pen.alpha,
                color  : this._pen.color,
                weight : this._pen.size+'px'
            }).addClass("vml");
            var fill = $(document.createElement("vml:fill")).setAttr("on","False").addClass("vml");
            var arc = $(document.createElement("vml:oval")).setAttr({
                style  : "top:"+y+"px;left:"+x+"px;width:"+width+"px;height:"+height+"px"
                
            });
            arc.className = "vml";
            arc.appendChild(stroke);
            arc.appendChild(fill);
            this._vml.appendChild(arc);
            return;
        }
        var iMax=2*Math.PI,w=width/2,h=height/2;
        if(w==h){
            this.drawArc(x+w,y+h,w,0,iMax);
            return;
        }
        x+=w,y+=h;
        var step=2/(Math.sqrt(w*h)*2/this._pen.size*Math.abs(w/h));
        for(var i=0;i<iMax;i+=step) this.drawDot(x+w*Math.cos(i),y+h*Math.sin(i));
    },
    lineTo : function(x,y){
        this.drawLine(this._pen.x,this._pen.y,x,y);
    },
    moveTo : function(x,y){
        this.setPen({
            x:x,
            y:y
        });
    },
    drawPolygon : function(xpoints,ypoints){
        var length=Math.min(xpoints.length,ypoints.length);
        for(var i=1;i<length;i++) this.drawLine(xpoints[i-1],ypoints[i-1],xpoints[i],ypoints[i]);
        this.drawLine(xpoints[i-1],ypoints[i-1],xpoints[0],ypoints[0]);
    },
    drawString : function(str,x,y){
        var _x=0,_y=0;
        if(this._CANVAS){
            this._CANVAS.font = this.Pen.font;
            var _this = this;
            if($Try(function(){
                _this._CANVAS.fillText(str,x,y);
                return true
            })){
                return;
            }else{
                var Offsets = this._CASE.getPositionedOffsets();
                _x = Offsets.left;
                _y = Offsets.top;
            }
        }
        if(this._VML){
            var textbox= $(document.createElement('vml:textbox')).addClassName('vml').setStyle({
                position:'absolute',
                color:this.Pen.color,
                font:this.Pen.font,
                left:x+'px',
                top:y-(/(\d{1,3})/.exec(this.Pen.font))[1]+3+'px'
            }).setInnerText(str);
            this._VML.appendChildExt(textbox);
            return;
        }
        this._CASE.appendChildExt($(document.createElement("DIV")).setStyle({
            position:"absolute",
            left:this._getX(x)+_x+"px",
            top:this._getY(y)+_y-(/(\d{1,3})/.exec(this.Pen.font))[1]+3+"px",
            color:this.Pen.color,
            font:this.Pen.font
        }).setInnerHTML(str));
    },
    finalize : function(){
        this._element.innerHTML = this._oldhtml;
        AutoTop.superclass.finalize.apply(this);
    }
});

