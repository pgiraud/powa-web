import _ from 'lodash';

function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());

const colors = ["#c05020", "#30c020", "#6060c0"];
// const ds = DataSourceCollection.get_instance();
// const picker = new timeurls({$el: $('#daterangepicker')});
const dashboards = [];

$('script[type="text/datasources"]').each(function() {
  const metric_groups = JSON.parse($(this).text());
  $.each(metric_groups, function(){
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
