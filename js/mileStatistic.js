$(function() {
	/*---------------全局变量 start---------------*/
//	var unique = sessionStorage.getItem("unique");				//用户唯一标识
//	var domain = "http://139.224.187.58:8888/API/CarAPI.aspx"; //请求地址url
//	var domain ="http://192.168.1.117:8891/API/CarAPI.aspx";
	var user = JSON.parse(sessionStorage.getItem("UserInfo"));
	var pageAll = 1; 											//全部分页页数   一天分页
	var pageOnline = 1; 										//在线分页页数    一周分页
	var pageOffline = 1; 										//离线分页页数    一月分页
	var pageWarn = 1; 											//报警分页页数
	var pageSize = 10; 											//每页条数
	var unitID = user.CompanyID;									//所属公司
	
	var geoc = new BMap.Geocoder();
	/*---------------全局变量 end---------------*/

	function init() {
		//if(!unique){
		//	mui.toast("用户唯一标识不存在,请重新登录");
		//	window.location.href = "login.html";
		//	return;
		//}
		mui.init({
			swipeBack: false,
		});
		getInitData();
		setTimeout(getData(0, true), 300);  //一天
		setTimeout(getData(1, true), 400);	//一周
		setTimeout(getData(2, true), 500);  //一月
	//	setTimeout(getData(3, true), 600);
	}

	/*---------------事件绑定 start---------------*/
	function bindEvent() {
		$(".mui-table-view").on("click","ul",function() {
			var $this = $(this);
			gotoDetail($this);
		});
	}
	/*---------------事件绑定 end---------------*/

	//下拉事件
	function getInitData() {
		//阻尼系数
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
					up: {
						callback: function() {
							var self = this;
							setTimeout(function() {
								getData(index, false);
								self.endPullUpToRefresh();
							}, 1000);
						}
					}
				});
			});
		});
	}

	//数据获取
	function getData(Index, isFirst) {
		var page = 1;
		if(Index === undefined || Index === "undefined") {
			Index = 0;
		}
		var status = "4";
		if(Index === 0) {				//全部   (1天) (1天)
			status = "day"
		//	status = 4;		(1代表当天，3代表三天)
			page = pageAll;
		} else if(Index === 1) {		//在线 （3天）(1周)
		//	status = 1;
			status = "week";
			page = pageOnline;
		} else if(Index === 2) {		//离线 (1月)
			status = "month";
			page = pageOffline;
		} else if(Index === 3) {
	//		status = 3;
	//		page = pageWarn;
		}
		
		
//		console.log(user.usr);
//		console.log(page);
//		console.log(pageSize);
//		console.log(status);
//		console.log(unitID);
		
		$.ajax({
			type: "post",
			url: domain,
			data: {
				api: "getCarMileList",
				usr: user.usr,
				q: "",
				page: page,
				rows: pageSize,
				status: status,
				unitID: unitID
			},
			success: function(Result) {
	//			console.log(Result);
				if(Result) {
					var result = JSON.parse(Result);
	//				console.log(result);
					if(result.success) {
						showData(result.data.rows, Index);
						if(0 === Index) {
							pageAll++;
						} else if(1 === Index) {
							pageOnline++;
						} else if(2 === Index) {
							pageOffline++;
						} else if(3 === Index) {
							pageWarn++;
						}
						$("#sliderSegmentedControl").find("a").eq(Index).find("span").text(result.data.total);
					} else {
						if(isFirst) {
							if("无数据" !== result.message) {
								mui.toast(result.message);
							} else {
								$("#sliderSegmentedControl").find("a").eq(Index).find("span").text(0);
							}
						}
					}
				} else {
					mui.toast("系统异常!");
				}
			}
		});
	}

	//数据展示
	function showData(data, _index) {
		if(data.length === 0) {
			return;
		}
		var html = "";
		var count = 0;
		var leng = data.length;
	//	console.log(data);
		for(var i = 0; i < leng; i++) {
			(function(m){
				var ths = data[m];
//				geoc.getLocation(new BMap.Point(ths.Lng,ths.Lat),function(result){
//					console.log(result);
				count++;
//				var business = ''
//				if(!result.business&&result.business!=''){
//					business = ','+result.business;
//				}
				
				html += '<li class="mui-table-view-cell"><ul>';
				html += '<li class="mui-ellipsis">所属单位:&nbsp;<a href="javascript:void(0);">' + ths.CompanyName+'</a>';
				html += '<li class="mui-ellipsis">车牌号:&nbsp;<a href="javascript:void(0);">' + ths.CarNo+ '</a><mark style="display:none;">'+ ths.VehicleId+'</mark>';
				
				if(_index == 0){
					var toDayTime = new Date();					
					var myYear = toDayTime.getFullYear();
					var myMonth = toDayTime.getMonth() + 1;
					var myDay = toDayTime.getDate();
					toDayTime = myYear+'-'+myMonth+'-'+myDay;
					html +=	'<li class="mui-ellipsis">时间:&nbsp;<span class="changeTime">'+toDayTime+'</span></li>';
					
				}else{
					html +=	'<li class="mui-ellipsis">时间:&nbsp;<span class="changeTime">'+ ths.startDate+'~'+ths.endDate+'</span></li>';
				}
			
			
				html += '<li class="mui-ellipsis">里程总值:&nbsp;<span >'+ ths.TotalValue +'KM</span></li>';
			
				html += '</ul></li>';
					
//				});
			})(i);
		}
		var interval = setInterval(function(){
			if(count === leng){
				clearInterval(interval);
				$.each($(".mui-slider-group .mui-scroll"), function(index) {
					if(_index === index) {
						var that = $(this);
						that.find(".mui-table-view").append(html);
						
						
						//数据绑定.未使用
						//$.each(that.find(".mui-table-view"), function (index) {
						//	$(this).data($(this).find("li").eq(0).find("a").eq(0).text(), data[index]);
						//});
					}
				});
			}
		},100);
		
		
		if(_index == 0){
			var toDayTime = new Date();					
			var myYear = toDayTime.getFullYear();
			var myMonth = toDayTime.getMonth() + 1;
			var myDay = toDayTime.getDate();
			toDayTime = myYear+'-'+myMonth+'-'+myDay;
		//	console.log(toDayTime);
			$(".changeTime").html(toDayTime);
		}
	}

	//跳转到详情页
	function gotoDetail(ths) {
		var car = ths.find("li").eq(0).find("mark").text();
		//localStorage.setItem("historySearch"+user.usr, car + "|carStatus");
		//window.location.href = "trailMonitor.html";
	}

	//方向
	function Direction(param) {
        if (param > 22.5 && param < 90 - 22.5) {
            return "东北";
        }else if (param >= 90 - 22.5 && param <= 90 + 22.5) {
            return "正东";
        }else if (param > 90 + 22.5 && param < 180 - 22.5) {
            return "东南";
        }else if (param >= 180 - 22.5 && param <= 180 + 22.5) {
            return "正南";
        }else if (param > 180 + 22.5 && param < 270 - 22.5) {
            return "西南";
        }else if (param >= 270 - 22.5 && param <= 270 + 22.5) {
            return "正西";
        }else if (param > 270 + 22.5 && param < 360 - 22.5) {
            return "西北";
        }else {
            return "正北";
        }
	}

	init();
	bindEvent();
	
	var old_back = mui.back;
	mui.back = function(){
		sessionStorage.setItem('loginHide','loginHide');
		sessionStorage.setItem('alarm1Page','returnPage');
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
	
});