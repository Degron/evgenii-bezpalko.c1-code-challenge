var http = require('http'),
    Promise = require('bluebird');

var options = {
    hostname: 'localhost',
    port: 3000,
    headers: {
        'Content-Type': 'application/json'
    }
}

function World() {

    this.post_measurements = function (measurement_data) {
        options.method = 'POST';
        options.path = '/measurements';
        return new Promise((resolve, reject) => {
            var request = http.request(options, (response) => {

                response.on('data', (chunk) => {
                    console.log(`BODY: ${chunk}`);
                });
                response.on('end', () => {
                    resolve({ statusCode: response.statusCode, locationHeader: response.headers.location });
                });
            });

            request.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
                reject(e);
            });

            if (measurement_data.timestamp)
                measurement_data.timestamp = measurement_data.timestamp.replace(/['"]+/g, '');

            var post_data = JSON.stringify(measurement_data);

            request.write(post_data);
            request.end()
        })
    }

    this.get_measurements = function (timestamp) {
        options.method = 'GET';
        options.path = "/measurements/" + timestamp.replace(/['"]+/g, '');

        return new Promise((resolve, reject) => {
            var request = http.request(options, (response) => {
                var data = "";

                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    if (data) { data = JSON.parse(data); }
                    resolve({ data: data, statusCode: response.statusCode });
                });
            });

            request.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
                reject(e);
            });

            request.end();
        })
    }

    this.put_measurements = function (measurement_data, timestamp) {
        if (measurement_data.timestamp)
            measurement_data.timestamp = measurement_data.timestamp.replace(/['"]+/g, '');

        options.method = 'PUT';
        options.path = "/measurements/" + timestamp.replace(/['"]+/g, '');

        return new Promise((resolve, reject) => {
            var request = http.request(options, (response) => {
                var data = "";

                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    if (data) { data = JSON.parse(data); }
                    resolve({ data: data, statusCode: response.statusCode });
                });
            });

            request.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
                reject(e);
            });

            var post_data = JSON.stringify(measurement_data);

            request.write(post_data);
            request.end();
        })
    }

    this.patch_measurements = function (measurement_data, timestamp) {
        if (measurement_data.timestamp)
            measurement_data.timestamp = measurement_data.timestamp.replace(/['"]+/g, '');

        options.method = 'PATCH';
        options.path = "/measurements/" + timestamp.replace(/['"]+/g, '');

        return new Promise((resolve, reject) => {
            var request = http.request(options, (response) => {
                var data = "";

                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    if (data) { data = JSON.parse(data); }
                    resolve({ data: data, statusCode: response.statusCode });
                });
            });

            request.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
                reject(e);
            });

            var post_data = JSON.stringify(measurement_data);

            request.write(post_data);
            request.end();
        })
    }

    this.delete_measurements = function (timestamp) {
        options.method = 'DELETE';
        options.path = "/measurements/" + timestamp.replace(/['"]+/g, '');

        return new Promise((resolve, reject) => {
            var request = http.request(options, (response) => {
                var data = "";

                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    if (data) { data = JSON.parse(data); }
                    resolve({ data: data, statusCode: response.statusCode });
                });
            });

            request.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
                reject(e);
            });

            request.end();
        })
    }

    this.get_statistic = function (query_string) {
        options.method = 'GET';
        options.path = "/stats/?" + query_string;

        return new Promise((resolve, reject) => {
            var request = http.request(options, (response) => {
                var data = "";

                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    if (data) { data = JSON.parse(data); }
                    resolve({ data: data, statusCode: response.statusCode });
                });
            });

            request.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
                reject(e);
            });

            request.end();
        })
    }

    this.prepare_table_for_compare = function (correct_table) {
        return correct_table.hashes().map((row) => {
            var cach = {};
            Object.keys(row).forEach((item) => {
                var value = row[item].replace(/['"]+/g, '');
                if (item !== 'timestamp' && item !== 'stat' && item !== 'metric')
                    value = Number(value);
                cach[item] = value;
            })
            return cach;
        })
    }

}

module.exports = function () {
    this.World = World
}
