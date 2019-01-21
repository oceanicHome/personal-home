var currentCarData = '' //当前车辆数据(全局变量)
var currentCarList = []	//当前账号下的车辆数据列表
var transitionCarList = [] ////当前账号下的车辆过度数据列表
$(function() {
			/*---------------全局变量 start---------------*/
			localStorage.removeItem('alarmData'); //打开app进入主页面后首先清除以前储存的报警数据
			var map = new BMap.Map("allmap"); //创建百度map对象
			var geoc = new BMap.Geocoder(); //获取Geocoder静态类
			var convertor = new BMap.Convertor(); //获取Convertor静态类
			var panoramaService = new BMap.PanoramaService(); //获取PanoramaService静态类
			var marker_init = null; //图标定位					
			var infoWindowState = false; //是for打开了信息窗				
			var infoBoxWindow = null;
			var personMarker = null;
			var iconMarker = '../img/direction/park_00.png';
			var toAdress = '';			//导航地理位置
			
			var alarmData = null; //主页面报警数据
			var alarmStyle = localStorage.getItem('alarmStyle'); //报警类型
			var endTime = new Date();
			var startTime = new Date(endTime.getTime() - 2 * 60 * 60 * 1000);
			endTime = endTime.changeTofilter('-', '-');
			startTime = startTime.changeTofilter('-', '-');		

			/*---------------全局变量 end---------------*/

			/*----------------2018-08-15-------------------------*/
			var dd_wait = false;	//避免短时间连续请求标识;
			var navigator_wait = false; //限制追车按钮点击频率
			var mark_wait = false;   //限制mark点击频率
			var info_mark = false;  //获取手机位置时，不能让左右按钮可以点的标记
			
			var timer1 = '' //单车定时器标记
			var timer2 = '' //多车定时器标记
			var currentObjectID = localStorage.getItem('currentObjectID'); //当前车辆ID
			var currentFreshTime = localStorage.getItem('currentFreshTime'); //当前车辆刷新时间
			var showType = 'single';  	 //single则显示单车，multi则显示多车
			var markers = [];			 //标注的数组
			var markerClusterer = null;  //点聚合对象

			if(!currentObjectID) {
				currentObjectID = 0;
			}
			if(!currentFreshTime) {
				currentFreshTime = 30000;
			}
			if(!alarmStyle) {
				alarmStyle = '';
			}
			/*----------------2018-08-15----------------------------------*/

			//初始化
			function init() {
				//地图初始化配置
				var param = {
					isTraffic: false,
					isScale: false,
					isMapType: true,
					point: {
						lng: 114.206232,
						lat: 30.557307
					}
				};
				$.map_init(map, param);
				var ctrl = new BMapLib.TrafficControl({
					showPanel: false //是否显示路况提示面板
				});
				map.addControl(ctrl);
				ctrl.setAnchor(BMAP_ANCHOR_TOP_RIGHT);
				
				map.addEventListener('moveend', function(){
					if(showType == 'multi'){
						showAreaCar();
					}
				})

				getOneCarMessage(0, true);

				timer1 = setInterval(function() {
					getNewestMessage();
				}, currentFreshTime)
				
				setTimeout(function(){
					caution_list(alarmStyle);   
				},200);
				setInterval(function(){
					caution_list(alarmStyle);
				},currentFreshTime);
			}

			/*事件绑定*/
			function bindEvent() {
				$('#rl_img_div .img_rl').click(function() {				
					if(dd_wait || info_mark){ return; }
					dd_wait = true;
					setTimeout(function(){ dd_wait = false; },500);
					var allt = $(this).attr('allt');
					
					if(showType == 'single'){
						console.log(1);
						getOneCarMessage(allt, false);
					}else if(showType == 'multi'){
						console.log(2);
						getMultiCarMessage(allt);
					}																
				});
				$('#car_two_btn .img_bb').click(function() {
				//	$(this).attr('allt') == 1 ? person_car_switch($(this)) : panorama_enter();
					if($(this).attr('allt') == 0){
						panorama_enter();
					}else if($(this).attr('allt') == 1){
						showType = 'single';
						showSingleCar();
					}else if($(this).attr('allt') == 2){
						showType = 'multi';
						showMultiCar();
					}else if($(this).attr('allt') == 3){
						showPersonPosition($(this));
					}
				});
			}

			function createMarker(currentCarData) {
				var point = new BMap.Point(114.206232, 30.557307);
				var icon = new BMap.Icon(iconMarker, new BMap.Size(24, 24));
				icon.imageSize = new BMap.Size(24, 24);
				marker_init = new BMap.Marker(point, {
					icon: icon
				});
				map.addOverlay(marker_init);
				marker_init.addEventListener('click', function() {	
					if(mark_wait){ return}
					mark_wait = true;
					setTimeout(function(){
						mark_wait = false;
					},500);
					if(!infoBoxWindow) {
						showInfoWindow();
					} else {
						infoBoxWindow.close();
						infoBoxWindow = null;
					}
				});
				marker_init.addEventListener('infowindowopen', function() {
					infoWindowState = true;
				});
				marker_init.addEventListener('infowindowclose', function() {
					infoWindowState = false;
				});
				marker_init.setZIndex(100);
				showInfoWindow();
			}
			//请求当前账号下的所有车辆
			function get_monitor_list(firstEnter) {
				//		console.log(WebApi + '/api/Vehicle/GetActiveTracksListByUserID?searchString='+''+'&userID='+userInfo.Data.UserID+'&pageSize='+0+'&pageIndex='+1+'&statusType='+0+'&key='+appLoginKey);
				mui.ajax(WebApi + '/api/Vehicle/GetActiveTracksListByUserID?searchString=' + '' + '&userID=' + userInfo.Data.UserID + '&pageSize=' + 0 + '&pageIndex=' + 1 + '&statusType=' + 0 + '&key=' + appLoginKey, {
					headers: {'Content-Type': 'application/json'},
					dataType: "json",
					type: "POST",
					success: function(data, textStatus, xhr) {
						//				console.log(JSON.stringify(data));
						if(data.State == 1) {
							
						} else {
							mui.toast(data.Message);
						}
					},
					error: function(xhr, type, errorThrown) {
						console.log(type);
					}
				});
			}
			//获取的单个车辆数据(上一个，下一个)；
			function getOneCarMessage(direction, firstEnter) { //direction：0查输入车辆id的车,1查下一辆车,2查上一辆车
//				console.log(WebApi + '/api/Vehicle/GetRealTimeByObjectID?objectid=' + currentObjectID + '&userid=' + userInfo.Data.UserID + '&direction=' + direction + '&alarmType=' + alarmStyle + '&key=' + appLoginKey);
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open("POST", WebApi + '/api/Vehicle/GetRealTimeByObjectID?objectid=' + currentObjectID + '&userid=' + userInfo.Data.UserID + '&direction=' + direction + '&alarmType=' + alarmStyle + '&key=' + appLoginKey, true);
				xmlhttp.send();
				xmlhttp.onreadystatechange = function() {
					if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			 //          console.log(xmlhttp.responseText);
						var data = JSON.parse(xmlhttp.responseText);
						if(data.State == 1) {
							$.getDirectionImg(data.Data, '../img/direction/');
							currentCarData = data.Data[0]; 
							currentObjectID = currentCarData.ObjectID;
							localStorage.setItem('currentObjectID', currentObjectID);
//							if(firstEnter) {
//								createMarker(currentCarData);
//							} else {
//								showInfoWindow();
//							}
							showInfoWindow();
							clearInterval(timer1); //获取下一辆车之后应该重新设置定时器
							timer1 = setInterval(function() {
								getNewestMessage();
							}, currentFreshTime);
						}else if(data.State == 0){
							if(direction == 1){
								mui.toast('已经是最后一辆车了');
							}else if(direction == 2){
								mui.toast('已经是第一辆车了');
							}
							
						}
					}					
				}
			}
			//获取多个车辆数据（上一个，下一个）
			function getMultiCarMessage(direction){
//				console.log(WebApi + '/api/Vehicle/GetRealTimeByObjectID?objectid=' + currentObjectID + '&userid=' + userInfo.Data.UserID + '&direction=' + direction + '&alarmType=' + alarmStyle + '&key=' + appLoginKey);
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open("POST", WebApi + '/api/Vehicle/GetMultiRealTimeByObjectID?objectid=' + currentObjectID + '&userid=' + userInfo.Data.UserID + '&direction=' + direction + '&alarmType=' + alarmStyle + '&key=' + appLoginKey, true);
				xmlhttp.send();
				xmlhttp.onreadystatechange = function() {
					if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			           console.log(xmlhttp.responseText);
						var data = JSON.parse(xmlhttp.responseText);
						if(data.State == 1) {
							var currentOneCar = data.Data.CurrList;
							currentCarList = data.Data.OtherList;
							$.getDirectionImg(currentOneCar, '../img/direction/');																									
							
							currentCarData = currentOneCar[0];
							currentCarList.push(currentCarData);
							transitionCarList = currentCarList;
							
							currentObjectID = currentCarData.ObjectID;
							localStorage.setItem('currentObjectID', currentObjectID);
													
							showInfoWindow();
							
							clearInterval(timer2); //获取下一辆车之后应该重新设置定时器
							timer2 = setInterval(function() {
								getNewestMessage2();
							}, currentFreshTime);
						}else if(data.State == 0){
							if(direction == 1){
								mui.toast('已经是最后一辆车了');
							}else if(direction == 2){
								mui.toast('已经是第一辆车了');
							}
							
						}
					}					
				}				
			}
			//获取的单个车辆最新数据
			function getNewestMessage() {
	//			console.log(WebApi + '/api/Vehicle/GetActiveTracksByObjectID?searchString=' + currentObjectID + '&userid=' + userInfo.Data.UserID + '&alarmType=' + alarmStyle + '&searchType=' + '0' + '&key=' + appLoginKey);
				mui.ajax(WebApi + '/api/Vehicle/GetActiveTracksByObjectID?searchString=' + currentObjectID + '&userid=' + userInfo.Data.UserID + '&alarmType=' + alarmStyle + '&searchType=' + '0' + '&key=' + appLoginKey, {
					headers: {'Content-Type': 'application/json'},
					dataType: "json",
					type: "POST",
					success: function(data, textStatus, xhr) {
				//		console.log(JSON.stringify(data));
						if(data.State == 1) {
							$.getDirectionImg(data.Data, '../img/direction/');
							currentCarData = data.Data[0];
							showInfoWindow();
						} else {
							mui.toast(data.Message);
						}
					},
					error: function(xhr, type, errorThrown) {
						console.log(type);
					}
				});
			}
			//获取多车最新数据
			function getNewestMessage2(){
				console.log(WebApi + '/api/Vehicle/GetMultiActiveTracksListByUserID?searchString=' + currentObjectID + '&userid=' + userInfo.Data.UserID + '&alarmType=' + alarmStyle + '&searchType=' + '0' + '&key=' + appLoginKey);
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open("POST", WebApi + '/api/Vehicle/GetMultiActiveTracksListByUserID?searchString=' + currentObjectID + '&userid=' + userInfo.Data.UserID + '&alarmType=' + alarmStyle + '&searchType=' + '0' + '&key=' + appLoginKey, true);
				xmlhttp.send();
				xmlhttp.onreadystatechange = function() {
					console.log(xmlhttp.readyState);
					console.log(xmlhttp.status);
					if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
						var data = JSON.parse(xmlhttp.responseText);
						console.log(JSON.stringify(data));
						return
						if(data.State == 1) {
							var currentOneCar = data.Data.CurrList;
							currentCarList = data.Data.OtherList;						
							$.getDirectionImg(currentOneCar, '../img/direction/');													
							
							currentCarData = currentOneCar[0];
							currentCarList.push(currentCarData);
							transitionCarList = currentCarList
							showInfoWindow();
						} else {
							mui.toast(data.Message);
						}
					}				
				}
//				mui.ajax(WebApi + '/api/Vehicle/GetMultiActiveTracksListByUserID?searchString=' + currentObjectID + '&userid=' + userInfo.Data.UserID + '&alarmType=' + alarmStyle + '&searchType=' + '0' + '&key=' + appLoginKey, {
//					headers: {'Content-Type': 'application/json'},
//					dataType: "json",
//					type: "POST",
//					success: function(data, textStatus, xhr) {
//						console.log(JSON.stringify(data));
//						return
//						if(data.State == 1) {
//							var currentOneCar = data.Data.CurrList;
//							currentCarList = data.Data.OtherList;						
//							$.getDirectionImg(currentOneCar, '../img/direction/');													
//							
//							currentCarData = currentOneCar[0];
//							currentCarList.push(currentCarData);
//							transitionCarList = currentCarList
//							showInfoWindow();
//						} else {
//							mui.toast(data.Message);
//						}
//					},
//					error: function(xhr, type, errorThrown) {
//						console.log(type);
//					}
//				});
			}
					
			function showInfoWindow() {
			//	console.log(JSON.stringify(currentCarData));
				//去除覆盖物和点聚合的点
				map.clearOverlays();
				if(markerClusterer){
					markerClusterer.clearMarkers()
				}
			//	map.setZoom(15);
				map.setCenter(new BMap.Point(currentCarData.offsetLon, currentCarData.offsetLat));		
				if(showType == 'single'){
					var point = new BMap.Point(currentCarData.offsetLon, currentCarData.offsetLat);
					var icon = new BMap.Icon(currentCarData.img_s_url, new BMap.Size(24, 24));
						icon.imageSize = new BMap.Size(24, 24);
					 	marker_init = new BMap.Marker(point, {
							icon: icon
						});
						map.addOverlay(marker_init);
						marker_init.addEventListener('click', function() {	
							if(mark_wait){ return}
							mark_wait = true;
							setTimeout(function(){
								mark_wait = false;
							},500);
							if(!infoBoxWindow) {
								showInfoWindow();
							} else {
								infoBoxWindow.close();
								infoBoxWindow = null;
							}
						});
				
				}else if(showType == 'multi'){
					showAreaCar();
				}
						
				$.getRightLocation(currentCarData.offsetLon, currentCarData.offsetLat, function(json) {
					if(json != null || json != undefined) {
						var address = json.result.formatted_address + ',' + json.result.sematic_description;
						toAdress = address;
						infoBox(address, currentCarData);
					}
				})
			}

			function infoBox(address, currentCarData) {
				var html = '';
				var carNum = '';
				if(currentCarData.VehicleNum != ''){
					if(Number(currentCarData.ObjectType) == 8 || Number(currentCarData.ObjectType) == 10){
						carNum = currentCarData.VehicleNum +'('+ currentCarData.InternalNum + ')'
					}else{
						carNum = currentCarData.VehicleNum
					}
				}else{
					carNum = currentCarData.InternalNum
				}
				if(currentCarData.OilNum == -1) {
					html = '<div class="infoBoxContent">' +
						'<ul>' +
						'<li><span>车牌:</span><span> ' + carNum + '</span></li>' +
						'<li><span>速度:</span><span> ' + parseFloat(currentCarData.Speed).toFixed(1) + 'km/h' + '</span></li>' +
						'<li><span>时间:</span><span> ' + currentCarData.GPSTime + '</span></li>' +
						'<li><span>状态:</span><span> ' + currentCarData.StatusDes + '</span></li>' +
						'<li><span>' + currentCarData.DurationStatus + ':</span><span id="showAdress"> ' + currentCarData.Duration + '</span></li>' +
						'<li><span>地址:</span><span> ' + address + '</span></li>' +
						'</ul>' +
						'<p id="enter_infoWindow_twoBtn"><span class="mapBtn" allt="1">轨迹<span class="rightLine"></span></span><span class="mapBtn" allt="2">追车<span class="rightLine"></span></span><span class="mapBtn" allt="3">详情</span></p>' +
						'<div id="whiteAngle"></div>' +
						'</div>';
				} else {
					html = '<div class="infoBoxContent">' +
						'<ul>' +
						'<li><span>车牌:</span><span> ' + currentCarData.VehicleNum + '</span></li>' +
						'<li><span>速度:</span><span> ' + parseFloat(currentCarData.Speed).toFixed(1) + 'km/h' + '</span></li>' +
						'<li><span>油量:</span><span> ' + parseFloat(currentCarData.OilNum).toFixed(1) + 'L' + '</span></li>' +
						'<li><span>时间:</span><span> ' + currentCarData.GPSTime + '</span></li>' +
						'<li><span>状态:</span><span> ' + currentCarData.StatusDes + '</span></li>' +
						'<li><span>' + currentCarData.DurationStatus + ':</span><span id="showAdress"> ' + currentCarData.Duration + '</span></li>' +
						'<li><span>地址:</span><span> ' + address + '</span></li>' +
						'</ul>' +
						'<p id="enter_infoWindow_twoBtn"><span class="mapBtn" allt="1">轨迹<span class="rightLine"></span></span><span class="mapBtn" allt="2">追车<span class="rightLine"></span></span><span class="mapBtn" allt="3">详情</span></p>' +
						'<div id="whiteAngle"></div>' +
						'</div>';
				}

				infoBoxWindow = null;
				$('.infoBox').remove();
				infoBoxWindow = new BMapLib.InfoBox(map, html, {
					boxStyle: {
						background: "transparent",
						width: "300px",
						borderRadius: '8px'
					},
					boxClass: "infoBox",
					closeIconUrl: '../img/images/center_17.png',
					closeIconMargin: "5px",
					enableAutoPan: true,
					align: INFOBOX_AT_TOP
				});
				var point = new BMap.Point(currentCarData.offsetLon, currentCarData.offsetLat);
				infoBoxWindow.open(point);

				setTimeout(function() {
					$('#enter_infoWindow_twoBtn > .mapBtn').on("touchend", function() {
						var allt = $(this).attr("allt");
						if(1 == allt) {
							if(!trackPermission){
						//		console.log(trackPermission);
								mui.toast("没有操作权限");
								return
							}
							localStorage.setItem("jy_Vehicle_his", currentCarData.VehicleNum);
							clicked('track_list.html');
						}else if(2 == allt) {
							if(navigator_wait){ return }
							navigator_wait = true;
							setTimeout(function(){
								navigator_wait = false;
							},500);
							openSysMap();								
						}else{
							localStorage.setItem("car_detail_data", JSON.stringify(currentCarData));
							clicked('car_detail.html');
						}
					})

					$('.infoBox > img:first-child').on("touchend", function() {
						infoBoxWindow.close();
						infoBoxWindow = null;
					})
				}, 1);			
			}
			
			//区域内显示多车图标并开启点聚合
			function showAreaCar(){
				$.getDirectionImg(transitionCarList, '../img/direction/');
				var bound = map.getBounds();   //获取可视区域
				    			
				transitionCarList.forEach(function(item){
					var multi_point = new BMap.Point(item.offsetLon, item.offsetLat);
					if(bound.containsPoint(multi_point)){
						var icon = new BMap.Icon(item.img_s_url, new BMap.Size(24, 24));
						icon.imageSize = new BMap.Size(24, 24);
						var multi_marker = new BMap.Marker(multi_point, {icon: icon});
						multi_marker.objectID = item.ObjectID;
						
						markers.push(multi_marker);
						map.addOverlay(multi_marker);
						
						multi_marker.addEventListener("click", function(){    
						    currentObjectID = this.objectID;
						    getMultiCarMessage(0);
						});
					}
				})
				markerClusterer = new BMapLib.MarkerClusterer(map, {markers:markers});
				markers = [];
			}
			
			//切换到单车显示
			function showSingleCar(){
				map.removeOverlay(personMarker);
				personMarker = null;
				clearInterval(timer1);
				clearInterval(timer2);
				getOneCarMessage(0)
//				showInfoWindow();
//				timer1 = setInterval(function() {
//					getNewestMessage();
//				}, currentFreshTime);
			}
			//切换到多车显示
			function showMultiCar(){
				map.removeOverlay(personMarker);
				personMarker = null;
				clearInterval(timer1);
				clearInterval(timer2);
				getMultiCarMessage(0);
				
//				showInfoWindow();
//				timer2 = setInterval(function() {
//					getNewestMessage2();
//				}, currentFreshTime);
			}
			//获取个人位置
			function showPersonPosition(e) {
				if(typeof plus == "undefined") return;
									
				clearInterval(timer1);
				clearInterval(timer2);
		
		//		marker_init.hide();
				if(infoBoxWindow) {
					infoBoxWindow.close();
					infoBoxWindow = null;
				}
				plus.geolocation.getCurrentPosition(
					function(p) {
						console.log(JSON.stringify(p));
						var pointLat = p.coords.latitude;
						var pointLog = p.coords.longitude;
						var ggPoint = new BMap.Point(pointLog, pointLat);
						console.log(JSON.stringify(ggPoint));
						if(ggPoint) {
							var pointArr = [];
							pointArr.push(ggPoint);
							var fromP = 1;
							if(p.coordsType === "gcj02") {
								fromP = 3;
							} else if(p.coordsType === "gps") {
								fromP = 1;
							} else if(p.coordsType === "bd09") {
								fromP = 5;
							} else if(p.coordsType === "bd09ll") {
								fromP = 5;
							}
							convertor.translate(pointArr, fromP, 5, function(data) {
								if(data.status === 0) {
									if(!personMarker) {
										personMarker = new BMap.Marker(new BMap.Point(data.points[0].lng, data.points[0].lat), {
											icon: new BMap.Icon("../img/images/location_16.png", new BMap.Size(20, 20))
										});
										//						 			personMarker.setIcon();
									} else {
										personMarker.setPosition(data.points[0].lng, data.points[0].lat);
									}
									map.addOverlay(personMarker);
									map.centerAndZoom(data.points[0], 15);
								}
							})
						}
					},
					function(e) {
						console.log(JSON.stringify(e));
						mui.toast("获取位置失败");
					}, {
						timeout: 6000
					});
			}

			function panorama_enter() {
				var type = $('#car_two_btn .img_bb.car_person').attr("sign");
				if(type == "person") {
					showPanora(personMarker.getPosition());
				} else {
					showPanora(new BMap.Point(currentCarData.offsetLon, currentCarData.offsetLat));
				}
			}
																
			//展示全景图
			function showPanora(panoraPoint) {
				if(typeof plus == "undefined") {
					return;
				}
				plus.nativeUI.showWaiting();
				panoramaService.getPanoramaByLocation(panoraPoint, function(data) {
					plus.nativeUI.closeWaiting();
					if(data === null) {
						mui.toast("此处无全景图");
						return;
					}
					localStorage.setItem("panora_url_data", JSON.stringify(data));
					clicked('panoraPage.html');
				});
			}

			//获取报警列表
			function caution_list(alarmStyle) {					
			//	console.log(alarmStyle);
			//	alarmStyle = encodeURI(alarmStyle);
			//	console.log(WebApi + '/api/Alarm/GetAlarmListByUserID?userid=' + userInfo.Data.UserID + '&alarmType=' + alarmStyle + '&key=' + appLoginKey);
				mui.ajax(WebApi + '/api/Alarm/GetAlarmListByUserID?userid=' + userInfo.Data.UserID + '&alarmType=' + alarmStyle + '&key=' + appLoginKey, {
					headers: {
						'Content-Type': 'application/json'
					},
					dataType: "json",
					type: "POST",
					success: function(data, textStatus, xhr) {
			//			console.log(JSON.stringify(data));
						if(data.State == 1) {
							localStorage.setItem('alarmData', JSON.stringify(data));
							//				console.log(JSON.stringify(data));
							if(data.DataCount > 0) {
								$('#red_caution').show();
							} else {
								$('#red_caution').hide();
							}
							var pop_one = null;
							if(window.plus) {
								pop_one = plus.webview.getWebviewById('sub');
							}
							if(pop_one) {		
								mui.fire(pop_one, 'changeAlarmList', {
									alarmData: JSON.stringify(data)
								});
							}
						} else {
							$('#red_caution').hide();
							localStorage.setItem('alarmData', '');
						}
					},
					error: function(xhr, type, errorThrown) {
						console.log(type);
					}
				});
			}
				
			//获取安装人员列表
			function getInstaller(){
			//	console.log(WebApi + '/api/Vehicle/GetPeopleInfoList?userID='+userInfo.Data.UserID+'&key='+appLoginKey);
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open("POST", WebApi + '/api/Vehicle/GetPeopleInfoList?userID='+userInfo.Data.UserID+'&key='+appLoginKey, true);
				xmlhttp.send();
				xmlhttp.onreadystatechange = function() {
					if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
						var data = JSON.parse(xmlhttp.responseText);
						console.log(xmlhttp.responseText);
						if(data.State == 1){
							localStorage.setItem('Installer',xmlhttp.responseText);								
						}else{
						//	mui.toast(data.Message);
						}
					}
				}
			//	mui.ajax(WebApi + '/api/Vehicle/GetPeopleInfoList?userID='+userInfo.Data.UserID+'&key='+appLoginKey,{
			//		headers:{'Content-Type':'application/json'},             
			//		dataType:"json",
			//		type:"POST",
			//		success:function(data,textStatus,xhr){
			//			console.log(JSON.stringify(data));	
			//			if(data.State == 1){
			//			//	var	$select = $("#InstallerID")
			//				data.Data.forEach(function(item){
			//					var $option = $('<option value="'+ item.PeopleNo +'">'+item.PeopleName+'</option>');
			//					$("#InstallerID").append($option);
			//				})
			//			}else{
			//				
			//			}					
			//		},
			//		error:function(xhr,type,errorThrown){
			//			
			//			console.log(type);
			//		}
			//	});
			}
				
			//自定义改变监控时长和报警类型函数
			window.addEventListener('changeSettingUp', function(event) {
				alarmStyle = event.detail.alarmStyle;
				currentFreshTime = event.detail.currentFreshTime;
			//		console.log(currentFreshTime);
			//		console.log(alarmStyle);
			})
			//其他页面触发车辆改变
			window.addEventListener("changeCar", function(e) {
				currentObjectID = e.detail.currentObjectID;
				
				if(showType == 'single'){
					getOneCarMessage(0, false);
				}else if(showType == 'multi'){
					getMultiCarMessage(0);
				}
			});
			//
			
			//调用第三方导航
			function openSysMap(){
				console.log(222);
				var aimTitle = currentCarData.VehicleNum;
				var url=null,id=null,f=null;
				switch ( plus.os.name ) {
					case "Android":
					// 规范参考官方网站：http://developer.baidu.com/map/index.php?title=uri/api/android
					url = "baidumap://map/marker?location="+currentCarData.offsetLat+","+currentCarData.offsetLon+"&title="+aimTitle+"&content="+toAdress+"&src=佳裕车联";
					f = androidMarket;
					id = "com.baidu.BaiduMap";
					break;
					case "iOS":
					// 规范参考官方网站：http://developer.baidu.com/map/index.php?title=uri/api/ios
					url = "baidumap://map/marker?location="+currentCarData.offsetLat+","+currentCarData.offsetLon+"&title="+aimTitle+"&content="+toAdress+"&src=佳裕车联";
					f = iosAppstore;
					id = "itunes.apple.com/cn/app/bai-du-de-tu-yu-yin-dao-hang/id452186370?mt=8";
					break;
					default:
					return;
					break;
				}
				url = encodeURI(url);
				plus.runtime.openURL( url, function(e) {
					plus.nativeUI.confirm( "检查到您未安装\"百度地图\"，是否到商城搜索下载？", function(i){
						if ( i.index == 0 ) {						
							f(id);
						}
					} );
				} ); 
			}
			function androidMarket( pname ) {
				plus.runtime.openURL( "market://details?id="+pname );
			}
			function iosAppstore( url ) {
				plus.runtime.openURL( "itms-apps://"+url );
			}
				
			getInstaller();
			//初始化
			init();
			//事件绑定
			bindEvent();

});