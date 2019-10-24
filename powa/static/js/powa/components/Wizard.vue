<template>
  <div class="card mb-4">
    <div class="card-body">
      <h4>{{ config.title }}</h4>
      <em>Wizard component not implemented.</em>
    </div>
  </div>
</template>

<script>
import Component from 'vue-class-component'
import Widget from './Widget.vue';

@Component()
class Wizard extends Widget {
}

export default Wizard
</script>
