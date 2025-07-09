
document.addEventListener("DOMContentLoaded", () => {
  let selectedLanguage = null;

  // Language selection
  document.querySelectorAll('.language-option').forEach(flag => {
    flag.addEventListener('click', () => {
      selectedLanguage = flag.dataset.lang;

      document.querySelectorAll('.language-option').forEach(f => f.classList.remove('selected'));
      flag.classList.add('selected');
    });
  });

  // Send button handler
  document.getElementById('sendButton').addEventListener('click', async () => {
    const input = document.getElementById('textToTranslate');
    const text = input.value.trim();

    if (!text) {
      alert("Please enter text to translate.");
      return;
    }

    if (!selectedLanguage) {
      alert("Please select a language.");
      return;
    }

    const prompt = `Translate the following sentence into ${selectedLanguage}:\n${text}`;

    try {
      const response = await fetch("https://pollyglot-worker.philipnations.workers.dev/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        })
      });

      const contentType = response.headers.get("content-type") || "";
      const isJSON = contentType.includes("application/json");

      if (!response.ok) {
        const errorText = isJSON ? (await response.json()).error : await response.text();
        throw new Error(errorText || "Translation failed.");
      }

      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content?.trim();

      if (!translation) {
        throw new Error("No translation found in response.");
      }

      const chatBox = document.getElementById("chat-box");
      chatBox.innerHTML += `
        <div class="message user-message">${text}</div>
        <div class="message bot-message">${translation}</div>
      `;

      chatBox.scrollTop = chatBox.scrollHeight;
      input.value = "";

    } catch (err) {
      alert("Error: " + err.message);
      console.error("Fetch error:", err);
    }
  });
});
