var userInfo = localStorage.getItem("userInfo");
userInfo = JSON.parse(userInfo);
var pageAll = 1; 											//全部分页页数
var pageOnline = 1; 										//在线分页页数
var pageOffline = 1; 										//离线分页页数
var pageWarn = 1; 											//报警分页页数
var pageSize = 10; 											//每页条数
var alarmStyle = localStorage.getItem('alarmStyle'); 		//报警类型
if(!alarmStyle){
	alarmStyle = '';
}
//console.log(alarmStyle);
var statusType = 0;
var allList='',onlineList='',outlineList='',alarmList='';
var allEle=null,onlineEle=null,outlineEle=null,alarmEle=null,commonEle=null;
var allBadge=null,onlineBadge=null,outlineBadge=null,alarmBadge=null,commonBadge=null;
var listValue=null;
var imgUrl = null;
var statusClass = null;
var car_ss = null;
mui.init();
var deceleration = mui.os.ios ? 0.003 : 0.0009;
mui('.mui-scroll-wrapper').scroll({
	bounce: false,
	indicators: true, //是否显示滚动条
	deceleration: deceleration
});
mui.ready(function() {
	//循环初始化所有下拉刷新，上拉加载。
	mui.each(document.querySelectorAll('.mui-slider-group .mui-scroll'), function(index, pullRefreshEl) {
		mui(pullRefreshEl).pullToRefresh({
			down: {
				callback: function() {
					var self = this;
					var index = this.element.getAttribute('data-item');									
					setTimeout(function() {
						get_car_status_list(index, false);
						self.endPullDownToRefresh();
					}, 1000);
				}
			},
			up: {
				callback: function() {
					var self = this;					
					var index = this.element.getAttribute('data-item');
					setTimeout(function() {
						get_car_status_list(index, false);
						self.endPullUpToRefresh();
					}, 1000);
				}
			}
		});
	});
	
	mui('.mui-content').on('tap','.mui-control-item',function(){
		var index = this.dataset.index;
		get_car_status_list(index,false);
	});
	mui('.ListDiv').on('tap','.listData',function(){
		var currentObjectID = this.dataset.item;
		var mainpage = plus.webview.getWebviewById('screenPage/mainPage.html');				
		if(mainpage){
			mui.fire(mainpage,'changeCar',{currentObjectID: currentObjectID});
		}
		mui.back();
	});
	get_car_status_list(0);
	
});

var re_t = false;
function request_timeout(){
	re_t = true;
	setTimeout(function(){
		re_t = false;
	},500);
}

function get_car_status_list(Index, isFirst){
	if(re_t)return;
	request_timeout();
	
	var pageIndex = 1;
	if(Index === undefined || Index === "undefined") {
		Index = 0;
	}	
	if(Index == 0) {				//全部
		statusType = 0;
		pageIndex = pageAll;	
		commonEle = mui('#allList .ListDiv')[0];
	} else if(Index == 1) {		//报警
		statusType = 1;
		pageIndex = pageWarn;
		commonEle = mui('#alarmList .ListDiv')[0];
	} else if(Index == 2) {		//在线
		statusType = 2;
		pageIndex =  pageOnline;
		commonEle = mui('#onlineList .ListDiv')[0];		
	} else if(Index == 3) {		//离线
		statusType = 3;
		pageIndex = pageOffline;
		commonEle = mui('#outlineList .ListDiv')[0];			
	}
//	console.log(WebApi + '/api/Vehicle/GetActiveTracksListByUserID?searchString='+''+'&userID='+userInfo.Data.UserID+'&alarmType=' + alarmStyle+'&pageSize='+pageSize+'&pageIndex='+pageIndex+'&statusType='+statusType+'&key='+appLoginKey);
	mui.ajax(WebApi + '/api/Vehicle/GetActiveTracksListByUserID?searchString='+''+'&userID='+userInfo.Data.UserID+'&alarmType=' + alarmStyle+'&pageSize='+pageSize+'&pageIndex='+pageIndex+'&statusType='+statusType+'&key='+appLoginKey,{
		headers:{'Content-Type':'application/json'},             
		dataType:"json",
		type:"POST",
		success:function(data,textStatus,xhr){
			if(data.State == 1){  //console.log(JSON.stringify(data));
				mui('[href="#allList"] .mui-badge')[0].innerText = data.DataCount;
				mui('[href="#onlineList"] .mui-badge')[0].innerText = data.OnLineCount;
				mui('[href="#outlineList"] .mui-badge')[0].innerText = data.UnLineCount;
				mui('[href="#alarmList"] .mui-badge')[0].innerText = data.AlarmCount;
				
				data.Data.forEach(function(item){									
					$.ajax({
				        url: 'http://api.map.baidu.com/geocoder/v2/?ak=YpPYDb9u47Zvs6AElUqiTKtyZkpeEw20' + '&callback=renderReverse&location=' + item.offsetLat + ',' + item.offsetLon + '&output=json&pois=1&coordtype=bd09ll',
				        type: 'post',
				        dataType: 'jsonp',
				        async: true,
				        success: function (json) {
				            if (json != null || json != undefined) {
				                var address = json.result.formatted_address + ',' + json.result.sematic_description;
				                
				                var itemString = item.ObjectID;
								item.car_ss = "在线";
								if(item.CarStatusStr.indexOf('报警')>-1 || item.StatusDes.indexOf('报警')>-1){
									item.car_ss = "报警";
									imgUrl = '../img/images/cardetail_08.png';
									statusClass = 'redBox';
								}else if(item.CarStatusStr.indexOf('在线')>-1){
									if(item.Speed == 0){
										item.car_ss = "停车";
										imgUrl = '../img/images/cardetail__01.png';
										statusClass = 'blueBox';
									}else{
										item.car_ss = "行驶";
										imgUrl = '../img/images/cardetail_03.png';
										statusClass = 'greenBox';
									}									
								}else if(item.CarStatusStr.indexOf('离线')>-1){
									if(item.Speed == 0){
										item.car_ss = "停车";
										imgUrl = '../img/images/cardetail__01.png';
										statusClass = 'blueBox';
									}else{
										item.car_ss = "行驶";
										imgUrl = '../img/images/cardetail_06.png';
										statusClass = 'greyBox';
									}							
								}
				                
				                listValue = '<div class="listData" data-item='+ itemString +'>'+
												'<p>'+
													'<img src='+ imgUrl +' alt="车标"/>'+
													'<span>'+item.VehicleNum+'</span>'+
													'<a class='+ statusClass +'>'+ item.car_ss+'</a>'+
												'</p>'+
												'<ul>'+
													'<li><span>速度:</span><span>'+item.Speed+'km/h</span></li>'+
													'<li><span>方向:</span><span>'+item.DirectStr+'</span></li>'+
													'<li><span>'+item.DurationStatus+':</span><span>'+item.Duration+'</span></li>'+
													'<li><span>时间:</span><span>'+item.GPSTime+'</span></li>'+					
													'<li><span>状态: &nbsp;'+item.StatusDes+'</span></li>'+
													'<li><span class="itemAdress">'+address+'</span></li>'+
												'</ul>'+
											'</div>';
								commonEle.innerHTML += listValue;															
				            }
				        }
				    });																								
				});	
				if(Index == 0){
					pageAll++;
				}else if(Index == 1){
					pageWarn++;
				}else if(Index == 2){
					pageOnline++;
				}else{
					pageOffline++;
				}
			}else{
				alert(data.Message);
			}			
		},
		error:function(xhr,type,errorThrown){
			
			console.log(type);
		}
	});
	
}
