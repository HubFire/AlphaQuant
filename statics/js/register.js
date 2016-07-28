/**
 * Created by root on 7/27/16.
 */
         function isExist() {
             var username = $("#username").val();
             $("#user_exit").empty();
             $.ajax({
                 type: "POST",
                 data: {username: username},
                 url: "/user_exist/",
                 catch: false,
                 //dataType: "html",
                 success:function (rst) {
                     if(rst == true){
                         $("#user_exit").append('<div class="alert alert-warning" data-dismiss="alert">username can not use</div>');
                     }else{
                          $("#user_exit").append('<div class="alert alert-success" data-dismiss="alert">username can use</div>');
                     }

                 },
                 error: function (jqXHR) {
                    alert("发生错误：" + jqXHR.status);
                 },
             });
         }
