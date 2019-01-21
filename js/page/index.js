var checkboxBlue = document.getElementById("checkbox-blue");
var checkboxInto = document.getElementById("checkbox-into")
mui.init({
	swipeBack:false
});

document.addEventListener("plusready",function(){
	if(localStorage.getItem("remeberPws") == "1"){
		mui('#checkbox-blue')[0].checked = true;
		mui('#usr')[0].value = localStorage.getItem("username");
		if(localStorage.getItem("password")){
			mui('#pwd')[0].value = uncompileStr(localStorage.getItem("password"));
//			console.log(mui('#pwd')[0].value);
		}
	}
	
	if(localStorage.getItem("remeberPws") == "1" && localStorage.getItem("enterAuto") == "1"){
		checkboxInto.checked = true;
		login();
	}
	
	setTimeout(function(){
		plus.navigator.closeSplashscreen();
	},200);
},false)

mui.ready(function(){
	var defaultAPI = {title: "湖北省1区", api: "http://139.224.66.204:9099", multi: false};
	var region = null;
	if(!localStorage.getItem("region")){
		region = defaultAPI;
	}else{
		region = JSON.parse(localStorage.getItem("region"));
	}
	//设置区域
	mui('#region')[0].value = region.title;
	WebApi = region.api;
	multi_monitor = region.multi;
	console.log(JSON.stringify(region));	
	mui('#login_div').on('tap','#login_btn',function(){
		login();
	});
	
	mui('ul').on('tap','#enterChooseCity',function(){
		clicked('screenPage/chooseCity.html');
	});
	
	mui('.labelBox').on('tap','.lab1',function(){ 
//		console.log(checkboxBlue.checked);
		if(checkboxBlue.checked){		
			localStorage.removeItem("remeberPws");
		}else{			
			localStorage.setItem("remeberPws",'1');
		}		
	})
	
	mui('.labelBox').on('tap','.lab2',function(){ 
//		console.log(checkboxInto.checked);
		if(checkboxInto.checked){			
			localStorage.removeItem("enterAuto");
		}else{		
			localStorage.setItem("enterAuto",'1');
		}		
	})
	
	window.addEventListener("changeCity", function(e) {
		var sever = e.detail.sever
        mui('#region')[0].value = sever.title;
        WebApi = sever.api;
        multi_monitor = region.multi;
        localStorage.setItem("region",JSON.stringify(sever));
        console.log(WebApi);
    });
});

function remeberPws(e){
	if(e){
		localStorage.setItem("remeberPws",'1');
	}else{
		localStorage.removeItem("remeberPws");
	}
}

function login(){
	var username = mui('#usr')[0].value;
	var password = mui('#pwd')[0].value;
	
	
	mui.ajax(WebApi + '/api/user/login?username='+escape(username)+'&userPass='+password+'&key='+appLoginKey,{
		headers:{'Content-Type':'application/json'},             
		dataType:"json",
		type:"POST",
		timeout:out_check,
		success:function(data,textStatus,xhr){
			if(data.State == 1){
				var psd = compileStr(password);
				localStorage.setItem("username",username);
				localStorage.setItem("password",psd);
				localStorage.setItem("userInfo",JSON.stringify(data));

//				console.log(JSON.stringify(data));
				
				clicked('screenPage/mainPage.html',true,'fade-in');
				plus.webview.currentWebview().hide();
			}else{
				alert(data.Message);
			}
			
		},
		error:function(xhr,type,errorThrown){
			//异常处理；
			console.log(type);
			alert('请求超时，请检查网络!');
		}
	});
}