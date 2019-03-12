var regionInput = document.getElementsByClassName("region");
var productInput = document.getElementsByClassName("product");
var wrapper;
var tr;
let data =[];
var bar;//构造函数Bar的实例
var draw;//构造函数Draw的实例
var color = ["#FFB6C1", "#4B0082", "#E1FFFF", "#00FF7F", "#FFFF00", "#FF8C00", "#8B0000", "#FFE4B5", "#A9A9A9"];

//初始化坐标系
for (let i in sourceData) {
    data = data.concat(sourceData[i].sale); 
}
window.onload = function() {
    setTimeout(function () {
        createDom(handleData());
        bar = new Bar(data);
        bar.initCreate();
        draw = new Draw(data);
        draw.initCreate();
        chart();
    }, 500);
};

//生成可视化图表
function chart() {
    let newData = handleData();
    let data = [];
    for (let j in newData) {
        data.push(newData[j].sale);
    }
    draw.dataCreate(data, color);
    bar.dataCreate(data, color);
};

//每个checkbox监听变化
for (let i = 0; i < document.getElementsByClassName("js").length; i++) {
    document.getElementsByClassName("js")[i].compatibleEventListener("change", function() {
        let wrapper = document.getElementById("wrapperDiv");
        let newData = handleData();
        wrapper.removeChild(wrapperTable);
        createInitDom();
        chart();
        createDom(newData);
        conCell(0);
        editFunction();//每次都给渲染后的table重新添加各种事件
    });
};

//先判断地区和商品有没有选中
function checkedTest() {
    let checkRegion = 0;
    let checkProduct = 0;
    let tempRegionData = [];
    let tempProductData = [];
    for (let i = 0; i < regionInput.length; i++) {
        if (regionInput[i].checked === true) {
            checkRegion++;
            tempRegionData.push(regionInput[i].value);
        };
    };
    for (let j = 0; j < productInput.length; j++) {
        if (productInput[j].checked === true) {
            checkProduct++;
            tempProductData.push(productInput[j].value);
        };
    };
    //ES6对象简写语法
    return { checkRegion, checkProduct, tempRegionData, tempProductData };
};

function handleData() {
    let sourceData = getStorage();
    let newData = [];
    //地区和产品都有选中的
    if (checkedTest().checkRegion > 0 && checkedTest().checkProduct > 0) {
        for (let i = 0; i < sourceData.length; i++) {
            for (let j = 0; j < checkedTest().tempRegionData.length; j++) {
                for (let k = 0; k < checkedTest().tempProductData.length; k++) {
                    if (sourceData[i].region === checkedTest().tempRegionData[j] && sourceData[i].product === checkedTest().tempProductData[k]) {
                        newData.push(sourceData[i]);
                    };
                };
            };
        };
        return newData;
    }
    //当地区或产品有其一被选中
    else if (checkedTest().checkRegion > 0 || checkedTest().checkProduct > 0) {
        for (let i = 0; i < sourceData.length; i++) {
            for (let j = 0; j <= checkedTest().tempRegionData.length; j++) {
                for (let k = 0; k <= checkedTest().tempProductData.length; k++) {
                    if (sourceData[i].region === checkedTest().tempRegionData[j] || sourceData[i].product === checkedTest().tempProductData[k]) {
                        newData.push(sourceData[i]);
                    };
                };
            };
        };
        return newData;
    };
};

function allSelect(id) {
    let dom = document.getElementById(id);
    let checkboxes = document.getElementsByClassName(id);
    dom.compatibleEventListener("click", function (e) {
        e = e || window.event;
        let currentEvent = e.target;
        if (currentEvent.type === "checkbox") {
            if (currentEvent.getAttribute("checkbox-type") === "all") {
                let currentChecked = currentEvent.checked;
                for (let i = 0; i < checkboxes.length; i++) {
                    checkboxes[i].checked = currentChecked;
                };
            }
            else if (currentEvent.getAttribute("checkbox-type") === "one") {
                let checkedNum = 0;
                let len = checkboxes.length;
                for (let i = 1; i < len; i++) {
                    if (checkboxes[i].checked === true) {
                        checkedNum++;
                    };
                };
                if (currentEvent.checked === false && checkedNum === 0) {
                    currentEvent.checked = true;
                }
                else if (currentEvent.checked === false) {
                    checkboxes[0].checked = false;
                }
                else if (currentEvent.checked === true && checkedNum === len - 1) {
                    checkboxes[0].checked = true;
                };
            };
        }
    });
};
allSelect("region-radio-wrapper");
allSelect("product-radio-wrapper");