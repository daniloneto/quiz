docker build -t quizz .
docker run -p 3000:3000 -v /mnt/c/Projetos/quiz quizz
docker stop $(docker ps -q)
------------
docker-compose up --build
docker-compose down

lista todos os containers up
docker ps

conecta no container
docker exec -it projeto-quiz_frontend_1 /bin/sh

força o nodemon a restartar
touch server.js 