/* 表单条件 */
Element.Methods_ByTag_FORM.formValidator = function(element,argv){
    element = $(element);
    var conf = Object.extend({
        onerror		:ZHUOZHUO.T,
        onsuccess	:ZHUOZHUO.T
    },argv);
    element.addEvent("submit",onsubmit);
    function onsubmit(event){
        var inputs = element.elements,input,msg;
        for(var i=0,length=inputs.length;i<length;i++){
            input = inputs[i];
            if(input.getFormValidator && ((msg = input.getFormValidator()) != true))
                return error(msg,event);
            if(input.getInputValidator && ((msg = input.getInputValidator()) != true))
                return error(msg,event);
            if(input.getRegexValidator && ((msg = input.getRegexValidator()) != true))
                return error(msg,event);
            if(input.getFunctionValidator && ((msg = input.getFunctionValidator()) != true))
                return error(msg,event);
            if(input.getAjaxValidator && ((msg = input.getAjaxValidator()) != true))
                return error(msg,event);
        }
        if(!conf.onsuccess()){
            Event.stopPropagation(event);
            Event.preventDefault(event);
        }
        return true;
    }
    function error(msg,event){
        Event.stopPropagation(event);
        Event.preventDefault(event);
        return conf.onerror(msg);
    }
    return element;
}
/* 验证信息设置 */
Element.Methods_ByTag_INPUT.formValidator = function(element,argv){
    element = $(element);
    var conf = Object.extend({
        empty		:false,
        onempty		:"输入内容为空",
        onshow		:"请输入内容",
        onfocus		:"请输入内容",
        oncorrect	:"输入正确"
    },argv);
    element.setonshow(conf.onshow);
    element.addEvent("focus",function(event){
        element.setonfocus(conf.onfocus)
    });
    element.addEvent("blur",getFormValidator);
    function getFormValidator(event){
        if(!conf.empty && element.getValue().trim() == ''){
            element.setonerror(conf.onempty);
            return conf.onempty;
        }
        element.setonsuccess(conf.oncorrect);
        return true;
    }
    return Object.extend(element,{
        getFormValidator:getFormValidator
    });
}
/* 验证条件 */
Element.Methods_ByTag_INPUT.inputValidator = function(element,argv){
    element = $(element);
    var conf = Object.extend({
        empty		:false,
        type		:'length',
        onerror		:"输入错误",
        min			:0,
        max			:999999,
        onerrormin	:null,
        onerrormax	:null
    },argv);
    element.addEvent("blur",getInputValidator);
    function getInputValidator(){
        var value = element.getValue();
        if (element.tagName.toUpperCase() == "SELECT"){
            if(value<0)return minerr();
            value = new Array(parseInt(value)).each(function(){
                return "r"
            }).join('');
        }
        if(!conf.empty) {
            value = value.trim();element.setValue(value)
        }
        if(conf.type=='length'){
            if(value.length<conf.min) return minerr();
            if(value.length>conf.max) return maxerr();
        }
        if(conf.type=='wlength'){
            if(value.wlength()<conf.min) return minerr();
            if(value.wlength()>conf.max) return maxerr();
        }
        return true;
    }
    function minerr(){
        var msg = conf.onerrormin == null ? conf.onerror : conf.onerrormin;
        element.setonerror(msg);
        return msg
    }
    function maxerr(){
        var msg = conf.onerrormax == null ? conf.onerror : conf.onerrormax;
        element.setonerror(msg);
        return msg
    }
    return Object.extend(element,{
        getInputValidator:getInputValidator
    });
}
/* 正则验证 */
Element.Methods_ByTag_INPUT.regexValidator = function(element,argv){
    element = $(element);
    var conf = Object.extend({
        regexp:'',
        param:'i',
        onerror:"输入错误"
    },argv);
    element.addEvent("blur",getRegexValidator);
    function getRegexValidator(){
        var v = element.getValue();
        if(v=='')return true;
        v = new RegExp(conf.regexp,conf.param).test(v);
        if(!v) element.setonerror(conf.onerror);
        return  v ? v : conf.onerror;
    }
    return Object.extend(element,{
        getRegexValidator:getRegexValidator
    });
}
Element.Methods_ByTag_INPUT.functionValidator = function(element,argv){
    element = $(element);
    var conf = Object.extend({
        fun:ZHUOZHUO.T,
        onerror:"输入错误"
    },argv);
    element.addEvent("blur",getFunctionValidator);
    function getFunctionValidator(){
        var v = conf.fun(element.getValue());
        if(!v) element.setonerror(conf.onerror);
        return  v ? v : conf.onerror;
    }
    return Object.extend(element,{
        getFunctionValidator:getFunctionValidator
    });
}

/* ajax验证 */
Element.Methods_ByTag_INPUT.ajaxValidator = function(element,argv){
    element = $(element);
    var conf = Object.extend({
        type		:"GET",
        url			:'',
        data		:{},
        onwait		:"正在校验",
        oncomplete	:ZHUOZHUO.T,
        onerror		:"系统出错!"
    },argv);
    var info;
    element.addEvent("blur",Validator);
    function Validator(event){
        var msg;
        if(element.getFormValidator && ((msg = element.getFormValidator()) != true))
            return element.setonerror(msg);
        if(element.getInputValidator && ((msg = element.getInputValidator()) != true))
            return element.setonerror(msg);
        if(element.getRegexValidator && ((msg = element.getRegexValidator()) != true))
            return element.setonerror(msg);
        info = $(element.id+"Tip").getInnerText();
        new Ajax.Request(conf.url,{
            method:conf.type,
            varBody:Object.extend(conf.data,{
                key:element.getValue()
            }),
            onrequest:function(s){
                element.setonload('('+s*25+'%)'+conf.onwait);
            },
            oncompleted:oncomplete,
            onfailure:function(req){
                element.setonerror(conf.onerror)
            }
        });
        return true;
    }
    function oncomplete(req){
        if(req.status!=200){
            element.setonerror(conf.onerror);
            return conf.onerror;
        }
        var msg = conf.oncomplete(req);
        msg!=true ? element.setonerror(msg) : element.setonsuccess(info);
        return msg;
    }
    function getAjaxValidator(){
        info = $(element.id+"Tip").getInnerText();
        var ajax = new Ajax.Request(conf.url,{
            method		:conf.type,
            async		:false,
            varBody		:Object.extend(conf.data,{
                key:element.getValue()
            }),
            onrequest:function(s){
                element.setonload('('+s*25+'%)'+conf.onwait);
            },
            onfailure:function(req){
                element.setonerror(conf.onerror)
            }
        });
        return oncomplete(ajax.data());
    }
    return Object.extend(element,{
        getAjaxValidator:getAjaxValidator
    });
}
/* 信息提示 */
Object.extend(Element.Methods_ByTag_INPUT,{
    setonshow	: function(element,msg){
        $(element.id+"Tip").setAttributeExt({
            "class":"onShow"
        }).setInnerText(msg);
    },
    setonfocus	: function(element,msg){
        $(element.id+"Tip").setAttributeExt({
            "class":"onFocus"
        }).setInnerText(msg);
    },
    setonsuccess : function(element,msg){
        $(element.id+"Tip").setAttributeExt({
            "class":"onSuccess"
        }).setInnerText(msg);
    },
    setonerror	: function(element,msg){
        $(element.id+"Tip").setAttributeExt({
            "class":"onError"
        }).setInnerText(msg);
    },
    setonload	: function(element,msg){
        $(element.id+"Tip").setAttributeExt({
            "class":"onLoad"
        }).setInnerText(msg);
    }
});
Object.extend(Element.Methods_ByTag_TEXTAREA,Element.Methods_ByTag_INPUT);
Object.extend(Element.Methods_ByTag_SELECT,Element.Methods_ByTag_INPUT);