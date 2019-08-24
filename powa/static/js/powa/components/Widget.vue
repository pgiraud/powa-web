<template>
  <div>
    <h4>{{ config.title }}</h4>
  </div>
</template>

<script>
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  props: {
    config: {
      type: Object,
      default () {return {}}
    }
  }
})
class Widget extends Vue {
  widgetComponent (type) {
    return type;
  }
}

export default Widget;
</script>
