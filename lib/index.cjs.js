'use strict';

var React = require('react');
var three = require('three');
var native = require('@react-three/fiber/native');

/******************************************************************************
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
/* global Reflect, Promise */


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
    NONE: 0,
    ROTATE: 1,
    DOLLY: 2,
};
var partialScope = {
    camera: undefined,
    enabled: true,
    target: new three.Vector3(),
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
};
function createControls() {
    var height = 0;
    var scope = __assign(__assign({}, partialScope), { onChange: function (event) { } });
    var internals = {
        rotateStart: new three.Vector2(),
        rotateEnd: new three.Vector2(),
        rotateDelta: new three.Vector2(),
        dollyStart: 0,
        dollyEnd: 0,
        panStart: new three.Vector2(),
        panEnd: new three.Vector2(),
        panDelta: new three.Vector2(),
        panOffset: new three.Vector3(),
        spherical: new three.Spherical(),
        sphericalDelta: new three.Spherical(),
        scale: 1,
        state: STATE.NONE,
    };
    var functions = {
        handleTouchStartRotate: function (event) {
            if (event.nativeEvent.touches.length === 1) {
                internals.rotateStart.set(event.nativeEvent.touches[0].locationX, event.nativeEvent.touches[0].locationY);
            }
            else if (event.nativeEvent.touches.length === 2) {
                var x = 0.5 *
                    (event.nativeEvent.touches[0].locationX +
                        event.nativeEvent.touches[1].locationX);
                var y = 0.5 *
                    (event.nativeEvent.touches[0].locationY +
                        event.nativeEvent.touches[1].locationY);
                internals.rotateStart.set(x, y);
            }
        },
        handleTouchStartDolly: function (event) {
            // Ensures this isn't undefined.
            if (event.nativeEvent.touches.length === 2) {
                var dx = event.nativeEvent.touches[0].locationX -
                    event.nativeEvent.touches[1].locationX;
                var dy = event.nativeEvent.touches[0].locationY -
                    event.nativeEvent.touches[1].locationY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                internals.dollyStart = distance;
            }
        },
        handleTouchStartPan: function (event) {
            if (event.nativeEvent.touches.length === 1) {
                internals.panStart.set(event.nativeEvent.touches[0].locationX, event.nativeEvent.touches[0].locationY);
            }
            else if (event.nativeEvent.touches.length === 2) {
                var x = 0.5 *
                    (event.nativeEvent.touches[0].locationX +
                        event.nativeEvent.touches[1].locationX);
                var y = 0.5 *
                    (event.nativeEvent.touches[0].locationY +
                        event.nativeEvent.touches[1].locationY);
                internals.panStart.set(x, y);
            }
        },
        handleTouchStartDollyPan: function (event) {
            if (scope.enableZoom)
                this.handleTouchStartDolly(event);
            if (scope.enablePan)
                this.handleTouchStartPan(event);
        },
        onTouchStart: function (event) {
            switch (event.nativeEvent.touches.length) {
                case STATE.ROTATE:
                    if (!scope.enableRotate)
                        return;
                    this.handleTouchStartRotate(event);
                    internals.state = STATE.ROTATE;
                    break;
                case STATE.DOLLY:
                    if (!scope.enableZoom && !scope.enablePan)
                        return;
                    this.handleTouchStartDollyPan(event);
                    internals.state = STATE.DOLLY;
                    break;
                default:
                    internals.state = STATE.NONE;
            }
        },
        rotateLeft: function (angle) {
            internals.sphericalDelta.theta -= angle;
        },
        rotateUp: function (angle) {
            internals.sphericalDelta.phi -= angle;
        },
        handleTouchMoveRotate: function (event) {
            if (event.nativeEvent.touches.length === 1) {
                internals.rotateEnd.set(event.nativeEvent.locationX, event.nativeEvent.locationY);
            }
            else if (event.nativeEvent.touches.length === 2) {
                var x = 0.5 *
                    (event.nativeEvent.touches[0].locationX +
                        event.nativeEvent.touches[1].locationX);
                var y = 0.5 *
                    (event.nativeEvent.touches[0].locationY +
                        event.nativeEvent.touches[1].locationY);
                internals.rotateEnd.set(x, y);
            }
            internals.rotateDelta
                .subVectors(internals.rotateEnd, internals.rotateStart)
                .multiplyScalar(scope.rotateSpeed);
            // yes, height
            this.rotateLeft((2 * Math.PI * internals.rotateDelta.x) / height);
            this.rotateUp((2 * Math.PI * internals.rotateDelta.y) / height);
            internals.rotateStart.copy(internals.rotateEnd);
        },
        dollyOut: function (dollyScale) {
            internals.scale /= dollyScale;
        },
        handleTouchMoveDolly: function (event) {
            // Ensures this isn't undefined.
            if (event.nativeEvent.touches.length === 2) {
                var dx = event.nativeEvent.touches[0].locationX -
                    event.nativeEvent.touches[1].locationX;
                var dy = event.nativeEvent.touches[0].locationY -
                    event.nativeEvent.touches[1].locationY;
                var distance = Math.sqrt(dx * dx + dy * dy);
                internals.dollyEnd = distance;
                this.dollyOut(Math.pow(internals.dollyEnd / internals.dollyStart, scope.zoomSpeed));
                internals.dollyStart = internals.dollyEnd;
            }
        },
        panLeft: function (distance, objectMatrix) {
            var v = new three.Vector3();
            v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
            v.multiplyScalar(-distance);
            internals.panOffset.add(v);
        },
        panUp: function (distance, objectMatrix) {
            var v = new three.Vector3();
            v.setFromMatrixColumn(objectMatrix, 1);
            v.multiplyScalar(distance);
            internals.panOffset.add(v);
        },
        pan: function (deltaX, deltaY) {
            if (!scope.camera)
                return;
            var position = scope.camera.position;
            var targetDistance = position.clone().sub(scope.target).length();
            // half of the fov is center to top of screen
            targetDistance *= Math.tan(((scope.camera.fov / 2) * Math.PI) / 180.0);
            // we use only height here so aspect ratio does not distort speed
            this.panLeft((2 * deltaX * targetDistance) / height, scope.camera.matrix);
            this.panUp((2 * deltaY * targetDistance) / height, scope.camera.matrix);
        },
        handleTouchMovePan: function (event) {
            if (event.nativeEvent.touches.length === 1) {
                internals.panEnd.set(event.nativeEvent.locationX, event.nativeEvent.locationY);
            }
            else if (event.nativeEvent.touches.length === 2) {
                var x = 0.5 *
                    (event.nativeEvent.touches[0].locationX +
                        event.nativeEvent.touches[1].locationX);
                var y = 0.5 *
                    (event.nativeEvent.touches[0].locationY +
                        event.nativeEvent.touches[1].locationY);
                internals.panEnd.set(x, y);
            }
            else {
                return;
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
        onTouchMove: function (event) {
            switch (internals.state) {
                case STATE.ROTATE:
                    if (!scope.enableRotate)
                        return;
                    this.handleTouchMoveRotate(event);
                    update();
                    break;
                case STATE.DOLLY:
                    if (!scope.enableZoom && !scope.enablePan)
                        return;
                    this.handleTouchMoveDollyPan(event);
                    update();
                    break;
                default:
                    internals.state = STATE.NONE;
            }
        },
    };
    var update = (function () {
        var offset = new three.Vector3();
        var lastPosition = new three.Vector3();
        var lastQuaternion = new three.Quaternion();
        var twoPI = 2 * Math.PI;
        return function () {
            if (!scope.camera)
                return;
            var position = scope.camera.position;
            // so camera.up is the orbit axis
            var quat = new three.Quaternion().setFromUnitVectors(scope.camera.up, new three.Vector3(0, 1, 0));
            var quatInverse = quat.clone().invert();
            offset.copy(position).sub(scope.target);
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
            internals.spherical.phi = Math.max(scope.minPolarAngle + EPSILON, Math.min(scope.maxPolarAngle - EPSILON, internals.spherical.phi));
            internals.spherical.radius *= internals.scale;
            // restrict radius to be between desired limits
            internals.spherical.radius = Math.max(scope.minZoom, Math.min(scope.maxZoom, internals.spherical.radius));
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
            // min(camera displacement, camera rotation in radians)^2 > EPSILON
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8
            if (lastPosition.distanceToSquared(scope.camera.position) > EPSILON ||
                8 * (1 - lastQuaternion.dot(scope.camera.quaternion)) > EPSILON) {
                native.invalidate();
                scope.onChange({ target: scope });
                lastPosition.copy(scope.camera.position);
                lastQuaternion.copy(scope.camera.quaternion);
            }
        };
    })();
    return {
        scope: scope,
        functions: __assign(__assign({}, functions), { update: update }),
        events: {
            // Equivalent to componentDidMount.
            onLayout: function (event) {
                height = event.nativeEvent.layout.height;
            },
            // See https://reactnative.dev/docs/gesture-responder-system
            onStartShouldSetResponder: function (event) {
                // On some devices this fires only for 2+ touches.
                if (!scope.enabled)
                    return false;
                functions.onTouchStart(event);
                return true;
            },
            onMoveShouldSetResponder: function (event) {
                // And on the same devices this fires only for 1 touch.
                if (!scope.enabled)
                    return false;
                functions.onTouchStart(event);
                return true;
            },
            onResponderMove: function (event) {
                if (internals.state !== event.nativeEvent.touches.length) {
                    functions.onTouchStart(event);
                }
                functions.onTouchMove(event);
            },
            onResponderRelease: function () {
                internals.state = STATE.NONE;
            },
        },
    };
}

function OrbitControls(_a) {
    var controls = _a.controls, props = __rest(_a, ["controls"]);
    var camera = native.useThree(function (state) { return state.camera; });
    React.useEffect(function () {
        if (camera.isPerspectiveCamera) {
            controls.scope.camera = camera;
        }
        else {
            throw new Error("The camera must be a PerspectiveCamera to orbit controls work");
        }
    }, [camera]);
    React.useEffect(function () {
        for (var prop in props) {
            controls.scope[prop] =
                props[prop];
        }
    }, [props]);
    native.useFrame(controls.functions.update, -1);
    return null;
}
function useControls() {
    var controls = React.useMemo(function () { return createControls(); }, []);
    return [
        function (props) { return (React.createElement(OrbitControls, __assign({ controls: controls }, props))); },
        controls.events,
    ];
}

module.exports = useControls;
