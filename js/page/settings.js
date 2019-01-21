mui.init({
	swipeBack:false
});

//document.addEventListener('plusready',function () {    
//      
//},false);

mui.ready(function(){
	
	if(mui.os.ios){
		mui(".hideChange")[0].style.display = "none";
	}
	
	mui('#setting_three').on('tap','.item_settings',function(){
		var choice = this.getAttribute("choice");
		if("1" == choice){
			console.log("监控设置");
			mui.openWindow({
			    url: 'monitorSetting.html', 
			    id: 'monitorSetting.html'
			});
			
		}else if("2" == choice){
//			console.log("关于");			
			mui.toast('当前版本为：' + plus.runtime.version);
			
		}else if("3" == choice){
//			console.log("检查更新");
			
			check_version();
		}else if("4" == choice){
//			console.log("退出当前账号");
			
			if(typeof plus == "undefined"){
				return;
			}
			var ws = plus.webview.currentWebview();
			
			var indexWeb = plus.webview.getWebviewById(plus.runtime.appid);
			var mainpage = plus.webview.getWebviewById('screenPage/mainPage.html');
			indexWeb.show();
			plus.webview.close(mainpage,"none");
			plus.webview.close(ws.id,"none");
		}
	})
})
