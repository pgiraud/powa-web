<template>
  <v-breadcrumbs :items="items">
    <template #item="{ item }">
      <v-breadcrumbs-item :href="item.href" :disabled="item.disabled">
        <template v-if="item.text != 'Home'">
          {{ item.text }}
        </template>
        <template v-else>
          <v-icon color="primary" small>{{ icons.mdiHome }}</v-icon>
        </template>
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script setup>
import { toRef, watch } from "vue";
import store from "../store";
import _ from "lodash";
import { icons } from "../plugins/vuetify";
const props = defineProps({
  breadCrumbItems: {
    type: Array,
    default() {
      return [];
    },
  },
});

const items = toRef(props, "breadCrumbItems");

watch(
  () => store.rawFrom + store.rawTo,
  () => {
    _.each(items.value, (item) => {
      if (item.text == "Home") {
        return;
      }
      const baseUrl = new URL(window.location.href);
      const url = new URL(item.href, baseUrl.origin);
      url.searchParams.set("to", store.rawTo);
      url.searchParams.set("from", store.rawFrom);
      item.href = url.pathname + url.search;
    });
  }
);
</script>
