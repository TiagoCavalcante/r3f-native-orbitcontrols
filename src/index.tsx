import { useFrame, useThree } from "@react-three/fiber/native"
import React, { useEffect, useMemo } from "react"
import { OrthographicCamera, PerspectiveCamera } from "three"
import {
  ControlsChangeEvent,
  ControlsMode,
  ControlsProps,
  useCreateControls,
} from "./Controls"

type ControlsInternalProps = ControlsProps & {
  controls: ReturnType<typeof useCreateControls>
}

function Controls({ controls, ...props }: ControlsInternalProps) {
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    if (
      (camera as PerspectiveCamera).isPerspectiveCamera ||
      (camera as OrthographicCamera).isOrthographicCamera
    ) {
      controls.scope.camera = camera as PerspectiveCamera | OrthographicCamera
    } else {
      throw new Error(
        "The camera must be a PerspectiveCamera or OrthographicCamera for controls to work",
      )
    }
  }, [camera, controls.scope])

  useEffect(() => {
    for (const prop in props) {
      ;(controls.scope[prop as keyof typeof controls.scope] as any) =
        props[prop as keyof typeof props]
    }
  }, [props, controls.scope])

  useFrame(controls.functions.update, -1)

  return null
}

export default function useControls(mode = ControlsMode.ORBIT) {
  const controls = useMemo(() => useCreateControls(mode), [mode])

  return [
    (props: ControlsProps) => <Controls controls={controls} {...props} />,
    controls.events,
  ] as const
}

export { ControlsChangeEvent, ControlsMode, ControlsProps }
