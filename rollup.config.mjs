import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import del from "rollup-plugin-delete"
import dts from "rollup-plugin-dts"
import typescript from "rollup-plugin-typescript2"

import pkg from "./package.json" assert { type: "json" }

const config = [
  {
    input: "./src/index.tsx",
    output: [
      {
        file: "./lib/index.cjs",
        format: "cjs",
      },
      {
        file: "./lib/index.esm.js",
        format: "es",
      },
    ],
    external: [
      ...Object.keys(pkg.peerDependencies),
      // Rollup doesn't treat this as a peerDependency by default.
      "@react-three/fiber/native",
    ],
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
  },
  {
    input: "./lib/index.d.ts",
    output: [{ file: "./lib/index.d.ts", format: "es" }],
    plugins: [
      dts(),
      del({
        targets: ["./lib/OrbitControls.d.ts"],
        hook: "buildEnd",
      }),
    ],
  },
]

export default config
