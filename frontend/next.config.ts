import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        // Désactive ESLint pendant le build
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Optionnel : désactive aussi les erreurs TypeScript pendant le build
        // ignoreBuildErrors: true,
    },
};

export default nextConfig;