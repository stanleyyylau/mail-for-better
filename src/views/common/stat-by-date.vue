<template>
  <div class="stats-widget">
      <h2>{{name}}</h2>
    <div :class="echartId"></div>
  </div>
</template>

<script>
import echarts from "echarts";

export default {
  props: {
    name: {
      type: String,
      default: "Metric Name",
    },
    date: {
      type: Array,
      default: [],
    },
    values: {
      type: Array,
      default: [],
    },
  },
  mounted() {
    this.initChart();
  },
  data() {
    return {
      chartObj: null,
      echartId: new Date().getTime().toString() + Math.random().toString() + Math.random().toString() + Math.random().toString(),
    };
  },
  activated() {
    if (this.chartObj) {
      this.chartObj.resize();
    }
  },
  watch: {
      'values': function() {
          this.initChart()
      }
  },
  methods: {
    initChart() {
      var chartDom = document.getElementsByClassName(this.echartId)[0];
      console.log("char don is", chartDom);

      const option = {
        xAxis: {
          type: "category",
          data: this.date,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: this.values,
            type: "line",
          },
        ],
      };

      this.chartObj = echarts.init(chartDom);
      this.chartObj.setOption(option);
      window.addEventListener("resize", () => {
        this.chartObj.resize();
      });
    },
  },
};
</script>

<style>
.stats-widget > div {
    width: 100%;
    height: 100%;
    min-height: 400px;
}
.stats-widget h2 {
    text-align: center;
    margin-bottom: 0px;
}
</style>

