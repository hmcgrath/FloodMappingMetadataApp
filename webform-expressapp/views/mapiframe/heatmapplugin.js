window.heatmap = {
    showCaLayer: true,
    api: null,
    esriApi: null, 
    geometryService: null,
    serviceurl: null,
    cacount: null,
    cadata: null,
    legendpanel: null,
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
            ["esri/symbols/SimpleFillSymbol"], 
            ["esri/symbols/SimpleLineSymbol"], 
            ["esri/Color"]
            ]); 

            esriApi.then(() => this.esriApi = RAMP.GAPI.esriBundle)
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
                /* Create five even intervals (beginning from 0) for grouping
                    conservation authorities based on the number of records they hold
                */      
                for (const ca of Object.keys(data)) {
                    //ID is now the conservation authority name
                    var capolygon = new RAMP.GEO.Polygon(ca, data[ca][0] /*, {outlineColor: [220,5,0], fillColor: colors[intervalNum], fillOpacity:0.8, outlineWidth: 3}*/);
                    caLayer.addGeometry(capolygon); 
                }
                //this.loadLegendPanel(panelBody); 
                console.log(caLayer.esriLayer.graphics); 
                for (const ca of caLayer.esriLayer.graphics) {
                    /*
                    console.log(RAMP.GAPI.esriBundle); 
                    console.log(ca.setInfoTemplate); 
                    var infoTemplate = new RAMP.GAPI.esriBundle.InfoTemplate(); 
                    infoTemplate.setTitle("<h1>Test<h1>"); 
                    infoTemplate.setContent("test"); 
                    ca.setInfoTemplate(infoTemplate); 
                    */
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
            "-1": [255, 255, 255],
            0: [235, 230, 223],
            1: [217, 194, 177],
            2: [175, 186, 196],
            3: [125, 154, 179],
            4: [67, 100, 128]
        }
        var intervals = [["Zero", "(255,255,255)"]]; 

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
            var symbol = new this.esriApi.SimpleFillSymbol(this.esriApi.SimpleFillSymbol.STYLE_SOLID, 
                new this.esriApi.SimpleLineSymbol(this.esriApi.SimpleLineSymbol.STYLE_SOLID,
                new this.esriApi.Color([220,5,0]), 2), new this.esriApi.Color(colors[intervalNum])
            ); 
            ca.setSymbol(symbol);
        }
    }, 
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
            "-1": [255, 255, 255],
            0: [235, 230, 223],
            1: [217, 194, 177],
            2: [175, 186, 196],
            3: [125, 154, 179],
            4: [67, 100, 128]
        }
        var intervals = [["Zero", "(255,255,255)"]]; 

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
            var symbol = new this.esriApi.SimpleFillSymbol(this.esriApi.SimpleFillSymbol.STYLE_SOLID, 
                new this.esriApi.SimpleLineSymbol(this.esriApi.SimpleLineSymbol.STYLE_SOLID,
                new this.esriApi.Color([220,5,0]), 2), new this.esriApi.Color(colors[intervalNum])
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
                window.parent.postMessage("finished conservation load", "*"); 
                resolve(); 
            });
        }); 
    }, 
    /**
     * Adds all the event listeners for the plugin 
     */
    addEventListeners() {
        console.log(this.cadata); 
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
        }); 
        this.geometryService = this.esriApi.GeometryService(this.serviceurl); 
        this.api.click.subscribe((evt) => {
            this.polygonClick(evt); 
        });
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


