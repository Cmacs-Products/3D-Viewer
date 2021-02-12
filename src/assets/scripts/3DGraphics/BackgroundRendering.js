"use strict";

var BackgroundRendering = (function () {

    function BackgroundRendering() {

        var that = this;

        // this.wireframeToggle = $("#wireframeToggle");
       
       // this.showHideGradientToggle = $("#showHideGradientToggle");
        this.isGradient = false;    
        this.gradientType = "Linear";
        var theme = document.cookie.split(';').reduce((cookies, cookie) => {
            let [name, value] = cookie.split('=').map(c => c.trim());
            cookies[name] = value;
            return cookies;
        }, {})["theme"];
        if (theme == 'ColorTheme') {
            this.startColor = '#37afe0';
            this.stopColor = '#00365d';
        }
        else if (theme == 'DarkTheme') {
            this.startColor = '#3a434a';
            this.stopColor = '#171c21';
        }
        else {
            this.startColor = '#ffffff';
            this.stopColor = '#666666';
        }
        // rein: overriding colors on request  of TJ:
        this.startColor = '#009fe3';
        this.stopColor = '#ffffff';
        
    }

    BackgroundRendering.prototype = {
        constructor: BackgroundRendering,
        
        hex: function (x) {
            x = x.toString(16);
            return (x.length == 1) ? '0' + x : x;

        },

        generateTexture: function (startColor, stopColor) {

            var theme = document.cookie.split(';').reduce((cookies, cookie) => {
                let [name, value] = cookie.split('=').map(c => c.trim());
                cookies[name] = value;
                return cookies;
            }, {})["theme"];

            // create canvas
            var canvas = document.createElement('canvas');
            canvas.width = Three.container.clientWidth;
            canvas.height = Three.container.clientHeight;
            // get context
            var context = canvas.getContext('2d');
            // draw gradient
            context.rect(0, 0, canvas.width, canvas.height);
            var gradient = context.createLinearGradient(canvas.width, 0, canvas.width, canvas.height);

            this.color1 = startColor.replace('#', '');
            this.color6 = stopColor.replace('#', '');

            this.r2 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.8 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.8));
            this.g2 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.8 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.8));
            this.b2 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.8 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.8));
            this.color2 = "#" + Three.BackgroundRendering.hex(this.r2) + Three.BackgroundRendering.hex(this.g2) + Three.BackgroundRendering.hex(this.b2);

            this.r3 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.6 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.6));
            this.g3 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.6 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.6));
            this.b3 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.6 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.6));
            this.color3 = "#" + Three.BackgroundRendering.hex(this.r3) + Three.BackgroundRendering.hex(this.g3) + Three.BackgroundRendering.hex(this.b3);

            this.r4 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.4 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.4));
            this.g4 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.4 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.4));
            this.b4 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.4 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.4));
            this.color4 = "#" + Three.BackgroundRendering.hex(this.r4) + Three.BackgroundRendering.hex(this.g4) + Three.BackgroundRendering.hex(this.b4);

            this.r5 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.2 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.2));
            this.g5 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.2 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.2));
            this.b5 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.2 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.2));
            this.color5 = "#" + Three.BackgroundRendering.hex(this.r5) + Three.BackgroundRendering.hex(this.g5) + Three.BackgroundRendering.hex(this.b5);

            if (theme == 'ColorTheme') {
                gradient.addColorStop(0, startColor); // light blue 
                gradient.addColorStop(0.17, this.color2);
                gradient.addColorStop(0.43, this.color3);
                gradient.addColorStop(0.66, this.color4);
                gradient.addColorStop(0.86, this.color5);
                gradient.addColorStop(1, stopColor);
            }
            else if (theme == 'DefaultTheme') {
                gradient.addColorStop(0, startColor);
                //gradient.addColorStop(0, '#fefefe');
                gradient.addColorStop(0.17, this.color2);
                gradient.addColorStop(0.49, this.color3);
                gradient.addColorStop(0.7, this.color4);
                gradient.addColorStop(0.87, this.color5);
                gradient.addColorStop(1, stopColor);
            }
            else {
                gradient.addColorStop(0, startColor);
                gradient.addColorStop(0.28, this.color2);
                gradient.addColorStop(0.49, this.color3);
                gradient.addColorStop(0.7, this.color4);
                gradient.addColorStop(0.87, this.color5);
                gradient.addColorStop(1, stopColor);

            }

            context.fillStyle = gradient;
            context.fill();
            Three.BackgroundRendering.startColor = startColor;
            Three.BackgroundRendering.stopColor = stopColor;
            return canvas;


        },

        generateRadialTexture: function (startColor, stopColor) {

            var theme = document.cookie.split(';').reduce((cookies, cookie) => {
                let [name, value] = cookie.split('=').map(c => c.trim());
                cookies[name] = value;
                return cookies;
            }, {})["theme"];
            // create canvas
            var canvas = document.createElement('canvas');
            canvas.width = Three.container.clientWidth;
            canvas.height = Three.container.clientHeight;
            // get context
            var ctx = canvas.getContext('2d');
            // draw gradient
            var x = canvas.width / 2;
            var y = canvas.height / 2;
            //radius of inner circle
            var radiusStart = (canvas.width / 2) / 20;
            var radiusEnd = 850;
            if (true) {
                radiusEnd = (x+y)/2;
            }
            if (canvas.width > canvas.height) {
                var radius =  canvas.width;
            }
            else {
                var radius =  canvas.height;
            }
            var grad = ctx.createRadialGradient(x, y, radiusStart, x, y, radiusEnd);

            this.color1 = startColor.replace('#', '');
            this.color6 = stopColor.replace('#', '');

            this.r2 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.8 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.8));
            this.g2 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.8 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.8));
            this.b2 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.8 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.8));
            this.color2 = "#" + Three.BackgroundRendering.hex(this.r2) + Three.BackgroundRendering.hex(this.g2) + Three.BackgroundRendering.hex(this.b2);

            this.r3 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.6 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.6));
            this.g3 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.6 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.6));
            this.b3 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.6 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.6));
            this.color3 = "#" + Three.BackgroundRendering.hex(this.r3) + Three.BackgroundRendering.hex(this.g3) + Three.BackgroundRendering.hex(this.b3);

            this.r4 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.4 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.4));
            this.g4 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.4 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.4));
            this.b4 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.4 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.4));
            this.color4 = "#" + Three.BackgroundRendering.hex(this.r4) + Three.BackgroundRendering.hex(this.g4) + Three.BackgroundRendering.hex(this.b4);

            this.r5 = Math.ceil(parseInt(this.color1.substring(0, 2), 16) * 0.2 + parseInt(this.color6.substring(0, 2), 16) * (1 - 0.2));
            this.g5 = Math.ceil(parseInt(this.color1.substring(2, 4), 16) * 0.2 + parseInt(this.color6.substring(2, 4), 16) * (1 - 0.2));
            this.b5 = Math.ceil(parseInt(this.color1.substring(4, 6), 16) * 0.2 + parseInt(this.color6.substring(4, 6), 16) * (1 - 0.2));
            this.color5 = "#" + Three.BackgroundRendering.hex(this.r5) + Three.BackgroundRendering.hex(this.g5) + Three.BackgroundRendering.hex(this.b5);

            if (theme == 'ColorTheme') {
                grad.addColorStop(0, startColor);
                grad.addColorStop(0.17, this.color2);
                grad.addColorStop(0.43, this.color3);
                grad.addColorStop(0.66, this.color4);
                grad.addColorStop(0.8, this.color5);
                grad.addColorStop(1, stopColor);
            }
            else if (theme == 'DefaultTheme') {
                grad.addColorStop(0, startColor);
                // grad.addColorStop(0, '#fefefe');
                grad.addColorStop(0.25, this.color2);
                grad.addColorStop(0.49, this.color3);
                grad.addColorStop(0.7, this.color4);
                grad.addColorStop(0.87, this.color5);
                grad.addColorStop(1, stopColor);
            }
            else {
                grad.addColorStop(0, startColor);
                grad.addColorStop(0.28, this.color2);
                grad.addColorStop(0.49, this.color3);
                grad.addColorStop(0.7, this.color4);
                grad.addColorStop(0.87, this.color5);
                grad.addColorStop(1, stopColor);
            }

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2, false);
            ctx.fillStyle = grad;
            ctx.fill();
            Three.BackgroundRendering.startColor = startColor;
            Three.BackgroundRendering.stopColor = stopColor;
            return canvas;

        },

      


    }

   
        return BackgroundRendering;
    

})();
