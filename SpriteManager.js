function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
import * as THREE from 'three';
export var SpriteManager = /*#__PURE__*/ function() {
    "use strict";
    function SpriteManager(game) {
        _class_call_check(this, SpriteManager);
        this.game = game;
        this.renderer = game.renderer;
    }
    _create_class(SpriteManager, [
        {
            key: "captureSprite",
            value: function captureSprite(objectToCapture, width, height, cameraPosition, lookAtPosition) {
                var scene = new THREE.Scene();
                // Basic lighting for the sprite capture scene
                var ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
                scene.add(ambientLight);
                var directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
                directionalLight.position.set(5, 10, 7.5);
                scene.add(directionalLight);
                // Clone the object to avoid affecting the original
                var clone = objectToCapture.clone();
                // Ensure all renderable parts of the clone are visible for capture
                clone.traverse(function(node) {
                    // Make standard renderable types visible.
                    // Groups' visibility is implicit if their children are visible.
                    if (node.isMesh || node.isSprite || node.isPoints || node.isLine) {
                        node.visible = true;
                    }
                });
                scene.add(clone);
                // Determine object size to frame it properly with an orthographic camera
                var box = new THREE.Box3().setFromObject(clone);
                var size = box.getSize(new THREE.Vector3());
                var center = box.getCenter(new THREE.Vector3());
                // Adjust lookAtPosition to be the center of the cloned object
                // and cameraPosition to be relative to this center if desired.
                // For simplicity now, we assume cameraPosition is absolute and lookAtPosition is provided or is object center.
                var effectiveLookAt = lookAtPosition || center;
                var aspect = width / height;
                // Orthographic camera setup
                // The values for left, right, top, bottom should encompass the object.
                // We'll use a fixed frustum height and calculate width based on aspect.
                // This might need tweaking based on typical object sizes and desired zoom.
                var orthoHeight = Math.max(size.x / aspect, size.y, size.z) * 1.5; // Increased padding
                var orthoWidth = orthoHeight * aspect;
                var camera = new THREE.OrthographicCamera(orthoWidth / -2, orthoWidth / 2, orthoHeight / 2, orthoHeight / -2, 0.1, 1000);
                camera.position.copy(cameraPosition);
                camera.lookAt(effectiveLookAt); // Look at the center of the cloned object
                scene.add(camera);
                var renderTarget = new THREE.WebGLRenderTarget(width, height, {
                    format: THREE.RGBAFormat,
                    type: THREE.UnsignedByteType
                });
                var originalRenderTarget = this.renderer.getRenderTarget();
                var originalClearColor = this.renderer.getClearColor(new THREE.Color());
                var originalClearAlpha = this.renderer.getClearAlpha();
                this.renderer.setRenderTarget(renderTarget);
                this.renderer.setClearColor(0x000000, 0); // Transparent background
                this.renderer.clear();
                this.renderer.render(scene, camera);
                // Restore original renderer state
                this.renderer.setRenderTarget(originalRenderTarget);
                this.renderer.setClearColor(originalClearColor, originalClearAlpha);
                // Read pixels and create data URL
                var buffer = new Uint8Array(width * height * 4);
                this.renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, buffer);
                // Flip the image data vertically
                var bytesPerRow = width * 4;
                var flippedBuffer = new Uint8Array(width * height * 4);
                for(var y = 0; y < height; y++){
                    var srcRowIndex = y;
                    var destRowIndex = height - 1 - y;
                    var srcOffset = srcRowIndex * bytesPerRow;
                    var destOffset = destRowIndex * bytesPerRow;
                    for(var x = 0; x < bytesPerRow; x++){
                        flippedBuffer[destOffset + x] = buffer[srcOffset + x];
                    }
                }
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var context = canvas.getContext('2d');
                var imageData = new ImageData(new Uint8ClampedArray(flippedBuffer.buffer), width, height);
                context.putImageData(imageData, 0, 0);
                var dataURL = canvas.toDataURL('image/png');
                // Clean up
                renderTarget.dispose();
                // scene.traverse(child => { // Basic cleanup
                //     if (child.geometry) child.geometry.dispose();
                //     if (child.material) {
                //         if (Array.isArray(child.material)) {
                //             child.material.forEach(m => m.dispose());
                //         } else {
                //             child.material.dispose();
                //         }
                //     }
                // });
                // More thorough cleanup of the cloned object might be needed if it has complex shared resources
                // For now, this should be okay for a test.
                return dataURL;
            }
        },
        {
            key: "captureAngledSprites",
            value: function captureAngledSprites(objectToCapture, width, height, distance) {
                var _this = this;
                var sprites = {};
                var objectCenter = new THREE.Box3().setFromObject(objectToCapture).getCenter(new THREE.Vector3());
                // Define angles and their corresponding camera position logic
                // Angles are in degrees, will be converted to radians
                // Camera looks at the object's center from a specified distance
                var angles = [
                    {
                        name: 'front',
                        angle: 180
                    },
                    {
                        name: 'front_right',
                        angle: 135
                    },
                    {
                        name: 'right',
                        angle: 90
                    },
                    {
                        name: 'back_right',
                        angle: 45
                    },
                    {
                        name: 'back',
                        angle: 0
                    },
                    {
                        name: 'back_left',
                        angle: -45
                    },
                    {
                        name: 'left',
                        angle: -90
                    },
                    {
                        name: 'front_left',
                        angle: -135
                    }
                ];
                // A fixed vertical offset for the camera to look slightly down or straight
                // Let's try a more pronounced angle, like looking down from ~30-45 degrees.
                // If distance is the hypotenuse, and we want angle 'alpha' from horizontal:
                // cameraVerticalOffset (opposite) = distance * sin(alpha)
                // For 30 degrees, sin(30) = 0.5. For 45 degrees, sin(45) = ~0.707
                var cameraVerticalOffset = distance * 0.6; // Aiming for something between 30 and 45 deg pitch
                angles.forEach(function(config) {
                    var angleRad = THREE.MathUtils.degToRad(config.angle);
                    // Calculate camera position: on a circle around the object
                    var cameraX = objectCenter.x + distance * Math.sin(angleRad);
                    var cameraZ = objectCenter.z + distance * Math.cos(angleRad);
                    var cameraY = objectCenter.y + cameraVerticalOffset;
                    var cameraPosition = new THREE.Vector3(cameraX, cameraY, cameraZ);
                    // The lookAtPosition is always the center of the object for orthographic projection consistency
                    var lookAtPosition = objectCenter.clone();
                    console.log("Capturing ".concat(config.name, " view: Cam Pos ").concat(cameraPosition.toArray().map(function(p) {
                        return p.toFixed(2);
                    }), ", LookAt ").concat(lookAtPosition.toArray().map(function(p) {
                        return p.toFixed(2);
                    })));
                    sprites[config.name] = _this.captureSprite(objectToCapture, width, height, cameraPosition, lookAtPosition);
                });
                return sprites;
            }
        },
        {
            key: "createAngledSpriteSheet",
            value: function createAngledSpriteSheet(objectToCapture, spriteWidth, spriteHeight, distance) {
                var _this = this;
                return _async_to_generator(function() {
                    var angledSpritesData, spriteNames, numSprites, sheetWidth, sheetHeight, sheetCanvas, sheetCtx, mapping, currentX, loadImageAndDraw, i, name, dataURL, img, error, sheetDataURL;
                    return _ts_generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                angledSpritesData = _this.captureAngledSprites(objectToCapture, spriteWidth, spriteHeight, distance);
                                spriteNames = Object.keys(angledSpritesData);
                                numSprites = spriteNames.length;
                                if (numSprites === 0) {
                                    return [
                                        2,
                                        {
                                            sheetDataURL: null,
                                            mapping: {}
                                        }
                                    ];
                                }
                                // For now, arrange sprites in a single row
                                sheetWidth = spriteWidth * numSprites;
                                sheetHeight = spriteHeight;
                                sheetCanvas = document.createElement('canvas');
                                sheetCanvas.width = sheetWidth;
                                sheetCanvas.height = sheetHeight;
                                sheetCtx = sheetCanvas.getContext('2d');
                                mapping = {};
                                currentX = 0;
                                // Helper function to load an image and draw it
                                loadImageAndDraw = function(src) {
                                    return new Promise(function(resolve, reject) {
                                        var img = new Image();
                                        img.onload = function() {
                                            return resolve(img);
                                        };
                                        img.onerror = reject;
                                        img.src = src;
                                    });
                                };
                                i = 0;
                                _state.label = 1;
                            case 1:
                                if (!(i < numSprites)) return [
                                    3,
                                    6
                                ];
                                name = spriteNames[i];
                                dataURL = angledSpritesData[name];
                                _state.label = 2;
                            case 2:
                                _state.trys.push([
                                    2,
                                    4,
                                    ,
                                    5
                                ]);
                                return [
                                    4,
                                    loadImageAndDraw(dataURL)
                                ];
                            case 3:
                                img = _state.sent();
                                sheetCtx.drawImage(img, currentX, 0, spriteWidth, spriteHeight);
                                mapping[name] = {
                                    x: currentX,
                                    y: 0,
                                    width: spriteWidth,
                                    height: spriteHeight
                                };
                                currentX += spriteWidth;
                                return [
                                    3,
                                    5
                                ];
                            case 4:
                                error = _state.sent();
                                console.error("Error loading sprite image for ".concat(name, ":"), error);
                                // Add a placeholder or skip this sprite
                                mapping[name] = {
                                    error: 'Failed to load'
                                };
                                currentX += spriteWidth; // Still advance X to keep layout consistent
                                return [
                                    3,
                                    5
                                ];
                            case 5:
                                i++;
                                return [
                                    3,
                                    1
                                ];
                            case 6:
                                sheetDataURL = sheetCanvas.toDataURL('image/png');
                                return [
                                    2,
                                    {
                                        sheetDataURL: sheetDataURL,
                                        mapping: mapping
                                    }
                                ];
                        }
                    });
                })();
            }
        }
    ]);
    return SpriteManager;
}();
