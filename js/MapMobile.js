
//<script type="text/javascript" src="JavaScript/animatedcollapse.js">
//animatedcollapse.addDiv('jason', 'optional_attribute_string')
//animatedcollapse.init()


var IDSValMap = "";
var MyMap;
var VELabelID = 0;
var CurrentMap;
var init;
var mytimer;
var search;
var count = 0;
var expand = true;
var Pois = '';
var SetShow = 1;
var CenterX = 0;
var CenterY = 0;
var MapSetInterval;
function SetShowX(i) {
    SetShow = i;
}

function myopen(name, url) {
    window.open(url, "", "width=960,height=600,resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no,top=120,left=80");
    //window.open(url, name, "width=600,height=400,resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no,top=210,left=250");
}

function myopenModal(url) {
    window.showModalDialog(url, window, "dialogleft:200px;dialogtop:200px;status:no;dialogwidth:320px;dialogheight:350px");
}



function showPoint(searchResult) {
    if (searchResult.count > 0)//如果存在搜索结果
    {
        MyMap.clearOverLays();
        var poi = searchResult.searchPoints[0]; //取出第一个搜索结果点
        var point = new LTPoint(poi.point[0], poi.point[1]); //得到该点的坐标的LTPoint
        MyMap.centerAndZoom(point, 0);
        var marker = new LTMarker(point); 	//向地图上添加一个标记
        MyMap.addOverLay(marker);
        var name = poi.name;
        LTEvent.bind(marker, "click", marker, function () { this.openInfoWinHtml(name) }); //标记点击的时候弹出信息
    }
    else {
        alert('无结果');
    }
}

function load() {

    CurrentMap = "百度地图";// Map.GetCurrentMap().value;
    init = true;
    if (CurrentMap == "谷歌卫星图" || CurrentMap == "谷歌普通图") {
        if (GBrowserIsCompatible()) {
            if (MyMap == null) {
                MyMap = new GMap2(document.getElementById("MyMap"));
                MyMap.addControl(new GLargeMapControl());
                MyMap.enableDoubleClickZoom();
                MyMap.enableScrollWheelZoom();

                var overlayControl = new GOverviewMapControl();
                MyMap.addControl(overlayControl);


                if (CurrentMap == "谷歌卫星图") {
                    MyMap.addMapType(G_SATELLITE_MAP);
                    MyMap.setMapType(G_SATELLITE_MAP);
                }
                MyMap.setCenter(new GLatLng(33.21, 103.5), 4);
            }
        }

    }
    if (CurrentMap == "谷歌地球") {
        if (GBrowserIsCompatible()) {
            if (MyMap == null) {
                MyMap = new GMap2(document.getElementById("MyMap"));
                MyMap.addMapType(G_SATELLITE_3D_MAP);
                MyMap.setMapType(G_SATELLITE_3D_MAP);
                MyMap.setCenter(new GLatLng(33.21, 103.5), 4);
            }
        }
    }

    if (CurrentMap == "微软卫星图" || CurrentMap == "微软普通图") {
        if (MyMap == null) {
            MyMap = new VEMap('MyMap');
            MyMap.LoadMap();
            if (CurrentMap == "微软卫星图") {
                MyMap.SetMapStyle(VEMapStyle.Hybrid);
            }
            MyMap.SetCenterAndZoom(new VELatLong(33.21, 103.5), 4);
        }
    }
    if (CurrentMap == "51地图") {
        MyMap = new LTMaps("MyMap");
        MyMap.centerAndZoom(new LTPoint(10340969, 3294940), 12);
        MyMap.addControl(new LTStandMapControl());
        MyMap.addControl(new LTOverviewMapControl());
        LTEvent.bind(MyMap, "dblclick", MyMap, function () { this.zoomIn() }); //绑定事件，在双击的时候先执行放大操作
        MyMap.handleMouseScroll(true); //启用鼠标滚轮功能支持，参数true代表使用鼠标指向点位置不变模式

        var control = new LTZoomInControl();
        search = new LTLocalSearch(showPoint);
        search.setCity('北京');

        control.setLabel("放大/拖动");
        control.setLeft(65);
        control.setTop(25);

        MyMap.addControl(control);
        //Pois = Map.GetPois().value;
        // 理论上说我们应该在这里加标注。 并保证永不移除标注。
    }
    if (CurrentMap == "百度地图") {
        MyMap = new BMap.Map("MyMap");

        MyMap.centerAndZoom(new BMap.Point(114.37838, 30.51692), 12);

        MyMap.enableScrollWheelZoom();
        MyMap.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
        MyMap.addControl(new BMap.NavigationControl({ anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL }));  //右上角，仅包含平移和缩放按钮
        MyMap.addControl(new BMap.NavigationControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT, type: BMAP_NAVIGATION_CONTROL_PAN }));  //左下角，仅包含平移按钮
        MyMap.addControl(new BMap.NavigationControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_ZOOM }));  //右下角，仅包含缩放按钮

    }
    if (CurrentMap == "自定义地图") {
        OpenLayers.ImgPath = 'scripts/OpenLayers/img/';
        MyMap = new OpenLayers.Map('MyMap', {
            controls: [new OpenLayers.Control.Navigation(),
                     new OpenLayers.Control.PanZoomBar()],
            numZoomLevels: 18
        });
        var wms = new OpenLayers.Layer.WMS(
        "OpenLayers WMS",
         Map.GetCurrentWMS().value,
        { layers: 'basic' },
         { 'buffer': 0, transitionEffect: 'resize' }
         );

        var zb = new OpenLayers.Control.ZoomBox(
        { title: "" });
        var panel = new OpenLayers.Control.Panel({});
        panel.addControls([
        new OpenLayers.Control.MouseDefaults(
            { title: '' }),
        zb]);
        MyMap.addControl(panel);

        MyMap.addLayer(wms);
        MyMap.setCenter(new OpenLayers.LonLat(107.050781, 32.398516), 5);
    }

}

//手机使用
function load2(pointCurrent) {

    CurrentMap = "百度地图";// Map.GetCurrentMap().value;
    init = true;
    if (CurrentMap == "谷歌卫星图" || CurrentMap == "谷歌普通图") {
        if (GBrowserIsCompatible()) {
            if (MyMap == null) {
                MyMap = new GMap2(document.getElementById("MyMap"));
                MyMap.addControl(new GLargeMapControl());
                MyMap.enableDoubleClickZoom();
                MyMap.enableScrollWheelZoom();

                var overlayControl = new GOverviewMapControl();
                MyMap.addControl(overlayControl);


                if (CurrentMap == "谷歌卫星图") {
                    MyMap.addMapType(G_SATELLITE_MAP);
                    MyMap.setMapType(G_SATELLITE_MAP);
                }
                MyMap.setCenter(new GLatLng(33.21, 103.5), 4);
            }
        }

    }
    if (CurrentMap == "谷歌地球") {
        if (GBrowserIsCompatible()) {
            if (MyMap == null) {
                MyMap = new GMap2(document.getElementById("MyMap"));
                MyMap.addMapType(G_SATELLITE_3D_MAP);
                MyMap.setMapType(G_SATELLITE_3D_MAP);
                MyMap.setCenter(new GLatLng(33.21, 103.5), 4);
            }
        }
    }

    if (CurrentMap == "微软卫星图" || CurrentMap == "微软普通图") {
        if (MyMap == null) {
            MyMap = new VEMap('MyMap');
            MyMap.LoadMap();
            if (CurrentMap == "微软卫星图") {
                MyMap.SetMapStyle(VEMapStyle.Hybrid);
            }
            MyMap.SetCenterAndZoom(new VELatLong(33.21, 103.5), 4);
        }
    }
    if (CurrentMap == "51地图") {
        MyMap = new LTMaps("MyMap");
        MyMap.centerAndZoom(new LTPoint(10340969, 3294940), 12);
        MyMap.addControl(new LTStandMapControl());
        MyMap.addControl(new LTOverviewMapControl());
        LTEvent.bind(MyMap, "dblclick", MyMap, function () { this.zoomIn() }); //绑定事件，在双击的时候先执行放大操作
        MyMap.handleMouseScroll(true); //启用鼠标滚轮功能支持，参数true代表使用鼠标指向点位置不变模式

        var control = new LTZoomInControl();
        search = new LTLocalSearch(showPoint);
        search.setCity('北京');

        control.setLabel("放大/拖动");
        control.setLeft(65);
        control.setTop(25);

        MyMap.addControl(control);
        //Pois = Map.GetPois().value;
        // 理论上说我们应该在这里加标注。 并保证永不移除标注。
    }
    if (CurrentMap == "百度地图") {
        MyMap = new BMap.Map("MyMap");

        if (pointCurrent != null) {
            MyMap.centerAndZoom(pointCurrent, 18);
        }
        else {
            MyMap.centerAndZoom(new BMap.Point(114.37838, 30.51692), 18);
        }


        MyMap.enableScrollWheelZoom();
        MyMap.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
        MyMap.addControl(new BMap.NavigationControl({ anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL }));  //右上角，仅包含平移和缩放按钮
        MyMap.addControl(new BMap.NavigationControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT, type: BMAP_NAVIGATION_CONTROL_PAN }));  //左下角，仅包含平移按钮
        MyMap.addControl(new BMap.NavigationControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_ZOOM }));  //右下角，仅包含缩放按钮

    }
    if (CurrentMap == "自定义地图") {
        OpenLayers.ImgPath = 'scripts/OpenLayers/img/';
        MyMap = new OpenLayers.Map('MyMap', {
            controls: [new OpenLayers.Control.Navigation(),
                     new OpenLayers.Control.PanZoomBar()],
            numZoomLevels: 18
        });
        var wms = new OpenLayers.Layer.WMS(
        "OpenLayers WMS",
         Map.GetCurrentWMS().value,
        { layers: 'basic' },
         { 'buffer': 0, transitionEffect: 'resize' }
         );

        var zb = new OpenLayers.Control.ZoomBox(
        { title: "" });
        var panel = new OpenLayers.Control.Panel({});
        panel.addControls([
        new OpenLayers.Control.MouseDefaults(
            { title: '' }),
        zb]);
        MyMap.addControl(panel);

        MyMap.addLayer(wms);
        MyMap.setCenter(new OpenLayers.LonLat(107.050781, 32.398516), 5);
    }

}

function SetCenter(x, y) {
    zoomtoxy(x, y);
}

function SetCheck() {
    Check();

    // setInterval("checkExpire()", 15 * 1000);

    // checkExpire();
}

function zoomtoxy(x, y) {
    // document.Form1.chkAutoRefresh.checked = false;
    //document.Form1.chkAutoPan.checked = false;
    //ctimer2();
    if (CurrentMap.indexOf("谷歌") != -1) {
        MyMap.setCenter(new GLatLng(x, y), 16);
    }

    if (CurrentMap.indexOf("微软") != -1) {
        MyMap.SetCenterAndZoom(new VELatLong(x, y), 15);
    }
    if (CurrentMap.indexOf("自定义") != -1) {
        MyMap.setCenter(new OpenLayers.LonLat(y, x), 17);
    }
    if (CurrentMap.indexOf("百度地图") != -1) {
        MyMap.centerAndZoom(new BMap.Point(y, x), 17);
    }

    if (CurrentMap.indexOf("51") != -1) {
        MyMap.centerAndZoom(new LTPoint(y * 100000, x * 100000), 2);
    }
    //Check();
}

function checkExpire() {
    var expireString = Map.GetUserNotify().value;
    if (expireString != '') {
        alert(expireString);
    }
}

function ctimer2() {
    /*
    if (document.Form1.chkAutoRefresh.checked) {
        clearInterval(mytimer);
        var Interval = document.getElementById("SelectInterval")[0].innerText;
        mytimer = setInterval("Check()", Interval * 1000 + 5000);
    }
    else {
        clearInterval(mytimer);
    }
    */
    Check();
}

function Check() {

    AddPointToMyMap();
    //if (document.Form1.chkAutoAlert.checked) {
    //    CheckAlert();
    // }
   // window.setTimeout(Check, 60000);
}
function Check3(Val) {


    
    IDSValMap = Val;

    window.setTimeout(Check, 1000);
    //AddPointToMyMap();

    //if (document.Form1.chkAutoAlert.checked) {
    //    CheckAlert();
    // }
    CleanMapSetInterval();

    MapSetInterval = setInterval("Check()", 30000);

    //window.setTimeout(Check, 60000);
}
function CleanMapSetInterval()
{
    if (MapSetInterval != null) {
        clearInterval(MapSetInterval);
    }
}

function CheckAlert() {
    /*
    var AlertID = Map.CheckAlert().value;
    if (AlertID != '') {
        myopenModal('AlertClear.aspx?AlertID=' + AlertID);
    }
    */
}

function LoadPoiFor51() {
    if (Pois != '') {
        var eachPoi = Pois.split(";");
        for (var i = 0; i < eachPoi.length; i++) {
            var eachPart = eachPoi[i].split(",");
            var poiPoint = new LTPoint(parseFloat(eachPart[1] * 100000), parseFloat(eachPart[2] * 100000));
            var text = new LTMapText(poiPoint);
            text.setLabel(eachPart[0]);
            MyMap.addOverLay(text);
            var poiMarker = new LTMarker(poiPoint);
            poiMarker.setIconImage(eachPart[3]);
            MyMap.addOverLay(poiMarker);
        }
    }
}

function LoadPoiForBaiDu() {
    return;
    if (Pois != '') {
        alert("Y1");
        var eachPoi = Pois.split(";");
        alert("Y2");
        for (var i = 0; i < eachPoi.length; i++) {
            var eachPart = eachPoi[i].split(",");
            var poiPoint = new new BMap.Point(parseFloat(eachPart[1]), parseFloat(eachPart[2]));

            alert("Y3");

            var opts = {
                position: point,    // 指定文本标注所在的地理位置
                offset: new BMap.Size(30, -30)    //设置文本偏移量

            }
            alert("Y4");
            var label = new BMap.Label(eachPart[0], opts);  // 创建文本标注对象
            label.setStyle({
                color: "red",
                fontSize: "12px",
                height: "20px",
                lineHeight: "20px",
                fontFamily: "微软雅黑"
            });
            alert("Y5");
            MyMap.addOverlay(label);
            alert("Y6");

            var myIcon = new BMap.Icon(eachPart[3], new BMap.Size(300, 157));
            marker = new BMap.Marker(point, { icon: myIcon });  // 创建标注
            alert("Y7");
            MyMap.addOverlay(marker);
            alert("Y8");

        }
    }
}



function AddPointToMyMap2(ReturnXML) {

    try {
        var expireString = "";// Map.GetExprieUsers().value;
        if (expireString != '') {
            alert(expireString);
        }

        var doc;
        if (window.ActiveXObject) {
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
            doc.loadXML(ReturnXML);
        }
            // code for Mozilla, Firefox, Opera, etc.
        else {
            var parser = new DOMParser();
            doc = parser.parseFromString(ReturnXML, "text/xml");
        }
        // documentElement always represents the root node            
        var Root = doc.documentElement;
        var bounds;
        if (CurrentMap == "谷歌卫星图" || CurrentMap == "谷歌普通图" || CurrentMap == "谷歌地球") {

            bounds = new GLatLngBounds();
            MyMap.clearOverlays();

        }
        if (CurrentMap == "51地图") {

            MyMap.clearOverLays();
            LoadPoiFor51();

            // 记载标注 我们不应在这里加 标注 这是临时的方案
        }
        if (CurrentMap == "百度地图") {
            MyMap.clearOverlays();
            LoadPoiForBaiDu();
            // 记载标注 我们不应在这里加 标注 这是临时的方案
        }
        var markers;
        if (CurrentMap == "自定义地图") {
            bounds = new OpenLayers.Bounds();
            if (MyMap.getLayer("Markers") != null) {
                MyMap.getLayer("Markers").destroy();
            }
            var popupcount = MyMap.popups.length
            for (j = 0; j < popupcount; j++) {
                MyMap.removePopup(MyMap.popups[0]);
            }
            markers = new OpenLayers.Layer.Markers("zibo");
            markers.id = "Markers";
            MyMap.addLayer(markers);
        }
        if (CurrentMap == "微软卫星图" || CurrentMap == "微软普通图") {
            MyMap.DeleteAllShapeLayers();
            VERemoveAllLabels();
        }
        count = 0;
        // 如果没有可以显示的数据就什么都不做。
        if (Root.childNodes.length == 0) {
            AdjustJason();
            var myWindow = document.getElementById('jason');
            myWindow.innerHTML = '';
            return;
        }

        var point;
        var label;
        var polyline;
        var points = new Array();
        var footcontent = "";
        var info = "<table style=\"width: 100%; cursor:pointer\">";

        var foot = footcontent.split(',');

        if (footcontent != "") {
            info += "<tr style='background: #677dd9; color:white'>";
            for (i = 0; i < foot.length; i++) {
                info += "<td >";
                info += "" + foot[i];
                info += "</td>";
            }
        }
        else {
            info += "<tr style='background: #677dd9; color:white'>";
            info += "<td>";
            info += "车牌号";
            info += "</td>";

            info += "<td>";
            info += "速度";
            info += "</td>";


            info += "<td>";
            info += "经度";
            info += "</td>";

            info += "<td>";
            info += "纬度";
            info += "</td>";

            info += "<td>";
            info += "位置";
            info += "</td>";

            info += "<td>";
            info += "方向";
            info += "</td>";

            info += "<td>";
            info += "时间";
            info += "</td>";


            info += "<td>";
            info += "状态";
            info += "</td>";
            info += "</tr>";
        }
        for (i = 0; i < Root.childNodes.length; i++) {
            if (Root.childNodes[i].attributes[0] == null) {
                continue;
            }

            target = '';
            if (Root.childNodes[i].attributes[11].value != '') {
                target = '</br>目标:' + Root.childNodes[i].attributes[11].value;
            }

            var imagePath = '';
            try {
                imagePath = Root.childNodes[i].attributes[12].value;
            }
            catch (err) { }
            if (imagePath != '') {
                imagePath = '</br><img src=' + imagePath + ' width="320px" height="240px"/>';
            }

            label = '<div class=\'MapLabel\'><strong>' + Root.childNodes[i].attributes[3].value + '</strong>' +
                 '</br>速度:' + Root.childNodes[i].attributes[2].value +
                 '</br>方向:' + Root.childNodes[i].attributes[8].value +
                 '</br>状态:' + Root.childNodes[i].attributes[13].value +
                 '</br>定位时间:' + Root.childNodes[i].attributes[6].value +
                 '</br>地址:' + Root.childNodes[i].attributes[7].value;

            /*
             label = '用户:' + Root.childNodes[i].attributes[5].value +
           '</br>车牌:' + Root.childNodes[i].attributes[3].value +
          imagePath +
           '</br>经度:' + Root.childNodes[i].attributes[1].value +
           ';        纬度:' + Root.childNodes[i].attributes[0].value +
           '</br>速度:' + Root.childNodes[i].attributes[2].value +
           ';        方向:' + Root.childNodes[i].attributes[8].value +
           '</br>时间:' + Root.childNodes[i].attributes[6].value +
           '</br>地址:' + Root.childNodes[i].attributes[7].value;
           */

            /*
            if (Root.childNodes[i].attributes[17].value != "未知") {
                label = label + '</br>当前油量:' + Root.childNodes[i].attributes[17].value + '';
            }


            if (Root.childNodes[i].attributes[18].value != "未知") {
                label = label + '</br>当前里程:' + Root.childNodes[i].attributes[18].value / 1000 + "KM";
            }
            */


            count++;
            if (footcontent != "") {
                info += "<tr  onclick=\"SetCenter('" + Root.childNodes[i].attributes[9].value + "','" + Root.childNodes[i].attributes[10].value + "')\">";
                for (j = 0; j < foot.length; j++) {
                    var f = foot[j];
                    switch (f) {

                        case "用户名":
                            // info += "<td>";
                            // info += Root.childNodes[i].attributes[5].value;
                            //  info += "</td>";
                            break;

                        case "车牌号":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[3].value;
                            info += "</td>";
                            break;
                        case "位置":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[7].value;
                            info += "</td>";
                            break;
                        case "方向":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[8].value;
                            info += "</td>";
                            break;
                        case "状态":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[13].value;
                            info += "</td>";
                            break;
                        case "经度":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[1].value;
                            info += "</td>";
                            break;
                        case "纬度":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[0].value;
                            info += "</td>";
                            break;
                        case "司机电话":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[15].value;
                            info += "</td>";
                            break;
                        case "速度":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[2].value;
                            info += "</td>";
                            break;
                        case "时间":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[6].value;
                            info += "</td>";
                            break;
                        case "司机姓名":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[16].value;
                            info += "</td>";
                            break;
                        case "车主电话":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[14].value;
                            info += "</td>";
                            break;
                        case "油量":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[17].value;
                            info += "</td>";
                            break;
                        case "里程":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[18].value / 1000;
                            info += "</td>";
                            break;
                        case "乘客数":
                            info += "<td>";
                            info += Root.childNodes[i].attributes[19].value;
                            info += "</td>";
                            break;

                        case "温度":
                            //info += "<td>";
                            //info += Root.childNodes[i].attributes[20].value;
                            // info += "</td>";
                            if (Root.childNodes[i].attributes[20].value != "") {
                                label = label + '</br>温度:' + Root.childNodes[i].attributes[20].value;
                            }
                            break;

                    }

                }

                info += "</tr>";
            }
            else {
                info += "<tr onclick=\"SetCenter('" + Root.childNodes[i].attributes[9].value + "','" + Root.childNodes[i].attributes[10].value + "')\">";
                // info += "<td>";
                // info += Root.childNodes[i].attributes[5].value;
                // info += "</td>";

                info += "<td>";
                info += Root.childNodes[i].attributes[3].value;
                info += "</td>";


                info += "<td>";
                info += Root.childNodes[i].attributes[2].value;
                info += "</td>";

                //info += "<td>";
                //info += Root.childNodes[i].attributes[20].value;
                // info += "</td>";

                if (Root.childNodes[i].attributes[20].value != "") {
                    label = label + '</br>温度:' + Root.childNodes[i].attributes[20].value;
                }

                info += "<td>";
                info += Root.childNodes[i].attributes[1].value;
                info += "</td>";

                info += "<td>";
                info += Root.childNodes[i].attributes[0].value;
                info += "</td>";


                info += "<td>";
                info += Root.childNodes[i].attributes[7].value;
                info += "</td>";

                info += "<td>";
                info += Root.childNodes[i].attributes[8].value;
                info += "</td>";


                info += "<td>";
                info += Root.childNodes[i].attributes[6].value;
                info += "</td>";

                info += "<td>";
                info += Root.childNodes[i].attributes[13].value;
                info += "</td>";
                info += "</tr>";



            }

            label = label + '</br>状态:' + Root.childNodes[i].attributes[13].value + target;
            label += "</div>";
            label += "<table class=\"table020\" align=\"center\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" ><tr>"
            label += "<td class=\"td9\"><img src=\"/Image/xq_img.png\"><a href=\"javascript:ShowDeteil('" + Root.childNodes[i].attributes[21].value + "')\">详情</a></td>";
            label += "<td class=\"td10\"><img src=\"/Image/gj_img.png\"><a href=\"javascript:window.open('/Monitor/MapX.aspx?ID=" + Root.childNodes[i].attributes[21].value + "','_blank')\">追踪</a></td>";
            label += "<td class=\"td10\"><img src=\"/Image/zg_img.png\"><a href=\"javascript:window.open('/CarManage/ViewCarHistory.aspx?GUserID=" + Root.childNodes[i].attributes[21].value + "','_blank')\">轨迹</a></td>";
            label += "<td class=\"td10\"><img src=\"/Image/more.png\"><a href=\"javascript:OpenAmendPaiChe('" + Root.childNodes[i].attributes[21].value + "')\">快速派</a></td>";
            label += "</tr></table>";

            var extentionName = ".png"
            if (Root.childNodes[i].attributes[4].value.indexOf("闪烁") != -1) {
                extentionName = ".gif";
            }

            if (CurrentMap == "谷歌卫星图" || CurrentMap == "谷歌普通图" || CurrentMap == "谷歌地球") {
                point = new GLatLng(parseFloat(Root.childNodes[i].attributes[0].value), parseFloat(Root.childNodes[i].attributes[1].value));
                if (CurrentMap.indexOf("普通") > 0) {
                    point = new GLatLng(parseFloat(Root.childNodes[i].attributes[9].value), parseFloat(Root.childNodes[i].attributes[10].value));
                }
                bounds.extend(point);
                MyMap.addOverlay(GMCreateMarker(point, label, Root.childNodes[i].attributes[4].value));
            }
            if (CurrentMap == "微软卫星图" || CurrentMap == "微软普通图") {
                point = new VELatLong(parseFloat(Root.childNodes[i].attributes[0].value), parseFloat(Root.childNodes[i].attributes[1].value));
                if (CurrentMap.indexOf("普通") > 0) {
                    point = new VELatLong(parseFloat(Root.childNodes[i].attributes[9].value), parseFloat(Root.childNodes[i].attributes[10].value));
                }
                sessionLayer = new VEShapeLayer();
                MyMap.AddShapeLayer(sessionLayer);
                sessionLayer.AddShape(CreateVEShape(point, label, Root.childNodes[i].attributes[4].value));
            }
            if (CurrentMap == "51地图") {
                point = new LTPoint(parseFloat(Root.childNodes[i].attributes[10].value * 100000), parseFloat(Root.childNodes[i].attributes[9].value * 100000));
                // var myLTGpsIcon = new LTGpsIcon(Root.childNodes[i].attributes[5].value, 
                //                        marker2 = new LTGpsMarker(new LTGpsPoint(parseFloat(Root.childNodes[i].attributes[10].value * 100000), parseFloat(Root.childNodes[i].attributes[9].value * 100000)), 1, Root.childNodes[i].attributes[3].value);
                //                        MyMap.addOverLay(marker2);


                var text = new LTMapText(point);
                text.setLabel(Root.childNodes[i].attributes[3].value + "<br>速度:" + Root.childNodes[i].attributes[2].value);
                MyMap.addOverLay(text);
                marker = new LTMarker(point);
                marker.setIconImage("images/icons/" + Root.childNodes[i].attributes[4].value + extentionName);
                LTEvent.addListener(marker, "mouseover", getClickCallBack(marker, label));
                MyMap.addOverLay(marker);

                points.push(point);
            }

            if (CurrentMap == "百度地图") {
                var currentY = parseFloat(Root.childNodes[i].attributes[9].value);
                var currentX = parseFloat(Root.childNodes[i].attributes[10].value);
                //if (i == 0)
                // {
                //     zoomtoxy(currentX, currentY);
                // }
                var currentAddress = Root.childNodes[i].attributes[7].value;
                point = new BMap.Point(currentX, currentY);

                var opts = {
                    position: point,    // 指定文本标注所在的地理位置
                    offset: new BMap.Size(0, -30)    //设置文本偏移量

                }



                SetBaiDuLabel(Root.childNodes[i].attributes[4].value + extentionName, point, label, MyMap, currentX, currentY, currentAddress, Root.childNodes[i].attributes[8].value);


                var text = new BMap.Label(Root.childNodes[i].attributes[3].value + "<br>速度:" + Root.childNodes[i].attributes[2].value, opts);  // 创建文本标注对象
                text.setStyle({
                    color: "red",
                    fontSize: "12px",
                    height: "20px",
                    lineHeight: "20px",
                    fontFamily: "微软雅黑"
                });
                MyMap.addOverlay(text);

                /*

                var myIcon = new BMap.Icon("images/icons/" + Root.childNodes[i].attributes[4].value + extentionName, new BMap.Size(30, 30));
                marker = new BMap.Marker(point, { icon: myIcon });  // 创建标注
                var addPoiBtnHtml = "<input type='button' value = '添加标注' onclick='addPoiFromBaiduPopup(" + currentX + "," + currentY + ",\"" + currentAddress + "\")'></input>"
                var infoWindowHtml = "<div><p style='font-size:14px;'>" + label + "</p> " + addPoiBtnHtml + "</div>";


                var infoWindow1 = new BMap.InfoWindow(infoWindowHtml);
                marker.addEventListener("mouseover", function () { this.openInfoWindow(infoWindow1); });

                MyMap.addOverlay(marker);*/
                points.push(point);

            }
            if (CurrentMap == "自定义地图") {
                var size = new OpenLayers.Size(24, 24);
                var offset = new OpenLayers.Pixel(-(size.w / 2), -(size.h / 2));

                var icon = new OpenLayers.Icon(document.URL.replace("Map.aspx", "") + "images/icons/" + Root.childNodes[i].attributes[4].value + extentionName, size, offset);
                point = new OpenLayers.LonLat(parseFloat(Root.childNodes[i].attributes[1].value), parseFloat(Root.childNodes[i].attributes[0].value));
                var myMarker = new OpenLayers.Marker(point, icon);
                myMarker.id = i + "";
                myMarker.events.register("mouseover", myMarker, mouseover);
                myMarker.events.register("mouseout", myMarker, mouseout);
                markers.addMarker(new OpenLayers.Marker(point, icon));


                var Popup = new OpenLayers.Popup(Root.childNodes[i].attributes[5].value,
            point,
            new OpenLayers.Size(0, 0),
            "<div class='MapPopup'>" + label + "</div>",
            false);
                Popup.autoSize = true;
                Popup.panMapIfOutOfView = true;

                MyMap.addPopup(Popup);
                Popup.hide();
                bounds.extend(point);
            }


        } // end for



        /* if (document.Form1.chkAutoPan.checked || init == true) {
             if (CurrentMap == "谷歌卫星图" || CurrentMap == "谷歌普通图" || CurrentMap == "谷歌地球") {
                 init = false;
                 var myzoomlevel = MyMap.getBoundsZoomLevel(bounds);
                 if (CurrentMap != "谷歌卫星图") {
                     if (myzoomlevel > 14) {
                         myzoomlevel = 14;
                     }
                 }
                 else {
                     if (myzoomlevel > 17) {
                         myzoomlevel = 17;
                     }
                 }
 
                 if (myzoomlevel != MyMap.getZoom()) {
                     MyMap.setZoom(myzoomlevel);
                 }
 
                 var centerPoint = bounds.getCenter();
                 MyMap.setCenter(centerPoint);
                 MyMap.setZoom(myzoomlevel);
 
             }
             if (CurrentMap == "微软卫星图" || CurrentMap == "微软普通图") {
                 init = false;
                 MyMap.SetCenterAndZoom(point, 15);
             }
             if (CurrentMap == "51地图") {
 
                 init = false;
                 if (Root.childNodes.length == 1) {
                     MyMap.moveToCenter(point, 1);
                 }
                 if (Root.childNodes.length > 1) {
                     MyMap.getBestMap(points);
                 }
             }*/

        /*
        if (CurrentMap == "百度地图") {
            if (init == true) {

                if (Root.childNodes.length == 1) {
                    MyMap.centerAndZoom(point, 18);
                }
                if (Root.childNodes.length > 1) {
                    MyMap.setViewport(points);
                }
            }
            else {
                if (Root.childNodes.length == 1) {
                    MyMap.centerAndZoom(point,18);
                 //   MyMap.panTo(point);
                }
                if (Root.childNodes.length > 1) {
                    MyMap.setViewport(points);
                }
            }


            init = false;
        }
        */
        /*
            if (CurrentMap == "自定义地图") {
                init = false;
                MyMap.zoomToExtent(bounds, true);

                var myzoomlevel = MyMap.getZoom() - 1;
                if (myzoomlevel > 16) {
                    myzoomlevel = 16;
                }
                if (myzoomlevel != MyMap.getZoom()) {
                    MyMap.zoomTo(myzoomlevel + 1);
                }
            }
        }
        */
        info += "</table>";
        GetBiaoZhu();


        AdjustJason();
        var myWindow = document.getElementById('jason');
        myWindow.innerHTML = info;


    }
    catch (err) {
    }
}

function SetBaiDuLabel(iconStr, point, label, MyMap, currentX, currentY, currentAddress, DirectionString) {
    var Rotation = 0;

    iconStr = iconStr.replace(".png.png", ".png");
    if (iconStr == "")
        iconStr = "car_1.png";
    if (iconStr.length > 5 && iconStr.substring(0, 5) == "car_1") {

        var iconStrList = iconStr.split('_');
        if (iconStrList.length == 3) {

            iconStrList[2] = iconStrList[2].replace(".png", "");

            if (iconStrList[2] == "0") {

                if (DirectionString == "正北") {
                    Rotation = 0;
                }
                else if (DirectionString == "东北") {
                    Rotation = 45;
                }
                else if (DirectionString == "西北") {
                    Rotation = 315;
                }
                else if (DirectionString == "正东") {
                    Rotation = 90;
                }
                else if (DirectionString == "东南") {
                    Rotation = 135;
                }
                else if (DirectionString == "正南") {
                    Rotation = 180;
                }
                else if (DirectionString == "西南") {
                    Rotation = 225;
                }
                else if (DirectionString == "正西") {
                    Rotation = 270;
                }
                else {
                    Rotation = parseInt(iconStrList[2]);
                }

            }
            else
                Rotation = parseInt(iconStrList[2]);
            iconStr = iconStrList[0] + "_" + iconStrList[1] + ".png";
        }
        else {
            if (DirectionString == "正北") {
                Rotation = 0;
            }
            else if (DirectionString == "东北") {
                Rotation = 45;
            }
            else if (DirectionString == "西北") {
                Rotation = 315;
            }
            else if (DirectionString == "正东") {
                Rotation = 90;
            }
            else if (DirectionString == "东南") {
                Rotation = 135;
            }
            else if (DirectionString == "正南") {
                Rotation = 180;
            }
            else if (DirectionString == "西南") {
                Rotation = 225;
            }
            else if (DirectionString == "正西") {
                Rotation = 270;
            }
            else {
                Rotation = 0;
            }
        }
    }
    var myIcon = new BMap.Icon("/images/icons/" + iconStr, new BMap.Size(30, 30));
    marker = new BMap.Marker(point, { icon: myIcon });  // 创建标注
    if (Rotation > 0)
        marker.setRotation(Rotation);


    var addPoiBtnHtml = "";// "<input type='button' value = '添加标注' onclick='addPoiFromBaiduPopup(" + currentX + "," + currentY + ",\"" + currentAddress + "\")'></input>"
    var infoWindowHtml = "<div><p style='font-size:14px;'>" + label + "</p> " + addPoiBtnHtml + "</div>";


    var infoWindow1 = new BMap.InfoWindow(infoWindowHtml);
    marker.addEventListener("mouseover", function () { this.openInfoWindow(infoWindow1); });

    MyMap.addOverlay(marker);
    // points.push(point);
}


function GetXMLAsyn(ReturnXML) {
    if (ReturnXML.value != null) {
        AddPointToMyMap2(ReturnXML);
    }

}

function AddPointToMyMap() {
    $.ajax({
        type: "Post",
        url: "/Monitor/Monitor.aspx",
        data: { cmd: "BuildMyMap", IDS: IDSValMap },
        dataType: "html",
        success: function (data) {
            if (data != "0" && data != "") {
                AddPointToMyMap2(data);
            }
            else {
                AddPointToMyMap2("");
            }
        }
    });
    //Map.BuildMyMapXML(GetXMLAsyn);
}

function mouseover(evt) {

    MyMap.popups[parseFloat(this.id)].show();
    OpenLayers.Event.stop(evt);
}
function mouseout(evt) {

    MyMap.popups[parseFloat(this.id)].hide();
    OpenLayers.Event.stop(evt);
}



function getClickCallBack(marker, html) {
    return function () { marker.openInfoWinHtml(html) };
}

function CreateVEShape(point, label, type) {
    var newShape = new VEShape(VEShapeType.Pushpin, point);
    newShape.SetTitle(label);

    if (type.indexOf("闪烁") != -1) {
        newShape.SetCustomIcon("images/icons/" + type + ".gif");
    }
    else {
        newShape.SetCustomIcon("images/icons/" + type + ".png");
    }
    return newShape;
}

function VERemoveAllLabels() {
    for (x = 0; x < VELabelID; x++) {
        var el = document.getElementById("VELabel" + x);
        el.parentNode.removeChild(el);
    }
    VELabelID = 0;
}

function GMCreateMarker(point, label, type) {
    var icon;
    if (type != '') {
        icon = new GIcon();
        if (type.indexOf("闪烁") != -1) {
            icon.image = "images/icons/" + type + ".gif";
        }
        else {
            icon.image = "images/icons/" + type + ".png";
        }

        icon.iconSize = new GSize(32, 32);
        icon.iconAnchor = new GPoint(16, 16);
        icon.infoWindowAnchor = new GPoint(5, 1);
    }
    else {
        icon = new GIcon(G_DEFAULT_ICON);
    }
    var marker = new GMarker(point, icon);
    GEvent.addListener(marker, "mouseover", function () {
        marker.openInfoWindowHtml(label);
    }
        );
    return marker;
}

function GMCreateMarkerHistory(latlng, labeltext) {
    var icon = new GIcon();
    icon.iconSize = new GSize(0, 0);
    icon.iconAnchor = new GPoint(0, 0);
    opts = {
        "icon": icon,
        "clickable": false,
        "draggable": false,
        "labelText": labeltext,
        "labelOffset": new GSize(-16, -48)
    };
    var marker = new GMLabeledMarker(latlng, opts);
    return marker;
}

function GMAddLabel(lat, lon, labeltext) {
    if (labeltext != '') {
        MyMap.addOverlay(GMCreateMarker2(new GLatLng(lat, lon), labeltext));
    }
}

function ResizeMap() {
    var wid = document.body.clientWidth;
    var hei = document.body.clientHeight;
    var myMap = document.getElementById('MyMap');
    myMap.style.height = hei + 15;// - 28;
    myMap.style.width = wid;
    //$("#tabTopDiv").css("top", (hei - 48) + "px");
    AdjustJason();



}

function AdjustJason() {

    var myMap = document.getElementById('MyMap');
    var widthX = myMap.clientWidth;
    var HeightX = myMap.clientHeight;
    var myWindow = document.getElementById('jason');
    myWindow.style.width = widthX + "px";

    var myWindow = document.getElementById('jason');
    myWindow.style.width = widthX;
    var mycount = 0;
    if (count > 0) {
        mycount = count + 1;
    }
    if (mycount > 6) {
        mycount = 6;
    }


    var myWindow2 = document.getElementById('toggle');
    myWindow2.style.width = widthX + "px";
    var jasonX = document.getElementById('jason');
    if (mycount <= 0) {
        myWindow2.style.display = "none";
        jasonX.style.display = "none";
    }
    else {
        myWindow2.style.display = "";
        jasonX.style.display = "";
    }
    if (SetShow == 0) {
        mycount = 0;
    }

    myWindow2.style.top = (document.body.clientHeight - mycount * 25 - 28 - 25 + 18) + "px";
    myWindow.style.top = (document.body.clientHeight - mycount * 25 - 28 + 12) + "px";
    myWindow.style.height = (2 + mycount * 25) + "px";

    if (expand) {
        myWindow = document.getElementById('toggle');
        myWindow.style.top = (document.body.clientHeight - mycount * 25 - 25 - 28 + 18) + "px";
        // myWindow.style.width = document.body.clientWidth;
    }

}

function setbar() {

    var mycount = 0;
    if (count > 0) {
        mycount = count + 1;
    }
    if (mycount > 6) {
        mycount = 6;
    }

    if (expand) {
        document.getElementById('toggle').style.top = document.body.clientHeight - 20 - 28;
        document.getElementById('myzoom').src = "images/2.png";
        expand = false;
    }
    else {
        document.getElementById('toggle').style.top = document.body.clientHeight - mycount * 20 - 20 - 28;
        document.getElementById('myzoom').src = "images/-1.png";
        expand = true;
    }
}

function FirstResizeMap() {
    load();
    ResizeMap();
}

var ToolbarState = "";
function MouseOverState(src, tools) {
    if (src == ToolbarState) {
        src.className = ToolbarState.className;
    }
    else {
        src.className = tools + "Over2";
    }
}

function MouseOverState1(src, tools) {
    if (src == ToolbarState) {
        src.className = ToolbarState.className;
    }
    else {
        src.className = tools + "Over3";
    }
}
function MouseOutState(src, tools) {
    if (src == ToolbarState) {
        src.className = ToolbarState.className;
    }
    else {
        src.className = tools + "Normal2";
    }
}


function Checkbox1_onclick() {
    if (document.Form1.chkAutoRefresh.checked == false) {
        document.Form1.chkAutoAlert.checked = false;
        document.Form1.chkAutoPan.checked = false;
    }
    ctimer2();
    //SelectInterval_onclick();
}

function SelectInterval_onclick() {
    clearInterval(mytimer);
    var Interval = document.getElementsByName("SelectInterval")[0].value
    mytimer = setInterval("Check()", Interval * 1000 + 5000);
}

function Checkbox2_onclick() {
    if (document.Form1.chkAutoAlert.checked) {
        document.Form1.chkAutoRefresh.checked = true;
        ctimer2();
    }
}


function ZoomToBBox(x1, y1, x2, y2) {
    var bounds;
    var point1;
    var point2;
    var points = new Array();
    document.Form1.chkAutoPan.checked = false;

    if (CurrentMap == "谷歌卫星图" || CurrentMap == "谷歌普通图" || CurrentMap == "谷歌地球") {


        point1 = new GLatLng(y1, x1);
        point2 = new GLatLng(y2, x2);
        bounds = new GLatLngBounds();
        bounds.extend(point1);
        bounds.extend(point2);
        var myzoomlevel = MyMap.getBoundsZoomLevel(bounds);
        if (myzoomlevel != MyMap.getZoom()) {
            MyMap.setZoom(myzoomlevel);
        }

        MyMap.panTo(bounds.getCenter());
        MyMap.getBoundsZoomLevel(bounds);
    }

    if (CurrentMap == "51地图") {
        point1 = new LTPoint(x1 * 100000, y1 * 100000);
        point2 = new LTPoint(x2 * 100000, y2 * 100000);
        points.push(point1);
        points.push(point2);
        MyMap.getBestMap(points);
    }
    if (CurrentMap == "百度地图") {

        point1 = new BMap.Point(x1, y1);
        point2 = new BMap.Point(x2, y2);
        points.push(point1);
        points.push(point2);
        MyMap.setViewport(points);
    }
    if (CurrentMap == "自定义地图") {

        point1 = new OpenLayers.LonLat(x1, y1);
        point2 = new OpenLayers.LonLat(x2, y2);
        bounds = new OpenLayers.Bounds();
        bounds.extend(point1);
        bounds.extend(point2);
        MyMap.zoomToExtent(bounds, true);
    }
}

function addPoiFromBaiduPopup(currentX, currentY, address) {
    //alert(currentX + "  " + currentY);
    // var poiUrl = "htmls/pois/EditPoi.aspx?PoiID=-1&x=" + currentX + "&y=" + currentY + "&address=" + address;
    //openWindow(poiUrl);
}

function ShowDeteil(GUserID) {
    var caption = "查看车辆信息";
    var url = "/CarManage/ViewCarInfo.aspx?GUserID=" + GUserID;
    var height = 400;
    var width = 700;
    GB_myShow(caption, url, height, width, null);
}



var lng1 = 0;
var lat1 = 0;
var lng2 = 0;
var lng2 = 0;

var driving;
var textDri;
var markerDri;
function showInfo(e) {
    if (lng1 == 0) {
        lng1 = e.point.lng;
        lat1 = e.point.lat;
        var Point1 = new BMap.Point(lng1, lat1);
        var points = [Point1];
        if (driving != null) {
            driving.clearResults();
            driving = null;
            if (textDri != null) {
                MyMap.removeOverlay(textDri);
                textDri = null;
            }
        }

        var myIcon = new BMap.Icon("/images/icons/StartPoint.png", new BMap.Size(29, 62));
        var point = new BMap.Point(lng1, lat1);
        var marker = new BMap.Marker(point, { icon: myIcon });  // 创建标注
        MyMap.addOverlay(marker);
        markerDri = marker;


        //var curve = new BMapLib.CurveLine(points, { strokeColor: "blue", strokeWeight: 3, strokeOpacity: 0.5 }); //创建弧线对象
        //MyMap.addOverlay(curve); //添加到地图中
    }
    else {

        lng2 = e.point.lng;
        lat2 = e.point.lat;
        var Point1 = new BMap.Point(lng1, lat1);
        var Point2 = new BMap.Point(lng2, lat2);
        var points = [Point1, Point2];
        var output = "";
        if (driving == null) {
            driving = new BMap.DrivingRoute(MyMap, {
                renderOptions: { map: MyMap },
                onSearchComplete: function (results) {
                    if (driving.getStatus() != BMAP_STATUS_SUCCESS) {
                        return;
                    }
                    var plan = results.getPlan(0);
                    // output = "";
                    // output += plan.getDuration(true) + "\n";                //获取时间
                    output += "距离：";
                    output += plan.getDistance(true);             //获取距离

                    var pointz = new BMap.Point(lng2, lat2);

                    var opts = {
                        position: pointz,    // 指定文本标注所在的地理位置
                        offset: new BMap.Size(30, -30)    //设置文本偏移量

                    }
                    var text = new BMap.Label(output, opts);  // 创建文本标注对象
                    text.setStyle({
                        color: "red",
                        fontSize: "12px",
                        height: "20px",
                        lineHeight: "20px",
                        fontFamily: "微软雅黑"
                    });
                    MyMap.addOverlay(text);
                    textDri = text;


                    MyMap.removeOverlay(markerDri);

                    //alert(output);
                },
                onPolylinesSet: function () {
                    //ssetTimeout(function () { alert(output) }, "1000");
                }
            });
        }
        driving.search(Point1, Point2);
        lng1 = 0;
        //iving.search("上地", "西单");

        /*
        var driving = new BMap.DrivingRoute(MyMap, {
            renderOptions: { map: MyMap, autoViewport: true },
            onSearchComplete: searchComplete,
            onPolylinesSet: function () {
                setTimeout(function () { alert(output) }, "1000");
            }
        });
        driving.search(Point1, Point2);
        */
        //var curve = new BMap.Polyline(points, { strokeColor: "blue", strokeWeight: 3, strokeOpacity: 0.5 }); //创建弧线对象
        //MyMap.addOverlay(curve); //添加到地图中
        // alert("两点距离:" + MyMap.getDistance(Point1, Point2) + "米。");
    }

}
var CursorStr;
function CleanClick() {
    if (MyMap != null) {

        MyMap.removeEventListener('click', showInfo2);
        MyMap.removeEventListener('click', showInfo3);
        MyMap.removeEventListener('click', showInfo);
        MyMap.removeEventListener('rightclick', CleanClick);
        MyMap.setDefaultCursor(CursorStr);

    }
}


function SetMapClick() {
    if (MyMap != null) {
        MyMap.removeEventListener('click', showInfo2);
        MyMap.removeEventListener('click', showInfo3);
        MyMap.removeEventListener('click', showInfo);
        MyMap.addEventListener("click", showInfo);
        MyMap.removeEventListener('rightclick', CleanClick);
        MyMap.addEventListener("rightclick", CleanClick);
        CursorStr = MyMap.getDefaultCursor();

        lng1 = 0;
        lat1 = 0;
        MyMap.setDefaultCursor("url(/Image/M2.cur),auto");
    }
}



function showInfo2(e) {

    lng1 = e.point.lng;
    lat1 = e.point.lat;

    var Point1 = new BMap.Point(lng1, lat1);
    var points = [Point1];

    AddLabel();
}

function SetMapClick2() {
    if (MyMap != null) {
        MyMap.removeEventListener('click', showInfo2);
        MyMap.removeEventListener('click', showInfo3);
        MyMap.removeEventListener('click', showInfo);
        MyMap.addEventListener("click", showInfo2);
        MyMap.removeEventListener('rightclick', CleanClick);
        MyMap.addEventListener("rightclick", CleanClick);
        CursorStr = MyMap.getDefaultCursor();
        if (markerDri != null)
            MyMap.removeOverlay(markerDri);
        //MyMap.setDefaultCursor("url('/Image/M1.png')");
        MyMap.setDefaultCursor("url(/Image/M1.cur),auto");

    }

}

function AddLabel() {
    var caption = "添加标注";
    var url = "/Monitor/AddlabelM.aspx?tempPointsStr=" + lng1 + ";" + lat1;
    var height = 220;
    var width = 380;
    GB_myShow(caption, url, height, width, CallBackLabel);
}

function CallBackLabel() {
    var obj = window.frames["GB_frame"].document.getElementById("GB_frame").contentWindow;

    var LNameObj = obj.document.getElementById("LName").value;

    var CompanyObj = obj.document.getElementById("Company").value;

    var RemarkObj = obj.document.getElementById("Remark").value;

    var HidSaveObj = obj.document.getElementById("HidSave").value;
    if (HidSaveObj == "1") {
        if (LNameObj != "") {
            var myIcon = new BMap.Icon("/Image/M1.png", new BMap.Size(30, 30));
            var point = new BMap.Point(lng1, lat1);
            var marker = new BMap.Marker(point, { icon: myIcon });  // 创建标注
            var label = '<div class=\'MapLabel\'><strong>' + LNameObj + '</strong>' +
                         '</br>单位:' + CompanyObj +
                         '</br>备注:' + RemarkObj +
                         '</div>';
            var addPoiBtnHtml = "";// "<input type='button' value = '添加标注' onclick='addPoiFromBaiduPopup(" + currentX + "," + currentY + ",\"" + currentAddress + "\")'></input>"
            var infoWindowHtml = "<div><p style='font-size:14px;'>" + label + "</p> </div>";
            var infoWindow1 = new BMap.InfoWindow(infoWindowHtml);
            marker.addEventListener("mouseover", function () { this.openInfoWindow(infoWindow1); });
            MyMap.addOverlay(marker);

            var opts = {
                position: point,    // 指定文本标注所在的地理位置
                offset: new BMap.Size(1, 0)    //设置文本偏移量

            }

            var text = new BMap.Label(LNameObj, opts);  // 创建文本标注对象
            text.setStyle({
                color: "Green",
                fontSize: "14px",
                height: "20px",
                lineHeight: "20px",
                fontFamily: "微软雅黑"
            });
            MyMap.addOverlay(text);
        }
    }
}

var PointsX = new Array();
var PolygonX;
var PolygonXLabel;
var tempPointsStr = "";
var BL = false;

var leftPointX = 0;
var bottomPointX = 0;
var RightPointX = 0;
var topPointX = 0;

function showInfo3(e) {
    lng1 = e.point.lng;
    lat1 = e.point.lat;

    var l = lng1;
    var b = lat1;
    if (leftPointX == 0)
        leftPointX = l;
    else if (leftPointX < l)
        leftPointX = l;
    if (bottomPointX == 0)
        bottomPointX = b;
    else if (bottomPointX < b)
        bottomPointX = b;

    if (RightPointX == 0)
        RightPointX = l;
    else if (RightPointX > l)
        RightPointX = l;
    if (topPointX == 0)
        topPointX = b;
    else if (topPointX > b)
        topPointX = b;

    var Point1 = new BMap.Point(lng1, lat1);
    if (PointsX == null)
        PointsX = new Array();
    if (PointsX.length == 2 && BL == true) {
        PointsX[1] = Point1;
        BL = false;
    }
    else {
        PointsX[PointsX.length] = Point1;
    }

    if (PointsX.length == 1) {
        var Point2 = new BMap.Point(lng1 + 0.000010, lat1);
        PointsX[PointsX.length] = Point2;
        BL = true;
    }

    // PointsX.push(Point1);
    tempPointsStr += lng1 + ";" + lat1 + ";";
    if (PolygonX != null) {
        MyMap.removeOverlay(PolygonX);
        PolygonX.removeEventListener('rightclick', AddLabel2);
    }
    PolygonX = new BMap.Polygon(
    PointsX, { strokeColor: "#f50704", fillColor: "#f50704", strokeWeight: 3, strokeOpacity: 0, fillOpacity: 0, });
    MyMap.addOverlay(PolygonX);
    if (PolygonXLabel == null || PolygonXLabel == "") {
        PolygonX.addEventListener("rightclick", AddLabel2);
    }
    else {
    }
}

function AddLabel2() {

    var caption = "添加区域";
    var url = "/Monitor/AddRail.aspx?tempPointsStr=" + tempPointsStr;
    var height = 260;
    var width = 380;
    GB_myShow(caption, url, height, width, CallBackLabel2);
}


function CallBackLabel2() {

    var obj = window.frames["GB_frame"].document.getElementById("GB_frame").contentWindow;

    var LNameObj = obj.document.getElementById("LName").value;

    var LTypeObj = obj.document.getElementById("LType").value;

    var LFaValueObj = obj.document.getElementById("LFaValue").value;

    var RemarkObj = obj.document.getElementById("Remark").value;

    var HidSaveObj = obj.document.getElementById("HidSave").value;
    if (HidSaveObj == "1") {


        // var myIcon = new BMap.Icon("/images/icons/" + iconStr, new BMap.Size(30, 30));

        var label = '<div class=\'MapLabel\'><strong>' + LNameObj + '</strong>' +
                     '</br>警告类型:' + LTypeObj +
                     '</br>阈值:' + LFaValueObj +
                     '</br>备注:' + RemarkObj +
                     '</div>';
        // var addPoiBtnHtml = "";// "<input type='button' value = '添加标注' onclick='addPoiFromBaiduPopup(" + currentX + "," + currentY + ",\"" + currentAddress + "\")'></input>"
        var infoWindowHtml = "<div><p style='font-size:14px;'>" + label + "</p> </div>";
        var infoWindow1 = new BMap.InfoWindow(infoWindowHtml);

        if (PolygonX != null) {
            MyMap.removeOverlay(PolygonX);
            PolygonX.removeEventListener('rightclick', AddLabel2);
        }
        PolygonX = new BMap.Polygon(
        PointsX, { strokeColor: "#f50704", fillColor: "#f50704", strokeWeight: 3, strokeOpacity: 0, fillOpacity: 0, });
        PolygonX.addEventListener("mouseover", function (e) {



            MyMap.openInfoWindow(infoWindow1, new BMap.Point(e.point.lng, e.point.lat));


        });//
        MyMap.addOverlay(PolygonX);


        var PointT = new BMap.Point((leftPointX + RightPointX) / 2, (bottomPointX + topPointX) / 2);
        var opts = {
            position: PointT,    // 指定文本标注所在的地理位置
            offset: new BMap.Size(1, 0)    //设置文本偏移量

        }

        var text = new BMap.Label(LNameObj, opts);  // 创建文本标注对象
        text.setStyle({
            color: "Green",
            fontSize: "18px",
            height: "20px",
            lineHeight: "20px",
            fontFamily: "微软雅黑"
        });
        MyMap.addOverlay(text);



        MyMap.addOverlay(Polygon1);





    }
}

function SetMapClick3() {
    if (MyMap != null) {
        MyMap.removeEventListener('click', showInfo2);
        MyMap.removeEventListener('click', showInfo3);
        MyMap.removeEventListener('click', showInfo);
        MyMap.addEventListener("click", showInfo3);
        MyMap.removeEventListener('rightclick', CleanClick);
        MyMap.addEventListener("rightclick", CleanClick);
        CursorStr = MyMap.getDefaultCursor();
        MyMap.setDefaultCursor("url(/Image/M3.cur),auto");
    }
}


//获取标注
function GetBiaoZhu() {

    $.ajax({
        type: "Post",
        url: "/Monitor/Monitor.aspx",
        data: { cmd: "BuildBiaoZhu" },
        dataType: "html",
        success: function (data) {

            if (data != "0" && data != "") {
                AddPointToMyMap3(data);
            }
            else {

            }
        }
    });
}

function AddPointToMyMap3(ReturnXML) {
    try {
        var expireString = "";// Map.GetExprieUsers().value;
        if (expireString != '') {
            alert(expireString);
        }

        var doc;
        if (window.ActiveXObject) {
            doc = new ActiveXObject("Microsoft.XMLDOM");
            doc.async = "false";
            doc.loadXML(ReturnXML);
        }
            // code for Mozilla, Firefox, Opera, etc.
        else {
            var parser = new DOMParser();
            doc = parser.parseFromString(ReturnXML, "text/xml");
        }
        // documentElement always represents the root node            
        var Root = doc.documentElement;

        for (i = 0; i < Root.childNodes.length; i++) {
            if (Root.childNodes[i].attributes[0] == null) {
                continue;
            }
            if (Root.childNodes[i].attributes[6].value == '1') {
                CreateArea(Root.childNodes[i].attributes[1].value, Root.childNodes[i].attributes[2].value, Root.childNodes[i].attributes[3].value, Root.childNodes[i].attributes[4].value, Root.childNodes[i].attributes[7].value)
            }
            if (Root.childNodes[i].attributes[6].value == '4') {
                CratePoint(Root.childNodes[i].attributes[1].value, Root.childNodes[i].attributes[5].value, Root.childNodes[i].attributes[4].value, Root.childNodes[i].attributes[7].value)
            }
        }
    }
    catch (err) { }
}

function CratePoint(LNameObj, CompanyObj, RemarkObj, PointsStr) {

    var PintList = PointsStr.split(';');
    if (PintList.length < 2)
        return;

    var Point1 = new BMap.Point(parseFloat(PintList[0]), parseFloat(PintList[1]));

    if (LNameObj != "") {
        var myIcon = new BMap.Icon("/Image/M1.png", new BMap.Size(30, 30));
        var point = Point1;
        var marker = new BMap.Marker(point, { icon: myIcon });  // 创建标注
        var label = '<div class=\'MapLabel\'><strong>' + LNameObj + '</strong>' +
                        '</br>单位:' + CompanyObj +
                        '</br>备注:' + RemarkObj +
                        '</div>';

        var addPoiBtnHtml = "";// "<input type='button' value = '添加标注' onclick='addPoiFromBaiduPopup(" + currentX + "," + currentY + ",\"" + currentAddress + "\")'></input>"
        var infoWindowHtml = "<div><p style='font-size:14px;'>" + label + "</p> </div>";
        var infoWindow1 = new BMap.InfoWindow(infoWindowHtml);
        marker.addEventListener("mouseover", function () { this.openInfoWindow(infoWindow1); });
        MyMap.addOverlay(marker);



        var opts = {
            position: Point1,    // 指定文本标注所在的地理位置
            offset: new BMap.Size(1, 0)    //设置文本偏移量

        }

        var text = new BMap.Label(LNameObj, opts);  // 创建文本标注对象
        text.setStyle({
            color: "Green",
            fontSize: "14px",
            height: "20px",
            lineHeight: "20px",
            fontFamily: "微软雅黑"
        });
        MyMap.addOverlay(text);


    }
}

function CreateArea(LNameObj, LTypeObj, LFaValueObj, RemarkObj, PointsStr) {
    var leftPoint = 0;
    var bottomPoint = 0;
    var RightPoint = 0;
    var topPoint = 0;
    var Pints1 = new Array();
    var PintList = PointsStr.split(';');
    var z = 0;
    for (var i = 0; i < PintList.length; i = i + 2) {
        if (i + 1 < PintList.length) {
            var l = parseFloat(PintList[i]);
            var b = parseFloat(PintList[i + 1]);
            if (leftPoint == 0)
                leftPoint = l;
            else if (leftPoint < l)
                leftPoint = l;
            if (bottomPoint == 0)
                bottomPoint = b;
            else if (bottomPoint < b)
                bottomPoint = b;

            if (RightPoint == 0)
                RightPoint = l;
            else if (RightPoint > l)
                RightPoint = l;
            if (topPoint == 0)
                topPoint = b;
            else if (topPoint > b)
                topPoint = b;


            var Point1 = new BMap.Point(parseFloat(PintList[i]), parseFloat(PintList[i + 1]));
            Pints1[z] = Point1;
            z++;
        }
    }

    // var myIcon = new BMap.Icon("/images/icons/" + iconStr, new BMap.Size(30, 30));
    var label = '<div class=\'MapLabel\'><strong>' + LNameObj + '</strong>' +
                 '</br>警告类型:' + LTypeObj +
                 '</br>阈值:' + LFaValueObj +
                 '</br>备注:' + RemarkObj +
                 '</div>';
    // var addPoiBtnHtml = "";// "<input type='button' value = '添加标注' onclick='addPoiFromBaiduPopup(" + currentX + "," + currentY + ",\"" + currentAddress + "\")'></input>"
    var infoWindowHtml = "<div><p style='font-size:14px;'>" + label + "</p> </div>";
    var infoWindow1 = new BMap.InfoWindow(infoWindowHtml);

    var Polygon1 = new BMap.Polygon(
    Pints1, { strokeColor: "#f50704", fillColor: "#f50704", strokeWeight: 3, strokeOpacity: 0, fillOpacity: 0, });
    Polygon1.addEventListener("mouseover", function (e) {
        MyMap.openInfoWindow(infoWindow1, new BMap.Point(e.point.lng, e.point.lat));
    });//


    var PointT = new BMap.Point((leftPoint + RightPoint) / 2, (bottomPoint + topPoint) / 2);
    var opts = {
        position: PointT,    // 指定文本标注所在的地理位置
        offset: new BMap.Size(15, -15)    //设置文本偏移量

    }

    var text = new BMap.Label(LNameObj, opts);  // 创建文本标注对象
    text.setStyle({
        color: "Green",
        fontSize: "18px",
        height: "20px",
        lineHeight: "20px",
        fontFamily: "微软雅黑"
    });
    MyMap.addOverlay(text);



    MyMap.addOverlay(Polygon1);

}


function OpenAmendPaiChe(id) {
    var caption = "快速派车";
    var url = "/CarManage/AddCarDispatch2.aspx?ID=" + id + "&HM=" + new Date().getTime();
    var height = 505;
    var width = 930;
    GB_myShow(caption, url, height, width, CallBackAmendPaiChe);
}
function CallBackAmendPaiChe() {
    //window.open("?<%=pagestr%>" + "&HM=" + new Date().getTime(), "_self");
    //var obj = window.frames["GB_frame"].document.getElementById("GB_frame").contentWindow;
    //var ifmObj = obj.document.getElementById("HidSave");
    //alert(ifmObj.value);        
}
