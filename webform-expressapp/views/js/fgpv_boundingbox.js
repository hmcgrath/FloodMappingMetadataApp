//map api object
var api;
var countClicks;
var coordslist; 
var reqcoordslist; 
var coordsselected; 
var genericCounts; 
var floodhzdstdcount; 
var drainageareacount; 
var financialsupportcount; 
var lastprojupdatecount; 

window.fgpv_boundingbox = {
    
    init(rampApi) {
        api = rampApi;
        this.listenToMapAdd(); 
        //disable the red circle
        api.layersObj._identifyMode = [];
        
    },

    //waits for map load
    listenToMapAdd() {
        RAMP.mapAdded.subscribe(() => {
            countClicks = 0;
            coordslist = [];
            //different ordering for the request parameters 
            reqcoordslist = [];
            coordsselected = false; 
            //callback control
            this.listenToClick(); 
            //add reset button, toggle layers for conservation authorities 
        });
    },

    //handles all clicking events tied to the map 
    listenToClick() {
        api.layersObj.addLayer("markerlayer");  
            
        const markerLayer = api.layers.getLayersById("markerlayer")[0]; 
        const icon = 'M 50 0 100 100 50 200 0 100 Z';
        var click = api.click.subscribe((pointObject) => {
            addPointOnClick(pointObject);                 
        }); 

        //if reset button is clicked
        $("#resetmap").click(reset);

        //upon create graph button click
        $(".graphbtn").click(createGraphTab);

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
                    console.log("/api?boundingbox=" + boundingcoords); 

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

                    //fetch data
                    getData(boundingcoords); 
                    
                    //enable collapsables
                    $(".list-group-item").removeClass("disabled"); 
                    
                    //disable create graph buttons 
                    $(".graphbtn").removeAttr("disabled"); 
                    $(".graphbtn").attr("disabled", "disabled"); 
                    
                    //disable the event handler
                    click.unsubscribe(); 
                }
        }

        //Get the data and populate dropdowns, create graphs
        function getData(boundingcoords) {
            //ajax call to database
            $.getJSON("/api?boundingbox=" + boundingcoords, function(data, status) {
                if (status == "success") {
                    //store counts of each category for project category, etc....
                    genericCounts = {"projectcat": {},
                                        "typeofrecord": {},
                                        "datasetstatus": {},
                                        "summreportavail": {},
                                        "updatesinceorig": {}};  
                    floodhzdstdcount = {}; 
                    financialsupportcount = {"FDRP" : 0, 
                                                "NDMP" : 0,
                                                "Conservation Authority" : 0, 
                                                "Municipal": 0, "Private": 0, "Other": 0}; 
                    var drainagearealist = []; 
                    drainageareacount = {}; 

                    var lastprojupdatelist = []; 
                    lastprojupdatecount = {}; 

                    //if there is actual data returned, enable the create graph buttons
                    if (data.length > 0) {
                        $(".graphbtn").removeAttr("disabled"); 
                    }

                    //populate the counts 
                    $.each(data, function(index, obj) {

                        //generic fields are Project Category, Type of Record, Dataset Status, Last Project Update
                        //Summary Report Available, Update Since Original
                        //all the fields that we can generically populate with a generic frequency counter
                        //goes through all the fields 
                        for (category in genericCounts) {
                            if (genericCounts[category].hasOwnProperty(obj[category])){
                                genericCounts[category][obj[category]] += 1; 
                            }

                            else {
                                genericCounts[category][obj[category]] = 1; 
                            }
                        }
                        //populate flood hazard standard 
                        obj["floodhzdstd"].forEach(function(val) {
                            if (floodhzdstdcount.hasOwnProperty(val)) {
                                floodhzdstdcount[val] += 1; 
                            }
                            else {
                                floodhzdstdcount[val] = 1; 
                            }
                        });

                        //populate financial support
                        if (obj["fedundertaking"] == "fdrp") {
                            financialsupportcount["FDRP"] += 1;
                        }   
                        if (obj["caundertaking"] == "yes") {
                            financialsupportcount["Conservation Authority"] += 1; 
                        }   
                        if (obj["munundertaking"] == "yes") {
                            financialsupportcount["Municipal"] += 1; 
                        }
                        if (obj["privundertaking"] == "yes") {
                            financialsupportcount["Private"] += 1;
                        }
                        if (obj["otherundertaking"] == "yes") {
                            financialsupportcount["Other"] += 1;
                        }

                        //populate drainage area list
                        drainagearealist.push(parseInt(obj["drainagearea"])); 
                        lastprojupdatelist.push(parseInt(obj["lastprojupdate"])); 

                    });
                    //populate drainage area intervals
                    var max = Math.max(...drainagearealist); 
                    var min = Math.min(...drainagearealist);  
                    //create five intervals
                    for (var i = min - 1; i < max + (5 - ((max - min)% 5)) - 1; i += Math.round((max - min)/5)) {
                        var interval_min = i + 1; 
                        var interval_max = i + Math.round((max-min)/5); 
                        var intervalstring = interval_min.toString() + "-" + interval_max.toString(); 
                        drainageareacount[intervalstring] = (drainagearealist.filter(num => (num <= interval_max && num >= interval_min))).length;
                    }

                    //populate year intervals
                    for (var i = 0; i < lastprojupdatelist.length; i++) {
                        var decade = Math.floor(lastprojupdatelist[i] / 10) * 10; 
                        var decadeString = decade.toString() + "s"; 
                        //
                        if (lastprojupdatecount.hasOwnProperty(decadeString)) {
                            lastprojupdatecount[decadeString] += 1; 
                        }
                        else {
                            lastprojupdatecount[decadeString] = 1;          
                        }
                    }
                    console.log(lastprojupdatecount); 

                    //show counts for the generic fields
                    for (category in genericCounts) {
                        populateFrequency(category, genericCounts[category]); 
                    }
                    populateFrequency("floodhzdstd", floodhzdstdcount); 
                    populateFrequency("financialsupport", financialsupportcount); 
                    populateFrequency("drainagearea", drainageareacount); 
                    populateFrequency("lastprojupdate", lastprojupdatecount);
                }
                else {
                    alert("Error retrieving data."); 
                }
            });
        }

        //function to create the list of sub categories and their frequencies to each category
        function populateFrequency(category, list) {
            var selector = "#" + category + "content"; 
            //Create the unordered list
            $(selector).append("<ul></ul>"); 

            //loop through the individual category counts
            for (count in list) {
                $(selector + "> ul").append("<li>" + count + " (" + list[count] + ")</li>"); 
            }
            $(selector).append("</br>");
        }

        function reset(){
            //remove all geometry OR pass in an array of String? geometry IDs as param....  
            markerLayer.removeGeometry(); 
            coordslist = []; 
            reqcoordslist = []; 
            countClicks = 0;

            //disable collapsables
            $(".collapse").removeClass("show");
            //disable collapsable toggler
            $(".list-group-item").addClass("disabled");
            //clear all the counters
            $(".content").html("");
            //remove all open graph tabs
            $(".graph").remove();
            //unsubscribing prevents duplicate event handlers 
            click.unsubscribe(); 
            click = api.click.subscribe((pointObject) => {
                addPointOnClick(pointObject); 
            }); 
        }

        function createGraphTab(){
            //tab id should be in the form of ______tab
            var tabid = ($(this).attr("id")).replace("btn", "tab");
            //map id should be in the form _______map
            var graphid = ($(this).attr("id")).replace("btn", "");
            var navTab = $("<li/>", {class: "nav-item graph"});
            var navTabLink = $("<a/>", {class: "nav-item nav-link",
                                        id: tabid + "label",
                                        "data-toggle": "tab",
                                        href: "#" + tabid, 
                                        "role": "tab", 
                                        "aria-controls": "",
                                        "aria-selected": "false", 
                                        }); 
            $(navTabLink).html(graphid); 
            $(navTab).append(navTabLink); 
            var tabContent = $("<div/>", {class: "tab-pane fade graph",
                                          role: "tabpanel",
                                          "aria-labelledby": tabid + "label", 
                                          id: tabid});
            var graph = $("<div/>", {id: graphid, style:"width:600px;height:300px;"});
            $(tabContent).append(graph); 
            
            $(".nav-tabs").append(navTab); 
            $(".tab-content").append(tabContent); 
            createGraph(graphid); 
        }
        
        

        //creation of the graphs upon creation of a graph tab
        function createGraph(graphid) {
            //don't automate this.. manually handle a graph for each filter 
            if (graphid == "projectcatgraph"){
                createGraph_(graphid, genericCounts.projectcat, "Project Category", "pie"); 
            }
            else if (graphid == "typeofrecordgraph") {
                createGraph_(graphid, genericCounts.typeofrecord, "Type of Record", "pie"); 

            }
            else if (graphid == "floodhzdstdgraph") {
                createGraph_(graphid, floodhzdstdcount, "Flood Hazard Standard", "bar"); 
  
            }
            else if (graphid == "financialsupportgraph") {
                createGraph_(graphid, financialsupportcount, "Financial Support", "pie"); 
            }
            else if (graphid == "datasetstatusgraph") {
                createGraph_(graphid, genericCounts.datasetstatus, "Dataset Status", "bar"); 

            }
            else if (graphid == "drainageareagraph") {
                createGraph_(graphid, drainageareacount, "Drainage Area", "bar"); 
            }
            else if (graphid == "lastprojupdategraph") {
                createGraph_(graphid, lastprojupdatecount, "Last Project Update Year", "bar"); 
            }
            else if (graphid == "summreportavailgraph") {
                createGraph_(graphid, genericCounts.summreportavail, "Summary Report Available", "pie"); 
            }
            else if (graphid == "updatesinceoriggraph") {
                createGraph_(graphid, genericCounts.updatesinceorig, "Updated Since Original", "pie"); 
            }
            else {
                return; 
            }
        }
        //creates the graph but takes more parameters
        function createGraph_(graphid, graphcount, graphtitle, type) {
            var graph = document.getElementById(graphid); 
            var data; 
            if (type == "bar") {
                data = [{
                    x: Object.keys(graphcount), 
                    y: Object.values(graphcount),
                    type: "bar",
                    width: 0.5
                }]; 
            }
            else if (type == "pie") {
                data = [{
                    values: Object.values(graphcount), 
                    labels: Object.keys(graphcount), 
                    type: "pie", 
                    textinfo: "label+percent", 
                    textposition: "outside", 
                    automargin: true
                }];
            }
            else {
                return; 
            }
            layout = {title: graphtitle, height:400, width:800}; 
            Plotly.plot(graph, data, layout, {staticPlot: true}); 
        }


    }

};

