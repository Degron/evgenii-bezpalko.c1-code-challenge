var Promise = require('bluebird'),
    expect = require('expect'),
    sugar = require('sugar');
sugar.Array.extend();

module.exports = function () {
    this.When(/^I submit a new measurement as follows:$/, function (measurements_data) {
        return Promise.all(measurements_data.hashes().map((measurement_data) => {
            return this.post_measurements(measurement_data).then((response) => {
                this.statusCode = response.statusCode;
                this.locationHeader = response.locationHeader;
            });
        }))
    })

    this.Then(/^the response has a status code of (.*)$/, function (statusCode) {
        expect(Number(statusCode)).toBe(this.statusCode)
    })

    this.Then(/^the Location header has the path (.*)$/, function (locationHeader) {
        expect(locationHeader.replace(/['"]+/g, '')).toBe(this.locationHeader);
    })

    this.When(/^I have submitted new measurements as follows:$/, function (measurements_data) {
        return Promise.all(measurements_data.hashes().map((measurement_data) => {
            return this.post_measurements(measurement_data)
        }))
    })

    this.When(/^I get a measurement for (.*)$/, function (timestamp) {
        return this.get_measurements(timestamp).then((response) => {
            this.statusCode = response.statusCode;
            this.body = response.data;
        });
    })

    this.Then(/^the response body is:$/, function (body) {
        body.hashes().map((measurements) => {
            Object.keys(measurements).forEach((measurement) => {
                if (measurement === 'timestamp')
                    expect(measurements[measurement].replace(/['"]+/g, '')).toBe(this.body[measurement]);
                else
                    expect(Number(measurements[measurement])).toBe(this.body[measurement]);
            })
        })
    })

    this.When(/^I get measurements for (.*)$/, function (day) {
        return this.get_measurements(day).then((response) => {
            this.statusCode = response.statusCode;
            this.body = response.data;
        });
    })

    this.Then(/^the response body is an array of:$/, function (body) {
        var correct_body = this.prepare_table_for_compare(body)

        if (correct_body[0].timestamp) {
            correct_body.sortBy('timestamp');
            this.body.sortBy('timestamp');
        } else {
            correct_body.sortBy('metric', 'stat');
            this.body.sortBy('metric', 'stat');
        }

        expect(correct_body.isEqual(this.body)).toBe(true);
    })

    this.When(/^I replace the measurement for (.*) as follows:$/, function (timestamp, measurements_data) {
        return Promise.all(measurements_data.hashes().map((measurement_data) => {
            return this.put_measurements(measurement_data, timestamp).then((response) => {
                this.statusCode = response.statusCode;
            });
        }))
    })

    this.Then(/^the measurement for (.*) is:$/, function (timestamp, body) {
        return this.get_measurements(timestamp).then((response) => {
            this.body = response.data;
            body.hashes().map((measurements) => {
                Object.keys(measurements).forEach((measurement) => {
                    if (measurement === 'timestamp')
                        expect(measurements[measurement].replace(/['"]+/g, '')).toBe(this.body[measurement]);
                    else
                        expect(Number(measurements[measurement])).toBe(this.body[measurement]);
                })
            })
        });
    })

    this.When(/^I update the measurement for (.*) as follows:$/, function (timestamp, measurements_data) {
        return Promise.all(measurements_data.hashes().map((measurement_data) => {
            return this.patch_measurements(measurement_data, timestamp).then((response) => {
                this.statusCode = response.statusCode;
            });
        }))
    })

    this.When(/^I delete the measurement for (.*)$/, function (timestamp) {
        return this.delete_measurements(timestamp).then((response) => {
            this.statusCode = response.statusCode;
        });
    })

    this.Then(/^the measurement for (.*) does not exist$/, function (timestamp) {
        return this.get_measurements(timestamp).then((response) => {
            expect(response.statusCode).toBe(404);
        });
    });

    this.When(/^I get stats with parameters:$/, function (parameters) {
        var query_string = parameters.hashes().reduce((prev, curr) => {
            prev.push(curr.param + '=' + curr.value);
            return prev
        }, []).join('&')
        return this.get_statistic(query_string).then((response) => {
            this.statusCode = response.statusCode;
            this.body = response.data;
        });
    })

    this.Then(/^the response body is an empty array$/, function () {
        expect([].isEqual(this.body)).toBe(true);
    });
}