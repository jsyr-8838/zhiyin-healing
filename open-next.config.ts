import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    // Enable minification to reduce bundle size for Cloudflare Workers 3MB limit
    minify: true,
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // Mark Three.js and related packages as external to prevent them from
  // being bundled into the server-side handler.mjs. They are client-only.
  edgeExternals: [
    "node:crypto",
    "three",
    "@react-three/fiber",
    "@react-three/drei",
  ],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
