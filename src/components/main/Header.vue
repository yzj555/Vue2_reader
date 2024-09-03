<template>
    <div class="header-style">
        <div class="head-left">
            {{ title }}
        </div>
        <div class="head-right">
            <v-btn icon @click="minApp" style="-webkit-app-region: no-drag">
                <v-icon color="rgb(128,132,142)">mdi-minus</v-icon>
            </v-btn>
            <v-btn icon @click="closeApp" style="-webkit-app-region: no-drag">
                <v-icon color="rgb(128,132,142)">mdi-close-circle-outline</v-icon>
            </v-btn>
        </div>
    </div>
</template>
<script>
// import { getCurrentWindow } from '@electron/remote'
import { ipcRenderer } from 'electron'
export default {
    name: "Header",
    props: {
        title: {
            type: String,
            default: '阅读器'
        }
    },
    methods: {
        minApp() {
            // console.log(getCurrentWindow())
            // getCurrentWindow().minimize()
            //发送最小化命令
            ipcRenderer.send('window-min');
        },
        closeApp() {
            // getCurrentWindow().close()
            ipcRenderer.send('window-quit');
        },
    },
}
</script>

<style>
.header-style {
    height: 30px;
    background-color: rgba(246, 250, 254, 0.9);
    user-select: none;
    -webkit-user-select: none;
    -webkit-app-region: drag;
}

.head-left {
    width: 40%;
    position: relative;
    text-align: left;
    /* margin: auto; */
    top: 5px;
    left: 5px;
}

.head-right {
    /* width: 40%; */
    position: relative;
    float: right;
    top: -22px;
}
</style>