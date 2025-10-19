var config = {
  IS_APP: true,
  DISPLAY_NAVBAR: true,
  KEYOPEN: false
};

/*
let config;
async function init() {
  import('../config.js')
    .then(module => {
      config = module.default_config;
      console.log('Config loaded:', config);
    });
}*/

let manualSet = 0;

document.addEventListener("DOMContentLoaded", function () {
  const mainNav = document.getElementById("mainNav");
  const navbadr = document.getElementById("navbar");
  const maps = document.getElementById("map");
  const bodyyyy = document.getElementById("body");
  const override = document.createElement("style");
  override.setAttribute("id", "styleForStuff");
  if (!config.DISPLAY_NAVBAR) {
    mainNav.style.height = "100%";
    navbadr.style.display = "none";
  } else {
    navbadr.style.display = "flex";
    bodyyyy.style.height = "calc(100% - 128px)";
    /*maps.style.height = "calc(100% - 69px) !important";*/
    override.innerText = "@media screen and (min-width:640px) {#map {height: calc(100% - 62px) !important;top:62px !important;}}"
    document.head.appendChild(override);
  }

  if (config.IS_APP == true) {
    const playbutton = document.getElementById("gplay-icon");
    playbutton.style.display = "none";
  }
});

var myLocation;/*
const myCustomColour = '#ff0000'

const markerHtmlStyles = `
background-color: ${myCustomColour};
width: 2rem;
height: 2rem;
display: block;
left: -1.5rem;
top: -1.5rem;
position: relative;
border-radius: 3rem 3rem 0;
transform: rotate(45deg);
border: 1px solid #FFFFFF`;

const icon = L.divIcon({
className: "my-custom-pin",
iconAnchor: [0, 24],
labelAnchor: [-6, 0],
popupAnchor: [0, -36],
html: `<span style="${markerHtmlStyles}" />`
})*/
let latitude = 0;
let longitude = 0;
var firstTime = 1;
var data = [];
function showTab(tabId, element) {
  document.getElementById('map').style.display = 'none';
  document.getElementById('settings_tab').style.display = 'none';
  document.getElementById('findbox').style.display = 'none';

  document.getElementById(tabId).style.display = 'block';
  const tabs = document.querySelectorAll('.tab-selector');
  tabs.forEach(tab => tab.classList.remove('active'));

  element.classList.add('active');
}
var map = L.map('map').setView([-40.900557, 174.885971], 6);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | Data &copy; Epipen Locator'
}).addTo(map);
async function getData() {
  if (data != []) {
    let url = await fetch(`https://corsproxy.io/?url=https://docs.google.com/spreadsheets/d/1fUVx8t7VFMKTekBiXPzU7VZy957WD8o8mpPomt_pa1E/export?format=csv&id=1fUVx8t7VFMKTekBiXPzU7VZy957WD8o8mpPomt_pa1E&gid=0&cache=5646456`);
    data = await url.text();
    data = csvParser(data)
  }
  return data;
}
async function doMap() {
  await setLocationOnMap();
  let data = await getData();
  console.log(data);
  data.forEach(element => {
    var marker = L.marker([element[0], element[1]]).addTo(map);
    if (element[11] == "Purchase") {
      L.DomUtil.addClass(marker._icon, "yellowPin");
    } else if (element[11] == "Public") {
      L.DomUtil.addClass(marker._icon, "redPin");
      var pubOrPriv = "<b>Public use</b>";
    } else if (element[11] == "Private") {
      var pubOrPriv = "<b>Private use only</b>";
    }
    //marker._icon.classList.add("markerColour");
    var popup = `<b>${element[2]}</b><br><br>${element[3]}<br>${element[4]}<br>${element[5]}`;
    if (element[10]) {
      var popup = `${popup}<br><br>Available on <b>${element[10]}</b>`;
    }
    if (element[8] && element[9]) {
      var popup = `${popup}, <br>between <b>${element[8]}</b> and <b>${element[9]}</b>`;
    }

    if (pubOrPriv) {
      var popup = `${popup}<br><br>${pubOrPriv}`;
    }

    if (element[12]) {
      var popup = `${popup}<br><br><b>${element[12]}</b>`;
    }

    if (element[7]) {
      var popup = `${popup}<br><br><a id="call" href="tel:${element[7]}">Phone</a>`;
    }


    marker.bindPopup(popup, { autoPan: true });
  });
}

async function getLocationFromIp() {
  let myip = await fetch(`https://api.ip.sb/geoip/`);
  const ip2 = await myip.json();
  console.log(ip2)
  //let ip = await fetch(`https://ip-api.io/api/v1/ip/${ip2.ip}`);
  //const data = await ip.json();
  const returndata = { "isp": ip2.isp, "city": ip2.city, "country": ip2.country, "latitude": ip2.latitude, "longitude": ip2.longitude };
  return returndata;
}
async function setLocationOnMap(latitude_marker = 0, longitude_marker = 0) {
  //console.log(info);
  var lat;
  var lng;
  function doPopup(info) {
    var locationPopup = `<b>Your Location</b>`

    //if (info.city != "null") {
    //  var locationPopup = `${locationPopup}<br>${info.city}, ${info.country}`;
    //} else {
    var locationPopup = `${locationPopup}<br>${info.country}`;
    //}
    //var

    var locationPopup = `${locationPopup}<br><br>`;

    if (info.isp == "Spark New Zealand") {
      locationPopup = `${locationPopup}On <b style='color:rebeccapurple;'>Spark NZ</b>`;
    } else if (info.isp == "One NZ") {
      locationPopup = `${locationPopup}On <b style='color:green;'>One NZ</b>`;
    } else if (info.isp == "2degrees Mobile" || info.isp == "2degrees") {
      locationPopup = `${locationPopup}On <b style='color:dodgerblue;'>2degrees</b>`;
    } else {
      locationPopup = `${locationPopup}On <b>${info.isp}</b>`;
    }
    //console.log(locationPopup);
    return locationPopup;
  }
  if (manualSet == 0) {
    if (navigator.geolocation && navigator.userAgent.search("Firefox") == -1) {
      async function showPosition(position) {
        function hideErr() {
          const errorbox = document.getElementById("errorbox");
          const body = document.getElementById("main");
          errorbox.style.display = "none";
          body.style.display = "block";
        }
        if (position) {
          lat = position.coords.latitude;
          lng = position.coords.longitude;
          myLocation.setLatLng([lat, lng]);
          myLocation.bringToBack();
          if (firstTime == 1) {
            map.setView([position.coords.latitude, position.coords.longitude], 15);
            firstTime = 0;
          } else {
            console.log("NO UPDATE");
          }
          await findNearestLocation(position.coords.latitude, position.coords.longitude);
          var info = await getLocationFromIp();
          myLocation.bindPopup(doPopup(info));
          //myLocation.bindPopup(locationPopup);
          hideErr();

        } else {
          console.log("N/A");
        }
      }
      function errorOut(error) {
        function showError(err) {
          if (err != "Location information is unavailable.") {
            const body = document.getElementById("main");
            const errorbox = document.getElementById("errorbox");
            const materialbottom = document.getElementById("material-bottom");
            body.style.display = "none";
            materialbottom.style.display = "none";
            errorbox.style.display = "block";

            errorbox.innerHTML = `<h3>Error</h3><br>${err}`;
          }
        }
        switch (error.code) {
          case error.PERMISSION_DENIED:
            /*showError("Location permission has not been granted.\
                        Please grant this permission.");*/
            showError("Epipen Locator requires your location permission to be turned <b>on</b>.");
            break;
          case error.POSITION_UNAVAILABLE:
            showError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            showError("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            showError("An unknown error occurred.");
            break;
        }
      }
      navigator.geolocation.getCurrentPosition(showPosition, errorOut);
    } else {
      var info = await getLocationFromIp();
      if (info) {
        //myLocation = L.marker([info.latitude, info.longitude]);
        lat = info.latitude;
        lng = info.longitude;
        myLocation.setLatLng([lat, lng]);
        //myLocation.bindPopup(locationPopup);
        if (firstTime == 1) {
          map.setView([info.latitude, info.longitude], 15);
          firstTime = 0;
        } else {
          console.log("NO UPDATE");
        }
        myLocation.bindPopup(doPopup(info));
        myLocation.bringToBack();
        await findNearestLocation(info.latitude, info.longitude);
      }
    }
    latitude = lat;
    longitude = lng;
  } else {
    var info = await getLocationFromIp();
    lat = latitude_marker;
    lng = longitude_marker;
    myLocation.setLatLng([lat, lng]);
    //myLocation.bindPopup(locationPopup);
    if (firstTime == 1) {
      map.setView([latitude_marker, longitude_marker], 15);
      firstTime = 0;
    } else {
      console.log("NO UPDATE");
    }
    myLocation.bindPopup(doPopup(info));
    myLocation.bindTooltip("<b>Selected location</b>", {
      permanent: true,   // stays visible, doesn't require hover
      direction: "top" // position relative to the marker
    });
    myLocation.bringToBack();
    await findNearestLocation(latitude_marker, longitude_marker);
  }
}

function doGoofyShitForSamsung() {
  let userAgentString = navigator.userAgent;
  let threeStars = userAgentString.indexOf("Android 15") > -1 && userAgentString.indexOf("SM-") > -1;
  if (threeStars) {
    if (window.innerHeight > window.innerWidth) {
      console.log("1");
      const body = document.getElementById("html");
      const settingsTab = document.getElementById("settings_tab");
      settingsTab.style.paddingRight = "10px";
      body.style.margin = "0px";
      body.style.marginTop = "32px";
      body.style.marginBottom = "56px";
      body.style.height = "calc(100% - 74px)";
    } if (window.innerWidth > window.innerHeight) {
      const body = document.getElementById("html");
      console.log("0");
      body.style.marginTop = "28px";
      body.style.marginLeft = "32px";
      body.style.marginRight = "56px";
      body.style.marginBottom = "0px";
      body.style.height = "calc(100% - 28px)";
    }
  }
}

//init();
document.addEventListener("DOMContentLoaded", function () {
  doMap();
  doGoofyShitForSamsung();
  map.createPane("locationMarker");
  //map.getPane("locationMarker").style.zIndex = 1;
  myLocation = L.circleMarker([0, 0], { pane: "locationMarker" }).addTo(map);
  myLocation.bindTooltip("<b>You are here</b>", {
    permanent: true,   // stays visible, doesn't require hover
    direction: "top" // position relative to the marker
  });
  myLocation.setStyle({ color: 'red' });
});
//myLocation._icon.classList.add("markerColour");
//setLocationOnMap();

function debug() {
  const debugInfo = document.querySelector(".debug #settings_dropdown_content");
  debugInfo.innerHTML = `Is app version: <b><i>${config.IS_APP}</i><b><br><br><b>Running on UA</b>:<br><code>${navigator.userAgent}</code>`;
}
debug();
if (navigator.connection.type == "cellular" && navigator.userAgent.search("Firefox") == -1) {
  setInterval(setLocationOnMap, 15000);
} else {
  setInterval(setLocationOnMap, 5000);
}
// uses code from "Google Spreadsheets"
function csvParser(csv) {
  const fixName = (name) => {
    return name.endsWith("\r") ? name.slice(0, -1) : name.trim();
  };

  if (!csv || typeof csv !== "string") {
    throw new Error("Invalid CSV input");
  }

  const rows = csv.split("\n").filter(row => row.trim() !== "");
  const result = rows.map(row => row.split(",").map(fixName));

  return result;
}

async function getNearestCoordinate(userLat, userLng, data, firstTime) {
  let nearest = null;
  let minDistance = Infinity;

  for (const item of data) {
    console.log(item);
    let lat2 = parseFloat(item[0]);
    let lng2 = parseFloat(item[1]);
    console.log(lat2, lng2);

    userLat = parseFloat(userLat);
    userLng = parseFloat(userLng);
    console.log(userLat, userLng);

    let distance = Math.sqrt(Math.pow(lat2 - userLat, 2) + Math.pow(lng2 - userLng, 2));
    //console.log(`Distance to (${lat2}, ${lng2}):`, distance);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = item;
    }
  }

  //return nearest;
  const box = document.getElementById("nearest");
  box.innerHTML = `<summary><table id="tableNav"><tr><td><b>Nearest Location</b><td><button onclick="showDetails();">Close</button></td></tr></table></summary><div id="content"><p><b>${nearest[2]}</b></p><br><p>${nearest[3]}, <br>${nearest[4]}, <br>${nearest[5]}</p></div>`;
  // Samsung Internet is weird so we need this stuff
  if (firstTime == true) {
    box.open = true;
  }
}

async function findNearestLocation(userLat, userLng, firstTime = true) {
  const data = await getData();
  await getNearestCoordinate(userLat, userLng, data, firstTime);
  //const box = document.getElementById("nearest");
  //
  //if (nearest) {
  //    box.innerHTML = `<summary>Nearest Location</summary><div id="content"><p>${nearest[2]}</p></div>`;
  //} else {
  //    box.innerHTML = `<summary>Nearest Location</summary><div id="content"><p>No nearby locations found.</p></div>`;
  //}
}

function showKey(input) {
  const key = document.getElementById("key");
  const mapicon = document.getElementById("mapicon");
  if (input == null) {
    if (config.KEYOPEN == false) {
      config.KEYOPEN = true;
      key.style.display = "block";
    } else {
      config.KEYOPEN = false;
      mapicon.click();
      key.style.display = "none";
    }
  } else if (input == false) {
    config.KEYOPEN = false;
    key.style.display = "none";
  }
}

function showDetails() {
  const box = document.getElementById("nearest");
  const text = document.querySelector("#nearest summary button");
  if (box.open == false) {
    box.open = true;
    text.innerText = "Close";
  } else {
    box.open = false;
    text.innerText = "Open";
  }
}

async function flyTo(city, postcode, country) {
  let data = await fetch(`https://corsproxy.io/?url=https://nominatim.openstreetmap.org/search?city=${city}&postalcode=${postcode}&country=${country}&format=jsonv2`);
  let jsondata = await data.json();
  console.log(jsondata[0]);
  manualSet = 1;
  firstTime = 1;
  setLocationOnMap(jsondata[0]["lat"], jsondata[0]["lon"]);

  const mapicon = document.getElementById("mapicon");
  mapicon.click();
}

function fixHead() {
  /*const stylestuff = document.getElementById("styleForStuff");
  if (stylestuff) {
    stylestuff.innerText = "@media screen and (min-width:640px) {#map {height: 100% !important;top:0px !important;}}";
  } else {
    console.warn('Style element with id "styleForStuff" not found.');
  }*/
  return 1;
}

window.showKey = showKey;
window.showTab = showTab;
window.doGoofyShitForSamsung = doGoofyShitForSamsung;