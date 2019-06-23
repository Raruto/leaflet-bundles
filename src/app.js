    // var css = require('./app.css');

    import './app.css';

    import 'google-maps'; // async

    import * as JSZip from 'jszip';
    import * as toGeoJSON from '@tmcw/togeojson';
    import geojsonvt from 'geojson-vt';

    import 'leaflet-hash';
    import "@raruto/leaflet-gesture-handling";
    import "leaflet-control-layers-inline";
    import 'leaflet.gridLayer.googleMutant';
    import 'leaflet.locatecontrol';
    import 'leaflet.fullscreen';
    import 'leaflet-pegman';
    import 'leaflet-transparency';
    import 'leaflet-kmz';

    (function() {


      window.JSZip = JSZip;
      window.toGeoJSON = toGeoJSON;
      window.geojsonvt = geojsonvt;

      if (!window.google)
        GoogleMapsLoader.load(function(google) {
          window.google = google;
          initMap();
        });
      else
        initMap();

      function initMap() {

        var map, hash;
        var layers = {};
        var controls = {};

        map = new L.Map('map', {
          center: [41.4583, 12.7059],
          zoom: 5,
          zoomControl: false,
          gestureHandling: true,
        });

        hash = new L.Hash(map);

        layers.osm = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        });

        layers.otm = new L.TileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        });

        layers.google = {};

        layers.google.terrain = new L.GridLayer.GoogleMutant({
          type: 'terrain',
          maxZoom: 24,
        });

        layers.google.satellite = new L.GridLayer.GoogleMutant({
          type: 'satellite',
          maxZoom: 24,
        });

        var baseMaps = {
          "OSM": layers.osm,
          "Terrain": layers.google.terrain,
          "Satellite": layers.google.satellite,
          "Topo": layers.otm,
        };

        controls.baseLayers = new L.Control.Layers(baseMaps, null, {
          inline: true,
          position: 'topleft'
        });

        controls.layers = new L.Control.Layers(null, null, {
          collapsed: false,
          position: 'topright'
        });

        controls.zoom = new L.Control.Zoom({
          position: 'bottomright',
        });

        controls.pegman = new L.Control.Pegman({
          position: 'bottomright',
          theme: "leaflet-pegman-v3-small",
        });

        controls.locate = new L.Control.Locate({
          position: "bottomright"
        });

        controls.fullscreen = new L.Control.FullScreen({
          position: 'topright',
          title: 'Enter Fullscreen',
          titleCancel: 'Exit Fullscreen',
          forceSeparateButton: true,
        });

        controls.opacity = new L.Control.OpacitySlider(null, {
          sliderImageUrl: "https://unpkg.com/leaflet-transparency@0.0.3/images/opacity-slider2.png",
          backgroundColor: "rgba(229, 227, 223, 0.9)",
          position: 'topleft',
        });

        var leafletAttribution = map.attributionControl.options.prefix;
        map.on('baselayerchange', updateLeafletAttribution);

        for (var i in controls) {
          if (controls[i].addTo) {
            controls[i].addTo(map);
          }
        }

        layers.otm.addTo(map);

        // Instantiate KMZ parser (async)
        var kmzParser = new L.KMZParser({
          onKMZLoaded: function(layer, name) {
            controls.layers.addOverlay(layer, name);
            layer.addTo(map);
            layer.bringToFront();
            map.on('baselayerchange', function(e) {
              layer.bringToFront();
            });

            var layersOpacity = new L.Control.OpacitySlider(this.gridlayer, {
              sliderImageUrl: "https://unpkg.com/leaflet-transparency@0.0.3/images/opacity-slider2.png",
              backgroundColor: "rgba(229, 227, 223, 0.9)",
              position: 'topright',
            });
            layersOpacity.addFeatureLayer(this.layer);
            layersOpacity.addTo(map);
          },
          name: "ON / OFF"
        });
        kmzParser.load('regions.kmz');

        function updateLeafletAttribution(e) {
          map.attributionControl.setPrefix((e && e.layer && e.layer instanceof L.GridLayer.GoogleMutant) ? false : leafletAttribution);
        }

      }
    })();
