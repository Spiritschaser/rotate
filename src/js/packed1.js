/**
 * @author Sam
 */

var myApp = angular.module('myApp', ['ngRoute','ui.bootstrap']);

myApp.directive('showErrors', function ($window, $timeout, showErrorsConfig) {
    var getShowSuccess, linkFn;
    getShowSuccess = function (options) {
      var showSuccess;
      showSuccess = showErrorsConfig.showSuccess;
      if (options && options.showSuccess != null) {
        showSuccess = options.showSuccess;
      }
      return showSuccess;
    };
    linkFn = function (scope, el, attrs, formCtrl) {
      var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses;
      blurred = false;
      options = scope.$eval(attrs.showErrors);
      showSuccess = getShowSuccess(options);
      inputEl = el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = inputNgEl.attr('name');
      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute';
      }
      inputNgEl.bind('blur', function () {
        blurred = true;
        return toggleClasses(formCtrl[inputName].$invalid);
      });
      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        if (!blurred) {
          return;
        }
        return toggleClasses(invalid);
      });
      scope.$on('show-errors-check-validity', function () {
        return toggleClasses(formCtrl[inputName].$invalid);
      });
      scope.$on('show-errors-reset', function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          return blurred = false;
        }, 0, false);
      });
      return toggleClasses = function (invalid) {
        el.toggleClass('has-error', invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', !invalid);
        }
      };
    };
    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (!elem.hasClass('form-group')) {
          throw 'show-errors element does not have the \'form-group\' class';
        }
        return linkFn;
      }
    };
  }
);

myApp.directive('accessibleform', function () {
    return {
        restrict: 'A',
        link: function (scope, elem) {

            // set up event handler on the form element
            elem.on('submit', function () {

                // find the first invalid element
                var firstInvalid = elem[0].querySelector('.ng-invalid');

                // if we find one, set focus
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            });
        }
    };
});

myApp.provider('showErrorsConfig', function () {
  var _showSuccess;
  _showSuccess = false;
  this.showSuccess = function (showSuccess) {
    return _showSuccess = showSuccess;
  };
  this.$get = function () {
    return { showSuccess: _showSuccess };
  };
});


myApp.config(['$routeProvider',
function($routeProvider) {
    /**
     * контроллер основной страницы
     */
    $routeProvider.when('/', {
        templateUrl : '/templates/ng/root.jade'
    });
    /**
     * контроллер списка вин
     */

    $routeProvider.when('/bottles/:xxxxx', {
        templateUrl : '/templates/ng/bottles.html',
        reloadOnSearch: true
    });

    $routeProvider.when('/bottles', {
        templateUrl : '/templates/ng/bottles.html',
        reloadOnSearch: false
    });

    /**
     * контроллер списка покупок
     */
    $routeProvider.when('/buyings', {
        templateUrl : '/templates/ng/samplings.jade',
        controller : 'BuyingsPagingController'
    });

    /**
     * контроллер карточки вина
     */
    $routeProvider.when('/bottle/:id&modal', {
        templateUrl : function(params){ return '/bottle?modal&id=' + params.id; }
    });

    /**
     * контроллер карточки вина
     */
    $routeProvider.when('/bottle/:id', {
        templateUrl : function(params){ return '/bottle?id=' + params.id; }
    });


    /**
     * контроллер списка галерей
     */
    $routeProvider.when('/galleries', {
        templateUrl : '/templates/ng/galleries.html',
        controller : 'GalleriesPagingController'
    });
    

    /**
     * контроллер списка фото в галерее
     */
    $routeProvider.when('/galleries/:id', {
        cache: false,
        templateUrl : function(params){ return '/templates/ng/gallery.html?id=' + params.id; },
        controller : 'PhotosPagingController'
    });
    
    
    /**
     * контроллер списка дегустаций
     */
    $routeProvider.when('/samples', {
        templateUrl : '/templates/ng/samplings.html',
        controller : 'SamplesPagingController'
    });
    
    /**
     * контроллер карточки дегустации
     */
    $routeProvider.when('/sampling/:id', {
        templateUrl : function(params){ return '/sampling?id=' + params.id; }
    });
    
    /**
     * контроллер карточки покупки
     */
    $routeProvider.when('/buying/:id', {
        templateUrl : function(params){ return '/buying?id=' + params.id; },
        controller : 'BuyingController'
    });
    
    $routeProvider.when('/profile', {
        templateUrl : '/profile',
        controller : 'ProfileController'
    });
    
    $routeProvider.otherwise({
        redirectTo : '/'
    });
}]);

/**
 * @author Sam
 */

myApp.directive('rotate', function() {
    var currentX = 0, currentY = 0, dragging = false, targetX = 0, targetY = 0, zooming = false, zoom = 1, xangle = 0, touchupload = true;
    var img = new Image();
    return {
        restrict: 'E',
        require: 'ngModel',
        replace: true,
        scope: {
            id: '@',
            width: '@',
            height: '@',
            length: '=?', // Angular magic???
            depth: '@',
            sstyle: '@'
        },
        template: '<div id="" style="position:relative"><canvas id="canv1" class="rotator" width="800" height="800"></canvas><input id="rotfile" type="file" accept="image/*" capture="camera" style="width:1px;height=1px;display:block"/></div>',
        link: function(scope, element, attrs) {
            var myEl = angular.element(element[0].childNodes[1]);
            var ctx1;
            myEl.bind(
                    'change',
                    function(e) {
                        currentX = 0, currentY = 0, zoom = 1, xangle = 0;
                            ctx1 = element[0].childNodes[0].getContext('2d');
                            var FR = new FileReader();
                            FR.onload = function(e) {
                                var iTap = document.getElementById('tap');
                                iTap.style.display = 'none';
                                
                                //var img = new Image();
                                img.addEventListener("load", function() {
                                    currentX = (parseInt(scope.width,10)-img.width)/2;
                                    currentY = (parseInt(scope.height,10)-img.height)/2;
                                    moveImage(currentX, currentY, img, ctx1, scope);
                                    buttons(img, ctx1, element[0].childNodes[0], scope);
                                    var iRotfile = document.getElementById('rotfile');
                                    iRotfile.style.display = 'none';
                                  }, false);
                                img.src = e.target.result;
                            }
                            FR.readAsDataURL((e.srcElement || e.target).files[0]);
                            touchupload = false;
                    }
                    )
            var cElem = angular.element(element[0].childNodes[0]);
                var ww = element[0].offsetWidth;
                cElem.css({'height':ww, 'width':ww});
                
                cElem.bind('touchstart', function(e) {
                e.preventDefault();
                console.log(e);
                    startX = e.touches[0].clientX;
                    startY = e.touches[0].clientY;
                    zooming = false;
                    dragging = true;
                });

                cElem.bind('click', function(e) {
                    if(touchupload) {
                        touchupload = false;
                        document.getElementById('rotfile').click();
                    }
                    e.preventDefault();
                });

                cElem.bind('touchend', function(e) {
                    if (touchupload) {
                        touchupload = false;
                        document.getElementById('rotfile').click();
                        return;
                    }
                    e.preventDefault();
                        startX = 0;
                        startY = 0;
                        currentX = targetX;
                        currentY = targetY;
                        dragging = false;
                    });

                cElem.bind('touchmove', function(e) {
                    if (touchupload) {
                        touchupload = false;
                        document.getElementById('rotfile').click();
                        return;
                    }
                e.preventDefault();
                    dragging = true;
                    if (!dragging) {
                        return;
                    }
                    var diffX = startX - e.touches[0].clientX; // how far mouse
                                                    // has moved in
                    var diffY = startY - e.touches[0].clientY; // how far mouse
                                                    // has moved in
                    moveImage(currentX - diffX, currentY - diffY,
                            img, ctx1, scope);
                    dragging = false;
                });

                cElem.bind('mousedown', function(e) {
                    startX = e.clientX;
                    startY = e.clientY;
                    zooming = false;
                    dragging = true;
                });

                cElem.bind('mouseup', function(e) {
                    startX = 0;
                    startY = 0;
                    currentX = targetX;
                    currentY = targetY;
                    dragging = false;
                });

                cElem.bind('mousemove', function(e) {
                    if (!dragging) {
                        return;
                    }
                    var diffX = startX - e.clientX; // how far mouse
                                                    // has moved in
                    var diffY = startY - e.clientY; // how far mouse
                                                    // has moved in
                    moveImage(currentX - diffX, currentY - diffY,
                            img, ctx1, scope);
                });
        }
    }

    function rotateImage(img, ctx, scope) {
        width = parseInt(scope.width,10);
        height = parseInt(scope.height,10);
        ctx.translate(width/2, height/2);
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(-width/2,-height/2);
        xangle = xangle + 0.5;

        var tX = currentX;
        var tY = currentY;

        currentX = -tY;
        currentY = tX;

        targetX = -tY;
        targetY = tX;
        moveImage(currentX, currentY, img, ctx,
                scope);
    }

    function moveImage(x, y, img, ctx, scope) {
        width = parseInt(scope.width,10);
        height = parseInt(scope.height,10);
        var xcos = Math.round(Math.cos(xangle * Math.PI));
        var xsin = Math.round(Math.sin(xangle * Math.PI));

        var x2 = x * xcos + y * xsin;
        var y2 = y * xcos - x * xsin;

        targetX = x;
        targetY = y;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.restore();
        ctx.drawImage(img, x2+(img.width - img.width * zoom)/2, y2+(img.height - img.height * zoom)/2, img.width * zoom, img.height * zoom);
    }

    function zoominImage(img, ctx, scope) {
        zoom = zoom * 1.1;
        moveImage(currentX, currentY, img, ctx, scope);
    }

    function zoomoutImage(img, ctx, scope) {
        zoom = zoom / 1.1;
        moveImage(currentX, currentY, img, ctx, scope);
    }

    function buttons(img, ctx, elem, scope) {
        var mEl = angular.element("<div>");
        angular.element(elem).after(mEl);
        var zoomin = angular.element("<div>");
        var zoomout = angular.element("<div>");
        var rotate = angular.element("<div>");
        var ok = angular.element("<div>");
        shape = {
            'width' : '16.67%',
            'height' : '16.67%',
            'position' : 'absolute',
            'borderRadius' : '50%',
            'background' : 'rgba(255,255,255,0.7)',
            'top' : '75%'
        }
        zoomin
                .css(shape)
                .css(
                        {
                            'left' : '2%'
                        })
                .append(
                        angular
                                .element("<img src='/static/rotate2/zoom-large.svg' width='100px' height='100px' style='width:100%;height:100%'>"))
                .bind('click', function() {
                    zoominImage(img, ctx, scope);
                });
        zoomout
                .css(shape)
                .css(
                        {
                            'left' : '22%'
                        })
                .append(
                        angular
                                .element("<img src='/static/rotate2/zoom-small.svg' width='100px' height='100px' style='width:100%;height:100%'>"))
                .bind('click', function() {
                    zoomoutImage(img, ctx, scope);
                });
        rotate
                .css(shape)
                .css(
                        {
                            'left' : '82%'
                        })
                .append(
                        angular
                                .element("<img src='/static/rotate2/object-rotate-right.svg' width='100px' height='100px' style='width:100%;height:100%'>"))
                .bind('click', function() {
                    rotateImage(img, ctx, scope);
                });
        mEl.append(zoomin).append(zoomout).append(rotate)
        return [ zoomin, zoomout, rotate ];
        }
 });


/**
 * копирование объекта из jinja2 в объект JS в простейшем контроллере
 */

myApp.controller('FirstController', function($scope) {
    $scope.posts = [{
        'author' : {
            'nickname' : 'John'
        },
        'body' : 'Beautiful day in Portland!'
    }, {
        'author' : {
            'nickname' : 'Susan'
        },
        'body' : 'The Avengers movie was so cool!'
    }];
});

/**
 * контроллер модели бутылок вин (будет доработан и преобразован в универсальный
 * доступ к модели)
 */

myApp
        .controller(
                'BottleController',
                function($scope, $window, $http, $routeParams, $compile) {
/*
                    if(localStorage.bottle1){
                        var bid = JSON.parse(localStorage.getItem("bottle1"));
                        console.log(bid);
                        localStorage.removeItem("bottle1");
                        $window.location.href = '/#/bottle/'+bid.id;
                    }
*/
                    $scope.opencal = function($event) {
                        $event.preventDefault();
                        $event.stopPropagation();
                        if(!$scope.bottle.vintage){
                            $scope.bottle.vintage = new Date();
                            $scope.bottle.vintage.setDate($scope.bottle.vintage.getDate()-830);
                        } else {
                            $scope.bottle.vintage.setDate($scope.bottle.vintage.getDate());
                        }
                        $scope.opened = true;
                        //$scope.bottle.vintage = undefined;
                      };
                    
                    $scope.toggleDropdown = function($event) {
                      $event.preventDefault();
                      $event.stopPropagation();
                      $scope.drop1.isopen = !$scope.drop1.isopen;
                    };

                    $scope.bottle = {};
                    $scope.bottle.id = $routeParams.id;

                    var grapelist;
                    $http({
                        method : 'GET',
                        url : '/grapes'
                    }).success(function(data, status, headers, config) {
                        $scope.grapelist = data;
                    }).error(function(data, status, headers, config) {
                        console.log(status);
                    });

                    getData();

                    $scope.addNewGrape = function() {
                        var newItemNo = $scope.bottle.grapes.length + 1;
                        $scope.bottle.grapes.push({
                            'id' : 'grape' + newItemNo
                        });
                    };

                    $scope.removeGrape = function() {
                        var lastItem = $scope.bottle.grapes.length - 1;
                        $scope.bottle.grapes.splice(lastItem);
                    };

                    function getData(page, paging) {
                        return $http
                                .get("/bot?id=" + $routeParams.id)
                                .then(
                                        function(response) {
                                            $scope.bottle = response.data;
                                            if($scope.bottle.state==0){
                                                $scope.bottle.state=''
                                            }
                                            $http.get("/photolist/"+$scope.bottle.activity_id)
                                                 .then(
                                                         function(resp) {
                                                             $scope.slides2 = resp.data;
                                                             }
                                                         )
                                            $scope.bottle.id = $routeParams.id;
                                            if($scope.bottle.vintage){
                                                var year = $scope.bottle.vintage;
                                                $scope.bottle.vintage =new Date(year, 1, 1);
                                                $scope.bottle.vintage.setDate($scope.bottle.vintage.getDate());
                                            }
                                            //setTimeout(
                                                    //'document.getElementById("loading").style.display = "none"; document.getElementById("mycloak").style.display = "inline"',
                                                   // 5); 
                                            //console.log(window.innerWidth);
                                            // рисуем красивую загрузку
                                            // страницы, скрываем заполнение
                                            // полей
                                        });
                    }

                    /**
                     * Удаление записи при нажатии Delete
                     */
                    $scope.deleteBottle = function(item, event) {
                            $http.delete('/bot?id=' + $scope.bottle.id).success(function (data, status) {
                                console.log('Deleted!');
                                $window.location.href = '/#/bottles';
                            });
                    }

                    /**
                     * обновление данных при нажатии Submit
                     */

                    $scope.upload1 = function ()
                    {        
                        var referralDivFactory = $compile("<rotate id='r1' width='1000px' height='1000px' ng-model='xrotate' style='width:400px;height:400px'></rotate>");
                        var referralDiv = referralDivFactory($scope);
                        var containerDiv = document.getElementById('r0');
                        angular.element(containerDiv.parentNode).append(referralDiv);
                        containerDiv.style.display = 'none';
                        iFile = document.getElementById('rotfile');
                        iFile.click();
                    }
                    $scope.submitTheForm = function(item, event) {
                         console.log("--> Submitting form");
                         $scope.bottle.vintage_s = $scope.bottle.vintage.getFullYear();
                         var dataObject = $scope.bottle;
                         var responsePromise = $http.post("/bot", dataObject, {});
                         responsePromise.success(function(dataFromServer, status, headers, config){
                             $window.location.href = '/#/bottles';
                                     });
                         responsePromise.error(function(data, status, headers, config) { 
                             console.log("Submitting form failed!");
                         });
                    };

                    $scope.cancel = function () {
                        console.log('modal dismissed!');
                        console.log($scope.bottle);
                        //$scope.$dismiss();
                        $window.location.href = '/#/sampling/new';
                    };
                    
                    $scope.ok = function () {
                        console.log("--> Submitting form");
                        $scope.bottle.vintage_s = $scope.bottle.vintage.getFullYear();
                        var dataObject = $scope.bottle;
                        console.log(dataObject);
                        var responsePromise = $http.post("/bot", dataObject, {});
                        responsePromise.success(function(dataFromServer, status, headers, config){
                                    //$scope.$close(dataFromServer);
                                    var xsampling = JSON.parse(localStorage.getItem("sampling1"));
                                    xsampling.wine = {};
                                    xsampling.wine.wine = dataFromServer.name;
                                    xsampling.wine.id = dataFromServer.id;
                                    xsampling.bottle.wine = dataFromServer.name;
                                    xsampling.bottle.id = dataFromServer.id;
                                    var sObj = JSON.stringify(xsampling);
                                    localStorage.setItem("sampling1", sObj);
                                    $window.location.href = '/#/sampling/new';
                                    });
                        responsePromise.error(function(data, status, headers, config) { 
                            console.log("Submitting form failed!");
                        });
                        console.log('modal closed!');
                    };
                    
                    $scope.submitmock = function () {
                        errfunc = function(){
                            $scope.$broadcast('show-errors-check-validity');
                        }
                        errfunc();
                        setTimeout('errfunc',500);
                    }
                    $scope.getphoto = function (m) {
                        // сохранение и переход к загрузке фото
                        $scope.bottle.vintage_s = $scope.bottle.vintage.getFullYear();
                        var sObj = JSON.stringify($scope.bottle);
                        //localStorage.setItem("bottle1", sObj);
                        var dataObject = $scope.bottle;
                        var responsePromise = $http.post("/bot", dataObject, {});
                        responsePromise.success(function(dataFromServer, status, headers, config){
                            $scope.bottle.id = dataFromServer.id;
                            sObj = JSON.stringify($scope.bottle);
                            localStorage.setItem("bottle1", sObj);
                            if(m === 'modal'){
                                $window.location.href = '/gallery?ic=Bottle&modal&ic_id='+dataFromServer.id;
                            } else {
                                $window.location.href = '/gallery?ic=Bottle&ic_id='+dataFromServer.id;
                                }
                            });
                    }
                });
// end of BottleController конец контроллера бутылки

function send64() {
    // $scope.bottle.photo1 = $canvas.toDataURL("image/jpeg", 1.0);
    console.log(document.find('cropper-canvas').find('canvas').toDataURL(
            "image/jpeg", 1.0));
}

myApp.controller('ModalBottle', function ($scope, $modal, $log) {

$scope.open = function () {
    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      size: 'lg',
      templateUrl: '/bottle?id=modal'
    });
	
    modalInstance.result.then(function (selectedItem) {
        $scope.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
};
});

myApp.controller('ModalBuying', function ($scope, $modal, $log) {

	$scope.open = function () {
	    var modalInstance = $modal.open({
	      animation: $scope.animationsEnabled,
	      size: 'lg',
	      templateUrl: '/buying?id=new'
	    });

	    modalInstance.result.then(function (selectedItem) {
	        $scope.selected = selectedItem;
	      }, function () {
	        $log.info('Modal dismissed at: ' + new Date());
	      });
	};
	});


myApp.controller('BuyingController', function($scope, $http, $routeParams, $location) {
	$scope.buying = {};
		aaaa = 1;	
		
		
    var grapelist;
		getData();

    /**
     * функция загрузки списка сортов винограда
     */
    $http({
        method : 'GET',
        url : '/grapes'
    }).// загрузка списка сортов винограда в асинхронном режиме
    success(function(data, status, headers, config) {
        $scope.grapelist = data;
    }).error(function(data, status, headers, config) {
        console.log(status);
    });
    
    /**
     *загрузка данных в шаблон 
     */
	function getData(page, paging) {
		return $http.get("/buy?id=" + $routeParams.id).then(function(response) {
			$scope.buying = response.data;
			$scope.buying.id = $routeParams.id;
			$scope.buying.wine = $scope.buying.bottle.wine;
		});
	}

    /**
     * простая функция фозврата списка вин по поиску
     */
    $scope.getWine = function(val) {
        return $http.get('/searchwinedata/' + val).then(function(response) {
            return (response.data);
        });
    };

    $scope.getPOS = function(val) {
        return $http.get('/searchposdata/' + val).then(function(response) {
            return (response.data);
        });
    };    
    
 
    /**
	 * обновление данных при нажатии Submit
	 */

	$scope.submitTheForm = function(item, event) {
		if(!$scope.buying.bottle.id) {
		$scope.buying.bottle.id = $scope.buying.wine.id;
		$scope.buying.bottle.wine = $scope.buying.wine.wine;
			}
/*		if(!$scope.buying.POS.id) {
			$scope.buying.POS.id = $scope.buying.POS;
			$scope.buying.POS.wine = $scope.buying.wine.wine;
			}		*/
//		alert(JSON.stringify($scope.buying));
		var dataObject = $scope.buying;
		var responsePromise = $http.post("/buy/", dataObject, {});
		responsePromise.success(function(dataFromServer, status, headers, config) {
			console.log(dataFromServer.title);
			$location.path("/#/buyings");
		});
		responsePromise.error(function(data, status, headers, config) {
		console.log("Submitting form failed!");
		});
	};
});
// конец контроллера работы с динамическим поиском




myApp.controller('ModalBottle', function ($scope, $window, $log) {

$scope.open = function () {
    var sObj = JSON.stringify($scope.sampling);
    localStorage.setItem("sampling1", sObj);
    $window.location.href = '/#/bottle/modal';
/*
    var modalInstance = $modal.open({
      animation: false,
      backdrop: false,
      size: 'lg',
      templateUrl: '/bottle?id=modal'
    });
    
    modalInstance.result.then(function (returnedData) {
        $scope.sampling.wine = returnedData.name;
        $scope.sampling.wine.id = returnedData.id;
        console.log('Added wine: ' + returnedData.name);
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
*/
};
});

myApp.controller('SamplingController', function($scope, $window, $compile, $http, $timeout,
        $routeParams) {
    $scope.xrose = [];

    $scope.labels = [
                     'Ароматность',
                     'Крепость',
                     'Сухофрукты',
                     'Цитрус',
                     'Травы',
                     'Цветочный',
                     'Пряный',
                     'Танины',
                     'Дуб',
                     'Минеральность',
                     'Сладость',
                     'Кислотность',
                     'Тело',
                     'Ножки',
                     'Баланс',
                     'Послевкусие'
                     ]
    
    $scope.modalbottle = function() {
        $("#mainview").append($compile("<modal-bottle />"));
    }



    $scope.sampling = {};

    var grapelist;
    var stickers = {};

    getData();
    $scope.roseflag = "ready";
    /**
     * функция загрузки списка сортов винограда
     */
    $http({
        method : 'GET',
        url : '/grapes'
    }).// загрузка списка сортов винограда в асинхронном режиме
    success(function(data, status, headers, config) {
        $scope.grapelist = data;
    }).error(function(data, status, headers, config) {
        console.log(status);
    });

    /**
     * загрузка данных в шаблон
     */
    function getData(page, paging) {
        return $http.get("/samp?id=" + $routeParams.id).then(
                function(response) {
                    $scope.sampling = response.data;
                    $scope.sampling.id = $routeParams.id;
                    $scope.sampling.wine = $scope.sampling.bottle.wine;
                    var flavvector = $scope.sampling.flavvector;
                    for (var i = 0; i < flavvector.length; i++) {
                        flavvector[i] = Math.round(flavvector[i] / 20);
                    }
                    var flav2vector = $scope.sampling.flav2vector;
                    for (var i = 0; i < flav2vector.length; i++) {
                        flav2vector[i] = Math.round(flav2vector[i] / 20);
                    }
                    var tastevector = $scope.sampling.tastevector;
                    for (var i = 0; i < tastevector.length; i++) {
                        tastevector[i] = Math.round(tastevector[i] / 20);
                    }
                    $http.get("/photolist/"+$scope.sampling.activity_id)
                    .then(
                            function(resp) {
                                $scope.slides2 = resp.data;
                                if($scope.slides2[0]['image']==="/photo/0.jpg"){
                                    $scope.slides2[0]['image']="/bottle"+$scope.sampling.bottle.id+".jpg";
                                } else {
                                    $scope.slides2.splice(0,0,{"image":"/bottle"+$scope.sampling.bottle.id+".jpg"});
                                }
                                console.log($scope.slides2)
                                }
                            )
                    if(localStorage.sampling1 && $routeParams.id === 'new'){
                        $scope.sampling = JSON.parse(localStorage.getItem("sampling1"));
                        flavvector = $scope.sampling.flavvector;
                        flav2vector = $scope.sampling.flav2vector;
                        tastevector = $scope.sampling.tastevector;
                        nn = localStorage.getItem("sampling1");
                        var bid = JSON.parse(nn).wine.id;
                        $timeout(function(){
                        $http.get('/rosedata/' + bid).then(function(response) {
                            $scope.$broadcast('redrawrose', response.data.flavors);
                            $scope.$broadcast('redrawrose', response.data.tastes);
                        });
                        },0,false);
                        }
                    if ($scope.sampling.currency=='EUR'){$scope.currency_sign = '€';}
                    if ($scope.sampling.currency=='RUB'){$scope.currency_sign = '₽';}
                    permission = document.getElementById('perm').getAttribute('perm');

                    //setTimeout(
                            //document.getElementById("loading").style.display = "none"; 
                            document.getElementById("mycloak").style.display = "inline";

                     //       500);
                    // рисуем красивую загрузку
                    // страницы, скрываем заполнение
                    // полей
                    //setTimeout(
                    //        '',
                    //        1500);
                    //dcanvas("backCanvas", 5, 16, flavvector);
                });
    }
    
    /**
     * простая функция возврата списка характеристик и обновления диаграмм 
     */
    
    $scope.updateRose = function() {
        if($scope.sampling.wine){
        $http.get('/rosedata/' + $scope.sampling.wine.id).then(function(response) {
            $scope.$broadcast('redrawrose', response.data.flavors);
            $scope.$broadcast('redrawrose', response.data.tastes);
            
        });
        }
    };
    

    /**
     * простая функция фозврата списка вин по поиску
     */
    $scope.getWine = function(val) {
        return $http.get('/searchwinedata/' + val).then(function(response) {
            return (response.data);
        });
    };

    /**
     * "переключалка" состояния стикера
     */
    $scope.tSticker = function() {
        this.s.state = !this.s.state;
    };
    /**
     * Удаление записи при нажатии Delete
     */
    $scope.deleteSampling = function(item, event) {
        if($scope.sampling.id=='new'){
            localStorage.removeItem("sampling1");
            console.log('Canceled!');
            $window.location.href = '/#/samples';
        } else {
            $http.delete('/samp?id=' + $scope.sampling.id).success(function (data, status) {
                localStorage.removeItem("sampling1");
                console.log('Deleted!');
                $window.location.href = '/#/samples';
            });
        }
    }

    $scope.opencal = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
      };
    
    /**
     * обновление данных при нажатии Submit
     */

    $scope.submitTheForm = function() {
        if (!$scope.sampling.bottle.id) {
            $scope.sampling.bottle.id = $scope.sampling.wine.id;
            $scope.sampling.bottle.wine = $scope.sampling.wine.wine;
        }
        //$scope.sampling.flav2vector.unshift(0);
        //$scope.sampling.tastevector.unshift(0);
        $scope.sampling.flavors = null;
        $scope.sampling.flavors2 = null;
        $scope.sampling.tastes = null;
        var dataObject = $scope.sampling;
        var responsePromise = $http.post("/samp", dataObject, {});
        responsePromise.success(function(dataFromServer, status, headers, config) {
            console.log(dataFromServer.title);
            localStorage.removeItem("sampling1");
            $window.location.href = '/#/samples'
        });
        responsePromise.error(function(data, status, headers, config) {
            console.log("Submitting form failed!");
        });
    };
    
    $scope.getphoto = function() {
        if (!$scope.sampling.bottle.id) {
            $scope.sampling.bottle.id = $scope.sampling.wine.id;
            $scope.sampling.bottle.wine = $scope.sampling.wine.wine;
        }
        //$scope.sampling.flav2vector.unshift(0);
        //$scope.sampling.tastevector.unshift(0);
        $scope.sampling.flavors = null;
        $scope.sampling.flavors2 = null;
        $scope.sampling.tastes = null;
        var dataObject = $scope.sampling;
        var sObj = JSON.stringify($scope.sampling);
        var responsePromise = $http.post("/samp", dataObject, {});
        responsePromise.success(function(dataFromServer, status, headers, config) {
            $scope.sampling.id = dataFromServer.id;
            sObj = JSON.stringify($scope.sampling);
            console.log(dataFromServer.title);
            localStorage.setItem("sampling1", sObj);
            $window.location.href = '/gallery?ic=Sampling&ic_id='+dataFromServer.id;
        });
        responsePromise.error(function(data, status, headers, config) {
            console.log("Submitting form failed!");
        });
    };
    
    $scope.submitmock = function () {
        console.log("Submit Mock!")
        errfunc = function(){
            $scope.$broadcast('show-errors-check-validity');
        }
        errfunc();
        setTimeout('errfunc',500);
    }
    
});
// конец контроллера работы с динамическим поиском


/**
 * контроллер пажинации списка модели бутылок вин (будет доработан и преобразован в универсальный доступ к модели)
 */

function CommonPaging(url){
    return function($location, $scope, $routeParams, $http) {
        storagename = url.split('?')[0];
        storage = localStorage.getItem(storagename);
        if(storage){
            storedata = JSON.parse(storage);
        } else {
            storedata = {};
            storedata.wsearch = '';
            storedata.page = 1;
            storedata.ownonly = false;
        }
        $scope.wsearch = storedata.wsearch;
        $scope.ownonly = storedata.ownonly;
        

            urlParams = $location.search();

           if(Number(urlParams.page) > 1) {
           $scope.currentPage = Number(urlParams.page);
           storedpage = Number(urlParams.page);
        } 
           
        var url2;
        
        if(url === 'gal?id=xxx&page='){
            url2 = url.replace('xxx',$routeParams.id);
        } else {
            url2 = url;
        }
           
        /**
         * функция загрузки списка сортов винограда
         */
        if(url === 'bot?page='){
        $http({
            method : 'GET',
            url : '/grapes'
        }).// загрузка списка сортов винограда в асинхронном режиме
        then(function(response) {
           $scope.grapelist = response.data;
        });
        $http({
            method : 'GET',
            url : '/states'
        }).// загрузка списка стран в асинхронном режиме
        then(function(response) {
           $scope.statelist = response.data;
        });
        }
    getData(storedata.page, 20, storedata.wsearch, storedata.ownonly);
    $scope.currentPage = storedata.page;
    function getData(page, paging, wsearch, ownonly) {
        return $http.get(url2 + page+'&ownonly='+ownonly+'&wsearch='+wsearch).then(function(response) {
            $scope.itemlen = response.data[1];
            $scope.bottles = response.data[0];
            
            // Грязный хак, чтобы не плодить коллбэки на обещания возвратов функций
        });
    }
    /**
     * простая функция фозврата списка вин по поиску
     */
    $scope.getWine = function(val) {
        return $http.get('/searchwinedata/' + val).then(function(response) {
            return (response.data);
        });
    };
    
    $scope.clearstorage = function(){
        localStorage.removeItem(storagename);
        $scope.wsearch = '';
        $scope.currentPage = 1;
        $scope.ownonly = false;
    }
    
    /**
     * обновление списка при изменении странице в UI
     */
    $scope.pageChanged = function() {
        if(typeof $scope.wsearch == 'undefined') { $scope.wsearch = ''; }
        if ($scope.wsearch.length < 3 && $scope.wsearch.length > 0){
            storedata.wsearch = '';
            } else {
            storedata.wsearch = $scope.wsearch;
            }
        storedata.ownonly = $scope.ownonly;
        storedata.page = $scope.currentPage;
        localStorage.setItem(storagename, JSON.stringify(storedata));

        urlParams = $location.search();
        //console.log(urlParams);
        if(storedata.page > 1) { 
        $scope.currentPage = storedata.page;
        storedata.page = 1;
        }

        $location.search('page', $scope.currentPage);
        //$location.search('wsearch', $scope.wsearch);
        getData($scope.currentPage, 20, storedata.wsearch, storedata.ownonly);
    };
    
  };
}

myApp.controller('BottlesPagingController', CommonPaging('bot?page='));
myApp.controller('SamplesPagingController', CommonPaging('samp?page='));
myApp.controller('BuyingsPagingController', CommonPaging('buyings?page='));
myApp.controller('GalleriesPagingController', CommonPaging('gal?page='));


// end of PagingController конец контроллера пажинации



myApp.controller('ProfileController', function($scope) {
    });

/**
 * контроллер пажинации списка модели бутылок вин (будет доработан и преобразован в универсальный доступ к модели)
 */

function CommonPaging1(url){
    return function($location, $scope, $routeParams, $http, $route, $window) {
        storagename = url.split('?')[0];
        storage = localStorage.getItem(storagename);
        if(storage){
            storedata = JSON.parse(storage);
        } else {
            storedata = {};
            storedata.wsearch = '';
            storedata.page = 1;
            storedata.ownonly = false;
        }
        $scope.wsearch = storedata.wsearch;
        $scope.ownonly = storedata.ownonly;
        

            urlParams = $location.search();

           if(Number(urlParams.page) > 1) {
           $scope.currentPage = Number(urlParams.page);
           storedpage = Number(urlParams.page);
        } 
           
        var url2;
        
        if(url === 'gal?id=xxx&page='){
            url2 = url.replace('xxx',$routeParams.id);
        } else {
            url2 = url;
        }
           
    getData(storedata.page, 20, storedata.wsearch, storedata.ownonly);
    $scope.currentPage = storedata.page;
    function getData(page, paging, wsearch, ownonly) {
        return $http.get(url2 + page+'&ownonly='+ownonly+'&wsearch='+wsearch).then(function(response) {
            $scope.itemlen = response.data[1];
            $scope.bottles = response.data[0];
            
            // Грязный хак, чтобы не плодить коллбэки на обещания возвратов функций
        });
    }
    /**
     * простая функция фозврата списка вин по поиску
     */
    $scope.getWine = function(val) {
        return $http.get('/searchwinedata/' + val).then(function(response) {
            return (response.data);
        });
    };
    
    $scope.clearstorage = function(){
        localStorage.removeItem(storagename);
        $scope.wsearch = '';
        $scope.currentPage = 1;
        $scope.ownonly = false;
    }
    
    /**
     * обновление списка при изменении странице в UI
     */
    $scope.pageChanged = function() {
        if(typeof $scope.wsearch == 'undefined') { $scope.wsearch = ''; }
        if ($scope.wsearch.length < 3 && $scope.wsearch.length > 0){
            storedata.wsearch = '';
            } else {
            storedata.wsearch = $scope.wsearch;
            }
        storedata.ownonly = $scope.ownonly;
        storedata.page = $scope.currentPage;
        localStorage.setItem(storagename, JSON.stringify(storedata));

        urlParams = $location.search();
        //console.log(urlParams);
        if(storedata.page > 1) { 
        $scope.currentPage = storedata.page;
        storedata.page = 1;
        }

        $location.search('page', $scope.currentPage);
        //$location.search('wsearch', $scope.wsearch);
        getData($scope.currentPage, 20, storedata.wsearch, storedata.ownonly);
    };
    
    /**
     * Установка картинки обложкой
     */
    
    $scope.cover = function(id) {
    	$http.get('/phot?cover&id=' + id)
    }
    $scope.delete = function(id) {
    	$http.delete('/phot?id=' + id).then(function(response) {
    		if(response.data=="200"){
    			$route.reload();
    		} else {
    			$window.location.href = '/#/galleries';
    		}
        });
    }
    
    
  };
}

myApp.controller('PhotosPagingController', CommonPaging1('gal?id=xxx&page='));


// end of PagingController конец контроллера пажинации



var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var helpers = (function () {
    function helpers() {
    }
    helpers.prototype.frompolar = function (r, a, w, l) {
        var x = w + r * Math.cos(a * Math.PI / (l / 2));
        var y = w + r * Math.sin(a * Math.PI / (l / 2));
        return {
            x: x,
            y: y
        };
    };
    helpers.prototype.getpolar = function (x, y, w, r, d, l) {
        var r2 = Math.round(Math.sqrt((x - w) * (x - w) + (y - w) * (y - w)) / (r / d));
        var a = Math.round((l) * (Math.atan2(0, -w) + Math.atan2(x - w, y - w)) / (Math.PI * 2));
        if (a == l) {
            a = 0;
        }
        return {
            r: r2,
            a: a
        };
    };
    helpers.prototype.drawback = function (ctx, d) {
        var centerX = d.width / 2;
        var centerY = d.height / 2;
        var radius = (d.width > d.height) ? d.height * 0.65 / 2 : d.width * 0.65 / 2;
        ctx.clearRect(0, 0, d.width, d.height);
        for (var i = 1; i < d.depth; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius / d.depth * i, 0, 2 * Math.PI, false);
            ctx.lineWidth = 0.25;
            ctx.strokeStyle = '#000000';
            ctx.stroke();
            ctx.closePath();
        }
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = '#000000';
        ctx.stroke();
        ctx.closePath();
        for (var i = 0; i < d.rose.length; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            var dec = this.frompolar(radius, i - d.rose.length / 2, (d.width > d.height) ? d.height / 2 : d.width / 2, d.rose.length);
            ctx.lineTo(dec.y, dec.x);
            ctx.lineWidth = 0.25;
            ctx.strokeStyle = '#000000';
            ctx.stroke();
            ctx.closePath();
        }
        for (var i = 0; i < d.rose.length; i++) {
            ctx.beginPath();
            if (i > d.rose.length / 2) {
                ctx.textAlign = "end";
            }
            else {
                ctx.textAlign = "start";
            }
            if ((i == d.rose.length / 2) || (i == 0)) {
                ctx.textAlign = "center";
            }
            if ((i < d.rose.length / 4) || (i > d.rose.length * 0.75)) {
                ctx.textBaseline = "bottom";
            }
            else {
                ctx.textBaseline = "top";
            }
            var dec = this.frompolar(radius * 1.03, i - d.rose.length / 4, (d.width > d.height) ? d.height / 2 : d.width / 2, d.rose.length);
            ctx.fillStyle = "#000";
            ctx.font = "normal 26px sans-serif";
            if (d.labels[i].length > 10) {
                var strings = d.labels[i].split('-');
                if (strings.length > 1) {
                    if ((d.rose.length / 4 == i) || (d.rose.length * 3 / 4 == i)) {
                        ctx.fillText(strings[0] + '-', dec.x, dec.y - 8);
                        ctx.fillText(strings[1], dec.x, dec.y + 8);
                    }
                    else {
                        ctx.fillText(strings[0] + strings[1], dec.x, dec.y);
                    }
                }
                else {
                    strings = d.labels[i].split(' ');
                    if (strings.length > 1) {
                        if ((d.rose.length / 4 == i) || (d.rose.length * 3 / 4 == i)) {
                            ctx.fillText(strings[0], dec.x, dec.y - 8);
                            ctx.fillText(strings[1], dec.x, dec.y + 8);
                        }
                        else {
                            ctx.fillText(strings[0] + ' ' + strings[1], dec.x, dec.y);
                        }
                    }
                    else {
                        ctx.fillText(d.labels[i], dec.x, dec.y);
                    }
                }
            }
            else {
                ctx.fillText(d.labels[i], dec.x, dec.y);
            }
        }
    };
    helpers.prototype.drawrose = function (ctx, d) {
        var depth = d.depth;
        //let length = d.rose.length;
        var centerX = d.width / 2;
        var centerY = d.height / 2;
        var radius = (d.width > d.height) ? d.height * 0.65 / 2 : d.width * 0.65 / 2;
        var width = d.width;
        var height = d.height;
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        var fp = this.frompolar(d.rose[0] * (radius / depth), 0 - d.rose.length / 4, (d.width > d.height) ? d.height / 2 : d.width / 2, d.rose.length);
        ctx.moveTo(fp.x, fp.y);
        for (var i = 1; i < d.rose.length; i++) {
            fp = this.frompolar(d.rose[i] * (radius / depth), i - d.rose.length / 4, (d.width > d.height) ? d.height / 2 : d.width / 2, d.rose.length);
            ctx.lineTo(fp.x, fp.y);
        }
        ctx.closePath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'red';
        ctx.stroke();
        for (var i = 0; i < d.rose.length; i++) {
            ctx.beginPath();
            fp = this.frompolar(d.rose[i] * (radius / depth), i - d.rose.length / 4, (d.width > d.height) ? d.height / 2 : d.width / 2, d.rose.length);
            ctx.arc(fp.x, fp.y, 2, 0, 2 * Math.PI, false);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'green';
            ctx.stroke();
            ctx.closePath();
        }
    };
    return helpers;
}());
var radar = (function (_super) {
    __extends(radar, _super);
    function radar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.restrict = 'E';
        _this.require = 'ngModel';
        _this.replace = true;
        _this.scope = {
            id: '@',
            width: '@',
            height: '@',
            depth: '@',
            //length: '@',
            t: '@',
            rose: '=ngModel',
            labels: '='
        };
        _this.compile = function (el, attrs) {
            return {
                post: function (scope, el, attrs) {
                	if(scope.t==="true"){
                    el.bind("click", function (e) {
                        var radius = (e.target.clientWidth > e.target.clientHeight) ? e.target.clientHeight * 0.65 / 2 : e.target.clientWidth * 0.65 / 2;
                        var xpos, ypos;
                        xpos = e.offsetX == undefined ? e.layerX : e.offsetX;
                        ypos = e.offsetY == undefined ? e.layerY : e.offsetY;
                        //console.log(scope.depth, scope.rose.length);
                        var pol = _this.getpolar(e.target.clientWidth - xpos, ypos, (e.target.clientWidth > e.target.clientHeight) ? e.target.clientHeight / 2 : e.target.clientWidth / 2, (e.target.clientWidth > e.target.clientHeight) ? e.target.clientHeight * 0.65 / 2 : e.target.clientWidth * 0.65 / 2, scope.depth, scope.rose.length);
                        if (pol.r > scope.depth) {
                            pol.r = scope.depth;
                        }
                        scope.rose[pol.a] = pol.r * 5 / scope.depth;
                        ctx.clearRect(0, 0, scope.width, scope.height);
                        if (scope.labels) {
                            _this.drawback(ctx, scope);
                            _this.drawrose(ctx, scope);
                            //console.log(pol);
                        }
                    });}
                    var xtemplate = '<canvas id="' + scope.id + '" width="' + scope.width + '" height="' + scope.height + '" style="display:block;width:100%;"\>';
                    el.html(xtemplate);
                    var canvas = el[0].childNodes[0];
                    var ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, scope.width, scope.height);
                    if (scope.labels) {
                        _this.drawback(ctx, scope);
                        _this.drawrose(ctx, scope);
                    }
                }
            };
        };
        return _this;
    }
    radar.factory = function () {
        var _this = this;
        var directive = function () { return new _this(); };
        return directive;
    };
    return radar;
}(helpers));
myApp.directive('radar', radar.factory());
