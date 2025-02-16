let map = L.map('map',{
    maxBounds: [
        [41.09807268468239, 29.01338475141975],
        [41.11383548170815, 29.039887364827734],
      ],
    maxBoundsViscosity: 1.0,
    minZoom:14,}).setView([41.10474805585872, 29.022884681711798   ], 15);
let openstreetmap = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
});

openstreetmap.addTo(map);
var beemarker = L.icon({
    iconUrl: 'images/Icons and Stuff/Bee-Marker.png',
    iconSize: [20, 30],
    iconAnchor: [10,30],
});
let tournumber = 0 ;
let allguesses = [];
let alllocations = [];
let participants = [];
let isitresult = false;
let ismarkeronmap = false;
let isconclusion = false;
let ispregame = true;
let numberofparticipant = 0;
var guess = L.marker( {icon: beemarker, draggable : true})

map.on('click', (e) => {
    if(!isitresult){
        if (ismarkeronmap) {
            guess.setLatLng(e.latlng);
            
        } else {
            guess = L.marker(e.latlng, {icon: beemarker, draggable: true }).addTo(map);
            ismarkeronmap = true;
            submitb.className="biggersubmit";
            submitb.innerText="Submit";
        }
    }
});
function parsing() {
    return new Promise((resolve, reject) => {
        Papa.parse('FinalCsv.csv', {
            download: true,
            header: true,
            complete: function(results) {
                latlong = results.data.map(row => [row.name, row.lat, row.lng]); 
                resolve(latlong);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}

parsing()
    .then(data => {
        rndnum = rnd(0, data.length - 1);
        currentimage.src = `images/ordered photos/${rndnum}.jpg`;
    })
    .catch(error => {
        console.error('Error parsing CSV:', error);
    });

let rndnum;
var latlong;
let imgline;
let score = 0 ;
const latlengthmeter = 111.32*1000;
const longtiduelengthmeter = 40075*1000*0.75346369194/360 //0.75346369194 is cos of latitude

const afterscore = document.getElementById("afterscore");
const image = document.getElementById("current-image");
const submitb = document.getElementById("submit");
const scorea = document.getElementById("score");
const nextimagea = document.getElementById("nextimage");
const errora = document.getElementById("htmlerror");

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
let totalscore = 0;
let linebetweenmarkers;

const sizeofitü = Math.floor(Math.sqrt((0.00944033377*latlengthmeter)**2 + (0.01506450233**longtiduelengthmeter)**2))
function guessSubmit() {
    if (!isitresult && ismarkeronmap ){
        clearTimeout(timeforshrink);
        latLngObj = guess.getLatLng();
        let latLngArr = [latLngObj.lat, latLngObj.lng];
        curlat =latlong[rndnum][1];
        curlng =latlong[rndnum][2];
        allguesses.push([latLngArr[0],latLngArr[1]]);
        alllocations.push([curlat,curlng]);
        let error = Math.floor(Math.sqrt((((curlat-latLngArr[0])*latlengthmeter)**2) + (((curlng-latLngArr[1])*longtiduelengthmeter)**2)));
        score = Math.floor(5000 * Math.E**(-5 * Math.sqrt(((curlat-latLngArr[0])**2)+((curlng-latLngArr[1])**2)) / 0.01947557727)) + 1;
        totalscore = totalscore + score;
        afterscore.textContent = `${score}`;
        errora.textContent = `${error}m`
        curloc = L.marker([curlat,curlng]).addTo(map);
        isitresult = true;
        currentimage.className = "afterimage";
        document.getElementById("map").style = `
    position:fixed;
    width: 100%;
    height: 85vh;`;
        map.invalidateSize(true);
        document.getElementById("results").removeAttribute("style");
        submitb.style.display="none";
        submitb.className="submit";
        
    map.setView([41.10474805585872, 29.022884681711798], 15);
    linebetweenmarkers = L.polyline([[curlat,curlng],[latLngArr[0],latLngArr[1]]], {color: 'black',weight: '3', dashArray: '10, 10', dashOffset: '10'}).addTo(map);
    
    map.fitBounds(linebetweenmarkers.getBounds());
    tournumber +=1;
    console.log(tournumber)
    }
    
}

function nextimg() {
    rndnum = rnd(0, latlong.length - 1);
    const newImageSrc = `images/ordered photos/${rndnum}.jpg`;
    
    const img = new Image();
    img.onload = function() {
        currentimage.src = newImageSrc;
        curloc.remove();
        guess.remove();
        ismarkeronmap = false;
        isitresult = false;
        document.getElementById("results").style.display = "none";
        currentimage.className = "image";
        document.getElementById("map").style = `position: absolute;   
    width: 20vw;
    height: 25vh;
    bottom:0;
    right: 0;
    margin-right: 2vw;
    margin-bottom: 5vh;
        `;
        document.getElementById("")
        
        submitb.removeAttribute("style");
        linebetweenmarkers.remove();
        map.setView([41.10474805585872, 29.022884681711798   ], 15);
        map.invalidateSize(true);
    };
    
    img.onerror = function() {
        console.error("Image failed to load: " + newImageSrc);
    }
    img.src = newImageSrc;
    submitb.className="placemarker";
    submitb.innerText="PLACE MARKER ON THE MAP";
 
}

function conclusion(){
    document.getElementById("results").style.display = "none";
    document.getElementById("map").style = `position:fixed;
            width: 100%;
            height: 70vh;`;
    submitb.style.display = "none";
    document.getElementById("conclusion").removeAttribute("style");
    document.getElementById("progressbar").value = `${totalscore}`;
    document.getElementById("points").innerText = `${totalscore} POINTS`;
    linebetweenmarkers.remove(map);
    curloc.remove();
    guess.remove();
    firstguess = L.marker(allguesses[0],{icon:beemarker}).addTo(map);
    secondguess =L.marker(allguesses[1],{icon:beemarker}).addTo(map);
    thirdguess = L.marker(allguesses[2],{icon:beemarker}).addTo(map);
    fourthguess =L.marker(allguesses[3],{icon:beemarker}).addTo(map);
    fifthguess = L.marker(allguesses[4],{icon:beemarker}).addTo(map);
    firstlocation = L.marker(alllocations[0], {
        icon: L.icon({
            iconUrl: 'images/Icons and Stuff/circle-number-1.svg',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);
    
    secondlocation = L.marker(alllocations[1], {
        icon: L.icon({
            iconUrl: 'images/Icons and Stuff/number-2-circle.svg',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);
    
    thirdlocation = L.marker(alllocations[2], {
        icon: L.icon({
            iconUrl: 'images/Icons and Stuff/number-circle-three.svg',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);
    
    fourthlocation = L.marker(alllocations[3], {
        icon: L.icon({
            iconUrl: 'images/Icons and Stuff/number-circle-four.svg',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);
    
    fifthlocation = L.marker(alllocations[4], {
        icon: L.icon({
            iconUrl: 'images/Icons and Stuff/number-circle-five.svg',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        })
    }).addTo(map);
    firstline = L.polyline([alllocations[0],allguesses[0]], {color: 'black',weight: '3', dashArray: '10, 10', dashOffset: '10'}).addTo(map);
    secondline = L.polyline([alllocations[1],allguesses[1]], {color: 'black',weight: '3', dashArray: '10, 10', dashOffset: '10'}).addTo(map);
    thirdline = L.polyline([alllocations[2],allguesses[2]], {color: 'black',weight: '3', dashArray: '10, 10', dashOffset: '10'}).addTo(map);
    fourthline = L.polyline([alllocations[3],allguesses[3]], {color: 'black',weight: '3', dashArray: '10, 10', dashOffset: '10'}).addTo(map);
    fifthline = L.polyline([alllocations[4],allguesses[4]], {color: 'black',weight: '3', dashArray: '10, 10', dashOffset: '10'}).addTo(map);
    let bounds = L.latLngBounds(firstline.getBounds());
    bounds.extend(secondline.getBounds());
    bounds.extend(thirdline.getBounds());
    bounds.extend(fourthline.getBounds());
    bounds.extend(fifthline.getBounds());
    map.fitBounds(bounds);
    participants[numberofparticipant - 1].push(totalscore);
    console.log(participants);
    

}
function pregame() {
    document.getElementById("conclusion").style = "display:none;";
    document.getElementById("map").style = "display:none;";
    document.getElementById("pregame").removeAttribute("style");
    ispregame = true;
}
function readygame() {
    ispregame = false;
    document.getElementById("map").style = `position: absolute;   
    width: 20vw;
    height: 25vh;
    bottom:0;
    right: 0;
    margin-right: 2vw;
    margin-bottom: 5vh;
        `;
    map.invalidateSize(true);
    document.getElementById("submit").removeAttribute("style");
    document.getElementById("currentimage").className="image";
    document.getElementById("pregame").style= "display:none;";
    tournumber = 0;
    totalscore = 0;
    ismarkeronmap = false;
    isitresult = false;
    map.eachLayer(function (layer) {
        if (!(layer instanceof L.TileLayer)) {
            map.removeLayer(layer);
        }
    });
    submitb.className="placemarker";
    submitb.innerText="PLACE MARKER ON THE MAP";

}
function controlspace(e) {
    if (e.code === 'Space') {
        if(isitresult&&ismarkeronmap && tournumber<5){
            nextimg()
        }else if(isitresult && ismarkeronmap && tournumber===5 && !isconclusion && !ispregame){
            isconclusion = true;
            conclusion()
        } else if (isconclusion && !ispregame){
            isconclusion= false;
            pregame()
        }else{
            guessSubmit()
        }
    }
    if (e.code === "Enter" && ispregame) {
        addparticipant()
    }
}
function addparticipant() {
    if(document.getElementById("input").value.length >1){
        participants.push([document.getElementById("input").value]);
        numberofparticipant +=1;
        console.log(numberofparticipant)
        console.log(participants)
        document.getElementById("input").value = "";
        readygame()
    }

}
let timeforshrink;
function enlargenmapandsubmitbutton() {
    if (!isitresult) {
        const mapcenter = map.getCenter();
        document.getElementById("map").style = `position: absolute;   
        width: 60vw;
        height: 75vh;
        bottom:0;
        right: 0;
        margin-right: 2vw;
        margin-bottom: 8vh;
            `;
        map.invalidateSize(true);
        map.panTo(mapcenter);   
        if(ismarkeronmap){
            submitb.className="biggersubmit";
        } else {submitb.className="biggerplacemarker"}
        clearTimeout(timeforshrink);}
    
}
function shrinksubmitandmap() {
    if (!isitresult) {timeforshrink = setTimeout(() => {
        const mapcenter = map.getCenter();
    document.getElementById("map").style = `position: absolute;   
    width: 20vw;
    height: 25vh;
    bottom:0;
    right: 0;
    margin-right: 2vw;
    margin-bottom: 5vh;
        `;
    map.panTo(mapcenter);
    map.invalidateSize(true);
    if(ismarkeronmap === true){
        submitb.className="submit";
    } else
     {submitb.className="placemarker"}
    }, 700);}
    
    

}

nextimagea.addEventListener("click", nextimg);
submitb.addEventListener("click", guessSubmit);
document.addEventListener("keydown", controlspace);
document.getElementById("menu").addEventListener("click",pregame);
document.getElementById("start").addEventListener("click",addparticipant);







