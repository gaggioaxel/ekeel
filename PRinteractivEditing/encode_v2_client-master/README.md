# EncodeWeb
Encode  Web is an Application that supports the editing and management of Prerequisite Concept Maps, via browser.

# Installation

1- Download the repository content.

2- Create the db schema using script encode_v2_server/documentation/ENCODE_Database.sql MySql script.

3- Install Apache Maven if you don't already have it, https://maven.apache.org/download.cgi.

4- Open a shell and go in /encode_rest_api folder.

5- Create a Jar of backend layer running the "mvn package" command.

6- Install Node.js from https://nodejs.org/it/

7- Open a shell and go to /unige_encode_app folder.

8- Run the command "npm install" with the aim of install all projet dependency.

# Execution

1- Open a shell and go to encode encode-rest-api-0.0.1-develop.jar location

2- Run the command " java -jar encode-rest-api-0.0.1-develop.jar"

3- Open a shell and go to  /unige_encode_app folder.

4- Run the command "npm start"

# Usage

1- Open chrome browser and go to URL "http://localhost:3000"

2- Enjoy :) !

# Interface functionalities to be added soon

1- Full complance with the server (add the new keys used by the server, add new requested parameters)

2- A new page to select, update and create your own schema

3- A full management page of the types of your schema (effort type, occurrence type, scope, topic type, association type)

4- A pannel or a page to view and select a topicmap shared to you

5- Graph representation compliance & N-arry relations

6- A page for Association management, as they can now be more than binary

7- Small functionalities to existing pannels (add/remove a collaborator to a topicmap, effort management on a occurrence, scope management for associations and topics)
