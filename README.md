> Build and push docker image to your Docker hub repo
```bash
1. Clone the repo to any directory of your choice
2. Change directory into /serviceA
# Do this also for serviceB
3. Run 
$ npm install
# Make sure you have NodeJS installed
# Downloads your packages
# Do the same for serviceB
5. Test that it runs correctly by running 
$ npm run start
# It should crash because you're not connected to docker right now anyway 
6. Go to the Utility folder on the directory root and run the 'deploy-to-docker.sh' file to push it to your Docker repo
# Make sure to update the NEW_VERSION_A and NEW_VERSION_B variables on every change to keep upto date with updated code 
```

> Testing Docker API using two services, with service A pulling list of available containers and parsing them to a simple object with fields 'id' and 'service'

```bash
1. Navigate to the root of the directory using the terminal
# Making sure 'docker-stack.yaml' is in the where you are
# Also make sure you hae docker installed in your system
# Check to make sure that the NEW_VERSIO_A and NEW_VERSION_B match the images being pulled down from the stack
2. Run
$ docker stack deploy -c docker-stack.yaml <your-stack-name>
# Should set up your stack
3. Run
$ docker stack ls
# Should show you current running stacks including your own
4. Run
$ docker service logs <your-stack-name>_serviceA
# Should show logs with the parsed container lists each with 'id' and 'service' fields
(Exclusive to serviceA only)
# Should also show its fullID
# You can run the same to check serviceB using '<your-stack-name>_serviceB'
6. Run
$ docker stats
# To view how the containers are doing (Slightly high CPU usage because it's running a 'forever' npm package to simulate server waiting for requests)
7. Run 
$ docker stack rm <your-stack-name>
# To remove the stack
# in case of undeleted containers, run
(docker rm $(docker ps -a -q))
which removes all Docker containers not being actively used
```