<template>
    <div id="main-view">
        <div class="theme_bg"></div>
        <Header></Header>
        <Content></Content>
        <Footer></footer>
    </div>
</template>

<script>
export default {
    name: 'MainView'
}
</script>
<style>
.theme_bg {
    /*固定样式*/
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: -1;
    /** 变化样式 */
    /* background-image: url(../img/bg1.jpeg); */
    background-size: cover;
    /* background-size: 100% 100%; */
    /* filter: blur(1px); */
    /* transition: opacity 0.5s ease-in-out; 透明度变化动画 */
    /* opacity: 0.3; */
    background-color: rgba(190, 221, 247, 1);
    border-radius: 10px;
}

</style>