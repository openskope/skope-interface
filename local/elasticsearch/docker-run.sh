#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# VERSION=docker.elastic.co/elasticsearch/elasticsearch:5.5.0
VERSION=elasticsearch:2

docker run \
    --rm \
    -p 9200:9200 \
    -v $DIR/data:/usr/share/elasticsearch/data \
    -v $DIR/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
    $VERSION
