const weatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?'
const weatherAPIKey = '19b8547136b89322d77e0706c122753f'
const latLngAPI = 'https://api.opencagedata.com/geocode/v1/json?q='
const latLngAPIKey = '0b251c9c19f64ae5b292ad0419accefb'
const queryURL = 'http://api.openweathermap.org/data/2.5/forecast?q=Philadelphia&appid=19b8547136b89322d77e0706c122753f'
let JSONresponse = ''
let locationResponse = ''
let weatherImgURL = 'http://openweathermap.org/img/wn/'
const uvObj = {2: 'green', 5: 'yellow', 7: 'orange', 10: 'red', 11: 'purple'};

$(document).ready(function() {
        getLocalStorage()
    $("#city-input-submit").on("click", function() {
        let inputValue = $('#city-input').val()
        onCityClick(inputValue)
    });
});

$("#city-history-div").delegate("li", "click", function(e) {
    let inputValue = $(this).text()
    onCityClick(inputValue)
});

function onCityClick(inputValue) {
    console.log('into click event callback')
    getWeatherJSON(inputValue)
    storeCityInput(inputValue)
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
        locationResponse = response
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

function populateToday(city) {
    $("#0-day-city").text(`${locationResponse.results[0].components.city}, ${locationResponse.results[0].components.state}`)
    $("#0-day-time").text(`${moment.unix(JSONresponse.current.dt).format('lll')}`)
    $("#0-day-wimg").attr("src", `${weatherImgURL}${JSONresponse.current.weather[0].icon}@2x.png`)
    $("#0-day-temp").text(`Temperature: ${KtoC(JSONresponse.current.temp).toFixed(0)}`)
    $("#0-day-humi").text(`Humidity: ${JSONresponse.current.humidity}`)
    $("#0-day-wind").text(`Wind: ${JSONresponse.current.wind_speed}`)
    $("#uv-color").text(`${ JSONresponse.current.uvi}`).css("background-color", uvFormat(JSONresponse.current.uvi))
};

function populateNextFive() {
    for ( var i = 1; i < 6; i++ ) {
        $("#card-class").append(`<div class="col mb-4 daily-card">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${moment.unix(JSONresponse.daily[i].dt).format("dddd")}</h5>
                <img src=${weatherImgURL}${JSONresponse.daily[i].weather[0].icon}@2x.png>
                <p class="card-text">HIGH TEMP: ${KtoC(JSONresponse.daily[i].temp.max).toFixed(0)} F</p>
                <p class="card-text">HUMIDITY: ${JSONresponse.daily[i].humidity}%</p>
            </div>
        </div>
    </div>`)
    };
};

/*
1) getLocalStorage()
2) search -> storeCityInput() -> resetPastSearchs()
*/

// list items then runs getLocalStorage() to reset
function resetPastSearches() {
    $("#city-history-div").empty()
};

// adds search term to local storage
function storeCityInput(input) {
    resetPastSearches()
    if (!localStorage.getItem('user-query')) {
        localStorage.setItem('user-query', input)
        getLocalStorage()
    } else {
        let getLocal = localStorage.getItem('user-query')
        localStorage.setItem('user-query', getLocal + ',' + input)
        getLocalStorage()
    }
    
};

// populates list items based on whats in local storage
function getLocalStorage() {
    if ( localStorage.getItem('user-query') ) {
        localStorage.getItem('user-query').split(',').forEach((item) => {
            let newDiv = $("<li>").text(item).attr("class", "list-group-item")
            $("#city-history-div").append(newDiv)
        });
    };
};

// --- conversion and format functions -- //

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

function uvFormat(ind) {
    for (const property in uvObj) {
        if (ind < [property]) {
            return uvObj[property]
        } else if (ind > 11) {
            return 'purple'
        };
    };
};

// only let 10 cities in storage with no repeats 
// mobile responsive
// better start screen
// clear search bar after click