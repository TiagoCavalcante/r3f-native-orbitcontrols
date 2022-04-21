# r3f-native-orbitcontrols

OrbitControls for React Three Fiber in React Native

## Example

```jsx
import useControls from "r3f-native-orbitcontrols"

function Canvas() {
  const [OrbitControls, events] = useControls()

  return (
    // If this isn't working check if you have set the size of the View.
    // The easiest way to do it is use the full size, e.g.:
    //   <View style={{ flex: 1 }} />
    <View {...events}>
      <Canvas>
        <OrbitControls />
      </Canvas>
    </View>
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
    <View {...events}>
      <Canvas camera={camera}>
        <OrbitControls />
      </Canvas>
      <Canvas camera={camera}>
        <OrbitControls />
      </Canvas>
    </View>
  )
}
```

## Options

The `<OrbitControls />` element _may_ receive the following properties:

| Property        |       Type        |                                     Description |
| :-------------- | :---------------: | ----------------------------------------------: |
| camera          | PerspectiveCamera |           readonly (but availiable to onChange) |
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
