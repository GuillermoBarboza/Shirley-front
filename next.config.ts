import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        domains: ["firebasestorage.googleapis.com"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
                pathname: "/v0/b/shirley-portfolio.appspot.com/o/*",
            },
        ],
    },
};

export default nextConfig;
