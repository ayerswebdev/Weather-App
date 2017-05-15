$(document).ready(function() {
  updateTime();
  updateDate();
  updateLocationWeather();
  var intervalTime = setInterval(updateTime, 1000);
  var intervalDate = setInterval(updateDate, 60000);
});

function updateTime() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  var suffix = (hours > 11) ? "PM" : "AM";
  hours = (hours === 0 || hours > 12) ? hours % 12 : hours;
  $("#time").html(hours + ":" + minutes + " " + suffix);
}

function updateDate() {
  var now = new Date();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var year = now.getFullYear();
  $("#date").html(month + "/" + date + "/" + year);
}

function updateLocationWeather() {
  if(navigator.geolocation) {
    var location = getLocation();
    var lat = location[0];
    var lon = location[1];

    $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lon + "&key=AIzaSyD2tL_cbRms_PUZl1qXPZjAucNmyCNKWa4", function(json) {
      console.log(json);
    });
  }

  function getLocation() {
    navigator.geolocation.getCurrentPosition(function(position) {
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;
      var location = [lat, lon];
      return location;
    });
  }
}
