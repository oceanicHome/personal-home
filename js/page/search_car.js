
mui.init({
	swipeBack:false
});

mui.ready(function(){
	(function($){
		var user = JSON.parse(localStorage.getItem("userInfo"));
		var carsHisSearch = null;									//搜索记录
		var carsList = {};											//搜索记录数组
		var input_car_s = null;
		var cars_search_rs = document.getElementsByClassName('cars_search_rs')[0];	//模糊搜索
		var mui_table_view = document.getElementsByClassName('mui-table-view')[0];	//历史记录
		/*---------------全局变量 end---------------*/
	
		function init(){
		//	$("input[id='search_car']")[0].focus();
			carsHisSearch = localStorage.getItem("carsHisSearch"+user.UserID);
			if(carsHisSearch){
				try{
					carsList = JSON.parse(carsHisSearch) ? JSON.parse(carsHisSearch) : "";
				}catch(e){
			//		console.log(e.message);
				}
				if(!carsList){
					return;
				}
	//			console.log(carsList);
				changeTableView(carsList);
			}
		}
		
		function changeTableView(carsList,state){
				var html = "";
				for(var key in carsList){
					if(!carsList[key].id){
						localStorage.removeItem("carsHisSearch"+user.UserID);
						carsList = {};
						mui_table_view.innerHTML = '';
						return;
					}
					html+='<li class="mui-table-view-cell">'+'<span style="display:none">'+carsList[key].id+'</span>'+'<span>'+carsList[key].car+'</span>'+'</li>';
				}
				mui(".mui-table-view").off("tap","li",enter_ss);
				mui_table_view.innerHTML = '';
				setTimeout(function() {
					mui_table_view.innerHTML = html;
					$('.mui-table-view').on('tap','li',enter_ss);
				}, 100);
				
		}
		
		function enter_ss(e){
			search(this.firstElementChild.innerText,this.lastElementChild.innerText);
		}
	
		function bindEvent(){
			//模糊搜索
			input_car_s = document.getElementById('search_car');
//			input_car_s.onfocus = function(){
//				console.log(111);
//			}
//			input_car_s.onchange = function(){
//				console.log(222);
//			}
			input_car_s.onblur = function(){
//				cars_search_rs.classList.add('mui-hidden')
			}
			input_car_s.oninput  = function(){
				carKeyup(this.value);
			}
			

			//清空历史记录
			$('.cars_search_latest').on('tap','#clearHistory',function(){
				localStorage.removeItem("carsHisSearch"+user.UserID);
				carsList = {};
				mui_table_view.innerHTML = "";
				$.alert("已清空记录");
			});
		}
		//点击其他地方隐藏车辆列表
		document.onclick = function(){
			cars_search_rs.classList.add('mui-hidden');
    		mui_table_view.classList.remove('mui-hidden');
		}
		
		//车牌号模糊查找
		function carKeyup(keyStr){
			console.log(keyStr);
			if(keyStr == ''){
				cars_search_rs.classList.add('mui-hidden');
    		mui_table_view.classList.remove('mui-hidden');
				 return;
			}
	  		console.log(WebApi + '/api/Vehicle/GetActiveTracksListByUserID?'+'searchString='+escape(keyStr)+'&userID='+user.Data.UserID+'&pageSize=10&pageIndex=0&statusType='+'3'+'&key='+appLoginKey);
			$.ajax({
				headers:{'Content-Type':'application/json'},             
				dataType:"json",
				type:"POST",                                                                                                                          //statusType值为0代表查找所有车辆
				url:WebApi + '/api/Vehicle/GetActiveTracksListByUserID?'+'searchString='+escape(keyStr)+'&alarmType=&userID='+user.Data.UserID+'&pageSize=10&pageIndex=1&statusType='+'0'+'&key='+appLoginKey,
				success:function(data){
	                if(data){
	                    console.log(JSON.stringify(data));
	                    
	               		  var result = data.Data;
	                    
	                    var html = "";
	                    for (var i=0;i<result.length;i++) {
	                    	html+='<li class="mui-table-view-cell"><span>'+result[i].VehicleNum+'</span><span style="display:none;">'+ result[i].ObjectID +'</span></li>';
	                    }
	                    
	                    $('.cars_search_rs').off('tap','li',fchontap);
	                    cars_search_rs.innerHTML = '';
	                    setTimeout(function() {
	                    	cars_search_rs.innerHTML = html;
		                    cars_search_rs.classList.remove('mui-hidden');
		                		mui_table_view.classList.add('mui-hidden');
		                		$('.cars_search_rs').on('tap','li',fchontap);
	                    }, 10);
	                    
	                }
	        	}
			});
		}
		
		function fchontap(){
	      var self = this;
	    	input_car_s.value = self.lastChild.innerText;
	    	cars_search_rs.classList.add('mui-hidden');
	    	mui_table_view.classList.remove('mui-hidden');
	    	search(self.lastElementChild.innerText,self.firstElementChild.innerText);
		}
		
		//点击搜索按钮的结果
		function search(id,car){
//			console.log(id+car);
			carsList[id] = {'id':id,'car':car,'time':new Date().getTime()};
//			console.log(JSON.stringify(carsList));
			localStorage.setItem("carsHisSearch"+user.UserID,JSON.stringify(carsList));
			changeTableView(carsList);
			
			var mainpage = plus.webview.getWebviewById('screenPage/mainPage.html');
			if(mainpage){
				mui.fire(mainpage,'changeCar',{currentObjectID: id});
			}
			mui.back();		
		}
	
		//初始化
		init();
		//绑定事件
		bindEvent();
	})(mui);
})
