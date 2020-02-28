window.select_coordinates = {
    countClicks: 0,
    coordslist: [], 
    reqcoordslist: [],
    coordsselected: false,
    showRecords: true,
    click: null,
    api: null,
    init(rampApi) {
        this.api = rampApi; 
        this.listenToMapAdd(); 
        this.api.layersObj._identifyMode = []; 
        this.countClicks = 0; 
        this.coordslist = []; 
        this.reqcoordslist = []; 
        this.coordsselected = false; 
        this.showRecords = true; 
        this.click = null; 
    },
    listenToMapAdd() {
        RAMP.mapAdded.subscribe(() => {
            this.listenToClick(); 
        }); 
    },
    listenToClick() {
        //console.log(this.api.panels.legend.body.append("test")); 
        this.api.layersObj.addLayer("markerlayer");  
        const markerLayer = this.api.layers.getLayersById("markerlayer")[0]; 

        this.api.layersObj.addLayer("recordlayer");
        const recordLayer = this.api.layers.getLayersById("recordlayer")[0]; 

        this.click = this.api.click.subscribe((pointObject) => {
            this.addPointOnClick(pointObject, markerLayer, recordLayer); 
        }); 
        //console.log($(".rv-legend-root"));
        window.addEventListener("message", (e) => {
            if(e.data == "reset map") {
                this.showRecords = true; 
                recordLayer.esriLayer.setVisibility(this.showRecords); 
                this.resetMap(markerLayer, recordLayer); 
            }
            else if (e.data == "toggle record") {
                this.showRecords = !this.showRecords; 
                recordLayer.esriLayer.setVisibility(this.showRecords); 
            }
            else {
                return; 
            }
        });
    },
    addPointOnClick(pointObject, markerLayer, recordLayer) {
        const icon = 'M 50 0 100 100 50 200 0 100 Z';
        var marker = new RAMP.GEO.Point(this.countClicks, [pointObject.xy.x, pointObject.xy.y], {
            style: 'ICON',
            icon: icon,
            colour: [255, 0, 0, 0.75], width:25});
        markerLayer.addGeometry(marker);
        this.countClicks++;
        this.coordslist.push([pointObject.xy.x, pointObject.xy.y]);
        this.reqcoordslist.push([pointObject.xy.y, pointObject.xy.x]);
        if (this.countClicks >= 2) {
            //complete the rectangle 
            //point 3 - same latitude as point 1, same longitude as point 2
            //point 4 - same latitude as point 2, same longitude as point 1 
            var boundingcoords = this.reqcoordslist.join(",");
            var marker3 = new RAMP.GEO.Point(this.countClicks + 1, [this.coordslist[0][0], this.coordslist[1][1]],
                { style: 'ICON', icon: icon, colour: [255, 0, 0, 0.75], width: 25 });

            var marker4 = new RAMP.GEO.Point(this.countClicks + 2, [this.coordslist[1][0], this.coordslist[0][1]],
                { style: 'ICON', icon: icon, colour: [255, 0, 0, 0.75], width: 25 });

            markerLayer.addGeometry(marker3);
            markerLayer.addGeometry(marker4);

            //add the rectangle
            this.coordslist.push([this.coordslist[0][0], this.coordslist[1][1]]);
            this.coordslist.push([this.coordslist[1][0], this.coordslist[0][1]]);

            //TRY - swap the coordinates to comply with FGPV....
            let tmp = this.coordslist[2];
            this.coordslist[2] = this.coordslist[1];
            this.coordslist[1] = tmp;

            var rectangle = new RAMP.GEO.Polygon(2342, this.coordslist, { outlineColor: [255, 0, 0], outlineWidth: 3 });

            markerLayer.addGeometry(rectangle);
            
            $.getJSON("http://localhost:8080/api?boundingbox=" + boundingcoords, (data) => {
                var idcounter = 100;
                for (const record of data) {
                    var stringlist = record.fullbox.split("(").join("").split(")").join("").split(",");
                    var boxlist = []; 

                    for (var i = 0; i < stringlist.length; i+= 2) {
                        boxlist.push([parseFloat(stringlist[i + 1]), parseFloat(stringlist[i])]); 
                    } 
                    var recordbox = new RAMP.GEO.Polygon(idcounter, boxlist, { outlineColor: [255, 130, 0], 
                                                                            fillColor: [255, 130, 0], fillOpacity:0.6,
                                                                            outlineWidth: 3 }); 
                    recordLayer.addGeometry(recordbox); 
                    idcounter++; 
                }
            }).then(() => {
                //post a message
                //disable the event handler
                window.parent.postMessage("coordinates selected " + boundingcoords, "*");
                this.click.unsubscribe();
            });
        }    
    },
    resetMap(markerLayer, recordLayer) {
        //remove all geometry OR pass in an array of String? geometry IDs as param....  
        markerLayer.removeGeometry(); 
        recordLayer.removeGeometry(); 
        this.coordslist = []; 
        this.reqcoordslist = []; 
        this.countClicks = 0;
        
        //unsubscribe to prevent duplicate event handlers
        this.click.unsubscribe(); 
        this.click = this.api.click.subscribe((pointObject) => {
            this.addPointOnClick(pointObject, markerLayer, recordLayer); 
        }); 
    }
}


