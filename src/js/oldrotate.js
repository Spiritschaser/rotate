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
                            };
                            FR.readAsDataURL((e.srcElement || e.target).files[0]);
                            touchupload = false;
                    }
                    );
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
        };
    };

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
        ctx.drawImage(img, x2+(img.width - img.width * zoom)/2, 
                           y2+(img.height - img.height * zoom)/2,
                           img.width * zoom, 
                           img.height * zoom);
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
        };
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
        mEl.append(zoomin).append(zoomout).append(rotate);
        return [ zoomin, zoomout, rotate ];
        }
 });

