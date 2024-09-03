import { DATA_KEY } from "./dataKey"

const DB_Name = 'reader_db'
//操作权限（可读可写）
const DB_limit = 'readwrite'
//数据库DB实例
var DB
//对外对象
var DBObj

export {
    DBObj
}
DBObj = {
    openDB,
    addData,
    getDataByKey,
    updateDB,
    deleteDB,
    closeDB,
    deleteDBAll,
    readAll,
}


//打开数据库
//@param {object} dbName 数据库的名字
//@param {string} storeName 仓库名称
//@return {object} 该函数会返回一个数据库实例
function openDB() {
    return new Promise((resolve) => {
        // 兼容浏览器
        var indexedDB =
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB;
        // 打开数据库，若没有则会创建
        const request = indexedDB.open(DB_Name);

        //数据库打开成功回调
        request.onsuccess = function (event) {
            DB = event.target.result; //数据库对象
            console.log("数据库打开成功");
            resolve(DB);
        };
        //数据库打开失败的回调
        request.onerror = function (event) {
            console.log("数据库打开报错", event);
        };

        //数据库有更新时候的回调
        request.onupgradeneeded = function (event) {
            // 数据库创建或升级的时候会触发
            console.log("onupgradeneeded");
            DB = event.target.result; //数据库对象var objectstore;
            // 创建存储库
            initObjectStore()
            // var objectStore = DB.createObjectStore("signalChat", {
            //     keyPath: "sequenceId",// 这是主键
            //     // autoIncrement: true // 实现自增
            // });
            // // 创建索引，在后面查询数据的时候可以根据索引查        
            // objectStore.createIndex("link", "link", { unique: false });
            // objectStore.createIndex("sequenceId", "sequenceId", { unique: false });
            // objectStore.createIndex("messageType", "messageType", { unique: false, });
        };
    });
}

function initObjectStore() {
    DB.createObjectStore(DATA_KEY.bookList, {
        keyPath: "id",// 这是主键
        // autoIncrement: true // 实现自增
    });
    DB.createObjectStore(DATA_KEY.curBook, {
        keyPath: "id",// 这是主键
        // autoIncrement: true // 实现自增
    });

}

//插入数据
function addData(storeName, data) {
    var request = DB
        .transaction([storeName], DB_limit) // 事务对象 指定表格名称和操作模式 ("只读"或"读写")
        .objectStore(storeName) // 仓库对象
        .add(data);

    request.onsuccess = function (event) {
        console.log("数据写入成功:", event);
    };

    request.onerror = function (event) {
        console.log("数据写入失败:", event);
    };
}

//通过主键读取数据
function getDataByKey(storeName, key) {
    return new Promise((resolve) => {
        var transaction = DB.transaction([storeName]); // 事务
        var objectstore = transaction.objectStore(storeName); // 仓库对象
        var request = objectstore.get(key); // 通过主键获取数据

        request.onerror = function (event) {
            console.log("事务失败:", event);
        };

        request.onsuccess = function () {
            // console.log(event)
            console.log("主键查询结果:", request.result);
            resolve(request.result);
        };
    });
}

//更新数据
function updateDB(storeName, data) {
    var request = DB
        .transaction([storeName], DB_limit) // 事务对象
        .objectStore(storeName) // 仓库对象
        .put(data);

    request.onsuccess = function () {
        console.log("数据更新成功");
    };

    request.onerror = function () {
        console.log("数据更新失败");
    };
}

//通过主键删除数据
function deleteDB(storeName, id) {
    var request = DB
        .transaction([storeName], DB_limit)
        .objectStore(storeName)
        .delete(id);
    request.onsuccess = function () {
        console.log("数据删除成功");
    };

    request.onerror = function () {
        console.log("数据删除失败");
    };
}

async function readAll(storeName, callBack) {
    var transaction = DB.transaction([storeName]);
    var store = transaction.objectStore(storeName);
    var cursorRequest = store.openCursor();
    var result = []
    cursorRequest.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            // 获取当前数据项
            var data = cursor.value;
            console.log(data);
            result.push(JSON.parse(data.data))
            // 继续遍历下一个数据项
            cursor.continue();
        } else {
            console.log('遍历完毕');
            // return result
            callBack(result)
        }
    };

    cursorRequest.onerror = function (event) {
        console.error('游标失败', event);
    };
}


//关闭数据库
function closeDB() {
    DB.close();
    console.log("数据库已关闭");
}

//删除数据库
function deleteDBAll() {
    console.log('删除数据库');
    let deleteRequest = window.indexedDB.deleteDatabase(DB_Name);
    deleteRequest.onerror = function (event) {
        console.log("删除失败:", event);
    };
    deleteRequest.onsuccess = function (event) {
        console.log("删除成功:", event);
    };
}

