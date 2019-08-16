<template>
  <div>
    <ul
      data-tab
      class="tabs"
    >
      <li
        v-for="tab in tabs"
        :key="tab.uuid"
        :data-tabid="tab.uuid"
        class="tab-title"
      >
        <a href>
          {{ tab.title }}
        </a>
      </li>
    </ul>
    <div
      v-for="tab in tabs"
      :key="tab.uuid"
      class="content"
    >
      {{ tab.type }}
      <component
        :is="widgetComponent(tab.type)"
        :config="tab"
      />
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash';
import Widget from './Widget.vue';

export default {
  extends: Widget,
  computed: {
    tabs () {
      // Provide a unique Id to tabs
      return _.map(this.config.tabs,
                   (tab) => Object.assign({uuid: _.uniqueId('tab-')}, tab));
    }
  }
}
</script>
