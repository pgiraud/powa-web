<template>
  <div class="card mb-4">
    <div class="card-body">
      <h4>{{ config.title }}</h4>
      <div ref="content" v-html="content" />
    </div>
  </div>
</template>

<script>
import Component from 'vue-class-component'
import Widget from './Widget.vue';
import moment from 'moment';
import hljs from 'highlight.js/lib/highlight';
import 'highlight.js/styles/default.css';

@Component()
class Content extends Widget {
  content = '';

  mounted() {
    this.loadData();
  };

  loadData() {
    $.ajax({
      url: this.config.data_url
    }).done((response) => {
      this.content = response;
      const el = $(this.$refs.content);
      el.find("pre.sql code").each(function(i, block){
        hljs.highlightBlock(block);
      });
      el.find("span.duration").each(function(i, block){
        const date = moment(parseInt($(block).html()));
        $(block).html(date.preciseDiff(moment.unix(0)));
      });
    });
  }
}

export default Content
</script>
