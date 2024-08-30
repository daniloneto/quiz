docker build -t quizz .
docker run -p 3000:3000 -v /mnt/c/Projetos/quiz quizz
docker stop $(docker ps -q)