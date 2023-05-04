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
        </v-card-title>
      </v-toolbar-title>
    </v-app-bar>
    <v-card-text class="pb-0">
      <v-row class="mb-4">
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
      >
        <template v-if="props.config.toprow" #header>
          <thead>
            <tr>
              <th></th>
              <th
                v-for="group in props.config.toprow"
                :key="group.name"
                :colspan="group.colspan"
                class="text-center"
                style="border-right: 1px solid #dfdfdf"
              >
                {{ group.name }}
              </th>
            </tr>
          </thead>
        </template>
        <!-- This template looks for headers with formatters and executes them -->
        <template
          v-for="header in headers.filter((header) =>
            header.hasOwnProperty('formatter')
          )"
          #[`item.${header.value}`]="{ value, item }"
        >
          <a
            v-if="header.urlAttr"
            :key="header.value"
            :href="item[header.urlAttr]"
          >
            <grid-cell :value="value" :header="header"> </grid-cell>
          </a>
          <grid-cell v-else :key="header.value" :value="value" :header="header">
          </grid-cell>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import store from "../store";
import _ from "lodash";
import size from "../utils/size";
import hljs from "highlight.js/lib/core";
import "highlight.js/styles/default.css";
import pgsql from "highlight.js/lib/languages/pgsql";
import { mdiMagnify, mdiLinkVariant } from "@mdi/js";
import { formatDuration } from "../utils/duration";

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
  watch(
    () => store.dataSources,
    () => {
      loadData();
    },
    { immediate: true }
  );
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
        cellClass: n.type || "",
        formatter: getFormatter(n.type),
        type: n.type,
        align: getAlign(n.type),
        urlAttr: n.url_attr,
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
  sourceConfig.promise.then((response) => {
    dataLoaded(JSON.parse(response).data);
    loading.value = false;
  });
}

function dataLoaded(data) {
  items.value = data;
}

function formatBool(value) {
  return value
    ? '<span class="success--text">✓</span>'
    : '<span class="error--text">✗</span>';
}

function formatSize(value) {
  return new size.SizeFormatter().fromRaw(value);
}

function getFormatter(type) {
  switch (type) {
    case "bool":
      return formatBool;
    case "duration":
      return (value) => formatDuration(value, true);
    case "percent":
      return (value) => value + "%";
    case "size":
      return formatSize;
    case "integer":
      return (value) => value.toLocaleString();
    default:
      return (value) => _.escape(value);
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
</script>

<style lang="scss">
td a {
  text-decoration: none;
}
td.query a {
  color: inherit;
}
</style>
