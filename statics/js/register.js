/**
 * Created by root on 7/27/16.
 */

var is_exist = false;
var is_confirmpwd = false;
var is_checkmail = 0;

function isExist() {
    var username = $("#username").val();
    $("#user_exist").empty();
    $.ajax({
        type: "POST",
        data: {username: username},
        url: "/user_exist/",
        cache: false,
        success:function (rst) {
            if(rst == true){
                $("#user_exist").append('<div class="alert alert-warning" data-dismiss="alert">用户名已存在</div>');
                 is_exist = false;
            }else{
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
        $("#confirmpwd").append('<div class="alert alert-warning" data-dismiss="alert">两次密码不相同</div>');
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
            $("#checkemail").append('<div class="alert alert-warning" data-dismiss="alert">邮箱不合法</div>');
            is_checkmail = 1;
        }else{
            $.ajax({
                type: "POST",
                data: {email: email},
                url: "/email_exist/",
                cache: false,
                //dataType: "html",
                success:function (rst) {
                    if(rst == true){
                         $("#checkemail").append('<div class="alert alert-warning" data-dismiss="alert">邮箱已存在</div>');
                    }else{
                         is_checkmail = 3;
                    }
                 },
                 error: function (jqXHR) {
                    alert("发生错误：" + jqXHR.status);
                 }
            });
        }
    }else{
        $("#checkemail").append('<div class="alert alert-warning" data-dismiss="alert">邮箱不能为空</div>');
        is_checkmail = 2;
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
    console.log(is_exist, is_confirmpwd, is_checkmail);
    if(is_exist == false){
         $("#user_exist").append('<div class="alert alert-warning" data-dismiss="alert">用户名已存在</div>')
    }
    if(is_confirmpwd == false){
         $("#confirmpwd").append('<div class="alert alert-warning" data-dismiss="alert">两次密码不相同</div>');
    }
    if(is_checkmail == 1){
         $("#checkemail").append('<div class="alert alert-warning" data-dismiss="alert">邮箱不合法</div>');
    }else if(is_checkmail == 2){
         $("#checkemail").append('<div class="alert alert-warning" data-dismiss="alert">邮箱不能为空</div>');
    }
    if(is_exist & is_confirmpwd & is_checkmail==3 ){
        $.ajax({
            type: "POST",
            data: {username: username, password:password, email:email, nickname:nickname},
            url: "/regist/",
            //catch: false,
            //dataType: "html",
            success:function (rst) {
                if(rst == true){
                    $("#regist_result").append('<div class="alert alert-success" data-dismiss="alert">请登录注册邮箱，点击链接进行用户激活</div>');
                }
            },
            error: function (jqXHR) {
                alert("发生错误：" + jqXHR.status);
            }
        });
    }
}

