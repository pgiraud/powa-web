<template>
  <div>
    <h4>{{ config.title }}</h4>
    I'm a widget
  </div>
</template>

<script>
export default {
  props: {
    config: {
      type: Object,
      default () {return {}}
    }
  }
}
</script>
