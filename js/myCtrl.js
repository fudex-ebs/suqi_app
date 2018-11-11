var domain = "http://suqi.biz/dynamic-api/";
var imgPath = 'http://suqi.biz/uploads/';   
var siteLnk = "http://suqi.biz/ar/";

//var domain = "http://localhost/suqi_web/dynamic-api/";
//var imgPath = "http://localhost/suqi_web/uploads/";   
//var siteLnk = "http://localhost/suqi_web/ar/";

var app = angular.module("myApp", ["ngRoute","ngAnimate"]);
app.run(function ($rootScope,$http,$route){  
     
    //---------- When offline-------------
    document.addEventListener("offline", function(){ alert("من فضلك تأكد من اتصالك بالأنترنت") }, false);
    
    $rootScope.go_back = function() { 
        window.history.back();
    };
    
    $rootScope.closeMe = function (){
        $(".c-menu__close").trigger('click');
    };
});

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);
   
app.service('$Constructor', function($http,$rootScope,$route) {	
	$rootScope.main_function = function(){  
            $rootScope.user_id = window.localStorage.getItem("user_id");     
            $rootScope.title = "سوقى";
            $rootScope.imgPath = imgPath;
            
            var url =  domain+"api/select/users?id="+$rootScope.user_id;     
            $http.get(url).then(function(response) {               
               $rootScope.loged_user = response.data.users[0];                 
               
            }); 

            if($rootScope.user_id != null){
                var url2 =  domain+"api/select/users_messages?user_id="+$rootScope.user_id+"&read=0";     
                $http.get(url2).then(function(response) {               
                   $rootScope.messages = response.data.users_messages;                   
                }); 
            }
            $rootScope.$on("$routeChangeSuccess", function(currentRoute, previousRoute){
                    //Change page title, based on Route information
                    $rootScope.title = $route.current.title;
              });
 
	};	 
            
	this.load = function(){
		$rootScope.main_function();
	}
});

app.controller('categoriesCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();  
    
    var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
    $http.get(url).then(function(response) {
        $scope.categories = response.data.departements;               
    });  
    
}]);


app.controller('categoryCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();  
    
    var id = $routeParams.id;
    var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
    $http.get(url).then(function(response) {
        $scope.categories = response.data.departements;               
    });  
    
    var url2 =  domain+"api/join/advertisement::users::region/users.id:advertisement.user_id::region.id:advertisement.region?advertisement_status=1&advertisement_dep_id="+id+"&order_by=advertisement_id:desc";        
    $http.get(url2).then(function(response) {             
       $scope.items = response.data.slice(0,100);          
    });
    
    $scope.shareLink = function(title,linkID){
        var link = siteLnk+'advertisement/details/'+linkID;
        window.plugins.socialsharing.share(title, null, null, link);
    }
    $scope.shareLinkImg = function(title,linkID,imgName){
        var link = siteLnk+'advertisement/details/'+linkID;
        var img = imgPath+imgName;        
        window.plugins.socialsharing.share(title, null, img, link);
    }
    
    $scope.addToFav = function (id){
        var url2 =  domain+"api/select/adv_favourite?adv_id="+id+"&user_id="+$rootScope.user_id;        
        $http.get(url2).then(function(response) {                        
           if(response.data.adv_favourite.length < 1){               
               var data = {
                adv_id: id ,
                user_id: $rootScope.user_id,            
               };    		
             $http({
                     method  : 'POST',
                     url     : domain+'api/insert/adv_favourite',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {                    
                  $.growl.notice({ title: "نجاح ", message: "لقد تمت الاضافة لمفضلتك بنجاح" });                                                                      
             });
             
           }else $.growl.warning({ title: "تنبيه ", message: "هذا الاعلان بالفعل مضاف لمفضلتك" }); 
               
        });        
    }
    
}]);

app.controller('groupsCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();  
    
    
    var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
    $http.get(url).then(function(response) {
        $scope.categories = response.data.departements;               
    });  
    
    var url2 = domain+'api/select/region?show=1&lang_code=ar&order_by=region_name:asc';        
    $http.get(url2).then(function(response) {
        $scope.regions = response.data.region;           
    });
    
    $scope.getCities = function() {            
        var region_id = $scope.region;
        
        var url3 = domain+'api/select/city?region_id='+region_id+'&lang_code=ar&order_by=name:asc';        
        $http.get(url3).then(function(response) {
            $scope.cities = response.data.city;               
        }); 
    }
     
    $scope.registerGroup = function (){
        var mobile = $scope.mobile;
        var dep_id = $scope.dep_id;
        var region = $scope.region;
        var city = $scope.city;        
        
        if(mobile != null){
            var url3 =  domain+"api/select/register_groups?mobile="+mobile+"&region_id="+region;        
            $http.get(url3).then(function(response) {                        
               if(response.data.register_groups.length < 1){               
                   var data = {
                    dep_id: dep_id ,
                    mobile : mobile,
                    region_id : region,
                    city_id : city,
                    user_id: $rootScope.user_id,    
                    created_at:$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                   };    		
                 $http({
                         method  : 'POST',
                         url     : domain+'api/insert/register_groups',
                         data    : data,
                         dataType: 'json',
                         jsonp: 'jsoncallback',
                   headers: {
                         'Content-Type': 'application/x-www-form-urlencoded'
                    }
                  }).then(function(data) { 
                      $("#mobile").val();
                      $.growl.notice({ title: "نجاح ", message: "شكرا لك, تم الاشتراك فى خدمة القروب بنجاح" });                                                                      
                 });

               }else $.growl.warning({ title: "تنبيه ", message: "هذا الرقم مسجل بالفعل فى قائمة القروبات" }); 

            });        
    }
    }
    
     $scope.deleteRegister = function (){ 
         var mobile = $scope.mobile;
         var region = $scope.region;
         
          var url3 =  domain+"api/select/register_groups?mobile="+mobile+"&region_id="+region;        
          $http.get(url3).then(function(response) {                        
            if(response.data.register_groups.length > 0){   
                var data = {            
                id:data.register_groups.id
              };                   	
             $http({
                     method  : 'POST',
                     url     : domain+'api/delete/register_groups',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {                   
                  $scope.items.splice(index,1);
                  $.growl.notice({ title: "نجاح ", message: "لقد تم حذفك من قائمة القروبات بنجاح  " });                                                            
             });
             
            }else $.growl.warning({ title: "تنبيه ", message: "هذا الرقم غير مسجل فى قروباتنا" }); 
         });
              
            
       }
    
    
}]);

app.controller('messagesCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();  
    
    var url =  domain+"api/join/users_messages::users/users.id:users_messages.sender_id?users_messages_user_id="+$rootScope.user_id+"&order_by=users_messages_id:desc";           
    $http.get(url).then(function(response) {               
       $scope.inboxs = response.data;                   
    }); 
             
    $scope.deleteMsg = function (id,index){          
        var data = {            
            delete: 1,         
            };    
          data.where = {
            id : id,
          };
         $http({
                 method  : 'POST',
                 url     : domain+'api/update/users_messages',
                 data    : data,
                 dataType: 'json',
                 jsonp: 'jsoncallback',
           headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then(function(data) {                   
                  $scope.inboxs.splice(index,1);
                  $.growl.notice({ title: "نجاح ", message: "لقد تم حذف الرسالة بنجاح" });                                                            
        });
                      
       }
       
}]);

app.controller('messagesSentCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();  
    
    var url =  domain+"api/join/users_messages::users/users.id:users_messages.sender_id?users_messages_sender_id="+$rootScope.user_id+"&users_messages_delete=0&order_by=users_messages_id:desc";           
    $http.get(url).then(function(response) {               
       $scope.items = response.data;                   
    }); 
             
    $scope.deleteMsg = function (id,index){   
        var data = {            
            delete: 1,         
            };    
          data.where = {
            id : id,
          };
         $http({
                 method  : 'POST',
                 url     : domain+'api/update/users_messages',
                 data    : data,
                 dataType: 'json',
                 jsonp: 'jsoncallback',
           headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then(function(data) {                   
                  $scope.items.splice(index,1);
                  $.growl.notice({ title: "نجاح ", message: "لقد تم حذف الرسالة بنجاح" });                                                            
        });
             
              
       }
       
}]);

app.controller('messagesDeletedCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();  
    
    var url =  domain+"api/join/users_messages::users/users.id:users_messages.sender_id?users_messages_sender_id="+$rootScope.user_id+"&users_messages_delete=1&order_by=users_messages_id:desc";           
    $http.get(url).then(function(response) {               
       $scope.items = response.data;                   
    }); 
             
        
}]);


app.controller('messageCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();  
    
    var sender_id = $routeParams.sender_id;
    var adv_id = $routeParams.adv_id;
    var id = $routeParams.id;
     
    var url =  domain+"api/join/users_messages::users::advertisement/users.id:users_messages.sender_id::advertisement.id:users_messages.adv_id?users_messages_sender_id="+sender_id+"&users_messages_adv_id="+adv_id+"&order_by=users_messages_id:desc";           
    $http.get(url).then(function(response) {               
       $scope.items = response.data;       
    }); 
   
    var url2 = domain+'api/select/advertisement?id='+adv_id;        
    $http.get(url2).then(function(response) {
        $scope.adv = response.data.advertisement[0];
    });  
    
    var data = {            
        read: 1,         
        };    
      data.where = {
        id : id,
      };
     $http({
             method  : 'POST',
             url     : domain+'api/update/users_messages',
             data    : data,
             dataType: 'json',
             jsonp: 'jsoncallback',
       headers: {
             'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
              
    $scope.send = function(user_id){
        var data = {
            user_id: user_id ,
            sender_id: $rootScope.user_id,            
            adv_id : id,
            title : '',
            message : $scope.message,
            read : 0,
            msg_type : null ,
            delete : 0 ,
            created_at:$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
           };    		
         $http({
                 method  : 'POST',
                 url     : domain+'api/insert/users_messages',
                 data    : data,
                 dataType: 'json',
                 jsonp: 'jsoncallback',
           headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then(function(data) {                    
              $.growl.notice({ title: "نجاح ", message: "لقد تم ارسال رسالتك  بنجاح" });                                                                      
         });
    }
 
        
}]);

app.controller('fourmsCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();  
    
    var id = $routeParams.id;
    var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
    $http.get(url).then(function(response) {
        $scope.categories = response.data.departements;               
    });  
    
    var url2 =  domain+"api/join/forum::users::departements/users.id:forum.user_id::departements.id:forum.dep_id?forum_status=1&order_by=forum_id:desc";       
    $http.get(url2).then(function(response) {             
       $scope.items = response.data.slice(0,100);          
    });
    
    $scope.shareLink = function(title,linkID){
        var link = siteLnk+'advertisement/details/'+linkID;
        window.plugins.socialsharing.share(title, null, null, link);
    }
    $scope.shareLinkImg = function(title,linkID,imgName){
        var link = siteLnk+'advertisement/details/'+linkID;
        var img = imgPath+imgName;        
        window.plugins.socialsharing.share(title, null, img, link);
    }
     
}]);

app.controller('fourmsByCategoryCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();  
    
    var id = $routeParams.id;
    var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
    $http.get(url).then(function(response) {
        $scope.categories = response.data.departements;               
    });  
    
    var url2 =  domain+"api/join/forum::users::departements/users.id:forum.user_id::departements.id:forum.dep_id?forum_status=1&departements_id="+id+"&order_by=forum_id:desc";       
    $http.get(url2).then(function(response) {             
       $scope.items = response.data.slice(0,100);          
    });
    
    $scope.shareLink = function(title,linkID){
        var link = siteLnk+'advertisement/details/'+linkID;
        window.plugins.socialsharing.share(title, null, null, link);
    }
    $scope.shareLinkImg = function(title,linkID,imgName){
        var link = siteLnk+'advertisement/details/'+linkID;
        var img = imgPath+imgName;        
        window.plugins.socialsharing.share(title, null, img, link);
    }
     
}]);


app.controller('homeCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){    
        $Constructor.load();
        
    var url =  domain+"api/join/advertisement::users::region/users.id:advertisement.user_id::region.id:advertisement.region?advertisement_status=1&order_by=advertisement_id:desc";        
    $http.get(url).then(function(response) {             
       $scope.items = response.data.slice(0,10);          
    });
    
    var url2 = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
    $http.get(url2).then(function(response) {
        $scope.categories = response.data.departements;               
    }); 
     
//     var url =  domain+"api/join/advertisement::users::region/users.id:advertisement.user_id::region.id:advertisement.region?advertisement_status=1&order_by=advertisement_id:desc";        
//     $http.get(url).then(function(response) {
//
//        angular.forEach(response.data, function(val,key){
//        //console.log(response.data[key]);
//        $http.get(domain + "api/select/adv_favourite?adv_id="+response.data[key].advertisement_id+"&user_id="+response.data[key].advertisement_user_id).then(function(response2) {
//        response.data[key].fav_count = response2.data.adv_favourite.length;
//        console.log(response2.data.adv_favourite);
//        });
//        });
//
//          console.log(response);
//
//             $scope.items = response.data.slice(0,10);          
//          });
  
  
    // ------------- call via whatsapp -------------
    $scope.getWhatsapp = function(mobileNo,compName){
        var myMsg = " مرحبا " + compName;         
        window.plugins.socialsharing.shareViaWhatsAppToPhone(mobileNo, myMsg, null /* img */, null /* url */, 
        function() {console.log('share ok')})
    }
    
    $scope.shareLink = function(title,linkID){
        var link = siteLnk+'advertisement/details/'+linkID;
        window.plugins.socialsharing.share(title, null, null, link);
    }
    $scope.shareLinkImg = function(title,linkID,imgName){
        var link = siteLnk+'advertisement/details/'+linkID;
        var img = imgPath+imgName;        
        window.plugins.socialsharing.share(title, null, img, link);
    }
    $scope.addToFav = function (id){
        var url2 =  domain+"api/select/adv_favourite?adv_id="+id+"&user_id="+$rootScope.user_id;        
        $http.get(url2).then(function(response) {  
            if($rootScope.user_id != null){
                console.log(response.data.adv_favourite.length);
                
           if(response.data.adv_favourite.length < 1){               
               var data = {
                adv_id: id ,
                user_id: $rootScope.user_id,            
               };    		
             $http({
                     method  : 'POST',
                     url     : domain+'api/insert/adv_favourite',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {                    
                  $.growl.notice({ title: "نجاح ", message: "لقد تمت الاضافة لمفضلتك بنجاح" });                                                                      
             });
             
           }else $.growl.warning({ title: "تنبيه ", message: "هذا الاعلان بالفعل مضاف لمفضلتك" }); 
               
        }else $.growl.warning({ title: "تنبيه ", message: "من فضلك قم بتسجيل الدخول اولا" }); 
        });        
    }
   
    $scope.search = function (searchTxt,dep_id){
       window.localStorage.setItem("searchTxt",searchTxt);
       window.localStorage.setItem("dep_id",dep_id);
       window.location.href = "#!search";
    }
}]);

app.controller('searchCtr', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor','$window' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor,$window){    
        $Constructor.load();
    
    var url2 = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
    $http.get(url2).then(function(response) {
        $scope.categories = response.data.departements;               
    });
    
    var txt = window.localStorage.getItem("searchTxt");
    var dep = window.localStorage.getItem("dep_id");
    
    var url =  domain+"api/join/advertisement::users::region/users.id:advertisement.user_id::region.id:advertisement.region?advertisement_status=1&like=advertisement.title:"+txt+"&advertisement_dep_id="+dep;        
    $http.get(url).then(function(response) {             
       $scope.items = response.data.slice(0,10);              
    });
        
     $scope.search = function (searchTxt,dep_id){
        var url =  domain+"api/join/advertisement::users::region/users.id:advertisement.user_id::region.id:advertisement.region?advertisement_status=1&like=advertisement.title:"+searchTxt+"&advertisement_dep_id="+dep_id;        
        $http.get(url).then(function(response) {             
           $scope.items = response.data.slice(0,10);              
        });
    }
}]);

app.controller('supervisorsCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor','$window' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor,$window){    
        $Constructor.load();
        
    var id = $routeParams.id;
    var url =  domain+"api/join/supervisors::departements/departements.id:supervisors.dep_id";        
    $http.get(url).then(function(response) {             
       $scope.items = response.data;       
    });
    
    $scope.send = function (id){        
        var data = {
          	supervisor_id: id ,
          	sender_id: $rootScope.user_id,                            
                title : $scope.title_msg,
                message : $scope.message,
        };    		
      $http({
              method  : 'POST',
              url     : domain+'api/insert/supervisros_messages',
              data    : data,
              dataType: 'json',
              jsonp: 'jsoncallback',
        headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
         }
       }).then(function(data) {                    
           $.growl.notice({ title: "نجاح ", message: "لقد تم ارسال رسالتك بنجاح" });                                                                      
      });

    }
    
    
}]);

app.controller('adDetailCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor','$window' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor,$window){    
        $Constructor.load();
        
    var id = $routeParams.id;
    var url =  domain+"api/join/advertisement::users::region/users.id:advertisement.user_id::region.id:advertisement.region?advertisement_id="+id;        
    $http.get(url).then(function(response) {             
       $scope.item = response.data[0];                 
    });
    
    var url2 = domain+'api/select/adv_images?images_adv_id='+id;        
    $http.get(url2).then(function(response) {
        $scope.imgs = response.data.adv_images;        
    });
    
    var url3 = domain+'api/join/adv_comments::users/users.id:adv_comments.comment_user_id?adv_comments_comment_adv_id='+id;        
    $http.get(url3).then(function(response) {
        $scope.comments = response.data;                   
    });
    
    $scope.shareLink = function(title,linkID){
        var link = siteLnk+'advertisement/details/'+linkID;
        window.plugins.socialsharing.share(title, null, null, link);
    }
    $scope.shareLinkImg = function(title,linkID,imgName){
        var link = siteLnk+'advertisement/details/'+linkID;
        var img = imgPath+imgName;        
        window.plugins.socialsharing.share(title, null, img, link);
    }
        
    $scope.sendComment = function(){
        var data = {
            comment_adv_id: id ,
            comment_user_id: $rootScope.user_id,
            comment: $scope.comment,                
           };    		
         $http({
                 method  : 'POST',
                 url     : domain+'api/insert/adv_comments',
                 data    : data,
                 dataType: 'json',
                 jsonp: 'jsoncallback',
           headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then(function(data) {                    
              $.growl.notice({ title: "نجاح ", message: "لقد تم ارسال تعليقك بنجاح" });                                                        
              $window.location.reload();
         });
    }
    
    $scope.addToFav = function (id){
        var url2 =  domain+"api/select/adv_favourite?adv_id="+id+"&user_id="+$rootScope.user_id;        
        $http.get(url2).then(function(response) {                        
           if(response.data.adv_favourite.length < 1){               
               var data = {
                adv_id: id ,
                user_id: $rootScope.user_id,            
               };    		
             $http({
                     method  : 'POST',
                     url     : domain+'api/insert/adv_favourite',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {                    
                  $.growl.notice({ title: "نجاح ", message: "لقد تمت الاضافة لمفضلتك بنجاح" });                                                                      
             });
             
           }else $.growl.warning({ title: "تنبيه ", message: "هذا الاعلان بالفعل مضاف لمفضلتك" }); 
               
        });        
    }
         
     
    $scope.send = function(user_id){
        var data = {
            user_id: user_id ,
            sender_id: $rootScope.user_id,
            adv_id: $scope.comment,  
            adv_id : id,
            title : $scope.title_msg,
            message : $scope.message,
            read : 0,
            msg_type : null ,
            delete : 0 ,
            created_at:$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
           };    		
         $http({
                 method  : 'POST',
                 url     : domain+'api/insert/users_messages',
                 data    : data,
                 dataType: 'json',
                 jsonp: 'jsoncallback',
           headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then(function(data) {                    
              $.growl.notice({ title: "نجاح ", message: "لقد تم ارسال رسالتك  بنجاح" });                                                                      
         });
    }
 
 
    $scope.sendReport = function(dep_id){
        var data = {
            dep_id:dep_id,
            adv_id: id ,            
            converse: $scope.converse,              
            cause : $scope.cause,            
            created_at:$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss'),
           };    		
         $http({
                 method  : 'POST',
                 url     : domain+'api/insert/user_reports',
                 data    : data,
                 dataType: 'json',
                 jsonp: 'jsoncallback',
           headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then(function(data) {                    
              $.growl.notice({ title: "نجاح ", message: "تم اﻹبلاغ عن الإعلان للقسم المختص" });                                                                      
         });
    }
    
}]);

app.controller('fourmCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor','$window' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor,$window){    
        $Constructor.load();
        
    var id = $routeParams.id;
    var url =  domain+"api/join/forum::users::departements/users.id:forum.user_id::departements.id:forum.dep_id?forum_status=1&forum_id="+id;    
    $http.get(url).then(function(response) {             
       $scope.item = response.data[0];     
    });
   
    var url3 = domain+'api/join/forum_comments::users/users.id:forum_comments.comment_user_id?forum_comments.comment_forum_id='+id;        
    $http.get(url3).then(function(response) {
        $scope.comments = response.data;                   
    });
    
    $scope.shareLink = function(title,linkID){
        var link = siteLnk+'forum/details/'+linkID;
        window.plugins.socialsharing.share(title, null, null, link);
    }
    $scope.shareLinkImg = function(title,linkID,imgName){
        var link = siteLnk+'forum/details/'+linkID;
        var img = imgPath+imgName;        
        window.plugins.socialsharing.share(title, null, img, link);
    }
        
    $scope.sendComment = function(){
        var data = {
            comment_forum_id: id ,
            comment_user_id : $rootScope.user_id,
            comment: $scope.comment,  
            title : '',
           };    		
         $http({
                 method  : 'POST',
                 url     : domain+'api/insert/forum_comments',
                 data    : data,
                 dataType: 'json',
                 jsonp: 'jsoncallback',
           headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
            }
          }).then(function(data) {                    
              $.growl.notice({ title: "نجاح ", message: "لقد تم ارسال تعليقك بنجاح" });                                                        
              $window.location.reload();
         });
    }
     
}]);


app.controller('loginCtrl', [ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){  
    $Constructor.load();   
    
    $scope.login=function(){           
     if($scope.mobile != undefined & $scope.password != undefined){
            var data = {
             mobile: $scope.mobile ,         
             password: $scope.password
            };    		
          $http({
                  method  : 'POST',
                  url     : domain+'api/login',
                  data    : data,
                  dataType: 'json',
                  jsonp: 'jsoncallback',
            headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
             }
           }).then(function(data) {
                 var url2 = domain+'api/select/users?mobile='+$scope.mobile;        
                 $http.get(url2).then(function(response) {
                      var user_id = response.data.users[0].id;
                      window.localStorage.setItem("user_id",user_id);   
                      if(user_id != null){
                          $.growl.notice({ title: "نجاح ", message: "لقد تسجيل الدخول بنجاح , شكرا " });                                         
                          window.location.href = "#/";
                      }
                      else $.growl.warning({ title: "خطأ ", message: "رقم الجوال او كلمة السر غير صحيحة" });                                         
                 });
              
          });
      }else  $.growl.warning({ title: "تنبيه ", message: "من فضلك أدخل كامل بياناتك" });                                         
	 
        
    }
}]);

app.controller('signupCtrl', function($scope,$http,$rootScope) {
    
});

app.controller('updateProfileCrtl',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load();   
         
        var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
        $http.get(url).then(function(response) {
            $scope.categories = response.data.departements;               
        }); 
        
        $scope.company_name = $rootScope.loged_user.company_name;
        $scope.company_activity = $rootScope.loged_user.company_activity;
        $scope.full_name = $rootScope.loged_user.full_name;
        $scope.email = $rootScope.loged_user.email;
        $scope.mobile = $rootScope.loged_user.mobile;
        $scope.gender = $rootScope.loged_user.gender;
        
        
        $scope.update=function(){           
              var data = {            
                company_name: $scope.company_name,
                company_activity : $scope.company_activity,
                full_name : $scope.full_name,
                email : $scope.email,
                mobile : $scope.mobile,
                gender : $scope.gender,
                profile_image: ($scope.profile_image == undefined) ? "" : $scope.profile_image, 
                };    
              data.where = {
                id : $rootScope.user_id,
              };
                		
             $http({
                     method  : 'POST',
                     url     : domain+'api/update/users?files=profile_image',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {                   
                  $.growl.notice({ title: "نجاح ", message: "لقد تم التعديل بنجاح , شكرا " });                                                            
             });
           }  
	 
    
}]);
        
app.controller('signupUserCtrl',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load();   
        
     $scope.insertData=function(){           
        var url = domain+'api/select/users?mobile='+$scope.mobile;        
	$http.get(url).then(function(response) {
            
           if(response.data.users.length <1){
               var data = {
                full_name: $scope.name ,
                email: $scope.email,
                mobile: $scope.mobile,
                password: $scope.password,                
               };    		
             $http({
                     method  : 'POST',
                     url     : domain+'api/insert/users?md5=password',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {
                    var url2 = domain+'api/select/users?order_by=id:desc';        
                    $http.get(url2).then(function(response) {
                         var user_id = response.data.users[0].id;
                         window.localStorage.setItem("user_id",user_id);                          
                    });
                  $.growl.notice({ title: "نجاح ", message: "لقد تم الاشتراك فى سوقى بنجاح , شكرا " });                                         
                   window.location.href = "#/";
             });
           }else $.growl.warning({ title: "تنبيه ", message: "  يوجد بالفعل مستخدم بنفس رقم الجوال" });   
	});
        
    }   
   
}]);



app.controller('signupCompanyCtrl',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load();   
         
        var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
        $http.get(url).then(function(response) {
            $scope.categories = response.data.departements;               
        });                    
        
     $scope.insertData=function(){           
        var url1 = domain+'api/select/users?mobile='+$scope.mobile;        
	$http.get(url1).then(function(response) {
            
           if(response.data.users.length <1){
               var data = {
                full_name: $scope.name ,
                email: $scope.email,
                mobile: $scope.mobile,
                password: $scope.password,
                gender:$scope.gender,
                company_name: $scope.company_name,
                company_activity : $scope.company_activity,
                type:'company',                
               };    		
             $http({
                     method  : 'POST',
                     url     : domain+'api/insert/users?md5=password',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {
                    var url2 = domain+'api/select/users?order_by=id:desc';        
                    $http.get(url2).then(function(response) {
                         var user_id = response.data.users[0].id;
                         window.localStorage.setItem("user_id",user_id);                          
                    });
                  $.growl.notice({ title: "نجاح ", message: "لقد تم الاشتراك فى سوقى بنجاح , شكرا " });                                         
                   window.location.href = "#/";
//                   $window.location.reload();
             });
           }else $.growl.warning({ title: "تنبيه ", message: "  يوجد بالفعل مستخدم بنفس رقم الجوال" });   
	});
        
    }   
   
}]);


app.controller('profileCtr',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load();  

        var url =  domain+"api/join/advertisement::users::region::departements/users.id:advertisement.user_id::region.id:advertisement.region::departements.id:advertisement.dep_id?advertisement_status=1&advertisement.user_id="+$rootScope.user_id+"&order_by=advertisement_id:desc";        
        $http.get(url).then(function(response) {             
           $scope.items = response.data;           
        });
       
}]);

app.controller('myAdsCtr',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load();  

        var url =  domain+"api/join/advertisement::users::region::departements/users.id:advertisement.user_id::region.id:advertisement.region::departements.id:advertisement.dep_id?advertisement.user_id="+$rootScope.user_id+"&order_by=advertisement_id:desc";        
        $http.get(url).then(function(response) {             
           $scope.items = response.data;           
        });
       
}]);

app.controller('myTopicsCtr',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load();  

        var url =  domain+"api/join/forum::users::departements/users.id:forum.user_id::departements.id:forum.dep_id?forum.user_id="+$rootScope.user_id+"&order_by=forum_id:desc";        
        $http.get(url).then(function(response) {             
           $scope.items = response.data;           
        });
       
       $scope.deleteTopic = function (id,index){          
              var data = {            
                id:id
              };                   	
             $http({
                     method  : 'POST',
                     url     : domain+'api/delete/forum',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {                   
                  $scope.items.splice(index,1);
                  $.growl.notice({ title: "نجاح ", message: "لقد تم حذف الموضوع من المنتدى  بنجاح , شكرا " });                                                            
             });
            
       }
    
    
}]);


app.controller('favouriteCtr',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load();  

        var url =  domain+"api/join/advertisement::users::adv_favourite::departements/users.id:advertisement.user_id::adv_favourite.adv_id:advertisement.id::departements.id:advertisement.dep_id?adv_favourite.user_id="+$rootScope.user_id+"&order_by=adv_favourite_id:desc";        
        $http.get(url).then(function(response) {             
           $scope.items = response.data;           
        });
       
       $scope.removeFromFav = function (id,index){          
              var data = {            
                id:id
              };                   	
             $http({
                     method  : 'POST',
                     url     : domain+'api/delete/adv_favourite',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {                   
                  $scope.items.splice(index,1);
                  $.growl.notice({ title: "نجاح ", message: "لقد تم الحذف من المفضلة  بنجاح , شكرا " });                                                            
             });         
       }
       
}]);

app.controller('aboutCtr',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load();          
        
        var url = domain+'api/select/about?id=1';        
        $http.get(url).then(function(response) {
             $scope.item = response.data.about[0];             
        });
}]);

app.controller('contactCrtl',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load(); 
     
        $scope.insertData=function(){                        
           if($scope.email != undefined & $scope.msg != undefined){
               var data = {
                name: $scope.name ,
                email: $scope.email,
                mobile: $scope.mobile,
                msg: $scope.msg
               };    		
             $http({
                     method  : 'POST',
                     url     : domain+'api/insert/contact_us',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {          
                  $("#name").val(''); $("#mobile").val(''); $("#email").val(''); $("#msg").val('');
                  $.growl.notice({ title: "نجاح ", message: "شكرا لتواصلك معنا , لقد تم ارسال رسالتك بنجاح" });                                         
//                   window.location.href = "#/";
             });
           }
//           else $.growl.warning({ title: "تنبيه ", message: "  من فضلك أدخل كامل بياناتك" });   
         
    }
    
        
}]);

app.controller('addTopicCrtl',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load(); 
        
        var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
        $http.get(url).then(function(response) {
            $scope.categories = response.data.departements;               
        });
        
         $scope.insertData=function(){  
             if($scope.title_topic != null && $("#description").val() != null){
               var data = {                
                dep_id: $scope.dep_id ,
                title: $scope.title_topic,                
                description:$("#description").val(),
                user_id : $rootScope.user_id,
                created_at:$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
               };    		
             $http({
                     method  : 'POST',
                     url     : domain+'api/insert/forum',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {          
                  $("#title_topic").val('');  $("#description").val('');
                  $.growl.notice({ title: "نجاح ", message: "لقد تم اضافة موضوعك  بنجاح" });                                         
             });           
        }
    }

}]);

app.controller('editTopicCrtl',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load(); 
        
        var id = $routeParams.id;
        var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
        $http.get(url).then(function(response) {
            $scope.categories = response.data.departements;               
        });
        
        var url2 = domain+'api/select/forum?id='+id;        
        $http.get(url2).then(function(response) {
            $scope.item = response.data.forum[0];
            $scope.title_topic = response.data.forum[0].title;
            $scope.dep_id = response.data.forum[0].dep_id;
            $("#description").val(response.data.forum[0].description);
            $scope.description = response.data.forum[0].description;
        });
        
         $scope.updateItem=function(){           
              var data = {            
                title: $scope.title_topic,
                dep_id : $scope.dep_id,
                description : $("#description").val(),               
                };    
              data.where = {
                id : id,
              };
                		
             $http({
                     method  : 'POST',
                     url     : domain+'api/update/forum',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {                   
                  $.growl.notice({ title: "نجاح ", message: "لقد تم التعديل بنجاح , شكرا " });                                                            
             });
           }

}]);


app.controller('commisionCtrl',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load(); 

}]);

app.controller('addAdCrtl',[ '$scope' , '$http' ,'$filter', '$location' , '$routeParams','$rootScope','$Constructor' ,
    function ($scope,$http,$filter,$location,$routeParams,$rootScope,$Constructor){
        $Constructor.load(); 
     
        var url = domain+'api/select/departements?status=1&lang_code=ar&order_by=title:asc';        
        $http.get(url).then(function(response) {
            $scope.categories = response.data.departements;               
        }); 
        var url2 = domain+'api/select/region?show=1&lang_code=ar&order_by=region_name:asc';        
        $http.get(url2).then(function(response) {
            $scope.regions = response.data.region;               
        }); 
        
        $scope.getCity = function() {
            var region_id = $scope.region;
            var url3 = domain+'api/select/city?region_id='+region_id+'&lang_code=ar&order_by=name:asc';        
            $http.get(url3).then(function(response) {
                $scope.cities = response.data.city;               
            }); 
        }
        
        var url4 = domain+'api/select/status?lang_code=ar&order_by=title:asc';        
        $http.get(url4).then(function(response) {
            $scope.all_status = response.data.status;               
        });
        
        $scope.getDept = function (){
            var dept = $scope.dep_id;            
            if(dept == 1) {
                $("#cars-section").show();
                var url5 = domain+'api/select/company?dep_id='+dept+'&order_by=name:asc';        
                $http.get(url5).then(function(response) {
                    $scope.companies = response.data.company;               
                });
            }  
             
            else if (dept == 2 || dept == 3 || dept == 4 || dept == 6 || dept == 5){
                if(dept == 2 || dept == 3 || dept == 5) $("#mobile-comp").show();
                else if (dept == 4 || dept == 6) $("#mobile-comp").hide();
                
                $("#mobiles-computer-section").show();
                var url5 = domain+'api/select/dep_departement?dep_id='+dept+'&order_by=name:asc';        
                $http.get(url5).then(function(response) {
                    $scope.dep_departement_ids = response.data.dep_departement;               
                });
            }
            
            
        }
        $scope.getMobileCompanies = function (){
            var dept_id = $scope.dep_departement_id;            
             var url5 = domain+'api/select/company_departement?dep_id='+dept_id+'&order_by=name:asc';        
                $http.get(url5).then(function(response) {
                    $scope.company_departement_ids = response.data.company_departement;               
                });
        }
        
        $scope.getCompanyType = function (){
            var comp_id = $scope.company_id;
            
            var url6 = domain+'api/select/departement_type?company_id='+comp_id+'&order_by=name:asc';        
            $http.get(url6).then(function(response) {
                $scope.company_departements = response.data.departement_type;               
            });
        }
        $scope.getModel = function (){             
            var url7 = domain+'api/select/model';
            $http.get(url7).then(function(response) {
                $scope.models = response.data.model;               
            });
        }
        
        $scope.insertData=function(){                        
           if($scope.description != undefined & $scope.title_ad != undefined){
               var data = {
                user_id: $rootScope.user_id,
                dep_id: $scope.dep_id ,
                adv_type: $scope.adv_type,
                title: $scope.title_ad,
                img_url: ($scope.img_url == undefined) ? "" : $scope.img_url, 
                region:$scope.region,
                city:$scope.city,
                contact_mobile:$scope.contact_mobile,
                adv_sub_type:$scope.adv_sub_type,
                description:$scope.description,
                status:1,
                car_status: $scope.car_status,
                company_id:$scope.company_id,
                departement_type_id:$scope.departement_type_id,
                model_id:$scope.model_id,
                
                dep_departement_id:$scope.dep_departement_id,
                company_departement_id:$scope.company_departement_id,
                created_at:$filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss')
               };    		
             $http({
                     method  : 'POST',
                     url     : domain+'api/insert/advertisement?files=img_url',
                     data    : data,
                     dataType: 'json',
                     jsonp: 'jsoncallback',
               headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                }
              }).then(function(data) {          
                  $("#title").val(''); $("#contact_mobile").val(''); $("#description").val('');
                  $.growl.notice({ title: "نجاح ", message: "لقد تم اضافة اعلانك بنجاح" });                                         
//                   window.location.href = "#/";
             });
           }else $.growl.warning({ title: "تنبيه ", message: "من فضلك أدخل كامل بيانات الاعلان" });   
         
    }
    
        
}]);



app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "home.html"
    })
    .when("/about", {
        title:'عن سوقى',
        templateUrl : "about.html"
    })
    .when("/contact_us", {
        title:'اتصل بنا',
        templateUrl : "contact_us.html"
    })
    .when("/signup", {
        templateUrl : "signup.html"
    })
    .when("/login", {
        templateUrl : "login.html"
    })
    .when("/forget", {
        templateUrl : "forget.html"
    })
    .when("/signupUser", {
        templateUrl : "signupUser.html"
    })
    .when("/signupCompany", {
        templateUrl : "signupCompany.html"
    })
    .when("/logout", {
        title:'تسجيل خروج',
        templateUrl : "logout.html"
    })
    .when("/profile", {
        templateUrl : "profile.html"
    })
    .when("/add_ad", {
        title:'اضف اعلان',
        templateUrl : "add_ad.html"
    })
    .when("/myads", {
        title:'اعلاناتى  ',
        templateUrl : "myads.html"
    })
    .when("/add_topic",{
        title:'أضف موضوع للمنتدى  ',
        templateUrl : "add_topic.html"
    })
    .when("/myTopics",{
        title:'مواضيعى فى المنتدى ',
        templateUrl : "myTopics.html"
    })
    .when("/editTopic/:id",{        
        templateUrl : "editTopic.html"
    })
    .when("/messages", {
        title:'البريد الوارد  ',
        templateUrl : "messages.html"
    })
    .when("/messages_sent", {
        title:'البريد المرسل  ',
        templateUrl : "messages_sent.html"
    })
    .when("/messages_deleted", {
        title:'الرسائل المحذوفة  ',
        templateUrl : "messages_deleted.html"
    })
    .when("/message/:sender_id/:adv_id/:id", {        
        templateUrl : "message.html"
    })
    .when("/favourite", {
        title:'المفضلة  ',
        templateUrl : "favourite.html"
    })    
    .when("/ad_details/:id" ,{
        templateUrl:"ad_details.html" 
    }) 
    .when("/categories" ,{
        title : 'الأقســام',
        templateUrl:"categories.html" 
    })  
    .when("/category/:id" ,{
        templateUrl:"category.html" 
    }) 
    .when('/update_profile',{
         title:'تعديل بيناتى الشخصية',
         templateUrl:"update_profile.html" 
    })
    .when('/commission',{
         title:'العمولة',
         templateUrl:"commission.html" 
    })
    .when('/fourms',{
        title:'المنتديات',
        templateUrl:"fourms.html"  
    })
    .when("/fourmsByCategory/:id" ,{
        templateUrl:"fourmsByCategory.html" 
    }) 
    .when("/fourm/:id" ,{
        templateUrl:"fourm.html" 
    }) 
    .when("/groups",{
         templateUrl:"groups.html" 
    })
    .when('/supervisors',{
        title:'المشرفين',
        templateUrl:"supervisors.html"  
    })
    .when('/search',{
        title:'البحث',
        templateUrl:"search.html"  
    })
    
    ;
     
 

    
});

app.filter('elapsed', function(){
  return function(date){
      if (!date) return;
      var time = Date.parse(date),
          timeNow = new Date().getTime(),
          difference = timeNow - time,
          seconds = Math.floor(difference / 1000),
          minutes = Math.floor(seconds / 60),
          hours = Math.floor(minutes / 60),
          days = Math.floor(hours / 24);
      if (days > 1) {
          return days + " يوم";
      } else if (days == 1) {
          return "1 day ago"
      } else if (hours > 1) {
          return hours + "  ساعة";
      } else if (hours == 1) {
          return "an hour ago";
      } else if (minutes > 1) {
          return minutes + "  دقائق";
      } else if (minutes == 1){
          return "دقيقة";
      } else {
          return "ثانية";
      }
}
});


app.controller('logoutCtrl',function($window) {
//    $scope.logout = function (){
            window.localStorage.clear();
            window.location.href = "#/";
            $window.location.reload();
//        }
});

//----------------- Filters ----------------------
app.filter('strpTags', function() {
    return function(text) {
      return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
});

app.filter("htmlSafe", ['$sce', function($sce) {
    return function(htmlCode){
        return $sce.trustAsHtml(htmlCode);
    };
}]);
//----------------- End Filters ----------------------


 //------------ Menu Close ----------------
$(".pmd-sidebar-nav li").click(function () {      
    $('#basicSidebar').removeClass('pmd-sidebar-open');
    $('.pmd-sidebar-overlay').removeClass('pmd-sidebar-overlay-active');
});
