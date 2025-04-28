document.addEventListener("DOMContentLoaded", function () {
  console.log("📱 Client application initialized");

  const messagesContainer = document.getElementById("messages");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");
  const clearChatButton = document.getElementById("clear-chat");
  const chatWindow = document.querySelector(".chat-window");
  const chatToggle = document.getElementById("chat-toggle");
  const minimizeButton = document.getElementById("minimize-chat");
  const maximizeButton = document.getElementById("maximize-chat");
  const closeButton = document.getElementById("close-chat");

  // Chat window states
  let isMinimized = false;
  let isMaximized = false;
  let isClosed = true;

  // Initial state
  chatWindow.style.display = "none";
  chatToggle.style.display = "block";

  // Toggle chat window
  function toggleChat() {
    if (isClosed) {
      chatWindow.style.display = "block";
      chatToggle.style.display = "none";
      isClosed = false;
      isMinimized = false;
      chatWindow.classList.remove("chat-window--minimized");
    } else {
      chatWindow.style.display = "none";
      chatToggle.style.display = "block";
      isClosed = true;
    }
  }

  // Minimize chat window
  function minimizeChat() {
    if (!isClosed) {
      isMinimized = true;
      isMaximized = false;
      chatWindow.classList.add("chat-window--minimized");
      chatWindow.classList.remove("chat-window--maximized");
    }
  }

  // Maximize chat window
  function maximizeChat() {
    if (!isClosed) {
      isMaximized = true;
      isMinimized = false;
      chatWindow.classList.add("chat-window--maximized");
      chatWindow.classList.remove("chat-window--minimized");
    }
  }

  // Close chat window
  function closeChat() {
    chatWindow.style.display = "none";
    chatToggle.style.display = "block";
    isClosed = true;
    isMinimized = false;
    isMaximized = false;
    chatWindow.classList.remove(
      "chat-window--minimized",
      "chat-window--maximized"
    );
    // Re-enable body scrolling
    document.body.style.width = "100vw";
    document.body.style.overflowX = "hidden";
  }

  // Add event listeners
  chatToggle.addEventListener("click", toggleChat);
  minimizeButton.addEventListener("click", minimizeChat);
  maximizeButton.addEventListener("click", maximizeChat);
  closeButton.addEventListener("click", closeChat);

  // Default values
  const DEFAULT_MODEL = "ALIENTELLIGENCE/cybersecuritythreatanalysisv2";
  const DEFAULT_OLLAMA_PATH =
    "C:\\Users\\Goodwill\\AppData\\Local\\Programs\\ollama\\ollama.exe";

  let connected = false;
  let conversationHistory = [];

  // Auto-connect function
  async function autoConnect() {
    console.log("[Mr. White] Auto-connecting to Ollama...");
    try {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: DEFAULT_MODEL }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to Ollama");
      }

      const data = await response.json();
      if (data.success) {
        console.log("[Mr. White] Connection established");
        console.log('<div class="status connected">Connected</div>');
        connected = true;
        addMessage("Hi im mr white , how can i help you today?", "ai");
      } else {
        throw new Error("Failed to connect to Ollama");
      }
    } catch (error) {
      console.error("[Mr. White] Connection error:", error.message);
      connected = false;
      setTimeout(autoConnect, 5000); // Retry after 5 seconds
    }
  }

  // Handle sending messages
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Clear chat
  clearChatButton.addEventListener("click", function () {
    console.log("🧹 Clearing chat history");
    messagesContainer.innerHTML = "";
    conversationHistory = [];
  });

  async function sendMessage() {
    const userMessage = userInput.value;
    if (userMessage === "") return;

    // Add user message to the chat
    addMessage(userMessage, "user");
    userInput.value = "";

    if (!connected) {
      console.warn("[Mr. White] Not connected to Ollama");
      addMessage("Not connected to Ollama. Attempting to reconnect...", "ai");
      await autoConnect();
      if (!connected) {
        return;
      }
    }

    // Add thinking message with loader
    const thinkingMessage = addThinkingMessage();

    // Add message to conversation history
    conversationHistory.push({ role: "user", content: userMessage });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();

      // Remove thinking message
      thinkingMessage.remove();

      // Add AI response to chat
      const aiMessage = data.message.content;
      addMessage(aiMessage, "ai");

      // Add to conversation history
      conversationHistory.push({ role: "assistant", content: aiMessage });
    } catch (error) {
      console.error("[Mr. White] Chat error:", error);
      thinkingMessage.remove();
      addMessage("Error: " + error.message, "ai");
    }
  }

  // Auto scroll to bottom when new messages are added
  function scrollToBottom() {
    const messages = document.querySelector(".chat-window-messages");
    messages.scrollTop = messages.scrollHeight;
  }

  function addMessage(text, sender) {
    // Split the message by newlines and filter out empty lines
    const messages = text.split('\n').filter(line => line.trim() !== '');

    messages.forEach((messageLine) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("chat-message");
        messageElement.classList.add(
            sender === "user" ? "chat-message--user" : "chat-message--ai"
        );

        if (sender === "ai") {
            const avatarContainer = document.createElement("div");
            avatarContainer.classList.add("chat-message-avatar-container");

            const avatar = document.createElement("img");
            avatar.src = "./assets/Images/Designer (2).jpeg";
            avatar.alt = "AI Avatar";
            avatar.classList.add("chat-message-avatar");

            avatarContainer.appendChild(avatar);
            messageElement.appendChild(avatarContainer);
        }

        const messageContent = document.createElement("div");
        messageContent.classList.add("chat-message-content");
        messageContent.textContent = messageLine.trim();
        messageElement.appendChild(messageContent);

        messagesContainer.appendChild(messageElement);
    });

    scrollToBottom();
  }

  function addThinkingMessage() {
    const messageElement = document.createElement("div");
    messageElement.classList.add(
      "chat-message",
      "chat-message--ai",
      "chat-message--thinking"
    );

    const avatarContainer = document.createElement("div");
    avatarContainer.classList.add("chat-message-avatar-container");

    const avatar = document.createElement("img");
    avatar.src = "./assets/Images/Designer (2).jpeg"
    avatar.alt = "AI Avatar";
    avatar.classList.add("chat-message-avatar");

    avatarContainer.appendChild(avatar);
    messageElement.appendChild(avatarContainer);

    const messageContent = document.createElement("div");
    messageContent.classList.add("chat-message-content");

    const thinkingDots = document.createElement("div");
    thinkingDots.classList.add("chat-message-thinking-dots");
    messageContent.appendChild(thinkingDots);

    messageElement.appendChild(messageContent);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageElement;
  }

  // Initial message
  console.log("Displaying welcome message");

  // Start auto-connection
  autoConnect();
});

// Observer for scroll animations
document.addEventListener("DOMContentLoaded", () => {
  // Elements to animate
  const animatedElements = document.querySelectorAll(".animate-on-scroll");

  // Create the Intersection Observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Add animation class when element is in view
        if (entry.isIntersecting) {
          entry.target.classList.add("animate");

          // Only animate once (optional - remove if you want repeat animations)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      // Options
      threshold: 0.15, // Trigger when 15% of the element is visible
      rootMargin: "0px 0px -50px 0px", // Offset the trigger point
    }
  );

  // Observe all elements with animate-on-scroll class
  animatedElements.forEach((element) => {
    observer.observe(element);
  });
});

// Type writer effect for the landing page text
document.addEventListener("DOMContentLoaded", () => {
  const landingText = document.querySelector(".landing-text h1");
  if (landingText) {
    setTimeout(() => {
      landingText.classList.add("typewriter-effect");
    }, 500);
  }
});

// Navigation bar toggle for mobile view
function toggleMenu() {
    // Only run the function if screen width is less than or equal to 1243px
    if (window.innerWidth <= 1243) {
        const navLinks = document.querySelector(".nav-links ul");
        const menuButton = document.querySelector(".menu-toggle i");

        if (navLinks.style.top === "60px") {
            navLinks.style.top = "-100em";
            navLinks.style.opacity = "0";
            navLinks.style.visibility = "hidden";
            menuButton.classList.remove("fa-xmark");
            menuButton.classList.add("fa-bars");
        } else {
            navLinks.style.top = "60px";
            navLinks.style.opacity = "1";
            navLinks.style.visibility = "visible";
            menuButton.classList.remove("fa-bars");
            menuButton.classList.add("fa-xmark");
        }
    }
}
