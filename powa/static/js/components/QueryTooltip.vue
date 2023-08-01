<template>
  <v-tooltip
    content-class="sql elevation-2"
    transition="fade"
    open-delay="200"
    location="bottom"
  >
    <template #activator="{ props: activatorprops }">
      <pre v-bind="activatorprops" v-html="formatSql(props.value)" />
    </template>
    <pre v-html="formatSql(props.value)" />
  </v-tooltip>
</template>

<script setup>
import { formatSql } from "@/utils/sql.js";

const props = defineProps({
  value: {
    type: String,
    default() {
      return {};
    },
  },
});
</script>
