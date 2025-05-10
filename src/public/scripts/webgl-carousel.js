export class WebGLCarousel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.initWebGLContext();
    }

    initWebGLContext() {
        this.gl = this.canvas.getContext('webgl') || 
                 this.canvas.getContext('experimental-webgl');
    }
}