// @ts-nocheck
// open-next.config.ts — OpenNext Cloudflare adapter configuration
// @ts-nocheck: this file is processed by opennextjs-cloudflare, not Next.js TypeScript

const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
    },
  },
};

export default config;
