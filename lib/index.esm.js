import React, { useEffect } from 'react';
import { PerspectiveCamera, Vector3, Vector2, Spherical, Quaternion } from 'three';
import { useFrame } from '@react-three/fiber';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

var EPSILON = 0.000001;
var STATE = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
};
function createControls() {
    var scope = {
        camera: new PerspectiveCamera(75, 0, 0.1, 1000),
        enabled: true,
        target: new Vector3(),
        state: STATE.NONE,
        minDistance: 0,
        maxDistance: Infinity,
        minZoom: 0,
        maxZoom: Infinity,
        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to PI radians.
        minPolarAngle: 0,
        maxPolarAngle: Math.PI,
        // How far you can orbit horizontally, upper and lower limits.
        // If set, the interval [min, max] must be a sub-interval of
        // [-2 PI, 2 PI], with (max - min < 2 PI)
        minAzimuthAngle: -Infinity,
        maxAzimuthAngle: Infinity,
        // inertia
        dampingFactor: 0.05,
        enableZoom: true,
        zoomSpeed: 1.0,
        enableRotate: true,
        rotateSpeed: 1.0,
        enablePan: true,
        panSpeed: 1.0,
        height: 0,
        width: 0,
        onChange: function (event) { }
    };
    var internals = {
        pointers: [],
        pointerPositions: {},
        rotateStart: new Vector2(),
        rotateEnd: new Vector2(),
        rotateDelta: new Vector2(),
        dollyStart: new Vector2(),
        dollyEnd: new Vector2(),
        dollyDelta: new Vector2(),
        panStart: new Vector2(),
        panEnd: new Vector2(),
        panDelta: new Vector2(),
        panOffset: new Vector3(),
        spherical: new Spherical(),
        sphericalDelta: new Spherical(),
        scale: 1,
        zoomChanged: false
    };
    var functions = {
        addPointer: function (event) {
            internals.pointers.push(event);
        },
        removePointer: function (event) {
            delete internals.pointerPositions[event.nativeEvent.identifier];
            for (var i = 0; i < internals.pointers.length; i++) {
                if (internals.pointers[i].nativeEvent.identifier === event.nativeEvent.identifier) {
                    internals.pointers.splice(i, 1);
                    return;
                }
            }
        },
        trackPointer: function (event) {
            var position = internals.pointerPositions[event.nativeEvent.identifier];
            if (position === undefined) {
                position = new Vector2();
                internals.pointerPositions[event.nativeEvent.identifier] = position;
            }
            position.set(event.nativeEvent.locationX, event.nativeEvent.locationY);
        },
        getSecondPointerPosition: function (event) {
            var pointer = event.nativeEvent.identifier === internals.pointers[0].nativeEvent.identifier
                ? internals.pointers[1]
                : internals.pointers[0];
            return internals.pointerPositions[pointer.nativeEvent.identifier];
        },
        handleTouchStartRotate: function () {
            if (internals.pointers.length == 1) {
                internals.rotateStart.set(internals.pointers[0].nativeEvent.locationX, internals.pointers[0].nativeEvent.locationY);
            }
            else {
                var x = 0.5 * (internals.pointers[0].nativeEvent.locationX + internals.pointers[1].nativeEvent.locationX);
                var y = 0.5 * (internals.pointers[0].nativeEvent.locationY + internals.pointers[1].nativeEvent.locationY);
                internals.rotateStart.set(x, y);
            }
        },
        handleTouchStartDolly: function () {
            var dx = internals.pointers[0].nativeEvent.locationX - internals.pointers[1].nativeEvent.locationX;
            var dy = internals.pointers[0].nativeEvent.locationY - internals.pointers[1].nativeEvent.locationY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            internals.dollyStart.set(0, distance);
        },
        handleTouchStartPan: function () {
            if (internals.pointers.length === 1) {
                internals.panStart.set(internals.pointers[0].nativeEvent.locationX, internals.pointers[0].nativeEvent.locationY);
            }
            else {
                var x = 0.5 * (internals.pointers[0].nativeEvent.locationX + internals.pointers[1].nativeEvent.locationX);
                var y = 0.5 * (internals.pointers[0].nativeEvent.locationY + internals.pointers[1].nativeEvent.locationY);
                internals.panStart.set(x, y);
            }
        },
        handleTouchStartDollyPan: function () {
            if (scope.enableZoom)
                this.handleTouchStartDolly();
            if (scope.enablePan)
                this.handleTouchStartPan();
        },
        onTouchStart: function (event) {
            this.trackPointer(event);
            switch (internals.pointers.length) {
                case 1:
                    if (!scope.enableRotate)
                        return;
                    this.handleTouchStartRotate();
                    scope.state = STATE.TOUCH_ROTATE;
                    break;
                case 2:
                    if (!scope.enableZoom && !scope.enablePan)
                        return;
                    this.handleTouchStartDollyPan();
                    scope.state = STATE.TOUCH_DOLLY_PAN;
                    break;
                default:
                    scope.state = STATE.NONE;
            }
        },
        rotateLeft: function (angle) {
            internals.sphericalDelta.theta -= angle;
        },
        rotateUp: function (angle) {
            internals.sphericalDelta.phi -= angle;
        },
        handleTouchMoveRotate: function (event) {
            if (internals.pointers.length === 1) {
                internals.rotateEnd.set(event.nativeEvent.locationX, event.nativeEvent.locationY);
            }
            else {
                var position = this.getSecondPointerPosition(event);
                var x = 0.5 * (event.nativeEvent.locationX + position.x);
                var y = 0.5 * (event.nativeEvent.locationY + position.y);
                internals.rotateEnd.set(x, y);
            }
            internals.rotateDelta
                .subVectors(internals.rotateEnd, internals.rotateStart)
                .multiplyScalar(scope.rotateSpeed);
            // yes, height
            this.rotateLeft((2 * Math.PI * internals.rotateDelta.x) / scope.height);
            this.rotateUp((2 * Math.PI * internals.rotateDelta.y) / scope.height);
            internals.rotateStart.copy(internals.rotateEnd);
        },
        dollyOut: function (dollyScale) {
            internals.scale /= dollyScale;
        },
        handleTouchMoveDolly: function (event) {
            var position = this.getSecondPointerPosition(event);
            var dx = event.nativeEvent.locationX - position.x;
            var dy = event.nativeEvent.locationY - position.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            internals.dollyEnd.set(0, distance);
            internals.dollyDelta.set(0, Math.pow(internals.dollyEnd.y / internals.dollyStart.y, scope.zoomSpeed));
            this.dollyOut(internals.dollyDelta.y);
            internals.dollyStart.copy(internals.dollyEnd);
        },
        panLeft: function (distance, objectMatrix) {
            var v = new Vector3();
            v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
            v.multiplyScalar(-distance);
            internals.panOffset.add(v);
        },
        panUp: function (distance, objectMatrix) {
            var v = new Vector3();
            v.setFromMatrixColumn(objectMatrix, 1);
            v.multiplyScalar(distance);
            internals.panOffset.add(v);
        },
        pan: function (deltaX, deltaY) {
            var position = scope.camera.position;
            var targetDistance = position.clone().sub(scope.target).length();
            // half of the fov is center to top of screen
            targetDistance *= Math.tan(((scope.camera.fov / 2) * Math.PI) / 180.0);
            // we use only clientHeight here so aspect ratio does not distort speed
            this.panLeft((2 * deltaX * targetDistance) / scope.height, scope.camera.matrix);
            this.panUp((2 * deltaY * targetDistance) / scope.height, scope.camera.matrix);
        },
        handleTouchMovePan: function (event) {
            if (internals.pointers.length === 1) {
                internals.panEnd.set(event.nativeEvent.locationX, event.nativeEvent.locationY);
            }
            else {
                var position = this.getSecondPointerPosition(event);
                var x = 0.5 * (event.nativeEvent.locationX + position.x);
                var y = 0.5 * (event.nativeEvent.locationY + position.y);
                internals.panEnd.set(x, y);
            }
            internals.panDelta
                .subVectors(internals.panEnd, internals.panStart)
                .multiplyScalar(scope.panSpeed);
            this.pan(internals.panDelta.x, internals.panDelta.y);
            internals.panStart.copy(internals.panEnd);
        },
        handleTouchMoveDollyPan: function (event) {
            if (scope.enableZoom)
                this.handleTouchMoveDolly(event);
            if (scope.enablePan)
                this.handleTouchMovePan(event);
        },
        handleTouchMoveDollyRotate: function (event) {
            if (scope.enableZoom)
                this.handleTouchMoveDolly(event);
            if (scope.enableRotate)
                this.handleTouchMoveRotate(event);
        },
        onTouchMove: function (event) {
            this.trackPointer(event);
            switch (scope.state) {
                case STATE.TOUCH_ROTATE:
                    if (!scope.enableRotate)
                        return;
                    this.handleTouchMoveRotate(event);
                    this.update();
                    break;
                case STATE.TOUCH_PAN:
                    if (!scope.enablePan)
                        return;
                    this.handleTouchMovePan(event);
                    this.update();
                    break;
                case STATE.TOUCH_DOLLY_PAN:
                    if (!scope.enableZoom && !scope.enablePan)
                        return;
                    this.handleTouchMoveDollyPan(event);
                    this.update();
                    break;
                case STATE.TOUCH_DOLLY_ROTATE:
                    if (!scope.enableZoom && !scope.enableRotate)
                        return;
                    this.handleTouchMoveDollyRotate(event);
                    this.update();
                    break;
                default:
                    scope.state = STATE.NONE;
            }
        }
    };
    var update = (function () {
        // so camera.up is the orbit axis
        var quat = new Quaternion().setFromUnitVectors(scope.camera.up, new Vector3(0, 1, 0));
        var quatInverse = quat.clone().invert();
        var lastPosition = new Vector3();
        var lastQuaternion = new Quaternion();
        var twoPI = 2 * Math.PI;
        var position = scope.camera.position;
        return function () {
            var offset = position.clone().sub(scope.target);
            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);
            // angle from z-axis around y-axis
            internals.spherical.setFromVector3(offset);
            internals.spherical.theta +=
                internals.sphericalDelta.theta * scope.dampingFactor;
            internals.spherical.phi +=
                internals.sphericalDelta.phi * scope.dampingFactor;
            // restrict theta to be between desired limits
            var min = scope.minAzimuthAngle;
            var max = scope.maxAzimuthAngle;
            if (isFinite(min) && isFinite(max)) {
                if (min < -Math.PI)
                    min += twoPI;
                else if (min > Math.PI)
                    min -= twoPI;
                if (max < -Math.PI)
                    max += twoPI;
                else if (max > Math.PI)
                    max -= twoPI;
                if (min <= max) {
                    internals.spherical.theta = Math.max(min, Math.min(max, internals.spherical.theta));
                }
                else {
                    internals.spherical.theta =
                        internals.spherical.theta > (min + max) / 2
                            ? Math.max(min, internals.spherical.theta)
                            : Math.min(max, internals.spherical.theta);
                }
            }
            // restrict phi to be between desired limits
            internals.spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, internals.spherical.phi));
            internals.spherical.makeSafe();
            internals.spherical.radius *= internals.scale;
            // restrict radius to be between desired limits
            internals.spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, internals.spherical.radius));
            // move target to panned location
            scope.target.addScaledVector(internals.panOffset, scope.dampingFactor);
            offset.setFromSpherical(internals.spherical);
            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);
            position.copy(scope.target).add(offset);
            scope.camera.lookAt(scope.target);
            internals.sphericalDelta.theta *= 1 - scope.dampingFactor;
            internals.sphericalDelta.phi *= 1 - scope.dampingFactor;
            internals.panOffset.multiplyScalar(1 - scope.dampingFactor);
            internals.scale = 1;
            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8
            if (internals.zoomChanged ||
                lastPosition.distanceToSquared(scope.camera.position) > EPSILON ||
                8 * (1 - lastQuaternion.dot(scope.camera.quaternion)) > EPSILON) {
                scope.onChange(scope);
                lastPosition.copy(scope.camera.position);
                lastQuaternion.copy(scope.camera.quaternion);
                internals.zoomChanged = false;
            }
        };
    })();
    return {
        scope: scope,
        functions: __assign(__assign({}, functions), { update: update }),
        events: {
            onLayout: function (event) {
            },
            onStartShouldSetResponder: function (event) {
                if (!scope.enabled)
                    return;
                functions.addPointer(event);
                functions.onTouchStart(event);
                // See https://reactnative.dev/docs/gesture-responder-system
                return true;
            },
            onResponderReject: function (event) {
                functions.removePointer(event);
            },
            onResponderMove: function (event) {
                if (scope.enabled && internals.pointers.length > 0) {
                    functions.onTouchMove(event);
                }
            },
            onResponderRelease: function (event) {
                functions.removePointer(event);
                scope.state = STATE.NONE;
            }
        }
    };
}

function OrbitControls(_a) {
    var controls = _a.controls, props = __rest(_a, ["controls"]);
    useEffect(function () {
        for (var prop in props) {
            controls.scope[prop] =
                props[prop];
        }
    }, [props]);
    useFrame(controls.functions.update, -1);
    return null;
}
function useControls() {
    var controls = createControls();
    return [
        function (props) { return (React.createElement(OrbitControls, __assign({ controls: controls }, props))); },
        controls.events,
    ];
}

export { useControls as default };
