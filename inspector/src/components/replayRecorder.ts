import { PropertyChangedEvent } from './propertyChangedEvent';
import { Tools } from 'babylonjs/Misc/tools';

export class ReplayRecorder {
    private _recordedCodeLines: string[];
    private _previousObject: any;
    private _previousProperty: string;

    public reset() {
        this._recordedCodeLines = [];
        this._previousObject = null;
        this._previousProperty = "";
    }

    public record(event: PropertyChangedEvent) {
        if (!this._recordedCodeLines) {
            this._recordedCodeLines = [];
        }

        if (this._previousObject === event.object && this._previousProperty === event.property) {
            this._recordedCodeLines.pop();
        }

        let value = event.value;

        if (value.w !== undefined) { // Quaternion
            value = `new BABYLON.Quaternion(${value.x}, ${value.y}, ${value.z}, ${value.w})`;
        } else if (value.z !== undefined) { // Vector3
            value = `new BABYLON.Vector3(${value.x}, ${value.y}, ${value.z})`;
        } else if (value.y !== undefined) { // Vector2
            value = `new BABYLON.Vector2(${value.x}, ${value.y})`;
        } else if (value.a !== undefined) { // Color4
            value = `new BABYLON.Color4(${value.r}, ${value.g}, ${value.b}, ${value.a})`;
        } else if (value.b !== undefined) { // Color3
            value = `new BABYLON.Color3(${value.r}, ${value.g}, ${value.b})`;
        }

        let target = event.object.getClassName().toLowerCase();

        if (event.object.id) {
            if (target === "Scene") {
                target = `scene`;
            } else if (target.indexOf("camera") > -1) {
                target = `scene.getCameraByID("${event.object.id}")`;
            } else if (target.indexOf("mesh") > -1) {
                target = `scene.getMeshByID("${event.object.id}")`;
            } else if (target.indexOf("light") > -1) {
                target = `scene.getLightByID("${event.object.id}")`;
            } else if (target === "transformnode") {
                target = `scene.getTransformNodeByID("${event.object.id}")`;
            } else if (target === "skeleton") {
                target = `scene.getSkeletonById("${event.object.id}")`;
            } else if (target.indexOf("material") > -1) {
                target = `scene.getMaterialByID("${event.object.id}")`;
            }
        }

        this._recordedCodeLines.push(`${target}.${event.property} = ${value};`);

        this._previousObject = event.object;
        this._previousProperty = event.property;
    }

    public export() {
        let content = "// Code generated by babylon.js Inspector\r\n// Please keep in mind to define the 'scene' variable before using that code\r\n\r\n";

        if (this._recordedCodeLines) {
            content += this._recordedCodeLines.join("\r\n");
        }

        Tools.Download(new Blob([content]), "pseudo-code.txt");
    }
}