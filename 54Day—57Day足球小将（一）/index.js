let footballField = footballfield.factory("football", 105, 68)

let player1 = player.factory("football", { VNum: 60, power: 60, physical: 60 })
let player2 = player.factory("football", { VNum: 34, power: 12, physical: 67 })
let player3 = player.factory("football", { VNum: 56, power: 34, physical: 54 })
let player4 = player.factory("football", { VNum: 67, power: 45, physical: 78 })
let player5 = player.factory("football", { VNum: 87, power: 56, physical: 80 })
let player6 = player.factory("football", { VNum: 78, power: 78, physical: 34 })
let player7 = player.factory("football", { VNum: 98, power: 84, physical: 67 })
let player8 = player.factory("football", { VNum: 44, power: 97, physical: 45 })

footballField.add(player1)
footballField.add(player2)
footballField.add(player3)
footballField.add(player4)
footballField.add(player5)
footballField.add(player6)
footballField.add(player7)
footballField.add(player8)

move()

async function move() {
    let p1 = player1.run(60)
    let p2 = player2.run(60)
    let p3 = player3.run(60)
    let p4 = player4.run(60)
    let p5 = player5.run(60)
    let p6 = player6.run(60)
    let p7 = player7.run(60)
    let p8 = player8.run(60)
    await p1
    await p2
    await p3
    await p4
    await p5
    await p6
    await p7
    await p8
    cancelAnimationFrame(footballfield.animate)
}