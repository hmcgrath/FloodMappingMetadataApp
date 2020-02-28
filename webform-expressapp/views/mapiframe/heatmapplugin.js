window.heatmap = {
    showCaLayer: true,
    api: null,
    esriAPI: null, 
    geometryService: null,
    serviceurl: null,
    init(rampApi) {
        this.api = rampApi; 
        this.listenToMapAdd(); 
        this.api.layersObj._identifyMode = []; 
        this.serviceurl = "https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"; 
    },
    listenToMapAdd() {
        RAMP.mapAdded.subscribe(() => {
            //console.log(this.api.panels.legend.body.append("test")); 
            //console.log($(".rv-legend-root"));
            
            //load esri API classes 
            const esriApi = RAMP.GAPI.esriLoadApiClasses([["esri/tasks/GeometryService", "GeomService"], 
            ["esri/geometry/Polygon", "Polygon"], 
            ["esri/geometry/Point", "Point"], 
            ["esri/SpatialReference", "SpatialReference"], 
            ["esri/tasks/ProjectParameters", "ProjectParameters"]
            ]); 

            esriApi.then(() => this.loadConservationLayers())
                    .then(() => {
                        this.esriApi = RAMP.GAPI.esriBundle; 
                        //object property instance of a geometryservice
                        this.geometryService = this.esriApi.GeometryService(this.serviceurl); 
                        this.api.click.subscribe((evt) => {
                            this.polygonClick(evt); 
                        });
                    }); 
        }); 
    },
    loadConservationLayers() {
        return new Promise((resolve, reject) => {
            this.api.layersObj.addLayer("calayer");
            const caLayer = this.api.layers.getLayersById("calayer")[0]; 

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
                var intervals = [["Zero", "(255,255,255)"]]; 
                //get interval strings (for legend)
                for (var i = 1, j = 0; i <= maxCount; i+= intervalSize, j++) {
                    let intervalString = i.toString() + "-" + (i + intervalSize - 1).toString(); 
                    let colorString = colors[j].join(","); 
                    colorString = "(" + colorString + ")"; 
                    intervals.push([intervalString, colorString]); 
                }
                console.log(intervals); 
                //panel body
                var panelBody = $("<md-list>");
                for (const interval of intervals) {
                    $(panelBody).append(
                        `<md-list-item style="min-height:20px">\
                            <div style="width:10px;height:10px;border-style:solid;border-color:black;border-width:0.5px;background-color:rgb${interval[1]}"></div>\
                            <span style="padding-left:10px">${interval[0]}</span>\
                        </md-list-item>`); 
                }             
                for (const ca of Object.keys(data)) {
                    //data[ca][0] is the list of coordinates
                    //determine what interval the CA falls under 
                    var intervalNum = Math.floor((data[ca][1] - 1)/(intervalSize)); 
                    //ID is now the conservation authority name
                    var capolygon = new RAMP.GEO.Polygon(ca, data[ca][0], {outlineColor: [220,5,0], fillColor: colors[intervalNum], fillOpacity:0.8, outlineWidth: 3});
                    caLayer.addGeometry(capolygon); 
                }
                this.loadLegendPanel(panelBody); 
                window.parent.postMessage("finished conservation load", "*"); 
                resolve(); 
            });
        }); 
    },
    loadLegendPanel(panelBody) {
        const legendPanel = this.api.panels.create("legendpanel"); 
        legendPanel.body = `<span>Number of Records</span>`; 
        legendPanel.body.append(panelBody);
        legendPanel.body.css("height", "100%"); 
        legendPanel.element.css({
            top: "70%", 
            left: "80%",
            right: "5%", 
            bottom:"5%" 
        });
        legendPanel.open(); 
    },
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
        //apply the transformation using geometryservice and use polygon.contains() to determine if click falls within a polygon
        this.geometryService.project(transformparams, function(outputpoint) {
            for (const ca of caLayer.esriLayer.graphics) {
                if (ca.geometry.contains(outputpoint[0])) {
                    console.log(ca.geometry); 
                }
            }
        });

    }
}


