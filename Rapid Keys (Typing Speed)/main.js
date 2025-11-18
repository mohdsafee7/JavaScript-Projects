let params = new URLSearchParams(window.location.search);
let level = params.get('level');
let passageTime = 60;
let currentPara = "";
let content = [];
let written_content = [];
let content_box =  document.querySelector(".content_box");
let content_cover = document.querySelector(".content_cover");
let overlay = document.querySelector(".overlay");
let start = document.querySelector(".start");
let timer = document.querySelector(".timer");
let isActive = false;
let startTime = null;
let mistake_count = 0;
let wpm = document.querySelector(".wpm");
let cpm = document.querySelector(".cpm");
let accuracy = document.querySelector(".accuracy");
let mistakes = document.querySelector(".mistakes");
let typing_level = document.querySelector(".level");



async function getData() {
  let response =await fetch("./dataset.json");
  console.log(response);

  let data = await response.json();
  console.log(data);
  console.log(level);

  let paras = data[level].para;
  passageTime = data[level].time;
  console.log(paras, passageTime);

  //pick a random passage
  let random_para = paras[Math.floor(Math.random() * paras.length)];
  // console.log(random_para);

  return random_para;
}

getData().then(passage => {
  currentPara = passage;
  content = currentPara.split("");
  console.log(currentPara, content);
  timer.innerText =  passageTime;
  //typing level display
  typing_level.innerText = level.charAt(0).toUpperCase() + level.slice(1);

  content_box.value = passage;

  content_box.addEventListener('keydown', (event)=>{
    if(!isActive) return;
    console.log(event.key);
    if(event.key == "Alt" || event.key == "Shift" || event.key == "Tab" || event.key == "Control" || event.key == "CapsLock" || event.key == "Enter" || event.key == "Meta"){
      return;
    }

    // if(event.key == " "){
    //   event.preventDefault();
    //   written_content.push(" ");
    //   check();
    //   return;
    // }
    if(event.key === "Backspace"){
      event.preventDefault(); //prevent default backspace action
      if(written_content.length > 0){
        written_content.pop();
        if(overlay.lastChild){
          overlay.removeChild(overlay.lastChild); //remove last character from overlay
        }
      }
      return;
    }

    //store the typed content only single character keys
    if(event.key.length == 1){
      written_content.push(event.key);
      check();
    }

    // console.log(written_content);
  })
});

function check() {
  let i = written_content.length - 1; //index of last typed character
  let span = document.createElement("span"); //create a span element to wrap the character

  span.className = "bg-blue-500"; //for highlighting the character

  if(written_content[i] == content[i]){
    span.className = " " + "text-blue-500"; //for correct character
  }
  else{
    span.className = " " + "text-red-500"; //for wrong character
    mistake_count++;
  }

    // span.textContent = content[i] == " " ? '\u00A0' : content[i]; //set the character to span
    // BAD: prevents wrapping
// span.textContent = content[i] == " " ? '\u00A0' : content[i];

// GOOD: allow wrapping with regular space
span.textContent = (content[i] === " ") ? " " : content[i];

    overlay.appendChild(span);
}

//start the test on clicking start button
start.addEventListener('click', ()=>{
  isActive = true;
  startTime = new Date(); //get start time
  let count = passageTime;

  let counter = setInterval(()=>{
    timer.innerText = --count;
    if(count <= 0){
      clearInterval(counter);
      isActive = false;
      // alert("Time's up! Test ended.");
      calculateResult();
    }
  }, 1000);
})


//final result calculation
function calculateResult() {
  let endTime = new Date(); //get end time
  let timeTaken = (endTime - startTime) / 1000; //time taken in seconds
  let timetakenMinutes = timeTaken / 60;

  let correctChars = written_content.filter((ch, i) => ch===content[i]).length; //count of correct characters

  let totalTyped = written_content.length; //total typed characters

  let cpm_count = Math.round(correctChars / timetakenMinutes);
  let wpm_count = Math.round((correctChars / 5) / timetakenMinutes); //considering 5 characters as a word
  let acc = totalTyped === 0 ? 0 : Math.round((correctChars / totalTyped) * 100).toFixed(2); //accuracy percentage

  cpm.innerText = cpm_count;
  wpm.innerText = wpm_count;
  accuracy.innerText = acc + "%";
  mistakes.innerText = mistake_count;
}