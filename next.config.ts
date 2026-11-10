import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        // Artwork images are Firebase Storage download URLs, shaped
        // /v0/b/<bucket>/o/<url-encoded-path>?alt=media&token=...
        // The bucket must match NEXT_PUBLIC_STORAGE_BUCKET in .env.
        remotePatterns: [
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
                pathname: "/v0/b/react-social-project.appspot.com/o/**",
            },
        ],
    },
};

export default nextConfig;
