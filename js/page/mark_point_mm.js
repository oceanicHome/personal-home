var macth_mark_point = localStorage.getItem("macth_mark_point");  // console.log(macth_mark_point);
macth_mark_point = JSON.parse(macth_mark_point); 
var userInfo = localStorage.getItem("userInfo");
userInfo = JSON.parse(userInfo);
var hiddenMap=null,map=null,ws=null,pop_mark_check=null;
var checkLon=null,checkLat=null;
var infoBox=null,marker=null;
var oldPointName=null;

mui.init({
	swipeBack:false
});

function plusReady(){
	if(ws){
		return;
	}
	ws = plus.webview.currentWebview();
	hiddenMap=new plus.maps.Map("hiddenMap");	
	hiddenMap.getUserLocation(function(state,pos){
		if(0==state){
			checkLon = pos.longitude;
			checkLat = pos.latitude;
	//		console.log(checkLon);console.log(checkLat);
		}
	});
	
	map = new BMap.Map("map");
	var poi = new BMap.Point(macth_mark_point.OffSetLon,macth_mark_point.OffSetLat);
	if(macth_mark_point.State == 3){  //黄色
		marker = new BMap.Marker(poi,{icon:new BMap.Icon("../img/images/point_07.png",new BMap.Size(24,28))});
	}else if(macth_mark_point.State == 1){  //红色
		marker = new BMap.Marker(poi,{icon:new BMap.Icon("../img/images/point_03.png",new BMap.Size(24,28))});
	}else{	//绿色
		marker = new BMap.Marker(poi,{icon:new BMap.Icon("../img/images/point_05.png",new BMap.Size(24,28))});
	}
	
	map.centerAndZoom(poi, 16);
	map.addOverlay(marker);
	makeInfo(macth_mark_point);
	infoBox.open(marker);
	
	if(macth_mark_point.State == 3){
		mui('#pointImg')[0].style.display = 'inline-block';
	}
	
	setTimeout(function(){	
			mui('.navSty')[0].addEventListener('touchend',openSysMap);
	},200)
}
if(window.plus){
	plusReady();
}else{
	document.addEventListener("plusready",plusReady,false);
}

var re_t = false;
function request_timeout(){
	re_t = true;
	setTimeout(function(){
		re_t = false;
	},1000);
}

function check_mark_pp(ii){
	if(re_t){return};
	request_timeout();
//	console.log(WebApi + '/api/MarkPoint/CheckMarkPointByID?userID='+userInfo.Data.UserID+'&lon='+macth_mark_point.OffSetLon+'&lat='+macth_mark_point.OffSetLat+'&checkLon='+checkLon+'&checkLat='+checkLat+'&state='+ii+'&pointID='+macth_mark_point.PointID+'&key='+appLoginKey);
	if(checkLon&&checkLat){
		mui.ajax(WebApi + '/api/MarkPoint/CheckMarkPointByID?userID='+userInfo.Data.UserID+'&lon='+macth_mark_point.OffSetLon+'&lat='+macth_mark_point.OffSetLat+'&checkLon='+checkLon+'&checkLat='+checkLat+'&state='+ii+'&pointID='+macth_mark_point.PointID+'&key='+appLoginKey,{
			headers:{'Content-Type':'application/json'},             
			dataType:"json",
			type:"POST",
			success:function(data,textStatus,xhr){
//				console.log(JSON.stringify(data));
				if(data.State == 1){
//					console.log('a');
					mui.toast('操作成功');
					setTimeout(function(){
						mui.fire(plus.webview.currentWebview().opener(),'refreshData',{});
						mui.back();
					},1000);
				}else{
//					console.log('b')
					show_pop_view();
				}
				
			},
			error:function(xhr,type,errorThrown){
				
				console.log(type);
			}
		});
	}else{
		map.getUserLocation(function(state,pos){
			if(0==state){
				mui.ajax(WebApi + '/api/MarkPoint/CheckMarkPointByID?userID='+userInfo.Data.UserID+'&lon='+macth_mark_point.OffSetLon+'&lat='+macth_mark_point.OffSetLat+'&checkLon='+pos.longitude+'&checkLat='+pos.latitude+'&state='+state+'&pointID='+macth_mark_point.PointID+'&key='+appLoginKey,{
					headers:{'Content-Type':'application/json'},             
					dataType:"json",
					type:"POST",
					success:function(data,textStatus,xhr){
						if(data.State == 1){
							mui.toast('操作成功');
							setTimeout(function(){
								mui.fire(plus.webview.currentWebview().opener(),'refreshData',{});
								mui.back();
							},1000);
						}else{
							show_pop_view();
						}
						
					},
					error:function(xhr,type,errorThrown){
						
						console.log(type);
					}
				});
			}else{
				mui.alert("获取定位失败，请重试！");
			}
		});
	}	
}

//自定义信息窗口
function makeInfo(obj){
	oldPointName = obj.PointName;
	var html = '<div class="infoBoxContent">'
				 + 	'<ul>'
				 + 		'<li class="firstLine"><span>标点信息</span><a class="navSty">导航</a></li>'
				 +		'<li><span>编号:</span><span> '+ obj.PointID +'</span></li>'
				 +		'<li><span>名称:</span><span id="pointName"> '+ obj.PointName +'</span><img id="pointImg" ontouchend="changeText()" src="../img/images/check_03.png"></li>'
				 +		'<li><span>状态:</span><span> '+ obj.StateStr +'</span></li>'
				 +		'<li><span>地址:</span><span> '+ obj.myAdress +'</span></li>'				
				 +	'</ul>';
				 
				
	if(obj.State == 3){
		mui('.mui-title')[0].innerText = '标注点审核';
		html +=		'<hr>'  
			 +		'<p class="p1">确认标注点状态</p>'
			 +		'<p class="p2"><button class="btn" ontouchend="check_mark_pp(1)" alt="1">关注点</button><button class="btn" ontouchend="check_mark_pp(2)" alt="2">正常点</button></p>'
			 +		'<div id="whiteAngle"></div>'
			 +  '</div>';
	}else{
		mui('.mui-title')[0].innerText = '标注点查看';
		html += 	'<div id="whiteAngle"></div>'
			 +  '</div>';
	}
    infoBox = new BMapLib.InfoBox(map,html,{
	boxStyle:{
		background:"transparent",
		width: "260px",
		borderRadius: '8px'
	},
	 closeIconUrl: ''
	,closeIconMargin: "5px"
	,enableAutoPan: true
	,align: INFOBOX_AT_TOP
	});
		
}

function changeText() {
	mui.prompt('','此处输入','修改标注的名称',['确定','取消'],function(val){
	//	console.log(JSON.stringify(val));
		if(val.index == 0){		
			console.log(WebApi + '/api/MarkPoint/UpdateMarkPointNameByID?userID='+userInfo.Data.UserID+'&PointName='+ val.value +'&pointID='+macth_mark_point.PointID+'&key='+appLoginKey);		
			mui.ajax(WebApi + '/api/MarkPoint/UpdateMarkPointNameByID?userID='+userInfo.Data.UserID+'&pointID='+macth_mark_point.PointID+'&PointName='+ val.value +'&key='+appLoginKey,{
				headers:{'Content-Type':'application/json'},             
				dataType:"json",
				type:"POST",
				success:function(data,textStatus,xhr){
					if(data.State == 1){
						mui('#pointName')[0].innerText = val.value;
						mui.fire(plus.webview.currentWebview().opener(),'refreshData',{});
						mui.toast('修改成功');				
					}else{
						mui.toast('修改失败');
					}
				},
				error:function(xhr,type,errorThrown){
					console.log(type);
					mui.toast('网络异常');
				}
			});
		}		
	},'div');
}

function show_pop_view(){
	pop_mark_check = plus.webview.create('pop_mark_check.html','sub',{height:'100%',width:'100%',background:'transparent',position:'absolute',left:'0',top:'0'});
	ws.append(pop_mark_check);
}
function hide_pop_view(){
	if(!pop_mark_check)return;
	ws.remove(pop_mark_check);
	pop_mark_check.close();
	pop_mark_check = null;
}

function addBottomView(){
	var pop_info = plus.webview.create('pop_info.html','sub',{height:'205px',width:'68%',background:'transparent',position:'absolute',left:'16%',bottom:'50%'});
	ws.append(pop_info);
}
//调用第三方导航
function openSysMap(){
	console.log(111);
	var aimTitle = macth_mark_point.PointName;
	var url=null,id=null,f=null;
	switch ( plus.os.name ) {
		case "Android":
		// 规范参考官方网站：http://developer.baidu.com/map/index.php?title=uri/api/android
		url = "baidumap://map/marker?location="+macth_mark_point.OffSetLat+","+macth_mark_point.OffSetLon+"&title="+aimTitle+"&content="+macth_mark_point.myAdress+"&src=佳裕车联";
		f = androidMarket;
		id = "com.baidu.BaiduMap";
		break;
		case "iOS":
		// 规范参考官方网站：http://developer.baidu.com/map/index.php?title=uri/api/ios
		url = "baidumap://map/marker?location="+macth_mark_point.OffSetLat+","+macth_mark_point.OffSetLon+"&title="+aimTitle+"&content="+macth_mark_point.myAdress+"&src=佳裕车联";
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