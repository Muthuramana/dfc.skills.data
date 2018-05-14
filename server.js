var pgp = require('pg-promise')();
var csv = require("fast-csv");
const fs = require('fs');
var RestClient = require('node-rest-client').Client;
var sleep = require('thread-sleep');

var cn = {
    host: 'localhost', 
    database: 'dfc-skills',
    user: 'postgres',
    password: 'p@55w0rd'
};

var db = pgp(cn);

var processedSocCodes = 0;
var socCodesInProgress = 0;
var totalSocCodes = 0;
var batchesStarted = 0;

var client = new RestClient();
var args = { headers: standardGetHeader() };
var socCodesToProcess = [];
var stream = fs.createReadStream("./data/soc2010.csv");
 
var csvStream = csv()
    .on("data", function(data){
        socCodesToProcess.push(data[0]);
    })
    .on("end", function(){
        totalSocCodes = socCodesToProcess.length;
        var blockCount = Math.ceil(totalSocCodes / 10);
        console.log("Contents of CSV file read.  We have " + totalSocCodes + " soc codes, with the following block count: " + blockCount);
         for(count=0; count<blockCount; count++) {
            var tmp = socCodesToProcess.splice(count,count+10);
            tmp.forEach(socCode => {
               processSoc(socCode);
            });
        batchesStarted+=1;
        printStats();
        //sleep(500);
        }
    });


stream.pipe(csvStream);


function processSoc(socCode) {
    console.log("Processing: " + socCode);
    socCodesInProgress += 1;
    printStats();
    loadOccupationsForSoc(socCode)
    .then(socOccs => {
        console.log("Loaded occs for: " + socCode);

        socOccs.onetCodes.forEach((onetOcc) => {
            loadSkillsForOccupation(onetOcc.code)
            .then(skillsForOcc => {
                console.log("Loaded skills for occ: " + onetOcc + " for soc: " + socCode);
                //sleep(500);
                if (skillsForOcc.scales.length > 0) {
                    var skills = skillsForOcc.scales[0].skills;
                    skills.forEach(skill => {
                        saveSkillsForOcc(socOccs.soc, onetOcc.code, skill.id, skill.name, skill.value)
                        .then(x => {
                            console.log('Done save for skill: ' + skill.id + ' for occ: ' + onetOcc.code + " for soc:" + socOccs.soc);
                        });
                    });
                }
            });
        });
    });
}


function loadOccupationsForSoc(socCode) {
    return new Promise( function pr(resolve,reject) {
        console.log("Load for soc: " + socCode);
        var uri = "https://api.lmiforall.org.uk/api/v1/o-net/soc2onet/" + socCode;

        client.get(uri, args, (data, response) => {
            console.log("Retrived soc mapping: " + data);
            resolve(data);
        });
    });
}

function loadSkillsForOccupation(occCode) {
    return new Promise( function pr(resolve,reject) {
        console.log("Load for occ: " + occCode);
        var uri = "https://api.lmiforall.org.uk/api/v1/o-net/skills/" + occCode;

        client.get(uri, args, (data, response) => {
            console.log("Retrived occ to skills mapping: " + data);
            resolve(data);
        });
    });
}

function standardGetHeader() {
         
    var standardGetHeader = 
    { 
       "Accept": "application/json", 
    };

   return standardGetHeader;
}


function saveSkillsForOcc(soc, onetocccode, skillid, skillname, skillsrank) {
    return new Promise( function pr(resolve,reject) {
        db.none('INSERT INTO public."soc_onetocc_skills" (soccode, onetocccode, skillid, skillname, skillsrank) VALUES ($1, $2, $3, $4, $5)', [soc, onetocccode, skillid, skillname, skillsrank])
            .then(() => {
                resolve();
            })
            .catch( (error) =>{
                reject(error);
            });
    });
}


function printStats() {
    console.log("totalSocCodes: " + totalSocCodes + " processedSocCodes: " + processedSocCodes + " socCodesInProgress" + socCodesInProgress + " batchesStarted: " + batchesStarted);
}
