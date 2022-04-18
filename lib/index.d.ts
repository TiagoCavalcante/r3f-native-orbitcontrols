/// <reference types="react" />
import * as three from "three"
import { PerspectiveCamera, Vector3, Vector2, Matrix4 } from "three"
import * as react_native from "react-native"
import { GestureResponderEvent, LayoutChangeEvent } from "react-native"

declare function createControls(): {
  scope: {
    onChange: (event: {
      target: {
        camera: PerspectiveCamera
        enabled: boolean
        target: Vector3
        minDistance: number
        maxDistance: number
        minZoom: number
        maxZoom: number
        minPolarAngle: number
        maxPolarAngle: number
        minAzimuthAngle: number
        maxAzimuthAngle: number
        dampingFactor: number
        enableZoom: boolean
        zoomSpeed: number
        enableRotate: boolean
        rotateSpeed: number
        enablePan: boolean
        panSpeed: number
      }
    }) => void
    camera: PerspectiveCamera
    enabled: boolean
    target: Vector3
    minDistance: number
    maxDistance: number
    minZoom: number
    maxZoom: number
    minPolarAngle: number
    maxPolarAngle: number
    minAzimuthAngle: number
    maxAzimuthAngle: number
    dampingFactor: number
    enableZoom: boolean
    zoomSpeed: number
    enableRotate: boolean
    rotateSpeed: number
    enablePan: boolean
    panSpeed: number
  }
  functions: {
    update: (invalidate: () => void) => void
    addPointer(event: GestureResponderEvent): void
    removePointer(event: GestureResponderEvent): void
    trackPointer(event: GestureResponderEvent): void
    getSecondPointerPosition(event: GestureResponderEvent): Vector2
    handleTouchStartRotate(): void
    handleTouchStartDolly(): void
    handleTouchStartPan(): void
    handleTouchStartDollyPan(): void
    onTouchStart(event: GestureResponderEvent): void
    rotateLeft(angle: number): void
    rotateUp(angle: number): void
    handleTouchMoveRotate(event: GestureResponderEvent): void
    dollyOut(dollyScale: number): void
    handleTouchMoveDolly(event: GestureResponderEvent): void
    panLeft(distance: number, objectMatrix: Matrix4): void
    panUp(distance: number, objectMatrix: Matrix4): void
    pan(deltaX: number, deltaY: number): void
    handleTouchMovePan(event: GestureResponderEvent): void
    handleTouchMoveDollyPan(event: GestureResponderEvent): void
    handleTouchMoveDollyRotate(event: GestureResponderEvent): void
    onTouchMove(event: GestureResponderEvent): void
  }
  events: {
    onLayout(event: LayoutChangeEvent): void
    onStartShouldSetResponder(event: GestureResponderEvent): boolean
    onMoveShouldSetResponder(event: GestureResponderEvent): boolean
    onResponderReject(event: GestureResponderEvent): void
    onResponderMove(event: GestureResponderEvent): void
    onResponderRelease(event: GestureResponderEvent): void
  }
}
declare type Partial<T> = {
  [P in keyof T]?: T[P]
}
declare type OrbitControlsProps = Partial<
  ReturnType<typeof createControls>["scope"]
>
declare type OrbitControlsChangeEvent = Parameters<
  ReturnType<typeof createControls>["scope"]["onChange"]
>[0]

declare function useControls(): readonly [
  (props: OrbitControlsProps) => JSX.Element,
  {
    onLayout(event: react_native.LayoutChangeEvent): void
    onStartShouldSetResponder(
      event: react_native.GestureResponderEvent
    ): boolean
    onMoveShouldSetResponder(event: react_native.GestureResponderEvent): boolean
    onResponderReject(event: react_native.GestureResponderEvent): void
    onResponderMove(event: react_native.GestureResponderEvent): void
    onResponderRelease(event: react_native.GestureResponderEvent): void
  },
  three.PerspectiveCamera
]

export { OrbitControlsChangeEvent, useControls as default }
