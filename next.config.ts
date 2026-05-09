import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  transpilePackages: [
    "@copilotkit/react-core",
    "@copilotkit/react-ui",
    "@copilotkit/runtime",
    "@copilotkit/shared",
    "@copilotkit/a2ui-renderer",
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
