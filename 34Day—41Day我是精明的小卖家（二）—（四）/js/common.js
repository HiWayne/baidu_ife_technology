//逢五向上取整(1.1 === 1.5, 1.6 === 2)
function handleNum(data) {
  num = Math.max.apply(null,data);
  let string = num.toString();
  if (string.indexOf(".") !== -1) {
      let newN = parseInt(string.slice(0,string.indexOf("."))) + 1;
      let length = newN.toString().length;
      let temp = Math.ceil(newN/Math.pow(10,length - 1)*2);
      return temp*Math.pow(10,length - 1)/2;
  }
  else {
      let length = string.length;
      let temp = Math.ceil(num/Math.pow(10,length - 1)*2);
      return temp*Math.pow(10,length - 1)/2;
  }
};

//比较数组里的值和顺序是否相等
function compareArray(one,two) {
    let equal = true;
    for (let i in one) {
        if (one[i] === two[i]) {
            equal = true
        }
        else {
            equal = false;
        }
    }
    return equal;
};

//兼容ie事件监听
//修改了内置对象的原型, 正常项目中不建议这样做
HTMLElement.prototype.compatibleEventListener = compatibleEventListener
function compatibleEventListener(eventName, fn, useCapture) {
    if (window.addEventListener) {
        this.addEventListener(eventName, fn, useCapture)
    }
    else if (window.attachEvent) {
        this.attachEvent('on' + eventName, fn)
    }
}