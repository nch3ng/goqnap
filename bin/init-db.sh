#/bin/bash
mongorestore -h localhost:27017 -u root -p example -d qnapcollege-dev --authenticationDatabase=admin --dir ./db/
