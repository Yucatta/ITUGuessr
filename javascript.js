let map = L.map('map').setView([41.10474805585872, 29.022884681711798   ], 15);
let openstreetmap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 20
});

openstreetmap.addTo(map);
var myIcon = L.icon({
    iconUrl: 'images/Icons and Stuff/Black-marker.png',
    iconSize: [20, 30],
    iconAnchor: [10,30],
});
let sbm = false;
let ismarker = false;
var guess = L.marker( {icon: myIcon, draggable : true})

map.on('click', (e) => {
    if(!sbm){
        if (ismarker) {
            guess.setLatLng(e.latlng);
        } else {
            guess = L.marker(e.latlng, {icon: myIcon, draggable: true }).addTo(map);
            ismarker = true;
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
const submitb = document.getElementById("Submit");
const scorea = document.getElementById("score");
const nextimagea = document.getElementById("nextimage");
const errora = document.getElementById("htmlerror");

function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
let totalscore;

const sizeofitü = Math.floor(Math.sqrt((0.00944033377*latlengthmeter)**2 + (0.01506450233**longtiduelengthmeter)**2))
function guessSubmit() {
    if (!sbm && ismarker){
        latLngObj = guess.getLatLng();
        let latLngArr = [latLngObj.lat, latLngObj.lng];
        curlat =latlong[rndnum][1];
        curlng =latlong[rndnum][2];
        console.log(curlat);
        console.log(Math.cos(curlat));
        console.log(curlat,latLngArr[0]);
        console.log(curlng,latLngArr[1]);
        let error = Math.floor(Math.sqrt((((curlat-latLngArr[0])*latlengthmeter)**2) + (((curlng-latLngArr[1])*longtiduelengthmeter)**2)));
        score = Math.floor(5000 * Math.E**(-5 * Math.sqrt(((curlat-latLngArr[0])**2)+((curlng-latLngArr[1])**2)) / 0.01947557727)) + 1;
        totalscore +=score  
        console.log("score: ",Math.floor(5000 * error / sizeofitü) + 1);
        afterscore.textContent = `${score}`;
        errora.textContent = `${error}m`
        curloc = L.marker([curlat,curlng]).addTo(map);
        sbm = true;
        currentimage.className = "afterimage";
        document.getElementById("map").style = `
    position:fixed;
    width: 100%;
    height: 85vh;`;
    
        map.invalidateSize(true);
        document.getElementById("results").removeAttribute("style");
        
    map.setView([41.10474805585872, 29.022884681711798], 15);
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
        ismarker = false;
        sbm = false;
        document.getElementById("results").style.display = "none";
        currentimage.className = "image";
        document.getElementById("map").style = `
            position: absolute;   
            width: calc(100vw - 100vh/3*4);
            height: 100vh;
            top: 0;
            right: 0;
        `;
        map.panTo(new L.LatLng(41.1058783968682, 29.04225723149176));
    };
    
    img.onerror = function() {
        console.error("Image failed to load: " + newImageSrc);
        // Halt remaining lines
    };
    
    img.src = newImageSrc;
}

function controlspace(e) {
    if (e.code === 'Space') {
        if(sbm&&ismarker){
            nextimg()
        }else{
            guessSubmit()
        }
        
    } else {
        console.log(e.key);
    }
}

nextimagea.addEventListener("click", nextimg);
// submitb.addEventListener("click", guessSubmit);
document.addEventListener("keydown", controlspace);
//2023. fotoğraf çok epik







