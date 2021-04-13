<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.key" placeholder="参数名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('generator:m4gcampaigns:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button v-if="isAuth('generator:m4gcampaigns:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading || sending"
      :element-loading-text="sending ? 'Campaign 发送中 ...' : 'Loading'"
      @selection-change="selectionChangeHandle"
      style="width: 100%;">
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50">
      </el-table-column>
      <el-table-column
        prop="id"
        header-align="center"
        align="center"
        label="ID">
      </el-table-column>
      <el-table-column
        prop="ownedBy"
        header-align="center"
        align="center"
        label="所属业务员">
      </el-table-column>
      <el-table-column
        prop="subject"
        header-align="center"
        align="center"
        label="邮箱标题">
      </el-table-column>
      <!-- <el-table-column
        prop="body"
        header-align="center"
        align="center"
        label="邮箱正文">
      </el-table-column> -->
      <el-table-column
        prop="fromEmail"
        header-align="center"
        align="center"
        label="发件人">
      </el-table-column>
      <el-table-column
        prop="status"
        header-align="center"
        align="center"
        label="状态">
      </el-table-column>
      <el-table-column
        prop="complaintCount"
        header-align="center"
        align="center"
        label="Complaint Count">
      </el-table-column>
      <el-table-column
        prop="permanentBounceCount"
        header-align="center"
        align="center"
        label="Bounce Count">
      </el-table-column>
      <el-table-column
        prop="openCount"
        header-align="center"
        align="center"
        label="Open Count">
      </el-table-column>
      <el-table-column
        prop="totalSentCount"
        header-align="center"
        align="center"
        label="Total Sent">
      </el-table-column>
      <el-table-column
        prop="deliverCount"
        header-align="center"
        align="center"
        label="Deliver Count">
      </el-table-column>
      <el-table-column
        prop="createTime"
        header-align="center"
        align="center"
        label="创建时间">
      </el-table-column>
      <el-table-column
        prop="updateTime"
        header-align="center"
        align="center"
        label="更新时间">
      </el-table-column>
      <el-table-column
        fixed="right"
        header-align="center"
        align="center"
        width="150"
        label="操作">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">{{scope.row.status === '发送完成' ? '查看' : '修改'}}</el-button>
          <el-button :disabled="scope.row.status === '发送完成'" type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
          <el-button v-show="scope.row.status === '未发送'" type="text" size="small" @click="deleteSendCampaign(scope.row.id)">发送</el-button>
          <el-button v-show="scope.row.status === '发送完成'" type="text" size="small" @click="global.alert('feature in development')">数据</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper">
    </el-pagination>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
  import AddOrUpdate from './m4gcampaigns-add-or-update'
      import { campaignStatusMap, replaceOwnedByWithName } from '../../../utils/common'

  export default {
    data () {
      return {
        sending: false,
        dataForm: {
          key: ''
        },
        dataList: [],
        pageIndex: 1,
        pageSize: 10,
        totalPage: 0,
        dataListLoading: false,
        dataListSelections: [],
        addOrUpdateVisible: false
      }
    },
    components: {
      AddOrUpdate
    },
    activated () {
      this.getDataList()
    },
    methods: {
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true
        this.$http({
          url: this.$http.adornUrl('/generator/m4gcampaigns/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'key': this.dataForm.key
          })
        }).then(async ({data}) => {
          if (data && data.code === 0) {
            this.dataList = campaignStatusMap(await replaceOwnedByWithName(data.page.list))
            this.totalPage = data.page.totalCount
          } else {
            this.dataList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
      },
      // 每页数
      sizeChangeHandle (val) {
        this.pageSize = val
        this.pageIndex = 1
        this.getDataList()
      },
      // 当前页
      currentChangeHandle (val) {
        this.pageIndex = val
        this.getDataList()
      },
      // 多选
      selectionChangeHandle (val) {
        this.dataListSelections = val
      },
      // 新增 / 修改
      addOrUpdateHandle (id) {
        this.addOrUpdateVisible = true
        this.$nextTick(() => {
          this.$refs.addOrUpdate.init(id)
        })
      },
      deleteSendCampaign (id) {
            this.$confirm(`确定对 id=${id} 的 campaign 进行发送操作?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'information'
            }).then(() => {
              this.sending = true
              this.$http({
                url: this.$http.adornUrl(`/generator/m4gcampaigns/send/${id}`),
                method: 'post',
                data: this.$http.adornData({
                  id: id
                })
              }).then(({data}) => {
                this.sending = false
                if (data && data.code === 0) {
                  this.$message({
                    message: '操作成功',
                    type: 'success',
                    duration: 1500,
                    onClose: () => {
                      this.getDataList()
                    }
                  })
                } else {
                  this.$message.error(data.msg)
                }
                this.sending = false
              })
            })
      },
      // 删除
      deleteHandle (id) {
        var ids = id ? [id] : this.dataListSelections.map(item => {
          return item.id
        })
        this.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http({
            url: this.$http.adornUrl('/generator/m4gcampaigns/delete'),
            method: 'post',
            data: this.$http.adornData(ids, false)
          }).then(({data}) => {
            if (data && data.code === 0) {
              this.$message({
                message: '操作成功',
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.getDataList()
                }
              })
            } else {
              this.$message.error(data.msg)
            }
          })
        })
      }
    }
  }
</script>
