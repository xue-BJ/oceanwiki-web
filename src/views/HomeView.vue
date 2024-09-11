  <template>
    <div class="home">
      <a-layout style="padding: 24px 0; background: #fff">
        <!-- 左侧菜单栏 -->
        <a-layout-sider width="200" style="background: #fff">
          <a-menu 
            v-model:selectedKeys="selectedKeys" 
            v-model:openKeys="openKeys" 
            mode="inline" 
            style="height: 100%"
          >
            <!-- 欢迎菜单项，点击时显示所有内容 -->
            <a-menu-item key="welcome" @click="handleWelcomeClick">
              <MailOutlined />
              <span>欢迎</span>
            </a-menu-item>

            <!-- 一级菜单 -->
            <a-sub-menu v-for="item in level1" :key="item.id">
              <template v-slot:title>
                <span><UserOutlined />{{ item.name }}</span>
              </template>

              <!-- 二级菜单，点击时过滤内容 -->
              <a-menu-item v-for="child in item.children" :key="child.id" @click="handleMenuClick(child.id)">
                <MailOutlined /><span>{{ child.name }}</span>
              </a-menu-item>
            </a-sub-menu>
          </a-menu>
        </a-layout-sider>

        <!-- 右侧内容展示 -->
        <a-layout-content :style="{ padding: '0 24px', minHeight: '280px' }">
          <div v-if="showWelcome">
            <h2>欢迎来到海洋科普网</h2>
            <p>请从左侧选择想要的类别</p>
          </div>
          <div v-else>
            <a-list 
            item-layout="vertical" 
            size="large" 
            :grid="{ gutter: 20, column: 3 }" 
            :data-source="ebooks"
          >
            <template #renderItem="{ item }">
              <a-list-item :key="item.name">
                <template #actions>
                  <span v-for="{ icon, text } in actions" :key="icon">
                    <component :is="icon" style="margin-right: 8px" />
                    {{ text }}
                  </span>
                </template>
                <a-list-item-meta :description="item.description">
                  <template #title>
                    <a :href="item.href">{{ item.name }}</a>
                  </template>
                  <template #avatar>
                    <a-avatar :src="item.cover" />
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
          </div>
        </a-layout-content>
      </a-layout>
    </div>
  </template>

  <script lang="ts" setup>
  import { StarOutlined, LikeOutlined, MessageOutlined, MailOutlined, UserOutlined } from '@ant-design/icons-vue';
  import axios from 'axios'
  import { Tool } from '@/utils/tool'
  import { onMounted, ref } from 'vue';

  // 定义响应式数据
  const ebooks = ref();
  const level1 = ref();
  const selectedKeys = ref();
  const currentCategoryId = ref(); // 当前选中的 categoryId2
  const showWelcome = ref(true)


  onMounted(() => {
    handleQueryCategory(); // 获取分类信息
  });

  // 欢迎菜单项点击事件，显示所有内容
  const handleWelcomeClick = () => {
    console.log("点击了欢迎，显示欢迎页面");
    showWelcome.value = true
    ebooks.value = []
  };

  // 菜单点击事件，设置当前 categoryId 并获取相应数据
  const handleMenuClick = (category2_id: number) => {
    currentCategoryId.value = category2_id;
    console.log("选中的categoryId2：", currentCategoryId.value);
    handleQueryEbookByCategory(category2_id); // 根据分类获取内容
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

  // 根据 category2Id 获取对应的电子书
  const handleQueryEbookByCategory = (category2_id: number) => {
    showWelcome.value = false;
    axios.get("/ebook/list", {
      params: {
        categoryId2: category2_id,
        page: 1,
        size: 100
      }
    }).then(resp => {
      console.log("根据category2Id获取的电子书：", resp);
      ebooks.value = resp.data.content.list; // 更新数据源
    });
  };

  // 获取分类信息
  const handleQueryCategory = () => {
    axios.get("/category/all").then((resp) => {
      const data = resp.data;
      if (data.success) {
        level1.value = Tool.array2Tree(data.content, 0); // 转换为树形结构
        console.log("数形结构：", level1);
      } else {
        console.log(data.message);
      }
    });
  };



  // 显示的操作按钮
  const actions: Record<string, any>[] = [
    { icon: StarOutlined, text: '156' },
    { icon: LikeOutlined, text: '156' },
    { icon: MessageOutlined, text: '2' },
  ];
  </script>

  <style scoped>
  .ant-avatar {
    width: 50px;
    height: 50px;
    line-height: 50px;
    border-radius: 8%;
    margin: 5px 0;
  }
  </style>
