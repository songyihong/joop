/* 
 * Shi,Zhuolin shizhuolin@hotmail.com
 * 2d and 3d graphics
 * 2011-03-01
 */
//2d graphice
(function(scope){
    var zz = scope.zhuozhuo;
    zz.namespace("org.zhuozhuo").graphics = zz.zclass({
        initialize : function(id){
            scope.org.zhuozhuo.graphics.superclass.initialize.apply(this, arguments);
            var element = scope.zhuozhuo.getById(id);
            var p = element.getOffsets();
            var d = element.getDimensions();
            this.originalHTML = element.getHTML();
            this.element = element;
            this.width = d.width;
            this.height= d.height;
            this.cx = p.left;
            this.cy = p.top;
            this.pen = {
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
                canvas.width = this.width;
                canvas.height= this.height;
                element.element.appendChild(canvas);
                this.canvas = canvas.getContext("2d");
            }
            //vml
            if(zz.browser.kernel.isTrident){
                document.namespaces.add("v","urn:schemas-microsoft-com:vml");
                document.createStyleSheet().addRule(parseFloat(zz.browser.version) < 8.0 ? "v\\:*" : "v\\:textbox, v\\:group, v\\:stroke, v\\:fill, v\\:arc, v\\:rect, v\\:line, v\\:oval","behavior:url(#default#VML); position:absolute; display:inline-block;");
                this.vml = element;
            }
            this.setPen(this.pen);
        },
        setPen : function(pen){
            if(this.canvas){
                this.canvas.fillStyle  = pen.color || this.pen.color;
                this.canvas.strokeStyle= pen.color || this.pen.color;
                this.canvas.globalAlpha= pen.alpha || this.pen.alpha;
                this.canvas.lineWidth  = pen.size  || this.pen.size;
                this.canvas.moveTo(pen.x || this.pen.x, pen.y || this.pen.y);
            }
            scope.zhuozhuo.util.extend(this.pen,pen);
        },
        getCurrentCX : function(x){
            return this.cx + x;
        },
        getCurrentCY : function(y){
            return this.cy + y;
        },
        getPen : function(){
            return this.pen;
        },
        fillRect : function(x,y,w,h){
            if(this.canvas){
                this.canvas.fillRect(x,y,w,h);
                return;
            }
            if(this.vml){
                var fill = scope.zhuozhuo.getById(document.createElement('v:fill')).setAttribute("opacity", this.pen.alpha);
                var rect = scope.zhuozhuo.getById(document.createElement('v:rect')).setAttribute({
                    stroked  : "False",
                    fillcolor: this.pen.color
                }).setStyle({
                    top   : this.getCurrentCY(y)+"px",
                    left  : this.getCurrentCX(x)+"px",
                    width : w+"px",
                    height: h+"px"
                });
                this.vml.append(rect);
                rect.append(fill);
                return;
            }
            var div = scope.zhuozhuo.getById(document.createElement("div"));
            this.element.append(div);
            div.setStyle({
                background: this.pen.color,
                position  : "absolute",
                overflow  : "hidden",
                opacity   : this.pen.alpha,
                left      : this.getCurrentCX(x)+"px",
                top       : this.getCurrentCY(y)+"px",
                width     : w+"px",
                height    : h+"px"
            });
        },
        clear : function(){
            if(this.canvas){
                this.canvas.clearRect(0, 0, this.width, this.height);
                return;
            }
            if(this.vml){
                this.vml.setHTML('');
                zz.element.syncCache();
                return;
            }
            this.element.setHTML('');
            zz.element.syncCache();
        },
        drawArc : function(x, y, radius, startAngle, endAngle){
            if(this.canvas){
                this.canvas.beginPath();
                this.canvas.arc(x, y, radius, startAngle, endAngle, false);
                this.canvas.stroke();
                this.moveTo(x + radius * Math.cos(endAngle), y + radius * Math.sin(endAngle));
                return;
            }
            if(this.vml){
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
                var stroke = scope.zhuozhuo.getById(document.createElement('v:stroke')).setAttribute({
                    opacity: this.pen.alpha,
                    color  : this.pen.color,
                    weight : this.pen.size+'px'
                });
                var fill = scope.zhuozhuo.getById(document.createElement('v:fill')).setAttribute("on", "False");
                var arc = scope.zhuozhuo.getById(document.createElement('v:arc')).setAttribute({
                    startangle: startAngle,
                    endangle  : endAngle
                }).setStyle({
                    top   : this.getCurrentCY(y-radius)+"px",
                    left  : this.getCurrentCX(x-radius)+"px",
                    width : radius*2+"px",
                    height: radius*2+"px"
                });
                this.vml.append(arc);
                arc.append(stroke);
                arc.append(fill);
                return;
            }
            var step = 2/(Math.sqrt(radius*radius*Math.PI)/this.pen.size*0.57*2);
            if(endAngle>startAngle)for(var i=startAngle; i<=endAngle; i+=step) this.drawDot(x+radius*Math.cos(i), y+radius*Math.sin(i));
            else{
                for(i=startAngle; i<=Math.PI*2; i+=step) this.drawDot(x+radius*Math.cos(i), y+radius*Math.sin(i));
                for(i=0; i<=endAngle; i+=step) this.drawDot(x+radius*Math.cos(i), y+radius*Math.sin(i));
            }
        },
        drawDot : function(x,y){
            this.fillRect(x-(this.pen.size/2),y-(this.pen.size/2),this.pen.size,this.pen.size);
            this.moveTo(x,y);
        },
        drawLine : function(x1,y1,x2,y2){
            if(this.canvas){
                this.canvas.beginPath();
                this.canvas.moveTo(x1, y1);
                this.canvas.lineTo(x2, y2);
                this.canvas.stroke();
                this.moveTo(x2, y2);
                return;
            }
            if(this.vml){
                var stroke = scope.zhuozhuo.getById(document.createElement('v:stroke')).setAttribute({
                    opacity: this.pen.alpha,
                    color  : this.pen.color,
                    weight : this.pen.size+'px'
                });
                var line = scope.zhuozhuo.getById(document.createElement('v:line')).setAttribute({
                    from : parseInt(x1)+','+parseInt(y1),
                    to   : parseInt(x2)+','+parseInt(y2)
                }).setStyle({
                    left: this.getCurrentCX(parseInt(x1<x2 ? x1:x2))+"px",
                    top : this.getCurrentCY(parseInt(y1<y2 ? y1:y2))+"px"
                });
                this.vml.append(line);
                line.append(stroke);
                this.moveTo(x2, y2);
                return;
            }
            var r = Math.floor(Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)));
            var tan = Math.atan((y2-y1)/(x2-x1));
            if((x2-x1)<0)tan+=Math.PI;
            var dx = Math.cos(tan);
            var dy = Math.sin(tan);
            if(x1==x2 || y1==y2){
                var w= x1==x2 ? this.pen.size:x2-x1;
                var h= y1==y2 ? this.pen.size:y2-y1;
                (x2<x1 || y2<y1)? this.fillRect(x2,y2,w,h):this.fillRect(x1,y1,w,h);
                this.moveTo(x2,y2);
                return;
            }
            for(var i=0;i<r;i+=this.pen.size)this.drawDot(x1+i*dx,y1+i*dy);
        },
        drawRect : function(x,y,width,height){
            if(this.canvas){
                this.canvas.strokeRect(x, y, width, height);
                return;
            }
            if(this.vml){
                var stroke = scope.zhuozhuo.getById(document.createElement('v:stroke')).setAttribute({
                    opacity: this.pen.alpha,
                    color  : this.pen.color,
                    weight : this.pen.size+'px'
                });
                var fill = scope.zhuozhuo.getById(document.createElement('v:fill')).setAttribute("on","False");
                var rect = scope.zhuozhuo.getById(document.createElement('v:rect')).setStyle({
                    top   : this.getCurrentCY(y)+"px",
                    left  : this.getCurrentCX(x)+"px",
                    width : width+"px",
                    height: height+"px"
                });
                this.vml.append(rect);
                rect.append(stroke);
                rect.append(fill);
                return;
            }
            var size = this.pen.size/2;
            this.fillRect(x-size,y-size,this.pen.size,height);
            this.fillRect(x-size,y-size,width,this.pen.size);
            this.fillRect(x-size+width,y-size,this.pen.size,height);
            this.fillRect(x-size,y-size+height,width+this.pen.size,this.pen.size);
        },
        drawOval : function(x,y,width,height){
            if(this.vml){
                var stroke = scope.zhuozhuo.getById(document.createElement("v:stroke")).setAttribute({
                    opacity: this.pen.alpha,
                    color  : this.pen.color,
                    weight : this.pen.size+'px'
                });
                var fill = scope.zhuozhuo.getById(document.createElement("v:fill")).setAttribute("on","False");
                var arc = scope.zhuozhuo.getById(document.createElement("v:oval")).setStyle({
                    top   : this.getCurrentCY(y)+"px",
                    left  : this.getCurrentCX(x)+"px",
                    width : width+"px",
                    height: height+"px"
                });
                this.vml.append(arc);
                arc.append(stroke);
                arc.append(fill);
                this.moveTo(x+width,y+height/2);
                return;
            }
            var iMax=2*Math.PI,w=width/2,h=height/2;
            if(w==h){
                this.drawArc(x+w,y+h,w,0,iMax);
                return;
            }
            x+=w,y+=h;
            var step=2/(Math.sqrt(w*h)*2/this.pen.size*Math.abs(w/h));
            for(var i=0;i<iMax;i+=step) this.drawDot(x+w*Math.cos(i),y+h*Math.sin(i));
        },
        lineTo : function(x,y){
            this.drawLine(this.pen.x,this.pen.y,x,y);
        },
        moveTo : function(x,y){
            this.setPen({
                x : x,
                y : y
            });
        },
        drawPolygon : function(xpoints,ypoints){
            var length=Math.min(xpoints.length,ypoints.length);
            for(var i=1;i<length;i++) this.drawLine(xpoints[i-1],ypoints[i-1],xpoints[i],ypoints[i]);
            this.drawLine(xpoints[i-1],ypoints[i-1],xpoints[0],ypoints[0]);
        },
        drawString : function(str,x,y){
            var _x=0, _y=0;
            if(this.canvas){
                this.canvas.font = this.pen.font;
                var current = this;
                if(scope.zhuozhuo.util.trys(function(){
                    current.canvas.fillText(str,x,y);
                    return true;
                })) return;
            }
            if(this.vml){
                var textbox= scope.zhuozhuo.getById(document.createElement('v:textbox')).setStyle({
                    color: this.pen.color,
                    font : this.pen.font,
                    left : this.getCurrentCX(x)+'px',
                    top  : this.getCurrentCY(y-(/(\d{1,3})/.exec(this.pen.font))[1]+3)+'px'
                }).setText(str);
                this.vml.append(textbox);
                return;
            }
            this.element.append(scope.zhuozhuo.getById(document.createElement("div")).setStyle({
                position: "absolute",
                left    : this.getCurrentCX(x)+_x+"px",
                top     : this.getCurrentCY(y)+_y-(/(\d{1,3})/.exec(this.pen.font))[1]+3+"px",
                color   : this.pen.color,
                font    : this.pen.font
            }).setText(str));
        },
        finalize : function(){
            this.element.setHTML(this.originalHTML);
            scope.org.zhuozhuo.graphics.superclass.finalize.apply(this);
        }
    });
})(this);
//3d
(function(scope){
    scope.org.zhuozhuo.graphics3d = scope.zhuozhuo.zclass(scope.org.zhuozhuo.graphics,{
        initialize : function(){
            scope.org.zhuozhuo.graphics3d.superclass.initialize.apply(this, arguments);
            this.transform3d = [];
        },
        add3dDot : function(x,y,z){
            this.transform3d.push({
                x : x,
                y : y,
                z : z,
                t : 'dot'
            });
            return this.transform3d.length;
        },
        add3dLine : function(x,y,z){
            this.transform3d.push({
                x:x,
                y:y,
                z:z,
                t:'line'
            });
            return this.transform3d.length;
        },
        add3dCube : function(x,y,z,width,height,length){
            var b,e,w = width/2,h = height/2,l = length/2;
            b = this.add3dDot(x-w, y-h, z+l);
            this.add3dLine(x-w, y-h, z+l);
            this.add3dLine(x+w, y-h, z+l);
            this.add3dLine(x+w, y+h, z+l);
            this.add3dLine(x+w, y+h, z-l);
            this.add3dLine(x+w, y-h, z-l);
            this.add3dLine(x-w, y-h, z-l);
            this.add3dLine(x-w, y-h, z+l);
            this.add3dLine(x-w, y+h, z+l);
            this.add3dLine(x+w, y+h, z+l);
            this.add3dLine(x+w, y+h, z-l);
            this.add3dLine(x-w, y+h, z-l);
            this.add3dLine(x-w, y+h, z+l);
            this.add3dLine(x-w, y+h, z-l);
            this.add3dLine(x-w, y-h, z-l);
            this.add3dDot(x+w, y-h, z-l);
            this.add3dLine(x+w, y-h, z-l);
            this.add3dLine(x+w, y-h, z+l);
            e = this.add3dDot(x+w, y-h, z+l);
            return {
                b : b,
                e : e
            };
        }, 
        show3d : function(d){
            this.clear();
            var p2d,oldp2d = {
                x:0,
                y:0,
                t:null
            };
            for(var i=0,len = this.transform3d.length;i<len;i++){
                p2d = this.translate2d(this.transform3d[i],d);
                p2d.t = this.transform3d[i].t;
                if(p2d.t == 'dot')
                    this.drawDot(p2d.x+this.width/2, p2d.y+this.height/2);
                else
                if(oldp2d.t == 'line' && p2d.t == 'line') this.drawLine(oldp2d.x+this.width/2, oldp2d.y+this.height/2, p2d.x+this.width/2, p2d.y+this.height/2);
                oldp2d = p2d;
            }
        },
        translate2d : function(P3D,D){
            var ratio=D/(D+P3D.z);
            return {
                x:P3D.x*ratio,
                y:P3D.y*ratio
            };
        },
        rotationx : function(r, be){
            be = be || {
                b : 0,
                e : this.transform3d.length
            };
            for(var i=be.b;i<be.e;i++){
                var y=this.transform3d[i].y*Math.cos(r)-this.transform3d[i].z*Math.sin(r);
                var z=this.transform3d[i].z*Math.cos(r)+this.transform3d[i].y*Math.sin(r);
                this.transform3d[i].y = y;
                this.transform3d[i].z = z;
            }
        },
        rotationy : function(r, be){
            be = be || {
                b : 0,
                e : this.transform3d.length
            };
            for(var i=be.b;i<be.e;i++){
                var x2=this.transform3d[i].x*Math.cos(r)-this.transform3d[i].z*Math.sin(r);
                var z2=this.transform3d[i].z*Math.cos(r)+this.transform3d[i].x*Math.sin(r);
                this.transform3d[i].x = x2;
                this.transform3d[i].z = z2;
            }
        },
        rotationz : function(r, be){
            be = be || {
                b : 0,
                e : this.transform3d.length
            };
            for(var i=be.b;i<be.e;i++){
                var x3=this.transform3d[i].x*Math.cos(r)-this.transform3d[i].y*Math.sin(r);
                var y3=this.transform3d[i].y*Math.cos(r)+this.transform3d[i].x*Math.sin(r);
                this.transform3d[i].x = x3;
                this.transform3d[i].y = y3;
            }
        }
    });
})(this);