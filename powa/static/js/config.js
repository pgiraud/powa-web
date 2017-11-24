require.config({
  baseUrl: "/static/js/",
  paths: {
    backbone: "../../../node_modules/@bower_components/backbone/backbone",
    d3: "../../../node_modules/@bower_components/d3/d3",
    foundation: "../../../node_modules/@bower_components/foundation/js/foundation",
    modernizr: "../../../node_modules/@bower_components/modernizr/modernizr",
    "foundation-daterangepicker": "../../../node_modules/@bower_components/foundation-daterangepicker/daterangepicker",
    jquery: "../../../node_modules/@bower_components/jquery/dist/jquery",
    moment: "../../../node_modules/@bower_components/moment/moment",
    requirejs: "../../../node_modules/@bower_components/requirejs/require",
    "requirejs-text": "../../../node_modules/@bower_components/requirejs-text/text",
    "requirejs-tpl": "../../../node_modules/@bower_components/requirejs-tpl/tpl",
    tpl: "../../../node_modules/@bower_components/requirejs-tpl/tpl",
    rickshaw: "../../../node_modules/@bower_components/rickshaw/rickshaw",
    highlight: "../libs/highlight/highlight",
    underscore: "../../../node_modules/@bower_components/underscore/underscore",
    backgrid: "../../../node_modules/@bower_components/backgrid/lib/backgrid",
    spin: "../../../node_modules/@bower_components/spin.js/spin",
    twix: "../../../node_modules/@bower_components/twix/bin/twix",
    "backgrid-filter": "../../../node_modules/@bower_components/backgrid-filter/backgrid-filter",
    "backgrid-paginator": "../../../node_modules/@bower_components/backgrid-paginator/backgrid-paginator",
    "backbone-pageable": "../../../node_modules/@bower_components/backbone-pageable/lib/backbone-pageable",
    "file-saver": "../../../node_modules/@bower_components/file-saver/FileSaver"
  },
  urlArgs: {
    date: {

    }
  },
  wrapShim: true,
  shim: {
    highlight: {
      exports: "hljs"
    },
    "foundation/foundation": {
      deps: [
        "jquery"
      ]
    },
    "foundation/foundation.tab": [
      "foundation/foundation"
    ],
    "foundation/foundation.topbar": [
      "foundation/foundation"
    ],
    "foundation/foundation.equalizer": [
      "foundation/foundation"
    ],
    "foundation/foundation.dropdown": [
      "foundation/foundation"
    ],
    "foundation/foundation.tooltip": [
      "foundation/foundation"
    ],
    "foundation/foundation.offcanvas": [
      "foundation/foundation"
    ],
    "foundation/foundation.alert": [
      "foundation/foundation"
    ],
    "foundation-daterangepicker": [
      "foundation/foundation"
    ],
    backgrid: {
      deps: [
        "jquery",
        "underscore",
        "backbone"
      ],
      exports: "Backgrid"
    },
    "backgrid-select-all": {
      deps: [
        "backgrid"
      ]
    },
    "backgrid-filter": {
      deps: [
        "backgrid"
      ]
    },
    "backgrid-paginator": {
      deps: [
        "backgrid"
      ]
    }
  },
  packages: [

  ]
});

require(["powa/main"]);
