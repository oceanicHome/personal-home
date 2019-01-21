mui.init({
	swipeBack:false
});

mui.ready(function(){
	var panora_url_data = localStorage.getItem("panora_url_data");
	panora_url_data = JSON.parse(panora_url_data);

	setTimeout(function(){
		var Panorama = new BMap.Panorama('BM-panorama');
		Panorama.setPov({heading: -40, pitch: 6});
	  	Panorama.setId(panora_url_data.id);
	},200);
})