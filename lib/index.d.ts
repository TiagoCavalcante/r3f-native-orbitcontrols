/// <reference types="react" />
import { PerspectiveCamera, Vector3, Vector2, Matrix4 } from "three"

declare function createControls(): {
  scope: {
    camera: PerspectiveCamera
    enabled: boolean
    target: Vector3
    state: number
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
    onChange: (event: typeof this$1) => void
  }
  functions: {
    update: () => void
    addPointer(event: PointerEvent): void
    removePointer(event: PointerEvent): void
    trackPointer(event: PointerEvent): void
    getSecondPointerPosition(event: PointerEvent): Vector2
    handleTouchStartRotate(): void
    handleTouchStartDolly(): void
    handleTouchStartPan(): void
    handleTouchStartDollyPan(): void
    onTouchStart(event: PointerEvent): void
    rotateLeft(angle: number): void
    rotateUp(angle: number): void
    handleTouchMoveRotate(event: PointerEvent): void
    dollyOut(dollyScale: number): void
    handleTouchMoveDolly(event: PointerEvent): void
    panLeft(distance: number, objectMatrix: Matrix4): void
    panUp(distance: number, objectMatrix: Matrix4): void
    pan(deltaX: number, deltaY: number): void
    handleTouchMovePan(event: PointerEvent): void
    handleTouchMoveDollyPan(event: PointerEvent): void
    handleTouchMoveDollyRotate(event: PointerEvent): void
    onTouchMove(event: PointerEvent): void
  }
  events: {
    onPointerDown(event: PointerEvent): void
    onPointerCancel(event: PointerEvent): void
    onPointerMove(event: PointerEvent): void
    onPointerUp(event: PointerEvent): void
  }
}
declare type OrbitControlsProps = ReturnType<typeof createControls>["scope"]

declare function useControls(): (
  | {
      onPointerDown(event: PointerEvent): void
      onPointerCancel(event: PointerEvent): void
      onPointerMove(event: PointerEvent): void
      onPointerUp(event: PointerEvent): void
    }
  | ((props: OrbitControlsProps) => JSX.Element)
)[]

export { useControls as default }
