import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescript,
  {
    // react-three-fiber's entire programming model is imperative mutation of
    // three.js objects inside `useFrame` — mutating `camera`, uniform objects
    // and instance matrices per frame is the correct, documented pattern and
    // is exactly what these rules are designed to flag elsewhere.
    files: ["src/components/three/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
];

export default eslintConfig;
