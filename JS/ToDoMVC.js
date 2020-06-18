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
var calendarYear;
var calendarMonth;


window.onload = function init() {

    //添加日历功能
    addDate();
    document.getElementById("next").onclick = function(){
        date.setMonth(date.getMonth() + 1); //当点击下一个月时 对当前月进行加1;
        addDate(); //重新执行渲染 获取去 改变后的 年月日 进行渲染;
    };
    document.getElementById("prev").onclick = function(){
        date.setMonth(date.getMonth() - 1); //与下一月 同理
        addDate();
    };

    var time = $('#time');
    time.innerHTML = year+'.'+month+'.'+day;

    //点击添加按钮增加todo
    var add = $('#add'); // todo
    var today = year+'.'+month+'.'+day;
    add.addEventListener('click', function(ev) {
        var ddl = prompt("The item ends at(xxxx.x.x)",today);
        var message =$('.input-todo');
        if (message.value === '') {
            alert('message is empty');
            return;
        }
        addTodo(message.value,ddl);
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

    //添加sort功能
    sortInteract();

    //update
    update();
};

function addTodo(message,ddl) {
    var todoList = $('.todo-list');

    var item = document.createElement('div');
    var id = 'item' + itemId++;
    var classname = 'todo-item';

    item.setAttribute('id', id);
    item.setAttribute('class', classname);
    item.innerHTML = " <img src=\"img/point.jpeg\" class=\"point\"/>\n" +
        "                    <span>"+message+"</span>\n" +
        "                    <span class=\"date\">"+ddl+"</span>";

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

    todoList.insertBefore(item, todoList.firstChild);

    addToggle();

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

    //更新日历显示
    addDate();

    //更新今日提醒
    itemToday();

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

addToggle = function () {
    var toggles = $All('.point');
    Array.prototype.forEach.call(toggles,function (toggle) {
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
    });
};

clearComplete = function () {
    var clear = $('#clear-completed');
    clear.addEventListener('click',function (ev) {
        var completes = $All('.completed');
        Array.prototype.forEach.call(completes,function (item){
            var parentComplete = item.parentNode;
            if(item.nextSibling.nodeName==="SPAN"){
                parentComplete.removeChild(item.nextSibling);
            }
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

//item和其后的deleteIcon(如果有)都要过滤
filterItems = function () {
    if(whichSelected.firstChild.nodeValue === "Active"){
        var items1 = $All('.todo-item');
        Array.prototype.forEach.call(items1,function (item) {
            if(item.classList.contains('completed')
                &&!item.classList.contains('not-show')){
                item.classList.add('not-show');
                item.style.display = "none";
                if(item.nextSibling.nodeName === 'SPAN'){
                    item.nextSibling.classList.add('not-show');
                }
            }
            else if(!item.classList.contains('completed')
                && item.classList.contains('not-show')){
                item.classList.remove('not-show');
                item.style.display = "inline-block";
                if(item.nextSibling.nodeName === 'SPAN'){
                    item.nextSibling.classList.remove('not-show');
                }
            }
        })
    }else if(whichSelected.firstChild.nodeValue === "All"){
        var items2 = $All('.todo-item');
        Array.prototype.forEach.call(items2,function (item) {
            if(item.classList.contains('not-show')){
                item.classList.remove('not-show');
                item.style.display = "inline-block";
                if(item.nextSibling.nodeName === 'SPAN'){
                    item.nextSibling.classList.remove('not-show');
                }
            }
        })
    }else{
        var items3 = $All('.todo-item');
        Array.prototype.forEach.call(items3,function (item) {
            if(!item.classList.contains('completed')
                && !item.classList.contains('not-show')){
                item.classList.add('not-show');
                item.style.display = "none";
                if(item.nextSibling.nodeName === 'SPAN'){
                    item.nextSibling.classList.add('not-show');
                }
            }
            else if(item.classList.contains('completed') && item.classList.contains('not-show')){
                item.classList.remove('not-show');
                item.style.display = "inline-block";
                if(item.nextSibling.nodeName === 'SPAN'){
                    item.nextSibling.classList.remove('not-show');
                }
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

addDate = function(){
    document.getElementById('date').innerHTML = "";

    var nian = date.getFullYear();//当前年份
    var yue = date.getMonth(); //当前月
    var arr=["January","February","March","April","May","June","July","August","September","October","November","December"];
    document.getElementById('nian').innerText = nian;
    calendarYear = nian;
    document.getElementById('yue').innerText = arr[yue];
    calendarMonth = yue;

    var setDat = new Date(nian,yue + 1,1 - 1); //把时间设为下个月的1号 然后天数减去1 就可以得到 当前月的最后一天;
    var setTian = setDat.getDate(); //获取 当前月最后一天
    var setZhou = new Date(nian,yue,1).getDay(); //获取当前月第一天 是 周几

    for(var i=0;i<setZhou ;i++){//渲染空白 与 星期 对应上
        var li=document.createElement('li');
        document.getElementById('date').appendChild(li);
    }
    var dateString;
    for(var i=1;i<=setTian;i++){//利用获取到的当月最后一天 把 前边的 天数 都循环 出来
        var li=document.createElement('li');
        li.innerText = i;
        var items = $All('.todo-item');
        dateString = nian+'.'+(yue+1)+'.'+i;

        Array.prototype.forEach.call(items,function (item) {
            if(dateString === item.childNodes.item(5).innerHTML){
                li.classList.add('hasTodo');
            }
        });
        if(nian === year && yue === month-1 && i === day){
            li.classList.add("active");
        }else{
            li.classList.add("hover");
        }

        document.getElementById('date').appendChild(li);
    }
    var lis = $All('#date li');
    Array.prototype.forEach.call(lis,function (dateli) {
        dateli.addEventListener('click',function (ev) {
            var dateFilter = $('#dateFilter');
            var string = calendarYear+'.'+(calendarMonth+1)+'.'+dateli.innerHTML;
            dateFilter.innerHTML = "Todo items end at "+string + " <div id=\"selectedItem\">\n" +
                "            </div>";
            var seletedDates = $('#selectedItem');
            Array.prototype.forEach.call(items,function (item) {
                if(string === item.childNodes.item(5).innerHTML){
                    seletedDates.innerHTML =seletedDates.innerHTML+item.childNodes.item(3).innerHTML+"<br/>";
                }
            });
        });
    })
};
compare = function (date1,date2) {
    var dateArr1 = date1.split('.');
    var dateArr2 = date2.split('.');
    if(dateArr1[0] < dateArr2[0]){
        return true;
    }else if(dateArr1[0] === dateArr2[0] && dateArr1[1] < dateArr2[1]){
        return true;
    }else if(dateArr1[1] === dateArr2[1] && dateArr1[2] < dateArr2[2]){
        return true;
    }
    else{
        return false;
    }
};
sortInteract = function () {
    var sortClick = $('#sort');
    sortClick.addEventListener('click',function (ev) {
        var items = $All('.todo-item');
        for(var i = 0;i <items.length-1;i++){
            (function(item) {
                for(var j = 1; j<items.length;j++){
                    (function (item2) {
                        if(!compare(item.childNodes.item(5).innerHTML,item2.childNodes.item(5).innerHTML)){
                            var tmp = items[i].innerHTML;
                            items[i].innerHTML = items[j].innerHTML;
                            items[j].innerHTML = tmp;
                        }
                    })(items[j])
                }
            })(items[i])
        }
        addToggle();
    });
};
itemToday = function () {
    var today = year+'.'+month+'.'+day;
    var endToday = $('#endToday');
    endToday.innerHTML = "<img src=\"img/warn.png\" id=\"warning\"/>\n" +
        "            ToDo Items Which End Toddy" + " <div id=\"toDayItem\">\n" +
        "            </div>";
    var toDayItem = $('#toDayItem');
    var items = $All('.todo-item');
    Array.prototype.forEach.call(items,function (item) {
        if(today === item.childNodes.item(5).innerHTML){
            toDayItem.innerHTML =toDayItem.innerHTML+item.childNodes.item(3).innerHTML+"<br/>";
        }
    });
};

