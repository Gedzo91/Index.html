document.addEventListener('DOMContentLoaded', () => {
  // Initialize activeChatCount at the top level
  let activeChatCount = 1;

  function updateChatCounter(count) {
    const inboxButton = document.querySelector('.chater-inbox');
    if (!inboxButton) return;
    
    activeChatCount = count;
    let counter = inboxButton.querySelector('.chat-counter');
    
    if (count > 0) {
      if (!counter) {
        counter = document.createElement('div');
        counter.className = 'chat-counter';
        inboxButton.appendChild(counter);
      }
      counter.textContent = count;
    } else if (counter) {
      counter.remove();
    }
  }

  // Initialize first message count
  updateChatCounter(1);

  const scaryButton = document.getElementById('scaryButton');
  const blackroomOverlay = document.getElementById('blackroomOverlay');
  const backroomsMusic = document.getElementById('backroomsMusic');
  const bgMusic = document.getElementById('bgMusic');

  // Stop the original background music when the page loads
  if (bgMusic) {
    bgMusic.remove();
  }
  
  scaryButton?.addEventListener('click', () => {
    blackroomOverlay.classList.add('active');
    backroomsMusic.play();
  });

  const searchInput = document.querySelector('input[type="search"]');
  const savedViewState = localStorage.getItem('videoViewed');
  const bgMusicElement = document.getElementById('bgMusic');
  
  // Initialize state
  let showingArrow = false;
  let localStream = null;

  // Autoplay music when page loads
  if (bgMusicElement) {
    bgMusicElement.play().catch(err => {
      console.warn('Autoplay blocked:', err);
    });
  }
  
  if (savedViewState === 'true') {
    showVideos();
  }

  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      const searchTerm = searchInput.value.toLowerCase();
      const videoTitles = document.querySelectorAll('.video-info h2');
      let found = false;
      
      videoTitles.forEach(title => {
        if (title.textContent.toLowerCase().includes(searchTerm)) {
          found = true;
        }
      });
      
      if (searchTerm && !found) {
        alert('No matching videos found!');
      }
    }
  });

  // Add event listener for chat input
  const messageInput = document.getElementById('messageInput');
  messageInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) return;
    
    const isVisible = chatWindow.style.display !== 'none';
    chatWindow.style.display = isVisible ? 'none' : 'flex';
    
    if (!isVisible) {
      // When opening chat, reset counter
      updateChatCounter(0);
    }
  }

  function closeChat() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
      chatWindow.style.display = 'none';
    }
  }

  function toggleChaterInbox() {
    const arrow = document.getElementById('pointerArrow');
    if (!arrow) return;
    
    showingArrow = !showingArrow;
    arrow.style.display = showingArrow ? 'block' : 'none';
  }

  // Initialize websim users
  const websimUsers = [
    { id: 1, name: 'FhumCreator', avatar: 'FC' },
    { id: 2, name: 'WebSimHelper', avatar: 'WH' }
  ];

  // Update responses for multiple chat personalities
  const responses = {
    FhumCreator: [
      "Thanks for visiting FhumMoon!",
      "I'm so glad you're checking out my content!",
      "Let me know if you need help finding anything!",
    ],
    WebSimHelper: [
      "How can I assist you today?",
      "Feel free to ask any questions!",
      "I'm here to help make your experience better!",
    ]
  };

  function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    if (sender === 'user') {
      avatar.textContent = 'U';
      content.innerHTML = `
        <div class="message-sender">You</div>
        <div>${text}</div>
      `;
    } else {
      const websimUser = websimUsers[Math.floor(Math.random() * websimUsers.length)];
      avatar.textContent = websimUser.avatar;
      content.innerHTML = `
        <div class="message-sender">${websimUser.name}</div>
        <div>${text}</div>
      `;
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function sendMessage() {
    const input = document.getElementById('messageInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (message) {
      addMessage(message, 'user');
      input.value = '';
      
      setTimeout(() => {
        const websimUser = websimUsers[Math.floor(Math.random() * websimUsers.length)];
        const userResponses = responses[websimUser.name];
        const response = userResponses[Math.floor(Math.random() * userResponses.length)];
        addMessage(response, 'creator');
        
        const chatWindow = document.getElementById('chatWindow');
        if (chatWindow && chatWindow.style.display === 'none') {
          updateChatCounter(activeChatCount + 1);
        }
      }, 1000);
    }
  }

  let videoCallRequested = false;

  async function setupMediaDevices() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStream = stream;
      
      const userPreview = document.querySelector('.user-video-preview video');
      if (userPreview) {
        userPreview.srcObject = stream;
        userPreview.play();
      }
      
      const callButton = document.querySelector('.video-call-button');
      if (callButton) {
        callButton.classList.remove('disabled');
        callButton.disabled = false;
      }
      
      showNotification('Camera and microphone connected!', 'success');

      // If there was a pending call request, show the call window now
      if (videoCallRequested) {
        showVideoCallWindow();
      }
      return true;
    } catch (err) {
      console.error('Failed to get media devices:', err);
      showNotification('Please allow camera and microphone access', 'error');
      return false;
    }
  }

  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  function showVideoCallWindow() {
    const videoCallWindow = document.getElementById('videoCallWindow');
    if (!videoCallWindow) return;

    videoCallWindow.style.display = 'flex';
    const creatorVideo = document.getElementById('creatorVideo');
    if (creatorVideo) {
      creatorVideo.play().catch(err => {
        console.warn('Autoplay failed:', err);
      });
    }
  }

  async function toggleVideoCall() {
    const videoCallWindow = document.getElementById('videoCallWindow');
    if (!videoCallWindow) return;

    const isVisible = videoCallWindow.style.display !== 'none';
    
    if (!isVisible) {
      if (!localStream) {
        videoCallRequested = true;
        const success = await setupMediaDevices();
        if (!success) {
          // Still show the window even if permissions aren't granted
          showVideoCallWindow();
          return;
        }
      }
      showVideoCallWindow();
    } else {
      endCall();
    }
  }

  function endCall() {
    const videoCallWindow = document.getElementById('videoCallWindow');
    if (!videoCallWindow) return;

    videoCallWindow.style.display = 'none';
    videoCallRequested = false;

    const creatorVideo = document.getElementById('creatorVideo');
    if (creatorVideo) {
      creatorVideo.pause();
      creatorVideo.currentTime = 0;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
  }

  function toggleAudio() {
    if (!localStream) return;
    
    const audioButton = document.querySelector('.toggle-audio');
    const audioTrack = localStream.getAudioTracks()[0];
    
    if (audioTrack && audioButton) {
      audioTrack.enabled = !audioTrack.enabled;
      audioButton.classList.toggle('muted');
      audioButton.style.background = audioTrack.enabled ? 'var(--primary-blue)' : '#ff3366';
    }
  }

  function toggleVideo() {
    if (!localStream) return;
    
    const videoButton = document.querySelector('.toggle-video');
    const videoTrack = localStream.getVideoTracks()[0];
    
    if (videoTrack && videoButton) {
      videoTrack.enabled = !videoTrack.enabled;
      videoButton.classList.toggle('video-off');
      videoButton.style.background = videoTrack.enabled ? 'var(--primary-blue)' : '#ff3366';
    }
  }

  // Remove any reference to music button since music autoplays
  const musicButton = document.querySelector('.music-button');
  if (musicButton) {
    musicButton.remove();
  }

  function toggleOwlVideo() {
    const owlVideoWindow = document.getElementById('owlVideoWindow');
    const owlVideo = document.getElementById('owlVideo');
    
    if (!owlVideoWindow || !owlVideo) return;
    
    const isVisible = owlVideoWindow.style.display !== 'none';
    owlVideoWindow.style.display = isVisible ? 'none' : 'flex';
    
    if (!isVisible) {
      owlVideo.play().catch(err => {
        console.warn('Autoplay failed:', err);
      });
    } else {
      owlVideo.pause();
      owlVideo.currentTime = 0;
    }
  }

  function closeOwlVideo() {
    const owlVideoWindow = document.getElementById('owlVideoWindow');
    const owlVideo = document.getElementById('owlVideo');
    
    if (!owlVideoWindow || !owlVideo) return;
    
    owlVideoWindow.style.display = 'none';
    owlVideo.pause();
    owlVideo.currentTime = 0;
  }

  // Make functions available globally
  window.toggleChat = toggleChat;
  window.closeChat = closeChat;
  window.toggleChaterInbox = toggleChaterInbox;
  window.sendMessage = sendMessage;
  window.toggleVideoCall = toggleVideoCall;
  window.endCall = endCall;
  window.toggleAudio = toggleAudio;
  window.toggleVideo = toggleVideo;
  window.toggleOwlVideo = toggleOwlVideo;
  window.closeOwlVideo = closeOwlVideo;
  window.showVideos = showVideos;
});

function showVideos() {
  const emptyState = document.getElementById('emptyState');
  const videoContainer = document.getElementById('videoContainer');
  
  if (emptyState) emptyState.style.display = 'none';
  if (videoContainer) videoContainer.style.display = 'block';
  
  localStorage.setItem('videoViewed', 'true');
  updateViewCount('viewCount');
}

function updateViewCount(elementId) {
  const viewCountElement = document.getElementById(elementId);
  if (!viewCountElement) return;
  
  let views = parseInt(localStorage.getItem(elementId) || '0');
  views++;
  localStorage.setItem(elementId, views.toString());
  viewCountElement.textContent = `${views} view${views === 1 ? '' : 's'}`;
}