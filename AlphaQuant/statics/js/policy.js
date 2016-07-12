/**
 * Created by Jerome on 2016/5/11.
 */



var policy_id = $("#policy_id").val();
var time = [];
var stock_price = [];
var b = [];
var c = [];
var log = []


$(function () {

    $('#policyTitle').bind({
        focus: function () {
            $(this).css("background-color", '#ffffff');
        },
        blur: function () {
            $(this).css("background-color", '#f2f2f2');
        }

    });

    $('.datetimepicker').datetimepicker({
        language: 'zh-CN',
        format: 'yyyy-mm-dd',//选择完日期后，input框里的时间值的格式
        minView: 'month',
        endDate: new Date(),//结束日期时间，在此之后的都不可选，同理也有beigin
        weekStart: 1,
        todayBtn: 1,
        autoclose: 1,
        todayHighlight: 1,
        startView: 2,
        forceParse: 0,
        showMeridian: 1,
    });
    $('.datetimepicker').css("background-color", '#FFFFFF');

})

$(document).ready(function () {


    $("#buildBtn").click(function () {
        $("#build-loading").removeClass('hidden');
        $("#policy-status").addClass("hidden");
        $("#log-loading").removeClass('hidden');
        editor.commands.exec("编译运行", editor);
    });


    $("#loopbackBtn").click(function () {
        editor.commands.exec("运行回测", editor);
    });

});


function initValue() {
    time = [];
    stock_price = [];
    b = [];
    c = [];
}


function saveTitle() {
    $("#saveBtn").val("保存");
    $("#saveBtn").removeAttr('disabled');
}

function buildPolicy(a) {
    savePolicy();
    initValue();
    var company = $("#company").val();
    var beginTime = $("#beginTime").val();
    var endTime = $("#endTime").val();
    var money = $("#money").val();
    var rate = $("#rate").val();
    if (company == "") {
        alert("公司不能为空");
        return;
    }
    if (money == '') {
        alert("启动资金不能为空");
        return;
    }
    var parameter = company + ',' + beginTime + ',' + endTime + ',' + money + ',' + rate;
    $.ajax({
        type: "POST",
        url: "/buildPolicy/",
        data: {
            policy_id: policy_id,
            parameter: parameter,
        },
        // dataType: "json",
        success: function (taskId) {
            if (a == 0) {
                getPolicyResult(taskId, 1)
            }
            else if (a == 1) {
                window.location.href = '../backtestPolicy/?task_id=' + taskId;
            }

        },
        error: function (jqXHR) {
            alert("发生错误：" + jqXHR.status);
        },
    });
}

function getYaisData(data) {
    var yData = data;
    var bb = [];
    for (var i = 0; i < yData.length; i++) {

        var y;
        var m;
        var day;
        var aa = yData[i].split(" ");
        //var cc = aa[0].replace(new RegExp(/(-)/g),',');
        var dd = aa[0].split('-');
        for (var j = 0; j < dd.length; j++) {
            y = Number(dd[0]);
            m = Number(dd[1]);
            day = Number(dd[2]);
        }
        var date = Date.UTC(y, m, day);
        //console.log(date);
        bb.push([date, Number(aa[1])]);
    }
    //console.log(bb);
    return bb;
}

function getPolicyResult(taskId, offset) {
    $.ajax({
        type: "POST",
        url: "/getPolicyResult/",
        data: {
            taskId: taskId,
            offset: offset,
        },
        success: function (result) {
            if (result == 'not exist') {
                setTimeout(function () {
                    getPolicyResult(taskId, offset)
                }, 1000);
            }
            else {
                finish_flag = result.finish_flag;
                // time = time.concat(result.time);
                //stock_price = getYaisData(result.stock_price);
                b = b.concat(getYaisData(result.b));
                c = c.concat(getYaisData(result.c));
                log = log.concat(result.log)
                if (finish_flag != 1) {
                    offset = offset + 1;
                    getPolicyResult(taskId, offset)
                } else {


                    var chart = new Highcharts.StockChart({
                        chart: {
                            renderTo: 'policy_result_chart'//指向的div的id属性
                        },
                        exporting: {
                            enabled: true //是否能导出趋势图图片
                        },
                        title: {
                            text: 'Stock price'//图表标题
                        },
                        xAxis: {
                            gridLineWidth: 1,
                            gridLineColor: "lightgray",
                            categories: time,
                            type: "datetime",
                            tickPixelInterval: 120,
                            labels: {
                                style: {
                                    fontSize: "10px"
                                },
                                formatter: function () {
                                    return Highcharts.dateFormat("%y-%m-%d", this.value)
                                }
                            }
                        },
                        yAxis: {

                            title: {
                                text: '收益率(%)'  //y轴上的标题
                            }
                        },
                        tooltip: {
                            xDateFormat: '%Y-%m-%d, %A'//鼠标移动到趋势线上时显示的日期格式
                        },
                        rangeSelector: {
                            buttons: [{//定义一组buttons,下标从0开始
                                type: 'week',
                                count: 1,
                                text: '1w'
                            }, {
                                type: 'month',
                                count: 1,
                                text: '1m'
                            }, {
                                type: 'month',
                                count: 3,
                                text: '3m'
                            }, {
                                type: 'month',
                                count: 6,
                                text: '6m'
                            }, {
                                type: 'ytd',
                                text: 'YTD'
                            }, {
                                type: 'year',
                                count: 1,
                                text: '1y'
                            }, {
                                type: 'all',
                                text: 'All'
                            }],
                            selected: 1//表示以上定义button的index,从0开始
                        },

                        series: [{
                            name: '策略收益',//鼠标移到趋势线上时显示的属性名
                            data: b,//属性值
                            //marker : {
                            //		enabled : true,
                            //		radius : 3
                            //	},
                            //shadow : true
                        }, {

                            name: '基准收益',
                            data: c
                        },
                        ]

                    });

                    /*var y1 = $("#beginTime").val().split("-")[0];
                     var m1 = $("#beginTime").val().split("-")[1];
                     var y2 = $("#endTime").val().split('-')[0];
                     var m2 = $("#endTime").val().split('-')[1];
                     var tickInterval = 3*(12*(y2-y1) +(m2-m1));

                     $('#policy_result_chart').highcharts({                   //图表展示容器，与div的id保持一致
                     chart: {
                     type: 'line'                         //指定图表的类型，默认是折线图（line）
                     },
                     tooltip: {
                     crosshairs: true,     //数据显示
                     shared: true
                     },
                     title: {
                     text: ' Highcharts Demo'      //指定图表标题
                     },
                     xAxis: {
                     categories: time,  //指定x轴分组
                     tickInterval: tickInterval,
                     },
                     yAxis: [{

                     },
                     {

                     }],

                     series: [{
                     yAxis:0,//指定数据列
                     name: '策略收益',                          //数据列名
                     data: b  ,                 //数据
                     }, {
                     yAxis:0,
                     name: '基准收益',
                     data: c
                     },
                     {
                     yAxis:1,
                     name: 'stock_price',
                     data: stock_price
                     }]
                     });*/
                    log = (String)(log);

                    logs = log.split(",");
                    var str = '';
                    for (var i = 0; i < logs.length; i++) {
                        log = logs[i].trim();
                        log = log.split(" ")
                        log = "<span style='color: #247bac;'>" + " " + log[0] + " " + log[1] + " " + "</span>"
                            + "<span style='color: #285628;'>" + log[2] + " " + "</span>"
                            + "<span style='color: white;'>" + log[3] + "</span>";
                        str = str + log + "<br>";
                    }
                    $("#log-loading").addClass('hidden');
                    $('#policy_log').html((str));
                    $("#build-loading").addClass('hidden');
                    $("#policy-status").removeClass("hidden");

                    $.ajax({
                        type: "POST",
                        url: "/getResultInfo/",
                        data: {
                            taskId: taskId,
                        },
                        success: function (resultInfo) {
                            $("#strategy_return").text(resultInfo.strategy_return);
                            $("#basic_return").text(resultInfo.basic_return);
                            $("#alpha").text(resultInfo.alpha);
                            $("#beta").text(resultInfo.beta);
                            $("#sharp").text(resultInfo.sharp);
                            $("#maxdown").text(resultInfo.maxdown);

                        },
                        error: function (jqXHR) {
                            alert("发生错误：" + jqXHR.status);
                        },


                    });

                }

            }
        }
    });

}

