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
            <v-icon class="pl-2 text--secondary" v-bind="attrs" v-on="on">
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
        <a
          v-if="config.url"
          :href="config.url"
          target="_blank"
          title="See the documentation"
        >
          <v-icon class="pl-2">
            {{ mdiLinkVariant }}
          </v-icon>
        </a>
      </v-toolbar-title>
    </v-app-bar>
    <v-card-text>
      <div
        ref="container"
        style="height: 250px; position: relative"
        :hidden="noData"
      >
        <div
          v-if="tooltip.content"
          class="chart-tooltip"
          :style="`transform: translate(${tooltip.x}px, ${tooltip.y}px) translateX(${tooltipTranslateX}) translateY(-50%)`"
        >
          <div>
            <div>
              <b>
                {{ tooltip.content["time"] }}
              </b>
            </div>
            <div v-for="(metric, index) in metrics" :key="metric">
              <span
                :style="`display:inline-block;color:${colors[index]};`"
                class="mr-2"
                ><b>➖</b></span
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
                >{{ tooltip.content[metric] }}</span
              >
              <div style="clear: both"></div>
            </div>
          </div>
        </div>
        <div
          v-if="changesTooltip.event"
          class="chart-tooltip events"
          :style="`transform: translate(${changesTooltip.x}px, ${changesTooltip.y}px) translateX(-50%) translateY(-100%)`"
        >
          <b>{{ timeFormat(changesTooltip.event.date) }}</b>
          <br />
          <template
            v-if="
              changesTooltip.event.kind == 'global' ||
              changesTooltip.event.kind == 'rds'
            "
          >
            <v-icon small>{{ mdiInformation }}</v-icon>
            <b
              ><u>{{ changesTooltip.event.data.name }}</u></b
            >
            changed:<br />
            <b>
              <v-icon v-if="changesTooltip.event.data.prev_is_dropped" small>{{
                mdiCancel
              }}</v-icon>
              <span v-else>{{ changesTooltip.event.data.prev_val }}</span>
            </b>
            ➡
            <b>
              <v-icon v-if="changesTooltip.event.data.is_dropped" small>{{
                mdiCancel
              }}</v-icon>
              <span v-else>{{ changesTooltip.event.data.new_val }}</span>
            </b>
            <template v-if="changesTooltip.event.data.datname">
              <br />on database <b>{{ changesTooltip.event.data.datname }}</b>
            </template>
            <template
              v-if="
                changesTooltip.event.data.setrole &&
                changesTooltip.event.data.setrole != 0
              "
            >
              <br />for role <b>{{ changesTooltip.event.data.setrole }}</b>
            </template>
          </template>
          <template v-else-if="kind == 'reboot'">
            <v-icon small>{{ mdiAlert }}</v-icon>
            <b>Instance restarted!</b>
          </template>
          <template v-else>
            <v-icon small>{{ mdiAlert }}</v-icon>
            Unknown configChanges
            {{ kind }}:<br />
            {{ changesTooltip.event.data }}
          </template>
        </div>
      </div>
      <div v-if="!noData">
        <div
          v-for="(metric, index) in metrics"
          :key="metric"
          class="d-inline-block"
        >
          <span
            :style="`display:inline-block;color:${colors[index]};`"
            class="mr-2"
            ><b>➖</b></span
          >
          <span
            style="color: #666; font-weight: 400; margin-left: 2px"
            class="mr-4"
            >{{ getLabel(metric) }}</span
          >
        </div>
      </div>
      <div v-if="noData" class="text-center text--disabled">
        No data available
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import _ from "lodash";
import { mdiAlert, mdiCancel, mdiInformation, mdiLinkVariant } from "@mdi/js";
import store from "../store";
import * as d3 from "d3";
import { dateMath } from "@grafana/data";
import size from "../utils/size";
import { toISO } from "../utils/dates";
import { formatDuration } from "../utils/duration";

const props = defineProps({
  config: {
    type: Object,
    default() {
      return {};
    },
  },
});

const loading = ref(false);
const noData = ref(false);

const container = ref(null); // Container DOM Element

// List of metrics to show in the chart
// For example: 'avg_runtime', 'load', 'calls', 'planload'
const metrics = ref();

// SVG Element
let svg;

const margin = { top: 20, right: 60, bottom: 20, left: 60 };
let width;
let height;

// The scaleTime for the X axis
let xScale;

// y axes by type
// Each item of this object has a scale and metrics property
let yAxisByType = {};

// line series
let series = [];

// The SVG <g> in which we display the dots appearing on hover
let markers;
// The SVG <g> containing the config changes markers
let changes;

// The D3 brushX used for drag zoom
let brush;
// The SVG <g> used to show the brush
let gb;

// The metrics data
let data = {};
// The config changes data
let changesData = {};
// The source config for the given chart
let sourceConfig;
// Whether or not to use stack
let stacked = false;
// The stack generator if required
let stack;

const colors = ref(props.config.color_scheme || d3.schemeCategory10);

// The tooltip
const tooltip = ref({
  x: 0,
  y: 0,
  content: "",
});

// The tooltip for the config changes
const changesTooltip = ref({
  x: 0,
  y: 0,
  event: null,
});

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

// Unit to show on the Y axes
const unit = {
  size: "Bytes",
  sizerate: "Bytes per sec",
  duration: "duration in ms",
  percent: "%",
};

// Value formatters
const valueFormats = {
  size: new size.SizeFormatter().fromRaw,
  sizerate: new size.SizeFormatter({ suffix: "ps" }).fromRaw,
  duration: (value) => formatDuration(value, true),
  percent: (value) => Math.round(value * 100) / 100 + "%",
  number: d3.format(".2s"),
  integer: d3.format(".2s"),
};

// Time formatter
const timeFormat = d3.timeFormat("%Y-%m-%d %H:%M:%S");

onMounted(async () => {
  // Await for next tick in case we're in a tab item
  await nextTick();
  initChart();

  watch(
    () => store.dataSources,
    () => {
      loadData();
    },
    { immediate: true }
  );
  window.addEventListener("resize", resize);
});

onUnmounted(() => {
  window.removeEventListener("resize", resize);
});

function resize() {
  initChart();
  dataLoaded();
  changesLoaded();
}

function initChart() {
  width = container.value.offsetWidth - margin.left - margin.right;
  height = container.value.offsetHeight - margin.top - margin.bottom;

  // remove any previously existing chart (useful for resize)
  svg = d3.select(container.value).selectAll("svg").remove();

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

  stacked = props.config.stack;

  // Create the group for the changes
  changes = svg
    .append("g")
    .attr("class", "changes")
    .attr("transform", `translate(0, ${height})`)
    .on("pointerenter pointermove", eventspointermoved)
    .on("pointerleave", eventspointerleft);

  // Create the group to display the series
  const lines = svg
    .append("g")
    .attr("class", "lines")
    .on("pointerenter pointermove", pointermoved)
    .on("pointerleave", pointerleft);

  // Stack generator to be used when
  stack = d3
    .stack()
    .keys(metrics.value)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  // Create the group in which to show the circles on hover
  markers = svg.append("g").style("pointer-events", "none");

  // For each metric prepare the container for the line path
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
    if (_.keys(yAxisByType).length > 2) {
      throw "More than two yAxis is not supported";
    }

    if (!stacked) {
      series.push(
        d3
          .line()
          .x((d) => xScale(d.date))
          .y((d) => yAxisByType[type].scale(d[metric]))
      );
      lines.append("path").attr("class", "line line" + index);
    } else {
      series.push(
        d3
          .area()
          .x((d) => xScale(d.data.date))
          .y0(([y1]) => yAxisByType[type].scale(y1))
          .y1(([, y2]) => yAxisByType[type].scale(y2))
      );
      lines.append("path").attr("class", "area area" + index);
    }
    markers
      .append("circle")
      .attr("display", "none")
      .attr("fill", colors.value[index])
      .attr("stroke", "#555")
      .attr("stroke-width", "0.5px")
      .attr("r", 3);
    index++;
  });

  // Create the brush for the drag zoom
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

  // Prepare the 2 y axes
  svg.append("g").attr("class", "y axis0");
  svg
    .append("g")
    .attr("class", "y axis1")
    .attr("transform", `translate(${width}, 0)`);
}

function loadData() {
  loading.value = true;

  const promises = [sourceConfig.promise, store.changes];
  Promise.all(promises).then((response) => {
    data = JSON.parse(response[0]).data;
    dataLoaded();
    changesData = response[1].data;
    changesLoaded();
    loading.value = false;
  });
}

function dataLoaded() {
  if (_.isEmpty(data)) {
    noData.value = true;
    return;
  } else {
    noData.value = false;
  }
  const from = dateMath.parse(store.from);
  const to = dateMath.parse(store.to, true);

  xScale.domain([from, to]);
  // Parse time and convert it to JS Date
  data.forEach(function (d) {
    d.date = new Date(d.ts * 1000);
  });

  // Draw X Axis
  d3.select(container.value)
    .select(".x.axis")
    .transition(transitionDuration)
    .call(d3.axisBottom(xScale).ticks(5).tickFormat(multiFormat));

  // Compute the extent for the y axis
  _.each(yAxisByType, (axis) => {
    let max = 0;
    if (!stacked) {
      _.each(axis.metrics, (metric) => {
        max = Math.max(
          max,
          d3.max(data, (d) => d[metric])
        );
      });
    } else {
      const stackedData = stack(data);
      const extent = d3.extent(stackedData.flat(2));
      // We use toPrecision here to prevent max being 100.0000000001 in some cases
      max = extent[1].toPrecision(5);
    }
    max = max || 1; // Prevent empty domain
    axis.scale.domain([0, max]).nice();
  });

  // Then draw the Y axes
  let axisIndex = 0;
  _.each(yAxisByType, (axis, type) => {
    let axisGenerator = axisIndex == 0 ? d3.axisLeft : d3.axisRight;
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

  // Then draw the lines or areas
  let index = 0;
  _.each(series, (serie) => {
    if (!stacked) {
      svg
        .transition(transitionDuration)
        .select(".line.line" + index)
        .attr("stroke", colors.value[index])
        .attr("class", "line line" + index)
        .attr("d", serie(data));
    } else {
      const stackedData = stack(data);
      svg
        .transition(transitionDuration)
        .select(".area.area" + index)
        .attr("fill", colors.value[index])
        .attr("d", serie(stackedData[index]));
    }
    index++;
  });
}

function getLabel(metric) {
  return sourceConfig.metrics[metric].label;
}

function getDesc(metric) {
  return sourceConfig.metrics[metric].desc;
}

function pointermoved(event) {
  if (!data || _.isEmpty(data)) {
    return;
  }
  const X = d3.map(data, (d) => d.date);
  const [pointerX, pointerY] = d3.pointer(event);

  const i = d3.bisectCenter(X, xScale.invert(pointerX));

  const content = {
    time: timeFormat(X[i]),
  };
  const markersData = [];
  _.each(metrics.value, (metric, index) => {
    const Y = d3.map(data, (d) => {
      return d[metric];
    });
    const Y2 = stack(data)[index];
    const type = sourceConfig.metrics[metric].type || "number";
    content[metric] = valueFormats[type](Y[i]);
    markersData.push(yAxisByType[type].scale(stacked ? Y2[i][1] : Y[i]));
  });
  markers
    .selectAll("circle")
    .data(markersData)
    .attr("display", null)
    .attr("transform", (d) => `translate(${xScale(X[i])}, ${d})`);
  tooltip.value = {
    x: pointerX + margin.left,
    y: pointerY + margin.top,
    content: content,
  };
}

function pointerleft() {
  tooltip.value.content = null;
  markers.selectAll("circle").attr("display", "none");
}

function eventspointermoved(evt) {
  if (!changesData || _.isEmpty(changesData)) {
    return;
  }
  const X = d3.map(changesData, (d) => d.date);
  const [pointerX] = d3.pointer(evt);
  const i = d3.bisectCenter(X, xScale.invert(pointerX));
  changesTooltip.value.x = xScale(X[i]) + margin.left;
  changesTooltip.value.y = height + margin.bottom;
  changesTooltip.value.event = changesData[i];
}

function eventspointerleft() {
  changesTooltip.value.event = null;
}

function brushended({ selection }) {
  if (selection) {
    const from = toISO(xScale.invert(selection[0]));
    const to = toISO(xScale.invert(selection[1]));
    store.setFromTo(from, to);
    gb.call(brush);
    gb.call(brush.move, null);
  }
}

function changesLoaded() {
  changesData.forEach(function (d) {
    d.date = new Date(d.ts * 1000);
  });

  const events = changes.selectAll(".event").data(changesData);

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
  tooltip.value.x > width / 2 + margin.left ? "-120%" : "20%"
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
