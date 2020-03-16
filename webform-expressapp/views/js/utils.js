window.addEventListener("beforeunload", function(e) {
    e.preventDefault(); 
    e.returnValue = "Are you sure? All progress will be lost";  
});

function checkOtherFloodHzd(checkbox) {
    if (checkbox.checked) {
        document.getElementById("ifOtherFloodHzd").style.display = "block";
        document.getElementById("otherfloodhzd").classList.remove("optional");  
    }
    else {
        document.getElementById("ifOtherFloodHzd").style.display = "none"; 
        document.getElementById("otherfloodhzd").classList.add("optional"); 
    }
}


function checkClimateChange(select) {
    if (select.value == "yes") {
        document.getElementById("ifYesClimateChange").style.display = "block"; 
        document.getElementById("climatechangecomments").classList.remove("optional");
    }
    else {
        document.getElementById("ifYesClimateChange").style.display = "none"; 
        document.getElementById("climatechangecomments").classList.add("optional"); 
    }
}


function checkYesNoPriv(select) {
    if (select.value == "yes") {
        document.getElementById("ifYesPriv").style.display = "block"; 
        document.getElementById("privateundertakingname").classList.remove("optional"); 
    }
    else {
        document.getElementById("ifYesPriv").style.display = "none";
        //mark these as not mandatory for form validation 
        document.getElementById("privateundertakingname").classList.add("optional"); 
    }
}

function checkYesNoOther(select) {
    if (select.value == "yes") {
        document.getElementById("ifYesOther").style.display = "block"; 

        document.getElementById("otherundertakingname").classList.remove("optional");
    }
    else {
        document.getElementById("ifYesOther").style.display = "none"; 
        //mark these as not mandatory for form validation
        document.getElementById("otherundertakingname").classList.add("optional");
    }
}

function checkPartUpdated(select) {
    if (select.value == "yes") {
        document.getElementById("ifYesUpdate").style.display = "block";
    }
    else {
        document.getElementById("ifYesUpdate").style.display = "none"; 
    }
}



//function to populate year dropdown
var populateYear = 
function () {
    var currentdate = new Date(); 

    for (var i = currentdate.getFullYear(); i > 1920; i--) {
        var option = new Option(i, i); 
        $(option).html(i); 
        $(".yearinput").append(option); 
    }
    
}

var populateFutureYear = 
function () {
    var currentdate = new Date(); 
    for (var i = currentdate.getFullYear() + 30; i > 1950; i--) {
        var option = new Option(i, i); 
        $(option).html(i); 
        $(".futureyearinput").append(option); 
    }
}

var populateHelpPopups = 
function () {
    var helpIcon = new Image(50, 50); 
    helpIcon.src = "./images/helpicon.png"; 
    $("label:not(.form-check-label,.filelabel)").each(function() {

        var anchor = $("<a>"); 
        anchor.attr("tabindex", "-1"); 
        anchor.attr("href", "#"); 
        anchor.attr("data-toggle", "popover"); 
        anchor.attr("data-trigger", "focus"); 
        anchor.attr("title", "Help"); 
        anchor.addClass("popover-dismiss"); 
        anchor.attr("href", "#/"); 

        anchor.attr("data-content", $("#" + $(this).attr("for") + "h").html()); 
        anchor.html($("<img>", {height: "20", width:"20", src:"./images/helpicon.png"})); 
        
        var input = $("#" + $(this).attr("for")); 

        if (!input.hasClass("optional") && !input.is("textarea")) {
            $(this).append(' <span style="color:red">*</span>'); 
        }
        $(this).append(" "); 
        $(this).append(anchor);         
    });
    $('[data-toggle="popover"]').popover(); 
}; 


//populate every input with a name attribute that matches ID. Required for express body parser. 
var populateNameAttr = 
function() {
    $("input:not([type=file]),select,textarea").each( function() {
        $(this).attr("name", $(this).attr("id")); 
    }); 
};

//function to populate coordinate system proj
var populateCoordinates = function () {
    var coordinateSystems = ["NAD83(CSRS98)/New Brunswick Stereo", 
                            "NAD83(CSRS98)/UTM zone 19N", "NAD83(CSRS98)/UTM zone 20N", 
                            "NAD83(CSRS98)/MTM zone 3", "NAD83(CSRS98)/MTM zone 4", "NAD83(CSRS98)/MTM zone 5", "NAD83(CSRS98)/MTM zone 6", "NAD83(CSRS98)/MTM zone 7", 
                            "NAD83(CSRS98)/MTM zone 8", "NAD83(CSRS98)/MTM zone 9", 
                            "NAD83(CSRS98)/MTM zone 10", "NAD83(CSRS98)/UTM zone 21N", "NAD83(CSRS98)/UTM zone 18N", "NAD83(CSRS98)/UTM zone 17N", "NAD83(CSRS98)/UTM zone 13N", 
                            "NAD83(CSRS98)/UTM zone 12N", "NAD83(CSRS98)/UTM zone 11N"];
    for (var i = 0; i < coordinateSystems.length; i++) {
        var option = new Option(coordinateSystems[i], coordinateSystems[i]); 
        $(option).html(coordinateSystems[i]); 
        $(".coordsysproj").append(option);
    }
}; 


//populate all year fields 
$(document).ready(populateYear);
//populate future year inputs 
$(document).ready(populateFutureYear); 
//populate coordinate projection system field 
$(document).ready(populateCoordinates); 
//populate all help links
$(document).ready(populateHelpPopups); 
//populate all name attributes
$(document).ready(populateNameAttr); 



