const weatherUrl = 'http://api.openweathermap.org/data/2.5/forecast'
const apiKey = '19b8547136b89322d77e0706c122753f'
const queryURL = 'http://api.openweathermap.org/data/2.5/forecast?q=Philadelphia&appid=19b8547136b89322d77e0706c122753f'
let JSONresponse = ''
let weatherImgURL = 'http://openweathermap.org/img/wn/'

$(document).ready(function() {
    $("#city-input-submit").on("click", function() {
        onCityClick()
    });
});

function onCityClick() {
    let inputValue = $('#city-input').val()
    appendCityToList(inputValue)
    getWeatherJSON(inputValue)
    //populateNextFive()
    //populateToday(inputValue)
    // add item to the city history list
    // hit the api
    // save to local storage
    // limit the amount of entries in storage and on page
    // generate JSON to update the other elements in the page
};

function appendCityToList(city) {
    console.log(city)
    let newDiv = $("<li>").addClass("list-group-item").text(city)
    $("#city-history-div").prepend(newDiv)
};

function getWeatherJSON(city) {
    $.ajax({
        url: weatherUrl + '?q=' + city + '&appid=' + apiKey,
        method: "GET"})
    .then((response) => {
        JSONresponse = response
    }).then(() => {
        console.log(JSONresponse)
        populateToday(city)
    }).then(() => {
        populateNextFive()
    });
};

function KtoC(kTemp) {
    kTemp = parseFloat(kTemp);
    return ((kTemp-273.15)*1.8)+32
};

function populateToday(city) {
    $("#0-day-content").text(`${city} | ${moment.unix(JSONresponse.list[0].dt).format('MM / dd / YYYY')}`)
    $("0-day-wimg").attr("src", `${weatherImgURL}${JSONresponse.list[0].weather[0].icon}@2x.png`)
    $('#0-day-temp').text(`Temperature: ${KtoC(JSONresponse.list[0].main.temp).toFixed(0)}`)
    $('#0-day-humi').text(`Humidity: ${JSONresponse.list[0].main.humidity}`)
    $('#0-day-wind').text(`Wind: ${JSONresponse.list[0].wind.speed}`)
    $('#0-day-uxin').text(`UV Index: `/*need to get UV*/)
};

function populateNextFive() {
    console.log('into populateNextFive')
    for ( var i = 1; i < 6; i++ ) {
        let nextDayDiv = $("<div>").attr("class", "col mb-4")
        let cardHumi = $("<p>").attr("class", "card-text").text(`Humidity: ${JSONresponse.list[i].main.humidity}`)
        let cardTemp = $("<p>").attr("class", "card-text").text(`Temp: ${KtoC(JSONresponse.list[i].main.temp).toFixed(0)}`)
        let cardTitle = $("<h5>").attr("class", "card-title").text(`${moment.unix(JSONresponse.list[i].dt).format('MM / dd / YYYY')} WEATHER`)
        let cardLogo = $("<img>").attr("src", `${weatherImgURL}${JSONresponse.list[0].weather[0].icon}@2x.png`)
        $("#card-class").append(`<div class="col mb-4">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${moment.unix(JSONresponse.list[i].dt).format('MM / dd / YYYY')}</h5>
                ${cardLogo}
                <p class="card-text">TEMPERATURE: ${KtoC(JSONresponse.list[i].main.temp).toFixed(0)} F</p>
                <p class="card-text">HUMIDITY: ${JSONresponse.list[i].main.humidity}%</p>
            </div>
        </div>
    </div>`)
    // moment isnt working here because the object is mutable
    };
};