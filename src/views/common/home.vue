<template>
  <div class="mod-home">
    <h3>邮件统计数据</h3>
    <div v-loading="loading">
      <el-row>
        <el-col :span="24">
          <div class="salesWrap" v-if="isAuth('sys:role:save')">
            <el-select v-model="sales" placeholder="Select">
              <el-option
                v-for="item in salesOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <statByDate
            :date="this.xdata"
            :values="this.bounceData"
            name="Bounce Rate"
          />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <statByDate
            :date="this.xdata"
            :values="this.complaintData"
            name="Compaint Rate"
          />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <statByDate
            :date="this.xdata"
            :values="this.sentData"
            name="Emails Sent"
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import statByDate from "./stat-by-date";

export default {
  components: {
    statByDate,
  },
  data() {
    return {
      loading: false,
      sales: null,
      salesOptions: [],
      chartObj: null,
      echartId: new Date().getTime().toString(),
      xdata: [],
      bounceData: [],
      complaintData: [],
      sentData: [],
    };
  },
  watch: {
    sales: function () {
      this.initChart();
    },
  },
  mounted() {
    this.initOptions();
    this.initChart();
  },
  activated() {
    // 由于给echart添加了resize事件, 在组件激活时需要重新resize绘画一次, 否则出现空白bug
    if (this.chartObj) {
      this.chartObj.resize();
    }
  },
  methods: {
    async initOptions() {
      const res = await this.$http({
        url: this.$http.adornUrl("/sys/user/list"),
        method: "get",
        params: this.$http.adornParams({
          page: 1,
          limit: 99999,
        }),
      });
      const users = res.data.page.list;
      console.log("users", users);
      this.salesOptions = [{ value: null, label: "ALL" }].concat(
        users.map((item) => ({
          value: item.userId,
          label: item.username,
        }))
      );
    },
    async initChart() {
      this.loading = true;
      const res = await this.$http({
        url: this.$http.adornUrl("generator/m4gcampaigns/stats"),
        method: "get",
        params: this.$http.adornParams({
          id: this.sales,
        }),
      });
      this.loading = false;
      console.log("res", res);
      const stats = res.data.data.map((item) => ({
        ...item,
        complaintRate: (item.complaintCount / item.sentCount).toFixed(2) * 100,
        bounceRate: (item.bounceCount / item.sentCount).toFixed(2) * 100,
      }));
      console.log("stats", stats);
      this.xdata = stats.map((item) => item.days);
      this.bounceData = stats.map((item) => item.bounceRate);
      this.complaintData = stats.map((item) => item.complaintRate);
      this.sentData = stats.map((item) => item.sentCount);
    },
  },
};
</script>

<style>
</style>

