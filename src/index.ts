let readlineSync = require('readline-sync');

const APP_KEY: string = 'e92dcffed66741b09040d3ff8bdc58c7';
const NUMBER_OF_STOPS: number = 2;
const BUSES_PER_STOP: number = 5;

const getPostcodeData = async () => {
    const postcode = readlineSync.question('Enter postcode: ');
    const postcodeResponse = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
    return await postcodeResponse.json();
}

const getNearestStops = async (lat: number, long: number) => {
    const stopsResponse = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${long}&stopTypes=NaptanPublicBusCoachTram&app_key=${APP_KEY}`);
    const stopsJson = await stopsResponse.json();
    return stopsJson.stopPoints.slice(0, NUMBER_OF_STOPS);
}

const getNextBuses = async (stopId: number) => {
    const nextBusesResponse = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals?app_key=${APP_KEY}`);
    const nextBusesJson = await nextBusesResponse.json();
    nextBusesJson.sort((a: any, b: any) => new Date(a.expectedArrival).getTime() - new Date(b.expectedArrival).getTime());
    return nextBusesJson;
}

const fetchData = async () => {
    try {
        const postcodeJson = await getPostcodeData();
        const stops = await getNearestStops(postcodeJson.result.latitude, postcodeJson.result.longitude);

        for (const stop of stops) {
            console.log(`Buses at ${stop.commonName} (${Math.round(stop.distance)} metres away):`);
            const nextBuses = await getNextBuses(stop.naptanId);

            for (const busJson of nextBuses.slice(0, BUSES_PER_STOP)) {
                const busDate: Date = new Date(busJson.expectedArrival);
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