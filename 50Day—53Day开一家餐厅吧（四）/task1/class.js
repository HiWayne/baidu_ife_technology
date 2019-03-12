//餐厅类
function Restaurant(object) {
    this.money = object.money
    this.seats = object.seats
    this.staff = object.staff
    this.customer = []
    this.waiteDish = []
}
Restaurant.prototype.hire = function (object) {
    this.staff.push(object)
    object.interval = object.fn()
}
Restaurant.prototype.fire = function (someone) {
    let index = this.staff.indexOf(someone)
    if (index !== -1) {
        clear(this.staff[index].interval)
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
Staff.prototype.fn = function () {
    let _this = this
    setInterval(function () {
        restaurant.money -= _this.salary / 100
    }, 12000)
}

//原型继承方法
function extend(subtype, supertype) {
    function F() { }
    F.prototype = supertype.prototype
    let prototype = new F()
    prototype.constructor = subtype
    subtype.prototype = prototype
    subtype.sub = supertype.prototype
    if (supertype.prototype.constructor === Object.prototype.constructor) {
        supertype.prototype.constructor = supertype
    }
}

//服务员继承职员类
function Waiter(obj) {
    let instance = null
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
    let _this = this
    if (!prop) {
        let resCustomer = restaurant.customer
        let customerNum = resCustomer.length
        for (let i = 0; i < customerNum; i++) {
            if (!resCustomer[i].have) {
                this.customer = resCustomer[i]
                customerState(i, this.customer)
                setTimeout(function () {
                    console.log(_this.customer)
                    let order = _this.customer.order()
                    //将菜创建成菜品对象并赋值给厨师实例的dish属性
                    let newOrder = order.slice()
                    _this.dishes = newOrder.slice()
                    dep.subscribe(_this.dishes, _this.customer)
                    console.log(dep.sub)
                    customerDishes(_this.customer.key, _this.customer.payDish)
                    if (restaurant.waiteDish.length) {
                        for (let i = newOrder.length - 1; i >= 0; i--) {
                            for (let j = 0; j < restaurant.waiteDish.length; j++) {
                                if (newOrder[i].name === restaurant.waiteDish[j].name) {
                                    newOrder.splice(i, 1)
                                    break
                                }
                            }
                        }
                    }
                    waiterSevice(cookDom, waiterMoveTime, 20, function () {
                        cook.dish = cook.dish.concat(newOrder)
                        /*if (!restaurant.waiteDish.length) {
                            dep.subscribe(_this.dishes, _this.customer)
                            _this.dishes = _this.customer = null
                        }*/
                        console.log(`服务员告诉厨师点的菜`)
                        console.log(_this.dishes)
                        return newOrder
                    })
                }, 3 * 1000)
                return
            }
        }
    }
    else if (!!prop) {
        let dish = prop.shift()
        /*let dishes = prop.slice()
        let dish = dishes.shift()*/
        while (dish) {
            console.log(`服务员上菜:${dish.name}`)
            dep.public(dish)
            dish = prop.shift()
            /*dish = dishes.shift()
            prop.shift()*/
        }
        /*if (this.dishes && this.customer) dep.subscribe(this.dishes, this.customer)*/
        return
    }
    console.log("没有顾客")
}

//厨师继承职员类
function Cook(obj) {
    let instance = null
    Staff.apply(this, arguments)
    this.dish = []
    this.doing = null
    instance = this
    Waiter = function () { return instance }
}
extend(Cook, Staff)
//厨师做菜方法
Cook.prototype.ownwork = function () {
    if (this.dish.length) {
        cookDishes(this.dish)
        let dishes = this.dish[0]
        for (let i = this.dish.length - 1; i > 0; i--) {
            if (this.dish[i].name === dishes.name) {
                this.dish.splice(i, 1)
            }
        }
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
    //给food设置属性，用来计吃菜数
    def(this.food, "have", 0)
    this.payDish = []
    this.watcher = new Watcher(this, this.addFood)

}
//顾客的菜做好之后上桌待吃的方法，用以添加进订阅对象的updata。订阅对象：每当一个菜做好并且服务员上菜，所有订阅（点了）这个菜的顾客（他们只能在这个菜做好之前订阅）都会调用updata方法得到这个菜。
Customer.prototype.addFood = function (dish) {
    this.food.push(dish)
    customerDishes(this.key, this.payDish)
    if (!this.eating) method5(this)
}
//顾客点菜方法
Customer.prototype.order = function () {
    if (!this.have) {
        this.have = "have"
        let order = randomSelect(1, 5, menu)
        this.payDish = order.slice()
        return order
    }
}
//顾客吃菜方法
Customer.prototype.eat = function () {
    if (this.food[0]) {
        console.log(`顾客吃完了${this.food[0].name}`)
        this.food[0].state = "已吃完"
        this.food.splice(0, 1)
        this.food.have++
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
    console.log("顾客付钱")
}

//菜品类
function Dishes(object) {
    this.name = object.name
    this.cost = object.cost || object.price * 0.6
    this.price = object.price
    this.time = object.time
    this.state = object.state
}

//发布/订阅模式
//主题对象
function Dep() {
    this.sub = {}
}
Dep.prototype = {
    subscribe: function (array, obj) {
        if (arguments.length === 1) {
            this.sub.default = []
            let parameter = [].shift.call(arguments)
            this.sub.default.push(parameter)
        }
        else {
            for (let i in array) {
                let key = array[i].name
                this.sub[key] = this.sub[key] || []
                this.sub[key].push(obj)
            }
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
                    flag = false
                }
            }
            if (flag) console.log(`${obj.name}无法取消订阅:因为找不到他`)
        }
    },
    public: function (dish) {
        if (!dish || Array.isArray(dish)) {
            if (typeof(dish.key) === "number") {
                console.log(`离开顾客的key${dish.key}`)
                for (let i in this.sub.default) {
                    this.sub.default[i].updata(dish.key)
                }
                return
            }
            for (let i in this.sub.default) {
                this.sub.default[i].updata(dish)
            }
        }
        else if (typeof(dish) === "object") {
            let key = dish.name
            console.log(`pubilc:${key}`)
            let array = this.sub[key]
            console.log(array)
            if (array && array.length) {
                for (let i = array.length - 1; i >= 0; i--) {
                    //对象深复制
                    let newDish = objExtend(dish)
                    array[i].watcher.updata(newDish)
                    console.log(i)
                    console.log(array[i])
                    this.unsubscribe(key, array[i])
                }
            }
        }
    }
}
//订阅者
function Watcher(obj, fn) {
    this.obj = obj
    this.fn = fn
}
Watcher.prototype = {
    updata: function (dish) {
        this.fn.call(this.obj, dish)
        /*this.obj.food.push(dish)*/
    }
}

/*export {Restaurant, Waiter, Cook, Customer, Dishes, Dep, Watcher}*/