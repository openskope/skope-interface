#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

VERSION=docker.elastic.co/elasticsearch/elasticsearch-oss:6.1.1

docker run \
    --rm \
    -p 9200:9200 \
    -v $DIR/data:/usr/share/elasticsearch/data \
    -v $DIR/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
    $VERSION
