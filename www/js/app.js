// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var db;

var app = angular.module('starter', ['ionic', 'ngCordova'])

app.run(function($ionicPlatform,$cordovaSQLite) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    db = window.openDatabase("Demo.db","1.0","Demo","2000");

    $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, password TEXT, phone TEXT, address TEXT)");
    $cordovaSQLite.execute(db,"CREATE TABLE IF NOT EXISTS cart (userid INTEGER,itemid TEXT, pic TEXT, price TEXT)");
  });
    
    $ionicPlatform.registerBackButtonAction(function (event) {
    if($state.current.name=="app.home"){
    //navigator.app.exitApp(); //<-- remove this line to disable the exit
    }
    else {
    navigator.app.backHistory();
    }
    }, 100);
})

app.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider){
    $ionicConfigProvider.tabs.position('bottom'); 
    $stateProvider.state('tabs',{
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })
    .state('tabs.mainmenu',{
        url: '/mainmenu',
        views: {
            'mainmenu-tab': {
                templateUrl: 'templates/mainmenu.html',
                controller: 'mainmenuCtrl'
            }
        }
    })
    .state('tabs.profile',{
        url: '/profile',
        views: {
            'profile-tab': {
                templateUrl: 'templates/profile.html',
                controller: 'profileCtrl'
            }
        }
    })
    .state('tabs.cart',{
        url: '/cart',
        views: {
            'cart-tab': {
                templateUrl: 'templates/cart.html',
                controller: 'cartCtrl'
            }
        }
    })
    $urlRouterProvider.otherwise('/tab/mainmenu');
})

app.controller('regCtrl',function($scope,$window,$cordovaSQLite,$ionicPopup){
    $scope.insert = function(reg){
        var pass1 = reg.password;
        var pass2 = reg.password2;
        if(pass2 === pass1){
        var query = "INSERT INTO user (name,email,password,phone,address) VALUES (?,?,?,?,?)";
        $cordovaSQLite.execute(db,query,[reg.name,reg.email,reg.password,reg.phone,reg.address]).then(function(res){
            //alert("Registered Successfully !");
            var alertPopup = $ionicPopup.alert({
            title: 'Success !',
            template: 'Registered Successfully !'
            });
            alertPopup.then(function(res) {
                location.href = 'index.html';
            });
            
        }, function(err){
            console.log("Fail! " + err.message);
        });
    }
        else
        {
            var alertPopup = $ionicPopup.alert({
            title: 'Failed !',
            template: 'Password field does not match with confirm password !'
            });
        }
    }
});

app.controller('loginCtrl',function($scope,$window,$cordovaSQLite,$ionicPopup){
    
    $scope.loginFunc = function(login)
    {
        var id = login.id;
        var pass = login.pass;
        $cordovaSQLite.execute(db,'SELECT * FROM user').then(function(res){
            if(res.rows.length){
                for(var i=0; i<res.rows.length; i++){
                    if(id === res.rows[i].name && pass === res.rows[i].password){

                        location.href = 'main.html';
                        sessionStorage.setItem("pid",res.rows[i].id);
                        sessionStorage.setItem("pname",res.rows[i].name);
                        sessionStorage.setItem("pemail",res.rows[i].email);
                        sessionStorage.setItem("ppass",res.rows[i].password);
                        sessionStorage.setItem("pphone",res.rows[i].phone);
                        sessionStorage.setItem("paddress",res.rows[i].address); 
                    }
                }                 
            }
                        $scope.login = "";
                        var alertPopup = $ionicPopup.alert({
                        title: 'Oops !',
                        template: 'Invalid ID or Password !'
                        });
            
        },function(err){
            console.log("Fail! " + err.message);    
        });
    }
});

app.controller('profileCtrl',function($scope,$cordovaGeolocation,$ionicPopup,$rootScope, $cordovaSQLite){
    $scope.pid = sessionStorage.getItem("pid");
    $scope.pname = sessionStorage.getItem("pname");
    $scope.pemail = sessionStorage.getItem("pemail");
    $scope.ppass = sessionStorage.getItem("ppass");
    $scope.pphone = sessionStorage.getItem("pphone");
    $scope.paddress = sessionStorage.getItem("paddress");
    
    $rootScope.$on("GetDetailsMethod", function(){
           $scope.orderDetails();
        });
    
    $scope.orderDetails = function(){
        
        $scope.money = 0;
        var query = "SELECT * FROM cart";
        $cordovaSQLite.execute(db, query, []).then(function (res) {
            if (res.rows.length) {
                for (var i = 0; i < res.rows.length; i++) {
                    if ($scope.pid == res.rows[i].userid) {
                        $scope.allSessions.push({
                            userid: res.rows.item(i).userid,
                            itemid: res.rows.item(i).itemid,
                            pic: res.rows.item(i).pic,
                            price: res.rows.item(i).price
                        });
                        $scope.money += parseInt(res.rows.item(i).price);
                    }
                }
            }
        }, function (err) {
            alert("Fail! " + err.message);
        });
        $scope.allSessions = [];
        
        var alertPopup = $ionicPopup.alert({
                title: 'Order Details',
                template: '<div>asdas {{money}}</div>'
                });
        
    };
    
    var posOptions = {timeout: 20000, enableHighAccuracy: false};

        $scope.wherePos = function(){
            $cordovaGeolocation.getCurrentPosition(posOptions)
            .then(function(position){
                var lat  = position.coords.latitude
                var long = position.coords.longitude
                //alert("Lat = "+lat +", Long = "+ long); 
                
                var alertPopup = $ionicPopup.alert({
                title: 'Where Am I ?',
                template: ('Latitude : '+lat+' & Longitude : '+long)
                });
                
            }, function(error){
                alert("Error");
            });

        };
    
});

app.controller('mainmenuCtrl',function($scope,$http,$cordovaSQLite,$rootScope,$ionicPopup){
    $scope.pid = sessionStorage.getItem("pid");
    $http.get('js/data.json').success(function(data){
        $scope.items = data;
    });
         
    $scope.addCart = function(item){
        $scope.foodid = $scope.items.indexOf(item)
        var query = "INSERT INTO cart (userid,itemid,pic,price) VALUES (?,?,?,?)";
        $cordovaSQLite.execute(db,query,[$scope.pid,item.name,item.pic,item.price]).then(function(res){
            //location.reload(true);
            //history.go(0);
            //window.location.href = window.location.href;
            $rootScope.$emit("CallParentMethod", {});
            //alert(item.name+" Added to cart Successfully !");
            
            var alertPopup = $ionicPopup.alert({
            title: 'Success !',
            template: (item.name+' Added to cart Successfully')
            });

        }, function(err){
            alert("Fail! " + err.message);
        });  
    } 
});

app.controller('cartCtrl',function($scope, $cordovaSQLite, $rootScope, $ionicPopup,$cordovaPinDialog,$cordovaSms){
    
    $rootScope.$on("CallParentMethod", function(){
           $scope.doRefresh();
        });
    $scope.pid = sessionStorage.getItem("pid");
    
    $scope.load = function() {
        $scope.doRefresh();
    }
    
    $scope.money;
    $scope.doRefresh = function() {
    $scope.$broadcast('scroll.refreshComplete');
    $scope.money = 0;
    var query = "SELECT * FROM cart";
    $cordovaSQLite.execute(db, query, []).then(function(res){
            if(res.rows.length){
                for(var i=0; i<res.rows.length; i++){
                    if($scope.pid == res.rows[i].userid){
                    $scope.allSessions.push({
                    userid: res.rows.item(i).userid,
                    itemid: res.rows.item(i).itemid,
                    pic: res.rows.item(i).pic,
                    price: res.rows.item(i).price
                    });
                    $scope.money += parseInt(res.rows.item(i).price);
                    }  
                }
            }
        },function(err){
            alert("Fail! " + err.message);    
        });
    $scope.allSessions= [];
    }
    
    $scope.showConfirm = function(session) {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Are you sure ?',
       template: ('Delete '+ session.itemid)
     });
     confirmPopup.then(function(res) {
       if(res) {
        //var rowid = ($scope.allSessions.indexOf(session)+1);
        
        var query = "DELETE FROM cart WHERE userid=? AND itemid=?";
        $cordovaSQLite.execute(db, query, [$scope.pid,session.itemid]).then(function(res){
            $scope.doRefresh();
        },function(err){
          console.log("Failed to Delete item !");
        });
        
       } else {
         // No
       }
     });
   };
    
    $scope.increaseItem = function(session){
        $scope.value;
        var confirmPopup = $ionicPopup.confirm({
       title: 'Number of Items',
       template: '<select style="width:100%;" name="cars" size="3"><option>2</option><option>3</option><option>4</option><option>5</option></select>'
        });
     confirmPopup.then(function(res) {
       if(res) {
           //YES
           //alert($scope.value);
       } else {
         // No
       }
     });            
    };
    
    $scope.confirmBuy = function(){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Buy Now',
            template: 'Confirm Your Order ?'
        });
        confirmPopup.then(function (res) {
        if (res) {  //YES
            
            var otp = Math.floor(1000 + Math.random() * 9000);
            var phone = sessionStorage.getItem("pphone");
            
            var options = {
                replaceLineBreaks: false, // true to replace \n by a new line, false by default
                android: {
                    intent: '' // send SMS with the native android SMS messaging
                    //intent: '' // send SMS without open any other app
                    //intent: 'INTENT' // send SMS inside a default SMS app
                }
            };
            
            $cordovaSms.send(phone, otp, options)
                .then(function () {
                    // Success! SMS was sent
                }, function (error) {
                    // An error occurred
                });
            
            var alertPopup = $ionicPopup.alert({
            title: 'OTP',
            template: 'OTP has been send successfully on your device !'
            });
            
            setTimeout(function(){
                
                window.plugins.pinDialog.prompt("Please Enter OTP", callback, "OTP !", ["OK","Cancel"]);
            
            function callback(results) {
                if (results.buttonIndex == 1) {
                    // OK clicked, show input value
                    if(results.input1 == otp){
                        $rootScope.$emit("GetDetailsMethod", {});
                        
                         var alertPopup = $ionicPopup.alert({
                             title: 'OTP authenticated successfully !',
                             template: 'Thank you! Your Order has been placed successfully'
                             });
                             
                             var querytwo = "DELETE FROM cart WHERE userid=?";
                             $cordovaSQLite.execute(db, querytwo, [$scope.pid]).then(function (res) {
                                 $scope.doRefresh();
                             }, function (err) {
                                 console.log("Failed to Delete item !");
                             });
                             
                     }
                     else{
                         alert("Wrong OTP Please Try Again");
                     }
                }
                if (results.buttonIndex == 2) {
                    // Cancel clicked
                    alert("Order Canceled !");
                }
            };
                
            }, 3000);

            /*$cordovaPinDialog.prompt('Please Enter OTP !').then(
                 function (result) {
                     // result
                     if(result.input1 === 1234){
                         alert("OTP correct");
                     }
                     else{
                         alert("wrong otp");
                     }
                 },
                 function (error) {
                     // error
                 });*/
            
        }
        else{   //NO
                
        }
        });
    };
    
});