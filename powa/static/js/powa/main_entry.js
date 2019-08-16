import _ from 'lodash';
import Vue from 'vue';
import Dashboard from './components/Dashboard.vue';
import './components';

var app = new Vue ({
  el: '#dashboard',
  components: {
    Dashboard
  },
  data () {
    return {
      config: {}
    }
  }
});

const colors = ["#c05020", "#30c020", "#6060c0"];
// const ds = DataSourceCollection.get_instance();
// const picker = new timeurls({$el: $('#daterangepicker')});
const dashboards = [];

$('script[type="text/datasources"]').each(function() {
  const metricGroups = JSON.parse(this.text);
  $.each(metricGroups, function(){
    try {
      if (this.type == "metric_group") {
        //ds.add(MetricGroup.fromJSON(this));
      } else if (this.type == "content") {
        //ds.add(ContentSource.fromJSON(this));
      }
    }
    catch(e) {
      console.error("Could not instantiate metric group. Check the metric group definition");
    }
  });
});

$('script[type="text/dashboard"]').each(function(){
  app.config = JSON.parse(this.text);
  console.log (app.config);
  //const widgetsEl = $('.widgets');

  //_.each(config.widgets, (w) => {
    //const widget = w[0];
    //console.log (widget.type);
    //app.widgets.push(widget);
  //});
  //var dashboard = Widget.fromJSON(JSON.parse(this.text));
  //var dashboardview = dashboard.makeView({el: $(self).find('.widgets')});
  //dashboards.push(dashboard);
  //dashboardview.listenTo(picker, "pickerChanged", dashboardview.refreshSources, dashboardview);
  //dashboardview.refreshSources(picker.start_date, picker.end_date);
  //picker.listenTo(dashboardview, "dashboard:updatePeriod", picker.updateUrls, picker);
});
