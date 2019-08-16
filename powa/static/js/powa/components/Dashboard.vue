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

import * as _ from 'lodash';
import Tabcontainer from './Tabcontainer.vue';
import Grid from './Grid.vue';
import Widget from './Widget.vue';

export default {
  name: 'Dashboard',
  components: {
    Grid,
    Tabcontainer
  },
  extends: Widget,
  computed: {
    widgets () {
      // Provide a unique Id to widgets
      return _.map(this.config.widgets,
                   (widget) => Object.assign({uuid: _.uniqueId('widget-')}, widget));
    }
  }
}
</script>
