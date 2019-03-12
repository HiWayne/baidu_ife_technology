function setHash() {
    var hash = "";
    var tempHash = "";
    var flag = false;
    var inputs = document.getElementsByClassName("js");
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].checked === true) {
            flag = true;
            tempHash += i;
        };
    };
    console.log(flag)
    if (flag) {
        hash = "#" + tempHash;
        window.location.hash = hash;
    }
    else {
        window.location.hash = "";
    }
};

document.getElementById("header").compatibleEventListener("click",function(e) {
    e = e || windwo.event;
    if (e.target.type === "checkbox") {
        setHash();
    }
})

window.compatibleEventListener("hashchange",show);

function getHash() {
    var hash = window.location.hash;
    var hashArray = hash.split("");
    var num = hashArray.slice(1);
    return num;
};

function show() {
    var index = getHash();
    if (index !== null) {
        var inputs = document.getElementsByClassName("js");
        for (let i = 0; i < inputs.length; i ++) {
            inputs[i].checked = false;
        };
        for (let i in index) {
            var inputItem = parseInt(index[i]);
            inputs[inputItem].checked = true;
        };
    }
};

show();