let footballField = footballfield.factory("football", 105, 68)

//创建球员，设置球员位置，创建足球并设置足球位置，选择球员或足球的动作，执行动作
let createPlayerButton, createPlayerPositionButton, createFootballPositionButton, action_select, action_execute
createPlayerButton = getDom("#createPlayer")
createPlayerButton.onclick = createPlayer

createPlayerPositionButton = getDom("#createPlayerPosition")
createPlayerPositionButton.onclick = createPlayerPosition

createFootballPositionButton = getDom("#createFootballPosition")
createFootballPositionButton.onclick = createFootballPosition

action_select = getDom(".action_select")
for (let i = 0; i < action_select.length; i++) {
    action_select[i].onchange = showDiffPara
}
window.onload = showDiffPara

action_execute = getDom("#action_execute")
action_execute.onclick = executeAction

//创建球员方法
function createPlayer(event) {
    let VNum, power, physical, strength, technique, footballPlayer, length, allPlayerIndexSelect
    event.preventDefault()
    VNum = parseFloat(getDom("#VNum").value)
    power = parseFloat(getDom("#power").value)
    physical = parseFloat(getDom("#physical").value)
    strength = parseFloat(getDom("#strength").value)
    technique = parseFloat(getDom("#technique").value)
    footballPlayer = player.factory("football", { VNum: VNum, power: power, physical: physical, strength: strength, technique: technique })
    footballField.addObject(footballPlayer)
    length = footballField.footballPlayers.length
    allPlayerIndexSelect = getDom(".playerIndex")
    for (let i = 0; i < allPlayerIndexSelect.length; i++) {
        allPlayerIndexSelect[i].innerHTML = ""
        for (let j = 1; j <= length; j++) {
            let option = document.createElement("option")
            option.value = j
            option.innerHTML = j
            allPlayerIndexSelect[i].appendChild(option)
        }
    }
}

//设置球员位置方法
function createPlayerPosition(event) {
    let playerArray, playerIndex, player, posX, posY, setPosition
    event.preventDefault()
    playerIndex = getDom("#playerIndex1").value
    posX = getDom("#playerPosX").value
    posY = getDom("#playerPosY").value
    posX = parseFloat(posX)
    posY = parseFloat(posY)
    playerArray = footballField.footballPlayers
    player = playerArray[playerIndex - 1]
    setPosition = interface(player, "setPosition")
    setPosition(posX, posY)
}

//创建足球并设置足球位置
function createFootballPosition(event) {
    let posX, posY, ball
    event.preventDefault()
    ball = football.factory("football")
    posX = parseFloat(getDom("#footballPosX").value)
    posY = parseFloat(getDom("#footballPosY").value)
    setPosition = interface(ball, "setPosition")
    setPosition(posX, posY)
    footballField.addObject(ball)
}

//执行球员或足球的动作
function executeAction(event) {
    event.preventDefault()
    //动作类型
    let type = getDom(".action_select")[0].value
    let playerIndex, radian, player, run
    switch (type) {
        case "run":
            playerIndex = getDom("#playerIndex2").value
            let playerTargetX = parseFloat(getDom("#action_targetX").value)
            let playerTargetY = parseFloat(getDom("#action_targetY").value)
            if (typeof (playerTargetX) !== "number" || typeof (playerTargetY) !== "number") {
                throw new Error(`${playerTargetX} or ${playerTargetY} is not number`)
            }
            playerTargetX = footballfield.startX + playerTargetX > footballfield.startX + footballfield.borderLength ? footballfield.startX + footballfield.borderLength : footballfield.startX + playerTargetX
            playerTargetY = footballfield.startY + playerTargetY > footballfield.startY + footballfield.borderWidth ? footballfield.startY + footballfield.borderWidth : footballfield.startY + playerTargetY
            player = footballField.footballPlayers[playerIndex - 1]
            //检测player是否满足接口，若满足则设置它们的属性
            player = interface(player, "targetX", playerTargetX)
            player = interface(player, "targetY", playerTargetY)
            run = interface(player, "run")
            //第二个参数为true代表球员只做奔跑动作，不跟随球
            run(60, { onlyRun: true }, undefined)
            break
        case "footballScroll":
            radian = getDom("#action_footballRadian").value
            radian = parseFloat(radian)
            radian = radian * Math.PI / 180
            let V0 = getDom("#action_footballV0").value
            V0 = parseFloat(V0)
            if (typeof (radian) !== "number" || typeof (V0) !== "number") {
                throw new Error(`${radian} or ${V0} is not number`)
            }
            let ball
            ball = footballField.football
            ball = interface(ball, "radian", radian)
            ball = interface(ball, "V0", V0)
            run = interface(ball, "run")
            run(60)
            break
        case "kick":
            playerIndex = getDom("#playerIndex3").value
            radian = getDom("#action_playerRadian").value
            radian = parseFloat(radian)
            radian = radian * Math.PI / 180
            let strength = getDom("#action_playerStrength").value
            strength = parseFloat(strength)
            if (typeof (radian) !== "number" || typeof (strength) !== "number") {
                throw new Error(`${radian} or ${strength} is not number`)
            }
            player = footballField.footballPlayers[playerIndex - 1]
            run = interface(player, "run")
            run(60, { radian: radian, strength: strength }, undefined)
            break
    }
}

//获取元素
function getDom(para, parentNode) {
    if (typeof (para) !== "string") {
        throw new Error(`${para} must be string`)
    }
    parentNode = parentNode || document
    //正则: 满足类或者TagName
    let reg = /^(\.|[a-zA-Z]).*$/g
    if (reg.test(para)) {
        return parentNode.querySelectorAll(para)
    }
    else {
        return parentNode.querySelector(para)
    }
}

//接口监测
function interface(object, property, type) {
    if (!object) {
        throw new Error(`${object} is not exist`)
    }
    if (typeof (type) === "undefined" && typeof (object[property]) === "function") {
        function method(...arg) {
            object[property].apply(object, arg)
        }
        return method
    }
    else if (typeof (type) !== "undefined" && typeof (object[property]) !== "function") {
        object[property] = type
        return object
    }
    else {
        throw new Error(`${object} don't have ${property}`)
    }
}

//根据不同的选择更换参数输入框
function showDiffPara(event) {
    let value, allParamDom, paramDom, target
    let strikingAction_execute = getDom("#strikingAction_execute")
    event = event || window.event
    //window.onload时事件对象是HTMLDocument
    if (event.target === document) {
        target = getDom(".action_select")
        allParamDom = getDom(".param")
        for (let i = 0; i < allParamDom.length; i++) {
            let paramItem = allParamDom[i]
            if (paramItem.classList.contains("show")) {
                paramItem.classList.toggle("show")
            }
        }
        for (let i = 0; i < target.length; i++) {
            value = target[i].value
            paramDom = getDom("#" + value)
            if (paramDom) paramDom.classList.add("show")
        }
        strikingAction_execute.setAttribute("currentValue", target[1].value)
    }
    else {
        target = event.target
        value = target.value
        allParamDom = getDom(".param", target.parentNode)
        for (let i = 0; i < allParamDom.length; i++) {
            let paramItem = allParamDom[i]
            if (paramItem.classList.contains("show")) {
                paramItem.classList.toggle("show")
            }
        }
        paramDom = getDom("#" + value)
        if (paramDom) {
            paramDom.classList.add("show")
            if (target.id === "moreActionSelect") strikingAction_execute.setAttribute("currentValue", target.value)
        }
        else throw new Error(`Dom that id is "${value}" don't exist`)
    }
}

function start() {
    let ball = football.factory("football")
    let player1 = player.factory("football", { VNum: 99, power: 60, physical: 60, strength: 70, technique: 50 })
    let player2 = player.factory("football", { VNum: 90, power: 43, physical: 67, strength: 50, technique: 30 })
    let player3 = player.factory("football", { VNum: 80, power: 67, physical: 54, strength: 95, technique: 40 })
    let player4 = player.factory("football", { VNum: 70, power: 45, physical: 78, strength: 56, technique: 80 })
    let player5 = player.factory("football", { VNum: 60, power: 56, physical: 80, strength: 78, technique: 60 })
    let player6 = player.factory("football", { VNum: 50, power: 78, physical: 52, strength: 80, technique: 10 })
    let player7 = player.factory("football", { VNum: 40, power: 84, physical: 67, strength: 90, technique: 20 })
    let player8 = player.factory("football", { VNum: 30, power: 97, physical: 45, strength: 62, technique: 70 })

    footballField.addObject(ball)
    footballField.addObject(player1)
    footballField.addObject(player2)
    footballField.addObject(player3)
    footballField.addObject(player4)
    footballField.addObject(player5)
    footballField.addObject(player6)
    footballField.addObject(player7)
    footballField.addObject(player8)

    move()

    async function move() {
        let b = ball.run(60)
        let p1 = player1.run(60, {}, undefined, "keepKick")
        let p2 = player2.run(60, {}, undefined, "keepKick")
        let p3 = player3.run(60, {}, undefined, "keepKick")
        let p4 = player4.run(60, {}, undefined, "keepKick")
        let p5 = player5.run(60, {}, undefined, "keepKick")
        let p6 = player6.run(60, {}, undefined, "keepKick")
        let p7 = player7.run(60, {}, undefined, "keepKick")
        let p8 = player8.run(60, {}, undefined, "keepKick")
        /*await b
        await p1
        await p2
        await p3
        await p4
        await p5
        await p6
        await p7
        await p8
        cancelAnimationFrame(footballfield.animate)*/
    }
}




/*let player1 = footballField.footballPlayers[0]
let carry = new Carrying(player1)
carry.carrying()*/