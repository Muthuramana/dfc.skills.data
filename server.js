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


var socCodesToProcess = [];
var stream = fs.createReadStream("./data/soc2010.csv");
 
var csvStream = csv()
    .on("data", function(data){
        socCodesToProcess.push(data[0]);
    })
    .on("end", function(){
        var i = socCodesToProcess.length % 10;
        console.log("Contents of CSV file read.  We have the following block count: " + i);
         for(count=0; count<i; count++) {
            var tmp = socCodesToProcess.splice(count,count+10);
            tmp.forEach(socCode => {
               processSoc(socCode);
            });
        sleep(2000);
        }
    });


stream.pipe(csvStream);


function processSoc(socCode) {
    console.log("Processing: " + socCode);
    loadOccupationsForSoc(socCode)
    .then(socOccs => {
        console.log(socOccs);

        socOccs.onetCodes.forEach((onetOcc) => {
            loadSkillsForOccupation(onetOcc.code)
            .then(skillsForOcc => {
                console.log(skillsForOcc);
                sleep(500);
                if (skillsForOcc.scales.length > 0) {
                    var skills = skillsForOcc.scales[0].skills;
                    skills.forEach(skill => {
                        saveSkillsForOcc(socOccs.soc, onetOcc.code, skill.id, skill.name, skill.value)
                        .then(x => {
                            console.log('Done save for skill: ' + skill.id + ' for occ: ' + onetOcc.code);
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
        var uri = "http://api.lmiforall.org.uk/api/v1/o-net/soc2onet/" + socCode;

        var client = new RestClient();
        var args = {
            headers: standardGetHeader()
        };

        client.get(uri, args, (data, response) => {
            console.log("Retrived soc mapping: " + data);
            resolve(data);
        });
    });
}

function loadSkillsForOccupation(occCode) {
    return new Promise( function pr(resolve,reject) {
        console.log("Load for occ: " + occCode);
        var uri = "http://api.lmiforall.org.uk/api/v1/o-net/skills/" + occCode;

        var client = new RestClient();
        var args = {
            headers: standardGetHeader()
        };

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