<template>
    <a-layout-header class="header">
        <div class="logo" />
        <a-menu v-model:selectedKeys="selectedKeys1" theme="dark" mode="horizontal" :style="{ lineHeight: '64px' }">
            <a-menu-item key="/">
                <router-link to="/">首页</router-link>
            </a-menu-item>

            <a-menu-item key="/admin/ebook">
                <router-link to="/admin/ebook">海洋生物样本书籍</router-link>
            </a-menu-item>            
            
            <a-menu-item key="/admin/category">
                <router-link to="/admin/category">样本分类</router-link>
            </a-menu-item>       

            <a-menu-item key="/about">
                <router-link to="/about">关于我们</router-link>
            </a-menu-item>
        </a-menu>
    </a-layout-header>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
 name: 'the-header'
});
</script>