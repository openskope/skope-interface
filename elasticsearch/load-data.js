var fs = require('fs');
var path = require('path');
var async = require('async');
var parseCSV = require('csv-parse/lib/sync');
var elastic = require('elasticsearch');

var sourcePath = process.argv[2];
var elasticHost = process.env.ELASTIC_HOST || 'localhost:9200';
var httpAuth = process.env.ELASTIC_BASIC_AUTH || 'elastic:changeme';

if (typeof sourcePath === 'undefined') {
  return;
}

sourcePath = path.resolve(process.cwd(), sourcePath);

var csvFileData;

try {
  csvFileData = fs.readFileSync(sourcePath, 'utf8');
} catch (err) {
  console.error('Error while opening the file.', err.message);
  return;
}

var dataItems = parseCSV(csvFileData, {
  auto_parse: true,
  auto_parse_date: false,
  columns: true,
  skip_empty_lines: true,
});

function executeWaterfall (waterfall, x) {
  return waterfall.reduce(function (acc, f) {
    return f(acc);
  }, x);
}

function Nullable (x, parser) {
  if (!Array.isArray(parser)) {
    parser = [ parser ];
  }
  return x === 'null' ? null : executeWaterfall(parser, x);
}

function Str2Ary (str) {
  return str.split(',')
            .map(function (s) { return s.trim() })
            .filter(function (s) { return s.length > 0 });
}

function Str2ISODateStr (str) {
  return (new Date(Date.parse(str))).toISOString();
}

dataItems = dataItems.map(function (item) {
  return {
    Dataset: String(item.Dataset),
    Title: String(item.Title),
    ModelName: String(item.ModelName),
    Creator: String(item.Creator),
    Contributors: String(item.Contributors),
    CreationDate: Nullable(item.CreationDate, Str2ISODateStr),
    Status: String(item.Status),
    Rating: parseInt(item.Rating, 10),
    Keywords: String(item.Keywords),
    ResultTypes: Nullable(item.ResultTypes, Str2Ary),
    StartDate: Nullable(item.StartDate, Str2ISODateStr),
    EndDate: Nullable(item.EndDate, Str2ISODateStr),
    Area: String(item.Area),
    Inputs: Nullable(item.Inputs, Str2Ary),
    Description: String(item.Description),
    Info: Nullable(item.Info, String),
    Reference: Nullable(item.Reference, String),
    Workspace: Nullable(item.Workspace, String),
    Download: Nullable(item.Download, String),
    Create: Nullable(item.Create, String),
  };
});

var esClient = new elastic.Client({
  host: elasticHost,
  apiVersion: '2.4',
  httpAuth: httpAuth,
  log: 'trace',
});

var bulkBody = [];
dataItems.forEach(function (item, index) {
  bulkBody.push({
    index: {
      _index: 'skope',
      _type: 'scenario',
    },
  });
  bulkBody.push(item);
});

esClient.bulk({
  body: bulkBody,
}, function (err, resp) {
  if (err) {
    console.error('Error while executing bulk operation.', err.message);
  } else {
    console.log(resp);
  }

  esClient.close();
});
