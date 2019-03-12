var menu = [{ name: "鱼香肉丝", price: 85, time: 4, state: "未上" }, { name: "宫保鸡丁", price: 90, time: 3.6, state: "未上" }, { name: "文丝豆腐", price: 120, time: 4, state: "未上" }, { name: "红烧狮子头", price: 80, time: 3.6, state: "未上" }, { name: "东坡肉", price: 95, time: 4, state: "未上" }]
var randomCustomer = ["李华", "王刚", "刘庆", "张丽", "朱茜", "周文", "林海", "魏薇", "韩雪", "贝蕾", "萧寒"]
var customers = []
var time = 1000//一个时间单位：1000ms


//vue开始

function Vue(option) {
    var _this = this
    this.el = option.el
    this.data = option.data
    //在obj上定义属性key的value
    function def(obj, key, val, enumerable) {
        if (!obj || typeof (obj) !== "object") return
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: !!enumerable,
            value: val,
            writable: true
        })
    }
    //观察者模式(订阅发布模式)
    //订阅者
    function Watcher(node, name, vue, sign) {
        Dep.target = this
        this.node = node
        this.name = name
        this.vue = vue
        this.sign = sign
        this.updata()
        Dep.target = null
    }
    Watcher.prototype = {
        updata: function () {
            this.get()
            switch (this.sign) {
                case "v-model":
                    this.node.value = this.value
                case "attr":
                    var reg = /\{\{(.*)\}\}/
                    var attrs = this.node.attributes
                    for (let i in attrs) {
                        if (reg.test(attrs[i].nodeValue)) {
                            var currentName = RegExp.$1
                            if (currentName === this.name) {
                                attrs[i].nodeValue = this.value
                            }
                        }
                    }
                case "text":
                    this.node.nodeValue = this.value
            }
        },
        get: function () {
            this.value = this.vue[this.name]
        }
    }
    //主题对象
    function Dep() {
        this.sub = []
    }
    Dep.prototype = {
        addsub: function (sub) {
            this.sub.push(sub)
        },
        depend: function () {
            if (Dep.target) this.addsub(Dep.target)
        },
        notify: function () {
            this.sub.forEach(function (watcher) {
                watcher.updata()
            })
        }
    }
    Dep.target = null
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
            var ob = this.__ob__
            /*var ul = document.getElementById("customerList").querySelector("ul")
            ul.innerHTML = ""
            if (this.length > 1) {
                var title = document.createElement("li")
                title.innerHTML = "排队队伍："
                ul.appendChild(title)
                for (let i = 1; i < this.length; i++) {
                    var li = document.createElement("li")
                    li.innerHTML = this[i].name
                    ul.appendChild(li)
                }
            }
            else {
                ul.innerHTML = "现在没有顾客排队"
            }*/
            var inserted
            switch (value) {
                case 'push':
                    inserted = args
                    break
                case 'unshift':
                    inserted = args
                    break
                case 'splice':
                    inserted = args.slice(2)
                    break
            }
            if (inserted) ob.arrayObserve(inserted)
            ob.dep.notify()
            return result
        }, true)
    })
    //给对象的每个属性设置监听，并对也是对象的属性递归
    function Observe(value) {
        this.value = value
        this.dep = new Dep()
        def(value, "__ob__", this)
        if (Array.isArray(value)) {
            var hasProto = __proto__ in {}
            var augment = hasProto ? protoAugment : copyAugment
            function protoAugment(target, src) {
                target.__proto__ = src
            }
            function copyAugment(target, src, keys) {
                for (let i = 0; i < keys.length; i++) {
                    var key = keys[i]
                    def(target, key, src[key])
                }
            }
            augment(value, ArrayMethod, newMethods)
        }
        else {
            this.walk(value)
        }
        /*var properties = Object.keys(value)
        if (!properties.length) return
        properties.forEach(function (key) {
            if (value[key] instanceof Array) {
                augment(value[key], ArrayMethod, newMethods)
            }
            observeChild(value[key])
            defineReactive(value, key, value[key])
        })*/
    }
    Observe.prototype = {
        walk: function (value) {
            var _this = this
            Object.keys(value).forEach(function (key) {
                _this.defineReactive(value, key, value[key])
            })
        },
        //监听：给对象的属性设置get、set方法
        defineReactive: function (obj, key, val) {
            var dep = new Dep()
            var property = Object.getOwnPropertyDescriptor(obj, key)
            var getter = property && property.get
            var setter = property && property.set
            var childOb = observe(val)
            Object.defineProperty(obj, key, {
                configurable: true,
                enumerable: true,
                get: function () {
                    const value = getter ? getter.call(obj) : val
                    dep.depend()
                    if (childOb) {
                        childOb.dep.depend()
                        if (Array.isArray(value)) {
                            arrayDepend(value)
                        }
                    }
                    return value
                },
                set: function (newVal) {
                    const value = getter ? getter.call(obj) : val
                    if (newVal === value) return
                    if (setter) {
                        setter.call(obj, newVal)
                        return
                    }
                    val = newVal
                    //对新的值也设置监听
                    observe(newVal)
                    //如果新的值是数组，那么注册订阅对象
                    if (Array.isArray(newVal)) newVal.__ob__.dep.sub = dep.sub
                    //向主题对象发布变动信息
                    dep.notify()
                }
            })
            function arrayDepend(value) {
                for (let e, i = 0, l = value.length; i < l; i++) {
                    e = value[i]
                    e && e.__ob__ && e.__ob__.dep.depend()
                    if (Array.isArray(e)) {
                        arrayDepend(e)
                    }
                }
            }
        },
        arrayObserve: function (value) {
            Object.keys(value).forEach(function (key) {
                observe(value[key])
            })
        }
    }
    //判断对象的某个属性是否是可监听
    function observe(value) {
        if (!value || typeof (value) !== "object" || typeof (value) === "function" || value.__ob__) return
        var ob = new Observe(value)
        return ob
    }
    //监听menu对象及其属性对象
    observe(this.data)
    proxy(this.data, this)
    //复制vue.data里的属性到vue中并使用代理模式
    function proxy(data, vue) {
        Object.keys(data).forEach(function (key) {
            Object.defineProperty(vue, key, {
                constructor: true,
                enumerable: false,
                get: function () {
                    return data[key]
                },
                set: function (newVal) {
                    data[key] = newVal
                }
            })
        })
    }
    //创建文档片段
    if (this.el.indexOf("#") !== -1) {
        var id = this.el.substring(1)
        var oldElement = document.getElementById(id)
    }
    var frag = nodeToFragment()
    oldElement.appendChild(frag)
    function nodeToFragment() {
        var fragment = document.createDocumentFragment()
        var child
        while (child = oldElement.firstChild) {
            fragment.appendChild(child)
            compile(child, _this)
        }
        return fragment
    }
    //编译并绑定订阅对象watcher
    function compile(node, vue) {
        var reg = /\{\{(.*)\}\}/
        var reg_attr = /^\s*([^\[\.]+)\s*(\[|\.)\s*([^\[\]\.]+)\]?$/
        if (node.nodeType === 1) {
            var attrs = node.attributes
            for (let i in attrs) {
                if (attrs[i].nodeName === "v-model") {
                    var name = attrs[i].nodeValue
                    var sign = "v-model"
                    if (document.addEventListener) {
                        node.addEventListener("input", function (e) {
                            vue.name = e.target.value
                        })
                    }
                    else {
                        node.attachEvent("oninput", function (e) {
                            e = window.event
                            vue.name = e.target.value
                        })
                    }
                    new Watcher(node, name, vue, sign)
                }
                if (reg.test(attrs[i].nodeValue)) {
                    var sign = "attr"
                    var name = RegExp.$1
                    new Watcher(node, name, vue, sign)
                }
            }
        }
        else if (node.nodeType === 3) {
            if (reg.test(node.nodeValue)) {
                var sign = "text"
                var name = RegExp.$1
                name = name.trim()
                new Watcher(node, name, vue, sign)
            }
        }
        if (node.childNodes.length) {
            var childNodes = [].slice.call(node.childNodes)
            for (let i in childNodes) {
                compile(childNodes[i], vue)
            }
        }
    }
}

//vue实例
var vue = new Vue({
    el: "#app",
    data: {
        customerList: "没有顾客排队",
        customerState: "没有菜"
    }
})

//vue结束


//随机点菜方法
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
function randomOrder(min, max, menu) {
    var menus = []
    var length = menu.length
    var orderIndex = random(0, length - 1)
    var num = random(min, max)
    var i = 0
    while (i < num) {
        orderIndex = random(0, length - 1)
        menus.push(menu[orderIndex])
        i++
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
}
Restaurant.prototype.hire = function (someone) {
    this.staff.push(someone)
}
Restaurant.prototype.fire = function (someone) {
    var index = this.staff.indexOf(someone)
    if (index !== -1) {
        this.staff.splice(index, 1)
    }
}

//职员类
function Staff(id, name, salary) {
    this.id = id
    this.name = name
    this.salary = salary
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
function Waiter(id, name, salary) {
    var instance = null
    Staff.apply(this, arguments)
    this.sevice = []
    instance = this
    Waiter = function () { return instance }
}
extend(Waiter, Staff)
//服务员方法，有参数是上菜，没参数是告诉厨师点的菜
Waiter.prototype.ownwork = function (prop) {
    var customer = customers[0]
    if (customer) {
        var order = customer.order()//调用顾客点菜方法，返回的是数组
        if (order instanceof Array) {
            cook.dish = order
            console.log("服务员告诉厨师点的菜")
            return order
        }
        else if (!!prop) {
            customer.food.push(prop)
            console.log(`服务员上菜:${prop.name}`)
        }
    }
    else {
        console.log("没有顾客")
    }
}

//厨师继承职员类
function Cook(id, name, salary) {
    var instance = null
    Staff.apply(this, arguments)
    this.dish = null
    instance = this
    Waiter = function () { return instance }
}
extend(Cook, Staff)
//厨师做菜方法
Cook.prototype.ownwork = function () {
    if (this.dish) {
        var dishes = new Dishes(this.dish[0])
        console.log(`厨师做好了${dishes.name}`)
        this.dish[0].state = "做好"//因为dishes是实例，它里面的state属性是由原对象里的相应属性所赋值的，且该属性是基本类型，所以修改state并不会触发原对象的setter，因此直接修改原对象中的state
        this.dish.shift()
        return dishes
    }
    else {
        console.log("厨师手上没有任务")
    }
}

//顾客类
function Customer(name) {
    this.name = name
    this.food = []
}
//顾客点菜方法
Customer.prototype.order = function () {
    if (this.have !== "have") {
        var order = randomOrder(1, 5, menu)
        this.have = "have"
        return order
    }
    return
}
//顾客吃菜方法
Customer.prototype.eat = function () {
    if (this.food[0]) {
        console.log(`顾客吃完了${this.food[0].name}`)
        this.food.shift()
    }
    else {
        console.log("顾客桌上没有菜")
    }
}

//菜品类
function Dishes(object) {
    this.name = object.name
    this.cost = object.cost || object.price * 0.6
    this.price = object.price
    this.time = object.time
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
function money(cash) {
    restaurantDom.querySelector("span").innerHTML = cash
}
//显示厨师状态方法
function cookState(text) {
    cookDom.querySelector("p").innerHTML = text
}
cookState("空闲中")
//显示厨师待做的菜
function cookDishes(list) {
    var dishList = cookDom.querySelector("ul")
    if (!list || !list[1]) {
        dishList.innerHTML = "没有待做的菜"
        return
    }
    dishList.innerHTML = ""
    var title = document.createElement("li")
    title.innerHTML = "待做的菜列表："
    dishList.appendChild(title)
    for (let i = 1; i < list.length; i++) {
        let dishItem = document.createElement("li")
        dishItem.innerHTML = list[i].name
        dishList.appendChild(dishItem)
    }
}
cookDishes()


var restaurant = new Restaurant({ money: 0, seats: 1, staff: [] })//创建一个餐厅实例
money(restaurant.money)
var waiter = new Waiter({ id: 0, name: "waiter1", salary: 4000 })//创建一个服务员实例
var cook = new Cook({ id: 1, name: "cooker1", salary: 7000 })//创建一个厨师实例
restaurant.hire(waiter.name)//餐厅雇佣了一个服务员
restaurant.hire(cook.name)//餐厅雇佣了一个厨师
var dishesLength//厨师需要做的菜数量
var seviceTime = 0.5//服务员移动时间
function customerSit() {
    //重写按钮绑定的方法
    newClickEvent = function () {
        customers.push(new Customer(randomOrder(1, 1, randomCustomer)[0]))
        vue.customerList = customers
    }
    addButton.onclick = newClickEvent
    customers.push(new Customer(randomOrder(1, 1, randomCustomer)[0]))//一个顾客入座
    vue.customerList = customers
    customerDom.querySelector("img").src = "./images/customer.jpg"
    xx()
}

var n = 0//n表示当前做完第几个菜
//厨师做完一个菜后，如果还有菜要做就继续调用run
function run() {
    (function () {
        return new Promise(function (resolve) {
            var dishes
            cookDishes(cook.dish)
            if (cook.dish) {
                dishes = cook.dish[0]
                var needTime = (dishes.time * 1000) / 1000
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
                    n++
                    resolve(dishes)
                }, dishes.time * time)
            }
        })
    })().then(function (dishes) {
        return new Promise((resolve) => {
            waiterDom.querySelector("img").src = "./images/waiterService.jpg"
            waiterSevice(customerDom, seviceTime, 10, n)
            setTimeout(() => {
                waiter.work(dishes)//服务员上菜
                resolve(dishes)
            }, seviceTime * time)
            //如果菜单的菜没做完，厨师继续
            if (n < dishesLength) {
                run()
            }
        })
    }).then(() => {
        var eatTime = 3
        setTimeout(function () {
            customer(customers).eat()//顾客吃菜
            //如果菜单里的菜做完了，吃完换下一个顾客
            if (n === dishesLength) {
                customers.splice(0, 1)
                if (customers.length) {
                    console.log("顾客吃完离开，准备迎接下一个顾客")
                    xx()
                }
                else {
                    customerDom.querySelector("img").src = "./images/emptyCustomer.jpg"
                    vue.customerList = "没有顾客排队"
                    addButton.onclick = customerSit
                    console.log("没有顾客了")
                }
            }
        }, eatTime * time)
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
                waiterMoveDom.style.marginLeft = target.offsetLeft
                waiterDom.querySelector("img").src = "./images/waiterOrder.jpg"
                resolve()
            }
        }, refreshTime)
    }).then(() => {
        if (n && n < dishesLength) {
            waiterSevice(cookDom, seviceTime, 10)
        }
        return
    })
}

//服务员走向顾客=>顾客想好点什么菜=>服务员把菜单给厨师=>厨师做菜
function xx() {
    n = 0//重置n
    new Promise(function (resolve) {
        var orderTime = 3//点菜时间
        waiterSevice(customerDom, seviceTime, 10)//服务员走向顾客
        resolve(orderTime)
    }).then(function (orderTime) {
        return new Promise((resolve) => {
            setTimeout(function () {
                var dishes = waiter.work()//服务员点菜
                vue.customerState = dishes
                console.log(dishes)
                dishesLength = cook.dish.length
                resolve()
            }, orderTime * time)
        })
    }).then(function () {
        return new Promise((resolve) => {
            waiterSevice(cookDom, seviceTime, 10)//服务员走向厨师
            setTimeout(resolve, seviceTime * 1000)
        })
    }).then(run)
}