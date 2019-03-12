let restaurant = new Restaurant(3, 1000000)
/*let waiter1 = new Waiter(0, "服务员一", 5000, "waiter")
let waiter2 = new Waiter(1, "服务员二", 5000, "waiter")
let waiter3 = new Waiter(2, "服务员三", 5000, "waiter")
let cook1 = new Cook(0, "厨师一", 8000, "cook")
let cook2 = new Cook(1, "厨师二", 8000, "cook")
let cook3 = new Cook(2, "厨师三", 8000, "cook")
let customer1 = new Customer("顾客一")
let customer2 = new Customer("顾客二")
let customer3 = new Customer("顾客三")
restaurant.hire(waiter1)
restaurant.hire(waiter2)
restaurant.hire(waiter3)
restaurant.hire(cook1)
restaurant.hire(cook2)
restaurant.hire(cook3)*/
//储存定时器的变量
let saveSetInterval
//开始、结束的点击事件
let button_start = document.getElementById("button_start")
let button_stop = document.getElementById("button_stop")
button_start.onclick = start
button_stop.onclick = stop
function start() {
    saveSetInterval = setInterval(autoAddCustomer, 5000)
    //防止多次点击开始导致多个定时器，开始按钮点击一次就换方法，结束按钮重置开始方法
    button_start.onclick = undefined
}
function stop() {
    clearInterval(saveSetInterval)
    button_start.onclick = start

}
function autoAddCustomer() {
    //排队人数超过15就不来了
    let len = restaurant.customerList.length
    if (len > 15) {
        return
    }
    //第四个参数不能为空，否则是随机点菜方法
    let randomCustomers = Customer.randomSelect(0, 5, customers, "随机顾客方法")
    randomCustomers.forEach(function (name) {
        let customer = new Customer(name)
        restaurant.customerList.push(customer)
    })
}
//雇佣、解雇事件相关节点
let button_hire = document.getElementById("button_hire")
let waiterList = document.getElementById("waiters")
let cookerList = document.getElementById("cookers")
//兼容IE浏览器的事件监听
//参数一：监听的节点，参数二：调用的方法，参数三：事件
function diffEvent(element, fn, event) {
    if (window.addEventListener) {
        element.addEventListener(event, function (e) {
            fn.call(this, e)
        })
    }
    else {
        element.attachEvent("on" + event, function (e) {
            e = window.event
            fn.call(this, e)
        })
    }
}
//雇员点击事件
//利用冒泡，监听父元素
diffEvent(button_hire, function (e) {
    let button = e.target
    let id = button.id
    hireEvent(id)
}, "click")
function hireEvent(staffKind) {
    let len
    let customers = restaurant.customerInSeat
    if (staffKind.indexOf("Waiter") !== -1) {
        if (restaurant.staff.waiter) {
            len = restaurant.jumpQueue(restaurant.staff.waiter, "id")
        }
        else {
            len = 0
        }
        let waiter = new Waiter(len, `服务员${len + 1}`, 5000, "waiter")
        let waiterItem = document.createElement("li")
        //服务员名称写在span里
        let waiterName = document.createElement("span")
        waiterName.innerHTML = `服务员${len + 1}`
        waiterItem.appendChild(waiterName)
        //解雇服务员写在button里
        let fireWaiterButton = document.createElement("button")
        fireWaiterButton.innerHTML = "解雇他"
        fireWaiterButton.setAttribute("staffId", len)
        waiterItem.appendChild(fireWaiterButton)
        waiterList.appendChild(waiterItem)
        restaurant.hire(waiter)
        //如果餐厅没有服务员太长时间，等待队列排满后customerList的push会停用，重新招募服务员时没有相关数据变化驱动order方法
        //所以在招募服务员按钮功能里添加如下代码
        //如果有暂时挂起待服务的顾客，调用服务方法。注：不必遍历入座顾客查看有没有hasOrder，因为如果没有服务员或者所有服务员都忙，顾客会暂时push进customerSuspension，只需查看customerSuspension有没有元素就行了，记得shift已服务的顾客。
        if (restaurant.customerSuspension.length) {
            let customer = restaurant.customerSuspension.shift()
            restaurant.order(customer)
            return
        }
        //如果没有待服务的顾客再查看有没有待上的菜，service里面已经有shift步骤了，这里不用写
        if (restaurant.doneDishes.length) {
            restaurant.service("push")
            return
        }
    }
    else if (staffKind.indexOf("Cook") !== -1) {
        if (restaurant.staff.cook) {
            len = restaurant.jumpQueue(restaurant.staff.cook, "id")
        }
        else {
            len = 0
        }
        let cook = new Cook(len, `厨师${len + 1}`, 8000, "cook")
        let cookerItem = document.createElement("li")
        //服务员名称写在span里
        let cookerName = document.createElement("span")
        cookerName.innerHTML = `厨师${len + 1}`
        cookerItem.appendChild(cookerName)
        //解雇厨师写在button里
        let fireCookerButton = document.createElement("button")
        fireCookerButton.innerHTML = "解雇他"
        fireCookerButton.setAttribute("staffId", len)
        cookerItem.appendChild(fireCookerButton)
        cookerList.appendChild(cookerItem)
        restaurant.hire(cook)
        //在没有服务员的情况下，没有新的上菜，dishesList不会触发cook方法，所以在雇佣厨师按钮里加入以下代码
        //雇佣厨师后，查看有没有待做的菜，这个步骤不会和正常的流程重复，因为它是同步的，要么先进行正常的流程，发现没有厨师=>结束（哪怕你是在这个过程期间点击雇佣，它也会在当前函数体主线程执行完毕后再执行），然后新雇佣厨师时进行检查，符合条件的话开始工作（在这期间，如果因为点了新菜而触发cook，这个cook也会在该线程执行完毕后再执行=>发现厨师已经在忙了=>结束，而不会出现重复cook的情况。上面的服务员检查基本同理，因为js同步机制的存在，很多看似会同时进行、因互相影响而出错的流程，其实都是按正确顺序执行的（会等待前面的函数体执行完毕））
        if (restaurant.dishesList.length) {
            restaurant.cook("direct")
        }
    }
}
//解雇点击事件
//服务员的解雇
diffEvent(waiterList, function (e) {
    let waiters = restaurant.staff.waiter
    fireEvent(e, waiters)
}, "click")
//厨师的解雇
diffEvent(cookerList, function (e) {
    let cookers = restaurant.staff.cook
    fireEvent(e, cookers)
}, "click")
function fireEvent(e, staffs) {
    if (e.target.nodeName === "BUTTON") {
        let button = e.target
        let len = staffs.length
        for (let i = len - 1; i >= 0; i--) {
            let id = button.getAttribute("staffId")
            id = parseInt(id)
            let compareId = staffs[i].id
            compareId = parseInt(compareId)
            if (compareId === id) {
                if (staffs[i].atLeisure) {
                    restaurant.fire(staffs[i])
                }
                else {
                    staffs[i].fired = true
                }
                //删除对应的li
                let li = button.parentNode
                let staffList = li.parentNode
                staffList.removeChild(li)
                return
            }
        }
        throw new Error(`can't find the waiter that it's id is ${id}`)
    }
}