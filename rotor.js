        var currentX = 0, currentY = 0, dragging = false, startX = 0, startY = 0, zooming = false;
        zoom = 1;
        var minXPos = 0, maxXPos = 50, minYPos = 0, maxYPos = 50, xangle = 0;
        var height = 400, width = 400;

        function el(id) { return document.getElementById(id); } // Get elem by ID

        function formbutton(ID, x, y, w, h) {
            var elem = el(ID);
            elem.style.width = (w / 6) + 'px';
            elem.style.height = (h / 6) + 'px';
            elem.style.top = y + 'px';
            elem.style.left = x + 'px';
            elem.style.borderRadius = (w / 6)+'px';
            elem.style.background = 'rgba(255,255,255,0.7)';
            elem.style.display = 'block';
        }

        function butcontrol(ID, a) {
            var elem = el(ID);
            if (a == 1) {
                elem.style.display = 'block';
            }
        }

        function createbuttons(cID) {

            var cvs = el(cID);
            var width = cvs.offsetWidth;
            sHTML = "<div id='" + cID + "_zoomin' onclick='zoomin()' style='cursor: pointer; display: none; position: absolute;'><img src='zoom-large.svg' style='width:100%;height:100%;' /></div>" +
                    "<div id='" + cID + "_zoomout' onclick='zoomout()' style='cursor: pointer; display: none; position: absolute;'><img src='zoom-small.svg' style='width:100%;height:100%;' /></div>" +
                    "<div id='" + cID + "_ok' onclick='rotate()' style='cursor: pointer; display: none; position: absolute;'><img src='apply.svg' style='width:100%;height:100%;' /></div>" +
                    "<div id='" + cID + "_rotate' onclick='rotate()' style='cursor: pointer; display: none; position: absolute;'><img src='object-rotate-right.svg' style='width:100%;height:100%;' /></div>";
            cvs.insertAdjacentHTML('afterend', sHTML);
            formbutton(cID + "_zoomin", cvs.offsetLeft + cvs.offsetWidth / 60, cvs.offsetTop + cvs.offsetHeight * (49 / 60), cvs.offsetWidth, cvs.offsetWidth);
            formbutton(cID + "_zoomout", cvs.offsetLeft + cvs.offsetWidth * (13 / 60), cvs.offsetTop + cvs.offsetHeight * (49 / 60), cvs.offsetWidth, cvs.offsetWidth);
            formbutton(cID + "_ok", cvs.offsetLeft + cvs.offsetWidth * (37 / 60), cvs.offsetTop + cvs.offsetHeight * (49 / 60), cvs.offsetWidth, cvs.offsetWidth);
            formbutton(cID + "_rotate", cvs.offsetLeft + cvs.offsetWidth * (49 / 60), cvs.offsetTop + cvs.offsetHeight * (49 / 60), cvs.offsetWidth, cvs.offsetWidth);
            butcontrol(cID + "_zoomin", 1);
            butcontrol(cID + "_zoomout", 1);
            butcontrol(cID + "_ok", 1);
            butcontrol(cID + "_rotate", 1);
        }

        function rcanvas(cvsID) {
            var cvs = document.getElementById(cvsID);
            sHTML = "<img id='" + cvsID + "_10' class='uploadbutton' style='position:absolute;' src='folder-upload-1.svg' onclick='document.getElementById(\"asd\").click();'/>";
            cvs.insertAdjacentHTML('afterend', sHTML);
            var tcvs = document.getElementById(cvsID + '_10');
            tcvs.style.left = (cvs.offsetLeft + cvs.offsetWidth * 0.15) + 'px';
            tcvs.style.top = (cvs.offsetTop + cvs.offsetHeight * 0.15) + 'px';
            tcvs.style.width = cvs.offsetWidth * 0.7 + 'px';
            tcvs.style.height = cvs.offsetHeight * 0.7 + 'px';
            tcvs.style.cursor = 'pointer';
        }

        function reset() {
            files = [];
            zoom = 1;
            ctx.clearRect(0, 0, $canvas.width, $canvas.height);
            $input.value = null;
            $img.src = '';
        }

        function zoomin() {
            zoom = zoom * 1.1;
            var newXPos = currentX * zoom;
            var newYPos = currentY * zoom;
            moveImage(currentX, currentY);
        }

        function zoomout() {
            zoom = zoom / 1.1;
            var newXPos = currentX * zoom;
            var newYPos = currentY * zoom;
            moveImage(currentX, currentY);
        }

        function moveImage(x, y) {

            var xcos = Math.round(Math.cos(xangle * Math.PI));
            var xsin = Math.round(Math.sin(xangle * Math.PI));

            x2 = x * xcos + y * xsin;
            y2 = y * xcos - x * xsin;

            targetX = x;
            targetY = y;
            ctx.clearRect(0, 0, $canvas.width, $canvas.height);
            ctx.drawImage($img, x2, y2, $img.width * zoom, $img.height * zoom);
        }

        function updateDragBounds() {
            // $img.width, $canvas.width, zoom

            minXPos = $canvas.width - ($img.width * zoom);
            minYPos = $canvas.height - ($img.height * zoom);
        }

        onCanvasMouseUp = function (e) {
            startX = 0;
            startY = 0;
            dragging = false;
            currentX = targetX;
            currentY = targetY;
        };

        onCanvasMouseDown = function (e) {
            startX = e.clientX;
            startY = e.clientY;
            zooming = false;
            dragging = true;
        };

        onCanvasMouseMove = function (e) {
            if (!dragging) {
                return;
            }

            var diffX = startX - e.clientX; // how far mouse has moved in current drag
            var diffY = startY - e.clientY; // how far mouse has moved in current drag
            /*targetX = currentX - diffX; // desired new X position
            targetY = currentY - diffY; // desired new X position*/
            //            $xxx.value = currentX - diffX;
            //            $yyy.value = currentY - diffY;
            moveImage(currentX - diffX, currentY - diffY);

        };

        rotate = function () {
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
            moveImage(currentX, currentY);
        };

        //    var targetX = 0, targetY = 0;


        function readImage() {
            if (this.files && this.files[0]) {
                var FR = new FileReader();
                FR.onload = function (e) {
                    $img.src = e.target.result;
                    $img.onload = function () {
                        el('example_10').style.display = 'none';
                        ctx.drawImage($img, 0, 0);
                        currentX = -$img.width / 3, currentY = -$img.height / 3;
                        moveImage(-$img.width / 3, -$img.height / 3);
                        createbuttons('example');
                    }
                    //el("example").src = e.target.result;
                    // el("base").innerHTML = e.target.result;
                };
                FR.readAsDataURL(this.files[0]);
            }
        }

        var $canvas = el('example'),
            ctx = $canvas.getContext('2d'),
            $img = new Image();
        rcanvas('example');
        el("asd").addEventListener("change", readImage, false);