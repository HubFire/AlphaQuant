/**
 * Created by Jerome on 2016/5/15.
 */
//将特定的区域的编辑器区
var editor = ace.edit("policy_editor");
//设置编辑器的字体大小
document.getElementById('policy_editor').style.fontSize = $('#editor-fontsize').val() + 'px';
//设置渲染的语言模式为python
editor.getSession().setMode("ace/mode/python");
//设置编辑器的主题
editor.setTheme("ace/theme/" + $('#editor-theme').val());
//控制代码折叠
if ($('#editor-wropmode').val() == 'true') {
    editor.getSession().setUseWrapMode(true);  //支持代码折叠
}
else {
    editor.getSession().setUseWrapMode(false);  //支持代码折叠
}
//ace渲染完成后再进行显示
$("#policy_editor").css("display", 'block');

//代码提示

editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
});
var codeprompt = ace.require("ace/ext/language_tools");
codeprompt.addCompleter({
    getCompletions: function (editor, session, pos, prefix, callback) {
        callback(null, [
            {
                name: "initialize",  //名称
                value: "initialize", //值
                caption: "initialize",//展示在列表中的内容
                meta: "function",//展示类型
                type: "local",
                score: 1000 // 让initialize排在最上面
            }
        ]);
    }
});
//自定义补全规则
codeprompt.addCompleter({
    getCompletions: function (editor, session, pos, prefix, callback) {
        callback(null, [
            {
                name: "onBars",
                value: "onBars",
                caption: "onBars",
                meta: "function",
                type: "local",
                score: 1000 // 让onBars排在最上面
            }
        ]);
    }
});

// var log_info = ace.edit('policy_ace_log_error')
// document.getElementById('policy_ace_log_error').style.fontSize = $('#editor-fontsize').val() + 'px';
// log_info.setTheme("ace/theme/" + $('#editor-theme').val());
// // log_info.getSession().setMode("ace/mode/logs")
// log_info.setReadOnly(true);

//log_info.resize();


//使用highlight.js为文章中的代码添加语法高亮
//hljs.initHighlightingOnLoad();


$(function () {

    $("#font-size-12").click(function () {
        document.getElementById('policy_editor').style.fontSize = '12px';
        // document.getElementById('policy_ace_log_error').style.fontSize = '12px';
        saveEditor('12', null, null);
    });

    $("#font-size-14").click(function () {
        document.getElementById('policy_editor').style.fontSize = '14px';
        // document.getElementById('policy_ace_log_error').style.fontSize = '14px';
        saveEditor('14', null, null);
    });

    $("#font-size-16").click(function () {
        document.getElementById('policy_editor').style.fontSize = '16px';
        // document.getElementById('policy_ace_log_error').style.fontSize = '16px';
        saveEditor('16', null, null);
    });

    $("#theme-monokai").click(function () {
        editor.setTheme("ace/theme/monokai");
        // log_info.setTheme("ace/theme/monokai");
        saveEditor(null, 'monokai', null);
    });

    $("#theme-eclipse").click(function () {
        editor.setTheme("ace/theme/eclipse");
        // log_info.setTheme("ace/theme/eclipse");
        saveEditor(null, 'eclipse', null);
    });

    $("#theme-twilight").click(function () {
        editor.setTheme("ace/theme/twilight");
        // log_info.setTheme("ace/theme/twilight");
        saveEditor(null, 'twilight', null);
    });

    $("#wropmode-true").click(function () {
        editor.getSession().setUseWrapMode(true);  //支持代码折叠
        saveEditor(null, null, true);
    });

    $("#wropmode-false").click(function () {
        editor.getSession().setUseWrapMode(false);  //支持代码折叠
        saveEditor(null, null, false);
    });

    $("#saveBtn").click(function () {
        savePolicy();
    });


    $("#editor-search").click(function () {
        editor.commands.exec("find", editor);
    });

    $("#Keyboard").click(function () {
        editor.commands.exec("showKeyboardShortcuts", editor);
    });

    //编辑器快捷键
    editor.commands.addCommand({
        name: 'savePolicy',
        bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
        exec: function (editor) {
            savePolicy();
        },
        readOnly: false // 如果不需要使用只读模式，这里设置false
    });

    editor.commands.addCommand({
        name: "showKeyboardShortcuts",
        bindKey: {
            win: "Ctrl-Alt-h",
            mac: "Command-Alt-h"
        },
        exec: function (a) {
            ace.config.loadModule("ace/ext/keybinding_menu", function (b) {
                b.init(a);
                a.showKeyboardShortcuts()
            })
        }
    });
    editor.commands.addCommands([{
        name: "编译运行",
        bindKey: {
            win: "Ctrl-Alt-b",
            mac: "Command-Alt-b"
        },
        exec: function (a) {
            buildPolicy(0);
            $("#build-loading").removeClass('hidden');
            $("#policy-status").addClass("hidden");
            $("#log-loading").removeClass('hidden');
        },
        readOnly: false
    }]);

    editor.commands.addCommands([{
        name: "运行回测",  //快捷键的名字
        bindKey: {
            win: "Ctrl-Alt-L",  //绑定的快捷键，windows和osx系统
            mac: "Command-Alt-L"
        },
        exec: function (a) {
            buildPolicy(1);  //快捷键绑定的方法
        },
        readOnly: false   //不使用只读模式
    }]);

    /*$("#findNext").click(function () {
     editor.findNext();

     });

     $("#findPrev").click(function () {
     editor.findPrevious();
     });*/

    //监听编辑器的变化
    editor.getSession().on('change', function (e) {
        $("#saveBtn").val("保存");
        $("#saveBtn").removeAttr('disabled');
    });

    //设置定时器,每隔5秒自动保存
    setInterval(function () {
        autosave();
    }, 5000);

});

function autosave() {
    var saveVal = $("#saveBtn").val();
    if (saveVal == '保存') {
        savePolicy();
    }


}


function savePolicy() {
    var content = editor.getValue();
    var name = $("#policyTitle").val();
    var policy_id = $("#policy_id").val();
    $.ajax({
        type: "POST",
        url: "/savePolicy/",
        data: {
            content: content,
            policy_id: policy_id,
            name: name,
        },
        success: function (data) {
            $("#saveBtn").val("已保存");
            $("#saveBtn").attr("disabled", 'true')
        },
        error: function (jqXHR) {
            alert("发生错误：" + jqXHR.status);
        },
    });
}

function saveEditor(fontsize, theme, wropmode) {
    $.ajax({
        type: "POST",
        url: "/setEditorInfo/",
        data: {
            fontsize: fontsize,
            theme: theme,
            wropmode: wropmode,
        },
        success: function (data) {
        },
        error: function (jqXHR) {
            alert("发生错误：" + jqXHR.status);
        },
    });

}
