<template>
    <div>
        <a-layout>
            <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
                <p>
                    <a-form layout="inline" :model="param">


                        <a-form-item>
                            <a-button type="primary" @click="showModal('add', [])">
                                新增
                            </a-button>
                        </a-form-item>
                    </a-form>
                </p>
                <a-table :columns="columns" :row-key="record => record.id" :data-source="level1" :pagination="false"
                    :loading="loading">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.dataIndex === 'action'">
                            <a-space size="small">
                                <a-button type="primary" @click="showModal('edit', record)">
                                    编辑
                                </a-button>
                                <a-popconfirm title="删除之后不可修复，确认删除？" ok-text="是" cancel-text="否"
                                    @confirm="handleDelete(record.id)">
                                    <a-button type="danger">
                                        删除
                                    </a-button>
                                </a-popconfirm>
                            </a-space>
                        </template>
                    </template>
                </a-table>

            </a-layout-content>
        </a-layout>
        <a-modal title="样本书籍表单" v-model:visible="modalVisible" :confirm-loading="modalLoading" @ok="handleModalok">
            <a-form :v-model="category" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="名称">
                    <a-input v-model:value="category.name"></a-input>
                </a-form-item>
                <a-form-item label="父分类">
                    <a-select ref="select" v-model:value="category.parent" style="width: 120px;">
                        <a-select-option value="0">无</a-select-option>
                        <a-select-option v-for="c in level1" :key="c.id" :disabled="category.id === c.id">{{ c.name
                            }}</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="排序">
                    <a-input v-model:value="category.sort"></a-input>
                </a-form-item>
            </a-form>
        </a-modal>


    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { Tool } from '@/utils/tool'
import { message } from 'ant-design-vue';

const param = ref();
param.value = {};

const columns = [
    {
        title: '名称',
        dataIndex: 'name'
    }, {
        title: '父分类',
        dataIndex: 'parent'
    }, {
        title: '名称',
        dataIndex: 'sort'
    }, {
        title: 'Action',
        key: 'action',
        dataIndex: 'action'
    }
];

onMounted(() => {
    //默认查询页码1
    handleQuery();
})

const level1 = ref()
const loading = ref(false)
//数据查询
const handleQuery = () => {
    loading.value = true;
    axios.get("/category/all", category.value).then((resp) => {
        loading.value = false;
        const data = resp.data;
        if (data.success) {
            level1.value = [];
            level1.value = Tool.array2Tree(data.content, 0);
            console.log("数形结构，", level1)
        }
    });
}

//编辑相关功能
const category = ref();
const modalVisible = ref(false);
const modalLoading = ref(false);
//编辑方法
const showModal = (action: any, record: any) => {
    modalVisible.value = true;
    if (action === 'edit') {
        category.value = Tool.copy(record);
    } else {
        category.value = {}
    }
}

const handleModalok = () => {
    modalLoading.value = true;
    axios.post("/category/save", category.value).then((resp) => {
        const data = resp.data;
        if (data.success) {
            modalLoading.value = false;
            modalVisible.value = false; // 关闭对话框

            // 重新加载列表
            handleQuery()
        }
    })
}

const handleDelete = (id: bigint) => {

    let array = level1.value;
    let len = 0; //子节点数组长度
    for (let i = 0; i < array.length; i++) {
        let c = array[i];
        if (String(c.id) === String(id)) {
            if (array[i].children) {
                len = array[i].children.length
            }
        }
    }
    if (len > 0) {
        message.warning("该节点包含子节点，不能删除")
    } else {
        axios.delete("/category/remove/" + id).then((resp) => {
            if (resp.data.success) {
                handleQuery()
            }
        })

    }
}

//表格点击页面触发
const handleTableChange = (pagination: any) => {
    console.log(pagination);
    handleQuery();
};

</script>