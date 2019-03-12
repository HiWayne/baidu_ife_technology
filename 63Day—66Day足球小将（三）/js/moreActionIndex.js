//射门按钮, 带球按钮, 停球按钮, 传球按钮
let onePressButton, shootButton, carryingButton, stopBallButton, passButton

onePressButton = getDom("#onePressButton")
onePressButton.onclick = createAllPlayers

strikingAction_executeButton = getDom("#strikingAction_execute")
strikingAction_execute.onclick = strikingAction

function createAllPlayers(event) {
    event = event || window.event
    event.preventDefault()
    start()
}

function strikingAction(event) {
    event = event || window.event
    event.preventDefault()
    let target = event.target
    let action = target.getAttribute("currentValue")
    let footballPlayers = footballField.footballPlayers
    let playerIndex, player, targetPlayerIndex, targetPlayer
    switch (action) {
        case "shoot":
            playerIndex = getDom("#playerIndex4").value
            player = footballPlayers[playerIndex - 1]
            let shoot_direction = getDom("#shoot_direction").value
            let shoot_target = getDom("#shoot_target").value
            let shoot_strength = getDom("#shoot_strength").value
            player.shoot(shoot_target, shoot_strength, shoot_direction)
            break
        case "carrying":
            playerIndex = getDom("#playerIndex5").value
            player = footballPlayers[playerIndex - 1]
            player.carrying()
            break
        case "stopBall":
            playerIndex = getDom("#playerIndex6").value
            player = footballPlayers[playerIndex - 1]
            player.stopBall()
            break
        case "pass":
            playerIndex = getDom("#playerIndex7").value
            targetPlayerIndex = getDom("#playerIndex8").value
            player = footballPlayers[playerIndex - 1]
            targetPlayer = footballPlayers[targetPlayerIndex - 1]
            player.pass(targetPlayer)
            break
    }
}