window.heatmap = {
    showCaLayer: true,
    api: null,
    esriApi: null, 
    geometryService: null,
    serviceurl: null,
    cacount: null,
    cadata: null,
    legendpanel: null,
    bundle: null,
    /**
     * Initializes the plugin
     * @param {any} rampApi - FGPV map instance
     */
    init(rampApi) {
        this.api = rampApi; 
        this.listenToMapAdd(); 
        this.api.layersObj._identifyMode = []; 
        this.serviceurl = "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"; 
    },
    /**
     * Performs additional initializations upon the map instance loading
     */
    listenToMapAdd() {
        RAMP.mapAdded.subscribe(() => {
            this.legendpanel = this.api.panels.create("legendpanel");
            
            //load esri API classes 
            const esriApi = RAMP.GAPI.esriLoadApiClasses([["esri/tasks/GeometryService", "GeomService"], 
            ["esri/geometry/Polygon", "Polygon"], 
            ["esri/geometry/Point", "Point"], 
            ["esri/SpatialReference", "SpatialReference"], 
            ["esri/tasks/ProjectParameters", "ProjectParameters"], 
            ["esri/InfoTemplate", "InfoTemplate"],
            ["esri/dijit/PopupTemplate", "PopupTemplate"],
            ["esri/dijit/InfoWindow", "InfoWindow"],
            ["esri/InfoWindowBase", "InfoWindowBase"], 
            ["esri/symbols/SimpleFillSymbol"], 
            ["esri/symbols/SimpleLineSymbol"], 
            ["esri/Color"]
            ]); 

            esriApi.then((bundle) => {
                                this.esriApi = RAMP.GAPI.esriBundle; 
                                this.bundle = bundle; 
                                this.infoTemplate = bundle.InfoTemplate; 
                                //add other necessary classes..... 
                            })
                    .then(() => this.loadConservationLayers())
                    .then(() => this.setDefaultHeatmap())
                    .then(() => this.loadConservationData())
                    .then(() => this.addEventListeners()); 
        }); 
    },
    /**
     * Loads the base polygons for all conservation authorities in ontario 
     */
    loadConservationLayers() {
        return new Promise((resolve, reject) => {
            this.api.layersObj.addLayer("calayer");
            const caLayer = this.api.layers.getLayersById("calayer")[0]; 
            window.parent.postMessage("started conservation load", "*");  
            $.getJSON("http://localhost:8080/api/cacount?countonly=true", (data) => {
                //create object instance of the conservation authority record count data
                this.cacount = data; 
                for (const ca of Object.keys(data)) {
                    //ID is now the conservation authority name
                    var capolygon = new RAMP.GEO.Polygon(ca, data[ca][0] /*, {outlineColor: [220,5,0], fillColor: colors[intervalNum], fillOpacity:0.8, outlineWidth: 3}*/);
                    caLayer.addGeometry(capolygon); 
                }
                console.log(caLayer.esriLayer.graphics); 
                for (const ca of caLayer.esriLayer.graphics) {
                    var popupTemplate = new this.bundle.PopupTemplate({
                        title: ca.geometry.apiId,
                        description: `Number of Records: ${this.cacount[ca.geometry.apiId][1]}\
                                    <button type="button">Show Records On Map</button><br>
                                    <button type="button" id="${ca.geometry.apiId}" onClick=downloadCSV(this.id)>Download CSV of Records</button>`, 
                    });
                    ca.setInfoTemplate(popupTemplate); 
                    /**
                     * Downloads a CSV of records 
                     */
                    downloadCSV = (caName) => {
                        var data = this.cadata[caName]; 
                        var csvContent = "data:text/csv;charset=utf-8,"; 
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
                            download.download = `${caName}.csv`; 
                            download.click(); 
                        }
                        else {
                            alert("No data exists for this CA."); 
                        }
                    };
                }
                resolve(); 
            });
        }); 
    },
    /**
     * Loads the default heatmap layer (a heatmap for the number of records each conservation authority has)
     */
    setDefaultHeatmap() {
        const caLayer = this.api.layers.getLayersById("calayer")[0]; 
        //get the maximum number of records
        var maxCount = Math.max(...Object.values(this.cacount).map(x => x[1])); 
        //round up to the nearest five 
        maxCount += (5 - (maxCount % 5));
        //get the size of each interval  
        var intervalSize = maxCount / 5; 
        //enum of polygon colors
        const colors = {
            //NOTE: WE TREAT ZERO AS A SEPARATE INTERVAL
            "-1": [237, 81, 81],
            0: [20, 158, 206],
            1: [167, 198, 54],
            2: [158, 85, 156],
            3: [252, 146, 41],
            4: [255, 222, 62]
        }
        var intervals = [["Zero", "(237,81,81)"]];  

        //get interval strings (for legend)
        for (var i = 1, j = 0; i <= maxCount; i+= intervalSize, j++) {
            let intervalString = i.toString() + "-" + (i + intervalSize - 1).toString(); 
            let colorString = colors[j].join(","); 
            colorString = "(" + colorString + ")"; 
            intervals.push([intervalString, colorString]); 
        }

        //create the legend panel
        var panelBody = $("<md-list>");
        for (const interval of intervals) {
            $(panelBody).append(
                `<md-list-item style="min-height:20px">\
                    <div style="width:10px;height:10px;border-style:solid;border-color:black;border-width:0.5px;background-color:rgb${interval[1]}"></div>\
                    <span style="padding-left:10px">${interval[0]}</span>\
                </md-list-item>`); 
        }
        //append the legend panel
        var panelTitle = `<span>Number of Records</span>`
        this.loadLegendPanel(panelTitle, panelBody); 

        for (const ca of caLayer.esriLayer.graphics) {
            var intervalNum = Math.floor((this.cacount[ca.geometry.apiId][1] - 1)/(intervalSize)); 
            const color = colors[intervalNum];
            //set opacity of 0.7 for polygon fill 
            color.push(0.7); 
            var symbol = new this.esriApi.SimpleFillSymbol(this.esriApi.SimpleFillSymbol.STYLE_SOLID, 
                new this.esriApi.SimpleLineSymbol(this.esriApi.SimpleLineSymbol.STYLE_SOLID,
                new this.esriApi.Color([220,5,0]), 2), new this.esriApi.Color(color)
            ); 
            ca.setSymbol(symbol);
        }
    }, 
    /**
     * Loads Heatmap for Drainage Area
     */
    setDrainageAreaHeatmap() {
        const caLayer = this.api.layers.getLayersById("calayer")[0];
        var totalDrainageAreas = {}; 
        for (const key of Object.keys(this.cadata)) {
            let totaldrainagearea = 0; 
            for (const record of this.cadata[key]) {
                totaldrainagearea += parseFloat(record["drainagearea"])
            }
            totalDrainageAreas[key] = totaldrainagearea; 
        }
        console.log(totalDrainageAreas); 

        //get the maximum number of records
        var maxCount = Math.max(...Object.values(totalDrainageAreas)); 
        //round up to the nearest five 
        maxCount += (5 - (maxCount % 5));
        //get the size of each interval  
        var intervalSize = maxCount / 5; 
        //enum of polygon colors
        const colors = {
            //NOTE: WE TREAT ZERO AS A SEPARATE INTERVAL
            "-1": [237, 81, 81],
            0: [20, 158, 206],
            1: [167, 198, 54],
            2: [158, 85, 156],
            3: [252, 146, 41],
            4: [255, 222, 62]
        }
        var intervals = [["Zero", "(237,81,81)"]]; 

        //get interval strings (for legend)
        for (var i = 1, j = 0; i <= maxCount; i+= intervalSize, j++) {
            let intervalString = i.toString() + "-" + (i + intervalSize - 1).toString(); 
            let colorString = colors[j].join(","); 
            colorString = "(" + colorString + ")"; 
            intervals.push([intervalString, colorString]); 
        }

        //create the legend panel
        var panelBody = $("<md-list>");
        for (const interval of intervals) {
            $(panelBody).append(
                `<md-list-item style="min-height:20px">\
                    <div style="width:10px;height:10px;border-style:solid;border-color:black;border-width:0.5px;background-color:rgb${interval[1]}"></div>\
                    <span style="padding-left:10px">${interval[0]}</span>\
                </md-list-item>`); 

        }
        var panelTitle = `<span>Drainage Area (sq m)</span>`
        //append the legend panel
        this.loadLegendPanel(panelTitle, panelBody); 

        for (const ca of caLayer.esriLayer.graphics) {
            var intervalNum = Math.floor((totalDrainageAreas[ca.geometry.apiId] - 1)/(intervalSize)); 
            const color = colors[intervalNum];
            //set opacity of 0.7 for polygon fill 
            color.push(0.7); 
            var symbol = new this.esriApi.SimpleFillSymbol(this.esriApi.SimpleFillSymbol.STYLE_SOLID, 
                new this.esriApi.SimpleLineSymbol(this.esriApi.SimpleLineSymbol.STYLE_SOLID,
                new this.esriApi.Color([220,5,0]), 2), new this.esriApi.Color(color)
            ); 
            ca.setSymbol(symbol);
        }
        
    },
    /**
     * Loads Heatmap for Age of Mapping
     */
    setAgeHeatmap() {
        const caLayer = this.api.layers.getLayersById("calayer")[0];
        
        //color ramp for decades
        const colors = {
            "No Data": [255, 255, 255],
            "Before 1960": [255, 0, 0], 
            "1960s": [255, 85, 0],
            "1970s": [255, 170, 0], 
            "1980s": [255, 255, 0], 
            "1990s": [170, 255, 0], 
            "2000s": [0, 255, 85], 
            "2010s": [0, 255, 255], 
            "After 2010": [0, 170, 255]
        }; 
        //object containing the most common age of mapping decade for each CA
        var meanAgeOfMapping = {}; 

        //AVERAGE (MEAN) THE YEARS (NOT DECADES) OUT AND SIMPLY ROUND THE AVERAGE TO A NEAREST DECADE!!!
        for (const key of Object.keys(this.cadata)) {
            var avgYear = 0; 
            //if records exist
            if (this.cadata[key].length > 0) {
                for (const record of this.cadata[key]) {
                    avgYear += record["lastprojupdate"]; 
                }
                avgYear = Math.floor(avgYear/this.cadata[key].length); 
            }
            var avgDecade = Math.floor(avgYear / 10) * 10; 
            if (avgDecade === 0) {
                meanAgeOfMapping[key] = "No Data";
            }
            else if(avgDecade < 1960) {
                meanAgeOfMapping[key] = "Before 1960";
            }
            else if (avgDecade > 2010) {
                meanAgeOfMapping[key] = "After 2010";
            }
            else {
                meanAgeOfMapping[key] = avgDecade.toString() + "s";
            }
        }

        //prepare legend panel
        var panelBody = $("<md-list>");
        for (const decade of Object.keys(colors)) {
            //format colors for HTML attribute 
            const htmlColor = "(" + colors[decade].join(",") + ")";
            $(panelBody).append(
                `<md-list-item style="min-height:20px">\
                    <div style="width:10px;height:10px;border-style:solid;border-color:black;border-width:0.5px;background-color:rgb${htmlColor}"></div>\
                    <span style="padding-left:10px">${decade}</span>\
                </md-list-item>`); 
        }
        var panelTitle = `<span>Age of Mapping</span>`; 

        //load legend panel
        this.loadLegendPanel(panelTitle, panelBody); 

        //change polygon colors 
        for (const ca of caLayer.esriLayer.graphics) {
            const color = colors[meanAgeOfMapping[ca.geometry.apiId]]
            //set opacity of 0.7 for polygon fill 
            color.push(0.7); 
            var symbol = new this.esriApi.SimpleFillSymbol(this.esriApi.SimpleFillSymbol.STYLE_SOLID, 
                new this.esriApi.SimpleLineSymbol(this.esriApi.SimpleLineSymbol.STYLE_SOLID,
                new this.esriApi.Color([220,5,0]), 2), new this.esriApi.Color(color)
            ); 
            ca.setSymbol(symbol);
        }
    },
    /**
     * Creates a legend panel for the current heatmap being displayed
     * @param {any} panelBody - HTML element for the panel's body 
     * @param {any} panelTitle - HTML element for Panel's title
     */
    loadLegendPanel(panelTitle, panelBody) {
        this.legendpanel.body = panelTitle; 
        this.legendpanel.body.append(panelBody);
        this.legendpanel.body.css("height", "100%"); 
        this.legendpanel.element.css({
            top: "70%", 
            left: "80%",
            right: "5%", 
            bottom:"5%" 
        });
        this.legendpanel.open(); 
    },
    //loads all the flood record data for each CA. 
    loadConservationData() {
        return new Promise((resolve, reject) => {
            $.getJSON("http://localhost:8080/api/cacount", (data) => {
                this.cadata = data; 
                //move postMessage here to ensure data is accessible 
                resolve(); 
            });
        }); 
    }, 
    /**
     * Adds all the event listeners for the plugin 
     */
    addEventListeners() {
        
        //console.log(this.cadata); 
        //this.api.esriMap.showInfoWindowOnClick = true; 
        //this.api.esriMap.setInfoWindowOnClick = true; 

        //this.esriApi = RAMP.GAPI.esriBundle; 
        //object property instance of a geometryservice
        window.addEventListener("message", (e) => {
            console.log(e.data);
            if (e.data === "Drainage Area") {
                this.setDrainageAreaHeatmap(); 
            } 
            if (e.data === "reset map") {
                this.setDefaultHeatmap(); 
            }
            if (e.data === "Age of Mapping") {
                this.setAgeHeatmap();
            }
            else {
                return; 
            }
        }); 

        /*
        this.api.esriMap.on("click", (e) => {
            //alert($("link[href='https://js.arcgis.com/3.31/esri/css/esri.css']").length); 
            //e.preventDefault(); 
            //e.stopPropagation(); 
            //console.log(e); 
            //alert(e.mapPoint.y); 
            if (e.graphic) {
                this.api.esriMap.infoWindow.setContent(e.graphic.getContent()); 
                this.api.esriMap.infoWindow.show(e.screenPoint, this.api.esriMap.getInfoWindowAnchor(e.screenPoint)); 
                alert(this.api.esriMap.infoWindow.count); 
                //alert(this.api.esriMap.infoWindow.domNode.innerHTML); 
                console.log(e.graphic.geometry); 
                console.log(this.cadata[e.graphic.geometry.apiId]); 
            }
        });
        */
        
        //post finished loading message
        
        window.parent.postMessage("finished conservation load", "*");

        /*
        this.geometryService = this.esriApi.GeometryService(this.serviceurl); 
        this.api.click.subscribe((evt) => {
            this.polygonClick(evt); 
        });
        */
    },

    /**
     * Determines if a conservation authority polygon was clicked on
     * @param {any} evt - the click event  
     */
    polygonClick(evt) {
        //convert to a point with same spatial reference..... 

        //create point object from click event
        const clickPoint = new this.esriApi.Point(evt.xy.x, evt.xy.y);
        
        //create projection parameters 
        const geometries = [clickPoint]; 
        const targetSR = this.esriApi.SpatialReference({wkid: 3978});
        const transformation = {wkid: 1188}; 

        const transformparams = new this.esriApi.ProjectParameters(); 
        transformparams.geometries = geometries; 
        transformparams.outSR = targetSR; 
        transformparams.transformation = transformation; 
        
        const caLayer = this.api.layers.getLayersById("calayer")[0];
        const cadata = this.cadata; 
        //apply the transformation using geometryservice and use polygon.contains() to determine if click falls within a polygon
        this.geometryService.project(transformparams, (outputpoint) => {
            for (const ca of caLayer.esriLayer.graphics) {
                if (ca.geometry.contains(outputpoint[0])) {
                    console.log(cadata[ca.geometry.apiId]); 
                }
            }
        });

        

    }
}


