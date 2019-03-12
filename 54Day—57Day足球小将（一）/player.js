class player {
    constructor() {
        if (new.target === player) {
            throw new Error("工厂类不能实例化")
        }
    }
    static factory(...arg) {
        let type = arg.shift()
        if (typeof (player[type]) !== "function") {
            throw new Error(`player[${type}] is not exist`)
        }
        let object = player[type](...arg)
        return object
    }
    static football(...arg) {
        return new FootballPlayer(...arg)
    }
}
class FootballPlayer {
    //object = {VNum: number, power: number, physical: number}
    constructor(object) {
        this.posX = null
        this.posY = null
        this.VNum = object["VNum"]
        this.VMax = 3 + (object["VNum"] - 1) * (9 / 98)
        this.power = object["power"]
        this.physical = object["physical"]
        //生成球员随机位置坐标
        this.setPosition()
    }
    setPosition() {
        let posX = this.random(footballfield.startX, footballfield.startX + footballfield.meterToPx(footballField.length))
        let posY = this.random(footballfield.startY, footballfield.startY + footballfield.meterToPx(footballField.width))
        this.posX = posX
        this.posY = posY
    }
    setTarget() {
        let posX = this.random(footballfield.startX, footballfield.startX + footballfield.meterToPx(footballField.length))
        let posY = this.random(footballfield.startY, footballfield.startY + footballfield.meterToPx(footballField.width))
        this.targetX = posX
        this.targetY = posY
        if (this.targetX === this.posX && this.targetY === this.posY) {
            this.setTarget()
        }
    }
    //根据球员当前坐标渲染球员
    draw() {
        //圆心坐标
        let arcStartX
        let arcStartY
        //半径
        let radius
        //相关数据赋值
        arcStartX = this.posX
        arcStartY = this.posY
        radius = footballfield.meterToPx(2)
        //画出球员
        this.ctx.fillStyle = "white"
        this.ctx.beginPath()
        this.ctx.moveTo(arcStartX, arcStartY)
        this.ctx.arc(arcStartX, arcStartY, radius, 0, Math.PI * 2)
        this.ctx.fill()
    }
    createVNum() {
        let VNum = this.random(1, 99)
        this.VNum = VNum
        this.VMax = 3 + (VNum - 1) * (9 / 98)
    }
    //爆发力和体力
    createPowerAndPhysical() {
        this.power = this.random(1, 99)
        this.physical = this.random(1, 99)
    }
    random(min, max) {
        let result = Math.random() * (max - min + 1) + min
        result = Math.floor(result)
        return result
    }
    useCTX(object) {
        if (object instanceof FootballField) {
            this.ctx = object.playerCanvasCtx
        }
        else {
            throw new Error("useCTX的参数不是由FootballField类创建的实例")
        }
    }
    run(refresh) {
        let _this = this
        //随机定一个目的地（和原位置不同）
        this.setTarget()
        let posX = this.posX
        let posY = this.posY
        let distanceX = this.targetX - posX
        let distanceY = this.targetY - posY
        //最高速度
        let VMax = this.VMax
        //加速到最高速度时间
        let speedUpTime = this.caculatePower()
        //保持最高速度时间
        let speedHoldTime = this.caculatePhysical()
        //开始跑动的时间
        let date = new Date()
        let startTime = date.getTime()
        let x, y
        //判断往x，y的哪个方向走,true为正方向
        x = Math.abs(distanceX) === distanceX ? true : false
        y = Math.abs(distanceY) === distanceY ? true : false
        let riceLength = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
        return new Promise(function (resolve) {
            //刷新率
            let fps = refresh
            //每帧移动距离
            let stepDistance
            //直角三角形tan值，用于已知移动距离计算x，y坐标值
            let tan = Math.abs(distanceX) / Math.abs(distanceY)
            //每帧X移动距离，每帧Y移动距离，当前总直线移动距离，当前帧的系统时间，当前速度
            let stepMoveX, stepMoveY, newDistance, time, currentV
            newDistance = 0
            //动画帧函数
            requestAnimationFrame(function animate() {
                //清除之前的圆会导致其他被之经过的圆也被清除，看了GitHub其他人的办法，改用清除整个画布重绘的方法
                /*footballfield.clearArc(this.ctx, _this.posX, _this.posY, footballfield.meterToPx(2) + 0.8, 1)*/
                //如果未到达目标距离
                if (newDistance < riceLength) {
                    //经过的时间
                    let date = new Date()
                    time = date.getTime() - startTime
                    //如果离目标点超过3米
                    if (newDistance < riceLength - footballfield.meterToPx(3)) {
                        //如果经过的时间小于等于speedUpTime ：V = time / speedUpTime * VMax，如果经过的时间大于speedUpTime小于等于speedHoldTime : V = VMax，如果经过的时间大于speedHoldTime : V = speedHoldTime / time * VMax。stepDistance = V / 60
                        if (time <= speedUpTime * 1000) {
                            currentV = time / speedUpTime / 1000 * VMax
                        }
                        else if (time > speedUpTime * 1000 && time <= speedHoldTime * 1000) {
                            currentV = VMax
                        }
                        else if (time > speedHoldTime * 1000) {
                            currentV = speedHoldTime * 1000 / time * VMax
                            //不会无限制降低的，最低为最高速度的一半
                            currentV = Math.max(currentV, 0.5 * VMax)
                        }
                    }
                    //如果离目标点不到3米
                    else {
                        //如果从远处跑到了距离目标3米之内（因为currentV存在，说明在3米之外有跑动）
                        if (currentV) {
                            //在3米内从currentV速度直线匀减速到0
                            //加速度（每秒速度变化值）
                            let a = currentV * currentV / 3 * 2
                            //减速时要转化成每帧加速度
                            currentV -= a / fps
                            //不能减成负值
                            currentV = Math.max(currentV, 0)
                        }
                        //如果一开始目标就不足3米，加速到最后1米匀减速
                        else {
                            //距离目标超过1米
                            if (newDistance < riceLength - footballfield.meterToPx(1)) {
                                currentV = time / speedUpTime * 1000 * VMax
                            }
                            //距离目标1米内匀减速（一个例外：如果一开始目标就不足1米，那么一直保持加速，到目标瞬间停止，因为1米加速并不快）
                            else {
                                if (currentV) {
                                    //在1米内从currentV速度直线匀减速到0
                                    //加速度（每秒速度变化值）
                                    let a = currentV * currentV / 1 * 2
                                    //减速时要转化成每帧加速度
                                    currentV -= a / fps
                                    //不能减成负值
                                    currentV = Math.max(currentV, 0)
                                }
                                //如果一开始目标就不足1米
                                else {
                                    //一直保持加速，直到到达目标，到达目标会有其他的逻辑判断让它停止
                                    currentV = time / speedUpTime * 1000 * VMax
                                }
                            }
                        }
                    }
                    //秒速转换成像素大小，再除以帧，得到当前帧应该前进距离
                    stepDistance = footballfield.meterToPx(currentV) / fps
                    //已知直角三角形斜边（前进距离）和tan，求另外两边（即x、y轴移动距离），解二元方程组过程
                    stepMoveY = Math.sqrt(stepDistance * stepDistance / (tan * tan + 1))
                    stepMoveX = tan * stepMoveY
                    //更新坐标
                    _this.posX = x ? _this.posX + stepMoveX : _this.posX - stepMoveX
                    _this.posY = y ? _this.posY + stepMoveY : _this.posY - stepMoveY
                }
                //如果到达目标距离
                else {
                    resolve()
                    return
                }
                //未到达目标距离，继续调用动画帧函数
                newDistance = Math.sqrt((_this.posX - posX) * (_this.posX - posX) + (_this.posY - posY) * (_this.posY - posY))
                requestAnimationFrame(function () {
                    animate()
                })

            })
        }
        )
    }
    caculatePower() {
        let power = this.power
        let speedUpTime = (395 - 3 * power) / 98
        return speedUpTime
    }
    caculatePhysical() {
        let physical = this.physical
        let speedHoldTime = (975 + 5 * physical) / 98
        return speedHoldTime
    }
}