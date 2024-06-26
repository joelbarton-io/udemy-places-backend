module.exports = {
  apps: [
    {
      name: 'places-app',
      script: './app.js',
      env: {
        NODE_ENV: 'development',
        DB_USER: 'dev_user',
        DB_PASSWORD: 'dev_password',
        DB_NAME: 'dev_db',
      },
      env_production: {
        NODE_ENV: 'production',
        DB_USER: 'joel-udemy',
        DB_PASSWORD: 'hxBA3ljSWmNMM9jd',
        DB_NAME: 'mernApp-prod',
        JWT_KEY: 'supersecret',
        GOOGLE_API_KEY: 'AIzaSyB8l4_t-7wN8UNYWpuJTYyM2TNFaudxCek',
      },
    },
  ],
}
