class football {
    constructor() {
        if (new.target === ball) {
            throw new Error("工厂类不能实例化")
        }
    }
    static factory(...arg) {
        let type = arg.shift()
        if (typeof (football[type]) !== "function") {
            throw new Error(`ball[${type}] is not exist`)
        }
        let object = football[type](...arg)
        return object
    }
    static football(...arg) {
        return new Football(...arg)
    }
}

class Football {
    constructor() {
        this.posX = undefined
        this.posY = undefined
        this.image = undefined
        //判断是否在动
        this.moving = undefined
        //方向：弧度
        this.radian = undefined
        //初速度：米/秒
        this.V0 = undefined
        this.a = 5
        this.loadImage()
        this.setPosition()
        this.setRadian()
        this.setV0()
    }
    joinFootballfield(object) {
        if (object instanceof FootballField) {
            this.ctx = object.playerCanvasCtx
        }
        else {
            throw new Error("joinFootballfield的参数不是FootballField类的实例")
        }
    }
    setPosition(posX, posY) {
        if (posX && posY) {
            if (typeof (posX) === "number" && typeof (posY) === "number") {
                this.posX = caculate(posX, "x")
                this.posY = caculate(posY, "y")
                return
            }
            else {
                throw new Error(`${posX} or ${posY} is not number`)
            }
        }
        posX = caculate(posX, "x") || this.random(footballfield.startX, footballfield.startX + footballfield.borderLength)
        posY = caculate(posY, "y") || this.random(footballfield.startY, footballfield.startY + footballfield.borderWidth)
        this.posX = posX
        this.posY = posY
        function caculate(number, xOry) {
            if (typeof (number) === "undefined") {
                return
            }
            let result
            switch (xOry) {
                case "x":
                result = footballfield.startX + number > footballfield.startX + footballfield.borderLength ? footballfield.startX + footballfield.borderLength : footballfield.startX + number
                break
                case "y":
                result = footballfield.startY + number > footballfield.startY + footballfield.borderWidth ? footballfield.startY + footballfield.borderWidth : footballfield.startY + number
                break
            }
            return result
        }
    }
    loadImage() {
        this.image = new Image()
        this.image.src = "./images/football.jpg"
    }
    draw() {
        let footballImage, footballPosX, footballPosY
        footballImage = this.image
        footballPosX = this.posX
        footballPosY = this.posY
        this.circleImage(footballImage, footballPosX, footballPosY, footballfield.meterToPx(1), footballfield.meterToPx(1))
    }
    circleImage(image, x, y, width, height) {
        this.ctx.save()
        this.ctx.beginPath()
        this.ctx.arc(x, y, width / 2, 0, Math.PI * 2)
        this.ctx.clip()
        this.ctx.drawImage(image, x - width / 2, y - height / 2, width, height)
        this.ctx.restore()
    }
    run(fps) {
        this.moving = true
        let radian = this.radian
        let V0
        let a = this.a
        let stepDistance, currentV, stepDistanceX, stepDistanceY
        return new Promise((resolve) => {
            let animate = () => {
                V0 = this.V0 -= a / fps
                V0 = Math.max(V0, 0)
                if (!V0) {
                    this.moving = undefined
                    resolve()
                    return
                }
                currentV = V0
                stepDistance = footballfield.meterToPx(currentV / fps)
                if (radian <= Math.PI / 2) {
                    stepDistanceX = stepDistance * Math.cos(radian)
                    stepDistanceY = stepDistance * Math.sin(radian)
                    this.posX += stepDistanceX
                    this.posY += stepDistanceY
                }
                else if (radian > Math.PI / 2 && radian <= Math.PI) {
                    stepDistanceX = stepDistance * Math.sin(radian - Math.PI / 2)
                    stepDistanceY = stepDistance * Math.cos(radian - Math.PI / 2)
                    this.posX -= stepDistanceX
                    this.posY += stepDistanceY
                }
                else if (radian > Math.PI && radian <= Math.PI / 2 * 3) {
                    stepDistanceX = stepDistance * Math.cos(radian - Math.PI)
                    stepDistanceY = stepDistance * Math.sin(radian - Math.PI)
                    this.posX -= stepDistanceX
                    this.posY -= stepDistanceY
                }
                else if (radian > Math.PI / 2 * 3) {
                    stepDistanceX = stepDistance * Math.cos(Math.PI * 2 - radian)
                    stepDistanceY = stepDistance * Math.sin(Math.PI * 2 - radian)
                    this.posX += stepDistanceX
                    this.posY -= stepDistanceY
                }
                //碰到边界反弹
                if (this.posX <= footballfield.startX) {
                    this.posX = footballfield.startX + 3
                    if (radian <= Math.PI) {
                        radian = Math.PI - radian
                    }
                    else if (radian > Math.PI && radian < Math.PI / 2 * 3) {
                        radian = Math.PI * 3 - radian
                    }
                }
                else if (this.posX > footballfield.startX + footballfield.borderLength) {
                    this.posX = footballfield.startX + footballfield.borderLength - 3
                    if (radian < Math.PI / 2) {
                        radian = Math.PI - radian
                    }
                    else if (radian > Math.PI /2 * 3 ) {
                        radian = Math.PI * 2 - radian
                    }
                }
                else if (this.posY <= footballfield.startY) {
                    this.posY = footballfield.startY + 3
                    if (radian > Math.PI && radian < Math.PI * 2) {
                        radian = Math.PI * 2 - radian
                    }
                }
                else if (this.posY > footballfield.startY + footballfield.borderWidth) {
                    this.posY = footballfield.startY + footballfield.borderWidth - 3
                    if (radian > 0 && radian < Math.PI) {
                        radian = Math.PI * 2 - radian
                    }
                }
                requestAnimationFrame(animate)
            }
            animate()
        })
    }
    stop() {
        this.V0 = 0
    }
    setRadian() {
        let radian = this.random(0, Math.PI * 2)
        this.radian = radian
    }
    setV0() {
        let V0 = this.random(1, 40)
        this.V0 = V0
    }
    random(min, max) {
        let result = Math.random() * (max - min + 1) + min
        result = Math.floor(result)
        return result
    }
}