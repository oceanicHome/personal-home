var Config={
	HttpList : {
    	"hubei01":"http://139.224.187.58:5953/api.ashx",		//三一
    	"hubei06":"http://139.224.65.72:5953/api.ashx"			//HNT
    }
};


//var WebApi = "http://139.224.66.204:9099";      //外网(正式)
var WebApi = "http://139.224.66.204:9090"; 		 //外网(测试)
//var WebApi = "http://192.168.1.119:8808";  //内网
var appLoginKey = 'E73D905A94D65EE5CBB149EDC24DDC89';

var out_check = 6666;
var multi_monitor = false;		//是否有多车调度权限






//格式化时间
Date.prototype.DatePattern = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份        
		"d+": this.getDate(), //日        
		"h+": this.getHours() % 24 == 0 ? 24 : this.getHours() % 24, //小时        
		"H+": this.getHours(), //小时        
		"m+": this.getMinutes(), //分        
		"s+": this.getSeconds(), //秒        
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度        
		"S": this.getMilliseconds() //毫秒    
	};
	var week = {
		"0": "\u65e5",
		"1": "\u4e00",
		"2": "\u4e8c",
		"3": "\u4e09",
		"4": "\u56db",
		"5": "\u4e94",
		"6": "\u516d"
	};
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if(/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
	}
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

function changeTU(data){
   if(data == '') return;
   var str =''; 
   for(var i=0;i<data.length;i++)
   {
      str+="\\u"+parseInt(data[i].charCodeAt(0),10).toString(16);
   }
   return str;}
function changeTZ(data){
    if(data == '') return;
    data = data.split("\\u");
    var str ='';
    for(var i=0;i<data.length;i++)
    {
        str+=String.fromCharCode(parseInt(data[i],16).toString(10));
    }
    return str;}
Date.prototype.changeTofilter = function(s1,s2){
	// 比如需要这样的格式 yyyy-MM-dd hh:mm:ss
	var date = this;
	var Y = date.getFullYear() + s1;
	var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + s1;
	var D = date.getDate() + 'HQ';
	var h = date.getHours() + s2;
	var m = date.getMinutes() + s2;
	var s = date.getSeconds();
	return Y+M+D+h+m+s;}
function compileStr(code){
  var c=String.fromCharCode(code.charCodeAt(0)+code.length);
 for(var i=1;i<code.length;i++)
  {      
   c+=String.fromCharCode(code.charCodeAt(i)+code.charCodeAt(i-1));
 }   
 return escape(c);}
function uncompileStr(code){
 code=unescape(code);
 var c=String.fromCharCode(code.charCodeAt(0)-code.length);      
 for(var i=1;i<code.length;i++)
 {      
  c+=String.fromCharCode(code.charCodeAt(i)-c.charCodeAt(i-1));      
 }      
 return c;}