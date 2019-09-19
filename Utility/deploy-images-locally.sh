docker build -t eliudarudo/events-communication-consuming-frontend:dev -f ../consuming-frontend/Dockerfile ../consuming-frontend
docker build -t eliudarudo/events-communication-event-service:dev -f ../events-service/Dockerfile ../events-service
docker build -t eliudarudo/events-communication-consuming-backend:dev -f ../consuming-backend/Dockerfile ../consuming-backend
