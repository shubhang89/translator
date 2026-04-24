import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition,{ useSpeechRecognition } from "react-speech-recognition";
import translate from "translate";
import "./App.css";

const App = () => {

const [inputText,setInputText] = useState("")
const [translatedText,setTranslatedText] = useState("")

const [targetLanguage,setTargetLanguage] = useState("kn")
const [listeningLanguage,setListeningLanguage] = useState("en-IN")

const [languageGroup,setLanguageGroup] = useState("indian")

const [autoSpeak,setAutoSpeak] = useState(false)
const [realTime,setRealTime] = useState(true)

const [showSettings,setShowSettings] = useState(false)
const [showHistory,setShowHistory] = useState(false)

const [history,setHistory] = useState([])

const settingsRef=useRef(null)
const historyRef=useRef(null)

const { transcript,listening,resetTranscript }=useSpeechRecognition()

/* CLOSE PANELS */

useEffect(()=>{

const closePanels=(e)=>{

if(settingsRef.current && !settingsRef.current.contains(e.target)){
setShowSettings(false)
}

if(historyRef.current && !historyRef.current.contains(e.target)){
setShowHistory(false)
}

}

document.addEventListener("mousedown",closePanels)
return()=>document.removeEventListener("mousedown",closePanels)

},[])

/* LANGUAGE VOICE MAP */

const voiceMap={
en:"en-US",
hi:"hi-IN",
kn:"kn-IN",
ta:"ta-IN",
te:"te-IN",
ml:"ml-IN",
mr:"mr-IN",
es:"es-ES",
fr:"fr-FR",
de:"de-DE",
ja:"ja-JP",
zh:"zh-CN"
}

/* LANGUAGE LIST */

const indianSpeech=[
{name:"English (India)",code:"en-IN"},
{name:"Kannada",code:"kn-IN"},
{name:"Hindi",code:"hi-IN"},
{name:"Marathi",code:"mr-IN"},
{name:"Telugu",code:"te-IN"},
{name:"Tamil",code:"ta-IN"},
{name:"Malayalam",code:"ml-IN"}
]

const internationalSpeech=[
{name:"English (US)",code:"en-US"},
{name:"Spanish",code:"es-ES"},
{name:"French",code:"fr-FR"},
{name:"German",code:"de-DE"},
{name:"Japanese",code:"ja-JP"},
{name:"Chinese",code:"zh-CN"}
]

const indianTranslate=[
{name:"English",code:"en"},
{name:"Kannada",code:"kn"},
{name:"Hindi",code:"hi"},
{name:"Marathi",code:"mr"},
{name:"Telugu",code:"te"},
{name:"Tamil",code:"ta"},
{name:"Malayalam",code:"ml"}
]

const internationalTranslate=[
{name:"English",code:"en"},
{name:"Spanish",code:"es"},
{name:"French",code:"fr"},
{name:"German",code:"de"},
{name:"Japanese",code:"ja"},
{name:"Chinese",code:"zh"}
]

const speechLanguages =
languageGroup==="indian"?indianSpeech:internationalSpeech

const translateLanguages =
languageGroup==="indian"?indianTranslate:internationalTranslate

/* MIC */

const toggleMic=()=>{

if(listening){
SpeechRecognition.stopListening()
}else{
SpeechRecognition.startListening({
continuous:true,
language:listeningLanguage
})
}

}

/* TRANSCRIPT */

useEffect(()=>{
if(transcript){
setInputText(transcript)
}
},[transcript])

/* REALTIME */

useEffect(()=>{
if(realTime && inputText){
translateText(inputText)
}
},[inputText])

/* SPEAK */

const speakText=(text,lang)=>{

if(!text) return

const speech=new SpeechSynthesisUtterance(text)

speech.lang=voiceMap[lang] || "en-US"
speech.rate=0.95
speech.pitch=1
speech.volume=1

window.speechSynthesis.cancel()
window.speechSynthesis.speak(speech)

}

/* TRANSLATE */

const translateText=async(text)=>{

const sourceLang=listeningLanguage.split("-")[0]

if(sourceLang===targetLanguage) return
if(!text.trim()) return

try{

const translated=await translate(text,{
from:sourceLang,
to:targetLanguage
})

setTranslatedText(translated)

/* save history */

if(text.trim().split(" ").length>1){

setHistory(prev=>{
if(prev.length>0 && prev[0].input===text) return prev
return [{input:text,output:translated},...prev]
})

}

if(autoSpeak){
speakText(translated,targetLanguage)
}

}catch(e){
console.log(e)
}

}

/* SWAP */

const swapLanguages=()=>{

const sourceLang=listeningLanguage.split("-")[0]

if(sourceLang===targetLanguage) return

setListeningLanguage(targetLanguage+"-IN")
setTargetLanguage(sourceLang)

}

/* COPY */

const copyText=(text)=>{
navigator.clipboard.writeText(text)
}

/* RESET */

const resetInput=()=>{
setInputText("")
resetTranscript()
}

const resetOutput=()=>{
setTranslatedText("")
window.speechSynthesis.cancel()
}

/* DOWNLOAD TRANSLATION */

const downloadTranslation=()=>{

if(!translatedText) return

const blob=new Blob([translatedText],{type:"text/plain"})
const link=document.createElement("a")

link.href=URL.createObjectURL(blob)
link.download="translation.txt"
link.click()

}

/* DOWNLOAD HISTORY */

const downloadHistory=()=>{

const text=history
.map(h=>`You: ${h.input}\nTranslation: ${h.output}\n`)
.join("\n")

const blob=new Blob([text],{type:"text/plain"})
const link=document.createElement("a")

link.href=URL.createObjectURL(blob)
link.download="translation_history.txt"
link.click()

}

const sourceLang=listeningLanguage.split("-")[0]
const disableSwap=sourceLang===targetLanguage

return(

<div className="app">

<header className="navbar">

<button
className="menu-btn"
onClick={()=>setShowSettings(!showSettings)}
>
☰
</button>

<h1>Machine Translation System</h1>

<button
className="history-btn"
onClick={()=>setShowHistory(!showHistory)}
>
📜
</button>

</header>

{/* SETTINGS */}

<div
ref={settingsRef}
className={`sidebar left ${showSettings?"open":""}`}
>

<h3>Settings</h3>

<button
className={languageGroup==="indian"?"active":""}
onClick={()=>setLanguageGroup("indian")}
>
Indian Languages
</button>

<button
className={languageGroup==="international"?"active":""}
onClick={()=>setLanguageGroup("international")}
>
International Languages
</button>

<button onClick={()=>setAutoSpeak(!autoSpeak)}>
{autoSpeak?"Auto Speak ON":"Auto Speak OFF"}
</button>

<button onClick={()=>setRealTime(!realTime)}>
{realTime?"Real Time ON":"Real Time OFF"}
</button>

</div>

{/* HISTORY */}

<div
ref={historyRef}
className={`sidebar right ${showHistory?"open":""}`}
>

<h3>Translation History</h3>

<div className="history-list">

{history.map((item,i)=>(
<div key={i} className="history-item">
<p><b>You:</b> {item.input}</p>
<p><b>Translation:</b> {item.output}</p>
</div>
))}

</div>

<button onClick={downloadHistory}>
Download History
</button>

</div>

{/* TRANSLATOR */}

<main className="translator">

<div className="panel">

<select
value={listeningLanguage}
onChange={e=>setListeningLanguage(e.target.value)}
>
{speechLanguages.map(lang=>(
<option key={lang.code} value={lang.code}>
{lang.name}
</option>
))}
</select>

<textarea
placeholder="Speak or type here..."
value={inputText}
onChange={e=>setInputText(e.target.value)}
/>

{!realTime && (
<button
className="translate-btn"
onClick={()=>translateText(inputText)}
>
Translate
</button>
)}

<div className="panel-controls">

<button onClick={()=>copyText(inputText)}>Copy</button>

<button onClick={resetInput}>Reset</button>

<button
className={`mic-btn ${listening?"active":""}`}
onClick={toggleMic}
>
🎤
</button>

</div>

</div>

<button
className={`swap-btn ${!disableSwap?"rotate":""}`}
onClick={swapLanguages}
disabled={disableSwap}
>
⇄
</button>

<div className="panel">

<select
value={targetLanguage}
onChange={e=>setTargetLanguage(e.target.value)}
>
{translateLanguages.map(lang=>(
<option key={lang.code} value={lang.code}>
{lang.name}
</option>
))}
</select>

<div className="output-text">
{translatedText}
</div>

<div className="panel-controls">

<button onClick={()=>copyText(translatedText)}>Copy</button>

<button onClick={resetOutput}>Reset</button>

<button
className="download-btn"
onClick={downloadTranslation}
>
⬇
</button>

<button
className={`speak-btn ${autoSpeak?"auto-on":""}`}
onClick={()=>speakText(translatedText,targetLanguage)}
>
🔊
</button>

</div>

</div>

</main>

<footer className="footer">

<p>Machine Translation System • NLP Project</p>
<p>React • Speech Recognition • Translation API</p>

</footer>

</div>

)

}

export default App