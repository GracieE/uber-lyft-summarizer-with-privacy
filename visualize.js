$(document).ready(function() {
    //credit: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    function getParameterByName(name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    }

    // http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1); 
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    var cost = [0,0,0,0,0,0,0,0,0,0,0,0];
    var time = [0,0,0,0,0,0,0,0,0,0,0,0];
    var distance = [0,0,0,0,0,0,0,0,0,0,0,0];

    if (getParameterByName('lyft_token')) {
        $.ajax({
            type: "GET",
            url: "https://api.lyft.com/v1/rides?start_time=" +
            '2015-01-01T00:00:00Z' + '&end_time=' + '2016-01-01T00:00:00Z' + '&limit=10', // just 2015
            dataType: 'json',
            async: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Bearer " + getParameterByName('lyft_token'))
            },
            success: function (data) {
                data.ride_history.forEach(function(s,i) {
                    if (s.status == "droppedOff" && s.price.currency=="USD") {
                        req_at = moment(s.requested_at);
                        dropped_at = moment(s.dropoff.time);
                        cost[req_at.get('month')] += parseFloat(s.price.amount)/100;
                        time[req_at.get('month')] += parseFloat(moment.duration(dropped_at.diff(req_at)).asHours());
                        distance[req_at.get('month')] += getDistanceFromLatLonInKm(
                            s.origin.lat, s.origin.lng,
                            s.pickup.lat, s.pickup.lng) * 0.621371; //KM to miles
                    }
                });
            }
        });
    }

    // PUT D3 CODE HERE, use three arrays (cost, time, distance) above
});
