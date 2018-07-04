# Swagger Example

Example for using swagger API development.

## Installation

### Requirements
* Linux
* Mysql
* Nodejs (latest version)

### MySQL installation
[Installation guide for Mysql on Ubuntu](https://websiteforstudents.com/install-mysql-latest-versions-on-ubuntu-16-04-lts-server/)

## Usage

### 1. Clone this repository

### 2. Configure database parameter

   Open `/api/config/constants.js` and configure the following variables.

   ```js
   exports.DB_USER = "root";    //provide tabase user-name
   exports.DB_PASSWORD = "root";     //provide database password
   exports.DB_TABLE_NAME = "tokens";    //provide database name
   exports.DB_DATABASE_NAME = "catalyst";    //provide database table-name
   ```

### 3. Installing NPM dependencies 

   Run the following command inside the root directory.

   ```
   $ npm install
   ```

### 4. Running Server
   ```
   $ node app.js
   ```

### 5. Running Client

   Inside `client` directory, open the `index.html` file to start client execution.