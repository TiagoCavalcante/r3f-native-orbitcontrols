import React, { useEffect } from "react"
import {
  OrbitControlsChangeEvent,
  OrbitControlsProps,
  createControls,
} from "./OrbitControls"
import { useFrame } from "@react-three/fiber/native"

type OrbitControlsInternalProps = OrbitControlsProps & {
  controls: ReturnType<typeof createControls>
}

function OrbitControls({ controls, ...props }: OrbitControlsInternalProps) {
  useEffect(() => {
    for (const prop in props) {
      ;(controls.scope[prop as keyof typeof controls.scope] as any) =
        props[prop as keyof typeof props]
    }
  }, [props])

  useFrame(controls.functions.update, -1)

  return null as JSX.Element
}

export default function useControls() {
  const controls = createControls()

  return [
    (props: OrbitControlsProps) => {
      return <OrbitControls controls={controls} {...props} />
    },
    controls.events,
    controls.scope.camera,
  ] as const
}

export { OrbitControlsChangeEvent }
