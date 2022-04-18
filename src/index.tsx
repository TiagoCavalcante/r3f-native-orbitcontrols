import React, { useEffect } from "react"
import {
  OrbitControlsChangeEvent,
  OrbitControlsProps,
  createControls,
} from "./OrbitControls"
import { useFrame, useThree } from "@react-three/fiber"

type OrbitControlsInternalProps = OrbitControlsProps & {
  controls: ReturnType<typeof createControls>
  invalidate: () => void
}

function OrbitControls({
  controls,
  invalidate,
  ...props
}: OrbitControlsInternalProps) {
  useEffect(() => {
    for (const prop in props) {
      ;(controls.scope[prop as keyof typeof controls.scope] as any) =
        props[prop as keyof typeof props]
    }
  }, [props])

  useFrame(() => controls.functions.update(invalidate), -1)

  return null as JSX.Element
}

export default function useControls() {
  const controls = createControls()

  return [
    (props: OrbitControlsProps) => {
      const invalidate = useThree((state) => state.invalidate)

      return (
        <OrbitControls controls={controls} invalidate={invalidate} {...props} />
      )
    },
    controls.events,
    controls.scope.camera,
  ] as const
}

export { OrbitControlsChangeEvent }
