var readlineSync = require('readline-sync');

const APP_KEY = 'e92dcffed66741b09040d3ff8bdc58c7';
const NUMBER_OF_STOPS = 2;
const BUSES_PER_STOP = 5;

const fetchData = async () => {
    try {
        const postcode = readlineSync.question('Enter postcode: ');
        // Get details about the postcode
        const postcodeResponse = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
        const postcodeJson = await postcodeResponse.json();
        // Get nearest stops to this postcode
        const stopsResponse = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${postcodeJson.result.latitude}&lon=${postcodeJson.result.longitude}&stopTypes=NaptanPublicBusCoachTram&app_key=${APP_KEY}`);
        const stopsJson = await stopsResponse.json();
        // Get the top stops
        const stops = stopsJson.stopPoints.slice(0, NUMBER_OF_STOPS);

        for (const stop of stops) {
            console.log(`Buses at ${stop.commonName}:`);
            // Get next buses at this stop
            const nextBusesResponse = await fetch(`https://api.tfl.gov.uk/StopPoint/${stop.naptanId}/Arrivals?app_key=${APP_KEY}`);
            const nextBusesJson = await nextBusesResponse.json();
            nextBusesJson.sort((a: any, b: any) => new Date(a.expectedArrival).getTime() - new Date(b.expectedArrival).getTime());

            for (const busJson of nextBusesJson.slice(0, BUSES_PER_STOP)) {
                const busDate: Date = new Date(busJson.expectedArrival);
                // const busTime: string = `${busDate.getHours()}:${busDate.getMinutes()}:${busDate.getSeconds()}`;
                console.log(`Line ${busJson.lineId} towards ${busJson.towards} expected at ${busDate.toTimeString().slice(0,8)}`);
            }
            console.log();
        }
    } catch (error) {
        console.error(error);
    } finally {
        console.log("Request complete");
    }
}

fetchData();