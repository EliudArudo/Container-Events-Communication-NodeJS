# docker build -t eliudarudo/events-communication-consuming-frontend:dev -f ../consuming-frontend/Dockerfile ../consuming-frontend
# docker build -t eliudarudo/events-communication-event-service:dev -f ../events-service/Dockerfile ../events-service
# docker build -t eliudarudo/events-communication-consuming-backend:dev -f ../consuming-backend/Dockerfile ../consuming-backend

# docker push eliudarudo/events-communication-consuming-frontend:dev
# docker push eliudarudo/events-communication-event-service:dev
# docker push eliudarudo/events-communication-consuming-backend:dev

export COLLECTIVE_VERSION=v0.1

docker build -t eliudarudo/events-communication-consuming-frontend:$COLLECTIVE_VERSION -f ../consuming-frontend/Dockerfile ../consuming-frontend
docker build -t eliudarudo/events-communication-event-service:$COLLECTIVE_VERSION -f ../events-service/Dockerfile ../events-service
docker build -t eliudarudo/events-communication-consuming-backend:$COLLECTIVE_VERSION -f ../consuming-backend/Dockerfile ../consuming-backend

docker push eliudarudo/events-communication-consuming-frontend:$COLLECTIVE_VERSION
docker push eliudarudo/events-communication-event-service:$COLLECTIVE_VERSION
docker push eliudarudo/events-communication-consuming-backend:$COLLECTIVE_VERSION