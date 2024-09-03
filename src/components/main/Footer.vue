<template>
    <div class="footer-style">
        <v-bottom-navigation style="height: 100%; background-color: rgb(255, 255, 255, 0.8);">
            <router-link to="/"><v-btn>首页</v-btn></router-link>
            <router-link to="/bookShelf"><v-btn>书架</v-btn></router-link>
        </v-bottom-navigation>
    </div>
</template>
<script>
export default {
    name: "Footer"
}
</script>

<style>
.footer-style {
    height: 40px;
    bottom: -60px;
    background-color: rgba(227, 242, 255, 0.1) !important;
    font-size: 150% !important;
    position: relative;
}
</style>