<template>
    <div class="bookShelf" @drop="handleDrop($event, true)" @dragover="handleDragOver" @dragend="handleDragEnd"
        @dragstart="handleDragStart">
        <!-- <span v-if="Object.keys(bookList).length == 0"
            style="font-size: 160%; font-weight: 500; color: rgb(99, 99, 99);">拖放文件到此处</span> -->
        <div class="bookCover" v-for="item, i in bookList" :key="i" @click="toReader(item)"
            @contextmenu="handleRightClick($event, item)">
            <span class="bookTitle">
                {{ item.title }}
            </span>
        </div>
        <div class="bookAdd">
            <!-- <span>
                +
            </span> -->
            <v-file-input hide-input prepend-icon="mdi-plus" @change="handleDrop($event, false)">

            </v-file-input>
        </div>
        <v-menu :value="showMenu" :position-x="menuPosition.X" :position-y="menuPosition.Y" absolute offset-y>
            <v-list dense dark>
                <v-list-item dense @click="delBook"> 删除 </v-list-item>
            </v-list>
        </v-menu>
        <v-overlay :value="overlay">
            <span v-if="!lodingStart" style="font-size: 160%; font-weight: 500;">拖放文件到此处</span>
            <v-progress-circular v-if="lodingStart" indeterminate size="64"></v-progress-circular>
        </v-overlay>
    </div>
</template>
<script>
import { md5 } from 'js-md5';

export default {
    name: "BookShelf",
    data() {
        return {
            overlay: false,
            lodingStart: false,
            reLoad: false,

            showMenu: false,
            menuPosition: { X: 0, Y: 0, },
            menuBook: {},

            bookList: {}, //key：md5码，用于标识是否为同一本小说

            sourceText: '',
            currentChapterSplitSymbel: '第.*章',
        }
    },
    created() {
        this.loadAll()
    },
    watch: {
        reLoad(newVal) {
            if (newVal) {
                this.loadAll()
                this.reLoad = false
            }
        }
    },
    methods: {
        handleRightClick(e, item) {
            e.preventDefault(); // 阻止默认的右键菜单显示
            console.log("123")
            this.showMenu = false
            this.menuPosition.X = e.clientX
            this.menuPosition.Y = e.clientY
            let that = this
            this.$nextTick(() => {
                that.menuBook = item
                that.showMenu = true
            })
        },

        toReader(item) {
            var data = { id: 1, data: JSON.stringify(item) }
            this.DBObj.updateDB(this.DataKey.curBook, data)
            // localStorage.setItem(this.DataKey.curBook, JSON.stringify(item))
            this.$router.push('/bookReader')
        },

        loadAll() {
            let that = this
            this.DBObj.readAll(this.DataKey.bookList, (bookData) => {
                if (bookData == null || bookData == '') {
                    that.bookList = {}
                    return
                }
                that.bookList = bookData
                console.log(that.bookList)
            })
        },
        handleDrop(e, isDrop) {
            this.lodingStart = true
            console.log("拖拽：handleDrop:", e)
            if (isDrop) {
                e.preventDefault();
            }
            let that = this
            this.$nextTick(() => {
                console.log(e)
                var file
                if (isDrop) {
                    const files = e.dataTransfer.files
                    if (files == undefined || files.length == 0) {
                        that.lodingStart = false
                        return
                    }
                    file = files[0]
                }else{
                    file = e
                }

                if (!file.name.endsWith(".txt")) {
                    that.$message.warning("不是文本文件（*.txt）")
                    that.lodingStart = false
                    return
                }

                const fileReader_gb312 = new FileReader()
                fileReader_gb312.readAsText(file, 'gb2312')
                fileReader_gb312.onload = (e) => {
                    const dataStr = e.target.result

                    // utf-8 的 中文编码 正则表达式
                    // 说明：如果是乱码的话，应该是不会出现"的地得"的，因为这几个字比较常用
                    // (算是临时解决方案，因为不想专门引用一个库，先用着看看效果)
                    const patrn = /[的地得]/gi;
                    // 检测当前文本是否含有中文（如果没有，则当乱码处理）
                    // 两个格式的英文编码一样，所以纯英文文件也当成乱码再处理一次
                    if (!patrn.exec(dataStr.substring(0, 1000))) {
                        const reader_utf8 = new FileReader();
                        // 再拿一次纯文本，这一次拿到的文本一定不会乱码
                        reader_utf8.readAsText(file, 'utf-8');
                        reader_utf8.onload = (e2) => {
                            if (e2.target === null) return;
                            const txtString2 = e2.target.result;
                            that.updateSourceText(txtString2, file.name);
                            that.overlay = false
                            that.lodingStart = false
                        };

                    } else {
                        that.updateSourceText(dataStr, file.name)
                        that.overlay = false
                        that.lodingStart = false
                    }
                }

            })
        },
        handleDragOver(e) {
            e.preventDefault();
            console.log("拖拽：handleDragOver")
            this.overlay = true
        },
        handleDragEnd(e) {
            e.preventDefault();
            console.log("拖拽：handleDragEnd")
        },
        handleDragStart(e) {
            e.preventDefault();
            console.log("拖拽：handleDragStart")
        },
        handleDragEnter(e) {
            e.preventDefault();
            console.log("拖拽：handleDragEnter")
            this.overlay = true
        },
        handleDragLeave(e) {
            e.preventDefault();
            console.log("拖拽：handleDragLeave")
            // this.overlay = false
        },
        /**
         * 更新源文本(相当于打开一本新的小说, 重新初始化)
         * @param text 文本
         * @returns
         */
        updateSourceText(text, fileName) {
            this.sourceText = text;
            // 计算MD5
            const md5Value = md5(text);

            const regExp = new RegExp(
                `(?=${this.currentChapterSplitSymbel})`,
                'g',
            );
            // const regExp = new RegExp(
            //     `^.?(===)第(.{1,5})[章部集卷节篇回].{0,24}(===)`,
            //     'g',
            // );
            const chapterList = text.split(regExp);
            if (!chapterList) return;
            var curBook = {
                title: fileName.replace(".txt", ""),
                chapterName: [],
                chapterContent: [],
            }
            chapterList.forEach((chapter) => {
                let paragraphList = chapter.split(/(\r\n|\r|\n)/g);
                paragraphList = paragraphList.filter((item) => {
                    return item.trim().length > 0;
                });
                const content = paragraphList.join(this.paragraphSplitSymbel);
                // console.log(paragraphList[0]?.substring(0, 30))
                // console.log(content.split(this.splitSymbelRegExp))
                //章节名称
                let chapterName = paragraphList[0]?.substring(0, 30)
                curBook.chapterName.push(chapterName)
                //章节正文
                let chapterContent = content.split(this.splitSymbelRegExp)
                curBook.chapterContent.push(chapterContent)
            });
            console.log(curBook)
            curBook.md5Value = md5Value
            curBook.chapIndex = 0
            curBook.position = { x: 0, y: 0 }
            this.bookList[md5Value] = curBook
            // this.updateChapterIndex(0, false);
            // this.save();
            // this.saveBookData()
            var data = { id: md5Value, data: JSON.stringify(curBook) }
            this.DBObj.updateDB(this.DataKey.bookList, data)
            this.reLoad = true
        },

        delBook() {
            console.log(this.menuBook.md5Value)
            // delete this.bookList[this.menuBook.md5Value]
            this.DBObj.deleteDB(this.DataKey.bookList, this.menuBook.md5Value)
            this.reLoad = true
            // let that = this
            // this.$nextTick(()=>{
            //     that.loadAll()
            // })
        },

        saveBookData() {
            localStorage.setItem(this.DataKey.bookList, JSON.stringify(this.bookList))
        }
    },
}
</script>
<style>
.bookShelf {
    width: 95vw;
    height: calc(100vh - 130px);
    text-align: center;
}

.bookAdd {
    float: left;
    width: 70px;
    height: 100px;
    margin: 10px;
    display: flex;
    /* border: 1px black solid; */
    /* align-items: center; */
    color: aliceblue;
    padding-left: 25px;
    /* padding-top: 20px !important; */
    font-size: 200%;
    background-color: rgba(92, 86, 78, 0.3);
    box-shadow: 5px 5px 10px 0px rgba(0, 0, 0, 0.6) !important;
}

.bookCover {
    float: left;
    width: 70px;
    height: 100px;
    margin: 10px;
    /* background-image: url(../img/bookCover.jpg); */
    /* background-size: 100% 100%; */
    /* transform: rotate(180deg); */
    background-color: rgba(219, 164, 92, 0.8);
    display: flex;
    /* 文本垂直居中 */
    align-items: center;
    box-shadow: 10px 10px 10px 0px rgba(0, 0, 0, 0.6) !important;
}

.bookTitle {
    width: 22px;
    height: 88px;
    /* border: solid 1px rgb(255, 255, 255); */
    /* background-color: rgba(0, 0, 0, 0.6); */
    color: rgba(252, 255, 217, 0.705);
    font-weight: 500;
    text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.6);
    /* 从上到下，从右到左 */
    writing-mode: vertical-rl;
    /* 修正文字方向 */
    /* transform: rotate(180deg); */
    margin-left: 15px !important;
    /* padding-left: 3px; */
    padding-right: 2px;
    /* padding-top: 5px; */
    padding-bottom: 5px;
    /* padding-right: 15px; */
    /*超出文本省略*/
    overflow: hidden;
    white-space: nowrap;
    text-overflow: "123"

}
</style>