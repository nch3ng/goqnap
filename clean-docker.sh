#! /bin/bash
# remove all unused / orphaned images
echo -e  "Removing unused images..."
docker rmi -f $(docker images --no-trunc | grep "<none>" | awk "{print \$3}") 2>&1 | cat;
echo -e  "Done removing unused images"

# clean up stuff -> using these instructions https://lebkowski.name/docker-volumes/
echo -e  "Cleaning up old containers..."
docker ps --filter status=dead --filter status=exited -aq | xargs docker rm -v 2>&1 | cat;
echo -e  "Cleaning up old volumes..."
docker volume ls -qf dangling=true | xargs docker volume rm 2>&1 | cat;
