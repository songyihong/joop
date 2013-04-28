/* 
 * 日期时间选择控件 石卓林 2009-10-27
 * and open the template in the editor.
 */
var Calendar = {
    _config:{
        weekday:['日','一','二','三','四','五','六'],
        dateFormat:'y-m-d',
        timeFormat:'h:n:s',
        dateTimeFormat:'y-m-d h:n:s',
        nowDateTime:new Date()
    },
    _Einput:null,
    _Case:null,
    _DateTable:null,
    _DateTableBar:null,
    _TimeTable:null,
    _NowDateTime:null,
    _Hours:null,
    _Minutes:null,
    _Seconds:null,
    _Mode:null,
    _PowerHide:true,
    dateTime:function(event){
        Calendar._Einput = $(Event.element(event));
        Calendar._initialize(0);
    },
    date:function(event){
        Calendar._Einput = $(Event.element(event));
        Calendar._initialize(1);
    },
    time:function(event){
        Calendar._Einput = $(Event.element(event));
        Calendar._initialize(2);
    },
    setConfig:function(cf){
        Calendar._config = Object.extend(Calendar._config,cf);
        return this;
    },
    _initialize:function(mode){
        var nowDateTime     = new Date(Calendar._config.nowDateTime.toString());
        var snowDateTime    = Calendar._Einput.getValue();
        var datetimeformat  = Calendar._config.dateTimeFormat.toString();
        var dateformat      = Calendar._config.dateFormat.toString();
        var timeformat      = Calendar._config.timeFormat.toString();
        var offsets         = Calendar._Einput.getPositionedOffsets();
        var dimensions      = Calendar._Einput.getDimensions();
        Calendar._Mode   = mode;
        Calendar._NowDateTime = nowDateTime.formatParse(datetimeformat,snowDateTime) || nowDateTime.formatParse(dateformat,snowDateTime) || nowDateTime.formatParse(timeformat,snowDateTime) || nowDateTime;
        Calendar._createPanel();
        Calendar._updateDate();
        Calendar._showPanel();
        Calendar._Case.setStyle({left:offsets.left+'px',top:offsets.top+dimensions.height+'px'});
        Calendar._Einput.removeEvent("blur",Calendar._hidePanel);
        Calendar._Einput.addEvent("blur",Calendar._hidePanel);
        Calendar._DateTableBar.show('table');
        Calendar._DateTable.show('table');
        Calendar._TimeTable.show('table');
        if(mode==1)Calendar._TimeTable.hide();
        if(mode==2){Calendar._DateTableBar.hide();Calendar._DateTable.hide()}
    },
    _showPanel:function(){
        Calendar._Case.show();
    },
    _hidePanel:function(){
        if(Calendar._PowerHide)Calendar._Case.hide();
    },
    _updateDate:function(){
        var chknowDateTime = new Date(Calendar._NowDateTime.toString());
        var nowdate = chknowDateTime.getDate();
        Calendar._DateTableBar.rowsExt[0].cellsExt[2].setInnerText(chknowDateTime.getFullYear()+'年');
        Calendar._DateTableBar.rowsExt[0].cellsExt[3].setInnerText(chknowDateTime.getMonth()+1+'月');
        chknowDateTime.setDate(1);
        var startTdIndex = chknowDateTime.getDay(),nowMonth = chknowDateTime.getMonth(),date = 0;
        Calendar._DateTable.rowsExt.each(function(tr,i){
            tr.cellsExt.each(function(td,j){
                if(i>0)td.setStyle({backgroundColor:'transparent',color:'#333',cursor:'default'}).setInnerText('').removeEvent("mouseover",Calendar._selected).removeEvent("mouseout",Calendar._selected_).removeEvent("click",Calendar._selectDate);
                if(j==0)td.setStyle({color:'#900'});
                if(j==6)td.setStyle({color:'#090'});
                if((i>0 && j>=startTdIndex) || i>1){
                    date++;
                    chknowDateTime.setMonth(nowMonth);
                    chknowDateTime.setDate(date);
                    if(nowMonth==chknowDateTime.getMonth()){
                        td.setInnerText(chknowDateTime.getDate()).setStyle({backgroundColor:'#E5E9F2',cursor:'pointer'}).addEvent("mouseover",Calendar._selected).addEvent("mouseout",Calendar._selected_).addEvent("click",Calendar._selectDate);
                        if(nowdate==date)td.setStyle({backgroundColor:'#abc',color:'#f00'}).removeEvent("mouseover",Calendar._selected).removeEvent("mouseout",Calendar._selected_);
                    }
                }
            })
        });
        Calendar._Hours.selectedIndex = Calendar._NowDateTime.getHours();
        Calendar._Minutes.selectedIndex = Calendar._NowDateTime.getMinutes();
        Calendar._Seconds.selectedIndex = Calendar._NowDateTime.getSeconds();
    },
    _setHours: function(event){
        Calendar._NowDateTime.setHours(Event.element(event).getValue());
        Calendar._setDate();
    },
    _setMinutes:function(event){
        Calendar._NowDateTime.setMinutes(Event.element(event).getValue());
        Calendar._setDate();
    },
    _setSeconds:function(event){
        Calendar._NowDateTime.setSeconds(Event.element(event).getValue());
        Calendar._setDate();
    },
    _getSelectNum:function(start,end,now){
        var select = $(document.createElement('SELECT'));
        select.addEvent('focus',function(){
            Calendar._Case.removeEvent('mouseover',Calendar._caseOver);
            Calendar._Case.removeEvent('mouseout',Calendar._caseOut);
            Calendar._PowerHide=false;
            Calendar._showPanel();
        });
        select.addEvent('blur',function(){
            Calendar._Case.addEvent('mouseover',Calendar._caseOver);
            Calendar._Case.addEvent('mouseout',Calendar._caseOut);
            Calendar._PowerHide=true;
            Calendar._showPanel();
        });
        for(start;start<=end;start++)
            select.options[select.options.length]=new Option(start,start);
        return select;
    },
    _setDate:function(){
        Calendar._Einput.setValue(Calendar._NowDateTime.formatParse(Calendar._Mode==0? Calendar._config.dateTimeFormat:(Calendar._Mode==1? Calendar._config.dateFormat:Calendar._config.timeFormat)));
    },
    _selected:function(event){
        Event.element(event).setStyle({
            backgroundColor:'#abc'
        });
    },
    _selected_:function(event){
        Event.element(event).setStyle({
            backgroundColor:'#E5E9F2'
        });
    },
    _selectDate:function(event){
        Calendar._NowDateTime.setDate(parseInt(Event.element(event).getInnerText()));
        Calendar._updateDate();
        Calendar._setDate();
    },
    _freviousYear:function(){
        Calendar._NowDateTime.setFullYear(Calendar._NowDateTime.getFullYear()-1);
        Calendar._updateDate();
        Calendar._setDate();
    },
    _nextYear:function(){
        Calendar._NowDateTime.setFullYear(Calendar._NowDateTime.getFullYear()+1);
        Calendar._updateDate();
        Calendar._setDate();
    },
    _freviousMonth:function(){
        Calendar._NowDateTime.setMonth(Calendar._NowDateTime.getMonth()-1);
        Calendar._updateDate();
        Calendar._setDate();
    },
    _nextMonth:function(){
        Calendar._NowDateTime.setMonth(Calendar._NowDateTime.getMonth()+1);
        Calendar._updateDate();
        Calendar._setDate();
    },
    _getDateTableBar:function(){
        var tdstyle = {width:'28px',textAlign:'center',cursor:'pointer'};
        var DateTableBar = $(document.createTable(1,6)).setStyle({borderCollapse:'collapse',backgroundColor:'#A5B8D6',width:'100%',height:'22px'});
        DateTableBar.rowsExt[0].cellsExt[0].setInnerText('<<').setStyle(tdstyle).addEvent('click',Calendar._freviousYear);
        DateTableBar.rowsExt[0].cellsExt[1].setInnerText('<').setStyle(tdstyle).addEvent('click',Calendar._freviousMonth);
        DateTableBar.rowsExt[0].cellsExt[4].setInnerText('>').setStyle(tdstyle).addEvent('click',Calendar._nextMonth);
        DateTableBar.rowsExt[0].cellsExt[5].setInnerText('>>').setStyle(tdstyle).addEvent('click',Calendar._nextYear);
        return DateTableBar;
    },
    _getDateTable:function(){
        var DateTable = $(document.createTable(7,7)).setStyle({borderCollapse:'collapse',width:'100%'});
        DateTable.rowsExt.each(function(tr){
            tr.cellsExt.each(function(td,i){
                td.setStyle({border:'1px solid #cde',textAlign:'center',lineHeight:'20px',height:'20px'});
            });
        });
        this._config.weekday.each(function(day,i){
            DateTable.rowsExt[0].cellsExt[i].setStyle({backgroundColor:'#cde'}).setInnerText(day)
        });
        return DateTable;
    },
    _getTimeTable:function(){
        var TimeTable = $(document.createTable(1,3)).setStyle({borderCollapse:'collapse',width:'100%'});
        TimeTable.rowsExt[0].cellsExt.each(function(td){
            td.setStyle({border:'1px solid #cde',textAlign:'center',lineHeight:'30px',height:'30px'});
        });
        Calendar._Hours = Calendar._getSelectNum(0,23).addEvent('change',Calendar._setHours);
        Calendar._Minutes= Calendar._getSelectNum(0,59).addEvent('change',Calendar._setMinutes);
        Calendar._Seconds=Calendar._getSelectNum(0,59).addEvent('change',Calendar._setSeconds);
        TimeTable.rowsExt[0].cellsExt[0].setInnerText('时:').appendChildExt(Calendar._Hours);
        TimeTable.rowsExt[0].cellsExt[1].setInnerText('分:').appendChildExt(Calendar._Minutes);
        TimeTable.rowsExt[0].cellsExt[2].setInnerText('秒:').appendChildExt(Calendar._Seconds);
        return TimeTable;
    },
    _caseOut:function(event){
        Calendar._PowerHide = true;
        Calendar._hidePanel();
        Calendar._Einput.addEvent("blur",Calendar._hidePanel);
        Calendar._Einput.blur();
    },
    _caseOver:function(event){
        Calendar._showPanel();
        Calendar._Einput.removeEvent("blur",Calendar._hidePanel);
        Calendar._PowerHide = false;
    },
    _createPanel:function(){
        if(Calendar._Case)return;
        Calendar._DateTableBar = Calendar._getDateTableBar();
        Calendar._DateTable = Calendar._getDateTable();
        Calendar._TimeTable = Calendar._getTimeTable();
        Calendar._Case = $(document.createElement("div"));
        Calendar._Case.setStyle({position:'absolute',width:'204px',backgroundColor:'#fff'});
        Calendar._Case.appendChildExt(Calendar._DateTableBar);
        Calendar._Case.appendChildExt(Calendar._DateTable);
        Calendar._Case.appendChildExt(Calendar._TimeTable);
        Calendar._Case.addEvent('mouseover',Calendar._caseOver);
        Calendar._Case.addEvent('mouseout',Calendar._caseOut);
        $(document.body).appendChildExt(Calendar._Case);
    }
}