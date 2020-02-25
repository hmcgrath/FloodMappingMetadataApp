var api; 

window.heatmap = {
    showCaLayer: true,
    init(rampApi) {
        api = rampApi; 
        this.listenToMapAdd(); 
        api.layersObj._identifyMode = []; 
    },

    listenToMapAdd() {
        RAMP.mapAdded.subscribe(() => {
            this.listenToClick(); 
        }); 
    },

    listenToClick() {
        //console.log(api.panels.legend.body.append("test")); 
        this.loadConservationLayers(); 
        //console.log($(".rv-legend-root"));
        window.addEventListener("message", (e) => {
            if (e.data === "toggle conservation") {
                const caLayer = api.layers.getLayersById("calayer")[0]; 
                this.showCaLayer = !this.showCaLayer; 
                caLayer.esriLayer.setVisibility(this.showCaLayer); 
            }
            else {
                return; 
            }
        });
    }, 
    
    loadConservationLayers() {
        api.layersObj.addLayer("calayer");
        const caLayer = api.layers.getLayersById("calayer")[0]; 

        //used to generate unique ID numbers for the polygons
        var count = 100000; 
        window.parent.postMessage("started conservation load", "*");  
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
                caLayer.addGeometry(capolygon); 
            }
            window.parent.postMessage("finished conservation load", "*"); 
        });
    }
}


