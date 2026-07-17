const key = mapToken;
const map = new maplibregl.Map({
    container: 'map', // container id
    style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${key}`, // style URL
    center: listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 12 // starting zoom
});

const marker = new maptilersdk.Marker({color: "red"})
.setLngLat(listing.geometry.coordinates)
.setPopup(new maptilersdk.Popup({ offset: 25})
.setHTML(`<h4>${listing.location}</h4><p>Exact location will be provided after booking!</p>`))
.addTo(map);
