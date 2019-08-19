<template>
  <div>
    <h4>{{ config.title }}</h4>
    I'm a grid
  </div>
</template>

<script>

import MetricWidget from './MetricWidget.vue';

export default {
  extends: MetricWidget,
  props: {
    config: {
      type: Object,
      default () {return {}}
    }
  }
}
</script>
