import {
  Matrix4,
  PerspectiveCamera,
  Quaternion,
  Spherical,
  Vector2,
  Vector3,
} from "three"
import { GestureResponderEvent, LayoutChangeEvent } from "react-native"
import { invalidate } from "@react-three/fiber/native"

const EPSILON = 0.000001

const STATE = {
  NONE: 0,
  ROTATE: 1,
  DOLLY: 2,
}

const partialScope = {
  camera: undefined as PerspectiveCamera | undefined,

  enabled: true,

  target: new Vector3(),

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
}

export function createControls() {
  let height = 0

  const scope = {
    ...partialScope,
    onChange: (event: { target: typeof partialScope }) => {},
  }

  const internals = {
    rotateStart: new Vector2(),
    rotateEnd: new Vector2(),
    rotateDelta: new Vector2(),
    dollyStart: new Vector2(),
    dollyEnd: new Vector2(),
    panStart: new Vector2(),
    panEnd: new Vector2(),
    panDelta: new Vector2(),
    panOffset: new Vector3(),

    spherical: new Spherical(),
    sphericalDelta: new Spherical(),

    scale: 1,

    state: STATE.NONE,
  }

  const functions = {
    handleTouchStartRotate(event: GestureResponderEvent) {
      if (event.nativeEvent.touches.length === 1) {
        internals.rotateStart.set(
          event.nativeEvent.touches[0].locationX,
          event.nativeEvent.touches[0].locationY
        )
      } else if (event.nativeEvent.touches.length === 2) {
        const x =
          0.5 *
          (event.nativeEvent.touches[0].locationX +
            event.nativeEvent.touches[1].locationX)
        const y =
          0.5 *
          (event.nativeEvent.touches[0].locationY +
            event.nativeEvent.touches[1].locationY)

        internals.rotateStart.set(x, y)
      }
    },

    handleTouchStartDolly(event: GestureResponderEvent) {
      // Ensures this isn't undefined.
      if (event.nativeEvent.touches.length === 2) {
        const dx =
          event.nativeEvent.touches[0].locationX -
          event.nativeEvent.touches[1].locationX
        const dy =
          event.nativeEvent.touches[0].locationY -
          event.nativeEvent.touches[1].locationY
        const distance = Math.sqrt(dx * dx + dy * dy)

        internals.dollyStart.set(0, distance)
      }
    },

    handleTouchStartPan(event: GestureResponderEvent) {
      if (event.nativeEvent.touches.length === 1) {
        internals.panStart.set(
          event.nativeEvent.touches[0].locationX,
          event.nativeEvent.touches[0].locationY
        )
      } else if (event.nativeEvent.touches.length === 2) {
        const x =
          0.5 *
          (event.nativeEvent.touches[0].locationX +
            event.nativeEvent.touches[1].locationX)
        const y =
          0.5 *
          (event.nativeEvent.touches[0].locationY +
            event.nativeEvent.touches[1].locationY)

        internals.panStart.set(x, y)
      }
    },

    handleTouchStartDollyPan(event: GestureResponderEvent) {
      if (scope.enableZoom) this.handleTouchStartDolly(event)
      if (scope.enablePan) this.handleTouchStartPan(event)
    },

    onTouchStart(event: GestureResponderEvent) {
      switch (event.nativeEvent.touches.length) {
        case STATE.ROTATE:
          if (!scope.enableRotate) return
          this.handleTouchStartRotate(event)
          internals.state = STATE.ROTATE

          break

        case STATE.DOLLY:
          if (!scope.enableZoom && !scope.enablePan) return
          this.handleTouchStartDollyPan(event)
          internals.state = STATE.DOLLY

          break

        default:
          internals.state = STATE.NONE
      }
    },

    rotateLeft(angle: number) {
      internals.sphericalDelta.theta -= angle
    },

    rotateUp(angle: number) {
      internals.sphericalDelta.phi -= angle
    },

    handleTouchMoveRotate(event: GestureResponderEvent) {
      if (event.nativeEvent.touches.length === 1) {
        internals.rotateEnd.set(
          event.nativeEvent.locationX,
          event.nativeEvent.locationY
        )
      } else if (event.nativeEvent.touches.length === 2) {
        const x =
          0.5 *
          (event.nativeEvent.touches[0].locationX +
            event.nativeEvent.touches[1].locationX)
        const y =
          0.5 *
          (event.nativeEvent.touches[0].locationY +
            event.nativeEvent.touches[1].locationY)
        internals.rotateEnd.set(x, y)
      }

      internals.rotateDelta
        .subVectors(internals.rotateEnd, internals.rotateStart)
        .multiplyScalar(scope.rotateSpeed)

      // yes, height
      this.rotateLeft((2 * Math.PI * internals.rotateDelta.x) / height)
      this.rotateUp((2 * Math.PI * internals.rotateDelta.y) / height)

      internals.rotateStart.copy(internals.rotateEnd)
    },

    dollyOut(dollyScale: number) {
      internals.scale /= dollyScale
    },

    handleTouchMoveDolly(event: GestureResponderEvent) {
      // Ensures this isn't undefined.
      if (event.nativeEvent.touches.length === 2) {
        const dx =
          event.nativeEvent.touches[0].locationX -
          event.nativeEvent.touches[1].locationX
        const dy =
          event.nativeEvent.touches[0].locationY -
          event.nativeEvent.touches[1].locationY
        const distance = Math.sqrt(dx * dx + dy * dy)

        internals.dollyEnd.set(0, distance)
        this.dollyOut(
          Math.pow(
            internals.dollyEnd.y / internals.dollyStart.y,
            scope.zoomSpeed
          )
        )
        internals.dollyStart.copy(internals.dollyEnd)
      }
    },

    panLeft(distance: number, objectMatrix: Matrix4) {
      const v = new Vector3()

      v.setFromMatrixColumn(objectMatrix, 0) // get X column of objectMatrix
      v.multiplyScalar(-distance)

      internals.panOffset.add(v)
    },

    panUp(distance: number, objectMatrix: Matrix4) {
      const v = new Vector3()

      v.setFromMatrixColumn(objectMatrix, 1)
      v.multiplyScalar(distance)

      internals.panOffset.add(v)
    },

    pan(deltaX: number, deltaY: number) {
      if (!scope.camera) return

      const position = scope.camera.position

      let targetDistance = position.clone().sub(scope.target).length()

      // half of the fov is center to top of screen
      targetDistance *= Math.tan(((scope.camera.fov / 2) * Math.PI) / 180.0)

      // we use only height here so aspect ratio does not distort speed
      this.panLeft((2 * deltaX * targetDistance) / height, scope.camera.matrix)
      this.panUp((2 * deltaY * targetDistance) / height, scope.camera.matrix)
    },

    handleTouchMovePan(event: GestureResponderEvent) {
      if (event.nativeEvent.touches.length === 1) {
        internals.panEnd.set(
          event.nativeEvent.locationX,
          event.nativeEvent.locationY
        )
      } else if (event.nativeEvent.touches.length === 2) {
        const x =
          0.5 *
          (event.nativeEvent.touches[0].locationX +
            event.nativeEvent.touches[1].locationX)
        const y =
          0.5 *
          (event.nativeEvent.touches[0].locationY +
            event.nativeEvent.touches[1].locationY)
        internals.panEnd.set(x, y)
      } else {
        return
      }

      internals.panDelta
        .subVectors(internals.panEnd, internals.panStart)
        .multiplyScalar(scope.panSpeed)
      this.pan(internals.panDelta.x, internals.panDelta.y)
      internals.panStart.copy(internals.panEnd)
    },

    handleTouchMoveDollyPan(event: GestureResponderEvent) {
      if (scope.enableZoom) this.handleTouchMoveDolly(event)
      if (scope.enablePan) this.handleTouchMovePan(event)
    },

    onTouchMove(event: GestureResponderEvent) {
      switch (internals.state) {
        case STATE.ROTATE:
          if (!scope.enableRotate) return
          this.handleTouchMoveRotate(event)
          update()
          break

        case STATE.DOLLY:
          if (!scope.enableZoom && !scope.enablePan) return
          this.handleTouchMoveDollyPan(event)
          update()
          break

        default:
          internals.state = STATE.NONE
      }
    },
  }

  const update = (() => {
    const offset = new Vector3()

    const lastPosition = new Vector3()
    const lastQuaternion = new Quaternion()

    const twoPI = 2 * Math.PI

    return () => {
      if (!scope.camera) return

      const position = scope.camera.position

      // so camera.up is the orbit axis
      const quat = new Quaternion().setFromUnitVectors(
        scope.camera.up,
        new Vector3(0, 1, 0)
      )
      const quatInverse = quat.clone().invert()

      offset.copy(position).sub(scope.target)

      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion(quat)

      // angle from z-axis around y-axis
      internals.spherical.setFromVector3(offset)

      internals.spherical.theta +=
        internals.sphericalDelta.theta * scope.dampingFactor
      internals.spherical.phi +=
        internals.sphericalDelta.phi * scope.dampingFactor

      // restrict theta to be between desired limits

      let min = scope.minAzimuthAngle
      let max = scope.maxAzimuthAngle

      if (isFinite(min) && isFinite(max)) {
        if (min < -Math.PI) min += twoPI
        else if (min > Math.PI) min -= twoPI

        if (max < -Math.PI) max += twoPI
        else if (max > Math.PI) max -= twoPI

        if (min <= max) {
          internals.spherical.theta = Math.max(
            min,
            Math.min(max, internals.spherical.theta)
          )
        } else {
          internals.spherical.theta =
            internals.spherical.theta > (min + max) / 2
              ? Math.max(min, internals.spherical.theta)
              : Math.min(max, internals.spherical.theta)
        }
      }

      // restrict phi to be between desired limits
      internals.spherical.phi = Math.max(
        scope.minPolarAngle,
        Math.min(scope.maxPolarAngle, internals.spherical.phi)
      )
      internals.spherical.makeSafe()
      internals.spherical.radius *= internals.scale

      // restrict radius to be between desired limits
      internals.spherical.radius = Math.max(
        scope.minDistance,
        Math.min(scope.maxDistance, internals.spherical.radius)
      )

      // move target to panned location

      scope.target.addScaledVector(internals.panOffset, scope.dampingFactor)

      offset.setFromSpherical(internals.spherical)

      // rotate offset back to "camera-up-vector-is-up" space
      offset.applyQuaternion(quatInverse)

      position.copy(scope.target).add(offset)

      scope.camera.lookAt(scope.target)

      internals.sphericalDelta.theta *= 1 - scope.dampingFactor
      internals.sphericalDelta.phi *= 1 - scope.dampingFactor

      internals.panOffset.multiplyScalar(1 - scope.dampingFactor)

      internals.scale = 1

      // update condition is:
      // min(camera displacement, camera rotation in radians)^2 > EPSILON
      // using small-angle approximation cos(x/2) = 1 - x^2 / 8
      if (
        lastPosition.distanceToSquared(scope.camera.position) > EPSILON ||
        8 * (1 - lastQuaternion.dot(scope.camera.quaternion)) > EPSILON
      ) {
        invalidate()

        scope.onChange({ target: scope })

        lastPosition.copy(scope.camera.position)
        lastQuaternion.copy(scope.camera.quaternion)
      }
    }
  })()

  return {
    scope,

    functions: {
      ...functions,
      update,
    },

    events: {
      // Equivalent to componentDidMount.
      onLayout(event: LayoutChangeEvent) {
        height = event.nativeEvent.layout.height
      },

      // See https://reactnative.dev/docs/gesture-responder-system
      onStartShouldSetResponder(event: GestureResponderEvent) {
        // On some devices this fires only for 2+ touches.
        if (!scope.enabled) return false

        functions.onTouchStart(event)

        return true
      },

      onMoveShouldSetResponder(event: GestureResponderEvent) {
        // And on the same devices this fires only for 1 touch.
        if (!scope.enabled) return false

        functions.onTouchStart(event)

        return true
      },

      onResponderMove(event: GestureResponderEvent) {
        if (internals.state !== event.nativeEvent.touches.length) {
          functions.onTouchStart(event)
        }

        functions.onTouchMove(event)
      },

      onResponderRelease() {
        internals.state = STATE.NONE
      },
    },
  }
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

export type OrbitControlsProps = Partial<
  Omit<ReturnType<typeof createControls>["scope"], "camera">
>

export type OrbitControlsChangeEvent = Parameters<
  ReturnType<typeof createControls>["scope"]["onChange"]
>[0]
