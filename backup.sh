MONGO_DATABASE="react-starter-api"
APP_NAME="react-starter-backend"

MONGO_HOST="0.0.0.0"
MONGO_PORT="27017"
current_time=$(date "+%Y-%m-%d")
MONGODUMP_PATH="/usr/bin/mongodump"
BACKUPS_DIR="/home/ubuntu/$APP_NAME"
BACKUP_NAME="backup.tgz"

# mongo admin --eval "printjson(db.fsyncLock())"
# $MONGODUMP_PATH -h $MONGO_HOST:$MONGO_PORT -db $MONGO_DATABASE
$MONGODUMP_PATH --db $MONGO_DATABASE
# mongo admin --eval "printjson(db.fsyncUnlock())"

rm -rf $BACKUPS_DIR/$BACKUP_NAME.tgz
mkdir -p $BACKUPS_DIR
mv dump $BACKUP_NAME
tar -zcvf $BACKUPS_DIR/$current_time.$BACKUP_NAME $BACKUP_NAME
rm -rf $BACKUP_NAME