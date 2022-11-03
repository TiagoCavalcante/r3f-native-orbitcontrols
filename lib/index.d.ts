import * as react_native from "react-native"
import { GestureResponderEvent, LayoutChangeEvent } from "react-native"
import { PerspectiveCamera, Vector3, Matrix4 } from "three"

declare const partialScope: {
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
declare function createControls(): {
  scope: {
    onChange: (event: { target: typeof partialScope }) => void
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
    update: () => void
    handleTouchStartRotate(event: GestureResponderEvent): void
    handleTouchStartDolly(event: GestureResponderEvent): void
    handleTouchStartPan(event: GestureResponderEvent): void
    handleTouchStartDollyPan(event: GestureResponderEvent): void
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
    onTouchMove(event: GestureResponderEvent): void
  }
  events: {
    onLayout(event: LayoutChangeEvent): void
    onStartShouldSetResponder(event: GestureResponderEvent): boolean
    onMoveShouldSetResponder(event: GestureResponderEvent): boolean
    onResponderMove(event: GestureResponderEvent): void
    onResponderRelease(): void
  }
}
declare type Partial<T> = {
  [P in keyof T]?: T[P]
}
declare type OrbitControlsProps = Partial<
  Omit<ReturnType<typeof createControls>["scope"], "camera">
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
    onResponderMove(event: react_native.GestureResponderEvent): void
    onResponderRelease(): void
  }
]

export { OrbitControlsChangeEvent, OrbitControlsProps, useControls as default }
