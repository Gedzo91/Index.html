const { useState, useEffect, useMemo, Suspense } = React;

const AVAILABLE_TAGS = [
  { id: 'male', label: 'Male', emoji: '👨' },
  { id: 'female', label: 'Female', emoji: '👩' },
  { id: 'nonbinary', label: 'Non-binary', emoji: '🦋' },
  { id: 'romance', label: 'Romance', emoji: '❤️' },
  { id: 'fantasy', label: 'Fantasy', emoji: '🐉' },
  { id: 'scifi', label: 'Sci-fi', emoji: '🚀' },
  { id: 'comedy', label: 'Comedy', emoji: '😄' },
  { id: 'drama', label: 'Drama', emoji: '🎭' },
  { id: 'horror', label: 'Horror', emoji: '👻' },
  { id: 'mystery', label: 'Mystery', emoji: '🔍' },
  { id: 'fluff', label: 'Fluff', emoji: '🌸' },
  { id: 'angst', label: 'Angst', emoji: '💔' },
  { id: 'videogame', label: 'Video Game', emoji: '🎮' },
  { id: 'anime', label: 'Anime', emoji: '🌟' },
  { id: 'scenario', label: 'Scenario', emoji: '🎬' }
];

const SORT_OPTIONS = [
  { id: 'popular', label: 'Most Popular' },
  { id: 'recent', label: 'Recently Created' }
];

const characterFormPlaceholders = {
  description: "A brief description of your character that will be shown on their card",
  persona: "Describe the character's personality here, including traits, background, mannerisms, and appearance. Use {{user}} to refer to the current user's name and {{char}} to refer to this character's name. Example: 'Rick Astley is a human and popular singer. {{char}} has a ginger pompadour, and likes to sing to {{user}}'",
  scenario: "Optional: Describe the setting and context in which conversations take place. Use {{user}} for the user's name and {{char}} for the character's name. Example: 'At the cafe where {{user}} frequently visits to hear {{char}} perform.'",
  firstMessage: "First message from your character. Provide a good first message to encourage the character to give engaging responses. Example: 'Oh, {{user}}! I was just thinking about you...'"
};

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="pagination">
      <button 
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      <button 
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}

const CharacterGrid = React.lazy(() => Promise.resolve({
  default: ({ characters, onSelect, itemsPerPage = 8 }) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    const totalPages = Math.ceil(characters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCharacters = characters.slice(startIndex, endIndex);

    return (
      <div className="character-grid-container">
        <div className="character-grid">
          {currentCharacters.map(character => {
            const displayedTags = character.tags?.slice(0, 3) || [];
            const remainingCount = character.tags ? Math.max(0, character.tags.length - 3) : 0;
            
            return (
              <div 
                key={character.id} 
                className="character-card"
                onClick={() => onSelect(character)}
              >
                <img 
                  src={character.avatarUrl} 
                  alt={character.name}
                  className="character-avatar"
                />
                <h3>{character.name}</h3>
                <p>{character.description}</p>
                {character.tags && character.tags.length > 0 && (
                  <div className="character-tags">
                    {displayedTags.map(tagId => {
                      const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                      return tag ? (
                        <div key={tagId} className="tag">
                          <span>{tag.emoji}</span>
                          <span>{tag.label}</span>
                        </div>
                      ) : null;
                    })}
                    {remainingCount > 0 && (
                      <div className="tag more-tag">
                        +{remainingCount} more
                      </div>
                    )}
                  </div>
                )}
                <div className="card-footer">
                  <small>created by @{character.username}</small>
                  <div className="message-count">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {character.messages_count || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    );
  }
}));

const ChatInterface = React.lazy(() => Promise.resolve({
  default: ({ character, onBack }) => {
    const room = new WebsimSocket();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = React.createRef();
    const [subscriptions] = useState(new Set());

    useEffect(() => {
      return () => {
        subscriptions.forEach(subscription => {
          if (typeof subscription === 'function') {
            subscription();
          }
        });
      };
    }, []);

    const userSettings = React.useSyncExternalStore(
      (callback) => {
        const subscription = room.collection('user_settings')
          .filter({ username: room.party.client.username })
          .subscribe(callback);
        subscriptions.add(subscription);
        return () => {
          subscriptions.delete(subscription);
          if (typeof subscription === 'function') {
            subscription();
          }
        };
      },
      () => room.collection('user_settings')
        .filter({ username: room.party.client.username })
        .getList()
    );

    const displayName = userSettings.length > 0 && userSettings[0].displayName 
      ? userSettings[0].displayName 
      : room.party.client.username;

    useEffect(() => {
      const loadOrInitializeChat = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const isNewChat = urlParams.get('new') === 'true';

        if (isNewChat) {
          const existingChat = await room.collection('chat_history')
            .filter({ 
              character_id: character.id,
              username: room.party.client.username 
            })
            .getList();

          if (existingChat.length > 0) {
            await room.collection('chat_history').delete(existingChat[0].id);
          }

          setMessages([{ 
            role: 'assistant', 
            content: character.firstMessage.replaceAll('{{user}}', displayName)
          }]);
          return;
        }

        const existingChat = await room.collection('chat_history')
          .filter({ 
            character_id: character.id,
            username: room.party.client.username 
          })
          .getList();

        if (existingChat.length > 0) {
          setMessages(existingChat[0].messages);
        } else {
          setMessages([{ 
            role: 'assistant', 
            content: character.firstMessage.replaceAll('{{user}}', displayName)
          }]);
        }
      };

      loadOrInitializeChat();
    }, [character.id]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const generateResponse = async (messageHistory, startIndex = null) => {
      try {
        const userInfo = {
          username: displayName,
          persona: userSettings.length > 0 ? userSettings[0].persona : null
        };

        const personalizedPersona = character.persona
          .replaceAll('{{user}}', userInfo.username)
          .replaceAll('{{char}}', character.name);
        const personalizedScenario = character.scenario
          .replaceAll('{{user}}', userInfo.username)
          .replaceAll('{{char}}', character.name);
        const personalizedFirstMessage = character.firstMessage
          .replaceAll('{{user}}', userInfo.username)
          .replaceAll('{{char}}', character.name);

        const response = await fetch('/api/ai_completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: `You are ${character.name}, a character with the following attributes:

Persona: ${personalizedPersona}

${character.scenario ? `Scenario: ${personalizedScenario}` : ''}

${userInfo.persona ? `You know this about ${userInfo.username}: ${userInfo.persona}` : ''}

Your first message to the user was: "${personalizedFirstMessage}"

Respond to the user's messages as this character, staying true to the persona${character.scenario ? ' and scenario' :  ''}. Adapt your responses based on the character's narrative style:
- If the character speaks in **first person**, describe their thoughts, actions, and emotions from their own perspective.
- If the character speaks in **third person**, narrate their actions, thoughts, and dialogue as though you are telling a story.

Use * for describing actions and emotions, and ** for emphasis in dialogue or key moments. Maintain consistent tone, speech patterns, and perspective throughout the response.

Provide immersive and engaging responses while keeping them concise and aligned with the character's role.

<typescript-interface>
interface Response {
  message: string;
}
</typescript-interface>

<examples>
Example 1 (First Person):
{
  "message": "Ah, the scent of fresh pastries! *inhales deeply, a pleased smile crossing their face* I simply adore mornings like this—don't you?"
}

Example 2 (Third Person):
{
  "message": "${character.name} strides into the tavern, their cloak billowing behind their. *She glances around, their piercing gaze scanning the room for familiar faces.* 'Ah, there you are!' they exclaimed with a grin, approaching the table."
}
</examples>`,
            data: {
              messages: messageHistory
            }
          })
        });

        const data = await response.json();
        return data.message;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    };

    const handleRegenerateLastResponse = async () => {
      const updatedMessages = messages.slice(0, -1);
      setMessages(updatedMessages);
      
      setIsTyping(true);
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: '',
        isTyping: true
      }]);

      const response = await generateResponse(updatedMessages);
      
      setIsTyping(false);
      const assistantMessage = {
        role: 'assistant',
        content: response,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      try {
        const characterSubscription = room.collection('character').subscribe(async () => {
          await room.collection('character').update(character.id, {
            messages_count: (character.messages_count || 0) + 1
          });
          
          if (typeof characterSubscription === 'function') {
            characterSubscription();
          }
        });
        subscriptions.add(characterSubscription);

        const existingChat = await room.collection('chat_history')
          .filter({ 
            character_id: character.id,
            username: room.party.client.username 
          })
          .getList();

        const chatData = {
          character_id: character.id,
          character_name: character.name,
          character_avatar: character.avatarUrl,
          username: room.party.client.username,
          messages: finalMessages,
          updated_at: new Date().toISOString()
        };

        if (existingChat.length > 0) {
          await room.collection('chat_history').update(existingChat[0].id, chatData);
        } else {
          await room.collection('chat_history').create(chatData);
        }
      } catch (error) {
        console.error('Error updating chat data:', error);
      }
    };

    const handleRewind = async (index) => {
      const updatedMessages = messages.slice(0, index + 1);
      setMessages(updatedMessages);

      try {
        const existingChat = await room.collection('chat_history')
          .filter({ 
            character_id: character.id,
            username: room.party.client.username 
          })
          .getList();

        const chatData = {
          character_id: character.id,
          character_name: character.name,
          character_avatar: character.avatarUrl,
          username: room.party.client.username,
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        };

        if (existingChat.length > 0) {
          await room.collection('chat_history').update(existingChat[0].id, chatData);
        }
      } catch (error) {
        console.error('Error updating chat data:', error);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!input.trim()) return;

      const userMessage = {
        role: 'user',
        content: input,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput('');
      
      setIsTyping(true);
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: '',
        isTyping: true
      }]);

      const response = await generateResponse(updatedMessages);
      
      setIsTyping(false);
      const assistantMessage = {
        role: 'assistant',
        content: response,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      try {
        const characterSubscription = room.collection('character').subscribe(async () => {
          await room.collection('character').update(character.id, {
            messages_count: (character.messages_count || 0) + 1
          });
          
          if (typeof characterSubscription === 'function') {
            characterSubscription();
          }
        });
        subscriptions.add(characterSubscription);

        const existingChat = await room.collection('chat_history')
          .filter({ 
            character_id: character.id,
            username: room.party.client.username 
          })
          .getList();

        const chatData = {
          character_id: character.id,
          character_name: character.name,
          character_avatar: character.avatarUrl,
          username: room.party.client.username,
          messages: finalMessages,
          updated_at: new Date().toISOString()
        };

        if (existingChat.length > 0) {
          await room.collection('chat_history').update(existingChat[0].id, chatData);
        } else {
          await room.collection('chat_history').create(chatData);
        }
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    };

    return (
      <div className="chat-container card">
        <div className="chat-messages">
          {messages.map((message, i) => {
            const isLastAssistantMessage = message.role === 'assistant' && 
              messages.slice(i + 1).every(m => m.role === 'user');
            
            return (
              <ChatMessage 
                key={i} 
                message={message} 
                character={character}
                onRegenerate={handleRegenerateLastResponse}
                onRewind={handleRewind}
                index={i}
                isLastAssistantMessage={isLastAssistantMessage}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
        </form>
      </div>
    );
  }
}));

const CharacterDetails = React.lazy(() => Promise.resolve({
  default: ({ character, onBack, onStartChat }) => {
    const room = new WebsimSocket();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const isOwner = character.username === room.party.client.username;

    const existingChat = React.useSyncExternalStore(
      room.collection('chat_history')
        .filter({ 
          character_id: character.id,
          username: room.party.client.username 
        })
        .subscribe,
      () => room.collection('chat_history')
        .filter({ 
          character_id: character.id,
          username: room.party.client.username 
        })
        .getList()
    )[0];

    const handleStartNewChat = () => {
      if (existingChat) {
        setShowConfirmation(true);
      } else {
        onStartChat(true);
      }
    };

    const handleContinueChat = () => {
      onStartChat(false);
    };

    const handleDelete = async () => {
      try {
        await room.collection('character').delete(character.id);
        onBack(); 
      } catch (error) {
        console.error('Error deleting character:', error);
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    return (
      <div className="card character-details">
        <div className="character-details-header-container">
          <button className="back-button" onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Discover
          </button>
          
          {isOwner && (
            <div className="character-owner-controls">
              <button 
                className="button-secondary"
                onClick={() => setEditingCharacter(true)}
              >
                Edit
              </button>
              <button 
                style={{ background: 'var(--error)' }}
                onClick={() => setShowDeleteConfirmation(true)}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="character-details-header">
          <img 
            src={character.avatarUrl} 
            alt={character.name}
            className="character-details-avatar"
          />
          <div className="character-details-info">
            <h1>{character.name}</h1>
            <small>created by @{character.username} • {formatDate(character.created_at)}</small>
            <div className="character-stats">
              <span className="stats-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {character.messages_count || 0} messages sent
              </span>
            </div>
            {character.tags && character.tags.length > 0 && (
              <div className="character-tags">
                {character.tags.map(tagId => {
                  const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                  return tag ? (
                    <div key={tagId} className="tag">
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
            <div className="character-details-buttons" style={{ marginTop: '16px' }}>
              {existingChat && (
                <button onClick={handleContinueChat}>
                  Continue Latest Chat
                </button>
              )}
              <button onClick={handleStartNewChat}>
                Start New Chat
              </button>
            </div>
          </div>
        </div>

        <div className="character-details-content">
          <section>
            <h3>About</h3>
            <p>{character.description}</p>
          </section>

          <section className="character-details-reviews">
            <h3>Reviews</h3>
            <ReviewSection character={character} />
          </section>
        </div>

        {showConfirmation && (
          <div className="confirmation-modal">
            <div className="confirmation-content">
              <h3>Start New Chat?</h3>
              <p>Starting a new chat will overwrite your previous chat history with this character. Do you want to continue?</p>
              <div className="confirmation-buttons">
                <button className="button-secondary" onClick={() => setShowConfirmation(false)}>
                  Cancel
                </button>
                <button onClick={() => {
                  setShowConfirmation(false);
                  onStartChat(true);
                }}>
                  Start New Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {editingCharacter && (
          <EditCharacterModal
            character={character}
            onClose={() => setEditingCharacter(false)}
            onSave={() => {
              setEditingCharacter(false);
              room.collection('character').subscribe(() => {});
            }}
          />
        )}

        {showDeleteConfirmation && (
          <DeleteConfirmationModal
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirmation(false)}
          />
        )}
      </div>
    );
  }
}));

const ChatMessage = ({ message, character, onRegenerate, onRewind, index, isLastAssistantMessage }) => {
  const room = new WebsimSocket();
  
  const formatMessageParts = (messageText) => {
    if (!messageText || messageText.trim() === '') {
      return [];
    }

    try {
      let text = messageText;
      if (room.party.client.username) {
        text = text.replaceAll('{{user}}', room.party.client.username);
      }
      
      // Split by emphasis markers but preserve them
      const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
      });
    } catch (error) {
      console.error('Error formatting message:', error);
      return [messageText || ''];
    }
  };

  if (!message) {
    return null;
  }

  if (message.role === 'assistant' && (!message.content || message.content.trim() === '') && !message.isTyping) {
    return (
      <div className={`message ${message.role} error`}>
        <img 
          src={character.avatarUrl} 
          alt={character.name}
        />
        <div className="message-content error">
          <p>An error occurred during response generation.</p>
          <button onClick={onRegenerate} className="regenerate-button">
            Regenerate Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`message ${message.role} ${message.isTyping ? 'typing' : ''}`}>
      <img 
        src={message.role === 'assistant' ? character.avatarUrl : room.party.client.avatarUrl} 
        alt={message.role === 'assistant' ? character.name : 'You'}
      />
      <div className="message-content">
        {message.isTyping ? (
          <>
            Replying<span className="typing-indicator"></span>
          </>
        ) : (
          formatMessageParts(message.content)
        )}
      </div>
      {message.role === 'assistant' && !message.isTyping && (
        <div className="message-actions">
          {isLastAssistantMessage ? (
            <button
              className="message-action-button"
              onClick={onRegenerate}
              title="Regenerate response"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
            </button>
          ) : (
            <button
              className="message-action-button"
              onClick={() => onRewind(index)}
              title="Rewind to this message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EnhanceButton({ fieldValue, onEnhance, label }) {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!fieldValue.trim() || fieldValue.length < 20) return;
    setIsEnhancing(true);
    
    try {
      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: `Given the following ${label}, enhance it to be more detailed, natural, and engaging while maintaining the same core meaning and personality. Make it feel more authentic and rich in character.

<typescript-interface>
interface Response {
  enhanced: string;
}
</typescript-interface>

<example>
{
  "enhanced": "Enhanced version of the text that's more detailed and engaging..."
}
</example>`,
          data: fieldValue
        })
      });

      const data = await response.json();
      onEnhance(data.enhanced);
    } catch (error) {
      console.error('Error enhancing text:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <button
      type="button"
      className="enhance-button"
      onClick={handleEnhance}
      disabled={isEnhancing || !fieldValue.trim() || fieldValue.length < 20}
    >
      {isEnhancing ? 'Enhancing...' : ' Enhance'}
    </button>
  );
}

function EditCharacterModal({ character, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: character.name,
    description: character.description,
    persona: character.persona,
    scenario: character.scenario,
    firstMessage: character.firstMessage,
    visibility: character.visibility,
    characterImageUrl: character.avatarUrl,
    tags: character.tags || []
  });
  const [uploadError, setUploadError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const room = new WebsimSocket();

      await room.collection('character').update(character.id, {
        name: formData.name,
        description: formData.description,
        persona: formData.persona,
        scenario: formData.scenario,
        firstMessage: formData.firstMessage,
        visibility: formData.visibility,
        avatarUrl: formData.characterImageUrl,
        tags: formData.tags
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  return (
    <div className="confirmation-modal">
      <div className="confirmation-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflow: 'auto' }}>
        <h2>Edit Character</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Character Image</label>
            <div className="image-upload">
              {formData.characterImageUrl ? (
                <div className="preview">
                  <img 
                    src={formData.characterImageUrl} 
                    alt="Character preview"
                    className="character-image-preview"
                  />
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({...prev, characterImageUrl: ''}))}
                    className="remove-image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <label className="file-upload-button">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        if (!file.type.startsWith('image/')) {
                          setUploadError('Please upload an image file');
                          return;
                        }

                        try {
                          const url = await websim.upload(file);
                          setFormData(prev => ({
                            ...prev,
                            characterImageUrl: url
                          }));
                          setUploadError('');
                        } catch (error) {
                          console.error('Error uploading image:', error);
                          setUploadError('Failed to upload image');
                        }
                      }}
                    />
                  </label>
                </>
              )}
              {uploadError && <div className="error">{uploadError}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>Character Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({
                ...formData,
                [e.target.name]: e.target.value  
              })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({
                ...formData,
                [e.target.name]: e.target.value  
              })}
              required
              placeholder={characterFormPlaceholders.description}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label>Persona</label>
              <EnhanceButton
                fieldValue={formData.persona}
                onEnhance={(enhanced) => setFormData(prev => ({
                  ...prev,
                  persona: enhanced
                }))}
                label="persona description"
              />
            </div>
            <textarea
              name="persona"
              value={formData.persona}
              onChange={(e) => setFormData({
                ...formData,
                [e.target.name]: e.target.value  
              })}
              required
              placeholder={characterFormPlaceholders.persona}
            />
          </div>

          <div className="form-group">
            <label>Scenario (Optional)</label>
            <textarea
              name="scenario"
              value={formData.scenario}
              onChange={(e) => setFormData({
                ...formData,
                [e.target.name]: e.target.value  
              })}
              placeholder={characterFormPlaceholders.scenario}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label>First Message</label>
              <EnhanceButton
                fieldValue={formData.firstMessage}
                onEnhance={(enhanced) => setFormData(prev => ({
                  ...prev,
                  firstMessage: enhanced
                }))}
                label="first message"
              />
            </div>
            <textarea
              name="firstMessage"
              value={formData.firstMessage}
              onChange={(e) => setFormData({
                ...formData,
                [e.target.name]: e.target.value  
              })}
              required
              placeholder={characterFormPlaceholders.firstMessage}
            />
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <select
              name="visibility"
              value={formData.visibility}
              onChange={(e) => setFormData({
                ...formData,
                [e.target.name]: e.target.value  
              })}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tags (Optional)</label>
            <div className="form-tags">
              {AVAILABLE_TAGS.map(tag => (
                <div
                  key={tag.id}
                  className={`form-tag ${formData.tags.includes(tag.id) ? 'selected' : ''}`}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      tags: prev.tags.includes(tag.id)
                        ? prev.tags.filter(t => t !== tag.id)
                        : [...prev.tags, tag.id]
                    }));
                  }}
                >
                  <span>{tag.emoji}</span>
                  <span>{tag.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="confirmation-buttons">
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({ onConfirm, onCancel }) {
  return (
    <div className="confirmation-modal">
      <div className="confirmation-content">
        <h3>Delete Character?</h3>
        <p>Are you sure you want to delete this character? This action cannot be undone.</p>
        <div className="confirmation-buttons">
          <button className="button-secondary" onClick={onCancel}>Cancel</button>
          <button style={{ background: 'var(--error)' }} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ character }) {
  const room = new WebsimSocket();
  const [newReview, setNewReview] = useState('');
  const [reaction, setReaction] = useState(null);
  const [userReview, setUserReview] = useState(null);

  const reviews = React.useSyncExternalStore(
    room.collection('character_review')
      .filter({ character_id: character.id })
      .subscribe,
    () => room.collection('character_review')
      .filter({ character_id: character.id })
      .getList()
  );

  const stats = useMemo(() => {
    return {
      likes: reviews.filter(r => r.reaction === 'like').length,
      dislikes: reviews.filter(r => r.reaction === 'dislike').length
    };
  }, [reviews]);

  useEffect(() => {
    const existingReview = reviews.find(r => 
      r.username === room.party.client.username
    );
    if (existingReview) {
      setUserReview(existingReview);
      setReaction(existingReview.reaction);
      setNewReview(existingReview.comment || '');
    }
  }, [reviews]);

  const handleSubmitReview = async (e) => {
    e?.preventDefault();
    if (!reaction) return;

    if (userReview) {
      await room.collection('character_review').update(userReview.id, {
        reaction,
        comment: newReview.trim() || null
      });
    } else {
      await room.collection('character_review').create({
        character_id: character.id,
        username: room.party.client.username,
        reaction,
        comment: newReview.trim() || null
      });
    }
  };

  const handleDeleteReview = async () => {
    if (userReview) {
      await room.collection('character_review').delete(userReview.id);
      setUserReview(null);
      setReaction(null);
      setNewReview('');
    }
  };

  return (
    <div className="review-section">
      <div className="review-stats">
        <div className="review-stat">
          <button 
            className={`reaction-button ${reaction === 'like' ? 'active' : ''}`}
            onClick={() => {
              setReaction(reaction === 'like' ? null : 'like');
            }}
          >
            <span>👍</span>
            <span>{stats.likes}</span>
          </button>
        </div>
        <div className="review-stat">
          <button 
            className={`reaction-button ${reaction === 'dislike' ? 'active' : ''}`}
            onClick={() => {
              setReaction(reaction === 'dislike' ? null : 'dislike');
            }}
          >
            <span>👎</span>
            <span>{stats.dislikes}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmitReview} className="review-form">
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Leave a review (optional)"
          className="review-input"
        />
        <div className="review-buttons">
          {userReview && (
            <button 
              type="button"
              onClick={handleDeleteReview}
              className="button-secondary"
            >
              Delete Review
            </button>
          )}
          <button 
            type="submit"
            disabled={!reaction}
          >
            {userReview ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>

      <div className="reviews-list">
        {reviews.filter(r => r.comment).map(review => (
          <div key={review.id} className="review-item">
            <div className="review-header">
              <img 
                src={`https://images.websim.ai/avatar/${review.username}`}
                alt={review.username}
              />
              <div className="review-meta">
                <span className="review-username">@{review.username}</span>
                <span className="review-reaction">
                  {review.reaction === 'like' ? '👍' : '👎'}
                </span>
              </div>
            </div>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyCharactersGrid({ characters, onSelect }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [deletingCharacter, setDeletingCharacter] = useState(null);
  const room = new WebsimSocket();
  
  const totalPages = Math.ceil(characters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCharacters = characters.slice(startIndex, endIndex);

  const handleDelete = async (character) => {
    await room.collection('character').delete(character.id);
    setDeletingCharacter(null);
  };

  const handleSave = () => {
    room.collection('character').subscribe(() => {});
  };

  return (
    <div className="character-grid-container">
      <div className="character-grid">
        {currentCharacters.map(character => {
          const displayedTags = character.tags?.slice(0, 3) || [];
          const remainingCount = character.tags ? Math.max(0, character.tags.length - 3) : 0;
          
          return (
            <div key={character.id} className="character-card">
              <div className="character-card-header">
                {character.visibility === 'private' && (
                  <div className="privacy-badge" title="Private Character">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                )}
                <img 
                  src={character.avatarUrl} 
                  alt={character.name}
                  className="character-avatar"
                  onClick={() => onSelect(character)}
                />
              </div>
              <h3>{character.name}</h3>
              <p>{character.description}</p>
              {character.tags && character.tags.length > 0 && (
                <div className="character-tags">
                  {displayedTags.map(tagId => {
                    const tag = AVAILABLE_TAGS.find(t => t.id === tagId);
                    return tag ? (
                      <div key={tagId} className="tag">
                        <span>{tag.emoji}</span>
                        <span>{tag.label}</span>
                      </div>
                    ) : null;
                  })}
                  {remainingCount > 0 && (
                    <div className="tag more-tag">
                      +{remainingCount} more
                    </div>
                  )}
                </div>
              )}
              <div className="character-details-buttons">
                <button 
                  className="button-secondary"
                  onClick={() => setEditingCharacter(character)}
                >
                  Edit
                </button>
                <button 
                  style={{ background: 'var(--error)' }}
                  onClick={() => setDeletingCharacter(character)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
      {editingCharacter && (
        <EditCharacterModal
          character={editingCharacter}
          onClose={() => setEditingCharacter(null)}
          onSave={handleSave}
        />
      )}

      {deletingCharacter && (
        <DeleteConfirmationModal
          onConfirm={() => handleDelete(deletingCharacter)}
          onCancel={() => setDeletingCharacter(null)}
        />
      )}
    </div>
  );
}

function PreviousChatsSection({ onSelectChat }) {
  const [loading, setLoading] = useState(true);
  const room = new WebsimSocket();
  
  const chatHistory = React.useSyncExternalStore(
    room.collection('chat_history')
      .filter({ username: room.party.client.username })
      .subscribe,
    () => room.collection('chat_history')
      .filter({ username: room.party.client.username })
      .getList()
  );

  const characters = React.useSyncExternalStore(
    room.collection('character').subscribe,
    () => room.collection('character').getList()
  );

  const recentChats = useMemo(() => {
    return [...chatHistory]
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5);
  }, [chatHistory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="previous-chats-section">
        <h2>Previously Chatted</h2>
        <div className="previous-chats-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton character-card-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (chatHistory.length === 0) return null;

  return (
    <div className="previous-chats-section">
      <h2>Previously Chatted</h2>
      <div className="previous-chats-grid">
        {recentChats.map(chat => {
          const character = characters.find(c => c.id === chat.character_id);
          if (!character) return null;

          return (
            <div 
              key={chat.id} 
              className="previous-chat-card"
              onClick={() => onSelectChat(character)}
            >
              <img src={chat.character_avatar} alt={chat.character_name} />
              <div className="previous-chat-info">
                <h3>{chat.character_name}</h3>
                <p>{chat.messages.length} messages</p>
                <small>Last active: {new Date(chat.updated_at).toLocaleDateString()}</small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileSettings() {
  const room = new WebsimSocket();
  const [settings, setSettings] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    persona: ''
  });

  const userSettings = React.useSyncExternalStore(
    room.collection('user_settings')
      .filter({ username: room.party.client.username })
      .subscribe,
    () => room.collection('user_settings')
      .filter({ username: room.party.client.username })
      .getList()
  );

  useEffect(() => {
    if (userSettings.length > 0) {
      setSettings(userSettings[0]);
      setFormData({
        displayName: userSettings[0].displayName || '',
        persona: userSettings[0].persona || ''
      });
    }
  }, [userSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (settings) {
        await room.collection('user_settings').update(settings.id, {
          username: room.party.client.username,
          displayName: formData.displayName.trim() || null,
          persona: formData.persona.trim() || null
        });
      } else {
        await room.collection('user_settings').create({
          username: room.party.client.username,
          displayName: formData.displayName.trim() || null,
          persona: formData.persona.trim() || null
        });
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="card">
      <h2>Profile Settings</h2>
      
      {!isEditing ? (
        <>
          <div className="profile-info">
            <div className="profile-field">
              <h3>Display Name</h3>
              <p>{settings?.displayName || room.party.client.username}</p>
            </div>
            
            <div className="profile-field">
              <h3>Your Persona</h3>
              <p>{settings?.persona || 'No persona set'}</p>
            </div>
          </div>
          <button className="button-secondary" onClick={() => setIsEditing(true)}>
            Edit Settings
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Display Name (Optional)</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                displayName: e.target.value
              }))}
              placeholder="Leave blank to use your username"
            />
          </div>

          <div className="form-group">
            <label>Your Persona (Optional)</label>
            <textarea
              value={formData.persona}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                persona: e.target.value
              }))}
              placeholder="Describe yourself and how characters should interact with you. This helps characters maintain consistent behavior in your conversations."
            />
          </div>

          <div className="profile-buttons">
            <button type="button" className="button-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit">
              Save Changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
    </div>
  );
}

function CharacterGridSkeleton() {
  return (
    <div className="character-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="skeleton character-card-skeleton" />
      ))}
    </div>
  );
}

function TagSelector({ selectedTags, onTagSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="tag-selector">
      <button className="tag-button" onClick={() => setIsOpen(!isOpen)}>
        <span>Filter Tags</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="tag-menu">
          <div className="tag-list">
            {AVAILABLE_TAGS.map(tag => (
              <div
                key={tag.id}
                className={`tag ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                onClick={() => onTagSelect(tag.id)}
              >
                <span>{tag.emoji}</span>
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SortSelector({ selectedSort, onSortSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sort-selector">
      <button className="sort-button" onClick={() => setIsOpen(!isOpen)}>
        <span>{SORT_OPTIONS.find(opt => opt.id === selectedSort)?.label}</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="sort-menu">
          <div className="sort-list">
            {SORT_OPTIONS.map(option => (
              <div
                key={option.id}
                className={`sort-option ${selectedSort === option.id ? 'selected' : ''}`}
                onClick={() => {
                  onSortSelect(option.id);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [tab, setTab] = useState('discover');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    persona: '',
    scenario: '',
    firstMessage: '',
    visibility: 'public',
    characterImageUrl: '',
    tags: []
  });

  const [uploadError, setUploadError] = useState('');
  const [viewingCharacter, setViewingCharacter] = useState(null);
  const [sortOption, setSortOption] = useState('popular');
  const [isCreating, setIsCreating] = useState(false);

  const [loading, setLoading] = useState(true);
  const room = new WebsimSocket();
  
  const charactersQuery = React.useSyncExternalStore(
    room.collection('character').subscribe,
    () => room.collection('character').getList()
  );

  const publicCharacters = useMemo(() => {
    return charactersQuery.filter(c => c.visibility === 'public');
  }, [charactersQuery]);

  const myCharacters = useMemo(() => {
    return charactersQuery.filter(c => c.username === room.party.client.username);
  }, [charactersQuery]);

  const filteredAndSortedCharacters = useMemo(() => {
    let characters = publicCharacters;
    
    if (selectedTags.length > 0) {
      characters = characters.filter(character => 
        selectedTags.every(tag => character.tags?.includes(tag))
      );
    }

    return characters.sort((a, b) => {
      if (sortOption === 'popular') {
        return (b.messages_count || 0) - (a.messages_count || 0);
      } else {
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  }, [publicCharacters, selectedTags, sortOption]);

  const handleStartChat = async (character, isNewChat) => {
    if (isNewChat) {
      window.history.pushState({}, '', `?new=true`);
    } else {
      window.history.pushState({}, '', window.location.pathname);
    }
    
    setSelectedCharacter(character);
    setViewingCharacter(null);
    setTab('chat');
  };

  const handleCreateCharacter = async (e) => {
    e.preventDefault();
    if (!formData.characterImageUrl) {
      setUploadError('Please upload a character image');
      return;
    }

    setIsCreating(true);

    try {
      const room = new WebsimSocket();
      const newCharacter = await room.collection('character').create({
        ...formData,
        username: room.party.client.username,
        avatarUrl: formData.characterImageUrl 
      });

      const subscription = room.collection('character').subscribe((characters) => {
        const character = characters.find(c => c.id === newCharacter.id);
        if (character) {
          setFormData({
            name: '',
            description: '',
            persona: '',
            scenario: '',
            firstMessage: '',
            visibility: 'public',
            characterImageUrl: '',
            tags: []
          });
          
          setIsCreating(false);
          setViewingCharacter(character);
          setTab('discover');
          if (typeof subscription === 'function') {
            subscription();
          }
        }
      });

    } catch (error) {
      console.error('Error creating character:', error);
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleTabChange = (newTab) => {
    setLoading(true);
    setTab(newTab);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div>
      <div className="topbar">
        {tab === 'chat' ? (
          <button className="back-button" onClick={() => {
            handleTabChange('discover');
            setSelectedCharacter(null);
            setViewingCharacter(selectedCharacter);
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
        ) : (
          <img src="charsim logo.svg" alt="Charsim" className="site-logo" />
        )}
        <div className="topbar-center">
          {tab === 'chat' ? (
            <>
              <h2 className="chat-title">Chat with {selectedCharacter?.name}</h2>
              <div className="chat-disclaimer">This is A.I. and not a real person. Treat everything it says as fiction.</div>
            </>
          ) : null}
        </div>
        <div className="topbar-right">
          {tab === 'chat' ? (
            null
          ) : (
            <>
              <button 
                className={`nav-button ${tab === 'discover' ? 'active' : ''}`} 
                onClick={() => {
                  handleTabChange('discover');
                  setSelectedCharacter(null);
                  setViewingCharacter(null);
                }}
              >
                Discover
              </button>
              <button 
                className="create-button" 
                onClick={() => {
                  handleTabChange('create');
                  setSelectedCharacter(null);
                  setViewingCharacter(null);
                }}
              >
                Create Character
              </button>
              <img 
                src={room.party.client.avatarUrl} 
                alt="My Profile" 
                className="profile-avatar"
                onClick={() => {
                  handleTabChange('myCharacters');
                  setSelectedCharacter(null);
                  setViewingCharacter(null);
                }}
              />
            </>
          )}
        </div>
      </div>
      
      <div className="container">
        <Suspense fallback={<LoadingSpinner />}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {tab === 'chat' && selectedCharacter && (
                <ChatInterface 
                  character={selectedCharacter}
                  onBack={() => {
                    handleTabChange('discover');
                    setSelectedCharacter(null);
                    setViewingCharacter(selectedCharacter); 
                  }}
                />
              )}

              {viewingCharacter && (
                <CharacterDetails 
                  character={viewingCharacter}
                  onBack={() => setViewingCharacter(null)}
                  onStartChat={(isNewChat) => handleStartChat(viewingCharacter, isNewChat)}
                />
              )}

              {(tab === 'discover' || !tab) && !viewingCharacter && (
                <>
                  <PreviousChatsSection 
                    onSelectChat={(character) => {
                      setViewingCharacter(character);
                    }}
                  />
                  <div className="section-header">
                    <div className="section-header-left">
                      <h2>All Characters</h2>
                    </div>
                    <div className="section-header-controls">
                      <SortSelector 
                        selectedSort={sortOption}
                        onSortSelect={setSortOption}
                      />
                      <TagSelector 
                        selectedTags={selectedTags} 
                        onTagSelect={(tagId) => {
                          setSelectedTags(prev => 
                            prev.includes(tagId) 
                              ? prev.filter(t => t !== tagId)
                              : [...prev, tagId]
                          );
                        }}
                      />
                    </div>
                  </div>
                  <Suspense fallback={<CharacterGridSkeleton />}>
                    <CharacterGrid 
                      characters={filteredAndSortedCharacters}
                      onSelect={(character) => {
                        setViewingCharacter(character);
                      }}
                    />
                  </Suspense>
                </>
              )}

              {tab === 'myCharacters' && (
                <div>
                  <h2>My Characters</h2>
                  <MyCharactersGrid 
                    characters={myCharacters}
                    onSelect={(character) => {
                      setViewingCharacter(character);
                    }}
                  />
                  <div style={{ marginTop: '40px' }}>
                    <ProfileSettings />
                  </div>
                </div>
              )}

              {tab === 'create' && (
                <div className="card">
                  <form onSubmit={handleCreateCharacter}>
                    <div className="form-group">
                      <label>Character Image</label>
                      <div className="image-upload">
                        {formData.characterImageUrl ? (
                          <div className="preview">
                            <img 
                              src={formData.characterImageUrl} 
                              alt="Character preview"
                              className="character-image-preview"
                            />
                            <button 
                              type="button" 
                              onClick={() => setFormData(prev => ({...prev, characterImageUrl: ''}))}
                              className="remove-image"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <>
                            <label className="file-upload-button">
                              Choose Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;

                                  if (!file.type.startsWith('image/')) {
                                    setUploadError('Please upload an image file');
                                    return;
                                  }

                                  try {
                                    const url = await websim.upload(file);
                                    setFormData(prev => ({
                                      ...prev,
                                      characterImageUrl: url
                                    }));
                                    setUploadError('');
                                  } catch (error) {
                                    console.error('Error uploading image:', error);
                                    setUploadError('Failed to upload image');
                                  }
                                }}
                                required
                              />
                            </label>
                          </>
                        )}
                        {uploadError && <div className="error">{uploadError}</div>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Character Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          [e.target.name]: e.target.value  
                        })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={(e) => setFormData({
                          ...formData,
                          [e.target.name]: e.target.value  
                        })}
                        required
                        placeholder={characterFormPlaceholders.description}
                      />
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label>Persona</label>
                        <EnhanceButton
                          fieldValue={formData.persona}
                          onEnhance={(enhanced) => setFormData(prev => ({
                            ...prev,
                            persona: enhanced
                          }))}
                          label="persona description"
                        />
                      </div>
                      <textarea
                        name="persona"
                        value={formData.persona}
                        onChange={(e) => setFormData({
                          ...formData,
                          [e.target.name]: e.target.value  
                        })}
                        required
                        placeholder={characterFormPlaceholders.persona}
                      />
                    </div>

                    <div className="form-group">
                      <label>Scenario (Optional)</label>
                      <textarea
                        name="scenario"
                        value={formData.scenario}
                        onChange={(e) => setFormData({
                          ...formData,
                          [e.target.name]: e.target.value  
                        })}
                        placeholder={characterFormPlaceholders.scenario}
                      />
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label>First Message</label>
                        <EnhanceButton
                          fieldValue={formData.firstMessage}
                          onEnhance={(enhanced) => setFormData(prev => ({
                            ...prev,
                            firstMessage: enhanced
                          }))}
                          label="first message"
                        />
                      </div>
                      <textarea
                        name="firstMessage"
                        value={formData.firstMessage}
                        onChange={(e) => setFormData({
                          ...formData,
                          [e.target.name]: e.target.value  
                        })}
                        required
                        placeholder={characterFormPlaceholders.firstMessage}
                      />
                    </div>

                    <div className="form-group">
                      <label>Visibility</label>
                      <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={(e) => setFormData({
                          ...formData,
                          [e.target.name]: e.target.value  
                        })}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Tags (Optional)</label>
                      <div className="form-tags">
                        {AVAILABLE_TAGS.map(tag => (
                          <div
                            key={tag.id}
                            className={`form-tag ${formData.tags.includes(tag.id) ? 'selected' : ''}`}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                tags: prev.tags.includes(tag.id)
                                  ? prev.tags.filter(t => t !== tag.id)
                                  : [...prev.tags, tag.id]
                              }));
                            }}
                          >
                            <span>{tag.emoji}</span>
                            <span>{tag.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating Character...' : 'Create Character'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));