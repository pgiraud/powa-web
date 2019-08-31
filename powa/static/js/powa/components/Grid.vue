<template>
  <div>
    <h4>{{ config.title }}</h4>
    <div>
      <b-table
        striped
        hover
        :items="items"
      />
    </div>
  </div>
</template>

<script>

import Component from 'vue-class-component'
import Widget from './Widget.vue';
import store from '../store';
import * as moment from 'moment';

@Component()
class Grid extends Widget {
  items = null;

  mounted() {
    this.loadData();
  };

  loadData() {
    const metricGroup = _.uniq(_.map(this.config.metrics, (metric) => {
      return metric.split('.')[0];
    }));
    const sourceConfig = store.dataSources[metricGroup];
    const toDate = moment();
    const fromDate = toDate.clone().subtract(1, 'hour');
    const params = {
      from: fromDate.format("YYYY-MM-DD HH:mm:ssZZ"),
      to: toDate.format("YYYY-MM-DD HH:mm:ssZZ")
    };
    $.ajax({
      url: sourceConfig.data_url + '?' + $.param(params)
    }).done((response) => {
      this.dataLoaded(response.data);
    });
  }

  dataLoaded(data) {
    this.items = data;
  }

  getColumnDefinitions() {
    const metricGroup = _.uniq(_.map(this.config.metrics, (metric) => {
      return metric.split('.')[0];
    }));
    const metrics = _.map(this.config.metrics, (metric) => {
      return metric.split('.')[1];
    });
    const sourceConfig = store.dataSources[metricGroup];

    const columns = this.config.columns;
    _.each(metrics, function(metric) {
      columns.push($.extend({}, sourceConfig.metrics[metric], {
        //editable: false,
        //headerCell: DescHeaderCell,
        //cell: BaseCell.extend({
        //  cell: metric.get("type")
        //})
      }));
    });
    _.each(columns, function(c){
      if (c.cell === undefined) {
        /*
        c.cell = BaseCell.extend({
          cell: c.type
        });
        */
      }
      if (c.editable === undefined) {
        c.editable = false;
      }
    });
    console.log (columns);
    return columns;
  }
}

export default Grid
</script>
