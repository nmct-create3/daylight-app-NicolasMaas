// _ = helper functions
let _calculateTimeDistance = (startTime, endTime) => {
	// Bereken hoeveel tijd er tussen deze twee periodes is.
	// Tip: werk met minuten.
	startTime = _convertTime(startTime);
	endTime = _convertTime(endTime);

	var startTime = new Date("01/01/2007 " + startTime);
	var endTime = new Date("01/01/2007 " + endTime);

	let timeDiff = endTime - startTime;
	let diff = new Date(timeDiff);

	let minutes = ((diff.getHours()*60)-60) + diff.getMinutes();
	//console.log(minutes);

	return minutes;
}

// Deze functie kan een am/pm tijd omzetten naar een 24u tijdsnotatie, deze krijg je dus al. Alsjeblieft, veel plezier ermee.
let _convertTime = (t) => {
	/* Convert 12 ( am / pm ) naar 24HR */
	let time = new Date('0001-01-01 ' + t);
	let formatted = time.getHours() + ':' + ('0' + time.getMinutes()).slice(-2);
	return formatted;
}

// 5 TODO: maak updateSun functie
let updateSun = (totalMinutes, diffTime) => {
	let percentage = Math.round((diffTime / totalMinutes) * 100);
	let sun = document.querySelector('.js-sun');

	console.log(percentage);	

	let midDay = (totalMinutes / 2);
	let timeUp = totalMinutes - diffTime;

	if (timeUp > midDay) {
		bottom = 100 - ((timeUp - midDay) / midDay) * 100;
		sun.style.bottom = bottom + '%';
	}

	else {
		bottom = (timeUp / midDay) * 100;
		sun.style.bottom = bottom + '%';
	}
	
	if (percentage > 100) {
		sun.style.left = '100%';
		sun.style.bottom = '0%';
	}
	else {
		sun.style.left = percentage + '%';
	}

}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = ( totalMinutes, sunrise ) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.

	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	// Bepaal het aantal minuten dat de zon al op is.
	let today = new Date;
	let sun = document.querySelector('.js-sun');
	let currentTime = today.getHours() + ":" + today.getMinutes();
	sun.setAttribute("data-time", currentTime);
	let diffTime = _calculateTimeDistance(sunrise, currentTime);
	let timeLeft = totalMinutes - diffTime;

	if (timeLeft <= 0) {
		document.querySelector('.js-time-left').innerHTML = "0";
	}

	else {
		document.querySelector('.js-time-left').innerHTML = timeLeft;
	}

	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	// Vergeet niet om het resterende aantal minuten in te vullen.
	updateSun(totalMinutes, diffTime);

	if (timeLeft <= 0) {
		document.querySelector('html').className = ('is-night');
	}

	else {
		document.querySelector('html').className = ('is-day');
	}
	// Nu maken we een functie die de zon elke minuut zal updaten
	// Bekijk of de zon niet nog onder of reeds onder is
	
	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
}

// 3 Met de data van de API kunnen we de app opvullen
let showResult = ( queryResponse ) => {
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	console.log(queryResponse);
	let json = JSON.parse(JSON.stringify(queryResponse));

	let location = document.querySelector(".js-location");
	location.innerHTML = json.query.results.channel.location.city + ", " + json.query.results.channel.location.country;

	let sunrise = document.querySelector(".js-sunrise");
	let sunrise_js = _convertTime(json.query.results.channel.astronomy.sunrise);
	sunrise.innerHTML = sunrise_js;
	//console.log(sunrise_js);

	let sunset = document.querySelector(".js-sunset");
	let sunset_js = _convertTime(json.query.results.channel.astronomy.sunset);
	sunset.innerHTML = sunset_js;
	//console.log(sunset_js);

	// Hier gaan we een functie oproepen die de zon een bepaalde postie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	placeSunAndStartMoving(_calculateTimeDistance(sunrise_js, sunset_js), sunrise_js);

	setInterval(function() {placeSunAndStartMoving(_calculateTimeDistance(sunrise_js, sunset_js), sunrise_js);}, 60000);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = ( lat, lon ) => {
	// Eerst bouwen we onze url op
	// en doen we een query met de Yahoo query language

	//KLASIKAAL
	const ENDPOINT = "https://query.yahooapis.com/v1/public/yql?q=select%20astronomy%2C%20location%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22(" + lat + "%2C%20" + lon + ")%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
	let query = 'select astronomy, location from weather.forecast where woeid in (select woeid from geo.places(1) where text="(' + lat + ', ' + lon + ')")';

	let url = "https://query.yahooapis.com/v1/public/yql?q=select%20astronomy%2C%20location%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22(" + lat + "%2C%20" + lon + ")%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
	console.log(url);
	// Met de fetch API proberen we de data op te halen.
	// Als dat gelukt is, gaan we naar onze showResult functie.
	fetch(url).then(res => res.json()).then(response => showResult(response)).catch(error => console.error("Error: ", error));
}

document.addEventListener( 'DOMContentLoaded', function () {
	// 1 We will query the API with longitude and latitude.
	getAPI( 50.8027841, 3.2097454 );
});
