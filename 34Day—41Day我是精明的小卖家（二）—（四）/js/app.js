let div;
var edit;
var save;
var cancel;
let tempElement;

//创建初始表格，只有表头和空的body部分
function createInitDom() {
    let tempMonth = 12;
    let wrapper = document.getElementById("wrapperDiv");
    let wrapperTable = document.createElement("table");
    wrapperTable.setAttribute("id", "wrapperTable")
    let initHtml = "<thead><tr><th>商品</th><th>地区</th>";
    if (checkedTest().checkRegion === 1 && checkedTest().checkProduct > 1) {
        initHtml = "<thead><tr><th>地区</th><th>商品</th>";
    }
    for (let i = 0; i < tempMonth; i++) {
        initHtml += "<th>" + (i + 1) + "月</th>";
    };
    initHtml += "</tr></thead><tbody id=\"wrapperTbody\"></tbody>";
    wrapperTable.innerHTML = initHtml;
    wrapper.appendChild(wrapperTable);
    
};
createInitDom();
createDom(handleData());

//合并相同的单元格
function conCell(i) {
    let wrapperTable = document.querySelector("table");
    let length = wrapperTable.rows.length;
    (function cao(startIndex) {
        let _rowSpan = 1;
        for (let i = startIndex; i < length; i++) {
            const element = wrapperTable.rows[i];
            if (wrapperTable.rows[i + 1]) {
                const nextElement = wrapperTable.rows[i + 1];
                if (wrapperTable.rows[startIndex].cells[0].innerText === nextElement.cells[0].innerText) {
                    _rowSpan += 1;
                    nextElement.removeChild(nextElement.cells[0]);
                    wrapperTable.rows[startIndex].cells[0].rowSpan = _rowSpan;
                }
                else {
                    if (_rowSpan > 1) {
                        cao(i + 1);
                        break;
                    }
                    else {
                        cao(i + 1);
                        break;
                    };
                };
            };
        };
    })(i);
};
conCell(0);

//添加mouseover事件
document.getElementById("wrapperDiv").compatibleEventListener("mouseover",function(e) {
    e = e || window.event;
    let index;
    let dataArray =[];
    let data = handleData();
    if (e.target.nodeName === "INPUT") {
        tr = e.target.parentNode.parentNode;
        if (tr.childNodes.length >= 12) {
            for (let j in tr.parentNode.childNodes) {
                if (tr === tr.parentNode.childNodes[j]) {
                    index = j;
                };
            };
        }
        else if (tr.childNodes.length < 12) {
            for (let j in tr.parentNode.parentNode.childNodes) {
                if (tr.parentNode === tr.parentNode.parentNode.childNodes[j]) {
                    index = j;
                };
            };
        }
        dataArray.push(data[index].sale);
        bar.dataCreate(dataArray,color);
        draw.dataCreate(dataArray,color);
    }
    else if (e.target.nodeName === "TD") { 
        tr = e.target.parentNode;
        for (let j in tr.parentNode.childNodes) {
            if (tr === tr.parentNode.childNodes[j]) {
                index = j;
            };
        };
        dataArray.push(data[index].sale);
        bar.dataCreate(dataArray,color);
        draw.dataCreate(dataArray,color);
    };
});

//因为table重新渲染之后所有的事件都没了，所以这里只能把那些事件写到一个函数里，放进重新渲染的函数里，在每次渲染后重新绑定
function editFunction() {

    //添加mouseleave事件
    
    document.getElementById("wrapperTable").compatibleEventListener("mouseleave", function() {
        chart();
    });

    //添加td点击事件
    for (let i in document.getElementsByClassName("data")) {
        document.getElementsByClassName("data")[i].onclick = function(e) {
            e = e || window.event;
            if (this.getAttribute("status") === null) {
                //edit
                edit.use(this);
            }
            else if (e.target.id === "save") {
                //save
                save.use(this);
            }
            else if (e.target.id === "cancel") {
                //cancel
                cancel.use(tempElement);
            }
        };
        /*document.getElementsByClassName("data")[i].onblur = function() {
            console.log("失焦")
            cancel.use(this);
        }*/
        //添加td键盘事件
        document.getElementsByClassName("data")[i].onkeydown = function(key) {
            let keyCode = key.keyCode;
            console.log(this)
            if (keyCode === 13) {
                tempElement = key.target.parentNode;
                save.use(this);
            }
            else if (keyCode === 27) {
                tempElement = key.target.parentNode;
                cancel.use(tempElement);
            }
        }
    };

    //点击销量单元格之外的部分，编辑框消失。点销量单元格return，使用它们原本的功能
    document.onclick = function(e) {
        e = e || window.event;
        if (e.target.nodeName ==="TD" || e.target.parentNode.nodeName ==="TD" || e.target.nodeName ==="BUTTON") {
            return
        }
        else {
            cancel.use(tempElement);
        }
    }

    /*function findId(dom,id) {
        function parentNode(dom,id){
            if (dom.id === id) {
                return true
            }
            else {
                if(dom.parentNode) {
                    parentNode(dom.parentNode,id);
                }
            }
        }
        function childNodes(dom,id) {
            if (dom.id === id) {
                return true
            }
            else {
                if (dom.childNodes) {
                    for (let i in dom.childNodes) {
                        childNodes(dom.childNodes[i],id)
                    };
                }
            }
        }
        if (dom.id === id) {
            return true
        }
        else {
            if(dom.parentNode) {
                parentNode(dom.parentNode,id);
            }
            if (dom.childNodes) {
                for (let i in dom.childNodes) {
                    childNodes(dom.childNodes[i],id)
                };
            }
        }
    }*/

    //原型对象prototype扩展函数
    Object.extend = function(distination,source) {
        for (index in source) {
            distination[index] = source[index];
        }
        return distination;
    }
    //定义一个抽象基类base,无构造函数
    function base() {};
    base.prototype = {
        use: function(e){
            this.click(e);//调用了一个虚方法，在其他函数里具体定义这个方法，从而实现多态
        }
    };

    //功能：！！！点单元格可以编辑 ！！！
    function Edit() {};
    Edit.prototype = Object.extend({
        click: function(e) {
            cancel.use(tempElement);
            let data = e.childNodes[0].value;
            let div = document.createElement("div");
            let input = document.createElement("input");//编辑输入框
            let saveButton = document.createElement("button");//保存按钮
            let cancelButton = document.createElement("button");//取消按钮
            e.setAttribute("status", "editing");
            div.setAttribute("class", "divEdit");
            div.setAttribute("id","divEdit");
            input.value = data;
            saveButton.setAttribute("id","save");
            cancelButton.setAttribute("id","cancel");
            saveButton.innerHTML = "保存";
            cancelButton.innerHTML = "取消";
            div.appendChild(input);
            div.appendChild(saveButton);
            div.appendChild(cancelButton);
            e.appendChild(div);
            input.focus();
            input.select();
            input.onblur = function(event) {//编辑输入框失去焦点时，将parent存入变量tempElement中
                event = event || window.event;
                let parent = event.target.parentNode;
                tempElement = parent;
            }
        }
    },base.prototype);
    edit = new Edit();

    //功能：！！！点击取消按钮，编辑框消失，单元格内容不变 ！！！
    function Cancel() {};
    Cancel.prototype = Object.extend({
        click: function(tempElement) {
            if (tempElement && tempElement.parentNode) {
                tempElement.parentNode.removeAttribute("status");
                tempElement.parentNode.removeChild(tempElement);//把失去焦点的那个元素的父元素div删了，即编辑框消失
            }
        }
    },base.prototype);
    cancel = new Cancel;

    //功能：！！！点击保存按钮，单元格内容变成编辑后的内容，修改localStorage中对应的数据，编辑框消失 ！！！
    function Save() {};
    Save.prototype = Object.extend({
        click: function(e) {
            let data = e.lastChild.firstChild.value;
            let input = e.childNodes[0];
            if (!isNaN(data)) {
                input.value = data;
                updateStorege(e);
                cancel.use(tempElement);
            }
            else {
                alert("请填入数字")
            }
        }
    },base.prototype)
    save = new Save;
};
editFunction();