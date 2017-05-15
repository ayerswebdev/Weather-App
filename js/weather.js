$(document).ready(function() {
  updateTime();
  updateDate();
  updateLocationWeather();
  var intervalTime = setInterval(updateTime, 1000);
  var intervalDate = setInterval(updateDate, 60000);
});

//use Date object to get the current time and display it on screen
function updateTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  var suffix = (hours > 11) ? "PM" : "AM";
  hours = (hours === 0 || hours > 12) ? hours % 12 : hours;
  $("#time").html(hours + ":" + minutes + " " + suffix);
}

//use Date object to get the current date and display it on screen
function updateDate() {
  var now = new Date();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var year = now.getFullYear();
  var formattedDate = month + "/" + date + "/" + year;
  console.log(formattedDate);
  $("#date").html(formattedDate);
}

function updateLocationWeather() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      console.log("Latitude: " + lat + "; " + "Longitude: " + lon);
      //use Google Maps Geolocation API to convert latitude and longitude to a city and state, then display on screen
      $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=AIzaSyD2tL_cbRms_PUZl1qXPZjAucNmyCNKWa4", function(json) {
        console.log(json);
        var city = "", state = "", country = "";

        //rural areas use the "locality" type to hold the city name; search the JSON for this and update city variable if found
        for(var i = 0; i < json.results[0].address_components.length; i++) {
          for(var j = 0; j < json.results[0].address_components[i].types.length; j++) {
            if(json.results[0].address_components[i].types[j] === "locality") {
              city = json.results[0].address_components[i].short_name;
            }
          }

          //urban areas use the "sublocality" type to hold the city name; if no city was found before, find it here and update city variable
          if(city === "") {
            for(var k = 0; k < json.results[0].address_components[i].types.length; k++) {
              if(json.results[0].address_components[i].types[k] === "sublocality") {
                city = json.results[0].address_components[i].short_name;
              }
            }
          }

          //the "administrative_area_level_1" type is used to hold the state's name; collect the postal abbreviation from here
          for(var l = 0; l < json.results[0].address_components[i].types.length; l++) {
            if(json.results[0].address_components[i].types[l] == "administrative_area_level_1") {
              state = json.results[0].address_components[i].short_name;
            }
          }
        }

        //update the displayed location
        var formattedCS = city + ", " + state;
        console.log(formattedCS);
        $("#loc").html(formattedCS);
      });
    });
  }
}
