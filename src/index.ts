const fetchData = async () => {
    try {

        const response = await fetch("https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals?app_key=e92dcffed66741b09040d3ff8bdc58c7");
        const responseJson = await response.json();
        console.log(responseJson);
    } catch (error) {
        console.error(error);
    } finally {
        console.log("Request complete");
    }
}

fetchData();