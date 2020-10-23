window.heatmap = {
    showCaLayer: true,
    api: null,
    esriApi: null, 
    geometryService: null,
    serviceurl: null,
    cacount: null,
    cadata: null,
    alldata: null,
    casummary: null,
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
            ["esri/Color"],
            ["dojox/charting/Chart2D", "Chart2D"], 
            ["dojo/dom-construct", "domConstruct"]
            ]); 

            //initalization
            esriApi.then((bundle) => {
                                this.esriApi = RAMP.GAPI.esriBundle; 
                                this.bundle = bundle; 
                                this.infoTemplate = bundle.InfoTemplate; 
                                //add other necessary classes..... 
                            })
                    .then(() => this.loadConservationLayers())
                    .then(() => this.loadConservationData())
                    .then(() => this.loadDefaultInfoPanel())
                    .then(() => this.setDefaultHeatmap())
                    .then(() => this.addEventListeners()); 
        }); 
    },
    /**
     * Loads the base polygons for all conservation authorities in ontario 
     */
    loadConservationLayers() {
        return new Promise((resolve, reject) => {
            //layer for conservation authorities
            this.api.layersObj.addLayer("calayer");
            //layer for individual records
            this.api.layersObj.addLayer("recordlayer");
            const caLayer = this.api.layers.getLayersById("calayer")[0]; 
            window.parent.postMessage("started conservation load", "*");  
            $.getJSON("/api/cacount?countonly=true", (data) => {
                //create object instance of the conservation authority record count data
                this.cacount = data; 
                for (const ca of Object.keys(data)) {
                    //ID is now the conservation authority name
                    var capolygon = new RAMP.GEO.Polygon(ca, data[ca][0] /*, {outlineColor: [220,5,0], fillColor: colors[intervalNum], fillOpacity:0.8, outlineWidth: 3}*/);
                    caLayer.addGeometry(capolygon); 
                }
                //console.log(caLayer.esriLayer.graphics); 
                resolve(); 
            });
        }); 
    },

    /**
     * Load the Info Panels
     */
    loadDefaultInfoPanel() {
        const caLayer = this.api.layers.getLayersById("calayer")[0]; 
        const recordLayer = this.api.layers.getLayersById("recordlayer")[0]; 
        for (const ca of caLayer.esriLayer.graphics) {
            var popupTemplate = new this.bundle.PopupTemplate({
                title: ca.geometry.apiId,
                
                description:(this.cacount[ca.geometry.apiId][1] === 0 ? "" :
                            `Number of Records: ${this.cacount[ca.geometry.apiId][1]}\
                            <button type="button" id="${ca.geometry.apiId}" onClick=showDataOnMap(this.id)>Show Records On Map</button><br>
                            <button type="button" id="${ca.geometry.apiId}" onClick=_downloadCSV(this.id)>Download CSV of Records</button>`), 
                
            });
            ca.setInfoTemplate(popupTemplate); 

            _downloadCSV = (caName) => {
                var data = this.cadata[caName]; 
                this.downloadCSV(data, caName); 
            };

            /**
             * Shows all the records for each conservation authority on the map
             */
            showDataOnMap = (caName) => {
                //hide the conservation authority layer
                caLayer.esriLayer.setVisibility(false); 
                this.api.esriMap.infoWindow.hide();  
                for (const record of this.cadata[caName]) {
                    var stringlist = record.fullbox.split("(").join("").split(")").join("").split(",");
                    var boxlist = []; 
                    for (var i = 0; i < stringlist.length; i+= 2) {
                        boxlist.push([parseFloat(stringlist[i + 1]), parseFloat(stringlist[i])]); 
                    } 
                    var recordbox = new RAMP.GEO.Polygon(record.submissionid, boxlist, { outlineColor: [255, 130, 0], 
                        outlineWidth: 3 }); 
                    recordLayer.addGeometry(recordbox); 
                }
                var extent = this.esriApi.graphicsUtils.graphicsExtent(recordLayer.esriLayer.graphics);
                this.api.esriMap.setExtent(extent);  
            }; 

        }
    },

    /**
     * 
     * @param {Array} data array of data to convert into a CSV
     * @param {string} fileName name of CSV file
     */
    downloadCSV(data, fileName){
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
            download.download = `${fileName}.csv`; 
            download.click(); 
        }
        else {
            alert("No data exists for this CA."); 
        }
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
            $.getJSON("/api/cacount", (data) => {
                this.cadata = data;
                $.getJSON("/api/cacount?formatted=true", (summarydata) => {
                    this.casummary = summarydata; 
                    $.getJSON("/api", (alldata) => {
                        this.alldata = alldata; 
                        resolve(); 
                    });
                });               
            })
            .catch((err) => reject(err));
            
        }); 
    }, 

    /**
     * Gets the plotly graph for the corresponding category name, returns the HTMLDivElement with the chart.
     * @param {string} caName - name of conservation authority
     * @param {string} categoryName - name of category
     * 
     */
    getChart(caName, categoryName) {    
        //get the data required for graph
        const payload = this.casummary[caName][categoryName]; 
        if (Object.keys(this.casummary[caName]["drainagearea"]).length === 0) {
            return ("No Data Found."); 
        }
        //plotly graph test
        var testdiv = document.createElement("div"); 
        testdiv.id = "testgraph"; 
         //make pie graph
        Plotly.newPlot(testdiv, [{
            labels: Object.keys(payload), 
            values: Object.values(payload), 
            type: "pie",
            //textinfo: "label+percent", 
            textposition: "inside", 
            domain: {x: [0, 0.5]},
            automargin: true
        }], {
            title: caName + " : " + categoryName,
            titlefont: {
                size: 14
            },
            autosize: true, 
            margin: {
                "l": 20
            },
            width: 490, 
            height: 300,
        }, {responsive: true});
        return testdiv;
    },

    /**
     * Sets the info panel of conservation authorities to graph a certain category
     * @param {string} categoryName - name of category to graph 
     */
    loadInfoPanel(categoryName) {
        this.api.esriMap.infoWindow.hide();  
        this.api.esriMap.infoWindow.resize(500, 500); 
        const caLayer = this.api.layers.getLayersById("calayer")[0];
        for (const ca of caLayer.esriLayer.graphics) {
            var graphTemplate = new this.bundle.InfoTemplate(); 
            graphTemplate.setTitle(ca.geometry.apiId); 
            graphTemplate.setContent(this.getChart(ca.geometry.apiId, categoryName));
            ca.setInfoTemplate(graphTemplate); 
        }
    }, 

    resetMap() {
        const caLayer = this.api.layers.getLayersById("calayer")[0];
        const recordLayer = this.api.layers.getLayersById("recordlayer")[0];
        caLayer.esriLayer.setVisibility(true); 
        recordLayer.removeGeometry(); 
        this.api.esriMap.infoWindow.hide();  
        this.api.esriMap.infoWindow.resize(250, 250); 
        this.setDefaultHeatmap(); 
        this.loadDefaultInfoPanel(); 
        //Do not reset extent
        //var extent = this.esriApi.graphicsUtils.graphicsExtent(caLayer.esriLayer.graphics);
        //this.api.esriMap.setExtent(extent);   
    },

    /**
     * Adds all the event listeners for the plugin 
     */
    addEventListeners() {
        const caLayer = this.api.layers.getLayersById("calayer")[0];
        const recordLayer = this.api.layers.getLayersById("recordlayer")[0];
        var extent = this.esriApi.graphicsUtils.graphicsExtent(caLayer.esriLayer.graphics);
        this.api.esriMap.setExtent(extent); 

        window.addEventListener("message", (e) => {
            console.log(e);
            //mapping the full category names to the abbreviated database column names
            const graphCategories = {
                "Project Category": "projectcat", 
                "Type of Record": "typeofrecord", 
                "Flood Hazard Standard": "floodhzdstd", 
                "Financial Support": "financialsupport", 
                "Dataset Status": "datasetstatus", 
                "Summary Report Available": "summreportavail", 
                "Updated Since Original": "updatesinceorig"
            };
            if (e.data === "Total Drainage Area Mapped") {
                this.resetMap(); 
                this.setDrainageAreaHeatmap(); 
            } 
            //make sure the layer is visible again
            else if (e.data === "reset map") {
                this.resetMap();         
            }
            else if (e.data === "Age of Mapping") {
                this.resetMap(); 
                this.setAgeHeatmap();
            }
            else if (Object.keys(graphCategories).includes(e.data)){
                this.resetMap(); 
                this.loadInfoPanel(graphCategories[e.data]);
            }
            else if (typeof(e.data) === "object"){
                //clear any existing geometry
                recordLayer.removeGeometry(); 
                if (Object.keys(e.data).includes("show")) {
                    caLayer.esriLayer.setVisibility(false); 
                    this.api.esriMap.infoWindow.hide();  
                    const categoryId = e.data["show"][0]; 
                    const categoryVal = e.data["show"][1]; 
                    const displayRecords = this.alldata.filter((record) => record[categoryId] === categoryVal); 
                    
                    for (const record of displayRecords) {
                        var stringlist = record.fullbox.split("(").join("").split(")").join("").split(",");
                        var boxlist = []; 
                        for (var i = 0; i < stringlist.length; i+= 2) {
                            boxlist.push([parseFloat(stringlist[i + 1]), parseFloat(stringlist[i])]); 
                        } 
                        var recordbox = new RAMP.GEO.Polygon(record.submissionid, boxlist, { outlineColor: [255, 130, 0], 
                            outlineWidth: 3, fillColor: [255, 130, 0], fillOpacity: 0.8 }); 
                        //create the info window
                        
                        recordLayer.addGeometry(recordbox); 
                    }
                    var recordextent = this.esriApi.graphicsUtils.graphicsExtent(recordLayer.esriLayer.graphics);
                    this.api.esriMap.setExtent(recordextent); 

                    for (const record of recordLayer.esriLayer.graphics) {                        
                        var infoPopup = new this.bundle.InfoTemplate(); 
                        const recdata = this.alldata.filter((rec) => rec.submissionid === parseInt(record.geometry.apiId))[0];
                        infoPopup.setTitle(recdata.projectid); 
                        infoPopup.setContent(`Age of Mapping: ${recdata.lastprojupdate}</br>
                                            Flood Hazard Standard: ${recdata.floodhzdstd}</br>
                                            Project ID: ${recdata.projectid}</br>
                                            Project Name: ${recdata.projectname}</br>
                                            Official WC Name: ${recdata.officialwcname}</br>
                                            Local WC Name: ${recdata.localwcname}</br>
                                            <button type="button" id="${recdata.projectid}" onClick=_downloadCSV(this.id)>Download CSV of Records</button>`); 
                        record.setInfoTemplate(infoPopup); 
                    }

                    _downloadCSV = (projectid) => {
                        var data = displayRecords; 
                        this.downloadCSV(data, projectid); 
                    }

                }
            }
            else {
                return; 
            }
        }); 
        //post finished loading message
        window.parent.postMessage("finished conservation load", "*");
    },

    
}


