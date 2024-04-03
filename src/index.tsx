import React, { useEffect, useMemo } from "react"
import {
  OrbitControlsChangeEvent,
  OrbitControlsProps,
  createControls,
} from "./OrbitControls"
import { useFrame, useThree } from "@react-three/fiber/native"
import { OrthographicCamera, PerspectiveCamera } from "three"

type OrbitControlsInternalProps = OrbitControlsProps & {
  controls: ReturnType<typeof createControls>
}

function OrbitControls({ controls, ...props }: OrbitControlsInternalProps) {
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    if (
      (camera as PerspectiveCamera).isPerspectiveCamera ||
      (camera as OrthographicCamera).isOrthographicCamera
    ) {
      controls.scope.camera = camera as PerspectiveCamera | OrthographicCamera
    } else {
      throw new Error(
        "The camera must be a PerspectiveCamera or OrthographicCamera to orbit controls work"
      )
    }
  }, [camera])

  useEffect(() => {
    for (const prop in props) {
      ;(controls.scope[prop as keyof typeof controls.scope] as any) =
        props[prop as keyof typeof props]
    }
  }, [props])

  useFrame(controls.functions.update, -1)

  return null as unknown as JSX.Element
}

export default function useControls() {
  const controls = useMemo(() => createControls(), [])

  return [
    (props: OrbitControlsProps) => (
      <OrbitControls controls={controls} {...props} />
    ),
    controls.events,
  ] as const
}

export { OrbitControlsChangeEvent, OrbitControlsProps }
