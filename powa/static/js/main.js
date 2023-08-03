import _ from "lodash";
import Vue from "vue";
import store from "@/store";
import vuetify from "@/plugins/vuetify";
import App from "@/App.vue";

import AllCollectorsDetail from "@/components/config/AllCollectorsDetail.vue";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import Dashboard from "@/components/Dashboard.vue";
import DateRangePicker from "@/components/DateRangePicker/DateRangePicker.vue";
import DistributionGrid from "@/components/DistributionGrid.vue";
import FunctionDetail from "@/components/database/FunctionDetail.vue";
import Graph from "@/components/Graph.vue";
import Grid from "@/components/Grid.vue";
import GridCell from "@/components/GridCell.vue";
import LoginView from "@/components/LoginView.vue";
import QualDetail from "@/components/database/query/QualDetail.vue";
import QueryDetail from "@/components/database/query/QueryDetail.vue";
import QueryExplains from "@/components/database/query/QueryExplains.vue";
import QueryIndexes from "@/components/database/query/QueryIndexes.vue";
import QueryTooltip from "@/components/QueryTooltip.vue";
import ServersErrors from "@/components/config/ServersErrors.vue";
import Tabcontainer from "@/components/Tabcontainer.vue";
import Wizard from "@/components/Wizard.vue";
import WizardThisDatabase from "@/components/database/WizardThisDatabase.vue";

Vue.component("AllCollectorsDetail", AllCollectorsDetail);
Vue.component("BreadCrumbs", BreadCrumbs);
Vue.component("Dashboard", Dashboard);
Vue.component("DateRangePicker", DateRangePicker);
Vue.component("DistributionGrid", DistributionGrid);
Vue.component("FunctionDetail", FunctionDetail);
Vue.component("Graph", Graph);
Vue.component("Grid", Grid);
Vue.component("GridCell", GridCell);
Vue.component("LoginView", LoginView);
Vue.component("QualDetail", QualDetail);
Vue.component("QueryDetail", QueryDetail);
Vue.component("QueryExplains", QueryExplains);
Vue.component("QueryIndexes", QueryIndexes);
Vue.component("QueryTooltip", QueryTooltip);
Vue.component("ServersErrors", ServersErrors);
Vue.component("Tabcontainer", Tabcontainer);
Vue.component("Wizard", Wizard);
Vue.component("WizardThisDatabase", WizardThisDatabase);

import VSnackbars from "v-snackbars";
Vue.component("VSnackbars", VSnackbars);

document
  .querySelectorAll('script[type="text/datasources"]')
  .forEach(function (el) {
    const dataSources = JSON.parse(el.innerText);
    _.each(dataSources, function (dataSource) {
      try {
        if (dataSource.type == "metric_group") {
          dataSource.metrics = _.keyBy(dataSource.metrics, "name");
        }
      } catch (e) {
        console.error(
          "Could not instantiate metric group. Check the metric group definition"
        );
      }
      store.dataSources[dataSource.name] = dataSource;
    });
  });

document
  .querySelectorAll('script[type="text/messages"]')
  .forEach(function (el) {
    const messages = JSON.parse(el.innerText);
    store.addAlertMessages(messages);
  });

document
  .querySelectorAll('script[type="text/datasource_timeline"]')
  .forEach(function (el) {
    store.changesUrl = JSON.parse(el.innerText);
  });
store.loadData();

new Vue({
  render: (h) => h(App),
  vuetify,
}).$mount("#app");
