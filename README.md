# r3f-native-orbitcontrols

<a href="https://github.com/TiagoCavalcante/r3f-native-orbitcontrols/releases"><img alt="Version" src="https://img.shields.io/npm/v/r3f-native-orbitcontrols" /></a>
<a href="https://npmjs.com/package/r3f-native-orbitcontrols"><img alt="Downloads" src="https://img.shields.io/npm/dt/r3f-native-orbitcontrols.svg" /></a>
<a href="https://github.com/TiagoCavalcante/r3f-native-orbitcontrols/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/r3f-native-orbitcontrols.svg" /></a>
<a href="https://bundlephobia.com/package/r3f-native-orbitcontrols"><img alt="Ziped size" src="https://img.shields.io/bundlephobia/minzip/r3f-native-orbitcontrols" /></a>

OrbitControls for React Three Fiber in React Native

## Install

r3f-native-orbitcontrols is distributed as a [npm package](https://www.npmjs.com/package/r3f-native-orbitcontrols) and can be installed as follows:

```
// with npm
npm install r3f-native-orbitcontrols
// with yarn
yarn add r3f-native-orbitcontrols
```

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

        {/* Place the scene elements here as usual */}
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
