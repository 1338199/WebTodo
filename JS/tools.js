var $ = function (sel) {
    return document.querySelector(sel);
};
var $All = function (sel) {
    return document.querySelectorAll(sel);
};
function deleteItemDataById(deleteId) {
    // model.flush();
    var data = model.data;
    data.items.forEach(function (itemData,index) {
        if(itemData.id.toString() === deleteId){
            data.items.splice(index,1);
            model.flush();
        }
    })
}

function modifyItemData(modifyId, content) {
    var data = model.data;
    data.items.forEach(function (itemData,index) {
        if(itemData.id.toString() === modifyId){
            data.items[index].msg = content;
            model.flush();
        }
    })
}

/**
 * @return {string}
 */
function ValidDDl(ddl,today) {
    var DA = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var arr = ddl.split('.');
    if(arr.length < 3){
        return today;
    }
    else{
        if (isNaN(arr[0]) || isNaN(arr[1]) || isNaN(arr[2])) {
            return today;
        }
        // 判断月份是否在1-12之间
        if (arr[1] > 12 || arr[1] < 1) {
            return today;
        }
        //判断是否是闰年
        if (isLoopYear(arr[0])) {
            DA[2] = 29;
        }
        //判断输入的日是否超过了当月月份的总天数。
        if (arr[2] > DA[arr[1]]) {
            return today;
        }
        return arr.join('.');

    }
}

function isLoopYear(theYear) {
    return (new Date(theYear, 1, 29).getDate() === 29);
}

function GetItemsById(userId) {

}
