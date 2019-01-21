var currentObjectID = localStorage.getItem('currentObjectID');
var userInfo = localStorage.getItem("userInfo");
	userInfo = JSON.parse(userInfo);
var Installer = localStorage.getItem('Installer');
	Installer = JSON.parse(Installer);
var token = sessionStorage.getItem("accessToken");
var photo = null;  						//获取拍照后的图片地址;
var photoName = null;					//图片的名称
var self = null;						//标记
var picker = new mui.DtPicker();  		//时间选择器对象
var mask = mui.createMask();			//蒙版对象，callback为用户点击蒙版时自动执行的回调；
//var scale = null;						//屏幕宽高比
var drivingLicense = '';				//行驶证照
var carBody = '';						//车身照
var deviceInstall = '';					//设备安装照
var isToBaidu = false;					//上传到百度接口标识
var toBaiduImg = ''						//传给百度到的图片
var mark = null;

mui.init({
	gestureConfig:{
	   tap: true, //默认为true	 
	   longtap: true, //默认为false
	}
});

//document.addEventListener('plusready',function(){
//	scale = plus.screen.resolutionHeight/plus.screen.resolutionWidth;
//})

mui.ready(function(){
	if(Installer){
		$("#InstallerID").append($('<option value="0">请选择</option>'))
		Installer.Data.forEach(function(item){
			var $option = $('<option value="'+ item.PeopleNo +'">'+item.PeopleName+'</option>');
			$("#InstallerID").append($option);
		})
	}
    if (token == null || token == '') {
       
    }
	
	if(currentObjectID){
		mui.ajax(WebApi+'/api/Vehicle/GetObjectImgInfo?userID='+userInfo.Data.UserID+'&objectID='+currentObjectID+'&key='+appLoginKey,{
			headers: {
				'Content-Type': 'application/json'
			},
			dataType: "json",
			type: "POST",
			success: function(data, textStatus, xhr) {
				console.log(JSON.stringify(data));
				if(data.State == 1) {
					var time = data.Data.InstallTime.replace('HQ',' ');
					$("#vehicleNum").val(data.Data.VehicleNum);
					$("#internalNum").val(data.Data.InternalNum)
					$("#simNum").val(data.Data.SIM);
					$("#sim2Num").val(data.Data.SIM2);
					$("#installTime").val(time);
					$("#engineCode").val(data.Data.EngineCode);
					$("#shelfCode").val(data.Data.ShelfCode);						
					$("#AlldayTel").val(data.Data.AlldayTel);
					$("#AlldayContacter").val(data.Data.AlldayContacter);
					if(Number(data.Data.InstallerID) == 0){  console.log(typeof data.Data.InstallerID)
						$('#InstallerID').val(0);
					}else if(data.Data.InstallerID){ console.log(11)
						$('#InstallerID').val(data.Data.InstallerID);
					}
					if(data.Data.drivingLicenseUrl){
						mui(".img-content img")[0].src = data.Data.drivingLicenseUrl;
						mui(".img-content img")[0].alt = 2;
						mui(".img-content img")[0].nextElementSibling.style.display = "inline-block";
					}
					if(data.Data.carBodyUrl){
						mui(".img-content img")[1].src = data.Data.carBodyUrl;
						mui(".img-content img")[1].alt = 2;
						mui(".img-content img")[1].nextElementSibling.style.display = "inline-block";
					}
					if(data.Data.deviceInstallUrl){
						mui(".img-content img")[2].src = data.Data.deviceInstallUrl;
						mui(".img-content img")[2].alt = 2;
						mui(".img-content img")[2].nextElementSibling.style.display = "inline-block";
					}
					if(Number(data.Data.ObjectType) == 8 || Number(data.Data.ObjectType) == 10){
						mui("#carVehicleNum")[0].style.display = 'none'
						mui("#carInternalNum")[0].style.display = 'block'
					}
				} else {
					mui.toast('暂无数据');
				}
			},
			error: function(xhr, type, errorThrown) {
				console.log(type);
			}
		})
	}
	
	mui("#installTime")[0].addEventListener('tap',function(){
		picker.show(function(rs){
			mui('#installTime')[0].value = rs.text;
		});
	})
	
	mui('.data-list-right').on('tap','img',function(){
		if(this.alt == 0){
			mark = 0;
		}else if(this.alt == 1){
			mark = 1;
		}else{
			return
		}
		isToBaidu = true;
		photograph();
	})
	
	mui('.img-content').on('tap','img',function(){
		self = this;				
		createActionSheet();				
	})
	
	mui('.img-content').on('longtap','img',function(){
		if(this.alt == 1){   //为1时表示没有照片
			return
		}
		var src = this.src;
		mui.openWindow({
			url: 'showImg.html',
			id: 'showImg.html',
			extras: {src: src},
			show: {aniShow: 'none'}
		});
	})
	
	mui('.img-content').on('tap','.clearImg',function(){
		var dataSrc = this.previousElementSibling.dataset.src;
		this.previousElementSibling.src = dataSrc;
		this.previousElementSibling.alt = 1;
		this.style.display = 'none';
		if(dataSrc.indexOf('_03')>0){
			drivingLicense = '';
		}else if(dataSrc.indexOf('_05')>0){
			carBody = '';
		}else if(dataSrc.indexOf('_07')>0){
			deviceInstall = '';
		}
	})
	
	mui(".saveBtn")[0].addEventListener('tap',function(){
		saveCarData();
	})
})

//原生的actionsheet
function createActionSheet(){
	var btnArray = [{title:"拍照"},{title:"从相册中选择"}];
	plus.nativeUI.actionSheet( {
		title:"选择照片",
		cancel:"取消",
		buttons:btnArray
	}, function(e){
		var index = e.index;	
		switch (index){  //0时取消，1时为拍照，2时从相册中选择
			case 0:				
				break;
			case 1:
				photograph();
				break;
			case 2:
				choosePhoto();
				break;
		}		
	} );
}

//拍照
function photograph(){
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p){
		console.log(p);
		plus.io.resolveLocalFileSystemURL(p, function(entry){
			photo = entry.toLocalURL();
			photoName = entry.name;
			
			resizeImage(photo,photoName);						
//			console.log(photo);		
		}, function(e){
			mui.toast('读取拍照文件错误：'+e.message);
		});
	},function(e){
//		mui.toast(('失败：'+e.message));
		isToBaidu = false;  //取消拍照时重置标记
	},{
		filename:'_doc/camera/',
		index:1
	});
}

//选择照片
function choosePhoto(){
	plus.gallery.pick(function(path){
		plus.io.resolveLocalFileSystemURL(path, function (entry){
//			entry.getMetadata(function (metaData) {	         
//	            console.log(metaData.size)
//	        }, function () {
//	            console.error('getMetadata fail');
//	        });
			
			photoName = entry.name;
			resizeImage(path,photoName);	
		},function(){
			 console.error('resolveLocalFileSystemURL fail')
		});		
//    	console.log(path);	
    }, function(e){
    	
    }, {filter:'image'});
}

//压缩图片并保存为base64格式
function resizeImage(src,name) {
	if(isToBaidu){
		isToBaidu = false;
        plus.zip.compressImage(
	      {
	        src: src,
	        dst: "_doc/"+name+".jpg",
	        overwrite: true,
	        width: '800px',
	        height:'auto',
	        format: 'jpg',
	        quality: 100
	      },
	      function(e) {
//	      	console.log(e.target);  //图片压缩后的地址地址
//	        console.log(e.size/1024);	//图片压缩后的大小大小        
	        var reader = new plus.io.FileReader();
	            reader.onloadend = function (e) {	//e.target返回文件目录对象
	                var speech = e.target.result;//base64图片
	                var arrSpeech = speech.split(',');
//	                console.log(JSON.stringify(e.target));	             				
					toBaiduImg = arrSpeech[1];
					if(mark == 0){
						$("#licenceImg")[0].src="../img/images/loading.gif";
					}else if(mark == 1){
						$("#dynamoImg")[0].src="../img/images/loading.gif";
					}
					getCarNumInImg(mark);					
	           };	            
            if (mui.os.ios){
				plus.io.resolveLocalFileSystemURL(e.target, function(entry){
					entry.file(function(file){
						reader.readAsDataURL(file);
					},function(e){		
						mui.toast("读写出现异常: " + e.message );
					})
				})
			}else {
				reader.readAsDataURL(e.target);
			}
//	        reader.readAsDataURL(e.target);
	      },
	      function(err) {
	        mui.toast('转码失败');
	      }
	    );	
    }else{
    	plus.zip.compressImage(
	      {
	        src: src,
	        dst: "_doc/"+name+".jpg",
	        overwrite: true,
	        width: '500px',
	        height:'auto',
	        format: 'jpg',
	        quality: 100
	      },
	      function(e) {
//	      	console.log(e.target);  //图片压缩后的地址地址
//	        console.log(e.size/1024);	//图片压缩后的大小大小        
	        self.src = e.target;
	        self.alt = 2;
	        self.nextElementSibling.style.display = 'inline-block';
	        var reader = new plus.io.FileReader();
	            reader.onloadend = function (e) {	//e.target返回文件目录对象
	                var speech = e.target.result;//base64图片
	                var arrSpeech = speech.split(',');
	                console.log(JSON.stringify(e.target));	               
	                if(self.dataset.src.indexOf('_03')>0){
						drivingLicense = arrSpeech[1];
//						console.log(drivingLicense);
					}else if(self.dataset.src.indexOf('_05')>0){
						carBody = arrSpeech[1];
					}else if(self.dataset.src.indexOf('_07')>0){
						deviceInstall = arrSpeech[1];
					}				
	            };
	        if (mui.os.ios){
				plus.io.resolveLocalFileSystemURL(e.target, function(entry){
					entry.file(function(file){
						reader.readAsDataURL(file);
					},function(e){		
						mui.toast("读写出现异常: " + e.message );
					})
				})
			}else {
				reader.readAsDataURL(e.target);
			}   
//	        reader.readAsDataURL(e.target);
	      },
	      function(err) {
	        mui.toast('转码失败');
	      }
	    );
    }
    
}

//保存数据
function saveCarData(){
	var vehicleNum = $("#vehicleNum").val();
	var simNum = $("#simNum").val();
	var sim2Num = $("#sim2Num").val();
	var installTime = $("#installTime").val().replace(' ','HQ');
	var engineCode = $("#engineCode").val();
	var shelfCode = $("#shelfCode").val();
	var InstallerID = $('#InstallerID option:selected').val();	
	var AlldayTel = $("#AlldayTel").val();
	var AlldayContacter = $("#AlldayContacter").val();
	var internalNum = $("#internalNum").val();
	
	if(vehicleNum==''||simNum==''||sim2Num==''||installTime==''){
		mui.toast('带*号的必填项不能为空！');
		return
	}
	
	if(!InstallerID){
		InstallerID = 0;
	}
	
	mask.show();	
	
	mui.ajax(WebApi + '/Common/VehicleImg.ashx',{
		data:{
			cmd: 'UpdateVehicleByObjectID',
			userID: userInfo.Data.UserID,
			objectID: currentObjectID,
			vehicleNum: vehicleNum,
			sim: simNum,
			sim2: sim2Num,
			installTime: installTime,
			engineCode: engineCode,
			shelfCode: shelfCode,
			InstallerID: InstallerID,
			AlldayTel: AlldayTel,
			AlldayContacter: AlldayContacter,
			drivingLicense: drivingLicense,
			carBody: carBody,
			deviceInstall: deviceInstall,
			internalNum: internalNum,
			key: appLoginKey
		},
//		headers:{'Content-Type':'application/json'},             
//		dataType:"json",
		type:"POST",
		success:function(data,textStatus,xhr){
//			console.log(data);
			mask.close();
			data = JSON.parse(data);
			if(data.State == 1){
				mui.toast("保存成功");		
			}else{
				mui.toast("保存失败，请再试一次");	
			}					
		},
		error:function(xhr,type,errorThrown){
			mask.close();
			mui.toast("保存失败，网络异常");
		//	console.log(type);
		}
	});
}

//图片获取车牌号
function getCarNumInImg(mark){
	mui.ajax(WebApi + '/Common/VehicleImg.ashx',{
		data: {
			cmd: "ImageRecognitionText",
            userID: userInfo.Data.UserID,
            ImageType: mark,
            ImageIO: toBaiduImg,
            key: appLoginKey
		},
		type:"POST",
		success: function(data,textStatus,xhr){
			$("#licenceImg")[0].src="../img/images/camera.png";
			$("#dynamoImg")[0].src="../img/images/camera.png";
//			console.log(data);
			data = JSON.parse(data);
			if(data.State == 0){
				if(data.Data.number){
					$("#vehicleNum").val(data.Data.number);
				}
				if(data.Data.engineNum){
					$("#engineCode").val(data.Data.engineNum);
				}	
				mui.toast('图片识别成功');
			}else{
				mui.toast('未能识别图片内容');
				
			}
		},
		error: function(data,textStatus,xhr){
			mui.toast('不能识别图片内容');
			$("#licenceImg")[0].src="../img/images/camera.png";
			$("#dynamoImg")[0].src="../img/images/camera.png";
		}
	})
}
