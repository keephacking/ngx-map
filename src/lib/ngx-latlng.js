
// Taken from https://raw.githubusercontent.com/chrisveness/geodesy/master/latlon-spherical.js	
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Latitude/longitude spherical geodesy tools                         (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong.html                                                    */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-spherical.html                       */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
'use strict';
if (typeof module!='undefined' && module.exports) var Dms = require('./dms'); // ≡ import Dms from 'dms.js'
/**
 * Library of geodesy functions for operations on a spherical earth model.
 *
 * @module   latlon-spherical
 * @requires dms
 */
/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon) {
// allow instantiation without 'new'
if (!(this instanceof LatLon)) return new LatLon(lat, lon);
this.lat = Number(lat);
this.lon = Number(lon);
}

/**
 * Returns the destination point having travelled along a rhumb line from ‘this’ point the given
 * distance on the  given bearing.
 *
 * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 * @param   {number} bearing - Bearing in degrees from north.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = p1.rhumbDestinationPoint(40300, 116.7); // 50.9642°N, 001.8530°E
 */
LatLon.prototype.rhumbDestinationPoint = function(distance, bearing, radius) {
radius = (radius === undefined) ? 6371e3 : Number(radius);
var δ = Number(distance) / radius; // angular distance in radians
var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
var θ = Number(bearing).toRadians();
var Δφ = δ * Math.cos(θ);
var φ2 = φ1 + Δφ;
// check for some daft bugger going past the pole, normalise latitude if so
if (Math.abs(φ2) > Math.PI/2) φ2 = φ2>0 ? Math.PI-φ2 : -Math.PI-φ2;
var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
var q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1); // E-W course becomes ill-conditioned with 0/0
var Δλ = δ*Math.sin(θ)/q;
var λ2 = λ1 + Δλ;
return new LatLon(φ2.toDegrees(), (λ2.toDegrees()+540) % 360 - 180); // normalise to −180..+180°
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/**
 * Checks if another point is equal to ‘this’ point.
 *
 * @param   {LatLon} point - Point to be compared against this point.
 * @returns {bool}   True if points are identical.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(52.205, 0.119);
 *   var equal = p1.equals(p2); // true
 */
LatLon.prototype.equals = function(point) {
if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
if (this.lat != point.lat) return false;
if (this.lon != point.lon) return false;
return true;
};
/**
 * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
};
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}
/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon; // ≡ export default LatLon    