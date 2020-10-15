//setup of map

var extentmap = L.map('extentmap', {zoomControl : false}).setView([55.852254, -102.978323], 4); 
L.control.zoom({position: "bottomleft"}).addTo(extentmap);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    accessToken: "pk.eyJ1Ijoiamx1MTA3MjI5OCIsImEiOiJjazVmbzNnN3gyZWNxM2twbHQ3MmZzYzk4In0.9AOX6zMwjYqQOPfd4GihcA"
}).addTo(extentmap);

//search box 
var searchControl = new L.esri.Geocoding.geosearch({useMapBounds: false}).addTo(extentmap); 
//ensure that coordinates have been selected 
var coordinatesSelected = false; 
var coordinates = []; 

//coordinates of polygon
var polycoordinates = []; 

//for the purpose of creating the rectangle layer
var unformattedcoords = []; 
var url= "http://geogratis.gc.ca/services/geoname/en/geonames.json?bbox="; 
    
//group all the markers together into a layergroup
var markerGroup = L.layerGroup().addTo(extentmap);

//place the rectangle in a polygon group
var polyGroup = L.layerGroup().addTo(extentmap); 

//query the geonames API and populate dropdown menu with options
var populate = function() {
    if(coordinatesSelected) {
        $.getJSON(url
        ,function(data, status) {
        if (status == "success") {
            $.each(data, function(key, val) {
                for (var i = 0; i < val.length; i++) {
                    //get all the names from each request

                    //create an HTMLOptionObject
                    var option = new Option(val[i]["name"], val[i]["name"]);

                    //convert to jquery object 
                    $(option).html(val[i]["name"]); 

                    //append to select
                    $("#officialWCName").append(option); 

                }
            });
        }
        else {
            alert("an error occured pulling data from the API"); 
        }
        $("#officialWCName").off("click"); 
        //remember to remove the event handler upon the first click
    });
    }

    else {
        $("#mapSelectModal").modal("show");
    } 
};

//grabs coordinates from text box and puts them on map
var plotCoordinates = function() {
    var lat1Text = $("#lat1").val(); 
    var lat2Text = $("#lat2").val(); 
    var long1Text = $("#long1").val(); 
    var long2Text = $("#long2").val(); 

    //first, check if all the coordinates fields are filled out
        //if no --> break
        //if yes --> try to plot coordinates
            //-->catch error thrown, alert user of error, reset all fields. 
            //if no error -->         

    if(lat1Text !== "" && lat2Text !== "" && long1Text !== "" && long2Text !== "") {
        if (isNaN(lat1Text) || isNaN(lat2Text) || isNaN(long1Text) || isNaN(long2Text)) {
            alert("Please enter valid coordinates."); 
            //reset the fields
            $("#lat1").val("");
            $("#long1").val(""); 
            $("#lat2").val("");
            $("#long2").val("");
        }

        else {
            var lat1 = parseFloat(lat1Text); 
            var lat2 = parseFloat(lat2Text); 
            var long1 = parseFloat(long1Text); 
            var long2 = parseFloat(long2Text); 
            //if any of the coordinates are not valid coordinates 
            if ((lat1 > 90 || lat1 < 30) || (lat2 > 90 || lat2 < 30)
                || (long1 > -40 || long1 < -160) || (long2 > -40 || long2 < -160)) {
                alert("Please enter valid coordinates.");
                $("#lat1").val("");
                $("#long1").val(""); 
                $("#lat2").val("");
                $("#long2").val(""); 
            }
            else {
                coordinates[0] = [long1, lat1];
                unformattedcoords[0] = [lat1, long1]; 
                coordinates[1] = [long2, lat2]; 
                unformattedcoords[1] = [lat2, long2]; 
                drawRect(); 
            }
        }
    }
    else {
        return; 
    }

};

//on fileupload, handle the file uploaded by the user 
var plotFile = function() {

    //get the file uploaded's extension 
    var extension = $("#shpfile").val().split(".").pop().toLowerCase(); 
    
    if (extension != "zip") {
        alert("Please Upload a ZIP file.")
        //reset the file field
        $("#shpfile").val(""); 
    }

    else {
        var shpzip = $("#shpfile").prop("files")[0]; 
        $("#shpfile").prop("disabled", true); 
        var reader = new FileReader(); 
        var bufferedzip; 
        reader.readAsArrayBuffer(shpzip); 
        reader.onload = function(e) {
            bufferedzip = (e.target.result); 
            try {
                var polygon = L.shapefile(bufferedzip); 
                polygon.addTo(extentmap); 
                polygon.addTo(polyGroup);
                //IMPORTANT!!! WAIT FOR THE DATA TO BE LOADED...
                polygon.on("data:loaded", function() {
                    //populate our polygon coordinates array 
                    polygon._layers[polygon._leaflet_id + 1]._latlngs[0].forEach(function(element) {
                        polycoordinates.push([element.lat, element.lng]); 
                    });
                    $("#polycoordinates").val(polycoordinates); 
                    unformattedcoords[0] = [polygon.getBounds().getNorthEast().lat, polygon.getBounds().getNorthEast().lng];
                    unformattedcoords[1] = [polygon.getBounds().getSouthWest().lat, polygon.getBounds().getSouthWest().lng]; 
                    
                    //fixed error..... coordinates array was not being updated before.....
                    coordinates[0] = [polygon.getBounds().getNorthEast().lng, polygon.getBounds().getNorthEast().lat];
                    coordinates[1] = [polygon.getBounds().getSouthWest().lng, polygon.getBounds().getSouthWest().lat]; 
                    
                    $("#lat1").val(unformattedcoords[0][0]);
                    $("#lat2").val(unformattedcoords[1][0]);
                    $("#long1").val(unformattedcoords[0][1]);
                    $("#long2").val(unformattedcoords[1][1]);
                    drawRect();    
                
                }); 
            }
            catch (err){
                alert("Error parsing shpfile."); 
                console.log(err.message); 
                $("#shpfile").val(""); 
            }
        }; 
    }
    return false; 

};


$(document).ready(function() {     
    //select the dropdown
    
    
    $("#lat1").blur(plotCoordinates);     
    $("#lat2").blur(plotCoordinates); 
    $("#long1").blur(plotCoordinates); 
    $("#long2").blur(plotCoordinates); 
    $("#shpfile").change(plotFile); 
    $(".geocoder-control-input").addClass("optional"); 

});


//reset map 
function resetMap() {
    //remove all polygons in the layergroup off the map
    polyGroup.clearLayers(); 
    markerGroup.clearLayers(); 
    coordinates = []; 
    unformattedcoords = []; 
    extentmap.on("click", onMapClick)
    url = "http://geogratis.gc.ca/services/geoname/en/geonames.json?bbox=";
    
    //TO-DO: remove all options when reset button is clicked
    $("#officialWCName").empty(); 

    //re-enables the event handlers
    //NOTE! WE NEED THE .off("click") to avoid the creation of duplicate event handlers
    $("#officialWCName").off("click").on("click", populate);
    $("#lat1").off("blur").on("blur", plotCoordinates);     
    $("#lat2").off("blur").on("blur", plotCoordinates); 
    $("#long1").off("blur").on("blur", plotCoordinates); 
    $("#long2").off("blur").on("blur", plotCoordinates);  

    coordinatesSelected = false; 

    //re-enable all inputs
    $("#lat1").prop("readonly", false); 
    $("#lat2").prop("readonly", false);
    $("#long1").prop("readonly", false);
    $("#long2").prop("readonly", false);
    $("#shpfile").prop("disabled", false); 

    $("#lat1").val("");
    $("#long1").val(""); 
    $("#lat2").val("");
    $("#long2").val("");
    $("#shpfile").val(""); 
    $("#polycoordinates").val(""); 

}

//draws the rectangle once the coordinates are selected, disables map features
function drawRect() {
    var rect = L.rectangle(unformattedcoords, {color: "red", weight: 1}); 
    rect.addTo(extentmap); 
    //add it to the layer for easy deletion
    rect.addTo(polyGroup); 

    //disable event handlers
    extentmap.off("click", onMapClick);
    $("#lat1").off("blur");     
    $("#lat2").off("blur"); 
    $("#long1").off("blur"); 
    $("#long2").off("blur");  

    coordinatesSelected = true; 
    //coordinates correspond to the west, south, east, and north bounds of the area.
    url += coordinates[0][0].toString() + ","; 
    url += coordinates[0][1].toString() + ","; 
    url += coordinates[1][0].toString() + ","; 
    url += coordinates[0][1].toString();
    $("#shpfile").prop("disabled", true);
    //important! we set the text inputs to readonly so that we can obtain their values from express
    $("#lat1").prop("readonly", true); 
    $("#lat2").prop("readonly", true);
    $("#long1").prop("readonly", true);
    $("#long2").prop("readonly", true);

    //center the map 
    extentmap.fitBounds(unformattedcoords); 

    //clear the markers
    markerGroup.clearLayers();

    populate();

}

//register two coordinates
function onMapClick(e) {
    var marker = L.marker(e.latlng); 
    marker.addTo(extentmap); 
    marker.addTo(markerGroup); 
    //store in an array for now, can be used for queries later 
    var unformattedcoord = [e.latlng.lat, e.latlng.lng]; 
    var coordinate = [e.latlng.lng, e.latlng.lat];

    //in (long, lat) format 
    coordinates.push(coordinate); 

    //in (lat, long) format
    unformattedcoords.push(unformattedcoord); 

    //populate text boxes by click
    $("#lat" + (unformattedcoords.length).toString()).val(unformattedcoords[unformattedcoords.length - 1][0]); 
    $("#long" + (unformattedcoords.length).toString()).val(unformattedcoords[unformattedcoords.length - 1][1]); 
    
    if (coordinates.length >= 2) {
        drawRect(); 
    }
}

extentmap.on("click", onMapClick); 

