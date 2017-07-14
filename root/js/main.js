/* 
 * Copyright (c) 2016 Bruce Schubert.
 * The MIT License
 * http://www.opensource.org/licenses/mit-license
 */

/*global require, requirejs, WorldWind */

/**
 * Require.js bootstrapping javascript
 */
requirejs.config({
// Path mappings for the logical module names
    paths: {
        'knockout': 'libs/knockout/knockout-3.4.0.debug',
        'jquery': 'libs/jquery/jquery-2.1.3',
        'jqueryui': 'libs/jquery-ui/jquery-ui-1.11.4',
        'jquery-growl': 'libs/jquery-plugins/jquery.growl',
        'bootstrap': 'libs/bootstrap/v3.3.6/bootstrap',
        'moment': 'libs/moment/moment-2.14.1',
        'd3': 'libs/d3/d3',
        'split': 'libs/split/split',
        'worldwind': 'libs/webworldwind/worldwind',
        'model': 'model' // root application path
    },urlArgs: "v=" +  (new Date()).getTime(),
	waitSeconds: 200,
    // Shim configuration for Bootstrap's JQuery dependency
    shim: {
        "bootstrap": {
            deps: ["jquery"],
            exports: "$.fn.popover"
        }
    }
});

/**
 * A top-level require call executed by the Application.
 */
require(['knockout', 'jquery', 'bootstrap', 'split', 'worldwind',
        'model/Config',
        'model/Constants',
        'model/Explorer',
        'model/globe/Globe',
        'views/GlobeViewModel',
        'views/HeaderViewModel',
        'views/HomeViewModel',
        'views/LayersViewModel',
        'views/MarkerEditor',
        'views/MarkersViewModel',
        'views/OutputViewModel',
        'views/ProjectionsViewModel',
        'views/SearchViewModel',
		'views/ViewsViewModel',
        'model/globe/layers/UsgsContoursLayer',
        'model/globe/layers/UsgsImageryTopoBaseMapLayer',
        'model/globe/layers/UsgsTopoBaseMapLayer' ],
    function (ko, $, bootstrap, split, ww,
              config,
              constants,
              explorer,
              Globe,
              GlobeViewModel,
              HeaderViewModel,
              HomeViewModel,
              LayersViewModel,
              MarkerEditor,
              MarkersViewModel,
              OuputViewModel,
              ProjectionsViewModel,
              SearchViewModel,
			  ViewsViewModel,
              UsgsContoursLayer,
              UsgsImageryTopoBaseMapLayer,
              UsgsTopoBaseMapLayer) { // this callback gets executed when all required modules are loaded
        "use strict";
        // ----------------
        // Setup the globe
        // ----------------
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);
        WorldWind.configuration.baseUrl = ww.WWUtil.currentUrlSansFilePart() + "/" + constants.WORLD_WIND_PATH;

        // Define the configuration for the primary globe
        var globeOptions = {
                mouseClick:true,
                showBackground: true,
                showReticule: true,
                showViewControls: true,
                includePanControls: config.showPanControl,
                includeRotateControls: true,
                includeTiltControls: true,
                includeZoomControls: true,
                includeExaggerationControls: config.showExaggerationControl,
                includeFieldOfViewControls: config.showFieldOfViewControl
            },
            globe;

        // Create the explorer's primary globe that's associated with the specified HTML5 canvas
        globe = new Globe(new WorldWind.WorldWindow("canvasOne"), globeOptions);

        // Define the Globe's layers and layer options
        globe.layerManager.addBaseLayer(new WorldWind.BMNGLayer(), {enabled: true, hideInMenu: true, detailHint: config.imageryDetailHint});
        globe.layerManager.addBaseLayer(new WorldWind.BMNGLandsatLayer(), {enabled: false, detailHint: config.imageryDetailHint});
        globe.layerManager.addBaseLayer(new WorldWind.BingAerialWithLabelsLayer(null), {enabled: true, detailHint: config.imageryDetailHint});
        globe.layerManager.addBaseLayer(new UsgsImageryTopoBaseMapLayer(), {enabled: false, detailHint: config.imageryDetailHint});
        globe.layerManager.addBaseLayer(new UsgsTopoBaseMapLayer(), {enabled: false, detailHint: config.imageryDetailHint});
        globe.layerManager.addBaseLayer(new WorldWind.BingRoadsLayer(null), {enabled: false, opacity: 0.7, detailHint: config.imageryDetailHint});
        //globe.layerManager.addBaseLayer(new WorldWind.OpenStreetMapImageLayer(null), {enabled: false, opacity: 0.7, detailHint: config.imageryDetailHint});

        globe.layerManager.addBaseLayer(new UsgsContoursLayer(), {enabled: false});

        globe.layerManager.addDataLayer(new WorldWind.RenderableLayer(constants.LAYER_NAME_MARKERS), {enabled: true, pickEnabled: true});

        // Initialize the Explorer object with a Globe to "explore"
        explorer.initialize(globe);

        // --------------------------------------------------------
        // Bind view models to the corresponding HTML elements
        // --------------------------------------------------------
        ko.applyBindings(new HeaderViewModel(), document.getElementById('header'));
        ko.applyBindings(new GlobeViewModel(globe, explorer.markerManager), document.getElementById('globe'));
        ko.applyBindings(new ProjectionsViewModel(globe), document.getElementById('projections'));
        ko.applyBindings(new SearchViewModel(globe), document.getElementById('search'));
        ko.applyBindings(new HomeViewModel(globe), document.getElementById('home'));
        ko.applyBindings(new LayersViewModel(globe), document.getElementById('layers'));
		ko.applyBindings(new LayersViewModel(globe), document.getElementById('layer-template'));
		ko.applyBindings(new ViewsViewModel(globe), document.getElementById('views'));
        ko.applyBindings(new MarkersViewModel(globe, explorer.markerManager), document.getElementById('markers'));
        /*ko.applyBindings(new OuputViewModel(globe), document.getElementById('output'));*/
        ko.applyBindings(new MarkerEditor(), document.getElementById('marker-editor'));
        // -----------------------------------------------------------
        // Add handlers to auto-expand/collapse the menus
        // -----------------------------------------------------------
        // Auto-expand menu section-bodies when not small
        $(window).resize(function () {
            if ($(window).width() >= 768) {
                $('.section-body').collapse('show');
            }
        });
		
        //var wwd = new WorldWind.WorldWindow("canvasOne");
        // wwd.addEventListener("mousemove", function (event) {...});

        // var clickRecognizer = new WorldWind.ClickRecognizer(globe, 
        //     function(recognizer) {
        //         alert("MOHAN ...:'");
        // });
        // var handleClick = function (recognizer) {
        //     // Obtain the event location.
        //     // var x = recognizer.clientX,
        //     //     y = recognizer.clientY;

        //     // // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
        //     // // relative to the upper left corner of the canvas rather than the upper left corner of the page.
        //     // var pickList = wwd.pick(wwd.canvasCoordinates(x, y));

        //     // // If only one thing is picked and it is the terrain, tell the world window to go to the picked location.
        //     // if (pickList.objects.length == 1 && pickList.objects[0].isTerrain) {
        //     //     var position = pickList.objects[0].position;
        //     //     wwd.goTo(new WorldWind.Location(position.latitude, position.longitude));
        //     // }
        //     alert("111111");
        // };

        // Listen for mouse clicks.
       // var clickRecognizer = new WorldWind.ClickRecognizer(globe, handleClick);

        // $('#canvasOne').click(function () {
        //     alert("1111");
        // });
		
        // Auto-collapse navbar when its tab items are clicked
        $('.navbar-collapse a[role="tab"]').click(function () {
            $('.navbar-collapse').collapse('hide');
        });
        // Auto-scroll-into-view expanded dropdown menus
        $('.dropdown').on('shown.bs.dropdown', function (event) {
            event.target.scrollIntoView(false); // align to bottom
        });

        // ------------------------------------------------------------
        // Add handlers to save/restore the session
        // -----------------------------------------------------------
        // Add event handler to save the current view (eye position) and markers when the window closes
        window.onbeforeunload = function () {
            explorer.saveSession();
            // Return null to close quietly on Chrome and FireFox.
            return null;
        };

        // Now that MVC is set up, restore the model from the previous session.
        explorer.restoreSession();
    }
);