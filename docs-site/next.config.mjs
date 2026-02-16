import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
}

export default withMDX(config)
