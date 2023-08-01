<template>
  <query-tooltip
    v-if="props.header.type == 'query'"
    :key="props.header.key"
    :value="props.value"
  ></query-tooltip>
  <span
    v-else
    :key="props.header.key"
    v-html="props.header.formatter(props.value)"
  ></span>
</template>
<script setup>
import QueryTooltip from "@/components/QueryTooltip.vue";
const props = defineProps({
  header: {
    type: Object,
    default() {
      return {};
    },
  },
  value: {
    type: [String, Number, Boolean],
    default: "",
  },
});
</script>
