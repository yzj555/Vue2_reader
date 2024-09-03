<template>
    <div class="content">
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    name: "Content",
    data() {
        return {

        }
    },
    methods: {

    },
}
</script>
<style>
.content {
    height: calc(100vh - 130px);
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>