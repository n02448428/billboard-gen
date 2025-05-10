# 3D Model to Billboard Sprite Utility for Three.js

This utility provides a way to capture a 3D model from various angles, generate a spritesheet, and then render it in a Three.js scene as a billboard sprite that always faces the camera. This is useful for level-of-detail (LOD) systems, representing complex objects as sprites at a distance, or for 2D characters/objects in a 3D world.

## Features

*   **Sprite Capture**: Captures a `THREE.Object3D` from 8 different angles (front, back, left, right, and diagonals).
*   **Spritesheet Generation**: Combines captured sprites into a single spritesheet image (PNG DataURL).
*   **Frame Mapping**: Generates a mapping object describing the position and size of each sprite frame within the spritesheet.
*   **Billboard Rendering**: Displays the selected sprite frame on a plane that always faces the camera.
*   **Frame Animation**: Allows dynamically changing the displayed sprite frame.

## Files Included

*   `SpriteManager.js`: Contains the `SpriteManager` class responsible for capturing 3D objects and generating spritesheets.
*   `BillboardSprite.js`: Contains the `BillboardSprite` class for creating and managing individual billboarded sprites using a spritesheet.

## Dependencies

*   **Three.js**: This utility is built for and depends on the Three.js library. Ensure you have Three.js (r125+ recommended for ES6 module compatibility, though the provided code uses features common in recent versions) included in your project.

## Core Concepts

### 1. Sprite Generation (`SpriteManager.js`)

The `SpriteManager` class handles the process of taking a 3D `THREE.Object3D` and rendering it from multiple angles to create 2D images.

*   `captureAngledSprites(objectToCapture, width, height, distance)`:
    *   Takes the 3D object, desired width/height for each sprite, and a camera distance.
    *   Renders the object from 8 predefined angles (e.g., 'front', 'front_left', 'left', etc.).
    *   Returns an object where keys are angle names (e.g., `front`) and values are DataURLs of the captured PNG images.
*   `createAngledSpriteSheet(objectToCapture, spriteWidth, spriteHeight, distance)`:
    *   Uses `captureAngledSprites` to get individual sprite images.
    *   Draws these images onto a new canvas to create a single spritesheet.
    *   Returns an object:
        *   `sheetDataURL`: A DataURL of the complete spritesheet image.
        *   `mapping`: An object detailing the `x, y, width, height` of each named frame on the spritesheet.

### 2. Billboard Rendering & Animation (`BillboardSprite.js`)

The `BillboardSprite` class takes a spritesheet (as a DataURL) and its mapping data to display a 2D sprite in a 3D scene.

*   `constructor(spriteSheetPath, mappingData, initialFrameName, frameWidth, frameHeight, spriteScale = 1)`:
    *   `spriteSheetPath`: The DataURL of the spritesheet.
    *   `mappingData`: The mapping object from `SpriteManager`.
    *   `initialFrameName`: The name of the frame to display initially (e.g., 'front').
    *   `frameWidth`, `frameHeight`: Dimensions of a single frame on the spritesheet.
    *   `spriteScale`: An optional overall scale for the billboard in world units.
*   `mesh`: A `THREE.Mesh` (a plane) that represents the billboard. You add this to your scene.
*   `updateFrame(frameName)`: Changes the displayed sprite to the one specified by `frameName`. It adjusts the texture UVs of the material.
*   `update(camera)`: Orients the `mesh` to face the provided `camera`. This should be called in your animation loop.
*   `addTo(parent)` / `removeFrom(parent)`: Helper methods to add/remove the sprite's mesh from a `THREE.Object3D` or `THREE.Scene`.
*   `dispose()`: Cleans up Three.js resources (geometry, material, texture map).

## Basic Usage

1.  **Include Files**: Add `SpriteManager.js` and `BillboardSprite.js` to your Three.js project and import them.

    ```javascript
    import { SpriteManager } from './SpriteManager.js';
    import { BillboardSprite } from './BillboardSprite.js';
    import * as THREE from 'three'; // Or your Three.js import path
    ```

2.  **Initialize SpriteManager**:

    ```javascript
    // Assuming 'game.renderer' is your THREE.WebGLRenderer instance
    const spriteManager = new SpriteManager({ renderer: yourRendererInstance });
    ```

3.  **Generate Spritesheet and Mapping**:
    This is typically done once, perhaps during an asset loading phase.

    ```javascript
    // Assuming 'your3DModel' is a THREE.Object3D you want to sprite
    // and it's already loaded and configured in a temporary scene if needed for capture.
    const spriteSize = 64; // pixels
    const captureDistance = 5; // world units

    async function generateSheet() {
        try {
            const { sheetDataURL, mapping } = await spriteManager.createAngledSpriteSheet(
                your3DModel,
                spriteSize,
                spriteSize,
                captureDistance
            );

            if (sheetDataURL) {
                // Now you have the sheetDataURL and mapping to create BillboardSprites
                console.log('Spritesheet generated!', mapping);
                return { sheetDataURL, mapping };
            }
        } catch (error) {
            console.error("Error generating spritesheet:", error);
        }
        return null;
    }

    // Call generateSheet and then use the result
    generateSheet().then(spriteAsset => {
        if (spriteAsset) {
            // Proceed to create BillboardSprite instances
            const billboard = new BillboardSprite(
                spriteAsset.sheetDataURL,
                spriteAsset.mapping,
                'front', // Initial frame
                spriteSize,
                spriteSize,
                2 // World scale of the billboard
            );
            yourScene.add(billboard.mesh);
            // Store billboard instance to update it in the game loop
            // e.g., yourGameObjects.push(billboard);
        }
    });
    ```

4.  **Instantiate `BillboardSprite`**:
    Use the `sheetDataURL` and `mapping` obtained from `SpriteManager`.

5.  **Add to Scene**:
    Add `billboard.mesh` to your Three.js scene.

6.  **Update in Animation Loop**:

    ```javascript
    function animate() {
        requestAnimationFrame(animate);

        // For each billboard instance:
        // billboard.updateFrame(determineSpriteFrameFor(billboard, camera)); // See section below
        // billboard.update(camera);

        yourRendererInstance.render(yourScene, camera);
    }
    ```

## Determining the Sprite Frame

The `BillboardSprite` needs to know which frame to display (e.g., 'front', 'back_left'). You'll need to implement logic in your project to determine the appropriate frame name based on the orientation of your billboarded object relative to the camera.

The `SpriteManager` captures sprites from these angles (relative to the object's local +Z axis pointing "away" from the camera during capture):
*   `front`: Object's local -Z axis (its "front") faces the capture camera.
*   `front_right`: Object is rotated 45 degrees clockwise, capture camera sees its front-right.
*   `right`: Object is rotated 90 degrees clockwise.
*   ...and so on for `back_right`, `back`, `back_left`, `left`, `front_left`.

To select the correct frame for display:

1.  Get the **kart's forward direction** in world space.
2.  Get the **direction from the kart to the game camera** in world space.
3.  Calculate the **angle** between these two vectors (typically on the XZ plane).
4.  Map this angle to one of the 8 sprite frame names.

**Example Logic (Conceptual - adapt to your needs):**

```javascript
function determineSpriteFrame(object, camera) {
    const objectForward = new THREE.Vector3(0, 0, -1); // Assuming local -Z is forward
    objectForward.applyQuaternion(object.quaternion); // Transform to world space
    objectForward.y = 0; // Project to XZ plane
    objectForward.normalize();

    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition);

    const toCamera = new THREE.Vector3().subVectors(cameraPosition, object.position);
    toCamera.y = 0; // Project to XZ plane
    toCamera.normalize();

    let angle = Math.acos(objectForward.dot(toCamera)); // Angle in radians (0 to PI)
    const cross = new THREE.Vector3().crossVectors(objectForward, toCamera);
    if (cross.y < 0) { // If cross.y is negative, camera is to the right of object's forward
        angle = -angle; // Angle becomes -PI to 0
    }

    const angleDeg = THREE.MathUtils.radToDeg(angle); // -180 to 180 degrees

    // Map angleDeg to sprite frame names
    // Note: The 'front' sprite is when the object's "face" (-Z) points towards the capture camera.
    // If angleDeg is ~0, the game camera is BEHIND the object, so we want to show the object's "back" sprite.
    // If angleDeg is ~180 or ~-180, game camera is IN FRONT of object, show object's "front" sprite.

    if (angleDeg >= -22.5 && angleDeg < 22.5) return 'back';        // Camera is behind object
    if (angleDeg >= 22.5 && angleDeg < 67.5) return 'back_left';    // etc.
    if (angleDeg >= 67.5 && angleDeg < 112.5) return 'left';
    if (angleDeg >= 112.5 && angleDeg < 157.5) return 'front_left';
    if (angleDeg >= 157.5 || angleDeg < -157.5) return 'front';     // Camera is in front of object
    if (angleDeg >= -157.5 && angleDeg < -112.5) return 'front_right';
    if (angleDeg >= -112.5 && angleDeg < -67.5) return 'right';
    if (angleDeg >= -67.5 && angleDeg < -22.5) return 'back_right';

    return 'front'; // Default
}
