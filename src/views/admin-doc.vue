<template>
    <div>
        <a-layout>
            <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">
                <a-row>
                    <a-col span="8">
                        <p>
                            <a-form layout="inline" :model="param">
                                <a-form-item>
                                    <a-button type="primary" @click="showModal('add', [])">
                                        新增
                                    </a-button>
                                </a-form-item>
                            </a-form>
                        </p>
                        <a-table :columns="columns" :row-key="record => record.id" :data-source="level1"
                            :pagination="false" :loading="loading">
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.dataIndex === 'action'">
                                    <a-space size="small">

                                        <a-button type="primary" @click="showModal('edit', record)">
                                            编辑
                                        </a-button>
                                        <a-popconfirm title="删除之后不可修复，确认删除？" ok-text="是" cancel-text="否"
                                            @confirm="handleDelete(record.id)">
                                            <a-button danger>
                                                删除
                                            </a-button>
                                        </a-popconfirm>
                                    </a-space>
                                </template>
                            </template>
                        </a-table>
                    </a-col>

                    <a-col span="16">
                        <p>
                            <a-form layout="inline">
                                <a-form-item>
                                    <a-button type="primary" @click="handleSave()">保存</a-button>
                                </a-form-item>
                            </a-form>
                        </p>
                        <a-form :v-model="doc" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
                            <a-form-item>
                                <a-input v-model:value="doc.name" placeholder="名称"></a-input>
                            </a-form-item>
                            <a-form-item>
                                <a-tree-select v-model:value="doc.parent" show-search style="width: 100%;"
                                    :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }" placeholder="请选择父文档"
                                    allowClear treeDefaultExpandAll :treeData="treeSelectData"
                                    treeNodeFilterProp="label"
                                    :replaceFields="{ children: 'children', label: 'name', key: 'id', value: 'id' }">

                                </a-tree-select>
                            </a-form-item>
                            <a-form-item>
                                <a-select ref="select" v-model:value="doc.parent" style="width: 120px;">
                                    <a-select-option value="0">wu1</a-select-option>
                                    <a-select-option v-for="c in level1" :key="c.id" :value="c.id"
                                        :disabled="doc.id === c.id">{{ c.name
                                        }}</a-select-option>
                                </a-select>
                            </a-form-item>
                            <a-form-item >
                                <a-input v-model:value="doc.sort" placeholder="排序"></a-input>
                            </a-form-item >
                            <a-form-item>
                                <div style="border:1px solid #ccc">
                                    <Toolbar style="border-bottom: 1px solid #ccc;" :editor="editorRef"
                                        :defaultConfig="toolbarConfig" :mode="mode" />
                                    <Editor style="height: 500px; overflow-y: hidden;" v-model="doc.content"
                                        :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" />
                                </div>
                            </a-form-item>
                        </a-form>
                    </a-col>

                </a-row>
            </a-layout-content>
        </a-layout>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import axios from 'axios';
import { Tool } from '@/utils/tool'
import { message } from 'ant-design-vue';
import { useRoute } from 'vue-router';
import { defaultConfig } from 'ant-design-vue/es/theme/internal';
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const param = ref();
param.value = {};
const level1 = ref([]);

const columns = [
    {
        title: '名称',
        dataIndex: 'name'
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

//定义显示文档的响应式数据，因为选择组件属性会随着当前编辑的节点改变   树初始值为空
const treeSelectData = ref();
treeSelectData.value = [];




const loading = ref(false)
//数据查询
const handleQuery = () => {
    loading.value = true;
    axios.get("/doc/all", doc.value).then((resp) => {
        loading.value = false;
        const data = resp.data;
        if (data.success) {
            level1.value = [];
            level1.value = Tool.array2Tree(data.content, 0);
            console.log("数形结构，", level1)
        }
    });
};



// // 获取所有电子书
// const handleQueryEbook = () => {
//   axios.get("/ebook/list", {
//     params: {
//       page: 1,
//       size: 100
//     }
//   }).then(resp => {
//     console.log(resp);
//     ebooks.value = resp.data.content.list; // 更新数据源
//   });
// };
//编辑相关功能
const doc = ref({
    id: 0,
    name: "",
    parent: 0,
    ebook_id: 0,
    sort: 0
});
const modalVisible = ref(false);
const modalLoading = ref(false);
//富文本编辑器
const editorRef = shallowRef();
//编辑器回调函数
const handleCreated = (editor) => {
    console.log('create', editor);
    editorRef.value = editor;
};
// 声明路由
const route = useRoute();

//编辑方法
const showModal = (action: any, record: any) => {
    modalVisible.value = true;
    if (action === 'edit') {
        doc.value = Tool.copy(record);

        //不能选择当前节点或子节点作为父节点
        treeSelectData.value = Tool.copy(level1.value);
        setDisable(treeSelectData.value, record.id);

        //给树选择添加一个“无”的选项
        treeSelectData.value.unshift({ id: 0, name: '无' });
    } else {
        doc.value = {}
        modalVisible.value = true;
        //清空对话框数据
        doc.value = {
            ebookId: route.query.ebookId
        };
        //不能选择当前节点或子节点作为父节点
        treeSelectData.value = Tool.copy(level1.value);

        //给树选择添加一个“无”的选项
        treeSelectData.value.unshift({ id: 0, name: '无' })
    }
}

//将某个节点及其子节点全部设置为不可选中
const setDisable = (treeSelectData: any, id: any) => {
    for (let i = 0; i < treeSelectData.length; i++) {
        const node = treeSelectData[i];
        if (node.id === id) {
            console.log("disable", node);
            node.disabled = true;

            //遍历子节点
            const children = node.children
            if (Tool.isNotEmpty(children)) {
                for (let j = 0; j < children.length; j++) {
                    setDisable(children, children[j].id);
                }
            }
        } else {
            // 当前节点不是目标节点
            const children = node.children;
            if (Tool.isNotEmpty(children)) {
                setDisable(children, id);
            }
        }
    }
}

const handleModalok = () => {
    modalLoading.value = true;
    axios.post("/doc/save", doc.value).then((resp) => {
        const data = resp.data;
        if (data.success) {
            modalLoading.value = false;
            modalVisible.value = false; // 关闭对话框

            // 重新加载列表
            handleQuery()
        }
    })
}

//查看需要删除的父子树枝
const ids: Array<string> = [];
const deleteNames: Array<string> = [];
const getDeleteIds = (treeSelectData: any, id: any) => {
    for (let i = 0; i < treeSelectData.length; i++) {
        const node = treeSelectData[i];
        if (node.id === id) {
            console.log("disable", node);
            node.disabled = true;
            ids.push(id);
            deleteNames.push(node.name);

            //遍历子节点
            const children = node.children
            if (Tool.isNotEmpty(children)) {
                for (let j = 0; j < children.length; j++) {
                    getDeleteIds(children, children[j].id);
                }
            }
        } else {
            // 当前节点不是目标节点
            const children = node.children;
            if (Tool.isNotEmpty(children)) {
                getDeleteIds(children, id);
            }
        }
    }
}

const handleDelete = (id: bigint) => {

    ids.length = 0;
    deleteNames.length = 0;
    getDeleteIds(level1.value, id);

    axios.get('/doc/remove?ids=' + ids.join(",")).then((resp) => {
        const data = resp.data;
        if (data.success) {
            handleQuery();
        } else {
            message.error(data.message);
        }
    })
}



</script>