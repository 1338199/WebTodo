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
        if(itemData.id === deleteId){
            data.items.splice(index,1);
            model.flush();
        }
    })
}

function modifyItemData(modifyId, content) {
    var data = model.data;
    data.items.forEach(function (itemData,index) {
        if(itemData.id === modifyId){
            data.items[index].msg = content;
            model.flush();
        }
    })
}