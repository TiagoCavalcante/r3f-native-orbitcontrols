# r3f-native-orbitcontrols

OrbitControls for React Three Fiber in React Native

## Example

```jsx
import useControls from "r3f-native-orbitcontrols"

function Canvas() {
  const [OrbitControls, events] = useControls()

  return (
    <Show {...events}>
      <Canvas>
        <OrbitControls />
      </Canvas>
    </Show>
  )
}

function Canvases() {
  // you also can use the same OrbitControls for multiple canvases
  // creating an effect like the game
  // The Medium (https://store.steampowered.com/app/1293160)
  const [OrbitControls, events] = useControls()

  // in this case the same camera must be used in all the canvases
  const camera = new PerspectiveCamera()

  return (
    <Show {...events}>
      <Canvas camera={camera}>
        <OrbitControls />
      </Canvas>
      <Canvas camera={camera}>
        <OrbitControls />
      </Canvas>
    </Show>
  )
}
```

## Options

The `<OrbitControls />` element _may_ receive the following properties:

| Property        |       Type        |                                     Description |
| :-------------- | :---------------: | ----------------------------------------------: |
| camera          | PerspectiveCamera |                                                 |
| enabled         |      boolean      |                                                 |
| target          |      Vector3      |                                                 |
| minDistance     |      number       |                                                 |
| maxDistance     |      number       |                                                 |
| minZoom         |      number       |                                                 |
| maxZoom         |      number       |                                                 |
| minPolarAngle   |      number       |              how close you can orbit vertically |
| maxPolarAngle   |      number       |                how far you can orbit vertically |
| minAzimuthAngle |      number       |            how close you can orbit horizontally |
| maxAzimuthAngle |      number       |              how far you can orbit horizontally |
| dampingFactor   |      number       |                                  inertia factor |
| enableZoom      |      boolean      |                                                 |
| zoomSpeed       |      number       |                                                 |
| enableRotate    |      boolean      |                                                 |
| rotateSpeed     |      number       |                                                 |
| enablePan       |      boolean      |                                                 |
| panSpeed        |      number       |                                                 |
| onChange        |  (event) => void  | receives an event with all the properties above |
