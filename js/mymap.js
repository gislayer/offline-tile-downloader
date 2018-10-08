// yatay x, düşey y, y yukardan aşağı artıyor, x ise soldan sağa doğru artar. folder z => y => x.png
var center = [38.41893,27.12853];
var map = L.map('map',{
    zoomControl:false
}).setView(center, 13);
var globalBaseMap = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'Online Tile Downloader | <a href="http://www.portfolio.alikilic.org">Ali KILIÇ | Sr. GIS Developer</a>',
    maxZoom: 20,
    subdomains:['a','b','c']
}).addTo(map);
var globalbbox = null;
var globalGeoJSON = null;
var globalMB = 0;

BootstrapDialog.show({
    title: 'How can i use ?',
    message: '<b>Using : </b> Firstly draw a area geometry (Polygon, Rectangle, Circle). Than, click on the geometry you are drawing. Please select your options and you can try to push calculate for learning some results. Finally if you sure for get all tiles please click to download button',
    buttons: [{
        label: 'Close',
        cssClass:"btn-danger",
        action: function(dialog) {
            dialog.close();
        }
    }]
});

var zoomLevels = {
    "1":{checked:true,level:1},
    "2":{checked:true,level:2},
    "3":{checked:true,level:3},
    "4":{checked:true,level:4},
    "5":{checked:true,level:5},
    "6":{checked:true,level:6},
    "7":{checked:true,level:7},
    "8":{checked:true,level:8},
    "9":{checked:true,level:9},
    "10":{checked:true,level:10},
    "11":{checked:true,level:11},
    "12":{checked:true,level:12},
    "13":{checked:true,level:13},
    "14":{checked:true,level:14},
    "15":{checked:true,level:15},
    "16":{checked:true,level:16},
    "17":{checked:true,level:17},
    "18":{checked:true,level:18},
    "19":{checked:false,level:19},
    "20":{checked:false,level:20}
};

var basemaps = {
    openStreetMap:{
        name:"Open Street Map",
        url:"http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        maxZoom: 19,
        subdomains:['a','b','c'],
        checked:false,
        size:6 
    },
    openTopologyMap:{
        name:"Open Topology Map",
        url:"http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        maxZoom: 17,
        subdomains:['a','b','c'],
        checked:false,
        size:6 
    }
};

function latlng2tile(coordinate,zoom) {
    var lat = coordinate["lat"];
    var lng = coordinate["lng"];
    var tilex = Math.floor((lng+180)/360*Math.pow(2,zoom));
    var tiley = Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom));
    return {x:tilex,y:tiley}; 
}

function tile2latlng(tile,zoom){
    var tilex = tile["x"];
    var tiley = tile["y"];
    var lng = tilex/Math.pow(2,zoom)*360-180;
    var n=Math.PI-2*Math.PI*tiley/Math.pow(2,zoom);
    var lat = 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))
    return {lng:lng,lat:lat};
}
function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
function tile2long(x,z) {
    return (x/Math.pow(2,z)*360-180);
}
function tile2lat(y,z) {
  var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
  return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
}

function ondalikli(sayi,virgul){
    sayi = parseFloat(sayi);
    virgul = parseInt(virgul);
    virgul=Math.pow(10,virgul);
    var deger=Math.round(sayi*virgul)/virgul;
    return deger;
}

var features = {
    Poly:{},
    Rectangle:{},
    Line:{},
    Marker:{},
    Circle:{}
  };
  var options = {
      position: 'topright', 
      drawMarker: false,
      drawPolyline: false,
      drawRectangle: true, 
      drawPolygon: true,
      drawCircle: true, 
      cutPolygon: false, 
      editMode: true,
      removalMode: true 
  };
  map.pm.addControls(options);

  map.on('pm:create', function(e) {
      var tip = e.shape;
      var f = e.layer;
      e.layer.shape = e.shape;
      var lid = f._leaflet_id;
      f.bindTooltip('Click To Polygon For Download Tileset');
      features[tip][lid]=f;
      features[tip][lid].on('click',function(a){
      openDownloadPanel(a.target);
    });
  });

  function setProgressBar(now,max){
    var orn = parseInt((now*100)/max);
    var ondnow = ondalikli(now,3);
    var progress = '<div class="progress"> <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em; width: '+ondnow+'%;"> '+ondnow+'%</div></div>';
    $("#downloadStatus").html(progress);
}

  function openDownloadPanel(feature){
      var lid = feature._leaflet_id;
      var shape = feature.shape;
      var geojson = null;
      if(shape=="Circle"){
        geojson = turf.circle([feature._latlng.lng, feature._latlng.lat], feature._mRadius, {steps: 360, units: 'meters', properties: {}});
      }else{
        geojson = feature.toGeoJSON();
      }
      var alan = ondalikli(turf.area(geojson),3);
      globalbbox = turf.bbox(geojson);
      globalGeoJSON = geojson;
      if(map.pm._globalRemovalMode){
        delete features[shape][lid];
      }else{
        var selectZoom = '<select style="width:100%; display:none;" id="zooms" multiple="multiple">';   
        for(var i in zoomLevels){
            if(zoomLevels[i].checked){
                selectZoom+='<option value="'+zoomLevels[i].level+'" selected="selected">Zoom Level '+zoomLevels[i].level+'</option>';
            }else{
                selectZoom+='<option value="'+zoomLevels[i].level+'">Zoom Level '+zoomLevels[i].level+'</option>';
            }
        }
        selectZoom+='</select>';
        var selectBasemaps = '<select style="width:100%;" onchange="basemapChange(this);" id="basemaplist" class="form-control">';
        for(var i in basemaps){
            if(basemaps[i].checked){
                selectBasemaps+='<option value="'+i+'" selected="selected">'+basemaps[i].name+'</option>';
            }else{
                selectBasemaps+='<option value="'+i+'">'+basemaps[i].name+'</option>';
            }
        }
        selectBasemaps+='</select>';
        var grup1 = '<div class="form-group"><label>Selected Zoom Levels</label><br/>'+selectZoom+'</div>';
        var grup2 = '<div class="form-group"><label>Select Basemap</label><br/>'+selectBasemaps+'</div>';
        var grup3 = '<div class="form-group"><label>Geometry Type</label><br/>'+shape+'</div>';
        var grup4 = '<div class="form-group"><label>Area</label><br/>'+alan+' ㎡</div>';
        var grup5 = '<div class="form-group"><label>Tile Count</label><br/><span id="tilecount"><a onclick="calculateTileNum();" href="#">Calculate</a></span></div>';
        var grup6 = '<div class="form-group"><label>Estimated Memory</label><br/><span id="tilesize"><a onclick="calculateTileNum();" href="#">Calculate</a></span></div>';
        var grup7 = '<div class="form-group"><label>Downloading Status : <span id="tilestatus">0</span>/<span id="tilecount2">0</span> Tile Downloaded</label><br/><div id="downloadStatus"></div></div>';
        var grup8 = '<div class="form-group"><label>Total Size : </label> <span id="totalsize">0</span> MB</div>';




        BootstrapDialog.show({
            title: 'Tile Download Options Panel',
            message: grup1+grup2+grup3+grup4+grup5+grup6+grup7+grup8,
            buttons: [{
                label: 'Close',
                cssClass:"btn-danger",
                action: function(dialog) {
                    dialog.close();
                }
            }, {
                label: 'Download',
                cssClass:"btn-success",
                action: function(dialog) {
                    var lastZooms = [];
                    var basemapOption = null;
                    for(var i in zoomLevels){
                        if(zoomLevels[i].checked){
                            lastZooms.push(zoomLevels[i].level);
                        }
                    }
                    for(var i in basemaps){
                        if(basemaps[i].checked){
                            basemapOption = basemaps[i];
                            break;
                        }
                    }
                    var bbox = globalbbox;
                    createDownloadTileSet(lastZooms,basemapOption,bbox);
                }
            }],
            onshown:function(dialog){
                $('#zooms').multiselect({
                    includeSelectAllOption: true,
                    onChange: function(option, checked) {
                        
                        var zoomnumber = parseInt(option[0].value);
                        zoomLevels[zoomnumber].checked=checked;
                    },
                    onSelectAll:function(){
                        for(var i in zoomLevels){
                            zoomLevels[i].checked=true;
                        }
                    },
                    onDeselectAll:function(){
                        for(var i in zoomLevels){
                            zoomLevels[i].checked=false;
                        }
                    }
                });
                $('#zooms').css("display","block");
                setProgressBar(0,100);
            }
        });
      }
  }

  function calculateTileNum(){
      debugger;
    var lastZooms = [];
    var basemapOpt = null;
    for(var i in zoomLevels){
        if(zoomLevels[i].checked){
            lastZooms.push(zoomLevels[i].level);
        }
    }
    for(var i in basemaps){
        if(basemaps[i].checked){
            basemapOpt = basemaps[i];
            break;
        }
    }
    var bbox = globalbbox;
    var tileNum = 0;
    if(lastZooms.length>0){
    for(var i in lastZooms){
        var zoom = parseInt(lastZooms[i]);
        if(zoom>basemapOpt.maxZoom || zoom<0){
            break;
        }else{
            var tiley1 = lat2tile(bbox[1],zoom);
            var tiley2 = lat2tile(bbox[3],zoom);
            if(tiley2<0){tiley2=0;}
            for(var y = tiley2; y<=tiley1; y++){
                var tilex1 = long2tile(bbox[0],zoom);
                var tilex2 = long2tile(bbox[2],zoom);
                if(tilex1<0){tilex1=0;}
                for(var x = tilex1; x<=tilex2; x++){
                    var lat = tile2lat(y,zoom);
                    var lng = tile2long(x,zoom);
                    var inArea = turf.booleanPointInPolygon(turf.point([lng,lat]),globalGeoJSON);
                    if(inArea || tilex1==tilex2){
                        tileNum++;
                    }
                }
            }
        }
        
    }
    var kb = (tileNum*basemapOpt.size)/1000;
    kb = ondalikli(kb,2);
    $("#tilecount").html(tileNum +' Tiles'+' <a onclick="calculateTileNum();" href="#"> Calculate Again</a>');
    $("#tilesize").html(kb+' MB '+'<a onclick="calculateTileNum();" href="#"> Calculate Again</a>');
    $("#tilecount2").html(tileNum);
    $("#tilestatus").html('0');
    $("#totalsize").html('0');
}else{
    alert("Please Select Zoom Level");
}
    
  }

  function createDownloadTileSet(zoomArray,basemapOpt,bbox){
    $("#tilestatus").html('0');
    $("#totalsize").html('0');
    var zip = new JSZip();
    var tileSet = {
        url:basemapOpt.url,
        filename : basemapOpt.name+"-"+Date.now()+".zip",
        servers:basemapOpt.subdomains,
        maxZoom:basemapOpt.maxZoom,
        data:{}
    };
    var tileNum = 0;
    for(var i in zoomArray){
        var zoom = parseInt(zoomArray[i]);
        if(zoom>basemapOpt.maxZoom || zoom<0){
            break;
        }else{
            tileSet["data"]["zoom"+zoom]={
                id:zoom,
                y:{}
            };
            var tiley1 = lat2tile(bbox[1],zoom);
            var tiley2 = lat2tile(bbox[3],zoom);
            if(tiley2<0){tiley2=0;}
            for(var y = tiley2; y<=tiley1; y++){
                tileSet["data"]["zoom"+zoom]["y"]["y"+y] = {
                    id:y,
                    x:{}
                };
                var tilex1 = long2tile(bbox[0],zoom);
                var tilex2 = long2tile(bbox[2],zoom);
                if(tilex1<0){tilex1=0;}
                for(var x = tilex1; x<=tilex2; x++){
                    var lat = tile2lat(y,zoom);
                    var lng = tile2long(x,zoom);
                    var inArea = turf.booleanPointInPolygon(turf.point([lng,lat]),globalGeoJSON);
                    if(inArea || tilex1===tilex2){
                        //
                        var url = tileSet.url;
                        var serv = tileSet.servers[(Date.now()%4)];
                        url = url.replace('{s}',serv);
                        url = url.replace('{x}',x);
                        url = url.replace('{y}',y);
                        url = url.replace('{z}',zoom);
                        zip.folder('data/tileset/'+zoom+'/'+y).file(x+'.png',urlToPromise(url,tileSet,[x,y,zoom]), {binary:true});
                        tileNum++;
                        tileSet["data"]["zoom"+zoom]["y"]["y"+y]["x"]["x"+x] = {
                            id:x,
                            adres:[x,y,zoom],
                            coordinate:{lat:lat,lng:lng},
                            status:false
                        };
                    }
                }
            } 
        }
        
    }
    debugger;
    var centroid = turf.centroid(globalGeoJSON);
    var coord = centroid.geometry.coordinates;
    var samplepage = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta http-equiv="X-UA-Compatible" content="ie=edge"> <title>Ali KILIC | Ofline Map by Online Tile Downloader</title> <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css" /> <script src="https://unpkg.com/leaflet@1.3.3/dist/leaflet.js"></script> </head> <body> <div id="map" style="position: fixed; width: 100%; height: 100%; left: 0; top: 0; margin: 0; padding: 0;"></div> </body> </html> <script> var center = ['+coord[1]+','+coord[0]+']; var zoom=16; var map = L.map(\'map\').setView(center,zoom); L.tileLayer(\'./tileset/{z}/{y}/{x}.png\', { attribution: \'&copy; Contact Links : <a href="http://www.portfolio.alikilic.org"> Ali KILIÇ | Sr. GIS Developer</a>\' }).addTo(map); L.marker(center).addTo(map) .bindPopup(\'Hello!... Find me on Linkedin | <a href="https://www.linkedin.com/in/alikilicharita/" target="_blank">Ali KILIC</a>\') .openPopup(); </script>';
    zip.folder('data').file('index.html',samplepage);
    var kb = (tileNum*basemapOpt.size)/1000;
    kb = ondalikli(kb,2);
    $("#tilecount").html(tileNum +' Tiles'+' <a onclick="calculateTileNum();" href="#"> Calculate Again</a>');
    $("#tilecount2").html(tileNum);
    $("#tilesize").html(kb+' MB '+'<a onclick="calculateTileNum();" href="#"> Calculate Again</a>');
    downloadTileSet(tileSet,tileNum,zip); 
  }

  function downloadTileSet(tileSet,tileNum,zip){

    var zipOnUpdate = function (metadata) {
        setProgressBar(metadata.percent,100);
      };
    
      zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 },
      }, zipOnUpdate).then(
        (blob) => {
          saveAs(blob, tileSet.filename);
          console.log('finish');
        }
      );

    
  }


  function urlToPromise(url,tileSet,arry) {
    var url2 = tileSet.url;
    var serv = tileSet.servers[(Date.now()%4)];
    url2 = url2.replace('{s}',serv);
    url2 = url2.replace('{x}',arry[0]);
    url2 = url2.replace('{y}',arry[1]);
    url2 = url2.replace('{z}',arry[2]);
    return new Promise(function(resolve, reject) {
      JSZipUtils.getBinaryContent(url, function (err, data) {
        if(err) {
            debugger;
            urlToPromise(url2,tileSet,arry);
        } else {
            var num = parseInt($("#tilestatus").html());
            num++;
            $("#tilestatus").html(num);
            globalMB+=data.byteLength;
            var globalMB2  = globalMB/1000000;
            $("#totalsize").html(globalMB2);
          resolve(data);
        }
      });
    });
  }

  function basemapChange(t){
      debugger;
        for(var i in basemaps){
            basemaps[i].checked=false;
        }
        basemaps[t.value].checked=true;
        var tilelayer = basemaps[t.value];
        globalBaseMap.remove();
        globalBaseMap=false;
        globalBaseMap = L.tileLayer(tilelayer.url,{
            attribution:'Online Tile Downloader | <a href="http://www.portfolio.alikilic.org">Ali KILIÇ | Sr. GIS Developer</a>',
            maxZoom: tilelayer.maxZoom,
            subdomains:tilelayer.subdomains
        }).addTo(map);
  }

  function addBasemap(){
    var grup0 = '<div class="form-group"><label>WMS Name</label><br/><input class="form-control" type="text" id="wmsname" placeholder="mywms"></div>';
    var grup1 = '<div class="form-group"><label>WMS Url Adress</label><br/><input class="form-control" type="text" id="wmsurl" placeholder="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></div>';
    var grup2 = '<div class="form-group"><label>Server Sub Domain Names</label><br/><input class="form-control" type="text" id="subdomains" placeholder="a,b,c"></div>';
    BootstrapDialog.show({
        title: 'Add Your Basemap URL',
        message: grup0+grup1+grup2,
        buttons: [
            {
                label: 'Close',
                cssClass:"btn-danger",
                action: function(dialog) {
                    dialog.close();
                }
            },
            {
                label: 'Show on the Map',
                cssClass:"btn-info",
                action: function(dialog) {
                    debugger;
                    var wmsname = $("#wmsname").val();
                    var wmsurl = $("#wmsurl").val();
                    var wmsdomains = $("#subdomains").val();
                    wmsdomainsArray = wmsdomains.split(',');
                    if(wmsurl!==""){
                        var name = wmsname || "New Basemap "+Date.now();
                        globalBaseMap.remove();
                        globalBaseMap=false;
                        var obj = {
                            attribution:'Online Tile Downloader | <a href="http://www.portfolio.alikilic.org">Ali KILIÇ | Sr. GIS Developer</a>',
                            maxZoom: 20
                        };
                        if(wmsdomainsArray.length>0){
                            obj.subdomains =  wmsdomainsArray;
                        }
                        globalBaseMap = L.tileLayer(wmsurl,obj).addTo(map);
                    }
                }
            },
            {
                label: 'Add',
                cssClass:"btn-success",
                action: function(dialog) {
                    var time = Date.now();
                    var name = "basemap"+time;
                    var wmsname = $("#wmsname").val();
                    var wmsurl = $("#wmsurl").val();
                    var wmsdomains = $("#subdomains").val();
                    wmsdomainsArray = wmsdomains.split(',');
                    wmsname = wmsname || "New Basemap "+Date.now();
                    if(wmsurl!==""){
                        var name = "basemap"+Date.now();
                        $("#basemaplist").append('<option value="'+name+'">'+wmsname+'</option>');
                        $("#basemaplist").val(name);
                        basemaps[name] = {
                            name:wmsname,
                            url:wmsurl,
                            maxZoom: 20,
                            subdomains:wmsdomainsArray,
                            checked:false,
                            size:20
                        };
                        basemapChange({value:name});
                    }
                    
                }
            }]
    });
  }

