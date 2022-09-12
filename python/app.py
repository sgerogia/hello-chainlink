#!/usr/bin/env python3

import requests
import os
from flask import Flask, json, request

URL = "https://aerodatabox.p.rapidapi.com/flights/number/{f}/{d}"
HEADERS = {
    'User-Agent': 'curl/7.64.1',
    'Content-Type': 'application/json',
    'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com',
    # Replace your own API key below
    'X-RapidAPI-Key': os.getenv('RAPIDAPI_TOKEN')
}

api = Flask("AeroDataBox Flight Data Connector")


@api.route('/data', methods=['POST'])
def get_flight_data():

    data = request.get_json(force=True)

    flight = None
    try:
        api.logger.info('Requesting flight "%s" and date "%s"', data['flight'], data['date'])
        flight = requests.get(
            URL.format(f=data['flight'], d=data['date']),
            headers=HEADERS
        ).json()
    except Exception as e:
        return "Error requesting API", 500

    results = {}
    try:
        results['status'] = flight[0]['status']
        arrival = flight[0]['arrival']
        results['iata'] = arrival['airport']['iata']
        results['scheduledTimeUtc'] = arrival['scheduledTimeUtc']
        if ('actualTimeUtc' in arrival):
            results['actualTimeUtc'] = arrival['actualTimeUtc']
        else:
            results['actualTimeUtc'] = ''

        api.logger.info('Results: %s', results)
    except Exception as e:
        return "Error parsing API response", 500

    return json.dumps(results), 200

if __name__ == "__main__":
    api.run(debug=True)