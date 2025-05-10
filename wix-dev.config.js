export default {
    build: {
        assetOptimization: {
            images: {
                format: 'webp',
                quality: 80
            }
        },
        cachingStrategies: {
            staticAssets: {
                policy: 'CacheFirst',
                cacheName: 'static-assets-v1'
            }
        }
    },
    security: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "https://*.wix.com"],
                styleSrc: ["'self'", "'unsafe-inline'"]
            }
        }
    }
};