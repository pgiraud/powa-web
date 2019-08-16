<template>
  <div>
    <h4>{{ config.title }}</h4>
  </div>
</template>

<script>

export default {
  props: {
    config: {
      type: Object,
      default () {return {}}
    }
  },
  methods: {
    widgetComponent (type) {
      return type;
    }
  }
}
</script>
