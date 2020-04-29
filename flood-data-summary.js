
class FloodDataSummary {
    // CONSTRUCTOR TAKES JUST THE RESPONSE DATA AS PARAM
    constructor(data) {
        this.data = data;
        this.projectcat = {"Watercourse" : 0, "Inland": 0, "Great Lakes Shoreline": 0, 
                            "Great Lakes Connecting Channel": 0, "Ocean Mapping": 0, "Other": 0}; 

        this.typeofrecord = {"Hazard" : 0, "Inundation": 0, "Awareness": 0, "Risk": 0}; 
        this.datasetstatus = {"Complete" : 0, "Ongoing": 0, "Planned": 0}; 
        this.summreportavail = {"Yes": 0, "No": 0}; 
        this.updatesinceorig = {"Yes": 0, "No": 0};  
        this.floodhzdstd = {"Hazel": 0, "Timmins": 0, "1000 yr": 0, 
                            "500 yr": 0, "200 yr": 0, "100 yr" : 0, 
                            "50 yr": 0, "20 yr": 0, "10 yr": 0, "5 yr": 0, "2 yr": 0, "Other": 0}; 
        this.financialsupport = {"NDMP": 0, "FDRP": 0, "Conservation Authority": 0,
                                "Municipal": 0, "Federal": 0,
                                "Private": 0, "Other": 0}; 

        this.drainagearealist = []; 
        this.lastprojupdatelist = []; 
        this.drainagearea = {}; 
        this.lastprojupdate = {};   
    }

    updateProjectCat(entry) {
        if (entry["projectcat"] == "watercourse") {
            this.projectcat["Watercourse"]++; 
        }
        else if (entry["projectcat"] == "inland") {
            this.projectcat["Inland"]++;
        }
        else if (entry["projectcat"] == "greatlakesshoreline") {
            this.projectcat["Great Lakes Shoreline"]++;
        }
        else if (entry["projectcat"] == "greatlakescc") {
            this.projectcat["Great Lakes Connecting Channel"]++;
        }
        else if (entry["projectcat"] == "oceanmapping") {
            this.projectcat["Ocean Mapping"]++; 
        }
        else {
            this.projectcat["Other"]++; 
        }
    }

    updateTypeRecord(entry) {
        //find the properly formatted type of record 
        var key = Object.keys(this.typeofrecord).find(k => k.toLowerCase() === entry["typeofrecord"].toLowerCase());
        this.typeofrecord[key]++; 
    }

    updateDatasetStatus(entry) {
        var key = Object.keys(this.datasetstatus).find(k => k.toLowerCase() === entry["datasetstatus"].toLowerCase());
        this.datasetstatus[key]++; 
    }

    updateSummReport(entry) {
        var key = (entry["summreportavail"]) ? "Yes": "No";
        this.summreportavail[key]++; 
    }

    updateUpdateSinceOrig(entry) {
        var key = (entry["updatesinceorig"]) ? "Yes": "No"; 
        this.updatesinceorig[key]++; 
    }

    updateFloodHzdStd(entry) {
        entry["floodhzdstd"].forEach((val) => {
            var key = Object.keys(this.floodhzdstd).find(k => k.toLowerCase().replace(" ", "") === val.toLowerCase());
            this.floodhzdstd[key]++;  
        });
    }

    updateFinancialSupport(entry) {
        if (entry["fedundertaking"] == "fdrp") {
            this.financialsupport["FDRP"]++;
        }
        if (entry["fedundertaking"] == "ndmp") {
            this.financialsupport["NDMP"]++; 
        }
        if (entry["caundertaking"] == "yes") {
            this.financialsupport["Conservation Authority"]++; 
        }
        if (entry["munundertaking"] == "yes") {
            this.financialsupport["Municipal"]++;
        }
        if (entry["privundertaking"] == "yes") {
            this.financialsupport["Private"]++;
        }
        if (entry["otherundertaking"] == "yes") {
            this.financialsupport["Other"]++; 
        }
    }

    updateDrainageAreaList(entry) {
        this.drainagearealist.push(parseInt(entry["drainagearea"])); 
    }

    updateLastProjUpdateList(entry) {
        this.lastprojupdatelist.push(parseInt(entry["lastprojupdate"])); 
    }

    updateDrainageArea() {
        var max = Math.max(...this.drainagearealist); 
        var min = Math.min(...this.drainagearealist); 

        //if there's only one element present OR all elements are the same.... 
        if (max === min) {
            this.drainagearea[max.toString()] = this.drainagearealist.length; 
            return; 
        }

        //does not work if there's only one element present or identical elements......
        for (var i = min - 1; i < max + (5 - ((max - min)% 5)) - 1; i += Math.round((max - min)/5)) {
            var interval_min = i + 1; 
            var interval_max = i + Math.round((max-min)/5); 
            var intervalstring = interval_min.toString() + "-" + interval_max.toString(); 
            this.drainagearea[intervalstring] = (this.drainagearealist.filter(num => (num <= interval_max && num >= interval_min))).length;
        }
    }

    updateLastProjUpdate() {
        var unordered = {}; 

        for (var i = 0; i < this.lastprojupdatelist.length; i++) {
            //get the decade 
           
            var decade = Math.floor(this.lastprojupdatelist[i] / 10) * 10; 
            if (unordered.hasOwnProperty(decade)) {
                unordered[decade] += 1;
            }
            else {
                unordered[decade] = 1;
            }
        }
        //sort the decades in ascending order
        for (const key of Object.keys(unordered).sort()) {
            const decadeString = key.toString() + "'s"; 
            this.lastprojupdate[decadeString] = unordered[key]; 
        }
    }

    getSummary() {
        this.data.forEach((entry) => {
            this.updateProjectCat(entry); 
            this.updateTypeRecord(entry); 
            this.updateDatasetStatus(entry);
            this.updateSummReport(entry); 
            this.updateUpdateSinceOrig(entry); 
            this.updateFloodHzdStd(entry);
            this.updateFinancialSupport(entry);
            this.updateDrainageAreaList(entry);
            this.updateLastProjUpdateList(entry);
        });
        this.updateDrainageArea(); 
        this.updateLastProjUpdate(); 
        return {
            "projectcat": this.projectcat, 
            "typeofrecord": this.typeofrecord, 
            "datasetstatus": this.datasetstatus, 
            "summreportavail": this.summreportavail, 
            "updatesinceorig": this.updatesinceorig, 
            "floodhzdstd": this.floodhzdstd, 
            "financialsupport": this.financialsupport, 
            "drainagearea": this.drainagearea, 
            "lastprojupdate": this.lastprojupdate
        };
    }

}

module.exports = FloodDataSummary;
