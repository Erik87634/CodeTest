# Overview of the project
A node.js lottery API that can be used to create entries and draw winners. You can also list this data. SQLite is used for data persistance.

# Setup and execution instructions

### Prerequisites
- Node.js v18+
- npm
- Docker (optional, for containerization)

### Instructions
Clone the repository then run the following commands: 
```bash
npm install
npm start
```

# CI/CD explanation
The CI pipeline for this project is implemented using GitHub Actions and is limited to continuous integration only, as that was the scope of the assignment. It does not include deployment or runtime execution of the Docker container.
There is a DB Connection string added as a secret in the pipeline. It is however never used within the pipeline, as this would be a step in the deployment stage. 

# Description of design decisions
SQLite was used because I had limited experience with these lightweight databases, and this one felt like it was close to a real database with SQL queries which I have more experience with. 
Some extra functionality was added, Eg. support to pick multiple winners. If given more time, focus would have been on more extensive reports with time consraints. 
There was one requirement to have a scheduled job that runs monthly. using Cron within the code was considered, but since that can have issues if the API Crashes, I chose to keep it as an endpoint, and would setup something external like a CRON Azure function to call the endpoint. 
