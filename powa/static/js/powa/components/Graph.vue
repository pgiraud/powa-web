<template>
  <div>
    <h4 class="title graph-title">
      {{ config.title }}
      <i class="fi-info" />
    </h4>
    <div class="row graph">
      <div class="graph_left_axis columns large-1 small-1" />
      <div class="columns large-10 small-10">
        <div class="row">
          <div ref="graphContainer" />
        </div>
        <div class="graph_timeline" />
        <div class="row">
          <div class="graph_preview" />
        </div>
      </div>
      <div class="graph_right_axis columns large-1 small-1" />
    </div>
    <div class="row">
      <div class="graph_legend" />
    </div>
  </div>
</template>

<script>

import MetricWidget from './MetricWidget.vue';
import Rickshaw from 'rickshaw';

class Graph extends MetricWidget {
  dataLoaded(series) {
    console.log (series);
    const size = $(this.$refs.graphContainer).parent().innerWidth();
    // console.log (this.config);
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
    this.x_axis = new Rickshaw.Graph.Axis.Time({
        graph: this.graph,
        timeFixture: new Rickshaw.Fixtures.Time.Local()
    });
  }
}
export default Graph
</script>
