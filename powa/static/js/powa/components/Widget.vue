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
    if (type === 'content') {
      // we cannot use <content> reserved HTML tag
      return 'content-cmp';
    }
    return type;
  }
}

export default Widget;
</script>
