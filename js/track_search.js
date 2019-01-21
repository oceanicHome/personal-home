//document.addEventListener("plusready",plusReady,false);
//function plusReady(){ 
//
//}

(function($) {
	var LeaveDateTime = sessionStorage.getItem("LeaveDateTime");
	var ReturnDateTime = sessionStorage.getItem("ReturnDateTime");
	var DispatchCarNo = sessionStorage.getItem("DispatchCarNo");
	var carNo = sessionStorage.getItem("track_car_no");
	var FInnerId = sessionStorage.getItem("track_car_finnerid");
//	console.log(carNo);
	if(!DispatchCarNo){
		
		if(!carNo){
		//alert("车牌号为空");
		
		}else{
			document.getElementById("vehicleId").innerText = FInnerId ? FInnerId : carNo;
		}
	}else{
		carNo = DispatchCarNo;
	}
	var beginBtn = document.getElementById("beginTime");
	var endBtn = document.getElementById("endTime");
	var time = new Date();
	var month = time.getMonth()< 9 ? "0" + (time.getMonth()+1) : time.getMonth() +1;
	var day = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
	beginBtn.innerText = time.getFullYear() + "-" + month + "-" + day + " 00:00";
	endBtn.innerText = time.getFullYear() + "-" + month + "-" + day + " 23:59";
	
	if(LeaveDateTime&&ReturnDateTime){
	//	console.log(LeaveDateTime);
/*		function timeChange(timeValue){
			var aa = timeValue.split(' ');
			var aa0 = aa[0].split('/');
			var aa1 = aa[1].split(':');
			aa1.pop(2);
			aa0[1] = Number(aa0[1])<10?"0"+aa0[1]:aa0[1];
			aa0[2] = Number(aa0[2])<10?"0"+aa0[2]:aa0[2];
			
			aa1[0] = Number(aa1[0])<10?"0"+aa1[0]:aa1[0];
			//aa1[1] = Number(aa1[1])<10?"0"+aa1[1]:aa1[1];
			
			bb0 = aa0.join('-');
			bb1 = aa1.join(':');
			var bb3 = [];
			bb3[0] = bb0;
			bb3[1] = bb1;
			bb3 = bb3.join(' ');
			
			return bb3;
		}
		var startTime = timeChange(LeaveDateTime);
		var endTime = timeChange(ReturnDateTime);
*/		
		var startTime = LeaveDateTime;
		var endTime = ReturnDateTime;

		beginBtn.innerText = startTime;
		endBtn.innerText = endTime;
		document.getElementById("vehicleId").innerText = DispatchCarNo;
		
		
	}
	mui(document).on('tap','.mui-content-padded',function(e){
		var target = e.target;
		var picker = new $.DtPicker();
		if(target.id === "beginTime"){
			picker.show(function(rs){
				beginBtn.innerHTML = rs.text;
			});
		}else if(target.id === "endTime"){
			picker.show(function(rs){
				endBtn.innerHTML = rs.text;
			});
		}
	});
	var serach = document.getElementById("searchBtn");
	serach.addEventListener('tap',function(){
		var beginTime = document.getElementById("beginTime").innerText;
		var endTime = document.getElementById("endTime").innerText;
		sessionStorage.setItem("track_search",JSON.stringify( {
			car:carNo,
			begin_time:beginTime+":00",
			end_time:endTime+":59"
		}));
		window.location.href = "track_play.html";
	});
	
	//返回到主页面时根据参数跳转到归队页面
	var old_back = mui.back;
	mui.back = function(){
		sessionStorage.setItem('whitchPage','returnPage');
		//var webview = plus.webview.currentWebview();
		//关闭当前页面时删除从归队页面传过来的字段，避免地图上的轨迹查询被干扰
		sessionStorage.removeItem("LeaveDateTime");
		sessionStorage.removeItem("ReturnDateTime");
		sessionStorage.removeItem("DispatchCarNo");
		localStorage.setItem("goLogin","1");
		sessionStorage.setItem('loginHide','loginHide');
		old_back();
	}
	
	document.addEventListener('plusready',function(){
		
		document.addEventListener('pause',function(){
			localStorage.setItem("goLogin","0");
		});
		
		document.addEventListener('resume',function(){
			localStorage.setItem("goLogin","1");
		});
		
	});		
	
})(mui);