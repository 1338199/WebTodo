var $ = function (sel) {
    return document.querySelector(sel);
};
var $All = function (sel) {
    return document.querySelectorAll(sel);
};
var itemId = 0;
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth()+1;
var day = date.getDate();
var leftNum = 0;
var whichSelected;
var hiddenNums;
window.onload = function init() {
    var time = $('#time');
    time.innerHTML = year+'.'+month+'.'+day;

    //点击添加按钮增加todo
    var add = $('#add'); // todo
    add.addEventListener('click', function(ev) {
        var message =$('.input-todo');
        if (message.value === '') {
            alert('message is empty');
            return;
        }
        addTodo(message.value);
        message.value = '';
    });

    //添加左滑显示删除键
    addDelete();

    //toggle-all按钮
    var toggleAll = $('#check1');
    toggleAll.addEventListener('click',function (ev) {
        var items = $All('.todo-item');
        if(leftNum > 0){

            Array.prototype.forEach.call(items,function (item) {
                if(!item.classList.contains('completed')){
                    item.classList.add('completed');
                    update();
                }
            })
        }
        else{
            Array.prototype.forEach.call(items,function (item) {
                if(item.classList.contains('completed')){
                    item.classList.remove('completed');
                    update();
                }
            })
        }

    });

    //添加complete删除功能
    clearComplete();

    //添加过滤功能
    filtersClick();

    //update
    update();
};

function addTodo(message) {
    var todoList = $('.todo-list');

    var item = document.createElement('div');
    var id = 'item' + itemId++;
    var classname = 'todo-item';

    var today = year+'.'+month+'.'+day;
    item.setAttribute('id', id);
    item.setAttribute('class', classname);
    item.innerHTML = " <img src=\"img/point.jpeg\" id=\"point"+itemId+"\" class=\"point\"/>\n" +
        "                    <span>"+message+"</span>\n" +
        "                    <span class=\"date\">"+today+"</span>";

    //添加删除图标
    var leftslide = false;
    var rightsilde =false;
    addDeleteIcon(leftslide,rightsilde,item);



    var label = item.querySelector('span');
    label.addEventListener('click', function() {
        label.classList.add('editing');

        var edit = document.createElement('input');
        var finished = false;
        edit.setAttribute('type', 'text');
        edit.setAttribute('class', 'edit');
        edit.setAttribute('value', label.innerHTML);

        function finish() {
            if (finished) return;
            finished = true;
            item.removeChild(edit);
            label.classList.remove('editing');
        }

        edit.addEventListener('blur', function() {
            finish();
        });

        edit.addEventListener('keyup', function(ev) {
            if (ev.keyCode === 13) {
                if(this.value===""){
                    alert("Can't be empty");
                    return;
                }
                label.innerHTML = this.value;
                finish();
            }
        });

        item.appendChild(edit);
        edit.focus();
    }, false);

    // item.querySelector('.toggle').addEventListener('change', function() {
    //     updateTodo(id, this.checked);
    // });
    //
    // item.querySelector('.destroy').addEventListener('click', function() {
    //     removeTodo(id);
    // });

    todoList.insertBefore(item, todoList.firstChild);

    //通过point添加toggle交互
    var string = '#point'+itemId;
    var point = $(string);
    addToggle(point);

    //update
    update();
}

function update() {


    //计数item，并完成筛选功能
    var items = $All('.todo-item');
    // var filter = $('.filters li a.selected').innerHTML;
    var item, i;
    var display;
    leftNum = 0;
    //
    for (i = 0; i < items.length; ++i) {
        item = items[i];
        if (!item.classList.contains('completed')) {
            leftNum++;
        }
    }
    //在当前filter下更新显示
    filterItems();

    var count = $('#todo-count');
    if(leftNum>0) {
        count.innerHTML = leftNum + " items left";
    }
    else{
        count.innerHTML = leftNum + " item left";
    }

    //显示当前被隐藏的item数目
    numberOfHidden();

}

addDelete = function () {
    //滑动显示删除键
    var items = $All('.todo-item');
    var leftslide = false;
    var rightsilde =false;
    Array.prototype.forEach.call(items,function (item) {
        addDeleteIcon(leftslide,rightsilde,item);
    });
};

addDeleteIcon = function (leftslide,rightsilde,item) {
    var ifInsert = false;
    var x_start;
    var x_end;
    item.addEventListener('touchstart', function (event) {
        x_start = event.changedTouches[0].pageX;
    });
    item.addEventListener('touchmove', function (ev) {
        var parent = this.parentNode;
        x_end = ev.changedTouches[0].pageX;
        // 左右滑动
        if (x_start - x_end > 10) {
            item.style.width = "80%";
            item.style.display = "inline-block";
            leftslide = true;
        }
        if (x_start - x_end < 10) {
            item.style.width = "100%";
            item.style.display = "block";
            rightsilde = true;
        }
        if (leftslide && !ifInsert) {
            var trash = document.createElement('span');
            trash.style.cursor = "pointer";
            trash.innerHTML = "<img class=\"trash\" src=\"img/trash.jpg\"/>";
            trash.addEventListener('click',function (ev) {
                parent.removeChild(item);
                parent.removeChild(this);
                update();
            });
            if (parent.lastChild === this) {
                parent.appendChild(trash);
            } else {
                parent.insertBefore(trash, this.nextSibling);
            }
            ifInsert = true;
            leftslide = false;
        }
        if (rightsilde && this.nextSibling.nodeName === "SPAN") {
            parent.removeChild(this.nextSibling);
            ifInsert = false;
            rightsilde = false;
        }
    });
};

addToggle = function (toggle) {
    var toggleParent = toggle.parentNode;
    toggle.addEventListener('click',function () {
        if(toggleParent.classList.contains("completed")){
            toggleParent.classList.remove("completed");
            update();
            if(leftNum>0){
                var checkbox = $('#check1');
                checkbox.checked = false;
            }
        }
        else {
            toggleParent.classList.add("completed");
            update();
        }
    })
};

clearComplete = function () {
    var clear = $('#clear-completed');
    clear.addEventListener('click',function (ev) {
        var completes = $All('.completed');
        Array.prototype.forEach.call(completes,function (item){
            var parentComplete = item.parentNode;
            parentComplete.removeChild(item);
        });
    })
};

filtersClick = function () {
    var filters = $All('.filters li a');
    whichSelected = filters[0];
    Array.prototype.forEach.call(filters,function (filter) {
        filter.addEventListener('click',function (ev) {
            whichSelected.classList.remove('selected');
            if(!filter.classList.contains('selected')){
                filter.classList.add('selected');
                whichSelected = filter;
                filterItems();
                update();
            }
        })
    })

};

filterItems = function () {
    if(whichSelected.firstChild.nodeValue === "Active"){
        var items1 = $All('.todo-item');
        Array.prototype.forEach.call(items1,function (item) {
            if(item.classList.contains('completed')
                &&!item.classList.contains('not-show')){
                item.classList.add('not-show');
            }
            else if(!item.classList.contains('completed')
                && item.classList.contains('not-show')){
                item.classList.remove('not-show');
            }
        })
    }else if(whichSelected.firstChild.nodeValue === "All"){
        var items2 = $All('.completed');
        Array.prototype.forEach.call(items2,function (item) {
            if(item.classList.contains('not-show')){
                item.classList.remove('not-show');
            }
        })
    }else{
        var items3 = $All('.todo-item');
        Array.prototype.forEach.call(items3,function (item) {
            if(!item.classList.contains('completed')
                && !item.classList.contains('not-show')){
                item.classList.add('not-show');
            }
            else if(item.classList.contains('completed') && item.classList.contains('not-show')){
                item.classList.remove('not-show');
            }
        })
    }
};

numberOfHidden =function () {
    hiddenNums = 0;
    var items = $All('.todo-item');
    Array.prototype.forEach.call(items,function (item) {
        if(item.classList.contains('not-show')){
            hiddenNums++;
        }
    });
    var hidden = $('#hiddenNum');
    hidden.innerHTML = "Hidden: "+hiddenNums;
};
