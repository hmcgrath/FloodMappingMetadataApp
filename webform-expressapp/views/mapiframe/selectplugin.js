window.select_coordinates = {
    countClicks: 0,
    coordslist: [], 
    reqcoordslist: [],
    coordsselected: false,
    showRecords: true,
    click: null,
    api: null,
    bundle: null,
    data: null,
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
            const esriApi = RAMP.GAPI.esriLoadApiClasses([
                ["esri/InfoTemplate", "InfoTemplate"], 
                ["esri/dijit/InfoWindow", "InfoWindow"]
            ]); 

            esriApi.then((bundle) => {
                this.bundle = bundle; 
                this.listenToClick(); 
            })

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
                this.api.esriMap.infoWindow.hide(); 
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
                this.data = data; 
                var idcounter = 100;
                for (const record of data) {
                    var stringlist = record.fullbox.split("(").join("").split(")").join("").split(",");
                    var boxlist = []; 

                    for (var i = 0; i < stringlist.length; i+= 2) {
                        boxlist.push([parseFloat(stringlist[i + 1]), parseFloat(stringlist[i])]); 
                    } 
                    var recordbox = new RAMP.GEO.Polygon(record.submissionid, boxlist, { outlineColor: [255, 130, 0], 
                                                                            fillColor: [255, 130, 0], fillOpacity:0.6,
                                                                            outlineWidth: 3 }); 
                    recordLayer.addGeometry(recordbox); 
                    idcounter++; 
                }
            }).then(() => {
                //prepare infowindows for each record
                for (const record of recordLayer.esriLayer.graphics) {
                    const recordTemplate = new this.bundle.InfoTemplate();
                    const recordData = this.data.filter((rec) => rec.submissionid === parseInt(record.geometry.apiId))[0]; 
                    recordTemplate.setTitle(record.apiId); 
                    recordTemplate.setContent(`Age of Mapping: ${recordData.lastprojupdate}</br>
                                                Flood Hazard Standard: ${recordData.floodhzdstd}</br>
                                                Project ID: ${recordData.projectid}</br>
                                                Project Name: ${recordData.projectname}</br>
                                                Official WC Name: ${recordData.officialwcname}</br>
                                                Local WC Name: ${recordData.localwcname}</br>
                                                <button type="button" id="${recordData.submissionid}" onClick=downloadCSV(this.id)>Download CSV of Records</button>`);
                    record.setInfoTemplate(recordTemplate); 
                }

                downloadCSV = (id) => {
                    var csvContent = "data:text/csv;charset=utf-8,"; 
                    var data = this.data.filter((rec) => rec.submissionid === parseInt(id));
                    if (data.length > 0) {
                        //write the fields first
                        var fieldsRow = Object.keys(data[0]).join(","); 
                        csvContent += fieldsRow + "\r\n";
                        for (const record of data){
                            for (const entry of Object.values(record)) {
                                let content = entry; 
                                if (typeof(content) === "string" && content.includes(",")) {
                                    content = "\"" + content + "\""; 
                                }
                                csvContent += content + ","
                            }
                            //let contentRow = Object.values(record).join(","); 
                            csvContent += "\r\n";
                        }
                        var encodedUri = encodeURI(csvContent); 
                        var download = document.createElement("a"); 
                        download.href = encodedUri; 
                        download.target = "_blank"; 
                        download.download = `${id}.csv`; 
                        download.click(); 
                    }
                }

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
        this.api.esriMap.infoWindow.hide(); 
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


