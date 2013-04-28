(function(scope){
    var zz = scope.zhuozhuo, util = scope.zhuozhuo.util;
    var Ajax = zz.ajax;
    /* 验证过程 */
    var formValidatorMethods = {
        /* 基本验证 */
        formValidator : function(argv){
            var element = this;
            var conf = util.extend({
                tips     : null,
                empty    : false,
                onempty  : "输入内容为空",
                onshow   : "请输入内容",
                onfocus  : "请输入内容",
                oncorrect: "输入正确"
            },argv);
            var setonload   = getMessageFun("onLoad");
            var setonerror  = getMessageFun("onError");
            var setonsuccess= getMessageFun("onSuccess");
            var setonfocus  = getMessageFun("onFocus");
            var setonshow   = getMessageFun("onShow");
            setonshow(conf.onshow);
            this.addEvent("focus",function(){
                setonfocus(conf.onfocus)
            });
            this.addEvent("blur",getFormValidator);
            function getMessageFun(type){
                return function(msg){
                    if(type == "onSuccess" && !msg) msg = conf.oncorrect;
                    var tips = conf.tips || zz.getById((element.getAttribute("id") || element.getAttribute("name")) + "Tip");
                    if(tips){
                        tips.className = type;
                        tips.setText(msg);
                    }
                }
            }
            function getFormValidator(event){
                var async = event ? true : false;
                if(!conf.empty && element.getValue().trim() == ''){
                    setonerror(conf.onempty);
                    return conf.onempty;
                }
                var msg;
                if(element.getInputValidator && ((msg = element.getInputValidator()) != true)) {
                    setonerror(msg);
                    return msg;
                }
                if(element.getRegexValidator && ((msg = element.getRegexValidator()) != true)) {
                    setonerror(msg);
                    return msg;
                }
                if(element.getFunctionValidator && ((msg = element.getFunctionValidator()) != true)) {
                    setonerror(msg);
                    return msg;
                }
                if(element.getAjaxValidator) {
                    msg = element.getAjaxValidator(async);
                    if(!async && msg != true){
                        setonerror(msg);
                        return msg;
                    }
                }
                if(!async || !element.getAjaxValidator) setonsuccess(conf.oncorrect);
                return true;
            }
            return util.extend(this,{
                getFormValidator: getFormValidator,
                setonload       : setonload,
                setonerror      : setonerror,
                setonsuccess    : setonsuccess
            });
        },
        /* 验证条件 */
        inputValidator : function(argv){
            var element = this;
            var conf = util.extend({
                empty      : false,
                type       : 'length',
                onerror    : "输入错误",
                min        : 0,
                max        : 999999,
                onerrormin : null,
                onerrormax : null
            },argv);
            function getInputValidator(){
                //validator input checkbox or radio or select multiple or one
                var tagName = element.element.tagName.toLowerCase();
                var type, value = element.getValue();
                if(tagName == "input") type = element.element.type.toLowerCase().trim();
                if(tagName == "select" || type =="checkbox" || type == "radio"){
                    var selecti = -1,total=0, elements = tagName == "select" ? element.element.options : $(element.element.form).getBySelector("input[name='"+element.element.name+"'][type='"+element.element.type+"']");
                    for(var i=0,length=elements.length;i<length;i++){
                        if((tagName == "select" && elements[i].selected) || (tagName == "input" && elements[i].checked)){
                            total++;
                            if(selecti == -1)selecti=i;
                        }
                    }
                    if(element.multiple || type == "checkbox"){
                        if(total < conf.min) return minerr();
                        if(total > conf.max) return maxerr();
                    }else{
                        if(selecti < conf.min) return minerr();
                        if(selecti > conf.max) return maxerr();
                    }
                    return true;
                }
                if(!conf.empty) {
                    value = value.trim();
                    element.setValue(value)
                }
                if(conf.type=='length'){
                    if(value.length<conf.min) return minerr();
                    if(value.length>conf.max) return maxerr();
                }
                if(conf.type=='wlength'){
                    var vlength = util.string.wlength(value);
                    if(vlength<conf.min) return minerr();
                    if(vlength>conf.max) return maxerr();
                }
                return true;
            }
            function minerr(){
                return conf.onerrormin || conf.onerror;
            }
            function maxerr(){
                return conf.onerrormax || conf.onerror;
            }
            return util.extend(this,{
                getInputValidator:getInputValidator
            });
        },
        /* ajax验证 */
        ajaxValidator : function(argv){
            var element = this;
            var conf = util.extend({
                type       : "GET",
                url        : '',
                data       : {},
                onwait     : "正在校验",
                oncomplete : util.fnTrue,
                onerror    : "系统出错!"
            },argv);
            function getAjaxValidator(async){
                conf.data[element.element.name] = element.getValue();
                var result,request = new Ajax.Request();
                request.addListener("request",function(s){
                    if(async) element.setonload('('+s*25+'%)'+conf.onwait);
                });
                request.addListener("failure",function(response){
                    result = response.text
                    if(async) element.setonerror(response.text);

                });
                request.addListener("success",function(response){
                    result = conf.oncomplete(response) || conf.onerror;
                    if(async) result == true ? element.setonsuccess() : element.setonerror(result);
                });
                request.open(conf.url,conf.type,async);
                request.send(conf.data);
                return result;
            }
            return util.extend(this,{
                getAjaxValidator:getAjaxValidator
            });
        },
        /* 正则验证 */
        regexValidator : function(argv){
            var element = this.element;
            var conf = util.extend({
                regexp  : '',
                param   : 'i',
                onerror : "输入错误"
            }, argv);
            function getRegexValidator(){
                var v = element.getValue();
                v = new RegExp(conf.regexp,conf.param).test(v);
                return v || conf.onerror;
            }
            return util.extend(this,{
                getRegexValidator : getRegexValidator
            });
        },
        /* 函数验证 */
        functionValidator : function(argv){
            var element = this;
            var conf = Object.extend({
                fun     : ZHUOZHUO.TRUE,
                onerror : "输入错误"
            }, argv);
            function getFunctionValidator(){
                var v = conf.fun(element.getValue());
                return v || conf.onerror;
            }
            return Object.extend(element,{
                getFunctionValidator:getFunctionValidator
            });
        }
    }
    /* 表单条件 */
    this.zhuozhuo.element.tag.FORM.prototype.formValidator = function(argv){
        var element = this.element;
        var conf = util.extend({
            onerror  : util.fnEmpty,
            onsuccess: util.fnTrue
        },argv);
        function onsubmit(event){
            var evt = new zhuozhuo.event.Event(event);
            var inputs = element.elements,input,msg;
            var errors = "",index=1;
            for(var i=0,length=inputs.length;i<length;i++){
                if(inputs[i].getFormValidator && ((msg = inputs[i].getFormValidator()) != true))
                    errors += "<p>" + index++ + ". " + msg + "</p>";
            }
            if(errors != "") return error(errors, evt);
            if(!conf.onsuccess()){
                evt.stopPropagation(event);
                evt.preventDefault(event);
            }
            return true;
        }
        function error(msg, evt){
            evt.stopPropagation(event);
            evt.preventDefault(event);
            return conf.onerror(msg);
        }
        return this.addEvent("submit",onsubmit);
    }

    /* 应用方法 */
    util.extend(zz.element.tag.INPUT.prototype,formValidatorMethods);
    util.extend(zz.element.tag.TEXTAREA.prototype,formValidatorMethods);
    util.extend(zz.element.tag.SELECT.prototype,formValidatorMethods);
})(this);