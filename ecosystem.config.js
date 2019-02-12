module.exports = {
  apps : [{
    name      : 'goqnapcom',
    script    : 'dist/server.js',
    env: {
      NODE_ENV: 'development'
    },
    env_staging: {
      NODE_ENV: 'staging'
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
      host: ['go.qnap.com'],
      ref: 'origin/master',
      repo: 'git@github.com:qqnc/goqnap.git',
      path: '/var/www/goqnap/production',
      env: {
        NODE_ENV: 'production'
      },
      'pre-setup': 'sudo rm -rf /var/www/gooqnap/production/source',
      'post-setup': 'npm install --unsafe-perm',
      'pre-deploy-local' : '',
      'pre-deploy' : 'npm run routes; ./node_modules/.bin/tsc -p tsconfig.json --module commonjs --sourceMap --target ES5',
      'post-deploy' : 'cp ~/environment/goqnap/.env ./; cp ./server/helpers/email*.html dist/helpers/;sudo pm2 restart ecosystem.config.js --env production;sudo cp ../../../qnapusa/public/ . -a; sudo chown -R deploy:deploy node_modules',
    },
    staging: {
      winkey: '/c/Users/nate/.ssh/google_cloud_deploy_openSSH',
      key: '~/.ssh/id_rsa',
      user: 'deploy',
      host: ['68.4.6.13', 'staging-go.natecheng.me', '192.168.86.25'],
      ref: 'origin/master',
      repo: 'git@github.com:qqnc/goqnap.git',
      path: '/var/www/goqnap/staging',
      env: {
        NODE_ENV: 'staging'
      },
      'pre-setup': 'rm -rf /var/www/goqnap/staging/source',
      'post-setup': 'npm install --unsafe-perm',
      'pre-deploy-local' : '',
      'pre-deploy' : 'npm run routes; ./node_modules/.bin/tsc -p tsconfig.json --module commonjs --sourceMap --target ES5',
      'post-deploy' : 'cp ~/environment/goqnap/staging/.env ./; cp ./server/helpers/email*.html dist/helpers/;pm2 restart ecosystem.config.js --env staging;cp ~/qnapusa/public/ . -a;',
    }
  }
};
