const express = require("express"); 
const bodyParser = require("body-parser");
const app = express(); 
const FloodDataSummary = require("./flood-data-summary");
const path = require("path"); 
const fs = require("fs"); 
const config = require("./config-dev.json") //change this back for production

const {Pool, Client} = require("pg");

//new connection up and running

var client = new Client({
    user: config.database.user,
    host: config.database.host, 
    database: config.database.database, 
    password: config.database.password, 
    port: config.database.port
});

const connect = async () => { 
    let retries = 8;
    while (retries) {
        try {
            //wait to give database time to start up
            await client.connect();
            console.log("succesfully connected to database"); 
            break;
        } catch (err) {
            console.log(err.stack); 
            retries -= 1;            
            console.log(`retries left: ${retries}`);        
            client.end();
            client = new Client({
                user: config.database.user,
                host: config.database.host, 
                database: config.database.database, 
                password: config.database.password, 
                port: config.database.port
            });        
            await new Promise(res => setTimeout(res, 10000));    
        }        
    }
}
connect();


app.set("view engine", "ejs"); 
app.use(express.static(__dirname + "/webform-expressapp/views"));

app.use(express.static(__dirname + "/webform-expressapp/views/mapiframe"));
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.json()); 


app.get("/", function(req,res) {
    //pass in another array of the checked checkboxes 
	res.sendFile("selectionpage.html", {root:"webform-expressapp/views"}); 
});

app.post("/entry", function(req, res) {
    var imagery = false; 
    var elevation = false; 
    var hydrology = false; 
    var hydraulics = false; 
    if (Object.values(req.body).includes("imagery")) {
        imagery = true; 
    }
    if ( Object.values(req.body).includes("elevation")) {
        elevation = true; 
    }
    if (Object.values(req.body).includes("hydrology")) {
        hydrology = true; 
    }
    if (Object.values(req.body).includes("hydraulics")) {
        hydraulics = true; 
    }

    //send modified entry page
    res.render(path.join(__dirname , "webform-expressapp", "views" ,"entryPage.ejs"), {imagery: imagery, 
                                    elevation: elevation, hydrology:hydrology,
                                    hydraulics:hydraulics}); 
}); 


app.get("/analytics", function(req, res) {
    app.use(express.static(__dirname + "/build"));
    console.log(path.join(__dirname, "build", "index.html")); 
    //res.sendFile(path.join(__dirname, "build", "index.html")); 
    res.sendFile("index.html", {root: "build"}); 
}); 

app.get("/embed", function(req, res) {
    res.sendFile("map.html", {root: "webform-expressapp/views/mapiframe"});
});

app.get("/embedheatmap", function(req, res) {
    res.sendFile("heatmap.html", {root: "webform-expressapp/views/mapiframe"});
}); 

//RESTful route to get database entries
app.get("/api", function(req, res) {
    //FOR FUTURE-USE: IMPLEMENT A LIMIT PARAM?
    
    //if a bounding box is defined
    if(typeof(req.query.boundingbox) !== 'undefined') {        
        //query database for any entries that are contained within boundingbox
        const sql = "SELECT *, polygon(boundingbox) AS fullbox FROM hazarddata WHERE boundingbox && $1"; 
        const val = [req.query.boundingbox];
        //careful not to overwrite res 
        client.query(sql, val, function(err, result) {
            if (err) {
                console.log(err.stack);
                res.send("Please enter valid coordinates."); 
            }
            else {
                //route for returning formatted summary response for front end
                if (req.query.formatted == "true") {
                    var formattedResponse = new FloodDataSummary(result.rows); 
                    res.json(formattedResponse.getSummary()); 
                }
                else {
                    res.json(result.rows); 
                }
            }
        });  
    }

    //otherwise get all the entries from the database
    else {
        const sql = "SELECT *, polygon(boundingbox) AS fullbox FROM hazarddata";
        client.query(sql, function(err,result) {
            if (err) {
                console.log(err.stack); 
                res.send("Error fetching data");
            }
            else{
                if (req.query.formatted == "true") {
                    var formattedResponse = new FloodDataSummary(result.rows); 
                    res.json(formattedResponse.getSummary()); 
                }
                else {
                    res.json(result.rows); 
                }
            }
        });
    }
    
});

app.get("/api/columns", function(req, res) {
    const sql = "select * from INFORMATION_SCHEMA.COLUMNS where TABLE_NAME=\'hazarddata\' order by ordinal_position";
    client.query(sql, function(err, result) {
        if (err) {
            res.send("Error: cannot fetch rows");
        } else {
            res.json(result);
        }
    });
});

//making a separate route for conservation authority counts... may integrate into /api route
app.get("/api/cacount", function(req, res) {
    var jsonFile = fs.readFileSync(config.geoJSON); 

    var jsonContent = JSON.parse(jsonFile); 
    //console.log(jsonContent);
    //counter to keep track of async client.queries completed
    var completedQueries = 0;
    //obj to store the number of records found for each conservation authority  
    var countList = {};
    /*
    console.log(jsonContent.features.length); 
    jsonContent.features.forEach((ca) => {
        //copy values
        var coordList = ca.geometry.rings.flat(); 
        //swap lat-lng for all coordinates to match format in database... 
        coordList.forEach((coordinate) => {
            var tmp = coordinate[0]; 
            coordinate[0] = coordinate[1]; 
            coordinate[1] = tmp; 
        });
        //format the coordinates for db query
        const polygon = coordList.join(","); 

        const sql = "SELECT *, polygon(boundingbox) AS fullbox FROM hazarddata WHERE $1 && polygon(boundingbox)";
        const val = [polygon]; 
        client.query(sql, val, function(err, result) {
            //increment the number of completed queries 
            completedQueries++; 
            if (err) {
                console.log(err.stack); 
            }
            else {
                
                coordList.forEach((coordinate) => {
                    var tmp = coordinate[0]; 
                    coordinate[0] = coordinate[1]; 
                    coordinate[1] = tmp; 
                });
                
                //returning the coordinates in (long, lat) to comply with FGPViewer
                //request parameter countonly -> true: returns only the number of records, false: returns all records 
                if (req.query.countonly == "true") {
                    countList[ca.attributes.ENG_NAME] = [ca.geometry.rings, result.rowCount]; 
                }
                //get summaries for each conservation authority
                else if (req.query.formatted == "true") {
                    var formattedResponse = new FloodDataSummary(result.rows); 
                    countList[ca.attributes.ENG_NAME] = formattedResponse.getSummary(); 
                }
                //get all detailed records for each conservation authority
                else {
                    countList[ca.attributes.ENG_NAME] = result.rows; 
                }

            }

            //check if all queries have been completed
            if (completedQueries === jsonContent.features.length) {
                res.json(countList); 
            }
        }); 
    });
    */
    jsonContent.features.forEach((ca) => {
        //console.log(ca.geometry.rings); 
        //copy values
        var coordList = ca.geometry.rings.flat(); 
        //swap lat-lng for all coordinates to match format in database... 
        coordList.forEach((coordinate) => {
            var tmp = coordinate[0]; 
            coordinate[0] = coordinate[1]; 
            coordinate[1] = tmp; 
        });
        //format the coordinates for db query
        const polygon = coordList.join(","); 

        const sql = "SELECT *, polygon(boundingbox) AS fullbox FROM hazarddata WHERE $1 && polygon(boundingbox)";
        const val = [polygon]; 
        client.query(sql, val, function(err, result) {
            //increment the number of completed queries 
            completedQueries++; 
            if (err) {
                console.log(err.stack); 
                
            }
            else {
                
                coordList.forEach((coordinate) => {
                    var tmp = coordinate[0]; 
                    coordinate[0] = coordinate[1]; 
                    coordinate[1] = tmp; 
                });
                
                //returning the coordinates in (long, lat) to comply with FGPViewer
                //request parameter countonly -> true: returns only the number of records, false: returns all records 
                if (req.query.countonly == "true") {
                    countList[ca.attributes.LEGAL_NAME] = [ca.geometry.rings, result.rowCount]; 
                }
                //get summaries for each conservation authority
                else if (req.query.formatted == "true") {
                    var formattedResponse = new FloodDataSummary(result.rows); 
                    countList[ca.attributes.LEGAL_NAME] = formattedResponse.getSummary(); 
                }
                //get all detailed records for each conservation authority
                else {
                    countList[ca.attributes.LEGAL_NAME] = result.rows; 
                }
            }
            //check if all queries have been completed
            if (completedQueries === jsonContent.features.length) {
                res.json(countList); 
            }
        }); 
    });
    
});


app.post("/submit/:action?", function (req,res) {

    var action = req.params.action; 

    console.log(req.body);    
    //insert everything except extent 
    var sql = "INSERT INTO hazarddata(username, projectname, projectcat, \
                                        typeofrecord, floodhzdstd, officialwcname, \
                                        fedundertaking, caundertaking, munundertaking, \
                                        privundertaking, privateundertakingname, otherundertaking, otherundertakingname, datasetstatus, \
                                        lastprojupdate, partupdate, updatepurp, drainagearea, \
                                        summreportavail, updatesinceorig, localwcname, wclength, \
                                        widestcswidth, maxfloodplain, majorevent, coordinatesysproj, \
                                        generalprojcomments, imgprojid, acquisitionyear, datadescrip, \
                                        acquisitionseason, imghref, imgvref, imghozacc, imgderivmethod, \
                                        spatialreshoz, spatialresvert, imgpeerreview, imggeneralcomments, \
                                        elevprojid, digitaldata, dataformat, primdatasource, elevdataowner, \
                                        elevhref, elevvref, elevhozacc, elevvertacc, elevderivmethod, \
                                        elevspatialreshoz, elevspatialresvert, secdatasource, elevpeerreview, \
                                        elevgeneralcomments, hydroprojid, hydromethod, hydroyear, datasetyrs, \
                                        eventsmodelled,\
                                        inputcomments, hydromodelyear, smincorporated, volreduction, \
                                        catdiscretized, hydrosupportingdoc, ccconsidered, hydropeerreview, \
                                        hydrogeneralcomments, hydraprojid, hydrayear, hydramethod, \
                                        flowcond, hydracalib, \
                                        hydrainputcomments, floodlineestimated, hydrasupportingdoc, \
                                        elevsource, hydrapeerreview, hydrageneralcomments, boundingbox, extent, climatechangecomments, otherfloodhzd) VALUES \
                                        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, \
                                        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, \
                                        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, \
                                        $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, \
                                        $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, \
                                        $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83)"; 
    
    var floodhzdstd = ["timmins", "1000yr", "500yr", "200yr", "100yr", "50yr", "20yr", "10yr", "5yr", "2yr",
                         "other", "hazel"];
    var secdatasource = ["lidar", "photogrammetry", "radar", "sonar", 
                        "satelite", "uav", "gps", "groundsurvey", "constructiondrawings"]; 

    var elevationSources = ["gps", "totalStation", "leveling", "baseElev", "otherElevation"];

    if (req.body.polycoordinates === '') req.body.polycoordinates = null;

    var values = [req.body.username, req.body.projectName, req.body.projectcat, req.body.typeofrecord, getCheckboxes(floodhzdstd, req.body), req.body.officialWCName, 
                    req.body.fedundertaking, req.body.caundertaking, req.body.munundertaking, req.body.privundertaking, req.body.privateundertakingname, req.body.otherundertaking,
                    req.body.otherundertakingname, req.body.datasetStatus, req.body.lastprojupdate, req.body.partupdate, req.body.updatepurp, req.body.drainagearea, 
                    req.body.summreportavail, req.body.updatesinceorig, req.body.localwcname, req.body.wclength, req.body.widestcswidth, req.body.maxfloodplain, req.body.majorevent, req.body.coordsysproj, req.body.generalprojcomments, req.body.imgprojid, req.body.acquisitionyear,
                    req.body.datadescrip, req.body.acquisitionseason, req.body.imghref, req.body.imgvref, req.body.imghozacc, req.body.imgderivmethod, req.body.spatialreshoz, 
                    req.body.spatialresvert, req.body.imgpeerreview, req.body.imggeneralcomments, req.body.elevprojid, req.body.digitaldata, req.body.dataformat, req.body.primdatasource, 
                    req.body.elevdataowner, req.body.elevhref, req.body.elevvref, req.body.elevhozacc, req.body.elevvertacc, req.body.elevderivmethod, req.body.elevspatialreshoz, 
                    req.body.elevspatialresvert, getCheckboxes(secdatasource, req.body), req.body.elevpeerreview, req.body.elevgeneralcomments, req.body.hydroprojid, req.body.hydromethod, req.body.hydroyear,
                    req.body.datasetyrs, req.body.eventsmodeled, req.body.inputcomments, req.body.hydromodelyear, 
                    req.body.smincorporated, req.body.volreduction, req.body.catdiscretized, req.body.hydrosupportingdoc, req.body.ccconsidered, req.body.hydropeerreview, 
                    req.body.hydrogeneralcomments, req.body.hydraprojid, req.body.hydrayear, req.body.hydramethod, req.body.flowcond, 
                    req.body.hydrainputparamquality, req.body.hydrainputcomments, req.body.floodlineestimated, req.body.hydrasupportingdoc, getCheckboxes(elevationSources, req.body), req.body.hydrapeerreview, 
                    req.body.hydrageneralcomments, getBoundingBox(req.body), req.body.polycoordinates, req.body.climatechangecomments, req.body.otherfloodhzd];     
    
    //replace any empty strings with null
    for (var val of values) {
        if (val === '') {
            val = undefined; 
        }
    }

    client.query(sql, values, function(err, res) {
        if (err) {
            console.log(err.stack); 
        }
        else {
            console.log("Query successful"); 
        }
    }); 

    //if no params are included 
    if(!action) {
        res.sendFile("thankyou.html", {root: "webform-expressapp/views"}); 
    }   
    
    //if any param is included it will save form data.
    else {  
        //still not working 
        console.log("the submit and save button was hit");
        res.end(); 
    }
    
    
}); 

//modify with domain name?
app.listen(process.env.PORT || 8080, process.env.IP, function() {
    console.log("App started!"); 
});


//HELPER FUNCTIONS
/**
 * Gets the selected checkboxes for a group of checkboxes
 * @param {Array} checkboxes - The checkbox names to search for
 * @param {Object} dict - The request body object 
 */

function getCheckboxes(checkboxes, dict) {
    var checked = []; 
    checkboxes.forEach(function(elem) {
        if (elem in dict){
            checked.push(elem); 
        }
    });

    var stringver = "{"; 
    for (var i = 0; i < checked.length; i++) {
        stringver += checked[i]; 
        if (i != checked.length - 1)  {
            stringver += ", "
        }
        
    }
    stringver += "}"
    return stringver; 
}

/**
 * Formats the bounding box for entry in the database
 * @param {object} dict bounding box coordinate object
 */

function getBoundingBox(dict) {
    return dict.lat1 + "," + dict.long1 + "," + dict.lat2 + "," + dict.long2; 
}

//formatted field counts 
