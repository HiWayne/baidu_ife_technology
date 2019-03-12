//踢球类, 球员类中的踢球方法接受的参数是角度和力量, 它接受的参数是坐标
class Kick {
    constructor(player) {
        if (!player || !player.footballfield || !player.footballfield.football) {
            throw new TypeError(`${player} is not legal`)
        }
        this.player = player
    }
    kickBall(targetX, targetY) {
        let football = this.player.footballfield.football
        method.call(football, targetX, targetY)
        function method(targetX, targetY) {
            let ballCurrentPositionX, ballCurrentPositionY, differentX, differentY, distance, t, a, V0, tan, radian, booleandifferentX, booleandifferentY
            ballCurrentPositionX = this.posX
            ballCurrentPositionY = this.posY
            differentX = targetX - ballCurrentPositionX
            differentY = targetY - ballCurrentPositionY
            tan = Math.abs(differentY) / Math.abs(differentX)
            radian = Math.atan(tan)
            booleandifferentX = abs(differentX)
            booleandifferentY = abs(differentY)
            if (booleandifferentX && booleandifferentY) {
                radian = radian
            }
            else if (booleandifferentX && !booleandifferentY) {
                radian = Math.PI * 2 - radian
            }
            else if (!booleandifferentX && booleandifferentY) {
                radian = Math.PI - radian
            }
            else if (!booleandifferentX && !booleandifferentY) {
                radian += Math.PI
            }
            distance = Math.sqrt(differentX * differentX + differentY * differentY)
            distance = footballfield.pxToMeter(distance)
            a = this.a
            t = Math.sqrt(2 * distance / a)
            V0 = a * t
            this.V0 = V0
            this.radian = radian
            this.run(60)
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
    oneMeterPosition() {
        if (this.constructor === Kick) {
            throw new Error(`${this} is constructed by Kick`)
        }
        let currentV = this.player.VMax
        let radian = Carrying.radian
        let football = this.player.footballfield.football
        let targetX, targetY
        if (radian <= Math.PI / 2) {
            targetX = football.posX + currentV * Math.cos(radian)
            targetY = football.posY + currentV * Math.sin(radian)
        }
        else if (radian > Math.PI / 2 && radian <= Math.PI) {
            targetX = football.posX - currentV * Math.sin(radian - Math.PI / 2)
            targetY = football.posY + currentV * Math.cos(radian - Math.PI / 2)
        }
        else if (radian > Math.PI && radian <= Math.PI / 2 * 3) {
            targetX = football.posX - currentV * Math.cos(radian - Math.PI)
            targetY = football.posY - currentV * Math.sin(radian - Math.PI)
        }
        else if (radian > Math.PI / 2 * 3) {
            targetX = football.posX + currentV * Math.cos(Math.PI * 2 - radian)
            targetY = football.posY - currentV * Math.sin(Math.PI * 2 - radian)
        }
        return { targetX: targetX, targetY: targetY }
    }
}
//停球类, 一种特殊的踢球（踢到脚下或者身边不远处）, 所以它以踢球类为父类继承它
class StopBall extends Kick {
    constructor(player) {
        super(player)
    }
    stopBall() {
        let football = this.player.footballfield.football
        let footballPosX = football.posX
        let footballPosY = football.posY
        let playerPosX = this.player.posX
        let playerPosY = this.player.posY
        let distance = Math.sqrt((footballPosX - playerPosX) * (footballPosX - playerPosX) + (footballPosY - playerPosY) * (footballPosY - playerPosY))
        if (!this.player.moving) {
            if (!football.moving && distance > footballfield.meterToPx(1)) {
                alert(`球员和足球距离超过1米，做不到停球`)
                return
            }
            this.kickBall(this.player.posX, this.player.posY)
        }
        else if (this.player.moving) {
            football.stop()
            setTimeout(() => {
                let target = this.oneMeterDistance()
                this.kickBall(target.targetX, target.targetY)
            }, 1000 / 60)
        }
    }
}
//传球类, 同样是一种特殊的踢球, 写成踢球类的子类
class Pass extends Kick {
    constructor(player) {
        super(player)
    }
    pass(targetPlayer) {
        if (!targetPlayer.moving) {
            this.player.run(60, { targetX: targetPlayer.posX, targetY: targetPlayer.posY }, "target", undefined)
        }
        else if (targetPlayer.moving) {
            function arrive() {

            }
        }
    }
}
//带球类
class Carrying extends Kick {
    constructor(player) {
        if (typeof (player["run"]) !== "function" || typeof (player["getFootballPosition"]) !== "function") {
            throw new Error(`${player} don't have method: run`)
        }
        super(player)
    }
    carrying() {
        let football = this.player.footballfield.football
        let footballPosX = football.posX
        let footballPosY = football.posY
        let player = this.player
        let playerPosX = player.posX
        let playerPosY = player.posY
        let differentX = footballPosX - playerPosX
        let differentY = footballPosY - playerPosY
        let distance = Math.sqrt(differentX * differentX + differentY * differentY)
        let tan = Math.abs(differentY) / Math.abs(differentX)
        let radian = Math.atan(tan)
        if (abs(differentX) && abs(differentY)) {
            radian = radian
        }
        else if (abs(differentX) && !abs(differentY)) {
            radian = Math.PI * 2 - radian
        }
        else if (!abs(differentX) && abs(differentY)) {
            radian = Math.PI - radian
        }
        else if (!abs(differentX) && !abs(differentY)) {
            radian += Math.PI
        }
        Carrying.radian = radian
        player.run(60, { targetX: true, targetY: true }, "target")
        function abs(num) {
            if (typeof (num) !== "number") {
                throw new Error(`${num} is not number`)
            }
            let absNum = Math.abs(num)
            let boolean = absNum === num ? true : false
            return boolean
        }
    }
}