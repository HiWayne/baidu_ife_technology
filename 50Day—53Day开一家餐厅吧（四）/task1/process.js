/*import {Restaurant, Waiter, Cook, Customer, Dishes} from './class'*/

//创建实例
let restaurant = new Restaurant({ money: 11000, seats: 3, staff: [] })//创建一个餐厅实例
let waiter = new Waiter({ id: 0, name: "waiter1", salary: 4000 })//创建一个服务员实例
let cook = new Cook({ id: 1, name: "cooker1", salary: 7000 })//创建一个厨师实例
restaurant.hire(waiter)//餐厅雇佣了一个服务员
restaurant.hire(cook)//餐厅雇佣了一个厨师

//全局dep实例
let dep = new Dep()

//定义变量
//菜单
let menu = [{ name: "鱼香肉丝", price: 85, time: 4, state: "还未上" }, { name: "宫保鸡丁", price: 90, time: 3.6, state: "还未上" }, { name: "文丝豆腐", price: 120, time: 4, state: "还未上" }, { name: "红烧狮子头", price: 80, time: 3.6, state: "还未上" }, { name: "东坡肉", price: 95, time: 4, state: "还未上" }]
//顾客名字
let customerNames = ["李华", "王刚", "刘庆", "张丽", "朱茜", "周文", "林海", "魏薇", "韩雪", "贝蕾", "萧寒"]
//顾客排队队列
let customers = []
//餐厅入座顾客数组
let resCustomer = restaurant.customer
//排队最多人数
let customersLength = 5
//一个时间单位：1000ms
let time = 1000
//服务员移动时间0.5秒
let waiterMoveTime = 0.5
//顾客点菜时间3秒
let customerOrderTime = 3
//顾客吃菜时间3秒
let customerEatTime = 3
//data对象中的变量是被监听的
let data = {
    customers,
    resCustomer
}

//顾客节点
let customerDom = document.getElementById("customer")
//厨师节点
let cookDom = document.getElementById("cook")
//服务员节点
let waiterMoveDom = document.getElementById("waiter")

//使用变异数组方法(监听data对象中的数组变动)
function observe(obj) {
    for (let i in obj) {
        obj[i].__proto__ = ArrayMethod
        //给每个数组设置一个隐藏属性:私有的主题对象，其中注册了每当数组变动时需要调用的方法
        def(obj[i], "dep", new Dep())
    }
}
observe(data)

//注册一个把数组渲染到dom的方法
let customersWatcher = new Watcher(undefined, customerListShow)
customers.dep.subscribe(customersWatcher)
//注册一个排队顾客进入空座的方法
let resCustomerWatcher = new Watcher(undefined, restaurantAddCustomer)
resCustomer.dep.subscribe(resCustomerWatcher)


//顾客队列第一位入座方法
function customer(array) {
    if (array[0]) {
        return array[0]
    }
}

//test



//process
/*  顾客随机到来=>
    服务员去顾客那[1]=>
    服务员告诉厨师点的菜=>服务员查看有没有要上的菜[3]=>if (有) 服务员上菜=>服务员查看有没有顾客需要点菜[2]=>if (有) 循环[1]
                                                                                                    else 循环[3]
                                                                    =>顾客查看有没有菜没吃[5]=>if (有) 顾客吃菜=>循环[5]
                                                                                             else 顾客查看有没有菜没上=>if (有) return
                                                                                                                      else 顾客付钱离开=>第一个排队的顾客入座
                                                 =>else 循环[2]
    厨师查看有没有要做的菜[4]=>if (有) 厨师开始做菜=>循环[4]
                             else return
*/
//每过10秒来一批数量随机的顾客
setInterval(customerCome, 5000)

setTimeout(function () {
    restaurantAddCustomer()
    method1()
}, 5300)

//服务员去顾客那点菜
function method1() {
    console.log("服务员去顾客那点菜")
    new Promise(function (resolve) {
        //服务员移动方法,参数分别是要去的目标(节点)、移动时间(s)、刷新时间(ms)、到达目标后调用的方法(function)
        waiterSevice(customerDom, waiterMoveTime, 20, resolve)
    }).then(function () {
        return new Promise(function (resolve) {
            waiter.work()
            setTimeout(function () {
                console.log("resolve")
                resolve()
            }, (customerOrderTime * time) + 200)
        })
    }).then(function () {
        return new Promise(function (resolve) {
            cookDishes(cook.dish)
            resolve()
            if (!cook.doing) method4()
        })
    }).then(method3)
}
//服务员查看有没有顾客需要点菜
function method2() {
    //判断有没有顾客需要点菜
    for (let i = 0; i < resCustomer.length; i++) {
        if (!resCustomer[i].have) {
            return method1()
        }
    }
    //如果没有顾客需要点菜
    if (waiterMoveDom.offsetLeft === cookDom.offsetLeft) {
        setTimeout(method3, 10)
    }
    else {
        waiterSevice(cookDom, waiterMoveTime, 20, method3)
    }
}
//服务员查看有没有要上的菜
function method3() {
    //判断有没有待上的菜
    let dish = restaurant.waiteDish
    if (dish.length) {
        function fn() {
            new Promise(function (resolve) {
                waiter.work(dish)
                resolve()
            }).then(method2)
        }
        return waiterSevice(customerDom, waiterMoveTime, 20, fn)
    }
    //如果没有
    else {
        method2()
    }
}
//厨师查看有没有要做的菜
function method4() {
    if (cook.dish.length) {
        cook.doing = cook.doing || "doing"
        let dish = cook.dish[0]
        new Promise(function (resolve) {
            let needTime = (dish.time * time) / 1000
            cookState(`在做 ${dish.name} 菜<br>还差 ${needTime} 秒做完`)
            let state = setInterval(() => {
                needTime = (needTime * 1000 - 100) / 1000
                cookState(`在做 ${dish.name} 菜<br>还差 ${needTime} 秒做完`)
                if (needTime <= 0) {
                    clearInterval(state)
                    cookState("空闲中")
                }
            }, 100)
            setTimeout(function () {
                cook.work()
                resolve()
            }, dish.time * time)
        }).then(method4)
    }
    else {
        cook.doing = null
        return
    }
}
//顾客查看有没有菜没吃
function method5(customer) {
    new Promise(function (resolve, reject) {
        if (customer.food.length) {
            customer.eating = "eating"
            customerEat(customer, resolve)
        }
        else {
            reject()
        }
    }).then(function () {
        method5(customer)
    }).catch(function () {
        //如果顾客点的所有菜都吃完了
        if (customer.food.have === customer.payDish.length) {
            console.log("顾客准备付钱离开")
            //顾客付钱离开
            customer.pay()
            //第一个排队的顾客入座
            for (let i = 0; i < resCustomer.length; i++) {
                if (resCustomer[i] === customer) {
                    console.log(`${customer.name}顾客离开`)
                    //找到付钱的那个顾客对象，删除它，第一个排队的顾客入座
                    //resCustomer指向restaurant.customer数组，它现在是响应式的，餐厅入座的顾客数组(resCustomer)发生变动后会调用restaurantAddCustomer方法，排队顾客会自动入空座(如果有空座的话)
                    resCustomer.key = customer.key
                    resCustomer.splice(i, 1)
                    resCustomer.key = undefined
                }
            }
        }
        //如果顾客还有菜没上
        else {
            customer.eating = undefined
            return
        }
    })
}