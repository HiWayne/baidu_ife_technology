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
        //标准宽时浏览器可视窗口的80%，再乘以相关的系数
        let percent = 0.8
        //输入值与屏幕像素的换算系数
        let screenScale
        screenScale = clientWidth * percent / standardWidth
        //草地长宽
        //因为屏幕长宽比普遍比足球场长宽比大，为了防止按比例计算时宽度过大，所以以宽度为基准，长度乘以输入值比例系数。+ 4因为草地比边线大一点
        let footballFieldWidth = screenScale * (this.width + 4)
        if (footballFieldWidth > clientWidth) {
            console.log("提醒：标准足球场长：105，宽68，创建的足球场宽度过大，已限制在窗口高度内")
            footballFieldWidth = clientWidth * 0.98
            //如果在此情况，更新换算系数
            screenScale = footballFieldWidth / this.width
        }
        let footballFieldLength = footballFieldWidth * lengthWidthScale
        //如果碰见意外情况：屏幕长宽比比足球场长宽比小，则以长度为基准
        if (footballFieldLength > clientLength) {
            screenScale = clientLength * percent / standardLength
            footballFieldLength = screenScale * (this.length + 4)
            if (footballFieldLength > clientLength) {
                console.log("提醒：标准足球场长：105，宽68，创建的足球场长度过大，已限制在窗口宽度内")
                footballFieldLength = clientLength * 0.98
                //如果在此情况，更新换算系数
                screenScale = footballFieldWidth / this.width
            }
            footballFieldWidth = footballFieldLength * (1 / lengthWidthScale)
        }
        //工厂静态属性：米与像素转化系数
        footballfield.screenScale = screenScale
        //最外围边线长宽
        let borderWidth = footballFieldWidth - (footballfield.meterToPx(4))//减去多出来的4m，要计算上系数
        let borderLength = footballFieldLength - (footballfield.meterToPx(4))
        //草地起始坐标
        let fieldRectStartX = (clientLength - footballFieldLength) / 2
        let fieldRectStartY = (clientWidth - footballFieldWidth) / 2
        
        //边线起始坐标
        let borderRectStartX = (clientLength - borderLength) / 2
        let borderRectStartY = (clientWidth - borderWidth) / 2
        
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
        footballFieldCtx.lineWidth = footballfield.meterToPx(lineWidth)
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
        footballFieldCtx.moveTo(fieldRectStartX + footballFieldLength / 2 + footballfield.meterToPx(9.15), borderRectStartY + borderWidth / 2)
        footballFieldCtx.arc(fieldRectStartX + footballFieldLength / 2, borderRectStartY + borderWidth / 2, footballfield.meterToPx(9.15), 0, Math.PI * 2)
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
                footballFieldCtx.moveTo(x + footballfield.meterToPx(1), y)
                footballFieldCtx.arc(x, y, footballfield.meterToPx(1), 0, Math.PI / 2)
                footballFieldCtx.stroke()
                footballFieldCtx.moveTo(x, y + borderWidth - footballfield.meterToPx(1))
                footballFieldCtx.arc(x, y + borderWidth, footballfield.meterToPx(1), Math.PI * 3 / 2, 0)
                footballFieldCtx.stroke()
            }
            else if (right) {
                //上下两个角球圆线
                footballFieldCtx.moveTo(x - footballfield.meterToPx(1), y)
                footballFieldCtx.arc(x, y, footballfield.meterToPx(1), Math.PI, Math.PI / 2, true)
                footballFieldCtx.stroke()
                footballFieldCtx.moveTo(x, y + borderWidth - footballfield.meterToPx(1))
                footballFieldCtx.arc(x, y + borderWidth, footballfield.meterToPx(1), Math.PI * 3 / 2, Math.PI, true)
                footballFieldCtx.stroke()
            }
            //最大的矩形
            threeLineRect(footballFieldCtx, x, y + footballfield.meterToPx(13.84), footballfield.meterToPx(16.5), footballfield.meterToPx(40.32), right)
            //中间矩形
            threeLineRect(footballFieldCtx, x, y + footballfield.meterToPx(24.84), footballfield.meterToPx(5.5), footballfield.meterToPx(18.32), right)
            //最小矩形
            threeLineRect(footballFieldCtx, x, y + footballfield.meterToPx(30.34), footballfield.meterToPx(1.8), footballfield.meterToPx(7.32), !right)
            //圆弧
            if (right) {
                footballFieldCtx.moveTo(x - footballfield.meterToPx(16.5), borderRectStartY + borderWidth / 2 - footballfield.meterToPx(7.3125))
                footballFieldCtx.arc(x - footballfield.meterToPx(11), borderRectStartY + borderWidth / 2, footballfield.meterToPx(9.15), Math.PI + 0.927, Math.PI - 0.927, right)
                footballFieldCtx.stroke()
                return
            }
            footballFieldCtx.moveTo(x + footballfield.meterToPx(16.5), borderRectStartY + borderWidth / 2 - footballfield.meterToPx(7.3125))
            footballFieldCtx.arc(x + footballfield.meterToPx(11), borderRectStartY + borderWidth / 2, footballfield.meterToPx(9.15), Math.PI * 2 - 0.927, 0.927)
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

        //工厂静态属性
        
        //工厂静态属性：草地起始坐标
        footballfield.fieldStartX = fieldRectStartX
        footballfield.fieldStartY = fieldRectStartY
        //工厂静态属性：边线起始坐标
        footballfield.startX = borderRectStartX
        footballfield.startY = borderRectStartY
        //工厂静态属性：草地长宽
        footballfield.footballFieldLength = footballFieldLength
        footballfield.footballFieldWidth = footballFieldWidth
        //工厂静态属性：边线长宽
        footballfield.borderLength = borderLength
        footballfield.borderWidth = borderWidth
    }

    //工厂静态方法
    //真实的米转换成屏幕像素方法
    static meterToPx(meter) {
        let px = meter * footballfield.screenScale
        return px
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
        this.football = {}
        this.createField()
        this.start()
    }
    addObject(object) {
        if (object instanceof FootballPlayer) {
            object.joinFootballfield(this)
            this.footballPlayers.push(object)
        }
        else if (object instanceof Football) {
            object.joinFootballfield(this)
            this.football = object
        }
        else {
            throw new Error("add的参数必须是FootballPlayer类或Football类的实例")
        }
    }
    start() {
        let render = () => {
            console.log("render")
            this.playerCanvasCtx.clearRect(footballfield.fieldStartX, footballfield.fieldStartY, footballfield.footballFieldLength, footballfield.footballFieldWidth)
            for (let i = 0; i < this.footballPlayers.length; i++) {
                this.footballPlayers[i].draw()
            }
            if (typeof (this.football.draw) === "function") {
                this.football.draw()
            }
            footballfield.animate = requestAnimationFrame(render)
        }
        render()
    }
}