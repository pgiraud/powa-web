import _ from "lodash";
import Vue from "vue";
import store from "./store";
import { components, createVuetify, icons } from "./plugins/vuetify.js";
import Dashboard from "./components/Dashboard.vue";
import DateRangePicker from "./components/DateRangePicker/DateRangePicker.vue";
import Graph from "./components/Graph.vue";
import Grid from "./components/Grid.vue";
import Tabcontainer from "./components/Tabcontainer.vue";
import Wizard from "./components/Wizard.vue";
import Content from "./components/Content.vue";
import BreadCrumbs from "./components/BreadCrumbs.vue";
import * as d3 from "d3";

//import "vuetify/src/styles/styles";
//import "bootstrap/dist/css/bootstrap.css";
//import "vuetify/dist/vuetify.min.css";

let breadCrumbItems;
document
  .querySelectorAll('script[type="text/breadcrumb"]')
  .forEach(function (el) {
    breadCrumbItems = JSON.parse(el.innerText);
  });

const app = new Vue({
  el: "#app",
  vuetify: createVuetify(),
  components: Object.assign(
    {
      Dashboard,
      DateRangePicker,
      BreadCrumbs,
    },
    components
  ),
  data: () => ({
    breadCrumbItems: breadCrumbItems,
    config: {},
    icons,
    store,
  }),
});

Vue.component("Dashboard", Dashboard);
Vue.component("DateRangePicker", DateRangePicker);
Vue.component("Graph", Graph);
Vue.component("Grid", Grid);
Vue.component("Tabcontainer", Tabcontainer);
Vue.component("Wizard", Wizard);
Vue.component("ContentCmp", Content);
Vue.component("BreadCrumbs", BreadCrumbs);

document
  .querySelectorAll('script[type="text/datasources"]')
  .forEach(function (el) {
    const dataSources = JSON.parse(el.innerText);
    _.each(dataSources, function (dataSource) {
      store.dataSources[dataSource.name] = dataSource;
      try {
        if (dataSource.type == "metric_group") {
          dataSource.metrics = _.keyBy(dataSource.metrics, "name");
        } else if (dataSource.type == "content") {
          // nothing to do
        }
      } catch (e) {
        console.error(
          "Could not instantiate metric group. Check the metric group definition"
        );
      }
    });
  });

document
  .querySelectorAll('script[type="text/dashboard"]')
  .forEach(function (el) {
    app.config = JSON.parse(el.innerText);
  });

document
  .querySelectorAll('script[type="text/messages"]')
  .forEach(function (el) {
    let categories = JSON.parse(el.innerText);
    _.forEach(categories, function (value, key) {
      // We make corresponding alert level between "error" in vuetify
      // and "alert" or "danger" in PoWa.
      if (key == "alert" || key == "danger") {
        key = "error";
      }
      for (let message of value) {
        store.addAlertMessage(key, message);
      }
    });
  });

document.getElementById("reload_collector").addEventListener("click", () => {
  d3.text("/reload_collector/").then(
    (response) => {
      if (response) {
        store.addAlertMessage("success", "Collector successfully reloaded!");
      } else {
        store.addAlertMessage("error", "Could not reload collector");
      }
    },
    () => {
      store.addAlertMessage(
        "error",
        "Error while trying to reload the collector."
      );
    }
  );
});

document
  .querySelectorAll('script[type="text/datasource_timeline"]')
  .forEach(function (el) {
    store.changes = JSON.parse(el.innerText);
  });
