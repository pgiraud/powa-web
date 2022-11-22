<template>
  <v-card :loading="loading" outlined>
    <template #progress>
      <v-progress-linear
        height="2"
        indeterminate
        style="position: absolute; z-index: 1"
      ></v-progress-linear>
    </template>
    <v-app-bar flat height="40px;">
      <v-toolbar-title class="mx-auto">
        {{ config.title }}
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-icon class="pl-2" v-bind="attrs" v-on="on">
              {{ mdiInformation }}
            </v-icon>
          </template>
          <div>
            <dl>
              <div v-for="metric in metrics" :key="metric">
                <dt>
                  <b>{{ getLabel(metric) }}</b>
                </dt>
                <dd class="ml-4">{{ getDesc(metric) }}</dd>
              </div>
            </dl>
          </div>
        </v-tooltip>
      </v-toolbar-title>
    </v-app-bar>
    <v-card-text>
      <div ref="container" style="height: 250px; position: relative">
        <div
          v-if="tooltipContent"
          class="chart-tooltip"
          :style="`transform: translate(${tooltipX}px, ${tooltipY}px) translateX(${tooltipTranslateX}) translateY(-50%)`"
        >
          <div>
            <div>
              <b>
                {{ tooltipContent["time"] }}
              </b>
            </div>
            <div v-for="(metric, index) in metrics" :key="metric">
              <span :style="`display:inline-block;color:${colors[index]};`"
                >●</span
              >
              <span style="color: #666; font-weight: 400; margin-left: 2px">{{
                getLabel(metric)
              }}</span>
              <span
                style="
                  float: right;
                  margin-left: 20px;
                  color: #666;
                  font-weight: 900;
                "
                >{{ tooltipContent[metric] }}</span
              >
              <div style="clear: both"></div>
            </div>
          </div>
        </div>
        <div
          v-if="event"
          class="chart-tooltip events"
          :style="`transform: translate(${eventsTooltipX}px, ${eventsTooltipY}px) translateX(-50%) translateY(-100%)`"
        >
          <b>{{ timeFormat(event.date) }}</b>
          <br />
          <template v-if="event.kind == 'global' || event.kind == 'rds'">
            <v-icon small>{{ icons.mdiInformation }}</v-icon>
            <b
              ><u>{{ event.data.name }}</u></b
            >
            changed:<br />
            <b>
              <v-icon v-if="event.data.prev_is_dropped" small>{{
                icons.mdiCancel
              }}</v-icon>
              <span v-else>{{ event.data.prev_val }}</span>
            </b>
            ➡
            <b>
              <v-icon v-if="event.data.is_dropped" small>{{
                icons.mdiCancel
              }}</v-icon>
              <span v-else>{{ event.data.new_val }}</span>
            </b>
            <template v-if="event.data.datname">
              <br />on database <b>{{ event.data.datname }}</b>
            </template>
            <template v-if="event.data.setrole && event.data.setrole != 0">
              <br />for role <b>{{ event.data.setrole }}</b>
            </template>
          </template>
          <template v-else-if="kind == 'reboot'">
            <v-icon small>{{ icons.mdiAlert }}</v-icon>
            <b>Instance restarted!</b>
          </template>
          <template v-else>
            <v-icon small>{{ icons.mdiAlert }}</v-icon>
            Unknown configChanges
            {{ kind }}:<br />
            {{ event.data }}
          </template>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import _ from "lodash";
import * as d3 from "d3";
import { mdiInformation } from "@mdi/js";
import store from "../store";
import { dateMath } from "@grafana/data";
import size from "../utils/size";
import { icons } from "../plugins/vuetify";
import { formatDuration } from "../utils/duration";
import { encodeQueryData } from "../utils/query";

const props = defineProps({
  config: {
    type: Object,
    default() {
      return {};
    },
  },
});

const loading = ref(false);

const container = ref(null);

const metrics = ref();

let svg;

const margin = { top: 20, right: 60, bottom: 20, left: 60 };

let width;
let height;
let xScale;
// y scales
let yAxisByType = {};
// line series
let series = [];

let markers;
let changes;

let brush;
let gb;

let data = {};
let eventsData = {};
let sourceConfig;

const colors = ref(d3.schemeSet2);

const tooltipX = ref(0);
const tooltipY = ref(0);
const tooltipContent = ref("");

const eventsTooltipX = ref(0);
const eventsTooltipY = ref(0);
const event = ref(null);

const transitionDuration = 400;

const formatMillisecond = d3.timeFormat(".%L"),
  formatSecond = d3.timeFormat(":%S"),
  formatMinute = d3.timeFormat("%H:%M"),
  formatHour = d3.timeFormat("%H:00"),
  formatDay = d3.timeFormat("%a %d"),
  formatWeek = d3.timeFormat("%b %d"),
  formatMonth = d3.timeFormat("%B"),
  formatYear = d3.timeFormat("%Y");

function multiFormat(date) {
  return (
    d3.timeSecond(date) < date
      ? formatMillisecond
      : d3.timeMinute(date) < date
      ? formatSecond
      : d3.timeHour(date) < date
      ? formatMinute
      : d3.timeDay(date) < date
      ? formatHour
      : d3.timeMonth(date) < date
      ? d3.timeWeek(date) < date
        ? formatDay
        : formatWeek
      : d3.timeYear(date) < date
      ? formatMonth
      : formatYear
  )(date);
}

const unit = {
  size: "Bytes",
  sizerate: "Bytes per sec",
  duration: "duration in ms",
  percent: "%",
};

const valueFormats = {
  size: new size.SizeFormatter().fromRaw,
  sizerate: new size.SizeFormatter({ suffix: "ps" }).fromRaw,
  duration: (value) => formatDuration(value, true),
  percent: (value) => Math.round(value * 100) / 100 + "%",
  number: d3.format(".2s"),
  integer: d3.format(".2s"),
};

const timeFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S");

onMounted(() => {
  initChart();
});

function initChart() {
  width = container.value.offsetWidth - margin.left - margin.right;
  height = container.value.offsetHeight - margin.top - margin.bottom;

  svg = d3
    .select(container.value)
    .append("svg")
    .attr("class", "chart")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
    .style("-webkit-tap-highlight-color", "transparent")
    .style("overflow", "visible")
    .attr("transform", `translate(0, ${margin.top})`);

  const metricGroup = _.uniq(
    _.map(props.config.metrics, (metric) => {
      return metric.split(".")[0];
    })
  );
  metrics.value = _.map(props.config.metrics, (metric) => {
    return metric.split(".")[1];
  });
  sourceConfig = store.dataSources[metricGroup];

  changes = svg
    .append("g")
    .attr("class", "changes")
    .attr("transform", `translate(0, ${height})`)
    .on("pointerenter pointermove", eventspointermoved)
    .on("pointerleave", eventspointerleft);

  const lines = svg
    .append("g")
    .attr("class", "lines")
    .on("pointerenter pointermove", pointermoved)
    .on("pointerleave", pointerleft);
  markers = svg.append("g").style("pointer-events", "none");
  let index = 0;
  _.each(metrics.value, (metric) => {
    const type = sourceConfig.metrics[metric].type || "number";
    if (!_.has(yAxisByType, type)) {
      yAxisByType[type] = {
        metrics: [],
        scale: d3.scaleLinear().range([height, 0]),
      };
    }
    yAxisByType[type].metrics.push(metric);

    series.push(
      d3
        .line()
        .x((d) => xScale(d.date))
        .y((d) => yAxisByType[type].scale(d[metric]))
    );
    lines.append("path").attr("class", "line line" + index);
    markers
      .append("circle")
      .attr("display", "none")
      .attr("fill", colors.value[index])
      .attr("stroke", "#555")
      .attr("stroke-width", "0.5px")
      .attr("r", 3);
    index++;
  });
  brush = d3
    .brushX()
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("end", brushended);
  gb = lines.append("g").call(brush);

  // prepare axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
  xScale = d3.scaleTime().range([0, width]);

  svg.append("g").attr("class", "y axis0");
  svg
    .append("g")
    .attr("class", "y axis1")
    .attr("transform", `translate(${width}, 0)`);

  loadData();
}

function loadData() {
  loading.value = true;
  const metricGroup = _.uniq(
    _.map(props.config.metrics, (metric) => {
      return metric.split(".")[0];
    })
  );
  const sourceConfig = store.dataSources[metricGroup];

  const from = dateMath.parse(store.from);
  const to = dateMath.parse(store.to, true);
  const params = {
    from: from.format("YYYY-MM-DD HH:mm:ssZZ"),
    to: to.format("YYYY-MM-DD HH:mm:ssZZ"),
  };

  xScale.domain([from, to]);

  const promises = [
    d3.json(sourceConfig.data_url + "?" + encodeQueryData(params)),
    d3.json(store.changes + "?" + encodeQueryData(params)),
  ];
  Promise.all(promises).then((data) => {
    dataLoaded(data[0]);
    changesLoaded(data[1]);
    loading.value = false;
  });
}

function dataLoaded(response) {
  data = response.data;
  // parse time
  data.forEach(function (d) {
    d.date = new Date(d.ts * 1000);
  });

  // Adding X Axis
  d3.select(container.value)
    .select(".x.axis")
    .transition(transitionDuration)
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(multiFormat));

  // Compute the extent for the y axis
  _.each(yAxisByType, (axis) => {
    let max = 0;
    _.each(axis.metrics, (metric) => {
      max = Math.max(
        max,
        d3.max(data, (d) => d[metric])
      );
    });
    max = max || 1; // Prevent empty domain
    axis.scale.domain([0, max]).nice();
  });
  // Then add the Y axis
  let axisIndex = 0;
  _.each(yAxisByType, (axis, type) => {
    let axisGenerator = axisIndex == 0 ? d3.axisLeft : d3.axisRight;
    if (axisIndex > 1) {
      throw "More than two yAxis is not supported";
    }
    d3.select(container.value)
      .select(`.y.axis${axisIndex}`)
      .transition(transitionDuration)
      .call(axisGenerator(axis.scale).ticks(5, "s"));

    d3.select(container.value)
      .select(`.y.axis${axisIndex}`)
      .append("g")
      .attr("opacity", 1)
      .attr("class", "tick")
      .append("text")
      .attr("fill", "currentColor")
      .attr("transform", "rotate(-90)")
      .attr("y", axisIndex == 0 ? 6 : 0)
      .attr("dy", axisIndex == 0 ? "0.71em" : "-0.71em")
      .style("text-anchor", "end")
      .text(unit[type])
      .clone(true)
      .lower()
      .attr("aria-hidden", "true")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");

    axisIndex++;
  });

  let index = 0;
  _.each(series, (serie) => {
    svg
      .transition(transitionDuration)
      .select(".line.line" + index)
      .attr("stroke", colors.value[index])
      .attr("class", "line line" + index)
      .attr("d", serie(data));
    index++;
  });
}

function getLabel(metric) {
  const metricGroup = _.uniq(
    _.map(props.config.metrics, (metric) => {
      return metric.split(".")[0];
    })
  );
  const sourceConfig = store.dataSources[metricGroup];
  return sourceConfig.metrics[metric].label;
}

function getDesc(metric) {
  const metricGroup = _.uniq(
    _.map(props.config.metrics, (metric) => {
      return metric.split(".")[0];
    })
  );
  const sourceConfig = store.dataSources[metricGroup];
  return sourceConfig.metrics[metric].desc;
}

function pointermoved(event) {
  const X = d3.map(data, (d) => d.date);
  const [pointerX, pointerY] = d3.pointer(event);

  const i = d3.bisectCenter(X, xScale.invert(pointerX));
  tooltipX.value = pointerX + margin.left;
  tooltipY.value = pointerY + margin.top;

  const content = {
    time: timeFormat(X[i]),
  };
  const markersData = [];
  _.each(metrics.value, (metric) => {
    const Y = d3.map(data, (d) => d[metric]);
    const type = sourceConfig.metrics[metric].type || "number";
    content[metric] = valueFormats[type](Y[i]);
    markersData.push(yAxisByType[type].scale(Y[i]));
  });
  markers
    .selectAll("circle")
    .data(markersData)
    .attr("display", null)
    .attr("transform", (d) => `translate(${xScale(X[i])}, ${d})`);
  tooltipContent.value = content;
}

function pointerleft() {
  tooltipContent.value = null;
  markers.selectAll("circle").attr("display", "none");
}

function eventspointermoved(evt) {
  const X = d3.map(eventsData, (d) => d.date);
  const [pointerX] = d3.pointer(evt);
  const i = d3.bisectCenter(X, xScale.invert(pointerX));
  eventsTooltipX.value = xScale(X[i]) + margin.left;
  eventsTooltipY.value = height + margin.bottom;
  event.value = eventsData[i];
}

function eventspointerleft() {
  event.value = null;
}

function brushended({ selection }) {
  if (selection) {
    const from = timeFormat(xScale.invert(selection[0]));
    const to = timeFormat(xScale.invert(selection[1]));
    store.setFromTo(from, to);
    gb.call(brush);
    gb.call(brush.move, null);
  }
}

function changesLoaded(response) {
  eventsData = response.data;
  eventsData.forEach(function (d) {
    d.date = new Date(d.ts * 1000);
  });

  const events = changes.selectAll(".event").data(eventsData);

  events
    .enter()
    .append("polygon")
    .merge(events)
    .attr("class", "event")
    .attr("points", "5,0 0,10 10,10")
    .attr("fill", "red")
    .attr("stroke", "#555")
    .attr("stroke-width", "0.5px")
    .attr("r", 3)
    .attr("transform", (d) => `translate(${xScale(d.date)}, 0) scale(0.7)`);
  events.exit().remove();
}

const tooltipTranslateX = computed(() =>
  tooltipX.value > width / 2 + margin.left ? "-120%" : "20%"
);

watch(
  () => store.from + store.to,
  () => {
    loadData();
  }
);
</script>
<style lang="scss">
svg.chart {
  display: block;
  margin: auto;
}
.line {
  fill: none;
  stroke-width: 1.5px;
}

.horizontalGrid {
  fill: none;
  shape-rendering: crispEdges;
  stroke: lightgrey;
  stroke-width: 1px;
}

.chart-tooltip {
  position: absolute;
  top: -10px;
  background-color: rgb(255, 255, 255);
  padding: 0.3rem 0.5rem;
  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0.3) 0px 0px 3px 0px;
  pointer-events: none;
  z-index: 100;
  &.events {
    box-shadow: rgba(255, 0, 0, 1) 0px 0px 3px 0px;
  }
}
</style>
