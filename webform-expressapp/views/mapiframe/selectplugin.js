var api; 
var countClicks; 
var coordslist; 
var reqcoordslist; 
var coordsselected;

window.select_coordinates = {
    init(rampApi) {
        api = rampApi; 
        this.listenToMapAdd(); 
        api.layersObj._identifyMode = []; 
    },

    listenToMapAdd() {
        RAMP.mapAdded.subscribe(() => {
            countClicks = 0; 
            coordslist = []; 
            reqcoordslist = []; 
            coordsselected = false; 
            this.listenToClick(); 
        }); 
    },

    listenToClick() {
        api.layersObj.addLayer("markerlayer");  
        console.log(api.ui.configLegend.children[0]);
        
        window.addEventListener("message", (e) => {
            if(e.data == "reset map") {
                resetMap(); 
            }
            if(e.data == "load conservation") {
                window.parent.postMessage("started conservation load", "*");  
                loadConservationLayers(); 
            }
            else {
                return; 
            }
        });

        const markerLayer = api.layers.getLayersById("markerlayer")[0]; 
        const icon = 'M 50 0 100 100 50 200 0 100 Z';
        var click = api.click.subscribe((pointObject) => {
            addPointOnClick(pointObject);                 
        }); 

        function addPointOnClick(pointObject) {
            var marker = new RAMP.GEO.Point(countClicks, [pointObject.xy.x,
                pointObject.xy.y], {
                style: 'ICON',
                icon: icon,
                colour: [255,
                0, 0, 
                0.75], width: 
                25 });

                markerLayer.addGeometry(marker); 
                countClicks++; 
                coordslist.push([pointObject.xy.x, pointObject.xy.y]);
                reqcoordslist.push([pointObject.xy.y, pointObject.xy.x]);  
                if (countClicks >= 2) {
                    //complete the rectangle 
                    //point 3 - same latitude as point 1, same longitude as point 2
                    //point 4 - same latitude as point 2, same longitude as point 1 
                    var boundingcoords = reqcoordslist.join(",");
                    var marker3 = new RAMP.GEO.Point(countClicks + 1, [coordslist[0][0], coordslist[1][1]], 
                                                    {style: 'ICON', icon: icon, colour: [255, 0, 0, 0.75], width: 25 }); 
                    
                    var marker4 = new RAMP.GEO.Point(countClicks + 2, [coordslist[1][0], coordslist[0][1]], 
                                                    {style: 'ICON', icon: icon, colour: [255, 0, 0, 0.75], width: 25 }); 
                    
                    markerLayer.addGeometry(marker3);
                    markerLayer.addGeometry(marker4); 
                    
                    //add the rectangle
                    coordslist.push([coordslist[0][0], coordslist[1][1]]);
                    coordslist.push([coordslist[1][0], coordslist[0][1]]); 

                    //TRY - swap the coordinates....
                    let tmp = coordslist[2]; 
                    coordslist[2] = coordslist[1]; 
                    coordslist[1] = tmp; 

                    var rectangle = new RAMP.GEO.Polygon(2342, coordslist, {outlineColor: [255,0,0], outlineWidth: 3});
                    
                    markerLayer.addGeometry(rectangle); 
                    
                    //post a message
                    window.parent.postMessage("coordinates selected " + boundingcoords, "*");  
                    //disable the event handler
                    click.unsubscribe(); 
                }
        }

        function resetMap() {
            //remove all geometry OR pass in an array of String? geometry IDs as param....  
            markerLayer.removeGeometry(); 
            coordslist = []; 
            reqcoordslist = []; 
            countClicks = 0;

            //unsubscribing prevents duplicate event handlers 
            click.unsubscribe(); 
            click = api.click.subscribe((pointObject) => {
                addPointOnClick(pointObject); 
            }); 
        }

        function loadConservationLayers() {
            
            var count = 100000; 

            $.getJSON("http://localhost:8080/api/cacount", (data) => {
                 
                /* Create five even intervals (beginning from 0) for grouping
                    conservation authorities based on the number of records they hold
                */

                //get the maximum number of records
                var maxCount = Math.max(...Object.values(data).map(x => x[1])); 
                //round up to the nearest five 
                maxCount += (5 - (maxCount % 5));
                //get the size of each interval  
                var intervalSize = maxCount / 5; 
                //enum of polygon colors
                const colors = {
                    //NOTE: WE TREAT ZERO AS A SEPARATE INTERVAL
                    "-1": [255, 255, 255],
                    0: [235, 230, 223],
                    1: [217, 194, 177],
                    2: [175, 186, 196],
                    3: [125, 154, 179],
                    4: [67, 100, 128]
                }
                
                for (const ca of Object.keys(data)) {
                    //data[ca][0] is the list of coordinates
                    
                    //determine what interval the CA falls under 
                    var intervalNum = Math.floor((data[ca][1] - 1)/(intervalSize)); 
                    var capolygon = new RAMP.GEO.Polygon(count, data[ca][0], {outlineColor: [220,5,0], fillColor: colors[intervalNum], fillOpacity:0.8, outlineWidth: 3});
                    count++; 
                    markerLayer.addGeometry(capolygon); 
                }
                window.parent.postMessage("finished conservation load", "*"); 
            });

        }
    }
}


