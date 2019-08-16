<template>
  <div>
    <h4>{{ config.title }}</h4>
    I'm a grid
  </div>
</template>

<script>

import Widget from './Widget.vue';

export default {
  extends: Widget,
  props: {
    config: {
      type: Object,
      default () {return {}}
    }
  }
}
</script>
