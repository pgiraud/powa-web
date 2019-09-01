<template>
  <div>
    <h4>{{ config.title }}</h4>
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-4">
          <b-input-group size="sm">
            <b-form-input
              id="filterInput"
              v-model="filter"
              type="search"
              placeholder="Type to Search"
            />
            <b-input-group-append>
              <b-button
                :disabled="!filter"
                @click="filter = ''"
              >
                Clear
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </div>
      </div>
      <b-table
        striped
        hover
        :items="items"
        :fields="fields"
        :current-page="currentPage"
        :per-page="perPage"
        :filter="filter"
        class="table-sm table-borderless"
        @filtered="onFiltered"
        @row-clicked="onRowClicked"
      >
        <template
          slot="[query]"
          slot-scope="data"
        >
          <pre v-html="data.value" />
        </template>
      </b-table>
      <div class="row">
        <div class="col-sm-4">
          <b-pagination
            v-model="currentPage"
            :total-rows="totalRows"
            :per-page="perPage"
            align="fill"
            size="sm"
            class="my-0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import Component from 'vue-class-component'
import Widget from './Widget.vue';
import store from '../store';
import * as moment from 'moment';
import size from '../utils2/size';
import hljs from 'highlight.js/lib/highlight';
import 'highlight.js/styles/default.css';
import pgsql from 'highlight.js/lib/languages/pgsql';
hljs.registerLanguage('pgsql', pgsql);

@Component()
class Grid extends Widget {
  items = null;
  totalRows = 1;
  currentPage = 1;
  perPage = 20;
  filter = null;

  mounted() {
    this.loadData();
  };

  loadData() {
    const metricGroup = _.uniq(_.map(this.config.metrics, (metric) => {
      return metric.split('.')[0];
    }));
    const sourceConfig = store.dataSources[metricGroup];
    const toDate = moment();
    const fromDate = toDate.clone().subtract(1, 'hour');
    const params = {
      from: fromDate.format("YYYY-MM-DD HH:mm:ssZZ"),
      to: toDate.format("YYYY-MM-DD HH:mm:ssZZ")
    };
    $.ajax({
      url: sourceConfig.data_url + '?' + $.param(params)
    }).done((response) => {
      this.dataLoaded(response.data);
    });
  }

  dataLoaded(data) {
    this.items = data;
    this.totalRows = this.items.length;
  }

  get fields() {
    const metricGroup = _.uniq(_.map(this.config.metrics, (metric) => {
      return metric.split('.')[0];
    }));
    const metrics = _.map(this.config.metrics, (metric) => {
      return metric.split('.')[1];
    });
    const sourceConfig = store.dataSources[metricGroup];

    const columns = this.config.columns;
    _.each(metrics, function(metric) {
      columns.push($.extend({}, sourceConfig.metrics[metric]));
    });
    _.each(columns, (c) => {
      $.extend(c, {
        key: c.name,
        label: c.label,
        formatter: this.getFormatter(c.type),
        class: c.type
      })
    });
    return columns;
  }

  formatDuration(value) {
    return moment(parseFloat(value, 10)).preciseDiff(moment(0), true);
  }

  formatSize(value) {
    return new size.SizeFormatter().fromRaw(value);
  }

  formatQuery(value) {
    return hljs.highlightAuto(value, ['pgsql']).value;
  }

  getFormatter(type) {
    console.log (type);
    switch (type) {
      case 'duration':
        return this.formatDuration;
      case 'size':
        return this.formatSize;
      case 'query':
        return this.formatQuery;
      default:
        return (value) => value;
    }
  }

  onFiltered(filteredItems) {
    this.totalRows = filteredItems.length;
    this.currentPage = 1;
  }

  onRowClicked(row) {
    window.location.href = row.url;
  }
}

export default Grid
</script>

<style lang="scss">
  td {
    white-space: nowrap;

    &.query {
      width: 50%;
      overflow: hidden;
      max-width: 0;
      pre, code {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 0;
      }
    }
  }
  th, td {
    &.duration,
    &.number,
    &.size {
      text-align: right;
    }
  }
</style>
