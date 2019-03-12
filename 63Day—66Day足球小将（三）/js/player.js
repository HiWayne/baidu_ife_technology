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
    //object = {VNum: number, power: number, physical: number……}
    constructor(object) {
        this.posX = undefined
        this.posY = undefined
        this.targetX = undefined
        this.targetY = undefined
        this.radian = undefined
        this.kickRadian = undefined
        this.moving = undefined
        this.currentV = undefined
        this.VNum = object["VNum"] || this.createVNum()
        this.VMax = 3 + (this.VNum - 1) * (9 / 98)
        this.power = object["power"] || this.createPower()
        this.physical = object["physical"] || this.createPhysical()
        this.strength = object["strength"] || this.createStrength()
        this.technique = object["technique"] || this.createTechnique()
        //生成球员随机位置坐标
        this.setPosition()
    }
    setPosition(posX, posY) {
        if (posX && posY) {
            if (typeof (posX) === "number" && typeof (posY) === "number") {
                this.posX = footballfield.startX + posX > footballfield.startX + footballfield.borderLength ? footballfield.startX + footballfield.borderLength : footballfield.startX + posX
                this.posY = footballfield.startY + posY > footballfield.startY + footballfield.borderWidth ? footballfield.startY + footballfield.borderWidth : footballfield.startY + posY
                return
            }
            else {
                throw new Error(`${posX} or ${posY} is not number`)
            }
        }
        posX = posX || this.random(footballfield.startX, footballfield.startX + footballfield.borderLength)
        posY = posY || this.random(footballfield.startY, footballfield.startY + footballfield.borderWidth)
        this.posX = posX
        this.posY = posY
    }
    setTarget() {
        let posX = this.random(footballfield.startX, footballfield.startX + footballfield.borderLength)
        let posY = this.random(footballfield.startY, footballfield.startY + footballfield.borderWidth)
        this.targetX = posX
        this.targetY = posY
        if (this.targetX === this.posX && this.targetY === this.posY) {
            this.setTarget()
        }
    }
    //传球
    pass(targetPlayer) {
        let pass = new Pass(this)
        pass.pass(targetPlayer)
    }
    //停球
    stopBall() {
        let stopBallMethod = new StopBall(this)
        stopBallMethod.stopBall()
    }
    //带球
    carrying() {
        let carrying = new Carrying(this)
        carrying.carrying()
    }
    //踢球
    kickBall(radian, V0, keepKick) {
        let footballField, football
        footballField = this.footballfield
        football = footballField.football
        football.radian = radian
        football.V0 = V0
        football.run(60)
        if (keepKick) return
        this.moving = undefined
    }
    //第二种踢球(设置想踢到的目的地)
    kickBallTarget(targetX, targetY, keepKick) {
        let kick = new Kick(this)
        kick.kickBall(targetX, targetY)
        if (keepKick) return
        this.moving = undefined
    }
    //射门(目标点:leftUp、rightDown等, 力量:不设置则随机, 左右球门方向:不设置则选最近的)
    shoot(target, strength, direction) {
        //边线x起点, 边线y起点, 边线长度, 边线宽度
        let football, borderStartX, borderStartY, bLength, shootTarget, shootTargetX, shootTargetY, footballPosX, footballPosY, distanceX, distanceY, tan, radian, V0
        football = this.footballfield.football
        borderStartX = footballfield.startX
        borderStartY = footballfield.startY
        bLength = footballfield.borderLength
        footballPosX = football.posX
        footballPosY = football.posY
        //如果指定了球门
        if (direction && direction !== "auto") {
            shootTarget = shootMethod(direction, target)
            shootTargetX = shootTarget.targetX
            shootTargetY = shootTarget.targetY
            distanceX = shootTargetX - footballPosX
            distanceY = shootTargetY - footballPosY
            tan = Math.abs(distanceY) / Math.abs(distanceX)
            radian = Math.atan(tan)
            if (abs(distanceX) && abs(distanceY)) {
                radian = radian
            }
            else if (abs(distanceX) && !abs(distanceY)) {
                radian = Math.PI * 2 - radian
            }
            else if (!abs(distanceX) && abs(distanceY)) {
                radian = Math.PI - radian
            }
            else if (!abs(distanceX) && !abs(distanceY)) {
                radian += Math.PI
            }
            this.run(60, { radian: radian, strength: strength })
        }
        //否则获得最近的球门位置
        else {
            let distanceLeft = Math.abs(borderStartX - footballPosX)
            let distanceRight = Math.abs(borderStartX + bLength - footballPosX)
            if (distanceLeft > distanceRight) {
                direction = "right"
                shootTarget = shootMethod(direction, target)
                shootTargetX = shootTarget.targetX
                shootTargetY = shootTarget.targetY
                distanceX = shootTargetX - footballPosX
                distanceY = shootTargetY - footballPosY
                tan = Math.abs(distanceY) / Math.abs(distanceX)
                radian = Math.atan(tan)
                if (abs(distanceX) && abs(distanceY)) {
                    radian = radian
                }
                else if (abs(distanceX) && !abs(distanceY)) {
                    radian = Math.PI * 2 - radian
                }
                else if (!abs(distanceX) && abs(distanceY)) {
                    radian = Math.PI - radian
                }
                else if (!abs(distanceX) && !abs(distanceY)) {
                    radian += Math.PI
                }
                this.run(60, { radian: radian, strength: strength })
            }
            else if (distanceLeft <= distanceRight) {
                direction = "left"
                shootTarget = shootMethod(direction, target)
                shootTargetX = shootTarget.targetX
                shootTargetY = shootTarget.targetY
                distanceX = shootTargetX - footballPosX
                distanceY = shootTargetY - footballPosY
                tan = Math.abs(distanceY) / Math.abs(distanceX)
                radian = Math.atan(tan)
                if (abs(distanceX) && abs(distanceY)) {
                    radian = radian
                }
                else if (abs(distanceX) && !abs(distanceY)) {
                    radian = Math.PI * 2 - radian
                }
                else if (!abs(distanceX) && abs(distanceY)) {
                    radian = Math.PI - radian
                }
                else if (!abs(distanceX) && !abs(distanceY)) {
                    radian += Math.PI
                }
                this.run(60, { radian: radian, strength: strength })
            }
        }
        function shootMethod(direction, target) {
            let targetX, targetY, positionStartX, positionStartY
            positionStartX = direction === "left" ? borderStartX : borderStartX + bLength
            positionStartY = borderStartY
            switch (target) {
                case "leftUp":
                    targetX = direction === "left" ? positionStartX - footballfield.meterToPx(2) : positionStartX + footballfield.meterToPx(2)
                    targetY = direction === "left" ? positionStartY + footballfield.meterToPx(37.66) : positionStartY + footballfield.meterToPx(30.34)
                    break
                case "leftDown":
                    targetX = direction === "left" ? positionStartX - footballfield.meterToPx(2) : positionStartX + footballfield.meterToPx(2)
                    targetY = direction === "left" ? positionStartY + footballfield.meterToPx(30.34) : positionStartY + footballfield.meterToPx(37.66)
                    break
                case "rightUp":
                    targetX = positionStartX
                    targetY = direction === "left" ? positionStartY + footballfield.meterToPx(37.66) : positionStartY + footballfield.meterToPx(30.34)
                    break
                case "rightDown":
                    targetX = positionStartX
                    targetY = direction === "left" ? positionStartY + footballfield.meterToPx(30.34) : positionStartY + footballfield.meterToPx(37.66)
                    break
                case "centerUp":
                    targetX = direction === "left" ? positionStartX - footballfield.meterToPx(2) : positionStartX + footballfield.meterToPx(2)
                    targetY = positionStartY + footballfield.meterToPx(34)
                    break
                case "centerDown":
                    targetX = positionStartX
                    targetY = positionStartY + footballfield.meterToPx(34)
                    break
            }
            return { targetX: targetX, targetY: targetY }
        }
        function abs(num) {
            if (typeof (num) !== "number") {
                throw new Error(`${num} is not number`)
            }
            let absNum = Math.abs(num)
            let boolean = absNum === num ? true : false
            return boolean
        }
    }
    //获得足球位置
    getFootballPosition(r, s, target, keepKick) {
        let footballField, football, radian, posX, posY
        footballField = this.footballfield
        football = footballField.football
        radian = football.radian
        posX = this.posX
        posY = this.posY
        //球员距离足球10米以内时，径直跑向它
        if (Math.sqrt((posX - football.posX) * (posX - football.posX) + (posY - football.posY) * (posY - football.posY)) <= footballfield.meterToPx(10) || !football.moving) {
            this.targetX = football.posX
            this.targetY = football.posY
        }
        else {
            //提前量
            let distance = footballfield.meterToPx(8)
            if (radian <= Math.PI / 2) {
                this.targetX = football.posX + distance * Math.cos(radian)
                this.targetY = football.posY + distance * Math.sin(radian)
            }
            else if (radian > Math.PI / 2 && radian <= Math.PI) {
                this.targetX = football.posX - distance * Math.sin(radian - Math.PI / 2)
                this.targetY = football.posY + distance * Math.cos(radian - Math.PI / 2)
            }
            else if (radian > Math.PI && radian <= Math.PI / 2 * 3) {
                this.targetX = football.posX - distance * Math.cos(radian - Math.PI)
                this.targetY = football.posY - distance * Math.sin(radian - Math.PI)
            }
            else if (radian > Math.PI / 2 * 3) {
                this.targetX = football.posX + distance * Math.cos(Math.PI * 2 - radian)
                this.targetY = football.posY - distance * Math.sin(Math.PI * 2 - radian)
            }
        }
        if (Math.sqrt((posX - football.posX) * (posX - football.posX) + (posY - football.posY) * (posY - football.posY)) <= footballfield.meterToPx(1)) {
            if (!target) {
                football.stop()
                setTimeout(() => {
                    this.kickBall(this.caculateRadian(r), this.caculateStrength(s), keepKick)
                }, 1000 / 60)
                return
            }
            else {
                football.stop()
                setTimeout(() => {
                    this.kickBallTarget(r, s, keepKick)
                }, 1000 / 60)
            }
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
        radius = footballfield.meterToPx(1)
        //画出球员
        this.ctx.fillStyle = "white"
        this.ctx.beginPath()
        this.ctx.moveTo(arcStartX, arcStartY)
        this.ctx.arc(arcStartX, arcStartY, radius, 0, Math.PI * 2)
        this.ctx.fill()
    }
    createVNum() {
        let VNum = this.random(1, 99)
        return VNum
    }
    //爆发力和体力
    createPower() {
        let power = this.random(1, 99)
        return power
    }
    createPhysical() {
        let physical = this.random(1, 99)
        return physical
    }
    createStrength() {
        let strength = this.random(1, 99)
        return strength
    }
    createTechnique() {
        let technique = this.random(1, 99)
        return technique
    }
    random(min, max) {
        let result = Math.random() * (max - min + 1) + min
        result = Math.floor(result)
        return result
    }
    joinFootballfield(object) {
        if (object instanceof FootballField) {
            this.footballfield = object
            this.ctx = object.playerCanvasCtx
        }
        else {
            throw new Error("joinFootballfield的参数不是FootballField类的实例")
        }
    }
    //param: 刷新率, 参数对象, 是否是第二种踢球方法, 是否一直保持踢球
    run(refresh, runParam, target, keepKick) {
        //表明球员在移动
        this.moving = true
        //随机定一个目的地（和原位置不同）
        //this.setTarget()
        //因为每次刷新都要重新计算足球的位置，所以所有距离相关语句都要写进回调里了

        //球员当前坐标，x、y距目标距离，距目标直线距离，刷新帧数，每帧移动距离
        let posX, posY, distanceX, distanceY, riceLength, fps, stepDistance
        //判断往x，y的哪个方向走,true为正方向
        let x, y
        //每帧X移动距离，每帧Y移动距离，当前总直线移动距离，当前帧的系统时间，上一帧系统时间，加速总时间，当前速度
        let stepMoveX, stepMoveY, newDistance, currentTime, lastTime, throughSpeedUp, currentV
        newDistance = 0
        //最高速度
        let VMax = this.VMax
        //加速到最高速度时间
        let speedUpTime = this.caculatePower()
        //保持最高速度时间
        let speedHoldTime = this.caculatePhysical()
        //开始跑动的时间
        let date = new Date()
        let startTime = date.getTime()
        let football = this.footballfield.football
        return new Promise((resolve) => {
            //动画帧函数，用箭头函数是为了不用另外保存this
            let animate = () => {
                //先判断球员要不要移动
                if (!this.moving) {
                    resolve()
                    return
                }

                //之前给canvas加了个原型方法用来清除圆形，但清除之前的圆会导致其他被之经过的圆也被清除，看了GitHub其他人的办法，改用清除整个画布重绘的方法
                /*footballfield.clearArc(this.ctx, this.posX, this.posY, footballfield.meterToPx(2) + 0.8, 1)*/

                //直角三角形tan值，用于已知移动距离计算x，y坐标值; date，储存时间单位; time，相差时间
                let tan, date, time
                //如果存在runParam.onlyRun,球员只是奔跑不去追球
                if (!runParam || !runParam.onlyRun) {
                    //跟踪足球位置
                    let targetObject
                    if (runParam && runParam.targetX) {
                        if (typeof (runParam.targetX) !== "number") {
                            let carry = new Carrying(this)
                            targetObject = carry.oneMeterPosition()
                            this.getFootballPosition(targetObject.targetX, targetObject.targetY, target, keepKick)
                        }
                        else {
                            this.getFootballPosition(runParam.targetX, runParam.targetY, target, keepKick)
                        }
                    }
                    else if (runParam && runParam.radian) {
                        this.getFootballPosition(runParam.radian, runParam.strength, target, keepKick)
                    }
                    else {
                        this.getFootballPosition(undefined, undefined, target, keepKick)
                    }
                }
                posX = this.posX
                posY = this.posY
                if (!this.targetX || !this.targetY) {
                    this.setTarget()
                }
                distanceX = this.targetX - posX
                distanceY = this.targetY - posY
                x = Math.abs(distanceX) === distanceX ? true : false
                y = Math.abs(distanceY) === distanceY ? true : false
                riceLength = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
                //刷新率
                fps = refresh
                tan = Math.abs(distanceX) / Math.abs(distanceY)
                //此时球员的运动方向（弧度）
                if (!Carrying.radian) {
                    this.radian = Math.atan(tan)
                }
                else {
                    if (football.bounce) {
                        football.bounce = false
                        Carrying.radian = football.radian
                    }
                }
                //如果未到达目标距离
                if (newDistance < riceLength) {
                    //如果离目标点超过3米
                    if (newDistance < riceLength - footballfield.meterToPx(3)) {
                        if (!throughSpeedUp) {
                            //经过的时间
                            date = new Date()
                            currentTime = date.getTime()
                            time = currentTime - startTime
                            throughSpeedUp = time
                            lastTime = currentTime
                        }
                        else {
                            date = new Date()
                            currentTime = date.getTime()
                            time = currentTime - lastTime
                            throughSpeedUp += time
                            lastTime = currentTime
                        }
                        //如果经过的时间小于等于speedUpTime ：V = time / speedUpTime * VMax，如果经过的时间大于speedUpTime小于等于speedHoldTime : V = VMax，如果经过的时间大于speedHoldTime : V = speedHoldTime / time * VMax。stepDistance = V / 60
                        if (throughSpeedUp <= speedUpTime * 1000) {
                            this.currentV = currentV = throughSpeedUp / speedUpTime / 1000 * VMax
                        }
                        else if (throughSpeedUp > speedUpTime * 1000 && throughSpeedUp <= speedHoldTime * 1000) {
                            this.currentV = currentV = VMax
                        }
                        else if (throughSpeedUp > speedHoldTime * 1000) {
                            this.currentV = currentV = speedHoldTime * 1000 / throughSpeedUp * VMax
                            //不会无限制降低的，最低为最高速度的70%
                            this.currentV = currentV = Math.max(currentV, 0.7 * VMax)
                        }
                    }
                    //如果离目标点不到3米
                    else {
                        //如果从远处跑到了距离目标3米之内（因为currentV存在且速度不低，说明在3米之外有跑动）
                        if (currentV) {
                            date = new Date()
                            currentTime = date.getTime()
                            lastTime = currentTime
                            //在3米内从currentV速度直线匀减速到0
                            //加速度（每秒速度变化值）
                            let a = currentV * currentV / 3 * 2
                            //减速时要转化成每帧加速度
                            currentV -= a / fps
                            //不能减成负值，也不能减到0，因为考虑到足球运动时可能造成的问题 
                            this.currentV = currentV = Math.max(currentV, 3)
                        }
                        //如果一开始目标就不足3米，加速到最后1米匀减速
                        else {
                            if (!throughSpeedUp) {
                                //经过的时间
                                date = new Date()
                                currentTime = date.getTime()
                                time = currentTime - startTime
                                throughSpeedUp = time
                                lastTime = currentTime
                            }
                            else {
                                date = new Date()
                                currentTime = date.getTime()
                                time = currentTime - lastTime
                                throughSpeedUp += time
                                lastTime = currentTime
                            }
                            //距离目标超过1米
                            if (newDistance < riceLength - footballfield.meterToPx(1)) {
                                this.currentV = currentV = throughSpeedUp / speedUpTime * 1000 * VMax
                            }
                            //距离目标1米内匀减速（一个例外：如果一开始目标就不足1米，那么一直保持加速，到目标瞬间停止，因为1米加速并不快）
                            else {
                                if (currentV) {
                                    //在1米内从currentV速度直线匀减速到0
                                    //加速度（每秒速度变化值）
                                    let a = currentV * currentV / 1 * 2
                                    //减速时要转化成每帧加速度
                                    currentV -= a / fps
                                    //不能减成负值，也不能减到0，因为考虑到足球运动时可能造成的问题 
                                    this.currentV = currentV = Math.max(currentV, 3)
                                }
                                //如果一开始目标就不足1米
                                else {
                                    //一直保持加速，直到到达目标，到达目标会有其他的逻辑判断让它停止
                                    this.currentV = currentV = throughSpeedUp / speedUpTime * 1000 * VMax
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
                    this.posX = x ? this.posX + stepMoveX : this.posX - stepMoveX
                    this.posY = y ? this.posY + stepMoveY : this.posY - stepMoveY
                }
                //如果到达目标距离
                else {
                    if (this.moving && this.footballfield.football.moving) {
                        //未到达目标距离，继续调用动画帧函数
                        newDistance = Math.sqrt((this.posX - posX) * (this.posX - posX) + (this.posY - posY) * (this.posY - posY))
                        requestAnimationFrame(animate)
                        return
                    }
                    else {
                        resolve()
                        return
                    }
                }
                //未到达目标距离，继续调用动画帧函数
                newDistance = Math.sqrt((this.posX - posX) * (this.posX - posX) + (this.posY - posY) * (this.posY - posY))
                requestAnimationFrame(animate)
            }
            animate()
        }
        )
    }
    caculateDifferenceRadianAndStrength() {
        let football = this.footballfield.football
        let kickRadian = this.kickRadian
        let currentRadian = this.radian
        let footballRadian = football.radian
        let radianCoefficient, strengthCoefficient, differenceRdian, result = {}
        if (!this.moving && !football.moving) {
            radianCoefficient = 1
            result = { radian: radianCoefficient, strength: radianCoefficient }
            return result
        }
        else if (this.moving && !football.moving) {
            differenceRdian = Math.abs(kickRadian - currentRadian)
            let boolean = Math.random()
            if (boolean >= 0 && boolean < 0.5) {
                radianCoefficient = 1 + (differenceRdian / Math.PI + 1) / 10
            }
            else {
                radianCoefficient = 1 - (differenceRdian / Math.PI + 1) / 10
            }
            result = { radian: radianCoefficient, strength: radianCoefficient }
            return result
        }
        else if (!this.moving && football.moving) {
            differenceRdian = Math.abs(footballRadian - kickRadian)
            if (differenceRdian > Math.PI / 2) {
                differenceRdian = Math.PI - differenceRdian
            }
            radianCoefficient = differenceRdian / 3
            let boolean = Math.random()
            if (boolean >= 0 && boolean < 0.5) {
                radianCoefficient = radianCoefficient
            }
            else {
                radianCoefficient = -radianCoefficient
            }
            return radianCoefficient
        }
        else if (this.moving && football.moving) {
            let differenceRdian1, differenceRdian2, differenceStrength
            //踢的方向和足球运动方向差值
            differenceRdian1 = Math.abs(kickRadian - footballRadian)
            if (differenceRdian1 > Math.PI / 2 && differenceRdian1 <= Math.PI) {
                differenceRdian1 = Math.PI - differenceRdian1
            }
            else if (differenceRdian1 > Math.PI && differenceRdian1 <= Math.PI / 2 * 3) {
                differenceRdian1 = differenceRdian1 - Math.PI
            }
            else if (differenceRdian1 > Math.PI / 2 * 3 && differenceRdian1 <= Math.PI * 2) {
                differenceRdian1 = Math.PI * 2 - differenceRdian1
            }
            differenceRdian2 = Math.abs(kickRadian - currentRadian)
            differenceRdian = differenceRdian1 + differenceRdian2
            let boolean1 = Math.random()
            if (boolean1 >= 0 && boolean1 < 0.5) {
                radianCoefficient = 1 + (differenceRdian / Math.PI + 1) / 10
            }
            else {
                radianCoefficient = 1 - (differenceRdian / Math.PI + 1) / 10
            }
            differenceStrength = Math.abs(kickRadian - currentRadian)
            strengthCoefficient = 1 - (differenceStrength / Math.PI + 1) / 10
            result = { radian: radianCoefficient, strength: strengthCoefficient }
            return result
        }
    }
    caculateRadian(radian) {
        //根据技术值算的动作成功率
        let percent = this.caculateTechnique()
        //踢球的角度方向，可使用参数
        let kickRadian = radian || this.random(0, Math.PI * 2)
        this.kickRadian = kickRadian
        //根据奔跑角度、足球运动角度、动静状态综合算出来的系数
        let coefficient = this.caculateDifferenceRadianAndStrength()
        if ([].toString.call(coefficient) === "[object Object]") {
            this.kickRadian = kickRadian * coefficient.radian
        }
        else if ([].toString.call(coefficient) === "[object Number]") {
            this.kickRadian = kickRadian * percent + coefficient
            if (this.kickRadian < 0) {
                this.kickRadian = Math.PI * 2 - Math.abs(this.kickRadian)
            }
            return kickRadian
        }
        //考虑进根据技术值算的浮动
        this.kickRadian = kickRadian * percent
        return kickRadian
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
    caculateStrength(strength) {
        //如果输入的力量值大于球员力量值, 那么等于球员力量值
        if (strength > this.strength) {
            strength = this.strength
        }
        //根据技术值算的动作成功率
        let percent = this.caculateTechnique()
        //球速的浮动不可能超过球员的极限，超过上限的浮动往下计算
        if (percent > 1) {
            percent = 1 - (percent - 1)
        }
        strength = strength || this.strength
        //根据奔跑角度、足球运动角度、动静状态综合算出来的系数
        let coefficient = this.caculateDifferenceRadianAndStrength()
        if ([].toString.call(coefficient) === "[object Object]") {
            strength = strength * coefficient.strength
        }
        else if ([].toString.call(coefficient) === "[object Number]") {
            strength = strength
        }
        //最大球速与力量之间的线性关系
        let footballVMax = (45 * strength + 180) / 98
        let playerRadian, kickRadian, differenceRdian
        //奔跑的角度
        playerRadian = this.radian
        //踢球的角度
        kickRadian = this.kickRadian
        //角度差值
        differenceRdian = Math.abs(playerRadian - kickRadian)
        //如果奔跑的方向和踢球的方向一样，球速会快40%；反之会降低40%；我假设变化呈线性关系
        if (differenceRdian >= 0 && differenceRdian <= Math.PI) {
            footballVMax = footballVMax * (1.4 - differenceRdian * 0.8 / Math.PI)
        }
        else if (differenceRdian > Math.PI && differenceRdian <= Math.PI * 2) {
            footballVMax = footballVMax * (1.4 - (Math.PI * 2 - differenceRdian) * 0.8 / Math.PI)
        }
        //考虑进根据技术值算的浮动
        footballVMax = footballVMax * percent
        return footballVMax
    }
    caculateTechnique() {
        let technique, percent, randomNum, result
        technique = this.technique
        //技术值与浮动的线性关系
        percent = (technique * 0.39 + 58.41) / 98
        //percent几率，动作会较成功（即与理论值相差10%之内）
        randomNum = Math.random()
        if (randomNum <= percent) {
            result = this.random(90, 110) / 100
            return result
        }
        //1-percent几率，动作会发挥失常（与理论值相差10%—50%） 有瑕疵：感觉这种实现不是很漂亮
        else {
            let half = Math.random()
            if (half < 0.5) {
                result = this.random(50, 89) / 100
                return result
            }
            else {
                result = this.random(111, 150) / 100
                return result
            }
        }
    }
    stop() {
        this.moving = undefined
    }
}