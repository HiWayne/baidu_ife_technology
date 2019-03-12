function Bar(data) {
  this.embed = document.getElementById("SVG");
  this.SVG = this.embed.getSVGDocument();
  this.newMAX = handleNum(data);
  this.line1 = this.SVG.createElementNS("http://www.w3.org/2000/svg", "line");
  this.line2 = this.SVG.createElementNS("http://www.w3.org/2000/svg", "line");
  this.x = 20;//柱初始x
  this.y = 10;//柱初始y
  this.maxY = this.y + this.newMAX;//y轴高度
  this.width = 3;//柱宽
  this.span = 2;//间距
};
Bar.prototype.initCreate = function () {
  this.line1.setAttribute("x1", "10");
  this.line1.setAttribute("y1", this.y);
  this.line1.setAttribute("x2", "10");
  this.line1.setAttribute("y2", this.maxY);
  this.line1.setAttribute("style", "stroke:#000;stroke-width:1");
  this.line2.setAttribute("x1", "10");
  this.line2.setAttribute("y1", this.maxY);
  this.line2.setAttribute("x2", "650");
  this.line2.setAttribute("y2", this.maxY);
  this.line2.setAttribute("style", "stroke:#000;stroke-width:1");
  this.SVG.rootElement.appendChild(this.line1);
  this.SVG.rootElement.appendChild(this.line2);
}
Bar.prototype.dataCreate = function (data, color) {
  let sourceData = getStorage();
  let length = data.length;
  let allDataLength = sourceData.length;
  let smallWidth;
  let smallSpan
  let x = this.x;
  allWidth = this.width * allDataLength;
  allSpan = this.span * allDataLength + 8;
  smallWidth = this.width * allDataLength / length;
  smallSpan = this.span * allDataLength / length;
  if (this.SVG.rootElement.childNodes.length > 3) {
    for (let i = this.SVG.rootElement.childNodes.length - 1; i > 2; i--) {
      this.SVG.rootElement.removeChild(this.SVG.rootElement.childNodes[i]);
    }
  }
  for (let j in data) {
    for (let k in sourceData) {
      if (compareArray(data[j], sourceData[k].sale)) {
        for (let i = 0; i < data[j].length; i++) {
          let rectY = this.maxY - data[j][i];
          let rect = this.SVG.createElementNS("http://www.w3.org/2000/svg", "rect");
          rect.setAttribute("x", x);
          rect.setAttribute("y", rectY);
          rect.setAttribute("width", smallWidth);
          rect.setAttribute("height", data[j][i]);
          rect.setAttribute("style", `fill:${color[k]}`);
          this.SVG.rootElement.appendChild(rect);
          x += allWidth + allSpan;
        };
      };
    };
    x = this.x + (smallWidth + smallSpan) * (parseInt(j) + 1);
  };
};
