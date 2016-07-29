/**
 * Created by root on 7/27/16.
 */

var is_exist = false;
var is_confirmpwd = false;
var is_checkmail = false;

function isExist() {
    var username = $("#username").val();
    $("#user_exist").empty();
    $.ajax({
        type: "POST",
        data: {username: username},
        url: "/user_exist/",
        catch: false,
        //dataType: "html",
        success:function (rst) {
            if(rst == true){
                $("#user_exist").append('<div class="alert alert-warning" data-dismiss="alert">username can not use</div>');
            }else{
                $("#user_exist").append('<div class="alert alert-success" data-dismiss="alert">username can use</div>');
                is_exist = true;
            }
        },
        error: function (jqXHR) {
            alert("发生错误：" + jqXHR.status);
        }
    });
}

function confirmpwd() {
    $("#confirmpwd").empty();
    var password = $("#password").val();
    var re_password = $("#re_password").val();
    if(password != re_password) {
        $("#confirmpwd").append('<div class="alert alert-warning" data-dismiss="alert">two password is different</div>');
    }else{
        is_confirmpwd = true;
    }
}

function checkemail() {
    $("#checkemail").empty();
    var email = $("#email").val();
    if(email != ""){
        var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        if(!reg.test(email)){
            $("#checkemail").append('<div class="alert alert-warning" data-dismiss="alert">email is not valid</div>');
        }else{
            is_checkmail = true;
        }
    }else{
        $("#checkemail").append('<div class="alert alert-warning" data-dismiss="alert">email is null</div>');
    }
}

function regist() {
    var username = $("#username").val();
    var password = $("#password").val();
    var email = $("#email").val();
    var nickname = $("#nickname").val();
    $("#user_exist").empty();
    $("#confirmpwd").empty();
    $("#checkemail").empty();
    isExist();
    confirmpwd();
    checkemail();
    console.log(is_exist, is_confirmpwd, is_checkmail);
    if(is_exist & is_confirmpwd & is_checkmail ){
        $.ajax({
            type: "POST",
            data: {username: username, password:password, email:email, nickname:nickname},
            url: "/regist/",
            //catch: false,
            //dataType: "html",
            success:function (rst) {
                if(rst == true){
                    $("#regist_result").append('<div class="alert alert-success" data-dismiss="alert">please login your email to complete regist</div>');
                }
            },
            error: function (jqXHR) {
                alert("发生错误：" + jqXHR.status);
            }
        });
    }
}

