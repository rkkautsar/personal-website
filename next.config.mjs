/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                "source": "/resume",
                "destination": "https://docs.google.com/document/d/1PgWmwl_aCWq2Z2RLJXyPSjpPKPs93vMcwt6e-CA0gBE/export?format=pdf",
                permanent: true
            },
            {
                "source": "/blog",
                "destination": "https://medium.com/@rkkautsar",
                permanent: true
            },
            {
                "source": "/linkedin",
                "destination": "https://www.linkedin.com/in/rkkautsar/",
                permanent: true
            },
            {
                "source": "/twitter",
                "destination": "http://twitter.com/rkkautsar",
                permanent: true
            },
            {
                "source": "/github",
                "destination": "https://github.com/rkkautsar",
                permanent: true
            },
            {
                "source": "/instagram",
                "destination": "http://instagram.com/rakhakk",
                permanent: true
            }
        ];
    },
};

export default nextConfig;
