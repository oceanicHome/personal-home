var switchList = localStorage.getItem('switchList-ms');   //记录switch开关状态(数组)
var alarmTypeList = [];									  //记录开关为true时的报警类型值
var currentFreshTime = localStorage.getItem('currentFreshTime');	//默认刷新时长

//console.log(switchList);
mui.init({
	swipeBack:false
});
mui.ready(function(){
	if(!switchList){
		switchList = ['true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true','true'];   //console.log(1);
	}else{
		switchList = JSON.parse(switchList);  //console.log(2);
	}
	
	if(!currentFreshTime || currentFreshTime == ''){
		mui('#currentFreshTime')[0].value = 30;
	}else{
		mui('#currentFreshTime')[0].value = Number(currentFreshTime)/1000;
	}
	
	mui('.mui-content .mui-switch').each(function(index) { //循环所有toggle
	//	console.log(index);
		if(switchList[index] == 'true'){
			this.classList.add('mui-active');
		}				
	});
	
	var old_back = mui.back;
	mui.back = function(){
		switchList = [];
		mui('.mui-content .mui-switch').each(function() { //循环所有toggle	
			var alarmValue = this.parentNode.querySelector('span').innerText;
			var switchValue = this.classList.contains('mui-active') ? 'true' : 'false';
			switchList.push(switchValue);			
			if(switchValue == 'false'){
				alarmTypeList.push(alarmValue);
			}			
		});
		currentFreshTime = (mui('#currentFreshTime')[0].value)*1000;
		alarmTypeList = alarmTypeList.join(',');
//		console.log(typeof alarmTypeList);
//		if(alarmTypeList == ''){
//			console.log(1);
//		}
//		console.log(switchList);console.log(alarmTypeList);
		localStorage.setItem('switchList-ms',JSON.stringify(switchList));
		localStorage.setItem('alarmStyle',alarmTypeList);
		localStorage.setItem('currentFreshTime',currentFreshTime);
		
		var mainpage = plus.webview.getWebviewById('screenPage/mainPage.html');
		if(mainpage){
			mui.fire(mainpage,'changeSettingUp',{alarmStyle: alarmTypeList,currentFreshTime: currentFreshTime});
		}
		
		old_back();
	};
});
