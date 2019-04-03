import { List } from "./List";

declare var google: any;

export class Mapster {
  gMap;
  geocoder = new google.maps.Geocoder();
  markers: List = new List();
  markerClusterer;
  geocoding: boolean = false;
  constructor(element, opts) {
    this.gMap = new google.maps.Map(element, opts);
  }

  //add place markers on click
  enableOnClickPlaceMarker() {
    var self = this;
    self._on({
      obj: self.gMap,
      event: "click",
      callback: function(e) {
        self.removeBy(function() {
            return true;
          });
        if (self.geocoding) {
          self.geocodeLatLng(
            e.latLng,
            function(res) {
              console.log(res);
              if (res[0]) {
                self.addPlaceMarker(res[0], e.latLng);
              } else {
                window.alert("No results for this location");
              }
            },
            function(status) {
              window.alert("Geocoder failed due to: " + status);
            }
          );
        }
        else{
          self.addMarker({position:e.latLng});
        }
      }
    });
  }
  //for events
  _on(opts) {
    var self = this;
    google.maps.event.addListener(opts.obj, opts.event, function(e) {
      opts.callback.call(self, e, opts.obj);
    });
  }
  _attachEvents(obj, events) {
    var self = this;
    events.forEach(function(event) {
      self._on({
        obj: obj,
        event: event.name,
        callback: event.callback
      });
    });
  }
  _getLatLng(pos) {
    return new google.maps.LatLng(pos.lat, pos.lng);
  }
  setCenter(pos) {
    this.gMap.setCenter(new google.maps.LatLng(pos.lat, pos.lng));
  }
  //reverse geocoding
  geocodeLatLng(latlng, callbackSuccess, callbackError) {
    //var latlngStr = latlng.split(',', 2);
    //var latlng = { lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1]) };
    this.geocoder.geocode({ location: latlng }, function(results, status) {
      if (status === "OK") {
        callbackSuccess.call(this, results);
      } else {
        callbackError.call(this, status);
        //window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  //add marker to a given place
  addPlaceMarker(place, latlng = null) {
    console.log(place);
    var self = this;
    //icon setting
    var icon;
    if (place.icon) {
      icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
    }
    //info content setting
    //var content= '<div class="location-info-container">' + place.formatted_address + '</div>';
    var infoContainer = document.createElement("div");
    infoContainer.setAttribute("class", "location-info-container");
    var content = document.createElement("div");
    content.innerHTML = place.formatted_address; //actual content
    infoContainer.appendChild(content);
    var selectBtn = document.createElement("button");
    selectBtn.setAttribute("type", "button");
    selectBtn.innerHTML = "Select";
    infoContainer.appendChild(selectBtn);
    selectBtn.addEventListener("click", function(e) {
      console.log(e);
      console.log(this);
      console.log(self);
      alert("hii");
      //google.maps.event.trigger(self, menuItem.eventName, self.position_, itemOptions.eventName);
    });
    //adding marker
    self.addMarker({
      uid: self._generateId(),
      map: self.gMap,
      icon: icon,
      title: place.name,
      position: latlng != null ? latlng : place.geometry.location,
      draggable: true,
      content: infoContainer,
      events: [
        {
          name: "dragend",
          callback: function(e, marker) {
            console.log(e);
            console.log(marker);
            var latLng = e.latLng;
            self.geocodeLatLng(
              latLng,
              function(res) {
                console.log(res);
                if (res[0]) {
                  self.removeBy(function() {
                    return true;
                  });
                  self.addPlaceMarker(res[0], latLng);
                } else {
                  self.removeBy(function() {
                    return true;
                  });
                  window.alert("No results for this location");
                }
              },
              function(status) {
                self.removeBy(function() {
                  return true;
                });
                window.alert("Geocoder failed due to: " + status);
              }
            );
          }
        }
      ]
    });
  }

  addMarker(opts) {
    var marker,
      self = this;
    if (opts.lat || opts.lng) {
      opts.position = {
        lat: opts.lat,
        lng: opts.lng
      };
    }

    marker = this._createMarker(opts);
    if (this.markerClusterer) {
      this.markerClusterer.addMarker(marker);
    }
    //add info window for marker
    marker.infoWindow = new google.maps.InfoWindow();
    //add the marker to the markers list
    this.markers.add(marker);
    //handling events
    if (opts.events) {
      this._attachEvents(marker, opts.events);
    }
    if (opts.content) {
      this._on({
        obj: marker,
        event: "click",
        callback: function() {
          marker.infoWindow.setContent(opts.content);
          //thisPolygon.infoWindow.setPosition(e.latLng);
          marker.infoWindow.open(this.gMap, marker);
        }
      });
    }
  }
  _createMarker(opts: any) {
    opts.map = this.gMap;
    return new google.maps.Marker(opts);
  }

  removeBy(callback) {
    var self = this;
    self.markers.find(callback, function(markers) {
      markers.forEach(function(marker) {
        if (self.markerClusterer) {
          self.markerClusterer.removeMarker(marker);
        } else {
          marker.setMap(null);
        }
        self.markers.remove(marker);
      });

    });
  }

  //generating random unique numbers
  _generateId() {
    // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      d += performance.now(); //use high-precision timer if available
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
    //https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  }
}
