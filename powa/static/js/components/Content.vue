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
        <v-card-title class="pl-0">{{ config.title }}</v-card-title>
      </v-toolbar-title>
    </v-app-bar>
    <v-card-text ref="contentEl"><div v-html="content"></div></v-card-text>
  </v-card>
</template>

<script setup>
import Vue, { onMounted, ref, watch } from "vue";
import { components, createVuetify, icons } from "../plugins/vuetify.js";
import store from "../store";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import { dateMath } from "@grafana/data";
import { formatDuration } from "../utils/duration";
import { encodeQueryData } from "../utils/query";
import * as d3 from "d3";

const props = defineProps({
  config: {
    type: Object,
    default() {
      return {};
    },
  },
});

const loading = ref(false);
const content = ref("");
const contentEl = ref(null);

onMounted(() => {
  loadData();
});

function loadData() {
  loading.value = true;
  const sourceConfig = store.dataSources[props.config.name];
  const from = dateMath.parse(store.from);
  const to = dateMath.parse(store.to, true);
  const params = {
    from: from.format("YYYY-MM-DD HH:mm:ssZZ"),
    to: to.format("YYYY-MM-DD HH:mm:ssZZ"),
  };
  d3.text(sourceConfig.data_url + "?" + encodeQueryData(params)).then(
    (response) => {
      const el = new Vue({
        components,
        data: () => ({
          icons,
        }),
        template: response,
        vuetify: createVuetify(),
      });
      const html = el.$mount().$el.outerHTML;
      content.value = html;
      window.setTimeout(loaded, 1);
      loading.value = false;
    }
  );
}

function loaded() {
  const el = contentEl.value;
  el.querySelectorAll("pre.sql code").forEach((block) => {
    hljs.highlightBlock(block);
  });
  el.querySelectorAll("span.duration").forEach((block) => {
    const duration = parseInt(block.innerHTML);
    block.innerHTML = formatDuration(duration, true);
  });
}

watch(
  () => store.from + store.to,
  () => {
    loadData();
  }
);
</script>
