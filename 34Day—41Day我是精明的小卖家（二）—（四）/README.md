# 百度前端技术学院 第三十四天到第四十一天
<h3>问题：只能在火狐浏览器打开，在谷歌浏览器getSVGDocument()会返回null。<br />
Issues: Only can view in FireFox, getSVGDocument() return null in chrome.</h3>
我是精明的小卖家（二）——（四）<br />
具体需求：<a href="http://ife.baidu.com/course/detail/id/55">http://ife.baidu.com/course/detail/id/55</a><br />
<a href="http://ife.baidu.com/course/detail/id/56">http://ife.baidu.com/course/detail/id/56</a><br />
<a href="http://ife.baidu.com/course/detail/id/57">http://ife.baidu.com/course/detail/id/57</a>
<br /><br />
课程目标<br />
今天我们将学习SVG和Canvas，来继续丰富我们的销售报表。当上一课任务完成时，面对一个复杂数据的表格，估计没有人会仔细看这份数据的内容是什么，看也看不出什么。所以我们希望找到某种方式，让数据变得更加易读和易懂，而数据可视化正式解决这一问题的最佳答案。
<br />
在表格上方增加两个图表，一个折线图和一个柱状图，用于展现不同数据在12个月的销售情况。<br /><br />
今天我们将学习LocalStorage，基于它来实现对于数据的写操作。<br />
我们在做这种系统时，经常会有在数据表格中同时进行数据编辑的需求，这里面涉及两个工作，一个是实现在数据编辑的交互问题，另一个是解决数据编辑完成后的传输问题。<br />
<ul>
    <li>我们首先为所有表格增加一个编辑功能，在原来的表格输出的数据单元格，全部变成input输入框，里面为数据。</li>
    <li>在页面中增加一个保存按钮，点击保存后将数据保存到LocalStorage中。</li>
    <li>页面加载的时候，优先从LocalStorage读取数据。</li>
</ul>
今天我们将进行这个任务系列的最后一课，学习Location，Hash等相关知识，来实现最后一个需求。<br />
现在通过hash的方式<br />
<ul>
    <li>把用户的一些交互状态通过某种方式记录在URL中。</li>
    <li>分享或再次打开某个URL，需要从URL中读取到数据状态，并且进行页面呈现的还原。</li>
    <li>需要记录的状态包括：产品的选择以及地域的选择。</li>
</ul>
