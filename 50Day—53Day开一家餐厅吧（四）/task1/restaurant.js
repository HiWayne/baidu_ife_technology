var menu = [{ name: "鱼香肉丝", price: 85, time: 4, state: "还未上" }, { name: "宫保鸡丁", price: 90, time: 3.6, state: "还未上" }, { name: "文丝豆腐", price: 120, time: 4, state: "还未上" }, { name: "红烧狮子头", price: 80, time: 3.6, state: "还未上" }, { name: "东坡肉", price: 95, time: 4, state: "还未上" }]
var customerNames = ["李华", "王刚", "刘庆", "张丽", "朱茜", "周文", "林海", "魏薇", "韩雪", "贝蕾", "萧寒"]
var customers = []
var customersLength = 5//排队最多人数
var time = 1000//一个时间单位：1000ms

//对象深复制
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

//发布/订阅模式
function Dep() {
    this.sub = {}
}
Dep.prototype = {
    subscribe: function (array, obj) {
        for (let i in array) {
            let key = array[i].name
            this.sub[key] = this.sub[key] || []
            this.sub[key].push(obj)
        }
    },
    unsubscribe: function (menuKey, watcherObj) {
        let key = [].shift.call(arguments)
        let obj = arguments[0]
        if (!obj) {
            for (let i in this.sub) {
                let kind = this.sub[i]
                deleteSub(kind, key)
            }
            return
        }
        if (this.sub[key]) {
            let kind = this.sub[key]
            deleteSub(kind, obj)
        }
        function deleteSub(kind, obj) {
            let flag = true
            for (let i in kind) {
                if (kind[i] === obj) {
                    kind.splice(i, 1)
                    console.log("删除成功")
                    flag = false
                }
            }
            if (flag) console.log("删除失败")
        }
    },
    public: function (dish) {
        let key = dish.name
        let array = this.sub[key]
        if (array && array.length) {
            for (let i in array) {
                //对象深复制
                let newDish = objExtend(dish)
                array[i].watcher.updata(newDish)
                this.unsubscribe(key, array[i])
            }
        }
    }
}
//全局dep实例
let dep = new Dep()
function Watcher(obj) {
    this.obj = obj
}
Watcher.prototype = {
    updata: function (dish) {
        this.obj.food.push(dish)
    }
}

//顾客随机到来方法
function customerCome() {
    let num = random(0, 4)
    for (let i = 0, len = num; i < len; i++) {
        if (customers.length >= customersLength) break
        let customer = new Customer(randomSelect(1, 1, customerNames))
        customers.push(customer)
    }
    let seats = restaurant.seats
    for (let i = 0; i < seats; i++) {
        restaurantAddCustomer()
    }
}
function restaurantAddCustomer() {
    let seats = restaurant.seats
    let customerNum = restaurant.customer.length
    let emptySeats = seats - customerNum
    if (!emptySeats) return
    else if (emptySeats && customers.length) {
        let customer = customers.shift()
        restaurant.customer.push(customer)
        restaurantAddCustomer()
    }
}

function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: !!enumerable,
        value: val,
        writable: true
    })
}
//数组变异方法用以监听数组改动
var newMethods = ["push", "splice", "pop", "shift", "unshift", "sort", "reverse"]
var ArrayMethod = Object.create(Array.prototype)
newMethods.forEach(function (value) {
    var TrueMethod = Array.prototype[value]
    def(ArrayMethod, value, function () {
        var arguments$1 = arguments
        var i = arguments.length
        var args = new Array(i)
        while (i--) {
            args[i] = arguments$1[i]
        }
        var result = TrueMethod.apply(this, args)
        var ul = document.getElementById("customerList").querySelector("ul")
        ul.innerHTML = ""
        if (this.length > 1) {
            var title = document.createElement("li")
            title.innerHTML = "排队队伍："
            ul.appendChild(title)
            for (let i = 0; i < this.length; i++) {
                var li = document.createElement("li")
                li.innerHTML = this[i].name
                ul.appendChild(li)
            }
        }
        else {
            ul.innerHTML = "现在没有顾客排队"
        }
        return result
    }, true)
})
customers.__proto__ = ArrayMethod

//随机点菜方法
function random(min, max) {
    let num = Math.floor(Math.random() * (max - min + 1) + min)
    return num
}
function randomSelect(min, max, menu) {
    var menus = []
    var length = menu.length
    var orderIndex = random(0, length - 1)
    var num = random(min, max)
    var i = 0
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
    return menus
}

//顾客队列第一位入座方法
function customer(array) {
    if (array[0]) {
        return array[0]
    }
}

//餐厅类
function Restaurant(object) {
    this.money = object.money
    this.seats = object.seats
    this.staff = object.staff
    this.customer = []
    this.waiteDish = []
}
Restaurant.prototype.hire = function (object) {
    this.staff.push(object.name)
    this.money -= object.salary
    showMoney(this)
}
Restaurant.prototype.fire = function (someone) {
    var index = this.staff.indexOf(someone)
    if (index !== -1) {
        this.staff.splice(index, 1)
    }
}

//职员类
function Staff(obj) {
    this.id = obj.id
    this.name = obj.name
    this.salary = obj.salary
}
Staff.prototype.work = function (prop) {
    return this.ownwork(prop)
}

//原型继承方法
function extend(subtype, supertype) {
    function F() { }
    F.prototype = supertype.prototype
    var prototype = new F()
    prototype.constructor = subtype
    subtype.prototype = prototype
    subtype.sub = supertype.prototype
    if (supertype.prototype.constructor === Object.prototype.constructor) {
        supertype.prototype.constructor = supertype
    }
}

//服务员继承职员类
function Waiter(obj) {
    var instance = null
    Staff.apply(this, arguments)
    this.service = []
    this.dishes = null
    this.customer = null
    //单例模式
    instance = this
    Waiter = function () { return instance }
}
extend(Waiter, Staff)
//服务员方法，有参数是上菜，没参数是告诉厨师点的菜
Waiter.prototype.ownwork = function (prop) {
    let resCustomer = restaurant.customer
    let customerNum = resCustomer.length
    for (let i = 0; i < customerNum; i++) {
        if (!resCustomer[i].have) {
            this.customer = resCustomer[i]
            let order = this.customer.order()
            if (!prop && order instanceof Array) {
                //将菜创建成菜品对象并赋值给厨师实例的dish属性
                var newOrder = order.map(function (value) {
                    var dish = new Dishes(value)
                    return dish
                })
                cook.dish = cook.dish.concat(newOrder)
                this.dishes = newOrder
                if (!restaurant.waiteDish.length) {
                    dep.subscribe(this.dishes, this.customer)
                    this.dishes = this.customer = null
                }
                console.log("服务员告诉厨师点的菜")
                return newOrder
            }
            break
        }
    }
    if (!!prop) {
        let dish = prop.shift()
        dep.public(dish)
        if (this.dishes && this.customer) dep.subscribe(this.dishes, this.customer)
        console.log(`服务员上菜:${dish.name}`)
        return
    }
    console.log("没有顾客")
}

//厨师继承职员类
function Cook(obj) {
    var instance = null
    Staff.apply(this, arguments)
    this.dish = []
    instance = this
    Waiter = function () { return instance }
}
extend(Cook, Staff)
//厨师做菜方法
Cook.prototype.ownwork = function () {
    if (this.dish.length) {
        var dishes = this.dish[0]
        console.log(`厨师做好了${dishes.name}`)
        dishes.state = "做好"
        restaurant.waiteDish.push(dishes)
        this.dish.shift()
        return restaurant.waiteDish
    }
    else {
        console.log("厨师手上没有任务")
    }
}

//顾客类
function Customer(name) {
    if (Array.isArray(name)) {
        if (name.length === 1) {
            this.name = name[0]
        }
        else return new Error(`The parameter: ${name} shouldn't be an Array`)
    }
    this.name = this.name || name
    this.food = []
    this.payDish = []
    this.watcher = new Watcher(this)
}
//顾客点菜方法
Customer.prototype.order = function () {
    if (!this.have) {
        this.have = "have"
        var order = randomSelect(1, 5, menu)
        this.payDish = order
        return order
    }
    return
}
//顾客吃菜方法
Customer.prototype.eat = function () {
    if (this.food[0]) {
        console.log(`顾客吃完了${this.food[0].name}`)
        this.food[0].state = "已吃完"
        this.food.splice(0, 1)

    }
    else {
        console.log("顾客桌上没有菜")
    }
}
//顾客付钱方法
Customer.prototype.pay = function () {
    let payMoney = 0
    for (let i of this.payDish) {
        payMoney += i.price
    }
    restaurant.money += payMoney
    showMoney(restaurant)
}

//菜品类
function Dishes(object) {
    this.name = object.name
    this.cost = object.cost || object.price * 0.6
    this.price = object.price
    this.time = object.time
    this.state = object.state
}

//test

//定义好dom对象
var restaurantDom = document.getElementById("restaurant")
var addButton = document.getElementById("addCustomer")
var cookDom = document.getElementById("cook")
var customerDom = document.getElementById("customer")
var customerListDom = document.getElementById("customerList")
var waiterDom = document.getElementById("waiter")
var waiterMoveDom = document.getElementById("waiterMove")
//按钮绑定增加顾客方法
addButton.onclick = customerSit
//展现各部分初始值
//显示餐厅现金方法
function showMoney(obj) {
    let cash = obj.money
    console.log(cash)
    restaurantDom.querySelector("span").innerHTML = cash + "元"
}
//显示厨师状态方法
function cookState(text) {
    cookDom.querySelector("p").innerHTML = text
}
cookState("空闲中")
//显示顾客状态方法
function customerState(text) {
    customerDom.querySelector("p").innerHTML = text
}
customerState("没有顾客")
//显示厨师待做的菜
function cookDishes(list) {
    var dishList = cookDom.querySelector("ul")
    if (!list || !list[1]) {
        dishList.innerHTML = "没有待做的菜"
        return
    }
    dishList.innerHTML = ""
    var title = document.createElement("li")
    title.innerHTML = "待做的菜："
    dishList.appendChild(title)
    for (let i = 1; i < list.length; i++) {
        let dishItem = document.createElement("li")
        dishItem.innerHTML = list[i].name
        dishList.appendChild(dishItem)
    }
}
cookDishes()
//显示顾客所有的菜
function customerDishes(list) {
    var dishList = customerDom.querySelector("ul")
    if (!list) {
        dishList.innerHTML = ""
        return
    }
    dishList.innerHTML = ""
    var title = document.createElement("li")
    title.innerHTML = "顾客点的菜："
    dishList.appendChild(title)
    for (let i = 0; i < list.length; i++) {
        let dishItem = document.createElement("li")
        dishItem.innerHTML = list[i].name + "：" + list[i].state
        dishList.appendChild(dishItem)
    }
}
customerDishes()


var restaurant = new Restaurant({ money: 11000, seats: 3, staff: [] })//创建一个餐厅实例
showMoney(restaurant)
var waiter = new Waiter({ id: 0, name: "waiter1", salary: 4000 })//创建一个服务员实例
var cook = new Cook({ id: 1, name: "cooker1", salary: 7000 })//创建一个厨师实例
console.log(cook.salary)
restaurant.hire(waiter)//餐厅雇佣了一个服务员
restaurant.hire(cook)//餐厅雇佣了一个厨师
var dishesLength//厨师需要做的菜数量
var seviceTime = 0.5//服务员移动时间
function customerSit() {
    //重写按钮绑定的方法
    newClickEvent = function () {
        customers.push(new Customer(randomSelect(1, 1, customerNames)))
    }
    addButton.onclick = newClickEvent
    customers.push(new Customer(randomSelect(1, 1, customerNames)))//一个顾客入座
    customerDom.querySelector("img").src = "./images/customer.jpg"
    start()
}

//n表示当前做完第几个菜
var n = 0
//储存每位顾客点的菜:对象
var allDishesArray

//服务员走向顾客=>顾客想好点什么菜=>服务员把菜单给厨师
function start() {
    n = 0//重置n
    waiterOrder().then(cookAndContinue)
}

//服务员点菜=>走向厨师
function waiterOrder() {
    for (let i in restaurant.customer) {
        if (restaurant.customer[i].have) {
            continue
        }
        //服务员点菜=>走向厨师
        else {
            return new Promise(function (resolve) {
                var orderTime = 3//点菜时间
                waiterSevice(customerDom, seviceTime, 10)//服务员走向顾客
                resolve(orderTime)
            })
                .then(function (orderTime) {
                    return new Promise((resolve) => {
                        var needTime = orderTime
                        customerState(`顾客正在点菜<br />还有 ${needTime} 秒`)
                        var state = setInterval(function () {
                            needTime = (needTime * time - 100) / 1000
                            customerState(`顾客正在点菜<br />还有 ${needTime} 秒`)
                            if (needTime <= 0) {
                                clearInterval(state)
                                let orderDishes = waiter.work()//服务员点菜
                                allDishesArray = orderDishes.slice()
                                console.log(allDishesArray)
                                customerState(`顾客等待上菜`)
                                customerDishes(allDishesArray)
                                resolve(allDishesArray)
                            }
                        }, 100)
                    })
                })
                .then(function (dish) {
                    return new Promise((resolve) => {
                        waiterSevice(cookDom, seviceTime, 10)//服务员走向厨师
                        setTimeout(function () {
                            resolve(dish)
                            //如果有待上的菜
                            if (restaurant.waiteDish.length) {
                                //服务员上菜=>顾客开吃
                                waiterWork(restaurant.waiteDish)
                            }
                            for (let i in restaurant.customer) {
                                if (restaurant.customer[i].have) {
                                    continue
                                }
                                //服务员点菜
                                else {
                                    //服务员查看有没有还未点菜的顾客，如果有继续点菜
                                    for (let i in restaurant.customer) {
                                        if (restaurant.customer[i].have) {
                                            continue
                                        }
                                        //服务员点菜
                                        else {
                                            start()
                                            break
                                        }
                                    }
                                    break
                                }
                            }
                        }, seviceTime * 1000)
                    })
                })
            break
        }
    }

}

//服务员上菜=>顾客开吃
function waiterWork(dishes) {
    return new Promise((resolve) => {
        waiterDom.querySelector("img").src = "./images/waiterService.jpg"
        waiterSevice(customerDom, seviceTime, 10, n)
        setTimeout(() => {
            waiter.work(dishes)//服务员上菜
            resolve(dishes)
        }, seviceTime * time)
    })
        .then(() => {
            //服务员查看有没有还未点菜的顾客，如果有继续点菜
            let flag = 0
            for (let i in restaurant.customer) {
                if (restaurant.customer[i].have) {
                    flag++
                    continue
                }
                //服务员点菜
                else {
                    waiterOrder()
                    break
                }
            }
            if (flag === restaurant.seats) {
                //服务员走向厨师
                waiterSevice(cookDom, seviceTime, 10)
                setTimeout(function () {
                    if (restaurant.waiteDish,length) {
                        waiterWork(restaurant.waiteDish)
                    }
                }, seviceTime * 1000)
            }
            let customers = restaurant.customer
            let theCustomer = customer(customers)
            let dishes = theCustomer.food[0]
            var eatTime = 3
            var needTime = eatTime
            customerState(`顾客正在吃 ${dishes.name} <br />还有 ${needTime} 秒`)
            var state = setInterval(function () {
                needTime = (needTime * 1000 - 100) / 1000
                customerState(`顾客正在吃 ${dishes.name} <br />还有 ${needTime} 秒`)
                dishes.state = "正在吃"
                customerDishes(allDishesArray)
                if (needTime <= 0) {
                    clearInterval(state)
                    theCustomer.eat()//顾客吃菜
                    customerState(`顾客等待上菜`)
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
                            customerState(`顾客吃完离开，迎接下一位顾客`)
                            console.log("顾客吃完离开，准备迎接下一个顾客")
                            start()
                        }
                        else {
                            customerDom.querySelector("img").src = "./images/emptyCustomer.jpg"
                            addButton.onclick = customerSit
                            customerState(`顾客吃完离开，现在座位没有人`)
                            console.log("没有顾客了")
                        }
                    }
                }
            }, 100)
        })
}

//厨师做菜
function cookWork() {
    return new Promise(function (resolve) {
        var dishes
        cookDishes(cook.dish)
        if (cook.dish) {
            dishes = cook.dish[0]
            var needTime = (dishes.time * time) / 1000
            cookState(`在做 ${dishes.name} 菜<br>还差 ${needTime} 秒做完`)
            var state = setInterval(() => {
                needTime = (needTime * 1000 - 100) / 1000
                cookState(`在做 ${dishes.name} 菜<br>还差 ${needTime} 秒做完`)
                if (needTime <= 0) {
                    clearInterval(state)
                    cookState("空闲中")
                }
            }, 100)
            setTimeout(function () {
                dishes = cook.work()//厨师做菜
                customerDishes(allDishesArray)
                n++
                resolve(dishes)
            }, dishes.time * time)
        }
    })
}

//厨师做菜，厨师做完一个菜后，如果还有菜要做就继续调用cookAndContinue
function cookAndContinue() {
    cookWork()
        .then(function () {
            //如果菜单的菜没做完，厨师继续
            dishesLength = cook.dish.length
            if (dishesLength > 0) {
                cookAndContinue()
            }
        })
}

//服务员移动方法
function waiterSevice(target, seviceTime, refreshTime, n) {
    var checkDistance
    var times = seviceTime * 1000 / refreshTime
    var distance = target.offsetLeft - waiterMoveDom.offsetLeft
    if (distance === 0) {
        return
    }
    new Promise((resolve) => {
        var move = setInterval(() => {
            waiterMoveDom.style.marginLeft = ((parseFloat(waiterMoveDom.style.marginLeft) || 0) + distance / times) + "px"
            checkDistance = target.offsetLeft - waiterMoveDom.offsetLeft
            if (checkDistance > -1 && checkDistance < 1) {
                clearInterval(move)
                waiterDom.querySelector("img").src = "./images/waiterOrder.jpg"
                waiterMoveDom.style.marginLeft = target.offsetLeft
                resolve()
            }
        }, refreshTime)
    })
        .then(() => {
            if (n && n < dishesLength) {
                waiterSevice(cookDom, seviceTime, 10)
            }
            return
        })
}