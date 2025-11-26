document.addEventListener("DOMContentLoaded", () => {
  let selectedLanguage = null;
  
  const input = document.getElementById('textToTranslate');
  const sendButton = document.getElementById('sendButton');
  const chatBox = document.getElementById("chat-box");
  const counter = document.getElementById('char-counter');
  const messageWindow = document.getElementById('message-window');
  
  // Clear history on page load
  localStorage.removeItem('translationHistory');
  
  // Show message window
  function showWindow(message, type = 'warning') {
    messageWindow.textContent = message;
    messageWindow.className = `message-window ${type} show`;
    
    setTimeout(() => {
      messageWindow.classList.remove('show');
    }, 3000);
  }
  
  // Language selection
  document.querySelectorAll('.language-option').forEach(flag => {
    flag.addEventListener('click', () => {
      selectedLanguage = flag.dataset.lang;
      document.querySelectorAll('.language-option').forEach(f => f.classList.remove('selected'));
      flag.classList.add('selected');
    });
  });
  
  // Send translation
  sendButton.addEventListener('click', translate);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') translate();
  });
  
  // Character counter
  if (counter) {
    input.addEventListener('input', (e) => {
      counter.textContent = `${e.target.value.length}/500`;
      counter.style.color = e.target.value.length > 450 ? '#c00' : '#666';
    });
  }
  
  // Main translation
  async function translate() {
    const text = input.value.trim();
    
    if (!text) return showWindow("Please enter text to translate", "warning");
    if (!selectedLanguage) return showWindow("Please select a language", "warning");
    
    sendButton.disabled = input.disabled = true;
    sendButton.style.opacity = '0.5';
    
    const loadingMsg = createMessage('Translating...', 'bot-message');
    loadingMsg.id = 'loading-indicator';
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
      const response = await fetch("https://pollyglot-worker.philipnations.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: `Translate the following sentence into ${selectedLanguage}:\n${text}` }],
          temperature: 0.2
        })
      });
      
      if (!response.ok) throw new Error("Translation failed.");
      
      const data = await response.json();
      const translation = data.choices?.[0]?.message?.content?.trim();
      
      if (!translation) throw new Error("No translation found.");
      
      document.getElementById('instruction-message')?.remove();
      document.getElementById('loading-indicator')?.remove();
      
      chatBox.appendChild(createMessage(text, 'user-message'));
      chatBox.appendChild(createMessage(translation, 'bot-message'));
      chatBox.scrollTop = chatBox.scrollHeight;
      
      input.value = "";
      if (counter) {
        counter.textContent = '0/500';
        counter.style.color = '#666';
      }
      
    } catch (err) {
      document.getElementById('loading-indicator')?.remove();
      showWindow("Translation failed: " + err.message, "error");
    } finally {
      sendButton.disabled = input.disabled = false;
      sendButton.style.opacity = '1';
      input.focus();
    }
  }
  
  function createMessage(text, className) {
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.textContent = text;
    return div;
  }
});