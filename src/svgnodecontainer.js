var SVGContainer = require('./svgcontainer');
var svgToImg = require('svg-to-image');
var reactIDRegex = /\s?data-reactid="[^"]+"/g;
var reactIDRegex = /\s?data-reactid="[^"]+"/g;
var svgAttributes = [
    'fill',
    'font-family',
    'font-size',
    'stroke',
    'stroke-width',
    'text-anchor'
];
var svgAttrLength = svgAttributes.length;
var computedStyleSupported = !!global.getComputedStyle;

function applySVGAttributes(node) {
    if (!computedStyleSupported) {
        return;
    }

    var computedStyle = window.getComputedStyle(node);
    var computedProperty;
    var styleAttr = '';

    if (computedStyle && computedStyle.length > 0) {
        for (var i = 0; i < svgAttrLength; i++) {
            styleAttr =  svgAttributes[ i ];
            computedProperty = computedStyle.getPropertyValue(styleAttr);

            if (!node.getAttribute(styleAttr) && computedProperty) {
                switch (styleAttr) {
                    case 'font-family':
                        node.setAttribute(styleAttr, 'Arial');
                        break;
                    default:
                        node.setAttribute(styleAttr, computedProperty);
                }
            }
        }
    }

    if (node.children.length > 0) {
        for (var k = 0; k < node.children.length; k++) {
            applySVGAttributes(node.children[ k ]);
        }
    }
}

function SVGNodeContainer(node, _native) {
    applySVGAttributes(node);

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
