var submitForm = false; 

window.addEventListener("beforeunload", function(e) {
    if (!submitForm) {
        e.preventDefault(); 
        e.returnValue = "Are you sure? All progress will be lost";  
    }
});

//page navigation
var currentTab = 0; 
showTab(currentTab); 

function showTab(n) {
    var tabs = document.getElementsByClassName("tab"); 
    tabs[n].style.display = "block"; 

    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
         
    }
    else {
        document.getElementById("prevBtn").style.display = "block"; 
    }

    if (n == (tabs.length - 1)) {
        document.getElementById("nextBtn").innerHTML = "Submit"; 
        $("#submitSaveBtn").show(); 
    }

    else {
        document.getElementById("nextBtn").innerHTML = "Next"; 
        $("#submitSaveBtn").hide(); 
    }
    
    //scroll to top of window
    window.scroll({
        top:0, 
        let:0, 
        behaviour: "smooth"
    }); 
    //updates the progress bar 
    updateProgIndicator(n); 
}

function nextPrev(n) {
    //list of all elements with the matching class name
    var tabs = document.getElementsByClassName("tab"); 

    //if all the fields on the page are not completed AND the user is trying to go forwards (not backwards)
    if (n == 1 && !validateStep()) {
        //exit the function 
        return false; 
    }
    
    tabs[currentTab].style.display="none"; 
    currentTab = currentTab + n; 

    if (currentTab >= tabs.length) {
        //handle submission
        submitForm = true; 
        document.getElementById("entryForm").submit(); 
        return false; 
    }
    showTab(currentTab); 
}

//this is used for updating the progress bar
function updateProgIndicator(n) {
    var percentprogress = Math.round(n/($(".tab").length) * 100); 
    var style = "width: " + percentprogress.toString() + "%"; 
    $(".progress-bar").attr({
        "style": style, 
        "aria-valuenow": percentprogress.toString(),
    });
    $(".progress-bar").html(percentprogress.toString() + "%"); 
}

function validateStep() {
    var isValid = true; 
    tabs = document.getElementsByClassName("tab"); 
    inputs = tabs[currentTab].getElementsByTagName("input"); 
    selects = tabs[currentTab].getElementsByTagName("select");
    checkboxes = tabs[currentTab].getElementsByClassName("form-check-input"); 
    //verify that at least one checkbox is checked AND the exist checkboxes on the tab
    if (!validateCheckbox(checkboxes) && (checkboxes.length !== 0)) {
        $(".checkboxes").addClass("invalid"); 
        isValid = false; 
    }

    //loop through all inputs 
    for (var i = 0; i < inputs.length; i++) {
        if(inputs[i].value == "" && !inputs[i].classList.contains("optional")) {
            inputs[i].classList.add("invalid");           
            isValid = false; 
        }
    }

    for (var i = 0; i < selects.length; i++) {
        if(selects[i].value == "") {
            selects[i].classList.add("invalid");
            isValid = false;  
        }
    }

    if (!isValid) {
        $("#errorModal").modal("show"); 
    }
    return isValid; 
}


//validate that at least one checkbox is completed
function validateCheckbox(checkboxes) {
    var checkboxesCompleted = false; 
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checkboxesCompleted = true; 
        }
    }

    return checkboxesCompleted; 
}

//reset the invalid background color if input is changed
$(document).ready(function () {

    $("input").change(function() {
        if ($(this).hasClass("invalid")) {
            $(this).removeClass("invalid"); 
        }
    });

    $("select").change(function() {
        if ($(this).hasClass("invalid")) {
            $(this).removeClass("invalid"); 
        }
    });

    //if one of the checkboxes is checked, we remove the invalid class 
    $(".form-check-input").click(function() {
        $(".checkboxes").removeClass("invalid"); 
    }); 

    $("#submitSaveBtn").click(function() {
        if (validateStep()) {
            $(window).unbind("beforeunload"); 
            $.ajax({
                type: 'POST', 
                data: $("#entryForm").serialize(), 
                url: '/hydro_dev/submit/save',
            }).done(function() {
                $("#submitSuccessModal").modal("show");
                var tabs = document.getElementsByClassName("tab");  
                tabs[currentTab].style.display="none"; 
                currentTab = 0; 
                showTab(currentTab); 
            }).fail(function() {
                alert("An error occured with your submission.");
            });
        }
    }); 

}); 