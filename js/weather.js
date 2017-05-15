$(document).ready(function() {
  updateTime();
  updateDate();
  updateLocationWeather();
  var intervalTime = setInterval(updateTime, 1000); //update time every second
  var intervalDate = setInterval(updateDate, 60000); //update date every minute
  var intervalLocationWeather = setInterval(updateLocationWeather, 900000); //update location/weather every fifteen minutes
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
            if(json.results[0].address_components[i].types[l] === "administrative_area_level_1") {
              state = json.results[0].address_components[i].short_name;
            }
          }

          for(var m = 0; m < json.results[0].address_components[i].types.length; m++) {
            if(json.results[0].address_components[i].types[m] === "country") {
              country = json.results[0].address_components[i].short_name;
            }
          }
        }

        //update the displayed location. If not in US display city and country; if in US display city and state
        var formattedCSC = (country !== "US") ? city + ", " + country : city + ", " + state;
        console.log(city + ", " + state + ", " + country);
        $("#loc").html(formattedCSC);
      });

      var appID = "&appid=296c68960963db7daf6943cd88b7d6f0";

      //collect weather data
      $.getJSON("https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=Imperial" + appID,function(json) {
        //console.log(json);

        var temp = json.main.temp;
        temp = temp.toFixed(0); //don't need to be too precise on temp

        //temperature of -0 wouldn't make sense to the user
        if(temp == -0) {
          temp = 0;
        }

        var conditions = json.weather[0].main;
        var iconID = json.weather[0].icon;

        //log and display temperature and conditions information
        console.log(temp + String.fromCharCode(176) + " F, " + conditions + ", " + iconID);
        $("#temp").html(temp + String.fromCharCode(176) + " F");
        $("#conditions").html(conditions);
      });
    });
  }
}
