let menu = [{ name: "鱼香肉丝", price: 85, time: 4, state: "还未上" }, { name: "宫保鸡丁", price: 90, time: 3.6, state: "还未上" }, { name: "文丝豆腐", price: 120, time: 4, state: "还未上" }, { name: "红烧狮子头", price: 80, time: 3.6, state: "还未上" }, { name: "东坡肉", price: 95, time: 4, state: "还未上" }]
let customers = ["顾客一", "顾客二", "顾客三", "顾客四", "顾客五", "顾客六", "顾客七", "顾客八"]

//餐厅类
class Restaurant {
    constructor(seats, money) {
        if (typeof (seats) !== "number" || typeof (money) !== "number") {
            throw new Error(`TypeError: the params of Restaurant class all should be number`)
        }
        let _this = this
        this.money = null
        //监听属性money
        Restaurant.observeProperty(this, "money", this.money, updata, "restaurantMoney", this)
        Restaurant.observeProperty(this, "seats", this.seats, updata, "restaurantSeats", this)
        function updata(id, value) {
            let updataNode = document.getElementById(id)
            updataNode.innerHTML = value
        }
        this.money = money
        this.seats = seats
        //餐厅实例私有的主题对象，用来订阅不同顾客的菜
        this.dep = new Dep()
        //餐厅里所有的员工：对象中有岗位属性（如：waiter, cook），属性值是数组，数组元素是员工对象
        this.staff = {}
        //顾客排队队列
        this.customerList = []
        //餐厅入座顾客
        this.customerInSeat = []
        //因服务员繁忙而暂时挂起的需要点菜的顾客
        this.customerSuspension = []
        //待做的菜队列
        this.dishesList = []
        //做好的菜
        this.doneDishes = []
        //正在做的菜
        this.cooking = []
        //监听数组方法，参数一：监听的目标对象，参数二（可选）：对象中不想监听的数组
        this.observe(this, this.customerSuspension, this.cooking)

        //当customerList数组发生变动时调用原型中的customerWaiterList方法
        //创建订阅实例，参数二是发布后调用的方法，参数一是改变方法中this的指向（现在是Restaurant实例）
        let customerListWatcher = new Watcher(this, this.customerWaiter)
        //在customerList数组的私有主题对象dep中注册订阅对象
        this.customerList.dep.subcript(customerListWatcher)

        //当customerInSeat数组发生变动时调用原型中的customerSit方法
        //创建订阅实例，参数二是发布后调用的方法，参数一是改变方法中this的指向（现在是Restaurant实例）
        let customerInSeatWatcher = new Watcher(this, this.customerSit)
        //在customerInSeat数组的私有主题对象dep中注册订阅对象
        this.customerInSeat.dep.subcript(customerInSeatWatcher)

        //当dishesList数组发生变动时调用原型中的cook方法
        //创建订阅实例，参数二是发布后调用的方法，参数一是改变方法中this的指向（现在是Restaurant实例）
        let dishesListWatcher = new Watcher(this, this.cook)
        //在dishesList数组的私有主题对象dep中注册订阅对象
        this.dishesList.dep.subcript(dishesListWatcher)

        //当doneDishes数组发生变动时调用原型中的service方法
        //创建订阅实例，参数二是发布后调用的方法，参数一是改变方法中this的指向（现在是Restaurant实例）
        let doneDishesWatcher = new Watcher(this, this.service)
        //在doneDishes数组的私有主题对象dep中注册订阅对象
        this.doneDishes.dep.subcript(doneDishesWatcher)
    }
    //有新顾客排队调用的方法
    customerWaiter() {
        let length = this.customerList.length
        //如果没人排队，返回
        if (!length) {
            return
        }
        let len = this.customerInSeat.length
        let seats = this.seats
        //如果顾客坐满就不用这个方法了，直接依靠customerSit方法增减顾客
        if (len < seats) {
            //直接用this.customerList的shift会再次触发customerWaiter方法，所以这里借用原来的数组方法
            let customer = [].shift.call(this.customerList)
            //同理，直接用push方法会触发customerSit方法
            this.customerInSeat[len] = customer
            //设置顾客的key：保证不会重复，并且尽可能用到最小的数
            //思路：假设最极端的情况，前面的顾客的key都是按顺序排下来（0 —— len - 1）的，那么新的顾客key就是最后一个key加1（也就是len）。而其他情况下，前面顾客的key肯定会有大于等于len的，那么key在0到len - 1之间不连续肯定有空档，我们就从0开始遍历，找到最小的那个空档，拿这个数赋值key。具体一点就是，先从0开始，拿0去比较其他所有顾客的key，没有重复的话就用它做key，重复了就break，再拿1比较，依次循环……
            this.jumpQueue(this.customerInSeat, "key", function (target, number) {
                target.key = number
                //调用点菜方法
                this.order(target)
                this.customerWaiter()
            }, customer, true)

        }
    }
    //传入一个数组Array<number>，从0开始尽可能小的和当前所有元素不重复，个人称它为“插队函数”
    //思路：假设最极端的情况，数组里的元素都是按顺序排下来（0 —— len - 1）的，那么新的元素就是最后一个元素加1（也就是len）。而其他情况下，前面元素里肯定会有大于等于len的（不考虑负值），那么元素在0到len - 1之间不连续肯定有空档，我们就从0开始遍历，找到最小的那个空档，拿这个数赋值新元素。具体一点就是，先从0开始，拿0去比较其他所有元素，没有重复的话就用它做新元素，重复了就break，再拿1比较，依次循环……直到length，如果length之前全都重复了，那么就是length就不用比了。
    /**
     * 返回一个和给定数组中的元素（或元素的属性值）都不相等的最小自然数
     * @param {需要比较的数组} array 
     * @param {如果比较的是数组元素中的某个属性，则传入属性名key；直接比较元素，key=undefined} key 
     * @param {得到结果时要调用的方法，方法内的this指向调用jumpQueue的对象，不需要fn则为undefined} fn 
     * @param {可选：fn方法的参数} fnParameter 
     * @param {为customerWaiter方法中的特定情况设置的参数，如其他处需要复用不需要写} boolean 
     */
    jumpQueue(array, key, fn, fnParameter, boolean) {
        if (Array.isArray(array)) {
            if (key && typeof (key) !== "string") {
                throw new Error(`TypeError: ${key} is not a String`)
            }
            if (fn && !(fn instanceof Function)) {
                throw new Error(`TypeError: ${fn} is not a Function`)
            }
            //用在变异数组方法中时，在这之前新元素已经进数组了，所以数组长度要减一，传入boolean以辨别
            let length = boolean ? array.length - 1 : array.length
            //如果是空数组，第一个元素是0
            if (length === 0) {
                if (fn) {
                    fn.call(this, fnParameter, 0)
                }
                return 0
            }
            for (let i = 0; i <= length; i++) {
                //如果已经循环到了最后一个，说明之前的key都是按顺序排列的，最后一个就确定了，直接赋值
                if (i === length) {
                    if (fn) {
                        fn.call(this, fnParameter, i)
                    }
                    return i
                }
                for (let j = 0; j < length; j++) {
                    let arrayItemNumber = key ? array[j][key] : array[j]
                    if (i === arrayItemNumber) {
                        break
                    }
                    if (j === length - 1 && i !== arrayItemNumber) {
                        if (fn) {
                            fn.call(this, fnParameter, i)
                        }
                        return i
                    }
                }
                /*这个虽然多了一个变量，但是更省性能
                let flag = true
                for (let j = 0; j < len; j++) {
                    let key = this.customerInSeat[j].key
                    if (i === key) {
                        flag = false
                        break
                    }
                }
                if (flag) {
                    customer.key = i
                    break
                }
                */
            }
        }
        else {
            throw new Error(`TypeError: ${array} is not a Array`)
        }
    }

    /*可以把顾客的key属性看成座位号。需要保证餐厅里在场所有的顾客座位号（即key值）不能一样，因为不可能两位顾客同时坐在同一个座位上。这也是为了如果需要在UI层渲染数据，不会造成不同顾客数据同时渲染到同一个节点上。
    在customerSit方法里，离开的顾客会把自己的key赋值给新进来的顾客，那么我们只需要保证离开之前的那些顾客key值互不相同即可，那些顾客只能是customerWaiter方法送进来的。
    也就是说只需要在customerWaiter方法里面，让新进去的顾客的key和在场所有其他顾客都不同（可以循环比较数组已有元素的key）
    */

    /*排队队伍和餐厅顾客的增减流程：
    customerList里有新顾客push进来=>如果custoemrInSeat有空位就坐进去（借用了原生数组的原型方法，不会触发额外行为）
    custoemrInSeat有顾客离开=>如果customerList有顾客排队就抽第一个顾客进去入座（借用了原生数组的原型方法，不会触发额外行为）
    除了一开始坐满座位需要用到customerWaiter方法。当排队顾客充足的情况下，customerSit方法能自己满足餐厅位置坐满，不会再用到customerWaiter方法。
    只有在某些时候，即 顾客离开后外面暂时没有顾客排队，造成餐厅座位有空闲时，这时有顾客过来了才会再次用到customerWaiter方法把空位填满或者直到没有更多排队者
    */

    //有顾客离开调用的方法
    //仅当splice时会触发
    customerSit(ctm) {
        if (!(ctm instanceof Object)) return
        let length = this.customerList.length
        if (!length) {
            return
        }
        let len = this.customerInSeat.length
        let seats = this.seats
        //防止当seats变小时和预期不一样，减少座位后如果seats变的比len小，顾客队列不会工作，顾客离开也不会调用增加顾客的函数
        if (len < seats) {
            let key = ctm.key
            if (typeof (key) !== "number") {
                throw new Error(`splice "customerInSeat" 数组时，数组中的customer对象没有key属性或key的数据类型不是数字`)
            }
            let customer = [].shift.call(this.customerList)
            customer.key = key
            this.customerInSeat[len] = customer
            //调用点菜方法
            this.order(customer)
        }
    }
    //点菜方法
    order(customer) {
        let orderDishes = customer.order()
        console.log(`${customer.name} 通过app点菜`)
        console.log(orderDishes)
        console.log(`点菜信息被送到厨房白板`)
        Restaurant.orderDishesToRestaurant(customer, orderDishes)
        return
    }
    //做菜方法
    cook(method) {
        let cookList = this.staff.cook
        if (!cookList) {
            throw new Error("餐厅没有厨师")
        }
        let len = cookList.length
        //厨师做完菜直接调用的方法，不经过push响应，用于厨师做完一个菜后，接着做下一个（如果还有的话）
        if (method === "direct") {
            /*console.log("cookDirect")*/
            for (let i = 0; i < len; i++) {
                if (cookList[i].atLeisure) {
                    cookList[i].work()
                    return
                }
            }
        }
        if (method !== "push") return
        let dishList1 = this.dishesList
        let dishList2 = this.doneDishes
        let dishList3 = this.cooking
        let dishLen1 = dishList1.length
        let dishLen2 = dishList2.length
        let dishLen3 = dishList3.length
        let name = dishList1[dishLen1 - 1].name
        //检查和 白板里的菜 是否有重复
        for (let i = 0; i < dishLen1 - 1; i++) {
            let comName = dishList1[i].name
            if (comName === name) {
                /*console.log(`白板有重复:${name}`)*/
                return [].pop.call(dishList1)
            }
        }
        //检查和 做好待上的菜 是否有重复
        for (let i = 0; i < dishLen2 - 1; i++) {
            let comName = dishList2[i].name
            if (comName === name) {
                /*console.log(`做好有重复:${name}`)*/
                return [].pop.call(dishList1)
            }
        }
        //检查和 正在做的菜 是否有重复
        for (let i = 0; i < dishLen3 - 1; i++) {
            let comName = dishList3[i].name
            if (comName === name) {
                /*console.log(`正在有重复:${name}`)*/
                return [].pop.call(dishList1)
            }
        }
        //如果都不重复且餐厅有厨师
        if (len) {
            for (let i = 0; i < len; i++) {
                //如果有空闲的厨师
                if (cookList[i].atLeisure) {
                    let dish = this.dishesList[0]
                    cookList[i].work(dish)
                    return
                }
            }
        }
    }
    //上菜方法
    service(method) {
        if (method !== "push") return
        let waiterList = this.staff.waiter
        let len = waiterList.length
        if (len) {
            for (let i = 0; i < len; i++) {
                if (waiterList[i].atLeisure) {
                    let dish = [].shift.call(this.doneDishes)
                    waiterList[i].work(dish)
                    return
                }
            }
        }
    }
    //餐厅雇员方法: 参数员工对象
    hire(staff) {
        if (!(staff instanceof Object)) {
            throw new Error(`class Restaurant's method: hire, it's parameter must belong Object`)
        }
        let staffKind = staff.staff
        let staffList = this.staff[staffKind] = this.staff[staffKind] ? this.staff[staffKind] : []
        staffList.push(staff)
        staff.getSalary(this)
    }
    //餐厅解雇方法: 参数员工对象
    fire(staff) {
        if (!(staff instanceof Object)) {
            throw new Error(`class Restaurant's method: fire, it's parameter must belong Object`)
        }
        //职员的id
        let id = staff.id
        //职员的职务
        let kind = staff.staff
        //这个职务所有职员组成的数组如果没有元素
        if (!this.staff[kind]) {
            throw new Error(`${kind} of class Restaurant's staff doesn't exist`)
        }
        let staffList = this.staff[kind]
        //判别是否删除
        let flag = true
        //删除特定id的职员
        for (let len = staffList.length, i = len - 1; i >= 0; i--) {
            let staff = staffList[i]
            if (staff.id === id) {
                staffList.splice(i, 1)
                staff.stopSalary()
                flag = false
                break
            }
        }
        //如果找不到相应的id
        if (flag) {
            throw new Error(`Can't find staff that id: ${id}, kind: ${kind}`)
        }
    }
    observe(...arg) {
        observe(...arg)
    }
    static orderDishesToRestaurant(customer, orderDishes) {
        for (let i = 0; i < orderDishes.length; i++) {
            let kind = orderDishes[i].name
            let key = customer.key
            //将点菜顾客相关的属性、方法放进watcher内
            let watcher = new Watcher(customer, customer.addFood, kind, key)
            //讲watcher注册进餐厅实例的dep对象里sub的相应分类里，当上菜时，同一个菜好了可以通知到所有订阅了该菜的顾客
            restaurant.dep.subcript(watcher)
            restaurant.dishesList.push(orderDishes[i])
        }
    }
    //Restaurant类的静态方法：监听对象属性。用静态方法不受制于实例的变化。
    static observeProperty(obj, key, value, fn, id, target) {
        target = target || null
        if (typeof(key) === "string") {
            Object.defineProperty(obj, key, {
                constructor: true,
                enumerable: true,
                get: function () {
                    return value
                },
                set: function (newValue) {
                    if (newValue === value) return
                    value = newValue
                    fn.call(target, id, value)
                }
            })
        }
        else if (Array.isArray(key)) {
            for (let i = 0; i < key.length; i++) {
                Object.defineProperty(obj, key[i], {
                    constructor: true,
                    enumerable: true,
                    get: function () {
                        return value
                    },
                    set: function (newValue) {
                        if (newValue === value) return
                        value = newValue
                        fn.call(target, id, value)
                    }
                })
            }
        }
    }
}

//职员类
class Staff {
    constructor(id, name, salary) {
        this.id = id
        this.name = name
        this.salary = salary
        this.earn = 0
        //是否空闲
        this.atLeisure = true
    }
    work(...arg) {
        this.ownWork(...arg)
    }
    //雇员时调用这个方法，定时发工资（扣餐厅钱）
    getSalary(restaurant) {
        let _this = this
        this.earnMoney = setInterval(function () {
            //按正常速度发一次工资太慢，这里速度变成100倍（原1500秒），金额也除以100倍
            let salary = _this.salary / 100
            restaurant.money -= salary
            _this.earn += salary
        }, 15000)
    }
    //解雇时调用这个方法，停止定时器
    stopSalary() {
        clearInterval(this.earnMoney)
    }
}

//现在有两个问题：为什么服务员总是一去服务。厨师splice数组cooking时，index是变动的。已解决：return位置写错了。给菜加上属性值（厨师名字），删除时以这个属性值为准。

//服务员类继承职员类
class Waiter extends Staff {
    constructor(id, name, salary, staff) {
        super(id, name, salary)
        this.staff = staff
    }
    //两个参数：菜数组Array<object>，点菜的顾客对象
    ownWork(parameter) {
        let _this = this
        this.atLeisure = false
        //顾客直接用app点菜，服务员不需要去点菜了
        //服务员上菜方法
        if (parameter && typeof (parameter) === "object") {
            setTimeout(work, 1000)
            //work函数没有调用对象，或者说调用对象是window，所以this是window的this，那么就要使用_this
            function work() {
                console.log(`${_this.name} 上 ${parameter.name} 菜`)
                restaurant.dep.notify(parameter.name, parameter)
                _this.atLeisure = true
                let len = restaurant.doneDishes.length
                //如果有做好的菜待上
                if (len) {
                    restaurant.service("push")
                }
            }
        }
    }
}

//厨师类继承职员类
class Cook extends Staff {
    constructor(id, name, salary, staff) {
        super(id, name, salary)
        this.staff = staff
        this.atLeisure = true
        this.earnMoney
    }
    /*restaurant.dishesList的shift时机是个问题，如果在异步之前shift，dish未完成之前就从restaurant消除了，监测下一个dish在白板中是否重复就可能出错，因为在厨师做完之前，这个dish（restaurant.dishesList[0]）对象在餐厅实例中是不存在的。
    如果在异步函数里面shift，也就是做完再shift，那么dish对象在dishList数组中还存在，别的厨师依然会继续做这个菜。
    初步解决方法：
    在restaurant属性中再加一个属性cooking: Array<object>，临时存放正在做的菜（在异步之前shift，push进cooking），把cooking也加入重复对比中。
    */
    /*新问题：cooking里的dish做完了，怎么删除。如果按照index删除，会造成排序错乱。
    初步解决办法：给dish对象临时加一个属性用来在删除时定位（属性可以是厨师名字，在做菜方法的生命周期期间，cooking里一个厨师只会有一个菜，不用担心重复），删除后再去掉这个属性。*/
    ownWork() {
        let _this = this
        this.atLeisure = false
        let dish = [].shift.call(restaurant.dishesList)
        if (Object.prototype.toString.call(dish) !== "[object Object]") {
            console.log("cook.ownWork : dish is not object")
            return
        }
        let cooking = restaurant.cooking
        let name = this.name
        let time = dish.time
        dish.cookName = name
        cooking.push(dish)
        console.log(`${_this.name} 开始做 ${dish.name} 菜`)
        setTimeout(function () {
            work(name)
        }, time * 1000)
        //work函数没有调用对象，或者说调用对象是window，所以this是window的this，那么就要使用_this
        function work(name) {
            console.log(`${_this.name} 做好了 ${dish.name} 菜`)
            dish.state = "做好"
            let len = cooking.length
            for (let i = len - 1; i >= 0; i--) {
                let currentName = cooking[i].cookName
                if (currentName === name) {
                    cooking.splice(i, 1)
                    dish.cookName = undefined
                    break
                }
            }
            restaurant.doneDishes.push(dish)
            if (_this.fired) {
                restaurant.fire(_this)
                return
            }
            _this.atLeisure = true
            let length = restaurant.dishesList.length
            if (length) {
                /*console.log("ready cookDirect")*/
                restaurant.cook("direct")
            }
        }
    }
}

//顾客类
class Customer {
    constructor(name) {
        this.name = name
        this.food = []
        this.hasEat = 0
        this.needPayDishes = []
        this.eating = false
        this.observe(this)
        let haveFoodEat = new Watcher(this, this.eat)
        this.food.dep.subcript(haveFoodEat)
    }
    order() {
        if (this.hasOrder) {
            throw new Error(`ProcessError: ${this.name} has ordered dishes`)
        }
        console.log(`${this.name} 入座`)
        let orderDishes = Customer.randomSelect(1, 5, menu)
        this.needPayDishes = orderDishes.slice()
        this.hasOrder = true
        return orderDishes
    }
    eat(method) {
        if (method !== "push") return
        if (this.eating) return
        let _this = this
        let dishes = this.food
        let len = dishes.length
        if (len) {
            this.eating = true
            let dishesNumber = this.needPayDishes.length
            let dish = dishes[0]
            setTimeout(enjoy, dish.time * 1000)
            //enjoy函数没有调用对象，或者说调用对象是window，所以this是window的this，那么就要使用_this
            function enjoy() {
                let dish = [].shift.call(dishes)
                //判断类型是否为对象的一个较为准确的方法
                if (Object.prototype.toString.call(dish) !== "[object Object]") {
                    throw new Error(`${dish} is not object`)
                }
                dish.state = "已吃完"
                console.log(`${_this.name} 吃完了 ${dish.name}`)
                let hasEatNumber = ++_this.hasEat
                _this.eating = false
                if (hasEatNumber === dishesNumber) {
                    _this.pay()
                }
                else {
                    _this.eat("push")
                }
            }
        }
    }
    pay() {
        let payMoney = 0
        let earnMoney = 0
        let dishes = this.needPayDishes
        let len = dishes.length
        for (let i = 0; i < len; i++) {
            //菜价格减成本
            let income = dishes[i].price - dishes[i].cost
            payMoney += dishes[i].price
            earnMoney += income
        }
        restaurant.money += earnMoney
        let key = this.key
        //遇见一个很小的坑：key是0时Boolean值依然会是false，所以不能直接 if (key) {}
        if (key !== undefined) {
            let customerList = restaurant.customerInSeat
            let customerListLen = customerList.length
            for (let i = 0; i < customerListLen; i++) {
                let compareKey = customerList[i].key
                if (compareKey === key) {
                    console.log(`${this.name} 付钱 ${payMoney}元 离开`)
                    customerList.splice(i, 1)
                    return
                }
            }
            throw new Error(`can't find the customer that it's key is ${key}`)
        }
        else {
            throw new Error(`the customer: ${this.name}'s property: key is undefined`)
        }
    }
    //菜上好后添加进food属性
    addFood(dish) {
        let dish$ = new Dishes(dish)
        dish$.state = "已上"
        this.food.push(dish$)
    }
    observe(...arg) {
        observe(...arg)
    }
    //随机不重复点菜方法(静态)
    //参数：最小值，最大值，使用信息的数组，可选：如果没有则是点菜相关
    static randomSelect(...arg) {
        let min = arg[0]
        let max = arg[1]
        let menu = arg[2]
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
            //防止出现重复
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
        if (arg[3]) return menus
        let newMenus = menus.map(function (value) {
            let result = new Dishes(value)
            return result
        })
        return newMenus
        //范围随机数方法
        function random(min, max) {
            let num = Math.floor(Math.random() * (max - min + 1) + min)
            return num
        }
    }
}

//菜品对象
class Dishes {
    constructor(object) {
        this.name = object.name
        this.cost = object.cost || object.price * 0.6
        this.price = object.price
        this.time = object.time
        this.state = object.state
    }
}

//主题对象
class Dep {
    constructor() {
        this.sub = {}
    }
    subcript(watcher) {
        let kind = watcher.kind
        if (typeof (kind) === "undefined") {
            let subDefault = this.sub.default = this.sub.default ? this.sub.default : []
            subDefault.push(watcher)
            return
        }
        let subKind = this.sub[kind] = this.sub[kind] ? this.sub[kind] : []
        subKind.push(watcher)
    }
    unsubscript(watcher) {
        let kind = watcher.kind
        if (typeof (kind) === "undefined") {
            let subDefault = this.sub.default
            for (let i in subDefault) {
                if (subDefault[i] === watcher) {
                    subDefault.splice(i, 1)
                    break
                }
            }
            return
        }
        let subKind = this.sub[kind]
        for (let i in subKind) {
            if (subKind[i] === watcher) {
                subKind.splice(i, 1)
                break
            }
        }
    }
    notify(...arg) {
        let firstParameter = arg[0]
        let secondParameter = arg[1]
        let len = arg.length
        if (len === 0) {
            let subDefault = this.sub.default
            for (let i in subDefault) {
                subDefault[i].updata()
            }
            return
        }
        //如果只有一个参数，则代表message
        if (len === 1) {
            let message = firstParameter
            let subDefault = this.sub.default
            for (let i in subDefault) {
                subDefault[i].updata(message)
            }
            return
        }
        //如果两个参数，第一个是kind，第二个是message
        let kind = firstParameter
        let message = secondParameter
        let subKind = this.sub[kind]
        let length = subKind.length
        for (let i = length - 1; i >= 0; i--) {
            subKind[i].updata(message)
            this.unsubscript(subKind[i])
        }
    }
}
//监听对象
class Watcher {
    constructor(target, fn, kind, key) {
        if (!(fn instanceof Function)) {
            throw new Error(`${fn} is not function`)
        }
        if (kind && typeof (kind) !== "string") {
            throw new Error(`${kind} is not string`)
        }
        if (key && typeof (key) !== "number") {
            throw new Error(`${key} is not number`)
        }
        this.target = target
        this.fn = fn
        this.kind = kind
        this.key = key
    }
    updata(...arg) {
        let len = arg.length
        if (len === 1) {
            let message = arg[0]
            this.fn.call(this.target, message)
        }
        else if (len > 1) {
            this.fn.apply(this.target, arg)
        }
        else {
            this.fn.call(this.target)
        }
    }
}


//监听对象中的数组
function observe(...arg) {
    let obj = arg.shift()
    if (!obj || typeof (obj) !== "object") {
        throw new Error(`parameter: ${obj} is not Object`)
    }
    if (obj instanceof Object) {
        let len = arg.length
        if (len) {
            Object.keys(obj).forEach(function (key) {
                if (Array.isArray(obj[key]) && arg.indexOf(obj[key]) === -1) {

                    observeArray(obj[key])
                }
                else {
                }
            })
        }
        else {
            Object.keys(obj).forEach(function (key) {
                if (Array.isArray(obj[key])) {
                    observeArray(obj[key])
                }
            })
        }
    }
    observeArray(obj)
    function observeArray(obj) {
        if (Array.isArray(obj)) {
            let newArrayMethods = newArrayMethod().newArrayMethods
            let arrayMethods = newArrayMethod().arrayMethods
            let hasProto = __proto__ in {}
            let excute = hasProto ? normal : polify
            excute()
            //为数组新建dep属性
            def(obj, "dep", new Dep())
            function normal() {
                obj.__proto__ = newArrayMethods
            }
            function polify() {
                arrayMethods.forEach(function (method) {
                    def(obj, method, newArrayMethods[method])
                })
            }
        }
    }
    //变异数组方法
    function newArrayMethod() {
        let arrayMethods = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"]
        let newArrayMethods = Object.create(Array.prototype)
        let oldArrayMethods = Array.prototype
        arrayMethods.forEach(function (method) {
            def(newArrayMethods, method, newMethod, true)
            function newMethod(...arg) {
                let _this = this
                let result = oldArrayMethods[method].apply(this, arg)
                /*console.log("arraydoing")*/
                let dep = this.dep
                if (method === "splice") {
                    let index = arg[0]
                    let customer = result[index]
                    dep.notify(customer)
                }
                else if (method === "push") {
                    dep.notify(method)
                }
                else {
                    dep.notify()
                }
                return result
            }
        })
        return { newArrayMethods, arrayMethods }
    }
    function def(obj, key, value, enumerable) {
        Object.defineProperty(obj, key, {
            configurable: true,
            enumerable: !!enumerable,
            value: value,
            writable: true
        })
    }
}