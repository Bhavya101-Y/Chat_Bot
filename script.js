// Select elements
let prompt = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let submitBtn = document.querySelector("#submit");
let imageBtn = document.querySelector("#imageBtn");
let imageUpload = document.querySelector("#imageUpload");

// Gemini API URL (replace YOUR_API_KEY with your real key)
const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyBir2sOOhicdhUA-RepSl23ggzqnqbdLgM";

let user = { data: null };

// Function to generate AI response for text
async function generateResponse(aiChatBox) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  let RequestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: user.data }]
        }
      ]
    })
  };

  try {
    let response = await fetch(Api_Url, RequestOption);
    let data = await response.json();

    let apiResponse = data.candidates[0].content.parts[0].text;
    apiResponse = apiResponse.replace(/\*\*(.*?)\*\*/g, "$1").trim();

    text.innerHTML = apiResponse;
  } catch (error) {
    console.error(error);
    text.innerHTML = "⚠️ Error: Unable to connect to AI.";
  } finally {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// Function to generate AI response for image
async function generateImageResponse(aiChatBox, base64Image) {
  let text = aiChatBox.querySelector(".ai-chat-area");

  let RequestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: "Please describe this image." },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image
              }
            }
          ]
        }
      ]
    })
  };

  try {
    let response = await fetch(Api_Url, RequestOption);
    let data = await response.json();

    let apiResponse = data.candidates[0].content.parts[0].text;
    text.innerHTML = apiResponse;
  } catch (error) {
    console.error(error);
    text.innerHTML = "⚠️ Error: Unable to analyze image.";
  } finally {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
}

// Function to create chat bubbles
function createChatBox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

// Function to handle user message (text or image)
function handlechatResponse(message, isImage = false) {
  user.data = message;

  let html;
  if (isImage) {
    html = `
      <img src="User.webp" alt="" id="userImage" width="60">
      <div class="user-chat-area">
        <img src="${message}" alt="Uploaded Image" width="150">
      </div>`;
  } else {
    html = `
      <img src="User.webp" alt="" id="userImage" width="60">
      <div class="user-chat-area">${user.data}</div>`;
  }

  prompt.value = "";

  let userChatBox = createChatBox(html, "user-chat-box");
  chatContainer.appendChild(userChatBox);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  if (!isImage) {
    // AI response for text
    setTimeout(() => {
      let html = `
        <img src="AI.webp" alt="" id="aiImage" width="50">
        <div class="ai-chat-area">
          <img src="Ellipsis@1x-1.0s-200px-200px.gif" alt="" class="load" width="50px">
        </div>`;
      let aiChatBox = createChatBox(html, "ai-chat-box");
      chatContainer.appendChild(aiChatBox);

      generateResponse(aiChatBox);
    }, 600);
  }
}

// Text submission with Enter key
prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && prompt.value.trim() !== "") {
    handlechatResponse(prompt.value.trim());
  }
});

// Text submission with button
submitBtn.addEventListener("click", () => {
  if (prompt.value.trim() !== "") {
    handlechatResponse(prompt.value.trim());
  }
});

// Trigger file input on upload button click
imageBtn.addEventListener("click", () => {
  imageUpload.click();
});

// Handle image upload + AI response
imageUpload.addEventListener("change", () => {
  let file = imageUpload.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let base64Image = e.target.result.split(",")[1]; // remove prefix

      // Show image in chat
      handlechatResponse(e.target.result, true);

      // AI analyzes uploaded image
      setTimeout(() => {
        let html = `
          <img src="AI.webp" alt="" id="aiImage" width="50">
          <div class="ai-chat-area">
            <img src="Ellipsis@1x-1.0s-200px-200px.gif" alt="" class="load" width="50px">
          </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);

        generateImageResponse(aiChatBox, base64Image);
      }, 600);
    };
    reader.readAsDataURL(file);
  }
});
