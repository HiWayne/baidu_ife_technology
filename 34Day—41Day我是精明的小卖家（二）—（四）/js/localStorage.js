function getStorage() {
    let getSourceData = sourceData.slice();
    if (window.localStorage && window.localStorage.getItem("data")) {
        getSourceData = JSON.parse(window.localStorage.getItem("data"));
    }
    return getSourceData;
}

function updateStorege(td) {
    let tempData = getStorage();
    let tdIndex;
    let tr = td.parentNode;
    let trChilds = tr.querySelectorAll("td")
    for (let i in trChilds) {
        if (trChilds.length === 14 && td === trChilds[i]) {
            tdIndex = parseInt(i) - 2;
        }
        else if (trChilds.length === 13 && td === trChilds[i]) {
            tdIndex = parseInt(i) - 1;
        }
    };
    for (let i in tempData) {
        if (tempData[i].product === tr.getAttribute("pro") && tempData[i].region === tr.getAttribute("reg")) {
            tempData[i].sale[tdIndex] = parseInt(td.querySelector("input").value);
        }
    }
    window.localStorage.setItem("data", JSON.stringify(tempData));
}

function clearStorage() {
    window.localStorage.removeItem("data");
}