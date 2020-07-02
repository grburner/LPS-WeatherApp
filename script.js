const weatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?'
const weatherAPIKey = '19b8547136b89322d77e0706c122753f'
const latLngAPI = 'https://api.opencagedata.com/geocode/v1/json?q='
const latLngAPIKey = '0b251c9c19f64ae5b292ad0419accefb'
const queryURL = 'http://api.openweathermap.org/data/2.5/forecast?q=Philadelphia&appid=19b8547136b89322d77e0706c122753f'
let JSONresponse = ''
let weatherImgURL = 'http://openweathermap.org/img/wn/'

$(document).ready(function() {
    if ( localStorage.getItem('user-query') ) {
        getLocalStorage()
    }
    $("#city-input-submit").on("click", function() {
        let inputValue = $('#city-input').val()
        onCityClick(inputValue)
    });
    $(".list-group-item").on("click", function(e) {
        let inputValue = $(this).text()
        onCityClick(inputValue)
    });
});

function onCityClick(inputValue) {
    //let inputValue = $('#city-input').val()
    //appendCityToList(inputValue)
    getWeatherJSON(inputValue)
    storeCityInput(inputValue)
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
    let searchLat
    let searchLng
    $.ajax({
        url: latLngAPI + city + '&key=' + latLngAPIKey,
        method: 'GET'})
        //use $params to encode user input to account for spaces/special chars
    .then((response) => {
        searchLat = response.results[0].geometry.lat
        searchLng = response.results[0].geometry.lng
    }).then(() => {
        $.ajax({
            url: weatherUrl + 'lat=' + searchLat + '&lon=' + searchLng + '&exclude=minutely,hourly&appid=' + weatherAPIKey,
            method: "GET"})
        .then((response) => {
            JSONresponse = response
        }).then(() => {
            console.log(JSONresponse)
            populateToday(city)
        }).then(() => {
            $("#card-class").empty();
            populateNextFive()
        }).then((jqXHR, exception) => {
            if ( jqXHR.status === 200 ) {
                appendCityToList(city)
            }
        }).fail(function (jqXHR, exception) {
            if ( jqXHR.status !== 200 ) {
                console.log ('error: ' + jqXHR.status)
                $("#city-input").val()
                $("city-input").attr("placeholder", "try again!")
            } else if ( exception ) {
                console.log('exception: ' + exception)
                $("#city-input").val()/*.attr("placeholder", "api issue...")*/
            }
        });
        // fail case needs work
    });
};

function KtoC(kTemp) {
    kTemp = parseFloat(kTemp);
    return ((kTemp-273.15)*1.8)+32
};

function unixToDate(unix) {
    let milliseconds = unix * 1000
    let dateObject = new Date(milliseconds)
    let humanReadFormat = dateObject.toLocaleDateString()
    return humanReadFormat
};

function populateToday(city) {
    $("#0-day-content").text(`${city} | ${moment.unix(JSONresponse.current.dt).format('lll')}`)
    $("0-day-wimg").attr("src", `${weatherImgURL}${JSONresponse.current.weather[0].icon}@2x.png`)
    $('#0-day-temp').text(`Temperature: ${KtoC(JSONresponse.current.temp).toFixed(0)}`)
    $('#0-day-humi').text(`Humidity: ${JSONresponse.current.humidity}`)
    $('#0-day-wind').text(`Wind: ${JSONresponse.current.wind_speed}`)
    $('#0-day-uxin').text(`UV Index: ${JSONresponse.current.uvi}`)
};

function populateNextFive() {
    console.log('into populateNextFive')
    for ( var i = 1; i < 6; i++ ) {
        $("#card-class").append(`<div class="col mb-4 daily-card">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${moment.unix(JSONresponse.daily[i].dt).format('MM / dd / YYYY')}</h5>
                <img src=${weatherImgURL}${JSONresponse.daily[i].weather[0].icon}@2x.png>
                <p class="card-text">HIGH TEMP: ${KtoC(JSONresponse.daily[i].temp.max).toFixed(0)} F</p>
                <p class="card-text">HUMIDITY: ${JSONresponse.daily[i].humidity}%</p>
            </div>
        </div>
    </div>`)
    };
};

function storeCityInput(input) {
    let newDiv = $("<li>").text(input).attr("class", "list-group-item")
    $("#city-history-div").prepend(newDiv)

    let setStorageArray = []
    $(".list-group-item").each(function() {
        console.log($(this).text())
        setStorageArray.push($(this).text())
    });
    localStorage.setItem('user-query', setStorageArray)
};

function getLocalStorage() {(
    localStorage.getItem('user-query').split(',').forEach((item) => {
        let newDiv = $("<li>").text(item).attr("class", "list-group-item")
        $("#city-history-div").append(newDiv)
    })
)};