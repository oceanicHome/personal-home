document.getElementById("carDetailBox").style.width =  (document.body.clientWidth - 10) + 'px';
mui.init({
	swipeBack:false
});
mui.ready(function(){
	$('.rightSpan').width($('#carDetailBox ul').width()-50);
	var carData = JSON.parse(localStorage.getItem('car_detail_data'));
//	var carData = {VehicleNum:'A123Q5',GPSTime:'2017-06-14 13:12:00',Speed:'0.00',Mileage:'123.0',OilNum:'0.0',DirectStr:'正北',StatusDes:'ACC关',CarStatusStr:'在线停车',HoldName:'烽火台',offsetLon:'109.014802',offsetLat:'29.123131'}	
	var point = new BMap.Point(carData.offsetLon, carData.offsetLat);
	var carDetailMap = new BMap.Map('carDetailMap',{
			minZoom: 5,
			maxZoom: 25,		
		});
	carDetailMap.centerAndZoom(point,15);
	var playIcon = directionToImg(carData);
	var Marker = new BMap.Marker(point,{icon:new BMap.Icon(playIcon.img,new BMap.Size(28,28))});
	carDetailMap.addOverlay(Marker);
	getRightLocation(carData.offsetLat,carData.offsetLon,'Adress');
	
	$('#VehicleNum').html(carData.VehicleNum);
	$('#GPSTime').html(carData.GPSTime);
	$('#Speed').html(parseFloat(carData.Speed).toFixed(1)+'km/h');
	$('#Mileage').html(parseFloat(carData.Mileage).toFixed(1)+'km');
	
	$('#DirectStr').html(carData.DirectStr);
	$('#carStatus').html(carData.CarStatusStr);
	$('#alarm').html(carData.StatusDes);
	$('#carGroup').html(carData.HoldName);
	//console.log(carData.AllDayTel);
	if(!carData.AllDayTel || carData.AllDayTel == ''){
		$('#carTel').parent().hide();
	}else{
		$('#carTel').html(carData.AllDayTel);
		$('#carTel').click(function(){
			var phone = Number($(this).text());
			plus.device.dial(phone,true);
		});
	}
	
	if(carData.OilNum>-1){
		$('#OilNum').parent().show();
		$('#OilNum').html(parseFloat(carData.OilNum).toFixed(1)+'L');
	}else{
		$('#OilNum').parent().hide();
	}
});


		 
//根据方向不同指定不同图标type为状态:正常,离线,报警,可不传
function directionToImg(item) {
	var CarStatus=null;
	if(item.CarStatusStr.indexOf('报警')>-1 || item.StatusDes.indexOf('报警')>-1){
		CarStatus = 'warn';
		if(item.Speed == 0){			
			return {img:"../img/direction/"+ CarStatus + "_00.png",name:""};
		}		
	}else if(item.CarStatusStr.indexOf('在线')>-1){
		CarStatus = 'online';
		if(item.Speed == 0){			
			return {img:"../img/direction/"+ CarStatus + "_00.png",name:""};
		}									
	}else if(item.CarStatusStr.indexOf('离线')>-1){
		CarStatus = 'offline';
		if(item.Speed == 0){
			return {img:"../img/direction/"+ CarStatus + "_00.png",name:""};
		}							
	}
//	console.log(item.DirectStr);	
	if(item.DirectStr == '东北'){
		return {img:"../img/direction/"+ CarStatus + "_02.png",name:"东北"};
	}else if (item.DirectStr == '正东') {
        return {img:"../img/direction/"+ CarStatus +"_03.png",name:"正东"};
    }else if (item.DirectStr == '东南') {
        return {img:"../img/direction/"+ CarStatus +"_04.png",name:"东南"};
    }else if (item.DirectStr == '正南') {
        return {img:"../img/direction/"+ CarStatus +"_05.png",name:"正南"};
    }else if (item.DirectStr == '西南') {
        return {img:"../img/direction/"+ CarStatus +"_06.png",name:"西南"};
    }else if (item.DirectStr == '正西') {
        return {img:"../img/direction/"+ CarStatus +"_07.png",name:"正西"};
    }else if (item.DirectStr == '西北') {
        return {img:"../img/direction/"+ CarStatus +"_08.png",name:"西北"};
    }else if(item.DirectStr == '正北') {
        return {img:"../img/direction/"+ CarStatus +"_01.png",name:"正北"};
    }else{
    	return {img:"../img/direction/"+ CarStatus + "_02.png",name:"东北"};
    }
}