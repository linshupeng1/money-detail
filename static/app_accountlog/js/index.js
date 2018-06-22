/*
* 跨域配置
* url = https://3g.168p2p.com
* proxyurl = '/index.php/mainctl/get_account_log?sessid='+sessid+'&id='+id+'&type='+ type +'&size='+size+'&month='+month;
* // params 参数
* sessid: 用户id，必填
* size: 每页条数
* type: new   获取最新,  next   获取下一页
* month: 月份记录 2018-1
* style: 交易类型  "all": "全部","tender": "投资","recharge": "充值","cash": "提现","borrow": "借款","cashback": "返现","other": "其他"
*/

$(function () {
    var params = {
        sessid: 'af6617e573c4e92f73b4883a3780beb2',
        size: 20,
        type: 'new',
        month: "",
        style: "all",
    }
    params.sessid=window.SESSID;
    var styleArr = ['all', 'tender', 'recharge', 'cash', 'borrow', 'cashback', 'other'];
    //第一次渲染
    firstRender(params);
    typeFilter(params, styleArr);
    dateSelect(params);
});

//首次数据渲染
function firstRender(params) {
    var detailHtml = "";
    var detailData = "";
    var listLen = "";
    var upUrl = '/index.php/mainctl/get_account_log?sessid=' + params.sessid + '&type=' + params.type + '&style=' + params.style + '&size=' + params.size + '&month=' + params.month;
    console.log('first');
    $.ajax({
        type: 'post',
        url: upUrl,
        dataType: 'json',
        success: function (data) {
            // 对象转数组
            detailData = objToArray(data.data);
            console.log(detailData);
            //没有数据
            if (detailData.length === 0) {
                $('.loading-hook').text('查看更多');
                $('.detail-content').html("");
            } else {
                $('.loading-hook').text('查看更多');
                listLen = detailData.length;
                // 获取下一页id
                window.lastId = detailData[listLen - 1];
                // 获取最后一条数据时间，用于跟下一页数据的时间比较
                window.time = detailData[listLen - 3].time;
                for (var i = 0; i < detailData.length - 2; i++) {
                    detailHtml += '<section class="detail-panel">'
                        + '<div class="detail-header">'
                        + '<div class="header-date">' + detailData[i].time + '</div>'
                        + '<div class="header-info">'
                        + '<span class="money-out">' + '支出 ¥' + detailData[i].expend + '</span>'
                        + '<span class="money-in">' + '收入 ¥' + detailData[i].income + '</span>'
                        + '</div>'
                        + '</div>'
                        + '<div class="detail-list">';
                    listLen = detailData[i].list.length;
                    for (var j = 0; j < listLen; j++) {
                        detailHtml += '<div class="detail-line">'
                            + '<div class="line-left">'
                            + '<div class="line-time">' + detailData[i].list[j].dtime;
                        if (detailData[i].list[j].typename) {
                            detailHtml += '<span class="line-typename">' + detailData[i].list[j].typename + '</span>'
                        }
                        detailHtml += '</div>'
                            + '<div class="line-info">' + detailData[i].list[j].remark.replace(/<[^>]+>/g, "") + '</div>'
                            + '</div>'
                            + '<div class="line-right">' + detailData[i].list[j].account + '</div>'
                            + '</div>';
                    }
                    detailHtml += '</div>'
                        + '</section>';
                }
                $('.detail-content').html(detailHtml);
                isbool1=true;
                isbool2=true;
                // 首次Dom加载完毕，执行加载更多
                initScroll(params);
            }
        },
        error: function (xhr, type) {
            alert('Ajax error!');
            console.log(xhr);
        }
    });
}

//加载更多
function moreRender(params) {
    var detailHtml = "";
    var detailData = "";
    var listLen = "";
    console.log('more');
    var downUrl = '/index.php/mainctl/get_account_log?sessid=' + params.sessid + '&type=' + 'next' + '&size=' + params.size + '&style=' + params.style + '&id=' + window.lastId + '&month=' + params.month;
    $.ajax({
        type: 'post',
        url: downUrl,
        dataType: 'json',
        success: function (data) {
            detailData = objToArray(data.data);
            console.log(detailData);
            if (detailData.length === 0) {
                $('.loading-hook').text('暂无数据');
            } else {
                listLen = detailData.length;
                //每次分页完成，获取最新下一页id
                window.lastId = detailData[listLen - 1];
                //console.log(detailData[listLen-1]);
                for (var i = 0; i < detailData.length - 2; i++) {
                    //console.log(window.time);
                    // 渲染，比较当前页时间是否等于上一页时间
                    if (window.time === detailData[i].time) {
                        //console.log('same');
                        listLen = detailData[i].list.length;
                        for (var j = 0; j < listLen; j++) {
                            detailHtml += '<div class="detail-line">'
                                + '<div class="line-left">'
                                + '<div class="line-time">' + detailData[i].list[j].dtime
                            if (detailData[i].list[j].typename) {
                                detailHtml += '<span class="line-typename">' + detailData[i].list[j].typename + '</span>'
                            }
                            detailHtml += '</div>'
                                + '<div class="line-info">' + detailData[i].list[j].remark.replace(/<[^>]+>/g, "") + '</div>'
                                + '</div>'
                                + '<div class="line-right">' + detailData[i].list[j].account + '</div>'
                                + '</div>';
                        }
                        console.log('0');
                        //相同，内容插入
                        $('.detail-content .detail-panel:last .detail-list').append(detailHtml);
                        isbool2=true;
                    } else {
                        //console.log('diff');
                        // 不相同，重新赋值比较时间
                        window.time = detailData[i].time;
                        // 清空detailHtml
                        detailHtml = "";
                        detailHtml += '<section class="detail-panel">'
                            + '<div class="detail-header">'
                            + '<div class="header-date">' + detailData[i].time + '</div>'
                            + '<div class="header-info">'
                            + '<span class="money-out">' + '支出 ¥' + detailData[i].expend + '</span>'
                            + '<span class="money-in">' + '收入 ¥' + detailData[i].income + '</span>'
                            + '</div>'
                            + '</div>'
                            + '<div class="detail-list">';
                        listLen = detailData[i].list.length;
                        for (var j = 0; j < listLen; j++) {
                            detailHtml += '<div class="detail-line">'
                                + '<div class="line-left">'
                                + '<div class="line-time">' + detailData[i].list[j].dtime
                                + '<span class="line-typename">' + detailData[i].list[j].typename + '</span>'
                                + '</div>'
                                + '<div class="line-info">' + detailData[i].list[j].remark.replace(/<[^>]+>/g, "") + '</div>'
                                + '</div>'
                                + '<div class="line-right">' + detailData[i].list[j].account + '</div>'
                                + '</div>';
                        }
                        detailHtml += '</div>'
                            + '</section>';
                        console.log('1');
                        // 接到后面
                        $('.detail-content .detail-panel:last').after(detailHtml);
                        isbool2=true;
                    }
                }
            }
        },
        error: function (xhr, type) {
            alert('Ajax error!');
            console.log(xhr);
        }
    });
}


// 对象转数组
function objToArray(obj) {
    var arr = [];
    for (var i in obj) {
        arr.push(obj[i]);
    }
    return arr;
}

//交易类型筛选
function typeFilter(params, styleArr) {
    $('.trade-style').on('click', '.trade-style-list li', function () {
        $(this).addClass('active').siblings().removeClass('active');
        var index = $(this).index();
        $('.detail-content').html('');
        $('.cover').hide();
        $('.trade-style').hide();
        params.style = styleArr[index];
        firstRender(params);
    }).on('click', '.btn-cancel', function () {
        $('.trade-style').hide();
        $('.cover').hide();
    })
}

//显示交易类型筛选框
function filterBoxShow(){
    $('.trade-style').show();
    $('.cover').show();
    //关闭日期筛选框
    $('.lcalendar_cancel').trigger('click');
}

//日期筛选
function dateSelect(params) {
    var calendar = new datePicker();
    calendar.init({
        'trigger': '#dateSelect', /*按钮选择器，用于触发弹出插件*/
        'type': 'ym', /*模式：date日期；datetime日期时间；time时间；ym年月；*/
        'minDate': '1980-1-1', /*最小日期*/
        'maxDate': '2050-12-31', /*最大日期*/
        'onSubmit': function () {/*确认时触发事件*/
            var theSelectData = calendar.value;
            params.month = theSelectData;
            firstRender(params);
        },
        'onClose': function () {/*取消时触发事件*/
        }
    });
}

// 上拉加载、下拉刷新
var listWrapper = document.querySelector('.m-money-detail'),
    alert = document.querySelector('.alert-hook'),
    topTip = document.querySelector('.refresh-hook'),
    bottomTip = document.querySelector('.loading-hook');
// 下拉刷新和上拉加载只调用一次接口
var isbool1=true;
var isbool2=true;
function initScroll(params) {
    var listH = $('.detail-content').height();
    var winH = $(window).height();
    if(listH>winH) {
        // 设置外容器高度
        $('.m-money-detail').height(winH);
    }else {
        $('.scroll-content').height(winH);
        $('.m-money-detail').height(winH-1);
    }
    var scroll = new window.BScroll(listWrapper, {
        probeType: 1,
        bounceTime: 200,
    });
    // 滑动中
    scroll.on('scroll', function (position) {
        if(position.y > 30) {
            topTip.innerText = '释放立即刷新';
        }
    });

    /*
     * @ touchend:滑动结束的状态
     * @ maxScrollY:屏幕最大滚动高度
    */

    // 滑动结束
    scroll.on('scroll', function (position) {
        if (position.y > 30&&isbool1==true) {
            isbool1=false;
            setTimeout(function () {
                /*
                 * 这里发送ajax刷新数据
                 * 刷新后,后台只返回第1页的数据,无论用户是否已经上拉加载了更多
                */
                firstRender(params);
                // 恢复文本值
                topTip.innerText = '下拉刷新';
                // 刷新列表后,重新计算滚动区域高度
                scroll.refresh();
            }, 1000);
        }else if(position.y < (this.maxScrollY - 30) && isbool2==true) {
            isbool2=false;
            bottomTip.innerText = '加载中...';
            setTimeout(function () {
                // 恢复文本值
                bottomTip.innerText = '查看更多';
                // 向列表添加数据
                moreRender(params);
                // 加载更多后,重新计算滚动区域高度
                scroll.refresh();
            }, 1000);
        }
    });
}

