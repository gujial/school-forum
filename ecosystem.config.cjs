module.exports = {
    apps: [
        {
            name: 'school-forum',
            script: './.output/server/index.mjs',
            exec_mode: 'cluster',
            instances: 'max',
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_file: './logs/combined.log',
            time: true,
        },
    ],
};
