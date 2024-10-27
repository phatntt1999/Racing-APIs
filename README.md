# Racing-APIs

This command installs NVM (Node Version Manager):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

The command enables NVM:

```bash
source ~/.nvm/nvm.sh
```

This command installs version 20 of Node:
```bash
nvm install 20
```

Confirm versions of node and npm using the following commands:
```bash
node -v

npm -v 
```

## Installing Express

```bash
npm init
```

Install Express using the following command
```bash
npm install express
```
## Run server:

```bash
node index.js
```

You might got this error:
"Client does not support authentication protocol requested by server; consider upgrading MySQL client"
Try to update mysql using this command:
```bash
npm install mysql --save
```

Or in mysql change user's password into 'mysql_native_password'
```bash
ALTER USER 'your-username'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your-password';

FLUSH PRIVILEGES;
```