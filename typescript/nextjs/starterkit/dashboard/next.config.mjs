/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_EXPORT_BASE_PATH ?? '';

// Static publishing for the GitHub Pages gallery. Normal dev and server builds
// keep the default server output; only the export build opts in.
const nextConfig = {
  reactStrictMode: true,
  ...(process.env.NEXT_EXPORT === '1'
    ? {
        output: 'export',
        trailingSlash: true,
        images: { unoptimized: true },
        ...(basePath ? { basePath } : {}),
      }
    : {}),
};

export default nextConfig;
