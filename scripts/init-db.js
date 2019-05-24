qnapcollege_dev = db.getSiblingDB('qnapcollege-dev');
sh.enableSharding('qnapcollege-dev')
qnapcollege_dev.createCollection('course')
sh.shardCollection('qnapcollege-dev.course', { '_id': 1})
