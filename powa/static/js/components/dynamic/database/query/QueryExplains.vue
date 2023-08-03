<template>
  <v-card :loading="loading">
    <v-app-bar flat height="40px;">
      <v-toolbar-title>
        <v-card-title class="pl-0">{{ config.title }}</v-card-title>
      </v-toolbar-title>
    </v-app-bar>
    <v-card-text v-if="plans !== undefined">
      <template v-if="plans">
        <v-row>
          <v-col v-for="(plan, i) in plans" :key="i" cols="6">
            <h5>{{ _.startCase(plan.title) }} values</h5>
            <dl>
              <dt>Executed:</dt>
              <dd>{{ plan.exec_count }} times</dd>
              <dt>Average filter ratio:</dt>
              <dd>{{ Math.round(plan.filter_ratio * 100, 2) }}%</dd>
            </dl>
            <h6 class="subheader">Example plan:</h6>
            <pre class="sql">
              <code v-html="formatSql(plan.query)"/>
            </pre>
            <pre class="sql"><code>{{plan.plan}}</code></pre>
          </v-col>
        </v-row>
      </template>
      <template v-else> No quals found for this query </template>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useFetch } from "@/utils/fetch.js";
import { formatSql } from "@/utils/sql.js";
import _ from "lodash";

const props = defineProps({
  config: {
    type: Object,
    default() {
      return {};
    },
  },
});

const { loading, data: plans } = useFetch(props.config.name);
</script>
