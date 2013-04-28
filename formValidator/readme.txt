图标说明
loading.gif			正在加载
reg1.gif			提示(脱选)
reg2.gif			提示(选中)
reg3.gif			提示(错误)
reg4.gif			提示(正确)
表单输入项ID或Name + Tip 为提示层
org.zhuozhuo.formValidator.fv(zdom)

input/TEXTAREA formValidator			基本验证 返回输入项本身
			参数
                        tips            :null                                    消息提示element 默认为 (element.id || name) + Tip
			empty		:false,                                  是否允许为空 是/否 true/false
			onempty		:"输入内容为空",                          输入为空提示信息
			onshow		:"请输入内容",                            初始提示
			onfocus		:"请输入内容",                            焦点提示
			oncorrect	:"输入正确",                              验证成功提示
			方法
			getFormValidator()                                       触发验证获取验证结果 true 为验证通过 否则返回验证失败的提示
                        setonloadmsg(string)                                     正在加载消息
                        setonerrormsg(string)                                    错误消息
                        setonsuccessmsg(string)                                  成功消息
                        setonfocusmsg(string)                                    焦点消息
                        setonshowmsg(string)                                     初始消息

input/TEXTAREA inputValidator			普通验证只验证长度
			参数
			empty		:false,                                   是否允许空格 如果不允许则自动修复两边的控格
			type		:'length',                                验证类型 length/wlength 普通类型/中文字符类型
			onerror		:"输入错误",                               错误提示
			min		:0,                                       最小长度或单选菜单最小选择index 多选菜单最少选择个数
			max		:999999,                                  最大长度或单选菜单最大选择index 多选菜单最多选择个数
			onerrormin	:null,                                    最小选择错误提示
			onerrormax	:null                                     最大选择错误提示
			方法
			getInputValidator()                                       触发验证获取验证结果 true 为验证通过 否则返回验证失败的提示
			
input/TEXTAREA regexValidator			正则验证
			参数
			regexp:''                                               正则表达式(注意\==\\)
			param:'i'                                               附加参数g：代表可以进行全局匹配。i：代表不区分大小写匹配。m：代表可以进行多行匹配。 可以任意组合,当然也可以不加参数
			onerror:"输入错误"                                       错误提示
			方法
			getRegexValidator()                                     触发验证获取验证结果 true 为验证通过 否则返回验证失败的提示
			
input/TEXTAREA functionValidator                                                涵数验证
			参数
			onerror:"输入错误"                                       错误提示
			fun(v)                                                  验证函数,返回true或false 返回false表示验证失败
			方法
			getFunctionValidator()                                  触发验证获取验证结果 true 为验证通过 否则返回验证失败的提示
	
input/TEXTAREA ajaxValidator			ajax验证 ajax校验结果异步操作,无法返回给表单检测项 请求名称始终是key
			参数
			type:"post"                                             请求类型"GET" "POST"
			url:''                                                  请求地址
			data:{}                                                 附加在url上的请求数据
			onwait:"正在校验"                                       正在校验时的提示信息
			oncomplete(req)                                         请求完成处理(返回true /String 决定了是否显示错误) req 格式化的请求返回对象 返回字符串提示错误的类型 返回 true表示验证通过
			onerror:"请求失败"                                      服务器请求失败的提示
			方法
			getAjaxValidator()                                      触发验证获取验证结果 true 为验证通过 否则返回验证失败的提示(注意此方法调用会使用同步触发)
                        属性
                        string  succesValue                                     验证成功的值
			
FORM.formValidator						表单设置
			参数
			onerror(array msg)                                      验证失败调用函数 参数为失败提示信息
			onsuccess()                                             通过校验后的函数 返回 true继续提交 false 停止提交表单
			