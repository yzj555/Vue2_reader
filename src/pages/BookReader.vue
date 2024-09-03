<template>
    <div class="read-page" @mouseover="showApp" @mouseleave="hiddenApp"
        :style="'opacity: ' + bgOpacity + '; background-color: rgba(' + bgColorList[bgColorIndex].baColor + '); '">
        <!-- this is reader!<br /> -->
        <v-lazy>
            <div id="textArea" class="textContent" @click="settingInto" @scroll="handleScroll">
                <div class="chaper" :id="`chaper-${i}`" v-for="item, i in currBook.chapterContent" :key="i">
                    <span style="font-size: 120%; text-align: left; font-weight: 500;">{{ currBook.chapterName[i]
                    }}</span><br>
                    {{ item }}
                </div>
                <!-- {{ currBook.chapterContent }} -->
            </div>
        </v-lazy>
        <v-app-bar class="opBg" :value="opTopFlag"
            :style="`top: 0; position: absolute; height: 40px; background-color: rgba(${bgColorList[bgColorIndex].baColor}) !important;`">
            <v-btn @click="goBack" large icon style="top:-10px; left: -5px;">
                <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
        </v-app-bar>
        <!-- 设置 -->
        <v-bottom-navigation class="opBg"
            :style="`height: 60px; padding: auto; position: absolute; bottom: 0; background-color: rgba(${bgColorList[bgColorIndex].baColor}) !important;`"
            :input-value="opTopFlag" fixed grow>
            <v-btn @click="showChapter">
                <span>目录</span>
                <v-icon>mdi-book-open-variant-outline</v-icon>
            </v-btn>
            <v-btn>
                <span>夜间</span>
                <v-icon>mdi-moon-new</v-icon>
            </v-btn>
            <v-btn @click="settingFlag = !settingFlag">
                <span>设置</span>
                <v-icon>mdi-cog-outline</v-icon>
            </v-btn>
            <v-navigation-drawer class="opBg read-setting" fixed floating bottom v-model="settingFlag"
                :style="`background-color: rgba(${bgColorList[bgColorIndex].baColor}) !important;`">
                <div style="display: flex;">
                    <v-row justify="space-around">
                        <div class="setting-op-style">背景：</div>
                        <!-- <div class="setting-bg-color" v-for="item, i in bgColorList" :key="i"
                            :style="`background-color: rgba(${item.baColor})`" @click="bgColorIndex = i"></div> -->
                        <v-color-picker class="ma-2" flat hide-canvas hide-inputs style="z-index: 999;"></v-color-picker>
                    </v-row>
                </div>
            </v-navigation-drawer>
        </v-bottom-navigation>
        <v-lazy>
            <!-- 章节列表 -->
            <v-navigation-drawer class="opBg"
                :style="`width: 40%; min-width: 200px; max-width: 300px; background-color: rgba(${bgColorList[bgColorIndex].baColor}) !important;`"
                absolute v-model="chapFlag">
                <v-list nav>
                    <v-list-item class="chaperName" v-for="item, i in currBook.chapterName" :key="i"
                        :id="`chaperName-${i}`">
                        <v-list-item-title v-if="currBook.chapIndex == i"
                            style="text-align: left !important; color: rgb(133, 93, 44); font-weight: bold;"
                            @click="selectChaper(i)">{{ item
                            }}</v-list-item-title>
                        <v-list-item-title v-else style="text-align: left !important; color: rgb(88, 76, 62);"
                            @click="selectChaper(i)">{{ item
                            }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-navigation-drawer>
        </v-lazy>

        <v-overlay :value="lodding">
            <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        </v-overlay>
    </div>
</template>
<script>
export default {
    name: "BookReader",
    data() {
        return {
            lodding: false,
            currBook: {},
            opTopFlag: false,
            chapFlag: false,
            settingFlag: false,
            bgOpacity: 1.0,
            bgColorIndex: 0,
            bgColorList: [
                { color: 'black', baColor: '146, 136, 109, 1' }, //黄色
                { color: 'black', baColor: '142, 170, 159, 1' }, //绿色
                { color: 'black', baColor: '151, 176, 197, 1' }, //蓝色
                { color: 'black', baColor: '212, 212, 212, 1' }, //白色
                // { color: 'black', baColor: '48, 48, 48, 1' }, //近黑色
                { color: 'black', baColor: '0, 0, 0, 0' },//透明
            ]
        }
    },
    created() {
        this.lodding = true
        let that = this
        this.DBObj.getDataByKey(this.DataKey.curBook, 1).then((data) => {
            console.log(data);
            that.currBook = JSON.parse(data.data)
            let other = that
            that.$nextTick(() => {
                //滚动到历史位置
                document.getElementById('textArea').scroll(other.currBook.position.x, other.currBook.position.y)
                this.lodding = false
            })
        }).catch(function (error) {
            console.error(error);
        });
    },
    mounted() {
    },
    methods: {
        settingInto() {
            this.opTopFlag = !this.opTopFlag
        },
        goBack() {
            this.$router.go(-1)
        },
        hiddenApp() {
            console.log('鼠标移出')
            this.bgOpacity = 0
        },
        showApp() {
            console.log('鼠标移入')
            this.bgOpacity = 1
        },
        // 滚动事件的回调函数
        handleScroll(event) {
            // 获取元素当前滚动的位置
            const scrollTop = event.target.scrollTop;
            const scrollLeft = event.target.scrollLeft;

            // // 在这里编写你想要执行的代码
            // console.log('Scroll position:', scrollTop, scrollLeft);
            this.currBook.position.x = scrollLeft
            this.currBook.position.y = scrollTop
            // 获取所有锚点元素
            const allAnchors = document.querySelectorAll('.chaper')
            // 筛选出当前可见的锚点元素
            const visibleAnchors = Array.prototype.filter.call(allAnchors, anchor => {
                const rect = anchor.getBoundingClientRect();
                const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
                const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
                return (
                    rect.top < windowHeight &&
                    rect.left < windowWidth &&
                    rect.bottom > 0 &&
                    rect.right > 0
                );
            });
            // // 输出可见的锚点元素
            // console.log('当前锚点：', visibleAnchors[0].id);
            var chaperStr = visibleAnchors[0].id.replace('chaper-', '')
            if (this.currBook.chapIndex != Number.parseInt(chaperStr)) {
                this.currBook.chapIndex = Number.parseInt(chaperStr)
            }
            //更新当前数据
            var curData = { id: 1, data: JSON.stringify(this.currBook) }
            this.DBObj.updateDB(this.DataKey.curBook, curData)
            //更新总数据
            var data = { id: this.currBook.md5Value, data: JSON.stringify(this.currBook) }
            this.DBObj.updateDB(this.DataKey.bookList, data)

        },
        showChapter() {
            document.getElementById(`chaperName-${this.currBook.chapIndex}`).scrollIntoView()
            this.opTopFlag = false
            this.chapFlag = true
        },
        selectChaper(index) {
            //滚动到指定
            document.getElementById(`chaper-${index}`).scrollIntoView()
            this.currBook.chapIndex = index

            // const scrollableElement = document.getElementById('textArea');
            // this.handleScroll(scrollableElement)
            //收齐左侧列表
            this.chapFlag = false
        }
    },
}
</script>

<style>
.textContent {
    height: 100vh;
    overflow: scroll;
    overflow-x: hidden;
    letter-spacing: 2px;
    padding: 8px;
    color: rgb(61, 45, 25);
    /* font-weight: bold; */
    line-height: 40px;
    font-size: 130%;

    /* Safari */
    -webkit-user-select: none;
    /* Firefox */
    -moz-user-select: none;
    /* IE/Edge */
    -ms-user-select: none;
    /* 标准语法 */
    user-select: none;
}

.theme--dark.v-btn.v-btn--has-bg {
    background-color: none;
    height: auto;
}

.chaperName:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

/* .opBg, */
.opBg button {
    background-color: rgba(163, 151, 138, 0) !important;
}

.opBg button {
    /* padding-top: 5px !important; */
    height: 100% !important;
}

.read-setting {
    bottom: 60px !important;
    box-shadow: none !important;
    height: 250px !important;
    border-top: 1px solid rgba(104, 104, 103, 0.1);
    border-bottom: 1px solid rgba(104, 104, 103, 0.1);
}

.read-page {
    background-color: rgb(48, 48, 48);
}

.setting-op-style {
    width: 50px;
    height: 30px;
    margin: 10px;
    margin-top: 20px;
    margin-left: 20px;
}

.setting-bg-color {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid rgb(100, 100, 100);
    /* float: left; */
    margin: 3px;
    margin-top: 20px;
}
</style>