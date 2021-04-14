<template>
  <div class="stats">
    <h2>数据统计</h2>
    <div class="details">
      <el-row type="flex" class="row-bg" justify="space-between">
        <el-input style="max-width: 400px" v-model="search" placeholder="Search by name or email"></el-input>
        <el-button @click="clearFilter">Reset All Filters</el-button>
      </el-row>
      <el-table
        :data="emailList.filter(data => !search || data.email.toLowerCase().includes(search.toLowerCase()) || data.name.toLowerCase().includes(search.toLowerCase()))"
        ref="filterTable"
        border
        height="500px"
        v-loading="emailListLoading"
        style="width: 100%"
      >
        <el-table-column
          prop="email"
          header-align="center"
          align="center"
          label="email"
        >
        </el-table-column>
        <el-table-column
          prop="name"
          header-align="center"
          align="center"
          label="name"
        >
        </el-table-column>
        <el-table-column
          prop="firstOpen"
          header-align="center"
          align="center"
          label="首次打开邮件时间"
          sortable
        >
        </el-table-column>
        <el-table-column
          prop="sendTime"
          header-align="center"
          align="center"
          label="邮件发送时间"
          sortable
        >
        </el-table-column>
        <el-table-column
          prop="isDelivered"
          header-align="center"
          align="center"
          label="isDelivered"
          :filters="[{ text: '暂时未知', value: '暂时未知' }, { text: 'YES', value: 'YES' }, { text: 'NO', value: 'NO' }]"
          :filter-method="filterTag"
        >
        </el-table-column>
        <el-table-column
          prop="isBounce"
          header-align="center"
          align="center"
          label="isBounce"
          :filters="[{ text: '暂时未知', value: '暂时未知' }, { text: 'YES', value: 'YES' }, { text: 'NO', value: 'NO' }]"
          :filter-method="filterTag"
        >
        </el-table-column>
        <el-table-column
          prop="isComplaint"
          header-align="center"
          align="center"
          label="isComplaint"
          :filters="[{ text: '暂时未知', value: '暂时未知' }, { text: 'YES', value: 'YES' }, { text: 'NO', value: 'NO' }]"
          :filter-method="filterTag"
        >
        </el-table-column>
        <el-table-column
          prop="isOpen"
          header-align="center"
          align="center"
          label="isOpen"
          :filters="[{ text: '暂时未知', value: '暂时未知' }, { text: 'YES', value: 'YES' }, { text: 'NO', value: 'NO' }]"
          :filter-method="filterTag"
        >
        </el-table-column>
        <el-table-column
          prop="isReject"
          header-align="center"
          align="center"
          label="isReject"
          :filters="[{ text: '暂时未知', value: '暂时未知' }, { text: 'YES', value: 'YES' }, { text: 'NO', value: 'NO' }]"
          :filter-method="filterTag"
        >
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.campId = this.$router.history.current.query.id;
    this.getDetails()
  },
  data() {
    return {
      search: "",
      campId: "",
      emailList: [],
      emailListLoading: false,
    };
  },
  methods: {
    filterTag: (value, row, column)  => {
      return row[column.property] === value;
    },
    clearFilter: function() {
        this.$refs.filterTable.clearFilter()
        this.search = ""
    },
    getDetails: async function () {
      const self = this
      this.emailListLoading = true
      const result = await this.$http({
        url: this.$http.adornUrl(
          `/generator/m4gcampaignemails/all/${this.campId}`
        ),
        method: "get",
      });
      console.log('result is ', result)
      this.emailList = result.data.data.map(item => ({
        ...item,
        isBounce: item.isBounce === null ? '暂时未知' : (Boolean(item.isBounce) ? 'YES' : 'NO'),
        isDelivered: item.isDelivered === null ? '暂时未知' : (Boolean(item.isDelivered) ? 'YES' : 'NO'),
        isComplaint: item.isComplaint === null ? '暂时未知' : (Boolean(item.isComplaint) ? 'YES' : 'NO'),
        isOpen: item.isOpen === null ? '暂时未知' : (Boolean(item.isOpen) ? 'YES' : 'NO'),
        isReject: item.isReject === null ? '暂时未知' : (Boolean(item.isReject) ? 'YES' : 'NO'),
      }))
      this.emailListLoading = false
    },
    submitUpload: function () {
      const self = this;
      console.log("hihi");
      const uploadRef = this.$refs.upload;
      const file = uploadRef.uploadFiles[0];

      var reader = new FileReader();
      reader.onload = function () {
        console.log("data reaa", reader.result);
        const rows = reader.result.split(/\n/).filter((row) => row !== "");
        rows.shift();
        const parseData = rows.map((row) => ({
          email: row.split(",")[0].trim(),
          name: row.split(",")[1].trim(),
        }));
        self.csv = parseData;
        console.log(self.csv);
      };
      reader.readAsBinaryString(file.raw);
    },
    importClient: function () {
      console.log("csv is");
      console.log(this.csv);
      this.loading = true;

      this.$http({
        url: this.$http.adornUrl(
          `/generator/m4gsubscriber/import?tagId=${this.tagId}`
        ),
        method: "post",
        data: this.csv,
      }).then(({ data }) => {
        console.log("hihih");
        this.loading = false;
        if (data && data.code === 0) {
          this.$message({
            message: "操作成功",
            type: "success",
            duration: 1500,
            onClose: () => {
              this.visible = false;
              this.csv = [];
              this.$router.push({ path: "/generator-m4gsubscriber" });
              this.$emit("refreshDataList");
            },
          });
        } else {
          this.$message.error(data.msg);
        }
      });
    },
  },
  watch: {
    '$route.query.id': function(newVal, oldVal) {
      this.campId = newVal
      this.getDetails()
    }
  }
};
</script>

<style lang="scss">
.row-bg {
  padding: 10px 0;
}
</style>
