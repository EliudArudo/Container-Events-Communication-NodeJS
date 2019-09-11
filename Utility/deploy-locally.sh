docker build -t eliudarudo/events-communication-frontend:dev -f ../frontend-service/Dockerfile ../frontend-service
docker build -t eliudarudo/events-communication-events:dev -f ../events-service/Dockerfile ../events-service
docker build -t eliudarudo/events-communication-backend:dev -f ../backend-service/Dockerfile ../backend-service
