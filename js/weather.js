$(document).ready(function() {
  updateTime();
  updateDate();
  updateData();
  var intervalTime = setInterval(updateTime, 1000); //update time every second
  var intervalDate = setInterval(updateDate, 60000); //update date every minute
  var intervalData = setInterval(updateData, 900000); //update location/weather every fifteen minutes
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

function updateLocationWeather(callback) {
  navigator.geolocation.getCurrentPosition(function(pos) {
    var coords = {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude
    };

    callback(coords);
  });
}

function updateLocation(lat, lon) {
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

      //get country data from JSON
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
}

function updateWeather(lat, lon) {
  var appID = "&appid=296c68960963db7daf6943cd88b7d6f0";

  //collect weather data
  $.getJSON("https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&units=Imperial" + appID,function(json) {
    //console.log(json);
    console.log(json);
    var temp = json.main.temp.toFixed(0); //get temp, rounded to nearest degree

    //temperature of -0 wouldn't make sense to the user
    if(temp == -0) {
      temp = 0;
    }

    var weatherInfo = {
      icon: json.weather[0].icon,
      code: json.weather[0].id,
      description: json.weather[0].description
    };

    //log and display temperature and conditions information
    console.log(temp + String.fromCharCode(176) + " F");
    console.log(weatherInfo);
    $("#temp").html(temp + String.fromCharCode(176) + " F");
    $("#conditions").html(formatConditions(weatherInfo.description));

    setBackground(weatherInfo);
  });
}

function updateData() {
  updateLocationWeather(function(coords) {
    console.log(coords);
    updateLocation(coords.lat, coords.lon);
    updateWeather(coords.lat, coords.lon);
  });
}

//set background image based on weather info
function setBackground(info) {
  //this switch will handle most weather conditions
  switch(info.icon) {
    //case for clear day
    case "01d":
      $("html").css("background", "url(./img/sunny.jpg) no-repeat center fixed");
      break;

    //case for clear night
    case "01n":
      $("html").css("background", "url(./img/clear-night.jpg) no-repeat center fixed");
      break;

    //case for partly cloudy day
    case "02d":
      $("html").css("background", "url(./img/partly-cloudy.jpg) no-repeat center fixed");
      break;

    //case for partly cloudy night
    case "02n":
      $("html").css("background", "url(./img/partly-cloudy-night.jpg) no-repeat center fixed");
      break;

    //case for cloudy/overcast
    case "03d":
    case "03n":
    case "04d":
    case "04n":
      $("html").css("background", "url(./img/cloudy.jpg) no-repeat center fixed");
      break;

    //case for rainy
    case "09d":
    case "09n":
    case "10d":
    case "10n":
      $("html").css("background", "url(./img/rain.jpg) no-repeat center fixed");
      break;

    //case for thunderstorms
    case "11d":
    case "11n":
      $("html").css("background", "url(./img/tstorm.jpg) no-repeat center fixed");
      break;

    //case for snowy
    case "13d":
    case "13n":
      $("html").css("background", "url(./img/snow.jpg) no-repeat center fixed");
      break;
  }
  //the icon ID 50d is used for many different weather types; this switch specifically handles that icon ID
  switch (info.code) {
    case 900:
    case 781:
      $("html").css("background", "url(./img/tornado.jpg) no-repeat center fixed");
      break;

    case 901:
    case 902:
    case 962:
    case 961:
    case 960:
    case 959:
    case 958:
    case 957:
    case 905:
    case 771:
      $("html").css("background", "url(./img/hurricane.jpg) no-repeat center fixed");
      break;

    case 903:
      $("html").css("background", "url(./img/snow.jpg) no-repeat center fixed");
      break;

    case 904:
      $("html").css("background", "url(./img/heat.jpg) no-repeat center fixed");
      break;

    case 906:
      $("html").css("background", "url(./img/hail.jpg) no-repeat center fixed");
      break;

    case 762:
      $("html").css("background", "url(./img/volcanic-ash.jpg) no-repeat center fixed");
      break;

    case 731:
    case 751:
      $("html").css("background", "url(./img/sandstorm.jpg) no-repeat center fixed");
      break;

    case 701:
    case 711:
    case 721:
    case 741:
      $("html").css("background", "url(./img/fog.jpg) no-repeat center fixed");
      break;

    case 951:
    case 952:
    case 953:
    case 954:
    case 955:
    case 956:
      $("html").css("background", "url(./img/breeze.jpg) no-repeat center fixed");
      break;
  }
}

function formatConditions(str) {
  return str.split(' ').map(function(val) {
    return val.charAt(0).toUpperCase() + val.substr(1).toLowerCase();
  }).join(' ');
}
