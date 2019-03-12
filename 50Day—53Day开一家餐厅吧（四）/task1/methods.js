//对象深复制方法
function objExtend(obj) {
    if (!obj) return new Error("need parame: object")
    if (typeof (obj) !== "object") return new Error("parame isn't Object")
    target = Array.isArray(obj) ? [] : {}
    copy(target, obj)
    function copy(target, copied) {
        for (let i in copied) {
            if (copied[i] && typeof (copied[i]) === "object") {
                target[i] = Array.isArray(copied[i]) ? [] : {}
                copy(target[i], copied[i])
            }
            else {
                target[i] = copied[i]
            }
        }
    }
    return target
}

//顾客随机到来方法
function customerCome() {
    let num = random(0, 4)
    for (let i = 0, len = num; i < len; i++) {
        if (customers.length >= customersLength) break
        let customer = new Customer(randomSelect(1, 1, customerNames, "这是随机顾客的方法"))
        customers.push(customer)
    }
    restaurantAddCustomer()
}
//餐厅有空位就入座方法
function restaurantAddCustomer(key) {
    let seats = restaurant.seats
    let resCustomer = restaurant.customer
    let emptySeats = seats - resCustomer.length
    if (!emptySeats) return
    else if (customers.length) {
        let customer = customers.shift()
        if (typeof (key) === "number") {
            let len = restaurant.customer.length
            //如果用push会触发另一个restaurantAddCustomer，key值还是之前的key，会导致两个顾客key一样
            customer.key = key
            restaurant.customer[len] = customer
            console.log(`进入的顾客key${customer.key}`)
        }
        else {
            let keys = [0, 1, 2]
            switch (emptySeats) {
                case 1:
                    onlyKey()
                    customer.key = keys[0]
                    break
                case 2:
                    onlyKey()
                    customer.key = keys[0]
                    break
                case 3:
                    customer.key = 0
                    break
            }
            //防止出现[key=1, key=2]，然后push进key=2这种情况
            function onlyKey() {
                for (let i in resCustomer) {
                    let key = resCustomer[i].key
                    console.log("resCustomer现在有key=" + key)
                    if (keys.indexOf(key) !== -1) {
                        let index = keys.indexOf(key)
                        keys.splice(index, 1)
                    }
                }
                console.log("onlyKey=" + keys[0])
            }
            restaurant.customer.push(customer)
        }
        console.log(`${customer.name}入座`)
    }
    return
}

//设置对象属性值方法
function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: !!enumerable,
        value: val,
        writable: true
    })
}

//数组变异方法用以监听数组改动
let newMethods = ["push", "splice", "pop", "shift", "unshift", "sort", "reverse"]
let ArrayMethod = Object.create(Array.prototype)
newMethods.forEach(function (value) {
    let TrueMethod = Array.prototype[value]
    def(ArrayMethod, value, function () {
        let arguments$1 = arguments
        let i = arguments.length
        let args = new Array(i)
        while (i--) {
            args[i] = arguments$1[i]
        }
        let result = TrueMethod.apply(this, args)
        let dep = this.dep
        dep.public(this)
        return result
    }, true)
})

//在ul中渲染customers数组方法
function customerListShow(array) {
    let ul = document.getElementById("customerList").querySelector("ul")
    ul.innerHTML = ""
    if (array.length >= 1) {
        let title = document.createElement("li")
        title.innerHTML = "排队队伍："
        ul.appendChild(title)
        for (let i = 0; i < array.length; i++) {
            let li = document.createElement("li")
            li.innerHTML = array[i].name
            ul.appendChild(li)
        }
    }
    else {
        ul.innerHTML = "现在没有顾客排队"
    }
}

//范围随机数方法
function random(min, max) {
    let num = Math.floor(Math.random() * (max - min + 1) + min)
    return num
}
//随机点菜方法
function randomSelect(min, max, menu) {
    let menus = []
    let length = menu.length
    let orderIndex = random(0, length - 1)
    let num = random(min, max)
    let i = 0
    let flag = []
    while (i < num) {
        orderIndex = random(0, length - 1)
        repid()
        flag.push(orderIndex)
        menus.push(menu[orderIndex])
        i++
        function repid() {
            for (let i = 0; i < flag.length; i++) {
                if (orderIndex === flag[i]) {
                    orderIndex = random(0, length - 1)
                    repid()
                    break
                }
            }
        }
    }
    if (arguments[3]) return menus
    let newMenus = menus.map(function (value) {
        let result = new Dishes(value)
        return result
    })
    return newMenus
}

let waiterDom = document.getElementById("waiter")
//服务员移动方法
//服务员移动方法,参数分别是要去的目标(dom节点)、移动时间(s)、刷新时间(ms)、到达目标后调用的方法(function)
function waiterSevice(target, seviceTime, refreshTime, fn) {
    let checkDistance
    let times = seviceTime * 1000 / refreshTime
    let distance = target.offsetLeft - waiterMoveDom.offsetLeft
    if (distance === 0) {
        fn()
        return
    }
    let move = setInterval(() => {
        waiterMoveDom.style.marginLeft = ((parseFloat(waiterMoveDom.style.marginLeft) || 0) + distance / times) + "px"
        checkDistance = target.offsetLeft - waiterMoveDom.offsetLeft
        if (checkDistance > -20 && checkDistance < 20) {
            clearInterval(move)
            waiterDom.querySelector("img").src = "./images/waiterOrder.jpg"
            waiterMoveDom.style.marginLeft = target.offsetLeft
            fn()
        }
    }, refreshTime)
}

//显示厨师状态方法
function cookState(text) {
    cookDom.querySelector("p").innerHTML = text
}
//显示厨师待做的菜
function cookDishes(list) {
    let dishList = cookDom.querySelector("ul")
    if (!list || !list[1]) {
        dishList.innerHTML = "没有待做的菜"
        return
    }
    dishList.innerHTML = ""
    let title = document.createElement("li")
    title.innerHTML = "待做的菜："
    dishList.appendChild(title)
    for (let i = 1; i < list.length; i++) {
        let dishItem = document.createElement("li")
        dishItem.innerHTML = list[i].name
        dishList.appendChild(dishItem)
    }
}

//显示顾客点菜状态
function customerStateShow(key, text) {
    let customer = document.getElementById(`customer${key}`)
    customer.querySelector("p").innerHTML = text
}
function customerState(key, customer) {
    let needTime = customerOrderTime
    customerStateShow(key, `顾客正在点菜<br />还有 ${needTime} 秒`)
    let state = setInterval(function () {
        needTime = (needTime * time - 100) / 1000
        customerStateShow(key, `顾客正在点菜<br />还有 ${needTime} 秒`)
        if (needTime <= 0) {
            clearInterval(state)
            let orderDishes = customer.payDish
            allDishesArray = orderDishes.slice()
            console.log(allDishesArray)
            customerStateShow(key, `顾客等待上菜`)
            customerDishes(key, allDishesArray)
        }
    }, 100)
}

//显示顾客吃菜时间和所有的菜状态
function customerDishes(key, list) {
    let arg = []
    let i = arguments.length
    while (i--) {
        arg[i] = arguments[i]
    }
    let customerDom = document.getElementById(`customer${key}`)
    let dishList = customerDom.querySelector("ul")
    if (!arg[1]) {
        dishList.innerHTML = ""
        return
    }
    dishList.innerHTML = ""
    let title = document.createElement("li")
    title.innerHTML = "顾客点的菜："
    dishList.appendChild(title)
    for (let i = 0; i < list.length; i++) {
        let dishItem = document.createElement("li")
        dishItem.innerHTML = list[i].name + "：" + list[i].state
        dishList.appendChild(dishItem)
    }
}
function customerEat(customer, fn) {
    let arg = []
    let i = arguments.length
    while (i--) {
        arg[i] = arguments[i]
    }
    let needTime = customerEatTime
    let dishes = customer.food[0]
    let allDishesArray = customer.payDish
    let key = customer.key
    customerStateShow(key, `顾客正在吃 ${dishes.name} <br />还有 ${needTime} 秒`)
    dishes.state = "正在吃"
    customerDishes(key, allDishesArray)
    let state = setInterval(function () {
        needTime = (needTime * 1000 - 100) / 1000
        customerStateShow(key, `顾客正在吃 ${dishes.name} <br />还有 ${needTime} 秒`)
        if (needTime <= 0) {
            clearInterval(state)
            customer.eat()
            customerDishes(key, allDishesArray)
            customerStateShow(key, `顾客等待上菜`)
            if (customer.food.have === allDishesArray.length) {
                customerStateShow(key, "顾客离开")
                customerDishes(key)
            }
            if (arg[1]) arg[1]() 
            /*theCustomer.eat()//顾客吃菜
            customerStateShow(key, `顾客等待上菜`)
            customerDishes(allDishesArray)
            //如果菜单里的菜做完了，吃完换下一个顾客
            if (dishesLength === 0) {
                customerDishes()
                theCustomer.pay()
                //餐厅里的顾客减1
                customers.splice(0, 1)
                //在外面排队的第一个人入座
                restaurantAddCustomer()
                if (customers.length) {
                    customerStateShow(key, `顾客吃完离开，迎接下一位顾客`)
                    console.log("顾客吃完离开，准备迎接下一个顾客")
                    start()
                }
                else {
                    customerDom.querySelector("img").src = "./images/emptyCustomer.jpg"
                    addButton.onclick = customerSit
                    customerStateShow(key, `顾客吃完离开，现在座位没有人`)
                    console.log("没有顾客了")
                }
            }*/
        }
    }, 100)
}