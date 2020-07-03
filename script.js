const weatherUrl = 'https://api.openweathermap.org/data/2.5/onecall?'
const weatherAPIKey = '19b8547136b89322d77e0706c122753f'
const latLngAPI = 'https://api.opencagedata.com/geocode/v1/json?q='
const latLngAPIKey = '0b251c9c19f64ae5b292ad0419accefb'
const queryURL = 'http://api.openweathermap.org/data/2.5/forecast?q=Philadelphia&appid=19b8547136b89322d77e0706c122753f'
let JSONresponse = ''
let locationResponse = ''
let weatherImgURL = 'http://openweathermap.org/img/wn/'
const uvObj = {2: 'green', 5: 'yellow', 7: 'orange', 10: 'red', 11: 'purple'};

// fills divs based on click of the search bar
$(document).ready(function() {
        getLocalStorage()
    $("#city-input-submit").on("click", function() {
        let inputValue = $('#city-input').val()
        onCityClick(inputValue)
    });
});

// fills divs based on click in the history bar
$("#city-history-div").delegate("li", "click", function(e) {
    let inputValue = $(this).text()
    onCityClick(inputValue)
});

// callback function for click events
function onCityClick(inputValue) {
    getWeatherJSON(inputValue)
    storeCityInput(inputValue)
};

// adds current search to city history div
function appendCityToList(city) {
    let newDiv = $("<li>").addClass("list-group-item").text(city)
    $("#city-history-div").prepend(newDiv)
};

/* --- AJAX --- */
// weather LAT LNG & WEATHER AJAX call
function getWeatherJSON(city) {
    let searchLat
    let searchLng
    
    // send query to opencage with user search to get lat lng data for that city
    $.ajax({
        url: latLngAPI + city + '&key=' + latLngAPIKey,
        method: 'GET'})
    .then((response) => {
        locationResponse = response
        searchLat = response.results[0].geometry.lat
        searchLng = response.results[0].geometry.lng
    // take the lat lng data and add it to the open weather api query
    }).then(() => {
        $.ajax({
            url: weatherUrl + 'lat=' + searchLat + '&lon=' + searchLng + '&exclude=minutely,hourly&appid=' + weatherAPIKey,
            method: "GET"})
        .then((response) => {
            JSONresponse = response
        // populate global weather object
        }).then(() => {
            populateToday(city)
        // remove all previous 5 day forcast then repopluate with updated list
        }).then(() => {
            $("#card-class").empty();
            populateNextFive()
        // if 200 add the search to the history
        }).then((jqXHR) => {
            if ( jqXHR.status === 200 ) {
                appendCityToList(city)
            }
        // exception manager (still buggy)
        }).fail(function (jqXHR, exception) {
            if ( jqXHR.status !== 200 ) {
                $("#city-input").val()
                $("city-input").attr("placeholder", "try again!")
            } else if ( exception ) {
                $("#city-input").val()
            }
        });
    });
};

// populates current day div object with openweather response
function populateToday(city) {
    $("#0-day-city").text(`${locationResponse.results[0].components.city}, ${locationResponse.results[0].components.state}`)
    $("#0-day-time").text(`${moment.unix(JSONresponse.current.dt).format('lll')}`)
    $("#0-day-wimg").attr("src", `${weatherImgURL}${JSONresponse.current.weather[0].icon}@2x.png`).attr("alt", "image icon")
    $("#0-day-temp").text(`Temperature: ${KtoC(JSONresponse.current.temp).toFixed(0)}°F`)
    $("#0-day-humi").text(`Humidity: ${JSONresponse.current.humidity}%`)
    $("#0-day-wind").text(`Wind: ${JSONresponse.current.wind_speed}mph`)
    $("#uv-color").text(`${ JSONresponse.current.uvi}`).css("background-color", uvFormat(JSONresponse.current.uvi))
};

// populates 5 day forcase with openweather response
function populateNextFive() {
    for ( var i = 1; i < 6; i++ ) {
        $("#card-class").append(`<div class="col mb-4 daily-card">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${moment.unix(JSONresponse.daily[i].dt).format("dddd")}</h5>
                <img alt= "weather image" src=${weatherImgURL}${JSONresponse.daily[i].weather[0].icon}@2x.png>
                <p class="card-text">HIGH TEMP: ${KtoC(JSONresponse.daily[i].temp.max).toFixed(0)}°F</p>
                <p class="card-text">HUMIDITY: ${JSONresponse.daily[i].humidity}%</p>
            </div>
        </div>
    </div>`)
    };
};

// list items then runs getLocalStorage() to reset
function resetPastSearches() {
    $("#city-history-div").empty()
};

// clear previous searches -> adds search term to local storage -> repopulate previous seaches after storage update
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
            $("#city-history-div").prepend(newDiv)
        });
    };
};

// --- conversion and format functions -- //

//kelvin to farenheight
function KtoC(kTemp) {
    kTemp = parseFloat(kTemp);
    return ((kTemp-273.15)*1.8)+32
};

//converts unix time to human readable
function unixToDate(unix) {
    let milliseconds = unix * 1000
    let dateObject = new Date(milliseconds)
    let humanReadFormat = dateObject.toLocaleDateString()
    return humanReadFormat
};

// uses k/v looping to set formatting for the UV index
function uvFormat(ind) {
    for (const property in uvObj) {
        if (ind < [property]) {
            return uvObj[property]
        } else if (ind > 11) {
            return 'purple'
        };
    };
};