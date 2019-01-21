
mui.init({
	swipeBack:false
});
var severObj = new Object();

document.addEventListener("plusready",function(){
	xhr = new plus.net.XMLHttpRequest();
	xhr.timeout = 6000;  //ms
	xhr.onreadystatechange = function () {
    switch(xhr.readyState){
        case 0:break;
        case 1:break;
        case 2:break;
        case 3:break;
        case 4:
            if ( xhr.status == 200 ) {
            	severObj  =  JSON.parse(xhr.responseText);
				var area = new Vue({
					el: '#area',
					data: {cityObj: severObj},
					methods: {
						back: function(sever) {
							if(sever){
								mui.fire(plus.webview.currentWebview().opener(),'changeCity',{sever: sever});
							}
							mui.back();
						}
					}
				});
				document.querySelector('.mui-control-item').classList.add('mui-active');
				document.querySelector('.mui-control-content').classList.add('mui-active');
            } else {
            	console.log( "请求失败："+xhr.status );
            }
            break;
        default :break;
    }
	}
	xhr.open("GET", "http://139.224.66.204:9090/chooseCity.json");
	xhr.send();
},false)

//mui.getJSON('../json/chooseCity.json',function(data){
//		severObj = data;
//		var area = new Vue({
//			el: '#area',
//			data: {cityObj: severObj},
//			methods: {
//				back: function(sever) {
//					if(sever){
//						mui.fire(plus.webview.currentWebview().opener(),'changeCity',{sever: sever});
//					}
//					mui.back();
//				}
//			}
//		});
//		document.querySelector('.mui-control-item').classList.add('mui-active');
//		document.querySelector('.mui-control-content').classList.add('mui-active');
//	}
//);