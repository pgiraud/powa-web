<template>
  <div>
    <ul
      data-tab
      class="tabs"
    >
      <li
        v-for="(tab, index) in tabs"
        :key="tab.uuid"
        :class="['tab-title', {'active': index === 0}]"
      >
        <a :href="'#' + tab.uuid">
          {{ tab.title }}
        </a>
      </li>
    </ul>
    <div class="tabs-content">
      <div
        v-for="(tab, index) in tabs"
        :id="tab.uuid"
        :key="tab.uuid"
        :class="['content', {'active': index === 0}]"
        style="display:inline-block"
      >
        <component
          :is="widgetComponent(tab.type)"
          :config="tab"
        />
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from 'lodash';
import Component from 'vue-class-component'
import Widget from './Widget.vue';

@Component()
class Tabcontainer extends Widget {
  get tabs () {
    // Provide a unique Id to tabs
    return _.map(this.config.tabs,
                 (tab) => Object.assign({uuid: _.uniqueId('tab-')}, tab));
  }
}
export default Tabcontainer
</script>
