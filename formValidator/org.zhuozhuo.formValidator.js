/* 
 * html form validator
 * Shi,Zhuolin
 * http://www.zhuozhuo.org
 * 2011-03-03
 */
(function(scope){
    var zz = scope.zhuozhuo, util = scope.zhuozhuo.util, ajax = scope.zhuozhuo.ajax;
    var fv = zz.namespace("org.zhuozhuo.formValidator");
    fv.fv = function(zdom){
        zdom = zz.getById(zdom);
        if(zdom.formValidator)return zdom;
        if(zdom.element.tagName.toUpperCase() == "FORM"){
            zdom.formValidator = function(argv){
                var element = this.element;
                var conf = util.extend({
                    onerror  : util.fnEmpty,
                    onsuccess: util.fnTrue
                },argv);
                function onsubmit(evt){
                    var inputs = element.elements, msg, errors=[], input;
                    for(var i=0,length=inputs.length;i<length;i++){
                        input = zz.getById(inputs[i]);
                        if(input.getFormValidator && ((msg = input.getFormValidator()) != true))
                            errors.push(msg);
                    }
                    if(errors.length != 0) return error(errors, evt);
                    if(!conf.onsuccess()){
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                    return null;
                }
                function error(msg, evt){
                    evt.stopPropagation();
                    evt.preventDefault();
                    return conf.onerror(msg);
                }
                return this.addEvent("submit", onsubmit);
            };
        }else{
            zdom.formValidator = function(argv){
                var element = this;
                var conf = util.extend({
                    tips     : null,
                    empty    : false,
                    onempty  : "输入内容为空",
                    onshow   : "请输入内容",
                    onfocus  : "请输入内容",
                    oncorrect: "输入正确"
                },argv);
                var setonloadmsg   = getMessageFun("onLoad");
                var setonerrormsg  = getMessageFun("onError");
                var setonsuccessmsg= getMessageFun("onSuccess");
                var setonfocusmsg  = getMessageFun("onFocus");
                var setonshowmsg   = getMessageFun("onShow");
                function getFormValidator(){
                    if(!conf.empty && element.getValue().trim() == ''){
                        element.setonerrormsg(conf.onempty);
                        return conf.onempty;
                    }
                    var msg;
                    if(element.getInputValidator && ((msg = element.getInputValidator()) != true)) {
                        element.setonerrormsg(msg);
                        return msg;
                    }
                    if(element.getRegexValidator && ((msg = element.getRegexValidator()) != true)) {
                        element.setonerrormsg(msg);
                        return msg;
                    }
                    if(element.getFunctionValidator && ((msg = element.getFunctionValidator()) != true)) {
                        element.setonerrormsg(msg);
                        return msg;
                    }
                    if(element.getAjaxValidator) {
                        msg = element.getAjaxValidator();
                        if(msg != true) return msg;
                    }else element.setonsuccessmsg(conf.oncorrect);
                    return true;
                }
                function getMessageFun(type){
                    return function(msg){
                        if(type == "onSuccess" && !msg) msg = conf.oncorrect;
                        var tips = conf.tips || zz.getById((element.getAttribute("id") || element.getAttribute("name")) + "Tip");
                        if(tips){
                            tips.element.className = type;
                            tips.setText(msg);
                        }
                        return element;
                    }
                }
                return util.extend(element,{
                    getFormValidator: getFormValidator,
                    setonloadmsg    : setonloadmsg,
                    setonerrormsg   : setonerrormsg,
                    setonsuccessmsg : setonsuccessmsg,
                    setonfocusmsg   : setonfocusmsg,
                    setonshowmsg    : setonshowmsg
                }).addEvent("focus",function(e){
                    e.getTarget().setonfocusmsg(conf.onfocus);
                }).addEvent("blur", getFormValidator).setonshowmsg(conf.onshow);
            };
            zdom.inputValidator = function(argv){
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
                    if(tagName == "input") type = util.string.trim(element.element.type.toLowerCase());
                    if(tagName == "select" || type =="checkbox" || type == "radio"){
                        var selecti = -1,total=0, elements = tagName == "select" ? element.element.options : zz.getById(element.element.form).getBySelector("input[name='"+element.element.name+"'][type='"+element.element.type+"']", 1);
                        for(var i=0,length=elements.length;i<length;i++){
                            if((tagName == "select" && elements[i].element.selected) || (tagName == "input" && elements[i].element.checked)){
                                total++;
                                if(selecti == -1)selecti=i;
                            }
                        }
                        if(element.element.multiple || type == "checkbox"){
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
                return util.extend(element,{
                    getInputValidator : getInputValidator
                });
            };
            zdom.ajaxValidator = function(argv){
                var element = this;
                var conf = util.extend({
                    type       : "POST",
                    url        : '',
                    data       : {},
                    onwait     : "正在校验",
                    oncomplete : util.fnTrue,
                    onerror    : "系统出错!"
                }, argv);
                function getAjaxValidator(){
                    var newValue = element.getValue();
                    if(newValue == element.succesValue) return true;
                    conf.data[element.element.name] = newValue;
                    var request = new zz.ajax.Request();
                    request.addListener("request",function(s){
                        element.setonloadmsg('(' + s*25 + "%)" + conf.onwait);
                    });
                    request.addListener("failure",function(resp){
                        throw resp.text;
                    });
                    request.addListener("success",function(response){
                        var result = conf.oncomplete(response) || conf.onerror;
                        if(result == true){
                            element.setonsuccessmsg();
                            element.succesValue = newValue;
                        }else{
                            element.setonerrormsg(result);
                        }
                    });
                    request.open(conf.url, conf.type);
                    request.send(conf.data);
                    return conf.onerror;
                }
                return util.extend(element, {
                    getAjaxValidator : getAjaxValidator
                });
            };
            zdom.regexValidator = function(argv){
                var element = this;
                var conf = util.extend({
                    regexp  : '',
                    param   : 'i',
                    onerror : "输入错误"
                }, argv);
                function getRegexValidator(){
                    var v = element.getValue();
                    v = new RegExp(conf.regexp, conf.param).test(v);
                    return v || conf.onerror;
                }
                return util.extend(this,{
                    getRegexValidator : getRegexValidator
                });
            };
            zdom.functionValidator = function(argv){
                var element = this;
                var conf = util.extend({
                    fun     : util.fnTrue,
                    onerror : "输入错误"
                }, argv);
                function getFunctionValidator(){
                    var v = conf.fun(element.getValue());
                    return v || conf.onerror;
                }
                return util.extend(element,{
                    getFunctionValidator:getFunctionValidator
                });
            };
        }
        return zdom;
    }
})(this);

