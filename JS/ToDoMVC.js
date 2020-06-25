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
    model.init(function () {

        //根据登录用户名设定pagetitle
        var pagetile = $('#pagetitle');
        pagetile.innerHTML = window.localStorage.username + "'s ToDo";

        //绑定登出功能
        var logout = $('#avatar');
        logout.addEventListener('click',function (ev) {
            window.localStorage.username = null;
            window.localStorage.userId = null;
            window.location.href = "login.html";
        });

        var data = model.data;
        console.log(data);
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

        //为添加按钮绑定添加事件
        var add = $('#add'); // todo
        var today = year+'.'+month+'.'+day;
        add.addEventListener('click', function(ev) {
            var ddl = prompt("The item ends at(xxxx.x.x)",today);
            var message =$('.input-todo');
            if (message.value === '') {
                alert('message is empty');
                return;
            }
            ddl = ValidDDl(ddl,today);
            data.msg = message.value;
            // model.flush();
            console.log('id',data.id);
            var id = data.items.length;
            data.items.push({msg:data.msg,dateStr:ddl,completed:false,id:id,userId:window.localStorage.userId});
            data.msg = '';
            console.log('data',data);
            update();


            message.value = '';
        });

        //添加左滑显示删除键
        addDelete();

        //添加complete删除功能
        clearComplete();

        //添加过滤功能
        filtersClick();

        //添加sort功能
        sortInteract();

        //update
        update();

        //添加toggleAll
        toggleAll(data);
    });

};

function addTodo(message,ddl,completed,id) {
    var todoList = $('.todo-list');

    var item = document.createElement('div');

    var classname = 'todo-item';

    item.setAttribute('id', id);
    item.setAttribute('class', classname);
    item.innerHTML = " <img src=\"img/point.jpeg\" class=\"point\"/>\n" +
        "                    <span>"+message+"</span>\n" +
        "                    <span class=\"date\">"+ddl+"</span>";

    if(completed){
        item.classList.add('completed');
    }


    //添加删除图标
    var leftslide = false;
    var rightsilde =false;
    addDeleteIcon(leftslide,rightsilde,item);

    todoList.insertBefore(item, todoList.firstChild);

    addEdit();

    return item;
}

function update() {
    // 更新服务器的数据
    model.flush();

    // 获取全局变量model中的数据
    let data = model.data;

    //计数item，并完成筛选功能
    var items = $All('.todo-item');

    leftNum = 0;
    var todoList = $('.todo-list');
    todoList.innerHTML = '';

    data.items.forEach(function (itemData,index) {
        if(itemData.userId === window.localStorage.userId){
            var item = addTodo(itemData.msg,itemData.dateStr,itemData.completed,itemData.id);

            //添加toggle功能
            var toggle = item.querySelector(".point");
            console.log(toggle);
            toggle.addEventListener('click',function () {
                if(!itemData.completed) {
                    itemData.completed = true;
                    item.classList.add('completed');
                    filterItems();
                    leftNum--;
                    model.flush();
                    //更新item数
                    updateCnt();
                }else{
                    itemData.completed = false;
                    item.classList.remove('completed');
                    filterItems();
                    leftNum++;
                    model.flush();
                    updateCnt();
                    //更新toggleAll
                    var toggleAll = $('#check1');
                    toggleAll.checked = false;
                }
            });

            if(!itemData.completed){
                leftNum++;
            }
        }
    });

    //在当前filter下更新显示
    filterItems();

    //更新cnt
    updateCnt();

    //更新日历显示
    addDate();

    //更新今日提醒
    itemToday();

}

updateCnt = function(){
    var count = $('#todo-count');
    if(leftNum>0) {
        count.innerHTML = leftNum + " items left";
    }
    else{
        count.innerHTML = leftNum + " item left";
    }
};

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
    var x_start;
    var x_end;
    item.addEventListener('touchstart', function (event) {
        x_start = event.changedTouches[0].pageX;
    });
    item.addEventListener('touchend', function (ev) {
        var parent = this.parentNode;
        x_end = ev.changedTouches[0].pageX;
        // 左右滑动
        if (x_start - x_end > 10) {
            item.style.width = "80%";
            item.style.display = "inline-block";
            leftslide = true;
        }
        if (x_start - x_end < -10) {
            item.style.width = "100%";
            item.style.display = "block";
            rightsilde = true;
        }
        if (leftslide) {
            var trash = document.createElement('span');
            trash.style.cursor = "pointer";
            trash.innerHTML = "<img class=\"trash\" src=\"img/trash.jpg\"/>";
            trash.addEventListener('click',function (ev) {
                console.log("click");
                parent.removeChild(item);
                deleteItemDataById(item.getAttribute("id"));
                parent.removeChild(this);
                update();
            });
            if (parent.lastChild === this) {
                parent.appendChild(trash);
            } else {
                parent.insertBefore(trash, this.nextSibling);
            }
            leftslide = false;
        }
        if(this.nextSibling!==null) {
            if (rightsilde && this.nextSibling.nodeName === "SPAN") {
                parent.removeChild(this.nextSibling);
                rightsilde = false;
            }
        }
    });
};


clearComplete = function () {
    var clear = $('#clear-completed');
    clear.addEventListener('click',function (ev) {
        var completes = $All('.completed');
        Array.prototype.forEach.call(completes,function (item){
            var parentComplete = item.parentNode;
            parentComplete.removeChild(item);
            deleteItemDataById(item.getAttribute("id"));
            if(item.nextSibling!==null) {
                if (item.nextSibling.nodeName === "SPAN") {
                    parentComplete.removeChild(item.nextSibling);
                }
            }
        });
        update();
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
                if(item.nextSibling!==null){
                    if(item.nextSibling.nodeName === 'SPAN'){
                        item.nextSibling.classList.add('not-show');
                    }
                }

            }
            else if(!item.classList.contains('completed')
                && item.classList.contains('not-show')){
                item.classList.remove('not-show');
                item.style.display = "inline-block";
                if(item.nextSibling!==null){
                    if(item.nextSibling.nodeName === 'SPAN'){
                        item.nextSibling.classList.remove('not-show');
                    }
                }

            }
        })
    }else if(whichSelected.firstChild.nodeValue === "All"){
        var items2 = $All('.todo-item');
        Array.prototype.forEach.call(items2,function (item) {
            if(item.classList.contains('not-show')){
                item.classList.remove('not-show');
                item.style.display = "inline-block";
                if(item.nextSibling!==null){
                    if(item.nextSibling.nodeName === 'SPAN'){
                        item.nextSibling.classList.remove('not-show');
                    }
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
                if(item.nextSibling!==null){
                    if(item.nextSibling.nodeName === 'SPAN'){
                        item.nextSibling.classList.add('not-show');
                    }
                }

            }
            else if(item.classList.contains('completed') && item.classList.contains('not-show')){
                item.classList.remove('not-show');
                item.style.display = "inline-block";
                if(item.nextSibling!==null){
                    if(item.nextSibling.nodeName === 'SPAN'){
                        item.nextSibling.classList.remove('not-show');
                    }
                }

            }
        })
    }
    numberOfHidden();
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
        addEdit();
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
addEdit = function () {
 var items = $All('.todo-item');
 console.log(items);
 Array.prototype.forEach.call(items,function (item) {
     var label = item.querySelector('span');
     // console.log(label);
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
                 modifyItemData(item.getAttribute("id"),this.value);
                 finish();
             }
         });

         item.appendChild(edit);
         edit.focus();
     }, false);
 })
};
toggleAll = function () {
    model.flush();
    //更新toggleAll
    var data = model.data;
    console.log(data);
    var toggleAll = $('#check1');
    toggleAll.addEventListener('click',function (ev) {
        var items = $All('.todo-item');
        console.log('click');
        if(leftNum > 0){
            data.items.forEach(function (itemData) {
                if(!itemData.completed) {
                    itemData.completed = true;
                    leftNum--;
                }
            });
            items.forEach(function (item) {
                if(!item.classList.contains('completed')) {
                    item.classList.add('completed');
                    filterItems();
                }
            });
            updateCnt();
        }
        else{
            data.items.forEach(function (itemData) {
                if(itemData.completed) {
                    itemData.completed = false;
                    leftNum++;
                }
            });
            items.forEach(function (item) {
                if(item.classList.contains('completed')) {
                    item.classList.remove('completed');
                    filterItems();
                }
            });
            updateCnt();
        }

    });
};
