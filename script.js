let words=[]
let currentIndex=0

fetch("words.json")
.then(res=>res.json())
.then(data=>{
words=data
loadCard()
loadQuiz()
})

const card=document.getElementById("flashcard")

card.addEventListener("click",()=>{
card.classList.toggle("flip")
})

function loadCard(){

const word=words[currentIndex]

document.getElementById("germanWord").textContent=word.german
document.getElementById("englishWord").textContent=word.english
document.getElementById("exampleSentence").textContent=word.example

}

document.getElementById("nextBtn").onclick=()=>{

currentIndex=(currentIndex+1)%words.length
card.classList.remove("flip")
loadCard()

}

document.getElementById("prevBtn").onclick=()=>{

currentIndex=(currentIndex-1+words.length)%words.length
card.classList.remove("flip")
loadCard()

}

document.getElementById("speakBtn").onclick=()=>{

let word=words[currentIndex].german

let speech=new SpeechSynthesisUtterance(word)
speech.lang="de-DE"

speechSynthesis.speak(speech)

}

function setDifficulty(level){

let word=words[currentIndex].german

localStorage.setItem(word,level)

}

function loadQuiz(){

let randomIndex=Math.floor(Math.random()*words.length)

let correct=words[randomIndex]

document.getElementById("quizWord").textContent=correct.german

let options=[correct.english]

while(options.length<4){

let rand=words[Math.floor(Math.random()*words.length)].english

if(!options.includes(rand)) options.push(rand)

}

options.sort(()=>Math.random()-0.5)

let optionsDiv=document.getElementById("options")
optionsDiv.innerHTML=""

options.forEach(opt=>{

let btn=document.createElement("button")
btn.textContent=opt

btn.onclick=()=>{

if(opt===correct.english){
document.getElementById("result").textContent="Correct!"
}else{
document.getElementById("result").textContent="Wrong!"
}

}

optionsDiv.appendChild(btn)

})

}

document.getElementById("nextQuiz").onclick=()=>{

document.getElementById("result").textContent=""
loadQuiz()

}
