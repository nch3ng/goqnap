module.exports = {
  apps : [{
    name      : 'goqnapcom',
    script    : 'dist/server/server.js',
    env: {
      NODE_ENV: 'true'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
  deploy: {
    production: {
      winkey: '/c/Users/nate/.ssh/google_cloud_deploy_openSSH',
      key: '~/.ssh/id_rsa_deploy_google_cloud',
      user: 'deploy',
      host: ['blog.qnap.com'],
      ref: 'origin/master',
      repo: 'git@github.com:qqnc/goqnap.git',
      path: '/var/www/staging',
      env: {
        NODE_ENV: 'production'
      },
      'pre-setup': 'sudo rm -rf /var/www/staging/source',
      'post-setup': 'npm install --unsafe-perm',
      'pre-deploy-local' : '',
      'pre-deploy' : 'npm run routes; ./node_modules/.bin/tsc -p tsconfig.json --module commonjs --sourceMap --target ES5',
      'post-deploy' : 'cp ~/environment/goqnap/.env ./;sudo pm2 startOrRestart config/ecosystem.config.js --env production;sudo cp ../../qnapusa/public/ . -a; sudo chown -R deploy:deploy node_modules',
    }
  }
};
