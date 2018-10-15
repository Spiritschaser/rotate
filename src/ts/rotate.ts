/*
Это базовая реализация редактора-кроппера картинок
*/
var vGap = 0;
var hGap = 0;

type ImgProperties = {
    dragging?: boolean;
    zooming?: boolean;
    cw?: number;
    ch?: number;
    iw?: number;
    ih?: number;
    angle?: number;
    zoom?: number;
}
class MyImage {
    canvasW: number;
    canvasH: number;
    imageW: number;
    imageH: number;
    currentX: number;
    currentY: number;
    angle: number;
    zoom: number;
    MyEl: HTMLElement;
    MyCTX: CanvasRenderingContext2D;
    Image: HTMLImageElement;
    MyWindow: any = window;
    OldW: number;
    params: ImgProperties = { angle: 0, zoom: 1, dragging: false };
    buttons() {
        var zoomin = document.createElement( 'div' );
        var zoomout = document.createElement( 'div' );
        var apply = document.createElement( 'div' );
        var rotate = document.createElement( 'div' );
        var shape = {
            'width': '16.67%',
            'height': '16.67%',
            'position': 'absolute',
            'borderRadius': '50%',
            'background': 'rgba(255,255,255,0.7)',
            'top': '75%',
            'zIndex': '500'
        };
        ( <any>Object ).assign( zoomin.style, shape );
        zoomin.style.left = '2%';
        zoomin.innerHTML = "<img src='img/zoom-large.svg' width='100px' height='100px' style='width:100%;height:100%'>";
        ( <any>Object ).assign( zoomout.style, shape );
        zoomout.style.left = '22%';
        zoomout.innerHTML = "<img src='img/zoom-small.svg' width='100px' height='100px' style='width:100%;height:100%'>";
        ( <any>Object ).assign( apply.style, shape );
        apply.style.left = '62%';
        apply.innerHTML = "<img src='img/apply.svg' width='100px' height='100px' style='width:100%;height:100%'>";
        ( <any>Object ).assign( rotate.style, shape );
        rotate.style.left = '82%';
        rotate.innerHTML = "<img src='img/object-rotate-right.svg' width='100px' height='100px' style='width:100%;height:100%'>";
        zoomin = <HTMLDivElement>this.MyEl.appendChild( zoomin );
        zoomin.onclick = this.zoominImage.bind( this );
        zoomout = <HTMLDivElement>this.MyEl.appendChild( zoomout );
        zoomout.onclick = this.zoomoutImage.bind( this );
        apply = <HTMLDivElement>this.MyEl.appendChild( apply );
        apply.onclick = this.postImage.bind( this );
        rotate = <HTMLDivElement>this.MyEl.appendChild( rotate );
        rotate.onclick = this.rotateImage.bind( this );
        zoomin.style.height = zoomin.clientWidth.toString() + "px";
        zoomout.style.height = zoomout.clientWidth.toString() + "px";
        apply.style.height = apply.clientWidth.toString() + "px";
        rotate.style.height = rotate.clientWidth.toString() + "px";
    }
    postImage(): void {
        var src: string = <string>this.MyCTX.canvas.toDataURL();
        console.log(src);
    }
    rotateImage(): void {
        this.MyCTX.translate( this.canvasW / 2, this.canvasH / 2 );
        this.MyCTX.rotate( 0.5 * Math.PI );
        this.MyCTX.translate( -this.canvasW / 2, -this.canvasH / 2 );
        this.params.angle = this.params.angle + 0.5;
        var tX = this.currentX;
        var tIw = this.imageW;
        this.currentX = -this.currentY;
        this.currentY = tX;
        this.imageW = -this.imageH;
        this.imageH = tIw;
        this.moveImage();
    }
    moveImage(): void {
        var x = this.currentX;
        var y = this.currentY;
        var xcos = Math.round( Math.cos( this.params.angle * Math.PI ) );
        var xsin = Math.round( Math.sin( this.params.angle * Math.PI ) );
        var x2 = x * xcos + y * xsin;
        var y2 = y * xcos - x * xsin;
        this.MyCTX.save();
        this.MyCTX.setTransform( 1, 0, 0, 1, 0, 0 );
        this.MyCTX.clearRect( 0, 0, this.canvasW, this.canvasH );
        this.MyCTX.restore();
        this.MyCTX.drawImage( this.Image, x2, y2,
            this.Image.width * this.params.zoom,
            this.Image.height * this.params.zoom );
    }
    zoomoutImage(): void {
        this.params.zoom = this.params.zoom - 0.05;
        if ( this.params.zoom < 0.05 ) {
            this.params.zoom = 0.05;
        }
        this.currentX = this.currentX + this.imageW * 0.05 / 2;
        this.currentY = this.currentY + this.imageH * 0.05 / 2;
        this.moveImage();
    }
    zoominImage(): void {
        this.params.zoom = this.params.zoom + 0.05;
        if ( this.params.zoom > 10 ) {
            this.params.zoom = 10;
        }
        this.currentX = this.currentX - this.imageW * 0.05 / 2;
        this.currentY = this.currentY - this.imageH * 0.05 / 2;
        this.moveImage();
    }
    fresize(): any {
        //console.log(this.MyEl.offsetWidth,this.MyEl.offsetHeight);
        this.MyCTX.canvas.width = this.MyEl.offsetWidth;
        this.MyCTX.canvas.height = this.MyEl.offsetHeight / this.OldW * this.MyEl.offsetWidth;
        this.OldW = this.MyEl.offsetWidth;
        this.moveImage();
    }
    constructor( MyEl: HTMLElement ) {
        var canvHtml = "<canvas id=\"canvas\" width=\"100%\" height=\"100%\"></canvas>";
        this.canvasW = MyEl.offsetWidth;
        this.canvasH = MyEl.offsetHeight;
        this.currentX = 0;
        this.currentY = 0;
        MyEl.innerHTML = canvHtml;
        this.MyEl = MyEl;
        var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById( "canvas" );
        this.MyCTX = canvas.getContext( '2d' );
        canvas = this.MyCTX.canvas;
        canvas.width = this.canvasW;
        canvas.height = this.canvasH;
        this.Image = new Image();
        window.onresize = this.fresize.bind( this );
        // ненавижу JavaScript
        var that: any = this; 
        MyEl.ontouchstart = function( e ) {
            that.targetX = e.touches[0].clientX;
            that.targetY = e.touches[0].clientY;
            that.params.dragging = true;
        }
        MyEl.ontouchmove = function( e ) {
            if ( that.params.dragging ) {
                that.currentX = that.currentX + e.touches[0].clientX - that.targetX;
                that.currentY = that.currentY + e.touches[0].clientY - that.targetY;
                that.moveImage();
                that.targetX = e.touches[0].clientX;
                that.targetY = e.touches[0].clientY;
            }
        }
        MyEl.ontouchend = function( e ) {
            that.params.dragging = false;
        }
        MyEl.onmousedown = function( e ) {
            that.targetX = e.clientX;
            that.targetY = e.clientY;
            that.params.dragging = true;
        }
        MyEl.onmousemove = function( e ) {
            if ( that.params.dragging ) {
                that.currentX = that.currentX + e.clientX - that.targetX;
                that.currentY = that.currentY + e.clientY - that.targetY;
                that.moveImage();
                that.targetX = e.clientX;
                that.targetY = e.clientY;
            }
        }
        MyEl.onmouseup = function( e ) {
            that.params.dragging = false;
        }
    }
}

class MyCamera {
    MyEl: HTMLElement;
    videoEl: any;
    handleSuccess( stream ) {
        this.videoEl = document.getElementById( "video" );
        this.videoEl.srcObject = stream;
        var that = this;
        this.videoEl.onclick = function() {
            var canvas = document.createElement( 'canvas' );
            canvas.width = 1280;
            canvas.height = 720;
            canvas.getContext( '2d' ).drawImage( that.videoEl, 0, 0);
            var imgsrc = canvas.toDataURL();
            stream.getVideoTracks()[0].stop();
            var image = new MyImage( that.videoEl.parentElement );
            image.Image.src = imgsrc;
            image.Image.onload = function() {
                if ( image.Image.width < image.Image.height ) {
                    image.params.zoom = image.canvasW * 2 / image.Image.width;
                } else {
                    image.params.zoom = image.canvasH * 2 / image.Image.height;
                }
                image.currentX = 0; // image.canvasW / 2 - image.Image.width / 2 * image.params.zoom;
                image.currentY = 0; //image.canvasH / 2 - image.Image.height / 2 * image.params.zoom;
                image.imageW = image.Image.width;
                image.imageH = image.Image.height;
                image.moveImage();
                image.buttons();
            }
        }
    }
    handleError( error ) {
        console.log( 'getUserMedia error: ', error );
    }

    constructor( MyEl: HTMLElement ) {
        var videoHtml = "<video id=\"video\" width=\"100%\" height=\"100%\" autoplay playsinline></video>";
        var constraints = {
            video: true,
            width: { ideal: 4096 },
            height: { ideal: 2160 },
            facingMode: "environment"
        };
        MyEl.innerHTML = videoHtml;
        this.MyEl = MyEl;
        navigator.mediaDevices.getUserMedia( constraints ).then( this.handleSuccess ).catch( this.handleError );
    }

}

function launchcamera() {
    var video = new MyCamera( document.getElementById( "place" ) );
}

function handleFiles( files ) {
    var file = files[0];
    if ( file.type.startsWith( 'image/' ) ) {
        var image = new MyImage( document.getElementById( "place" ) );
        var FR = new FileReader();
        FR.readAsDataURL( file );
        FR.onloadend = function() {
            image.Image.src = <string>FR.result;
            image.Image.onload = function() {
                if ( image.Image.width < image.Image.height ) {
                    image.params.zoom = image.canvasW * 1.5 / image.Image.width;
                } else {
                    image.params.zoom = image.canvasH * 1.5 / image.Image.height;
                }
                image.currentX = image.canvasW / 2 - image.Image.width / 2 * image.params.zoom;
                image.currentY = image.canvasH / 2 - image.Image.height / 2 * image.params.zoom;
                image.imageW = image.Image.width;
                image.imageH = image.Image.height;
                image.moveImage();
                image.buttons();
            }
        }
    }
}

