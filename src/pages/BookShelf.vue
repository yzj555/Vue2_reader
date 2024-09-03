<template>
    <div class="bookShelf" @drop="handleDrop" @dragover="handleDragOver" @dragend="handleDragEnd"
        @dragstart="handleDragStart">

        <div class="bookCover" v-for="item, i in bookList" :key="i" @click="toReader(item)">
            <span class="bookTitle">
                {{ item.title }}
            </span>
        </div>

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

            bookList: {}, //key：md5码，用于标识是否为同一本小说

            sourceText: '',
            currentChapterSplitSymbel: '第.*章',
        }
    },
    created() {
        let that = this
        this.DBObj.readAll(this.DataKey.bookList, (bookData) => {
            if (bookData == null || bookData == '') {
                return
            }
            that.bookList = bookData
            // console.log(that.bookList)
        })
    },
    methods: {
        toReader(item) {
            var data = { id: 1, data: JSON.stringify(item) }
            this.DBObj.updateDB(this.DataKey.curBook, data)
            // localStorage.setItem(this.DataKey.curBook, JSON.stringify(item))
            this.$router.push('/bookReader')
        },

        handleDrop(e) {
            this.lodingStart = true
            e.preventDefault();
            console.log("拖拽：handleDrop")
            this.$nextTick(() => {
                console.log(e)
                const files = e.dataTransfer.files
                if (files == undefined || files.length == 0) {
                    return
                }
                const file = files[0]

                if (!file.name.endsWith(".txt")) {
                    this.$message.warning("不是文本文件（*.txt）")
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
                            this.updateSourceText(txtString2, file.name);
                            this.overlay = false
                            this.lodingStart = false
                        };

                    } else {
                        this.updateSourceText(dataStr, file.name)
                        this.overlay = false
                        this.lodingStart = false
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