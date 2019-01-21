var trackData = JSON.parse(localStorage.getItem('trackData'));
var Data = trackData.Data; 	//console.log(Data);
var Points = [];												//百度历史轨迹经纬度数组
var NoZeroData = [];											//去除速度为0的数据数组
var NoZeroPoints = [];											//去除速度为0的百度经纬度点数组
var NoZeroItIndex = {};											//无0数据对应的有0数组中的it
var NoZeroStatus = 1;											//播放状态,1无0速度播放,0有0播放
var status = 0;													//播放状态,0起始,1播放,2暂停,3停止
var trackPlayPage;												//轨迹播放主页面
mui.init({
	swipeBack:false
});
mui.ready(function(){
	
	$('#topTime').html(Data[0].GPSTime);
	$('#trackSpeed').html(Data[0].Speed+'km/h');
	$('#trackMile').html('0km');
	$('#trackDirection').html(Data[0].DirectStr);
	$('#trackOil').html(Data[0].OilNum+'L');
	
	initDate(Data);		
		
	if(mui('.mui-switch')[0].classList.contains('mui-active')){
		$("#block-range").prop("max",NoZeroData.length);
	}else{
		$("#block-range").prop("max",Data.length);
	}
	
	var range = document.getElementById("block-range");
	range.addEventListener("input",function(e){
	//	dragTrack(parseInt(this.value));
		trackPlayPage= plus.webview.getWebviewById('track_play');
		var rangeValue = parseInt(this.value);
		var switchValue = mui('.mui-switch')[0].classList.contains('mui-active') ? true : false;
		mui.fire(trackPlayPage,'dragTrack',{		//触发主页面拖动进度条方法
			rangeValue: rangeValue,
			switchValue: switchValue
		})
	});
	
	mui('#trackBox').on('tap','#centerControl',function(){
//		console.log('点到我了');
		var switchValue = mui('.mui-switch')[0].classList.contains('mui-active') ? true : false;
		var leng = Data.length;
		if(leng == 0){
//			console.log('a');
			return;
		}
		if (status == 0) {	//第一次点击播放按钮
//			console.log(status);
            status = 1;
            $("#centerControl").attr("src","../img/images/stop_03.png");          
        }else if(status == 1){							//播放状态,点击后变成播放按钮,暂停播放
        	status = 2;
            $("#centerControl").attr("src","../img/images/play_18.png");          
        }else if(status ==2 ){							//暂停状态,点击后变成暂停按钮,播放轨迹
        	status = 1;
        	$("#centerControl").attr("src","../img/images/stop_03.png");          
    	}
		trackPlayPage= plus.webview.getWebviewById('track_play');
		mui.fire(trackPlayPage,'playTrack',{
			status: status,
			switchValue: switchValue
		});
	})
	mui('#trackBox').on('tap','#rightControl',function(){
		trackPlayPage= plus.webview.getWebviewById('track_play');
		mui.fire(trackPlayPage,'playFast',{});
	});
	mui('#trackBox').on('tap','#leftControl',function(){
		trackPlayPage= plus.webview.getWebviewById('track_play');
		mui.fire(trackPlayPage,'playSlow',{});
	});
})

function initDate(Data){
//	console.log(Data);
//	console.log(JSON.stringify(Data[0]));
	var count = 0;
	for(var i=0;i<Data.length;i++){	
		if(Data[i].Speed !== 0){
	//		console.log(Data[i].Speed);
			NoZeroData.push(Data[i]);	
		}
	}			
}

//数据展示
window.addEventListener('dataShow',function(event){
//	console.log('触发了dataShow');
	var param = event.detail.param;	
	var paramPoint = event.detail.point;
	var totalMile = event.detail.totalMile;
//	console.log(param);	
	var adress = null;		
	plus.maps.Map.reverseGeocode(paramPoint,{},function(event){
		adress = event.address;
		$('#trackAdress').html(adress);
	},function(e){
		alert("Failed:"+JSON.stringify(e));
	});
	$("#topTime").html(param.GPSTime ? param.GPSTime : new Date().toLocaleDateString());
	$("#trackSpeed").html(parseFloat(param.Speed).toFixed(1)+'km/h');
	$("#trackDirection").html(param.DirectStr);
	$("#trackOil").html(parseFloat(param.OilNum).toFixed(1)+'L');
	$("#statusDescribe").html(param.StatusDes);
	$("#trackMile").html(parseFloat(totalMile).toFixed(1)+'km');	
})

//改变switch的值
window.addEventListener('changeSwitch',function(event){
	var value = event.detail.value;
	if(value){
		$(".mui-switch").removeClass("mui-active");
		$("#block-range").prop("max",Data.leng);
	}		
})
//改变range的值
window.addEventListener('changeRange',function(event){
	var value = event.detail.value;
	if(event.detail.myMark2){
		$("#block-range").val(value);
	}else{
		$("#block-range").prop("max",event.detail.value);	
	}
		
})
//改变centerControl的图片
window.addEventListener('changeImg',function(event){
//	console.log('进到changeImg');
	var value = event.detail.value;	
	$("#centerControl").attr("src", value);	
})
//改变status值
window.addEventListener('changeStatus',function(event){
	status = event.detail.value;
})
//子页面显示h5弹框
window.addEventListener('showView',function(event){
	var value = event.detail.value;
	mui.closePopup();
	mui.toast(value,{
		type: 'div'
	})
})
