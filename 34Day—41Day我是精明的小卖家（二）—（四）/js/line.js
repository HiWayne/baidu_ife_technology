function Draw(data) {
    this.initX = 10;
    this.initY = 10;
    this.width = 500;
    this.initSpan = 40;
    this.newMAX = handleNum(data);
};
Draw.prototype.initCreate = function() {
    let context = document.getElementById("canvas");
    if (context.getContext("2d")) {
        this.ctx = context.getContext("2d");
        this.ctx.beginPath();
        this.ctx.moveTo(this.initX, this.initY);
        this.ctx.lineTo(this.initX, this.initY + this.newMAX);
        this.ctx.lineTo(this.width, this.initY + this.newMAX);
        this.ctx.stroke();
        this.ctx.fillStyle = "#1E90FF";
    };
};
Draw.prototype.dataCreate = function(data,color) {
    let sourceData = getStorage();
    this.ctx.clearRect(this.initX + 10, this.initY,500 - this.initX,this.newMAX - 1);
    for (let j in data) {
        for (let k in sourceData) {  
            if (compareArray(data[j], sourceData[k].sale)) {
                for (let i = 0; i < data[j].length; i++) {
                    this.ctx.beginPath();
                    let span = this.initSpan * (i + 1);
                    let x = this.initX + span;
                    let y = this.initY + this.newMAX - data[j][i];
                    let radius = 3;
                    let startAngle = 0;
                    let endAngle = Math.PI * 2;
                    let anticlockwise = true;
                    this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
                    this.ctx.fill();
                    if (i !== 0) {
                        let preSpan = this.initSpan + this.initSpan * (i - 1);
                        let preX = this.initX + preSpan;
                        let preY = this.initY + this.newMAX - data[j][i - 1];
                        this.ctx.strokeStyle = color[k];
                        this.ctx.beginPath();
                        this.ctx.moveTo(preX, preY);
                        this.ctx.lineTo(x, y);
                        this.ctx.stroke();                       
                    };
                };
            }; 
        };        
    };
};