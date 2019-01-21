//关注点距离后台设置是300米
var userInfo = localStorage.getItem("userInfo");
userInfo = JSON.parse(userInfo);

var unconfirmed = 1; 										//待确认点分页页数
var concern = 1; 											//关注点分页页数
var normal = 1; 											//正常点分页页数
var pageSize = 10; 											//每页条数

var allList = [];

var statusType = 0;
var confirmList='',focusList='',nomalList='',listValue='';
var confirmEle=null,focusEle=null,nomalEle=null,commonEle=null;
var imgUrl = '';

mui.init({
	swipeBack:false
});

mui.ready(function(){
	var deceleration = mui.os.ios ? 0.003 : 0.0009;
	mui('.mui-scroll-wrapper').scroll({
		bounce: false,
		indicators: true, //是否显示滚动条
		deceleration: deceleration
	});
	//循环初始化所有下拉刷新，上拉加载。
	mui.each(document.querySelectorAll('.mui-slider-group .mui-scroll'), function(index, pullRefreshEl) {
		mui(pullRefreshEl).pullToRefresh({
			down: {
				callback: function() {
					var self = this;
					var index = this.element.getAttribute('data-item');		
					
					if(index == 3){
						mui('#confirm_point .mark_point_list_item')[0].innerHTML = '';
						unconfirmed = 1;
					}else if(index == 1){
						mui('#focus_point .mark_point_list_item')[0].innerHTML = '';
						concern = 1;
					}else{
						mui('#nomal_point .mark_point_list_item')[0].innerHTML = '';
						normal = 1;
					}
					
					get_mark_point_list(index, false);
					
					setTimeout(function() {						
						self.endPullDownToRefresh();
					}, 1000);
				}
			},
			up: {
				callback: function() {
					var self = this;					
					var index = this.element.getAttribute('data-item');
					get_mark_point_list(index, false);
					setTimeout(function() {						
						self.endPullUpToRefresh();
					}, 1000);										
				}
			}
		});
	});
	
	mui('.mui-content').on('tap','.mui-control-item',function(){
		var index = this.dataset.index;
		if(index == 3){
			mui('#confirm_point .mark_point_list_item')[0].innerHTML = '';
			unconfirmed = 1;
		}else if(index == 1){
			mui('#focus_point .mark_point_list_item')[0].innerHTML = '';
			concern = 1;
		}else{
			mui('#nomal_point .mark_point_list_item')[0].innerHTML = '';
			normal = 1;
		}
		get_mark_point_list(index,false);
	});
	mui('.mark_point_list_item').on('tap','.item',function(){
		var self = this;
		var matchBest = allList.filter(function(item){
			return self.querySelector('.edit_img').getAttribute("objid") == item.PointID;
		});
		localStorage.setItem("macth_mark_point",JSON.stringify(matchBest[0]));
//		console.log(JSON.stringify(matchBest[0]));
		clicked("mark_point_mm.html");
	});			
	get_mark_point_list(3);

})

var re_t = false;
function request_timeout(){
	re_t = true;
	setTimeout(function(){
		re_t = false;
	},500);
}

function get_mark_point_list(Index,isFirst){
	if(re_t)return;
	request_timeout();
	
	var pageIndex = 1;
	if(Index === undefined || Index === "undefined") {
		Index = 3;
	}	
	if(Index == 3) {				//待确认点
		statusType = 3;
		pageIndex = unconfirmed;	
		commonEle = mui('#confirm_point .mark_point_list_item')[0];
	} else if(Index == 1) {		//关注点
		statusType = 1;
		pageIndex = concern;
		commonEle = mui('#focus_point .mark_point_list_item')[0];
	} else if(Index == 2) {		//正常点
		statusType = 2;
		pageIndex =  normal;
		commonEle = mui('#nomal_point .mark_point_list_item')[0];		
	} 
	
	mui.ajax(WebApi + '/api/MarkPoint/GetMarkPointByUserID?userID='+userInfo.Data.UserID+'&pageSize='+pageSize+'&pageIndex='+pageIndex+'&state='+statusType+'&key='+appLoginKey,{
		headers:{'Content-Type':'application/json'},             
		dataType:"json",
		type:"POST",
		success:function(data,textStatus,xhr){
//			console.log(JSON.stringify(data));			
			mui('[href="#confirm_point"] .mui-badge')[0].innerText = data.confirmCount;
			mui('[href="#focus_point"] .mui-badge')[0].innerText = data.concernsCount;
			mui('[href="#nomal_point"] .mui-badge')[0].innerText = data.normalCount;
			
			if(data&&data.State == 1){									
				data.Data.forEach(function(item){																			
						allList.push(item);											
						if(statusType == 3){
							imgUrl = "../img/images/check_03.png";
						}else{
							imgUrl = "../img/images/read_03.png";
						}
		//				console.log(imgUrl);
		//				console.log(JSON.stringify(item));
						$.ajax({
					        url: 'http://api.map.baidu.com/geocoder/v2/?ak=YpPYDb9u47Zvs6AElUqiTKtyZkpeEw20' + '&callback=renderReverse&location=' + item.OffSetLat + ',' + item.OffSetLon + '&output=json&pois=1&coordtype=bd09ll',
					        type: 'post',
					        dataType: 'jsonp',
					        async: true,
					        success: function (json) {
					    //    	console.log(item.OffSetLat+','+item.OffSetLon);
					            if (json != null || json != undefined) {
					                var address = json.result.formatted_address + ',' + json.result.sematic_description;
					                item.myAdress = address;
									listValue = '<div class="item">'+
													'<ul>'+
														'<li><span>编号：</span><span>'+item.PointID+'</span></li>'+
														'<li><span>名称：</span><span>'+item.PointName+'</span></li>'+
														'<li><span>状态：</span><span>'+item.StateStr+'</span></li>'+
														'<li><span>地址：</span><span>'+address+'</span></li>'+
													'</ul>'+
													'<div class="edit_img" objid="'+item.PointID+'">'+
														'<img src="'+ imgUrl +'"/>'+
													'</div>'+
												'</div>';
														
									commonEle.innerHTML += listValue;
								}
					        }    
						});			
				});
				if(Index == 3){
					unconfirmed++;
				}else if(Index == 1){
					concern++;
				}else if(Index == 2){
					normal++;
				}
			}else{
				mui.toast(data.Message);
			}
			
		},
		error:function(xhr,type,errorThrown){
			
			console.log(type);
		}
	});
	
}

window.addEventListener('refreshData',function(){
	console.log('aa');
	mui('#confirm_point .mark_point_list_item')[0].innerHTML = '';
	unconfirmed = 1;
	get_mark_point_list(3);
})