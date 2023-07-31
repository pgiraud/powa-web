<template>
  <div>
    <v-breadcrumbs :items="items" large>
      <template #title="{ item }">
        <v-select
          v-if="item.children"
          :items="item.children"
          :label="item.text"
          item-text="title"
          item-value="url"
          hide-details
          hide-selected
          @change="onSelect"
        ></v-select>
        <span v-else>
          {{ item.text }}
        </span>
      </template>
    </v-breadcrumbs>
  </div>
</template>

<script setup>
import { toRef, watch } from "vue";
import store from "@/store";
import _ from "lodash";
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

function onSelect(url) {
  window.location.href = url;
}
</script>
