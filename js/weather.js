$(document).ready(function() {
  $(".content").hide();
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

    //collect geographic coordinates
    var coords = {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude
    };

    //run another function on these coordinates so that we can use this information
    callback(coords);
  });
}

function geocode(lat, lon) {
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

    //collect pertinent information about the weather that can be used to update the display
    var weatherInfo = {
      icon: json.weather[0].icon,
      code: json.weather[0].id,
      description: json.weather[0].description
    };

    //log and display temperature and conditions information
    console.log(temp + String.fromCharCode(176) + " F");
    console.log(weatherInfo);
    $("#temp").html(temp + String.fromCharCode(176) + " F");
    $("#conditions").html(titleCase(weatherInfo.description));

    //set the background according to the given weather information
    determineShownImage(weatherInfo);
  });
}

//function that calls various other functions in order to update information on weather and location
function updateData() {
  updateLocationWeather(function(coords) {
    console.log(coords);
    geocode(coords.lat, coords.lon);
    updateWeather(coords.lat, coords.lon);

    //once all calls completed, update the page
    setTimeout(function() {
      $(".loading").hide();
      $(".content").show();
    }, 100);
  });
}

//set background image based on weather info
function determineShownImage(info) {
  var correctImg;

  //this switch will handle most common weather conditions
  switch(info.icon) {
    //case for clear day
    case "01d":
      correctImg = "sunny";
      break;

    //case for clear night
    case "01n":
      correctImg = "clear-night";
      break;

    //case for partly cloudy day
    case "02d":
      correctImg = "partly-cloudy";
      break;

    //case for partly cloudy night
    case "02n":
      correctImg = "partly-cloudy-night";
      break;

    //case for cloudy/overcast
    case "03d":
    case "03n":
    case "04d":
    case "04n":
      correctImg = "cloudy";
      break;

    //case for rainy
    case "09d":
    case "09n":
    case "10d":
    case "10n":
      correctImg = "rain";
      break;

    //case for thunderstorms
    case "11d":
    case "11n":
      correctImg = "tstorm";
      break;

    //case for snowy
    case "13d":
    case "13n":
      correctImg = "snow";
      break;
  }
  //the icon ID 50d is used for many different weather types; this switch specifically handles that icon ID
  if(!correctImg) {
    switch (info.code) {
      case 900:
      case 781:
        correctImg = "tornado";
        break;

      //case for tropical storms/hurricanes/etc
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
        correctImg = "hurricane";
        break;

      //case for extreme cold
      case 903:
        correctImg = "snow";
        break;

      //case for extreme heat
      case 904:
        correctImg = "heat";
        break;

      //case for hail
      case 906:
        correctImg = "hail";
        break;

      //case for volcanic ash
      case 762:
        correctImg = "volcanic-ash";
        break;

      //case for sandstorm
      case 731:
      case 751:
        correctImg = "sandstorm";
        break;

      //case for fog
      case 701:
      case 711:
      case 721:
      case 741:
        correctImg = "fog";
        break;

      //case for "breezy" weather
      case 951:
      case 952:
      case 953:
      case 954:
      case 955:
      case 956:
        correctImg = "breeze";
        break;
    }
  }

  console.log(correctImg);
  setBackgroundImage(correctImg);
}

function setBackgroundImage(src) {
  //if not square or landscape, then update image name to indicate we need a portrait image
  if(!window.matchMedia("(min-aspect-ratio: 1/1)").matches) {
    src += "-p";
  }

  src = "#d3d3d3 url(./img/" + src + ".jpg) no-repeat center fixed";
  //console.log(src);

  //update the background image
  $("html").css({
    "background": src,
    "-webkit-background-size": "cover",
    "-moz-background-size": "cover",
    "-o-background-size": "cover",
    "background-size": "cover"
  });

  console.log($("html").css("background"));
}

//convert a string to simplified title case (first letter of every word capitalized)
function titleCase(str) {
  return str.split(' ').map(function(val) {
    return val.charAt(0).toUpperCase() + val.substr(1).toLowerCase();
  }).join(' ');
}
