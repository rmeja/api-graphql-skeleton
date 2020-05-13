[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

# api-graphql-skeleton

An API Graphql skeleton application containing a JWT token authentication system and a data model managed by Sequelize

## Install
```bash
git clone https://github.com/rmeja/api-graphql-skeleton.git
cd api-graphql-skeleton
npm install
```

## Test
```bash
npm test
```

## Developpement
This API works in https and provides a ssl certificate for localhost development. To do this to work, you must add the file bin/rootCA.pem, the root certificate, as an authority certificate in your internet browser (Chrome, Firefox ...).

Configure your environment variables (thanks to [dotenv](https://github.com/motdotla/dotenv))
```bash
echo 'NODE_ENV=development' > .env
```

Configure yours database access
```bash
cp config/database.dist.json config/database.json
editor config/database.json
```

Launch a [mariadb database container](https://hub.docker.com/_/mariadb/) 
```bash
docker run --name some-mariadb -p 3306:3306 -e  MYSQL_ROOT_PASSWORD=my-secret-pw -d mariadb
```

Create your database with [sequelize-cli](https://github.com/sequelize/cli)
```bash
npm run sequelize db:create
```

Fill your database
```bash
npm run sequelize db:seed:all
```

Empty your database
```bash
npm run sequelize db:seed:undo:all
```

Launch you application and envoy
```bash
npm run watch
```
