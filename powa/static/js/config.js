require.config({
  baseUrl: "/static/js/",
  paths: {
    backbone: "../bower_components/backbone/backbone",
    d3: "../bower_components/d3/d3",
    jquery: "../bower_components/jquery/dist/jquery",
    moment: "../bower_components/moment/moment",
    requirejs: "../bower_components/requirejs/require",
    "requirejs-text": "../bower_components/requirejs-text/text",
    "requirejs-tpl": "../bower_components/requirejs-tpl/tpl",
    tpl: "../bower_components/requirejs-tpl/tpl",
    rickshaw: "../bower_components/rickshaw/rickshaw",
    highlight: "../libs/highlight/highlight",
    underscore: "../bower_components/underscore/underscore",
    backgrid: "../bower_components/backgrid/lib/backgrid",
    spin: "../bower_components/spin.js/spin",
    twix: "../bower_components/twix/bin/twix",
    "backgrid-filter": "../bower_components/backgrid-filter/backgrid-filter",
    "backgrid-paginator": "../bower_components/backgrid-paginator/backgrid-paginator",
    "backbone-pageable": "../bower_components/backbone-pageable/lib/backbone-pageable",
    "file-saver": "../bower_components/file-saver/FileSaver",
    "bootstrap-daterangepicker": "../bower_components/bootstrap-daterangepicker/daterangepicker",
    "bootstrap-sass": "../bower_components/bootstrap-sass/assets/javascripts/bootstrap"
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
