## Backend

Go in backend folder and use `npm start` to start the express backend at port 3000.

## Frontend


## Tools

### PostgreSQL

Follow these instructions to install PostgreSQL on your Mac device. If you're have a M1 chip, make sure your architecture is `arm64`.

```
brew install postgresql@14
```

Start PostgreSQL to access the CLI.
```
brew services start postgresql@14
```

Check that PostgreSQL is *Running* and *Loaded* with 
```
brew services info postgresql@14
```

Start the CLI with
```
psql -d postgres -U <macbook-default-username>
```

In the CLI, create the database
```
CREATE DATABASE matcha;
```

Then, create the user
```
CREATE USER matcha WITH ENCRYPTED PASSWORD '<password>';
```

Grant privilege to the user
```
GRANT ALL PRIVILEGES ON DATABASE matcha TO matcha;
```

Then, access CLI with
```
psql -d matcha -U matcha
```

#### Migrations

Migrations commands can be written in `backend/database/migrations` in the format `[migration-number]_[action].sql` (example: `001_create_user_table.sql`).

### Formatting

Prettier and ESlint allow to smoothly format files across the app. Make you sure you have selected the default formatter in your VSCode `settings.json`. 

```
 "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
```
