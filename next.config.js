/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: process.env.NODE_ENV === 'development',
    },
    typescript: {
        ignoreBuildErrors: process.env.NODE_ENV === 'development',
    },
};

console.log('\n>> NEXT_ENV: ', process.env.NODE_ENV, '\n');

module.exports = nextConfig;