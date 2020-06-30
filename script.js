const weatherUrl = 'http://api.openweathermap.org/data/2.5/forecast'
const apiKey = '19b8547136b89322d77e0706c122753f'
const queryURL = 'http://api.openweathermap.org/data/2.5/forecast?q=Philadelphia&appid=19b8547136b89322d77e0706c122753f'
let JSONresponse = ''

$(document).ready(function() {
    $("#city-input-submit").on("click", function() {
        onCityClick()
    });
});

function onCityClick() {
    let inputValue = $('#city-input').val()
    appendCityToList(inputValue)
    getWeatherJSON(inputValue)
    populateToday(inputValue)
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

// let ajaxParams = function(city) {
//     ajaxObj = new Object();
//     ajaxObj.q = city
//     ajaxObj.appid = apiKey
//     console.log(JSON.stringify(ajaxObj))
//     return $.param(ajaxObj)
// };

function getWeatherJSON(city) {
    $.ajax({
        url: weatherUrl + '?q=' + city + '&appid=' + apiKey,
        method: "GET"})
    .then((response) => {
        JSONresponse = response
    });
};

// function getWeatherJSON() {
//     $.ajax({
//         url: queryURL,
//         method: "GET"
//       }).then(function(response) {
//           console.log(JSON.stringify(response))
//       });
// };

function populateToday(city) {
    $("#0-day-content").text(`${city} | ${moment.unix(response[0].dt).format('MM / dd / YYYY')} | WEATHER ICON`)
};