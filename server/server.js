"use strict"

const co = require("co")
var express = require("express"),
  bodyParser = require('body-parser');
const app = express();

var db = {};

app.use(bodyParser.json());

app.post("/measurements", function (request, response) {
  if (validate_measurements(request.body) && request.body.timestamp) {
    save_measurements(request.body);
    response.location('/measurements/' + request.body.timestamp);
    response.status(201).end()
  }
  else {
    response.status(400).end()
  }
})

app.get("/measurements/:timestamp", function (request, response) {
  var measurement = get_measurements(request.params.timestamp);

  if (measurement) {
    response.status(200);
    response.send(measurement).end();
  }
  else {
    response.status(404).end();
  }
})

app.get("/stats", function (request, response) {
  var statistic = get_statistics(request.query);

  if (statistic) {
    response.status(200);
    response.send(statistic).end();
  }
  else {
    response.status(404).end();
  }
})

app.put("/measurements/:timestamp", function (request, response) {
  var valid_timestamp = validate_timestamp(request.body, request.params.timestamp);
  var valid_measurements = validate_measurements(request.body);

  if (valid_timestamp && valid_measurements) {
    var measurement = put_measurements(request.body);
  }

  if (measurement) {
    response.status(204);
    response.send().end();
  } else if (valid_measurements && valid_timestamp && !measurement) {
    response.status(404).end();
  } else if (!valid_timestamp && valid_measurements) {
    response.status(409).end();
  } else {
    response.status(400).end();
  }
})

app.patch("/measurements/:timestamp", function (request, response) {
  var valid_timestamp = validate_timestamp(request.body, request.params.timestamp);
  var valid_measurements = validate_measurements(request.body);

  if (valid_timestamp && valid_measurements) {
    var measurement = put_measurements(request.body);
  }

  if (measurement) {
    response.status(204);
    response.send().end();
  } else if (valid_measurements && valid_timestamp && !measurement) {
    response.status(404).end();
  } else if (!valid_timestamp && valid_measurements) {
    response.status(409).end();
  } else {
    response.status(400).end();
  }
})

app.delete("/measurements/:timestamp", function (request, response) {
  var measurement = get_measurements(request.params.timestamp);

  if (measurement) {
    delete_measurement(measurement);
    response.status(204);
    response.send().end();
  }
  else {
    response.status(404).end();
  }
})

function save_measurements(measurements) {
  var date = Date.parse(measurements.timestamp);

  db[date] = {};
  Object.keys(measurements).forEach((key) => {
    if (key !== 'timestamp')
      db[date][key] = (measurements[key] === "") ? null : Number(measurements[key]);
    else
      db[date][key] = measurements[key];
  })
}

function put_measurements(measurements) {
  var date = Date.parse(measurements.timestamp);
  var records = db[date];
  if (records) {
    Object.keys(measurements).forEach((key) => {
      if (key !== 'timestamp')
        records[key] = Number(measurements[key]);
      else
        records[key] = measurements[key];
    })
  }
  return records;
}

function get_measurements(timestamp) {
  var fromDateTime = Date.parse(timestamp);
  var toDateTime = fromDateTime + 24 * 60 * 60 * 1000;

  if (timestamp.length === 24) {
    return db[fromDateTime];
  } else {
    var collection = get_records_from_to_date_time(fromDateTime, toDateTime);
  }
  return collection;
}

function delete_measurement(measurement) {
  delete db[Date.parse(measurement.timestamp)];
}

function validate_measurements(measurements) {
  return !(Object.keys(measurements).some((key) => {
    if (key !== 'timestamp')
      return isNaN(measurements[key]);
  }))
}

function validate_timestamp(measurements, timestamp) {
  return measurements.timestamp === timestamp;
}

function get_statistics(parameters) {
  var fromDateTime = Date.parse(parameters.fromDateTime);
  var toDateTime = Date.parse(parameters.toDateTime);
  var metric = (parameters.metric instanceof Array) ? parameters.metric : [parameters.metric];
  var stat = (parameters.stat instanceof Array) ? parameters.stat : [parameters.stat];
  var records = get_records_from_to_date_time(fromDateTime, toDateTime);
  var collection = [];

  stat.forEach((key) => {
    metric.forEach((item) => {
      var data = { metric: item };
      switch (key) {
        case "min":
          var value = get_min(records, item);
          break;

        case "max":
          var value = get_max(records, item);
          break;

        default:
          var value = get_average(records, item);
          break;
      }
      data.stat = key;
      data.value = value;
      if (value)
        collection.push(data);
    })
  })

  return collection;
}

function get_min(records, metric) {
  var min = records.reduce(function (prev, curr) {
    if (prev[metric] !== null && curr[metric] !== null)
      return (prev[metric] < curr[metric]) ? prev : curr;
    else if (curr[metric] === prev[metric])
      return prev;
    else
      return prev[metric] !== null ? prev : curr;
  })
  return min[metric];
}

function get_max(records, metric) {
  var max = records.reduce(function (prev, curr) {
    return (prev[metric] > curr[metric]) || curr[metric] === null ? prev : curr;
  })
  return max[metric];
}

function get_average(records, metric) {
  //Not totally understand!!! Why value of average computes like this. (Test case)
  // 
  // var sum = 0;
  // var num = 0;
  // records.forEach((row) => {
  //   sum = sum + row[metric];
  //   row[metric] !== null ? num += 1 : num += 0;
  // })
  // return sum / num;


  var min = get_min(records, metric);
  var max = get_max(records, metric);
  return (max + min) / 2
}

function get_records_from_to_date_time(fromDateTime, toDateTime) {
  var collection = Object.keys(db).filter((date) => {
    return (Number(date) >= fromDateTime && Number(date) < toDateTime)
  })
  collection = collection.map((index) => {
    return db[index]
  });

  if (collection.length > 0)
    return collection;
  else
    return false;
}


app.listen(process.env['PORT'] || 3000)
console.log("Listening on port " + (process.env['PORT'] || 3000))