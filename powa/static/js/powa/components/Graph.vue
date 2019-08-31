<template>
  <div>
    <h4 class="title graph-title">
      {{ config.title }}
      <i class="fi-info" />
    </h4>
    <div class="row graph">
      <div
        ref="leftAxis"
        class="columns large-1 small-1"
      />
      <div class="columns large-10 small-10">
        <div class="row">
          <div ref="graphContainer" />
        </div>
        <div class="graph_timeline" />
        <div class="row">
          <div class="graph_preview" />
        </div>
      </div>
      <div
        ref="rightAxis"
        class="columns large-1 small-1"
      />
    </div>
    <div class="row">
      <div class="graph_legend" />
    </div>
  </div>
</template>

<script>

import Component from 'vue-class-component'
import MetricWidget from './MetricWidget.vue';
import Rickshaw from 'rickshaw';
import size from '../utils2/size';
import store from '../store';
import moment from 'moment';
import '../utils2/precisediff';

@Component()
class Graph extends MetricWidget {
  axisFormats = {
    "number": Rickshaw.Fixtures.Number.formatKMBT,
    "size": new size.SizeFormatter().fromRaw,
    "sizerate": function(value){ return new size.SizeFormatter({suffix: "ps"}).fromRaw(value)},
    "duration": function(data){
      return moment(parseFloat(data, 10)).preciseDiff(moment(0))
    },
    "percent": function(value){ return Math.round(value * 100) / 100 + '%'}
  }

  dataLoaded(series) {
    const size = $(this.$refs.graphContainer).parent().innerWidth();
    const attributes = this.config;
    const options = $.extend(
      size,
      attributes,
      {
        element: this.$refs.graphContainer,
        xScale: d3.time.scale(),
        renderer: "line",
        series: series || [],
        interpolation: 'linear'
      }
    );
    this.graph = new Rickshaw.Graph(options);
    this.xAxis = new Rickshaw.Graph.Axis.Time({
        graph: this.graph,
        timeFixture: new Rickshaw.Fixtures.Time.Local()
    });
    this.graph.render();
    this.yAxes = {};
    this.initAxes(series);
  }

  initAxes(series) {
    let i = 0;
    const metricGroup = _.uniq(_.map(this.config.metrics, (metric) => {
      return metric.split('.')[0];
    }));
    const metrics = _.map(this.config.metrics, (metric) => {
      return metric.split('.')[1];
    });
    const sourceConfig = store.dataSources[metricGroup];
    _.each(metrics, (metric, index) => {
      var type = sourceConfig.metrics[metric].type || "number";
      if (this.yAxes[type] == undefined) {
        var formatter = this.axisFormats[type];
        var orientation = i % 2 == 0 ? "left" : "right";
        this.yAxes[type] = new Rickshaw.Graph.Axis.Y.Scaled({
            element: this.$refs[orientation + "Axis"],
            graph: this.graph,
            min: 0,
            scale: d3.scale.linear(),
            orientation: orientation,
            tickFormat: formatter
        });
        i++;
        this.yAxes[type].render();
      }
    });
  }
}
export default Graph
</script>
