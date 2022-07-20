import { reactive } from "vue";
import _ from "lodash";
import * as d3 from "d3";
import { encodeQueryData } from "./utils/query";
import { dateMath } from "@grafana/data";

const initialQuery = parseQuery(window.location.search);

const store = reactive({
  dataSources: {},
  changesUrl: "",
  changes: [],
  from: initialQuery.from || "now-1h",
  to: initialQuery.to || "now",
  setFromTo(from, to, silent) {
    silent = !!silent;
    this.from = from;
    this.to = to;
    if (!silent) {
      history.pushState({}, "", window.location.pathname + "?" + serialize());
    }
    this.loadData();
  },
  loadData() {
    const params = {
      from: dateMath.parse(store.from).format("YYYY-MM-DD HH:mm:ssZZ"),
      to: dateMath.parse(store.to, true).format("YYYY-MM-DD HH:mm:ssZZ"),
    };

    const copy = Object.assign({}, this.dataSources);
    _.forEach(copy, (source) => {
      source.promise = d3.text(source.data_url + "?" + encodeQueryData(params));
    });
    this.dataSources = copy;
    if (this.changesUrl) {
      this.changes = d3.json(this.changesUrl + "?" + encodeQueryData(params));
    }
  },
  alertMessages: [],
  addAlertMessage(level, message) {
    this.alertMessages.push({ level: level, message: message });
  },
  removeAlertMessage(index) {
    this.alertMessages.splice(index, 1);
  },
});

addEventListener("popstate", () => {
  const query = parseQuery(window.location.search);
  if (query.from && query.to) {
    store.setFromTo(query.from, query.to, true);
  }
});

export function serialize() {
  var str = [
    "from=" + encodeURIComponent(store.from),
    "to=" + encodeURIComponent(store.to),
  ];
  return str.join("&");
}

function parseQuery(queryString) {
  var query = {};
  var pairs = (
    queryString[0] === "?" ? queryString.substr(1) : queryString
  ).split("&");
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}

export default store;
