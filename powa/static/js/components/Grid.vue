<template>
  <v-card :loading="loading">
    <template #progress>
      <v-progress-linear
        height="2"
        indeterminate
        style="position: absolute; z-index: 1"
      ></v-progress-linear>
    </template>
    <v-app-bar flat height="40px;">
      <v-toolbar-title>
        <v-card-title class="pl-0">
          {{ config.title }}
          <a v-if="config.url" :href="config.url" target="_blank">
            <v-icon class="pl-2">
              {{ mdiLinkVariant }}
            </v-icon>
          </a>
        </v-card-title>
      </v-toolbar-title>
    </v-app-bar>
    <v-card-text class="pb-0">
      <v-row>
        <v-col cols="12" sm="6" md="4" xl="2">
          <v-text-field
            v-model="search"
            label="Search"
            :append-icon="mdiMagnify"
            single-line
            hide-details
            class="pt-0 mt-0"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-data-table
        :headers="headers"
        :items="items"
        :footer-props="{
          'items-per-page-options': [25, 50, -1],
        }"
        :items-per-page="25"
        :search="search"
        :dense="true"
        class="superdense"
        @click:row="onRowClicked"
      >
        <!-- This template looks for headers with formatters and executes them -->
        <template
          v-for="header in headers.filter((header) =>
            header.hasOwnProperty('formatter')
          )"
          #[`item.${header.value}`]="{ value }"
        >
          <pre
            v-if="header.type == 'query'"
            :key="header.value"
            v-html="header.formatter(value)"
          />
          <template v-else>
            {{ header.formatter(value) }}
          </template>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import store from "../store";
import { serialize } from "../store";
import { dateMath } from "@grafana/data";
import _ from "lodash";
import size from "../utils/size";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import pgsql from "highlight.js/lib/languages/pgsql";
import { mdiMagnify, mdiLinkVariant } from "@mdi/js";
import { formatDuration } from "../utils/duration";
import { encodeQueryData } from "../utils/query";
import * as d3 from "d3";

hljs.registerLanguage("pgsql", pgsql);

const props = defineProps({
  config: {
    type: Object,
    default() {
      return {};
    },
  },
});

const loading = ref(false);
const search = ref("");
const items = ref([]);

onMounted(() => {
  loadData();
});

const fields = computed(() => {
  const metricGroup = _.uniq(
    _.map(props.config.metrics, (metric) => {
      return metric.split(".")[0];
    })
  );
  const metrics = _.map(props.config.metrics, (metric) => {
    return metric.split(".")[1];
  });
  const sourceConfig = store.dataSources[metricGroup];

  const columns = props.config.columns;
  _.each(metrics, function (metric) {
    columns.push(Object.assign({}, sourceConfig.metrics[metric]));
  });
  _.each(columns, (c) => {
    Object.assign(c, {
      key: c.name,
      label: c.label,
    });
  });
  return columns;
});

const headers = computed(() => {
  return _.uniqBy(
    _.map(fields.value, function headerize(n) {
      return {
        text: n.label,
        value: n.key,
        class: n.type,
        cellClass: n.type + " clickable",
        formatter: getFormatter(n.type),
        type: n.type,
        align: getAlign(n.type),
      };
    }),
    "value"
  );
});

function loadData() {
  loading.value = true;
  const metricGroup = _.uniq(
    _.map(props.config.metrics, (metric) => {
      return metric.split(".")[0];
    })
  );
  const sourceConfig = store.dataSources[metricGroup];
  const params = {
    from: dateMath.parse(store.from).format("YYYY-MM-DD HH:mm:ssZZ"),
    to: dateMath.parse(store.to, true).format("YYYY-MM-DD HH:mm:ssZZ"),
  };
  d3.json(sourceConfig.data_url + "?" + encodeQueryData(params)).then(
    (response) => {
      dataLoaded(response.data);
      loading.value = false;
    }
  );
}

function dataLoaded(data) {
  items.value = data;
}

function formatBool(value) {
  return value ? "✓" : "✗";
}

function formatSize(value) {
  return new size.SizeFormatter().fromRaw(value);
}

function formatQuery(value) {
  return hljs.highlightAuto(value, ["pgsql"]).value;
}

function getFormatter(type) {
  switch (type) {
    case "bool":
      return formatBool;
    case "duration":
      return (value) => formatDuration(value, true);
    case "percent":
      return (value) => value + "%";
    case "query":
      return formatQuery;
    case "size":
      return formatSize;
    default:
      return (value) => value;
  }
}

function getAlign(type) {
  switch (type) {
    case "bool":
      return "center";
    case "duration":
    case "percent":
    case "size":
    case "integer":
      return "right";
  }
}

function onRowClicked(row) {
  if (row.url) {
    window.location.href = [row.url, serialize(store.from, store.to)].join("?");
  }
}

watch(
  () => store.from + store.to,
  () => {
    loadData();
  }
);
</script>

<style lang="scss"></style>
