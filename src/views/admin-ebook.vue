<template>
    <div>
        <a-layout>
            <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
                <p>
                    <a-form layout="inline" :model="param">
                        <a-form-item>
                            <a-input v-model:value="param.name" placeholder="名称"></a-input>
                        </a-form-item>
                        <a-form-item>
                            <a-button type="primary" @click="handleQuery({ page: 1, size: pagination.pageSize })">
                                查询
                            </a-button>
                        </a-form-item>

                        <a-form-item>
                            <a-button type="primary" @click="showModal('add', [])">
                                新增
                            </a-button>
                        </a-form-item>
                    </a-form>
                </p>
                <a-table :columns="columns" :row-key="record => record.id" :data-source="ebooks"
                    :pagination="pagination" :loading="loading" @change="handleTableChange">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'cover'">
                            <a-image :src="record.cover" alt="图片加载失败" style="width: 80px; height: 80px;" />
                        </template>

                        <template v-if="column.key === 'category'">
                            <span>{{ getCategoryName(record.category1Id) }}/{{ getCategoryName(record.category2Id) }}</span>
                        </template>

                        <template v-if="column.dataIndex === 'action'">
                            <a-space size="small">

                                <a-button type="primary">
                                    <router-link to="'/admin/doc?ebookId='+record.id">文档管理</router-link>
                                </a-button>

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
            <a-form :v-model="ebook" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                <a-form-item label="封面">
                    <a-input v-model:value="ebook.cover"></a-input>
                </a-form-item>
                <a-form-item label="名称">
                    <a-input v-model:value="ebook.name"></a-input>
                </a-form-item>
                <a-form-item label="分类">
                    <a-cascader v-model:value="categoryIds"
                        :field-names="{ label: 'name', value: 'id', children: 'children' }"
                        :options="level1"></a-cascader>
                </a-form-item>
                <a-form-item label="描述">
                    <a-textarea v-model:value="ebook.description"></a-textarea>
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

const ebooks = ref();//定义查询书籍返回集合


// 定义分页参数
const pagination = ref({
    current: 1,
    pageSize: 5,
    total: 0
})

const loading = ref(false);

const columns = [{
    title: '封面',
    key: 'cover',
    dataIndex: 'cover',
},
{
    title: '名称',
    dataIndex: 'name',
},
{
    title: '分类',
    key: 'category',
    dataIndex: 'category',
},
{
    title: '文档数',
    dataIndex: 'docCount',
},
{
    title: '阅读数',
    dataIndex: 'viewCount',
},
{
    title: '点赞数',
    dataIndex: 'voteCount',
},
{
    title: 'Action',
    key: 'action',
    dataIndex: 'action',
}
];

onMounted(() => {
    //默认查询页码1
    handleQueryCategory();
})



const param = ref();
param.value = {};
//数据查询
const handleQuery = (params: any) => {
    loading.value = true;


    axios.get("/ebook/list", {
        params: {
            page: params.page,
            size: params.size,
            name: param.value.name
        }
    }).then((resp) => {
        loading.value = false;
        const data = resp.data;
        if (data.success) {
            //获取查询数据
            ebooks.value = data.content.list;
            //重置分页
            pagination.value.current = params.page;
            //设置总条数
            pagination.value.total = data.content.total;
        }
    });
};

//查询分类数据级联展示
const categoryIds = ref()
const level1 = ref()
let categorys: any;

const handleQueryCategory = () => {
    loading.value = true;
    axios.get("/category/all").then((resp) => {
        loading.value = false;
        const data = resp.data;
        categorys = data.content
        if (data.success) {
            level1.value = [];
            level1.value = Tool.array2Tree(data.content, 0);
            console.log("数形结构，", level1)
            // console.log('----------', categorys)
            //加载完成分类之后，再加载电子书，否则可能会产生书籍渲染报错
            handleQuery({
                page: 1,
                size: pagination.value.pageSize
            });


            console.log('-----------', categoryIds);
        } else {
            message.error(data.message)
        }
    });
}


//编辑相关功能
const ebook = ref(

);
const modalVisible = ref(false);
const modalLoading = ref(false);
//编辑方法
const showModal = (action: any, record: any) => {
    modalVisible.value = true;
    if (action === 'edit') {
        ebook.value = Tool.copy(record);
        categoryIds.value = [getCategoryName(ebook.value.category1Id), getCategoryName(ebook.value.category2Id)];
    } else {
        ebook.value = {}
    }
}

const handleModalok = () => {
    modalLoading.value = true;
    ebook.value.category1Id = categoryIds.value[0];
    ebook.value.category2Id = categoryIds.value[1];

    axios.post("/ebook/save", ebook.value).then((resp) => {
        const data = resp.data;
        if (data.success) {
            modalLoading.value = false;
            modalVisible.value = false; // 关闭对话框

            // 重新加载列表
            handleQuery({
                page: pagination.value.current,
                size: pagination.value.pageSize
            })
        } else {
            message.error(data.message);
        }
    })
}



const handleDelete = (id: number) => {
    axios.delete("/ebook/remove/" + id).then((resp) => {
        const data = resp.data;
        if (data.success) {
            alert("删除成功");
            handleQuery({
                page: pagination.value.current,
                size: pagination.value.pageSize
            })
        } else {
            alert("删除失败")
        }
    })
};

const getCategoryName = (cid: string) => {
    let cidstr: string = cid.toString();
    let result = "";
    // categorys.forEach((item: string) => {
    //     if (item.id === cidstr) {
    //         result = item.name;
    //     }
    // })

    categorys.forEach((item:string) => {
        if(item.id === cidstr){
            result = item.name;
        }
    });
    return result;
};

//表格点击页面触发
const handleTableChange = (pagination: any) => {
    console.log(pagination);
    handleQuery({
        page: pagination.current,
        size: pagination.pageSize
    });
};

</script>