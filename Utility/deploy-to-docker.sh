export NEW_VERSION_A=v1.10
export NEW_VERSION_B=v1.10

docker build -t eliudarudo/simple-events-service-a:dev -t eliudarudo/simple-events-service-a:$NEW_VERSION_A -f ../serviceA/Dockerfile ../serviceA
docker build -t eliudarudo/simple-events-service-b:dev -t eliudarudo/simple-events-service-b:$NEW_VERSION_B -f ../serviceB/Dockerfile ../serviceB

docker push eliudarudo/simple-events-service-a:dev &&  docker push eliudarudo/simple-events-service-a:$NEW_VERSION_A
docker push eliudarudo/simple-events-service-b:dev &&  docker push eliudarudo/simple-events-service-b:$NEW_VERSION_B