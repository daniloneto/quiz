#!/bin/sh
# Espera o Redis estar acessível antes de iniciar o app
until nc -z -v -w30 $REDIS_HOST $REDIS_PORT
do
  echo "Aguardando Redis na porta $REDIS_PORT..."
  sleep 1
done
echo "Redis está disponível!"
