<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">
      <el-form-item>
        <el-input v-model="dataForm.key" placeholder="参数名" clearable></el-input>
      </el-form-item>
      <el-form-item>
        <el-select v-model="category" placeholder="选择标签" default-first-option>
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="tags" placeholder="选择多标签" multiple>
          <el-option
            v-for="item in tagOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="isAuth('sys:role:save')">
        <el-select v-model="sales" placeholder="选择业务员">
          <el-option
            v-for="item in salesOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="getDataList()">查询</el-button>
        <el-button v-if="isAuth('generator:m4gsubscriber:save')" type="primary" @click="addOrUpdateHandle()">新增</el-button>
        <el-button @click="$router.push({ name: 'client-import' })" type="primary">导入客户</el-button>
        <el-button v-if="isAuth('generator:m4gsubscriber:delete')" type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
      </el-form-item>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
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
        prop="email"
        header-align="center"
        align="center"
        label="邮箱地址">
      </el-table-column>
      <el-table-column
        prop="name"
        header-align="center"
        align="center"
        label="名字">
      </el-table-column>
      <el-table-column
        prop="ownedBy"
        header-align="center"
        align="center"
        label="所属业务员">
      </el-table-column>
      <el-table-column
        prop="tagId"
        header-align="center"
        align="center"
        label="标签">
      </el-table-column>
      <el-table-column
        header-align="center"
        align="center"
        label="多标签">
        <template slot-scope="scope">
          <el-tag v-for="item in scope.row.realTags" :key="item">{{item}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="isBounce"
        header-align="center"
        align="center"
        :filters="[{ text: 'YES', value: 'YES' }, { text: 'NO', value: 'NO' }]"
        :filter-method="filterTag"
        label="Bounce">
      </el-table-column>
      <el-table-column
        prop="isComplaint"
        header-align="center"
        align="center"
        :filters="[{ text: 'YES', value: 'YES' }, { text: 'NO', value: 'NO' }]"
        :filter-method="filterTag"
        label="Complaint">
      </el-table-column>
      <el-table-column
        prop="isValid"
        header-align="center"
        align="center"
        :filters="[{ text: 'YES', value: 'YES' }, { text: 'NO', value: 'NO' }]"
        :filter-method="filterTag"
        label="Valid">
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
          <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.id)">修改</el-button>
          <el-button type="text" size="small" @click="deleteHandle(scope.row.id)">删除</el-button>
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
  import AddOrUpdate from './m4gsubscriber-add-or-update'
  import { replaceOwnedByWithName, replaceTagIdWithName, replaceMultiTagIdWithName } from '../../../utils/common'

  export default {
    data () {
      return {
        categoryOptions: [],
        tagOptions: [],
        salesOptions: [],
        dataForm: {
          key: ''
        },
        sales: null,
        tags: null,
        category: '',
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
      this.loadMultiTagOptions()
      this.getSalesOptions()
    },
    methods: {
      getSalesOptions () {
        this.$http({
              url: this.$http.adornUrl('/sys/user/list'),
              method: 'get',
              params: this.$http.adornParams({
                'page': 1,
                'limit': 99999,
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                console.log('data', data)
                this.salesOptions = [{label: 'ALL', value: null}].concat(data.page.list.map(item => ({
                  label: item.username,
                  value: item.userId
                })))
              }
            })
      },
      loadMultiTagOptions () {
          this.$http({
              url: this.$http.adornUrl('/generator/m4grealtags/list/'),
              method: 'get',
              params: this.$http.adornParams({
                'page': 1,
                'limit': 99999,
              })
            }).then(({data}) => {
              if (data && data.code === 0) {
                console.log('data', data)
                this.tagOptions = data.page.list.map(item => ({
                  label: item.tag,
                  value: item.id
                }))
              }
            })
      },
      filterTag: (value, row, column)  => {
        return row[column.property] === value;
      },
      // 获取数据列表
      getDataList () {
        this.dataListLoading = true

        this.$http({
          url: this.$http.adornUrl('/generator/m4gsubscriber/listv2'),
          method: 'get',
          params: this.$http.adornParams({
            'page': this.pageIndex,
            'limit': this.pageSize,
            'key': this.dataForm.key,
            'categoryIds': this.category ? this.category : null,
            'tags': this.tags ? this.tags.join(',') : null,
            'ownedBy': this.sales
          })
        }).then(async ({data}) => {
          if (data && data.code === 0) {
            const tempList = await replaceTagIdWithName(await replaceOwnedByWithName(data.page.list))
            this.dataList = await replaceMultiTagIdWithName(tempList.map(item => ({
              ...item,
              isBounce: Boolean(item.isBounce) ? 'YES' : 'NO',
              isComplaint: Boolean(item.isComplaint) ? 'YES' : 'NO',
              isValid: Boolean(item.isValid) ? 'YES' : 'NO',
            })))
            this.totalPage = data.page.totalCount
          } else {
            this.dataList = []
            this.totalPage = 0
          }
          this.dataListLoading = false
        })
        
        this.$http({
          url: this.$http.adornUrl('/generator/m4gtags/list'),
          method: 'get',
          params: this.$http.adornParams({
            'page': 1,
            'limit': 99999,
          })
        }).then(async ({data}) => {
          if (data && data.code === 0) {
            this.dataList = await replaceOwnedByWithName(data.page.list)
            this.totalPage = data.page.totalCount
            this.categoryOptions = [{label: 'ALL', value: null}].concat(data.page.list.map(item => ({
              label: item.tag,
              value: item.id
            })))
          } else {
            
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
            url: this.$http.adornUrl('/generator/m4gsubscriber/delete'),
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
