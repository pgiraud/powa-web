<script>
import Widget from './Widget.vue';
import store from '../store';
import * as moment from 'moment';

export default {
  extends: Widget,
  created: function() {
    this.loadData();
  },

  methods: {
    loadData: function () {
      const metricGroup = _.uniq(_.map(this.config.metrics, (metric) => {
        return metric.split('.')[0];
      }));
      const toDate = moment();
      const fromDate = toDate.clone().subtract(1, 'hour');
      const params = {
        from: fromDate.format("YYYY-MM-DD HH:mm:ssZZ"),
        to: toDate.format("YYYY-MM-DD HH:mm:ssZZ")
      };
      const url = store.dataSources[metricGroup].data_url;
      $.ajax({
        url: url + '?' + $.param(params)
      }).done((response) => {
        console.log ('done', response);
      }).fail((response) => {
        console.log ('fail');
      });
    }
  }
}
</script>
