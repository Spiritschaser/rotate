angular.module('myapp', [])
    .directive('cropperCanvas', function() {
        var currentX = 0,
            currentY = 0,
            dragging = false,
            startX = 0,
            startY = 0,
            targetX = 0,
            targetY = 0,
            zooming = false,
            zoom = 1;
        var minXPos = 0,
            maxXPos = 50,
            minYPos = 0,
            maxYPos = 50,
            xangle = 0;

            return {

                restrict: 'AEC',
                link: function(scope, element, attrs) {

                    var img = new Image();
                    var size = "400px";
                    var reader = new FileReader();

                    var cElem = angular.element("<canvas width='400' height='400'>");
                    cElem
                        .css({
                            'width': size,
                            'height': size,
                            'border': '1px solid #d3d3d3',
                            'z-index': 4
                        });
                    element.append(cElem);
                    var ctx = cElem[0].getContext('2d');
                    var iFile = rcanvas(cElem);
                    // биндим rcanvas на загрузку
                    iFile[0].bind('change', function(e) {
                        var FR = new FileReader();
                        FR.onload = function(e) {
                            img.src = e.target.result;
                            img.onload = function() {
                                zoom = 1800.00/(img.width + img.height);
                                //ctx.drawImage(img, 0, 0);
                                iFile[1].css({
                                    'display': 'none'
                                });
                                currentX = -img.width / 3 * zoom; currentY = -img.height / 3 * zoom;
                                moveImage(-img.width / 3 * zoom, -img.height / 3 * zoom, img, ctx, cElem[0]);
                                buttons(cElem, ctx, img);
                            }
                        }
                        FR.readAsDataURL((e.srcElement || e.target).files[0]);
                    }); // закончили биндить rcanvas

                    cElem.bind('mousedown', function(e) {
                        startX = e.clientX;
                        startY = e.clientY;
                        zooming = false;
                        dragging = true;
                    });

                    cElem.bind('mouseup', function(e) {
                        startX = 0;
                        startY = 0;
                        dragging = false;
                        currentX = targetX;
                        currentY = targetY;
                    });

                    cElem.bind('mousemove', function(e) {
                        if (!dragging) {
                            return;
                        }
                        var diffX = startX - e.clientX; // how far mouse has moved in
                        var diffY = startY - e.clientY; // how far mouse has moved in
                        moveImage(currentX - diffX, currentY - diffY, img, ctx, cElem[0]);
                    });

                }
            };

        function moveImage(x, y, img, ctx, canvas) {
            var xcos = Math.round(Math.cos(xangle * Math.PI));
            var xsin = Math.round(Math.sin(xangle * Math.PI));

            var x2 = x * xcos + y * xsin;
            var y2 = y * xcos - x * xsin;

            targetX = x;
            targetY = y;
            ctx.clearRect(-canvas.width, -canvas.height, canvas.width*2, canvas.height*2);
            ctx.drawImage(img, x2, y2, img.width * zoom, img.height * zoom);
        };

        function zoominImage(img, ctx, canvas) {
            zoom = zoom * 1.1;
            var newXPos = currentX * zoom;
            var newYPos = currentY * zoom;
            moveImage(currentX * zoom, currentY * zoom, img, ctx, canvas);
        };

        function zoomoutImage(img, ctx, canvas) {
            zoom = zoom / 1.1;
            var newXPos = currentX * zoom;
            var newYPos = currentY * zoom;
            moveImage(currentX * zoom, currentY * zoom, img, ctx, canvas);
        };

        function rotateImage(img, ctx, canvas) {
            ctx.translate(150, 150);
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(-150, -150);
            xangle = xangle + 0.5;

            var tX = currentX;
            var tY = currentY;

            currentX = -tY;
            currentY = tX;

            targetX = -tY;
            targetY = tX;
            moveImage(currentX * zoom, currentY * zoom, img, ctx, canvas);
        };

        function rcanvas(elem) {
            var mEl = angular.element("<div>");
            elem.after(mEl);
            var iFile = angular.element("<input type='file'>");
            iFile.css({
                display: 'none'
            });
            mEl.append(iFile);
            var cImg = angular.element("<img src='folder-upload-1.svg'>");
            cImg.css({
                'width': parseInt(elem.css('width')) * 0.8 + 'px',
                'height': parseInt(elem.css('height')) * 0.8 + 'px',
                'position': 'absolute',
                'top': parseInt(elem.prop('offsetTop')) + parseInt(elem.css('height')) * 0.1 + 'px',
                'left': parseInt(elem.prop('offsetLeft')) + parseInt(elem.css('width')) * 0.1 + 'px',
                'z-index': 10 + Number(elem.css('z-index')),
                'cursor': 'pointer'
            });
            cImg
                .bind('click', function($event) {
                    iFile[0].click(); // нулевой член - всегда прямая ссылка на
                });
            mEl.append(cImg);
            return [iFile, mEl];
            };

        function buttons(elem, ctx, img) {
            var mEl = angular.element("<div>");
            elem.after(mEl);
            var zoomin = angular.element("<div>");
            var zoomout = angular.element("<div>");
            var rotate = angular.element("<div>");
            var ok = angular.element("<div>");
            shape = {
                    'width': (elem[0].width / 6) + 'px',
                    'height': (elem[0].height / 6) + 'px',
                    'position': 'absolute',
                    'borderRadius': (elem[0].width / 6) + 'px',
                    'background': 'rgba(255,255,255,0.7)',
                    'top': elem[0].offsetTop + elem[0].offsetHeight * (49 / 60) + 'px'
                    }
            zoomin
                .css(shape)
                .css({'left':elem[0].offsetLeft + elem[0].offsetWidth * (1 / 60) + 'px'})
                .append(angular.element("<img src='zoom-large.svg' style='width:100%;height:100%'>"))
                .bind('click', function(){zoominImage(img, ctx, elem[0]);});
            zoomout
                .css(shape)
                .css({'left':elem[0].offsetLeft + elem[0].offsetWidth * (13 / 60) + 'px'})
                .append(angular.element("<img src='zoom-small.svg' style='width:100%;height:100%'>"))
                .bind('click', function(){zoomoutImage(img, ctx, elem[0]);});
            rotate
                .css(shape)
                .css({'left':elem[0].offsetLeft + elem[0].offsetWidth * (37 / 60) + 'px'})
                .append(angular.element("<img src='object-rotate-right.svg' style='width:100%;height:100%'>"))
                .bind('click', function(){rotateImage(img, ctx, elem[0]);});
            ok
                .css(shape)
                .css({'left':elem[0].offsetLeft + elem[0].offsetWidth * (49 / 60) + 'px'})
                .append(angular.element("<img src='apply.svg' style='width:100%;height:100%'>"));
            mEl
                .append(zoomin)
                .append(zoomout)
                .append(rotate)
                .append(ok);
            return[zoomin,zoomout,rotate,ok];
        }
    });
