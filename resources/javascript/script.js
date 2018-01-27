var mymap = L.map('map').setView([56.835, 60.612], 13);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoiZGV2c2FndWwiLCJhIjoiY2pjd2RhMzl0MGdhaDMzcW82eGx1amNpayJ9.9CJ5rqAdw90_Tf9FKj-XBw'
}).addTo(mymap);
