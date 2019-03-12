//扩展canvas ctx原型方法
/*CanvasRenderingContext2D.prototype.clear = function () {
    this.save()
    this.globalCompositeOperation = "destination-out"
    this.fillStyle = "black"
    this.fill()
    this.restore()
}*/
class footballfield {
    constructor(length, width) {
        if (new.target === footballfield) {
            throw new Error("Factory can't be new")
        }
        this.length = length
        this.width = width
    }
    //画足球场
    createField() {
        //标准长宽
        let standardLength = 105
        let standardWidth = 68
        //功能线宽
        let lineWidth = 0.12
        //输入值的长宽比
        let lengthWidthScale = this.length / this.width
        //浏览器窗口可视宽高
        let clientLength = window.innerWidth
        let clientWidth = window.innerHeight
        //标准宽时浏览器可视窗口的70%，再乘以相关的系数
        let percent = 0.7
        //输入值与屏幕像素的换算系数
        footballfield.screenScale = clientWidth * percent / standardWidth
        //草地长宽
        //因为屏幕长宽比普遍比足球场长宽比大，为了防止按比例计算时宽度过大，所以以宽度为基准，长度乘以输入值比例系数。+ 4因为边线比草地小一点
        let footballFieldWidth = footballfield.screenScale * (this.width + 4)
        if (footballFieldWidth > clientWidth) {
            console.log("提醒：标准足球场长：105，宽68，创建的足球场宽度过大，已限制在窗口高度内")
            footballFieldWidth = clientWidth * 0.98
            //如果在此情况，更新换算系数
            footballfield.screenScale = footballFieldWidth / this.width
        }
        let footballFieldLength = footballFieldWidth * lengthWidthScale
        //如果碰见意外情况：屏幕长宽比比足球场长宽比小，则以长度为基准
        if (footballFieldLength > clientLength) {
            footballfield.screenScale = clientLength * percent / standardLength
            footballFieldLength = footballfield.screenScale * (this.length + 4)
            if (footballFieldLength > clientLength) {
                console.log("提醒：标准足球场长：105，宽68，创建的足球场长度过大，已限制在窗口宽度内")
                footballFieldLength = clientLength * 0.98
                //如果在此情况，更新换算系数
                footballfield.screenScale = footballFieldWidth / this.width
            }
            footballFieldWidth = footballFieldLength * (1 / lengthWidthScale)
        }
        footballfield.footballFieldLength = footballFieldLength
        footballfield.footballFieldWidth = footballFieldWidth
        //最外围边线长宽
        let borderWidth = footballFieldWidth - (meterToPx(4))//减去多出来的4m，要计算上系数
        let borderLength = footballFieldLength - (meterToPx(4))
        //草地起始坐标
        let fieldRectStartX = (clientLength - footballFieldLength) / 2
        let fieldRectStartY = (clientWidth - footballFieldWidth) / 2
        footballfield.fieldStartX = fieldRectStartX
        footballfield.fieldStartY = fieldRectStartY
        //边线起始坐标
        let borderRectStartX = (clientLength - borderLength) / 2
        let borderRectStartY = (clientWidth - borderWidth) / 2
        //工厂起始坐标静态属性
        footballfield.startX = borderRectStartX
        footballfield.startY = borderRectStartY
        //开始绘制足球场
        let footballFieldCanvas = document.getElementById("footballFieldCanvas")
        //设置足球场画布宽高
        footballFieldCanvas.width = clientLength * 0.99
        footballFieldCanvas.height = clientWidth * 0.99
        let footballFieldCtx = footballFieldCanvas.getContext("2d")
        //设置实例属性球员画布playerCanvas
        let playerCanvas = document.getElementById("playerCanvas")
        let playerCtx = playerCanvas.getContext("2d")
        this.playerCanvasCtx = playerCtx
        //设置球员画布
        playerCanvas.width = clientLength * 0.99
        playerCanvas.height = clientWidth * 0.99
        //设置线宽
        footballFieldCtx.lineWidth = meterToPx(lineWidth)
        //生成草地
        footballFieldCtx.fillStyle = "green"
        footballFieldCtx.fillRect(fieldRectStartX, fieldRectStartY, footballFieldLength, footballFieldWidth)
        //生成最外围边线
        footballFieldCtx.strokeStyle = "white"
        footballFieldCtx.strokeRect(borderRectStartX, borderRectStartY, borderLength, borderWidth)
        //中间部分
        footballFieldCtx.beginPath()
        footballFieldCtx.moveTo(fieldRectStartX + footballFieldLength / 2, borderRectStartY)
        footballFieldCtx.lineTo(fieldRectStartX + footballFieldLength / 2, borderRectStartY + borderWidth)
        footballFieldCtx.stroke()
        footballFieldCtx.moveTo(fieldRectStartX + footballFieldLength / 2 + meterToPx(9.15), borderRectStartY + borderWidth / 2)
        footballFieldCtx.arc(fieldRectStartX + footballFieldLength / 2, borderRectStartY + borderWidth / 2, meterToPx(9.15), 0, Math.PI * 2)
        footballFieldCtx.stroke()
        //左边部分
        leftOrRightLine(footballFieldCtx, borderRectStartX, borderRectStartY)
        //右边部分
        leftOrRightLine(footballFieldCtx, borderRectStartX + borderLength, borderRectStartY, "right")
        //侧边部分，参数：footballFieldCtx对象，边线上顶点x坐标，边线上顶点y坐标
        function leftOrRightLine(footballFieldCtx, x, y, right) {
            //如果是左侧
            if (!right) {
                //上下两个角球圆线
                footballFieldCtx.moveTo(x + meterToPx(1), y)
                footballFieldCtx.arc(x, y, meterToPx(1), 0, Math.PI / 2)
                footballFieldCtx.stroke()
                footballFieldCtx.moveTo(x, y + borderWidth - meterToPx(1))
                footballFieldCtx.arc(x, y + borderWidth, meterToPx(1), Math.PI * 3 / 2, 0)
                footballFieldCtx.stroke()
            }
            else if (right) {
                //上下两个角球圆线
                footballFieldCtx.moveTo(x - meterToPx(1), y)
                footballFieldCtx.arc(x, y, meterToPx(1), Math.PI, Math.PI / 2, true)
                footballFieldCtx.stroke()
                footballFieldCtx.moveTo(x, y + borderWidth - meterToPx(1))
                footballFieldCtx.arc(x, y + borderWidth, meterToPx(1), Math.PI * 3 / 2, Math.PI, true)
                footballFieldCtx.stroke()
            }
            //最大的矩形
            threeLineRect(footballFieldCtx, x, y + meterToPx(13.84), meterToPx(16.5), meterToPx(40.32), right)
            //中间矩形
            threeLineRect(footballFieldCtx, x, y + meterToPx(24.84), meterToPx(5.5), meterToPx(18.32), right)
            //最小矩形
            threeLineRect(footballFieldCtx, x, y + meterToPx(30.34), meterToPx(1.8), meterToPx(7.32), !right)
            //圆弧
            if (right) {
                footballFieldCtx.moveTo(x - meterToPx(16.5), borderRectStartY + borderWidth / 2 - meterToPx(7.3125))
                footballFieldCtx.arc(x - meterToPx(11), borderRectStartY + borderWidth / 2, meterToPx(9.15), Math.PI + 0.927, Math.PI - 0.927, right)
                footballFieldCtx.stroke()
                return
            }
            footballFieldCtx.moveTo(x + meterToPx(16.5), borderRectStartY + borderWidth / 2 - meterToPx(7.3125))
            footballFieldCtx.arc(x + meterToPx(11), borderRectStartY + borderWidth / 2, meterToPx(9.15), Math.PI * 2 - 0.927, 0.927)
            footballFieldCtx.stroke()
        }
        //画三线矩形的方法：参数分别是footballFieldCtx对象，开始点x坐标，开始点y坐标，矩形长度，矩形宽度   7.3125
        function threeLineRect(footballFieldCtx, x, y, length, width, right) {
            if (right) {
                length = -length
            }
            footballFieldCtx.moveTo(x, y)
            footballFieldCtx.lineTo(x + length, y)
            footballFieldCtx.lineTo(x + length, y + width)
            footballFieldCtx.lineTo(x, y + width)
            footballFieldCtx.stroke()
        }
        //真实的米转换成屏幕像素方法
        function meterToPx(meter) {
            let px = meter * footballfield.screenScale
            return px
        }
        //赋值给工厂静态方法
        footballfield.meterToPx = meterToPx
    }
    //清除圆形方法
    static clearArc(ctx, x, y, radius, addPx) {
        if (addPx <= radius) {
            let calcWidth = radius - addPx
            let calcHeight = Math.sqrt(Math.pow(radius, 2) - Math.pow(calcWidth, 2))
            let posX = x - calcWidth
            let posY = y - calcHeight
            let clearWidth = calcWidth * 2
            let claerHeight = calcHeight * 2
            //这种方法不能完全清除，要稍大一些，不推荐
            ctx.clearRect(posX - 1.5, posY - 1, clearWidth + 3, claerHeight + 2)
            addPx++
            footballfield.clearArc(ctx, x, y, radius, addPx)
        }
        //通过扩展ctx的原型对象，利用“destination-out”特性添加一个清除功能
        //会有一些残余的边线留下来，不得不把半径设置略大一些，具体什么原因不清楚
        /*ctx.moveTo(x + radius, y)
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.clear()*/
    }
    static factory(...arg) {
        let type = arg.shift()
        if (typeof (footballfield[type]) !== "function") {
            throw new Error(`footballfield[${type}] is not exist`)
        }
        let object = footballfield[type](...arg)
        return object
    }
    static football(...arg) {
        return new FootballField(...arg)
    }
}
class FootballField extends footballfield {
    constructor(length, width) {
        super(length, width)
        this.footballPlayers = []
        this.createField()
        this.start()
    }
    add(object) {
        if (object instanceof FootballPlayer || object instanceof Football) {
            object.useCTX(this)
            this.footballPlayers.push(object)
        }
        else {
            throw new Error("add的参数必须是FootballPlayer类或Football类的实例")
        }
    }
    start() {
        let _this = this
        render()
        async function render() {
            console.log("render")
            _this.playerCanvasCtx.clearRect(footballfield.fieldStartX, footballfield.fieldStartY, footballfield.footballFieldLength, footballfield.footballFieldWidth)
            for (let i = 0; i < _this.footballPlayers.length; i++) {
                _this.footballPlayers[i].draw()
            }
            footballfield.animate = requestAnimationFrame(render)
        }
    }
}