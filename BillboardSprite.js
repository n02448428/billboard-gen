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
import * as THREE from 'three';
export var BillboardSprite = /*#__PURE__*/ function() {
    "use strict";
    function BillboardSprite(spriteSheetPath, mappingData, initialFrameName, frameWidth, frameHeight) {
        var _this = this;
        var spriteScale = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : 1;
        _class_call_check(this, BillboardSprite);
        this.mappingData = mappingData;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.spriteScale = spriteScale;
        this.texture = new THREE.TextureLoader().load(spriteSheetPath, function(texture) {
            // Configure texture properties once loaded
            texture.magFilter = THREE.LinearFilter; // Smoother look for magnification
            texture.minFilter = THREE.LinearMipmapLinearFilter; // Smoother look with mipmaps for minification
            _this.sheetWidth = texture.image.width;
            _this.sheetHeight = texture.image.height;
            _this.updateFrame(_this.initialFrameName); // Set initial frame once texture is loaded
        });
        this.initialFrameName = initialFrameName; // Store for use in texture load callback
        // Material will use the texture. Transparent background is key.
        this.material = new THREE.MeshBasicMaterial({
            map: this.texture,
            transparent: true,
            alphaTest: 0.5,
            side: THREE.DoubleSide
        });
        // Geometry for the sprite plane
        // The size of the plane will be scaled based on spriteScale
        var planeWidth = this.frameWidth / this.frameHeight * this.spriteScale;
        var planeHeight = this.spriteScale;
        this.geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.y = planeHeight / 2; // Pivot at the bottom center
    }
    _create_class(BillboardSprite, [
        {
            key: "updateFrame",
            value: function updateFrame(frameName) {
                if (!this.mappingData[frameName] || !this.sheetWidth || !this.sheetHeight) {
                    console.warn('Frame "'.concat(frameName, '" not found in mapping data or sheet dimensions not set.'));
                    return;
                }
                var frameInfo = this.mappingData[frameName];
                // Calculate UV coordinates for the specific frame
                // map.offset is the bottom-left corner of the UV rectangle
                // map.repeat is the size of the UV rectangle
                // How many times the single frame (frameWidth/Height) fits into the sheet
                this.material.map.repeat.set(this.frameWidth / this.sheetWidth, this.frameHeight / this.sheetHeight);
                // Offset to the specific frame. UV origin is bottom-left.
                // mappingData.x, y is top-left of frame on sheet.
                this.material.map.offset.set(frameInfo.x / this.sheetWidth, (this.sheetHeight - frameInfo.y - this.frameHeight) / this.sheetHeight // Adjust Y for bottom-left origin
                );
                this.material.needsUpdate = true; // Important for texture changes
            }
        },
        {
            // Simple billboarding: make the sprite face the camera
            key: "update",
            value: function update(camera) {
                if (this.mesh) {
                    // Option 1: Simple lookAt (can cause flipping if camera goes directly above/below)
                    // this.mesh.lookAt(camera.position);
                    // Option 2: Copy camera's rotation (more stable billboarding)
                    // This makes the sprite parallel to the camera's view plane.
                    // We only want to billboard around the Y-axis typically for characters.
                    var camPos = new THREE.Vector3();
                    camera.getWorldPosition(camPos);
                    // Full billboarding: make the sprite plane directly face the camera.
                    // The mesh's local -Z axis will point towards the camera.
                    // Its local Y axis will attempt to align with its 'up' vector (typically world +Y),
                    // which helps maintain a consistent orientation.
                    this.mesh.lookAt(camPos);
                }
            }
        },
        {
            // Add to scene or parent object
            key: "addTo",
            value: function addTo(parent) {
                parent.add(this.mesh);
            }
        },
        {
            // Remove from scene or parent object
            key: "removeFrom",
            value: function removeFrom(parent) {
                parent.remove(this.mesh);
            }
        },
        {
            key: "dispose",
            value: function dispose() {
                if (this.geometry) this.geometry.dispose();
                if (this.material) {
                    if (this.material.map) this.material.map.dispose();
                    this.material.dispose();
                }
            // Texture is loaded globally by TextureLoader, generally managed by THREE.js cache
            // but if created uniquely, dispose it:
            // if (this.texture) this.texture.dispose();
            }
        }
    ]);
    return BillboardSprite;
}();
