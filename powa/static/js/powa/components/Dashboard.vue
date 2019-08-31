<template>
  <div>
    <div
      v-for="(row, rIndex) in config.widgets"
      :key="rIndex"
      class="row"
    >
      <div
        v-for="(widget, wIndex) in row"
        :key="rIndex + wIndex"
        :class="['columns', 'large-' + 12 / Object.keys(row).length]"
      >
        <div class="widget panel">
          <component
            :is="widgetComponent(widget.type)"
            :config="widget"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Component from 'vue-class-component'
import * as _ from 'lodash';
import Widget from './Widget.vue';

@Component()
class Dashboard extends Widget {
}
export default Dashboard
</script>
