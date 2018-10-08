# Welcome to Online Tile Downloader !
## [DEMO Link](http://alikilic.org/tiledownloader/)
Usually People can find same examples in desktop applications. but i developed in a web application also with puse js code. Simple quite using. Everyone can download and use

![enter image description here](http://alikilic.org/tiledownloader/img/tiledownload.png)

# Libraries
 - [JSZip](https://stuk.github.io/jszip/) used for export zip file
 - [Filesaver](https://github.com/eligrey/FileSaver.js/) for download zip file
 - [LeafletJS](https://github.com/Leaflet/Leaflet) for show tile layers
 - [Bootstrap 3](https://getbootstrap.com/docs/3.3/components/) for Visual HTML component
 - [TurfJS](https://github.com/Turfjs/turf) for relation between geometries

You may have information about libraries using  **links!**

## Which WMS feeds are supported

 1. Google Street Maps
 2. Google Terrain Maps
 3. Google Satellite Maps
 4. Google Hybrid Maps
 5. Open Street Maps
 6. Open Topology Maps
 7. Like Vector Basemap
 8. Esri Satellite Maps
 9. CartoDB White Basemap
 10. Night Dark Basemap 



## You must Protect the Url Relations

Example WMTS Link : http://**{s}**.google.com/vt/lyrs=m&x=**{x}**&y=**{y}**&z=**{z}**

 - **{s}** is server subdomain name
 - **{z}** is zoom level - folder name
 - **{y}** is vertical number - folder name
 - **{x}** is horizantal number of tile - tile name for exmaple : 23412.png
*and if you have any tilelayer catalog you can add to list*

![enter image description here](http://alikilic.org/tiledownloader/img/tiledown2.png)

## Using

 1. Firstly draw a area geometry (Polygon, Rectangle, Circle)
 2. Click on the geometry you are drawing. 
 3. Please select Zoom Levels 
 4. Please select Basemap
 5. You can try to push calculate for learning some results. 
 6. Finally if you sure for get all tiles please click to download button

 ## Add a new MAP

 1. Push to add WMS Button
 2. Input a name ( My Basemap ) 
 3. Input Your Basemap Service URL Adres : ( like http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png) 
 4. Input your servers sub domain ( like a,b,c or another )
 5. Push to Show on the map than. 
 6. When you see your basemap on the map you can push to Add Button

## Some Links
 1. [My Blog](http://www.admin.alikilic.org/)
 2. [My Portfolio](http://www.portfolio.alikilic.org)