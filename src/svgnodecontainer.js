var SVGContainer = require('./svgcontainer');
var svgToImg = require('svg-to-image');
var reactIDRegex = /\s?data-reactid="[^"]+"/g;

function SVGNodeContainer(node, _native) {
    this.src = node;
    this.image = null;
    var self = this;

    this.promise = _native ? new Promise(function(resolve, reject) {
        var sanitizedSVG = (new XMLSerializer()).serializeToString(node).replace(reactIDRegex, '');

        svgToImg(sanitizedSVG, function(err, image) {
            if (err) {
                return reject(err);
            }

            self.image = image;

            if (self.image.complete === true) {
                resolve(self.image);
            }
        });
    }) : this.hasFabric().then(function() {
        return new Promise(function(resolve) {
            window.html2canvas.svg.fabric.parseSVGDocument(node, self.createCanvas.call(self, resolve));
        });
    });
}

SVGNodeContainer.prototype = Object.create(SVGContainer.prototype);

module.exports = SVGNodeContainer;
