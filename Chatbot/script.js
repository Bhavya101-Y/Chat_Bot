let promptInput = document.querySelector("#prompt");
let submitBtn = document.querySelector("#submit");
let micBtn = document.querySelector("#micBtn");
let chatContainer = document.querySelector("#chatContainer");
let imageUpload = document.querySelector("#imageUpload");

// Gemini API
const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBir2sOOhicdhUA-RepSl23ggzqnqbdLgM";

// --- Helper to add messages ---
function addMessage(content, sender) {
  let msg = document.createElement("div");
  msg.classList.add("chat-message", sender);
  msg.innerHTML = content;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight; // auto-scroll
}

// --- Generate AI Response ---
async function generateResponse(userInput) {
  let loadingMsg = document.createElement("div");
  loadingMsg.classList.add("chat-message", "ai");
  loadingMsg.innerHTML = "<i>Thinking...</i>";
  chatContainer.appendChild(loadingMsg);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  let RequestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userInput }] }]
    })
  };

  try {
    let response = await fetch(Api_Url, RequestOption);
    let data = await response.json();

    let apiResponse = "⚠️ No response from AI.";
    if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      apiResponse = data.candidates[0].content.parts[0].text;
    }

    loadingMsg.innerHTML = apiResponse.replace(/\n/g, "<br>");
  } catch (err) {
    loadingMsg.innerHTML = "⚠️ Error: Unable to connect.";
    console.error(err);
  }
}

// --- Send button ---
submitBtn.addEventListener("click", () => {
  let text = promptInput.value.trim();
  if (text !== "") {
    addMessage(text, "user");
    generateResponse(text);
    promptInput.value = "";
  }
});

promptInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitBtn.click();
});

// --- Mic button (speech-to-text) ---
micBtn.addEventListener("click", () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  let recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = function(event) {
    let transcript = event.results[0][0].transcript;
    promptInput.value = transcript;
  };

  recognition.onerror = function() {
    alert("Voice input failed. Try again.");
  };
});

// --- Image Upload button ---
imageUpload.addEventListener("change", () => {
  let file = imageUpload.files[0];
  if (file) {
    addMessage(`📷 Image uploaded: <b>${file.name}</b><br><i>(Image analysis not connected yet)</i>`, "user");
  }
});
