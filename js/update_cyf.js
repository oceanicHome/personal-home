document.addEventListener( "plusready", function(){
	localStorage.setItem("app_version",plus.runtime.version);
	localStorage.setItem("app_id",plus.runtime.appid);
	localStorage.setItem("app_platform",plus.os.name);
	
//	njsAlertForAndroid();
//	njsAlertForios();
}, false );


function njsAlertForAndroid(){
	// 导入AlertDialog类
	var AlertDialog = plus.android.importClass("android.app.AlertDialog");
	// 创建提示框构造对象，构造函数需要提供程序全局环境对象，通过plus.android.runtimeMainActivity()方法获取
	var dlg = new AlertDialog.Builder(plus.android.runtimeMainActivity());
	// 设置提示框标识
	dlg.setTitle("自定义标题");
	dlg.setMessage("使用NJS的原生弹出框，可自定义弹出框的标题、按钮");
	dlg.setPositiveButton("确定（或者其他字符）",null);
	dlg.show();
}

function njsAlertForios(){
	var UIAlertView = plus.ios.importClass("UIAlertView");
	var view = new UIAlertView();
	view.initWithTitlemessagedelegatecancelButtonTitleotherButtonTitles("自定义标题","使用NJS的原生弹出框，可自定义弹出框的标题、按钮",null,"确定（或者其他字符）",null);
	view.show();
}

function dealData(data,state_v){
	var app_version = localStorage.getItem("app_version");
	var app_id = localStorage.getItem("app_id");
	var app_platform = localStorage.getItem("app_platform");
	
	var ws=null,o_view=null,t_view=null;
	if(app_platform === "Android"){
	//	console.log(data.version_android);console.log(app_version);
		if (app_version<data.version_android) {
			localStorage.setItem("check_msg",data.msg);
			localStorage.setItem("check_url",data.url_android);
			ws=plus.webview.currentWebview();
			t_view = plus.webview.create('pop_cfir_btwo.html','sub',{height:'100%',width:'100%',background:'transparent',position:'absolute',top:'0',left:'0'});
			ws.append(t_view);
	    } else{
	    	if(state_v)return;
			ws=plus.webview.currentWebview();
			o_view = plus.webview.create('pop_cfir_bone.html','sub',{height:'100%',width:'100%',background:'transparent',position:'absolute',top:'0',left:'0'});
			ws.append(o_view);
	    }
	}else{
		if (app_version<data.version_ios) {
			localStorage.setItem("check_msg",data.msg);
			localStorage.setItem("check_url",data.url_ios);
			ws=plus.webview.currentWebview();
			t_view = plus.webview.create('pop_cfir_btwo.html','sub',{height:'100%',width:'100%',background:'transparent',position:'absolute',top:'0',left:'0'});
			ws.append(t_view);	
	    } else{
	    	if(state_v)return;
	    	ws=plus.webview.currentWebview();
			o_view = plus.webview.create('pop_cfir_bone.html','sub',{height:'100%',width:'100%',background:'transparent',position:'absolute',top:'0',left:'0'});
			ws.append(o_view);
	    }
	}
}


function check_version(state_v){
	if(typeof plus === 'undefined'){return;}
	xhr = new plus.net.XMLHttpRequest();
	xhr.timeout = out_check;  //ms
	xhr.onreadystatechange = function () {
    switch(xhr.readyState){
        case 0:break;
        case 1:break;
        case 2:break;
        case 3:break;
        case 4:
            if ( xhr.status == 200 ) {
            	var data  = xhr.responseText;
            	var json=eval("("+data+")");
            	dealData(json,state_v);
            } else {
            	console.log( "请求失败："+xhr.status );
            }
            break;
        default :break;
    }
	}
	xhr.open("GET", "http://139.224.65.72:9910/jycl.json");
	xhr.send();
}
