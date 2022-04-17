import React, { useEffect } from "react"
import { createControls, OrbitControlsProps } from "./OrbitControls"
import { useFrame } from "@react-three/fiber"

function OrbitControls({
  controls,
  ...props
}: { controls: ReturnType<typeof createControls> } & OrbitControlsProps) {
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
    (props: OrbitControlsProps) => (
      <OrbitControls controls={controls} {...props} />
    ),
    controls.events,
  ] as const
}
