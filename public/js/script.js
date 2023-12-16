let countries = [];
let index1 = 0;
let index2 = 0;
let population2 = 0;

async function getCountries() {
  const result = await fetch("https://restcountries.com/v3.1/all");
  const json = await result.json();

  json.forEach((country) => {
    countries.push([
      country.name.common,
      country.flags.png,
      country.population,
    ]);
  });

  update("start");
}

function update(mode) {
  if (mode === "start") {
    index1 = Math.floor(Math.random() * countries.length);
    index2 = Math.floor(Math.random() * countries.length);
    while (index1 === index2) {
      index2 = Math.floor(Math.random() * countries.length);
    }
  } else {
    index1 = index2;
    index2 = Math.floor(Math.random() * countries.length);
    while (index1 === index2) {
      index2 = Math.floor(Math.random() * countries.length);
    }
    document.getElementById("pop").innerHTML =
      "Population: " + population2.toLocaleString();
  }
  document.getElementById("c1").innerHTML = countries[index1][0];
  document.getElementById("f1").src = countries[index1][1];
  document.getElementById("c2").innerHTML = countries[index2][0];
  document.getElementById("f2").src = countries[index2][1];
}

async function check(id) {
  const country1 = document.getElementById("c1").innerHTML;
  const country2 = document.getElementById("c2").innerHTML;

  population1 = countries[index1][2];
  population2 = countries[index2][2];

  if (id === "c1") {
    if (population1 > population2) {
      addScore();
    } else {
      decreaseHealth();
    }
    update(2);
  } else {
    if (population2 > population1) {
      addScore();
    } else {
      decreaseHealth();
    }
    update(1);
  }
}

function addScore() {
  document.getElementById("score").innerHTML =
    Number(document.getElementById("score").innerHTML) + 1;
}

function decreaseHealth() {
  document.getElementById("lives").innerHTML =
    Number(document.getElementById("lives").innerHTML) - 1;

  if (Number(document.getElementById("lives").innerHTML) === 0) {
    alert("Game Over");
    window.location.reload();
  } else {
    const overlay = document.getElementById("overlay");
    overlay.style.display = "block";
    setTimeout(() => {
      overlay.style.display = "none";
    }, 100);
  } 
}

async function main() {
  await getCountries();
  document.getElementById("c1div").addEventListener("click", () => check("c1"));
  document.getElementById("c2div").addEventListener("click", () => check("c2"));
}

window.onload = main;
