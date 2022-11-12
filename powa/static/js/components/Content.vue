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
    <!-- eslint-disable-next-line vue/no-v-html -->
    <v-card-text ref="contentEl"><div v-html="content"></div></v-card-text>
  </v-card>
</template>

<script setup>
import Vue, { onMounted, ref, watch } from "vue";
import { components, createVuetify, icons } from "../plugins/vuetify.js";
import store from "../store";
import hljs from "highlight.js";
import "highlight.js/styles/default.css";
import $ from "jquery";
import { dateMath } from "@grafana/data";
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
  $.ajax({
    url: sourceConfig.data_url + "?" + $.param(params),
  }).done((response) => {
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
  });
}

function loaded() {
  const el = $(contentEl.value);
  el.find("pre.sql code").each(function (i, block) {
    hljs.highlightBlock(block);
  });
  el.find("span.duration").each(function (i, block) {
    const duration = parseInt($(block).html());
    $(block).html(formatDuration(duration, true));
  });
}

watch(
  () => store.from + store.to,
  () => {
    loadData();
  }
);
</script>
