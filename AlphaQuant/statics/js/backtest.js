var task_id = $("#back_task_id").val();
getBacktestInfo(task_id)
getPolicyResult(task_id,1)
var time = [];
var stock_price = [];
var b = [];
var c = [];

function getBacktestInfo(taskId){
    $.ajax({
        type: "POST",
        url: "/getBacktestInfo/",
        data: {
            taskId: taskId,
        },
        success: function (task) {
            $("#beginTime").text(task.beginTime);
            $("#endTime").text(task.endTime);
            $("#money").text("￥"+task.money);
            $("#rate").text(task.rate);
            $("#policyTitle").val(task.policy_name);
        }
    });
}

function getYaisData(data) {
    var yData = data;
    var bb =[];
    for(var i = 0; i < yData.length; i++){

        var y;
        var m;
        var day;
        var aa = yData[i].split(" ");
        //var cc = aa[0].replace(new RegExp(/(-)/g),',');
        var dd = aa[0].split('-');
        for(var j = 0; j < dd.length;j++ ){
            y = Number(dd[0]);
            m = Number(dd[1]);
            day = Number(dd[2]);
        }
        var date = Date.UTC(y,m,day);
        //console.log(date);
        bb.push([date,Number(aa[1])]);
    }
     //console.log(bb);
    return bb;
}


function getPolicyResult(taskId,offset){
    $.ajax({
        type: "POST",
        url: "/getPolicyResult/",
        data: {
            taskId:taskId,
            offset:offset,
        },
        success:function(result){
            if(result=='not exist'){
                setTimeout( getPolicyResult(taskId,offset),1000);
            }
            else{
                finish_flag = result.finish_flag;
                time = time.concat(result.time);
                stock_price = stock_price.concat(result.stock_price);
                b = b.concat(getYaisData(result.b));
                c = c.concat(getYaisData(result.c));
                if(finish_flag != 1){
                    offset = offset + 1;
                    getPolicyResult(taskId,offset)
                }else{


                    var chart = new Highcharts.StockChart({
	    chart: {
	        renderTo: 'backtest_chats'//指向的div的id属性
	    },
	    exporting: {
            enabled: true //是否能导出趋势图图片
        },
		title : {
				text : 'Stock price'//图表标题
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
	    yAxis : {

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
		},{
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
	    },{

                            name: '基准收益',
                            data: c
                        },
                            ]

	});


                    $('#log_info').html(result.log);
                   /* $('#backtest_chats').highcharts({                   //图表展示容器，与div的id保持一致
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
                        categories: time  //指定x轴分组
                    },
                    yAxis: {
                        title: {
                            text: 'something'                  //指定y轴的标题
                        }
                    },
                    series: [{                                 //指定数据列
                        name: '策略收益',                          //数据列名
                        data: b                   //数据
                    }, {
                        name: '基准收益',
                        data: c
                    },
                    {
                        name: 'stock_price',
                        data: a
                    }]
                 });*/
                     $("#status").text(" 回测完成");
                }

            }

        }
    });

}