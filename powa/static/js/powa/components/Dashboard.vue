<template>
  <div>
    <div
      v-for="widget in widgets"
      :key="widget.uuid"
      class="row"
    >
      <div class="columns large-12">
        <div class="widget panel">
          <component
            :is="widgetComponent(widget[0].type)"
            :config="widget[0]"
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
  get widgets () {
    // Provide a unique Id to widgets
    return _.map(this.config.widgets,
                 (widget) => Object.assign({uuid: _.uniqueId('widget-')}, widget));
  }
}
export default Dashboard
</script>
