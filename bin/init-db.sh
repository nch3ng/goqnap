#/bin/bash
# mongorestore  -h localhost:27015 -u root -p example -d qnapcollege-dev --authenticationDatabase=admin ./db


mongorestore --port 27017 -u root -p example -d qnapcollege-dev --authenticationDatabase=admin ./db
