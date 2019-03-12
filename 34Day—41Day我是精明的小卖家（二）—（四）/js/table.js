//根据传入的参数渲染表格body部分的内容
function createDom(newData) {
    let data = "";
    if (newData) {
        for (let i = 0; i < newData.length; i++) {
            data += `<tr reg=${newData[i].region} pro=${newData[i].product}>`;
            if (checkedTest().checkRegion === 1 && checkedTest().checkProduct > 1) {
                data += "<td>" + newData[i].region + "</td>";
                data += "<td>" + newData[i].product + "</td>";
            }
            else {
                data += "<td>" + newData[i].product + "</td>";
                data += "<td>" + newData[i].region + "</td>";
            };
            for (let j = 0; j < newData[i].sale.length; j++) {
                data += `<td class="data"><input value="${newData[i].sale[j]}" /></td>`;
            };
            data += "</tr>";
        };
    };
    document.getElementById("wrapperTbody").innerHTML = data;
};