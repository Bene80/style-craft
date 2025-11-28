
// Global state
let embeds = [];
let embedIdCounter = 0;

// Constants
const MAX_EMBEDS = 10;
const MAX_FIELDS_PER_EMBED = 25;
const DEBOUNCE_DELAY = 300; // ms

// Debounce utility for performance optimization
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced update functions
const debouncedUpdatePreview = debounce(updatePreview, DEBOUNCE_DELAY);
const debouncedSaveToStorage = debounce(saveToStorage, DEBOUNCE_DELAY);

// Modal functions
function showModal(title, content) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = content;
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('modal');
  if (e.target === modal) {
    closeModal();
  }
});

// Toggle section collapse/expand
function toggleSection(header) {
  header.classList.toggle('collapsed');
  const content = header.nextElementSibling;
  if (content) {
    content.classList.toggle('collapsed');
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-check-circle';
  if (type === 'error') icon = 'fa-exclamation-circle';
  if (type === 'info') icon = 'fa-info-circle';
  
  toast.innerHTML = `
    <i class=\"fas ${icon}\"></i>
    <span class=\"toast-message\">${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Character counter update
function updateCharCounter(inputId, counterId, max) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  
  if (!input || !counter) return;
  
  const length = input.value.length;
  counter.textContent = `${length} / ${max}`;
  
  // Update counter color based on usage
  counter.classList.remove('warning', 'danger');
  if (length > max * 0.9) {
    counter.classList.add('danger');
  } else if (length > max * 0.75) {
    counter.classList.add('warning');
  }
}

// Help popup
function showHelp() {
  const helpContent = `
    <h3>Getting Started</h3>
    <p>Welcome to Style Craft! Here's how to use it:</p>

    <h3>Step 1: Get Your Webhook URL</h3>
    <ul>
      <li>Go to your Discord server settings</li>
      <li>Navigate to <strong>Integrations</strong></li>
      <li>Click on <strong>Webhooks</strong></li>
      <li>Create a new webhook or use an existing one</li>
      <li>Copy the webhook URL</li>
    </ul>

    <h3>Step 2: Create Your Message</h3>
    <ul>
      <li><strong>Message Content:</strong> The main text of your message (max 2000 chars)</li>
      <li><strong>Username:</strong> Custom name for the webhook bot (max 80 chars)</li>
      <li><strong>Avatar URL:</strong> Custom profile picture (direct image URL)</li>
    </ul>

    <h3>Step 3: Design Your Embeds</h3>
    <ul>
      <li><strong>Add Embeds:</strong> Click \"Add Embed\" to create up to 10 rich embeds</li>
      <li><strong>Embed Content:</strong> Configure author, title, description, color, etc.</li>
      <li><strong>Images:</strong> Add author icon, footer icon, thumbnail, and main image</li>
      <li><strong>Fields:</strong> Add up to 25 fields per embed (can be inline)</li>
    </ul>

    <h3>New Features</h3>
    <ul>
      <li><strong>Templates:</strong> Quick-start with pre-made templates</li>
      <li><strong>JSON Import/Export:</strong> Save and share your messages</li>
      <li><strong>Copy Payload:</strong> Get the raw JSON for API integration</li>
      <li><strong>Live Preview:</strong> See changes in real-time</li>
      <li><strong>Keyboard Shortcuts:</strong> Ctrl+Enter to send, Ctrl+S to save</li>
    </ul>

    <h3>Limits</h3>
    <ul>
      <li>Maximum 10 embeds per message</li>
      <li>Maximum 25 fields per embed</li>
      <li>Message content: 2000 characters</li>
      <li>Username: 80 characters</li>
    </ul>
  `;

  showModal('Help & Tutorial', helpContent);
}

// About popup
function showAbout() {
  const aboutContent = `
    <h3>About Style Craft</h3>
    <p>A powerful and modern tool to create beautiful Discord webhook messages with rich embeds.</p>

    <h3>✨ New Features</h3>
    <ul>
      <li><strong>⚡ Lightning Fast:</strong> Optimized with debouncing for smooth performance</li>
      <li><strong>👁️ Live Preview:</strong> Side-by-side editor with real-time updates</li>
      <li><strong>📋 Templates:</strong> Quick-start with pre-made message templates</li>
      <li><strong>💾 Import/Export:</strong> Save and share messages as JSON</li>
      <li><strong>📊 Character Counters:</strong> Track your text limits in real-time</li>
      <li><strong>⌨️ Keyboard Shortcuts:</strong> Work faster with hotkeys</li>
    </ul>

    <h3>Features</h3>
    <ul>
      <li><strong>Rich Embeds:</strong> Create beautiful embeds with custom colors</li>
      <li><strong>Multiple Embeds:</strong> Add up to 10 embeds per message</li>
      <li><strong>Organized Interface:</strong> Clean, modern design</li>
      <li><strong>Copy Payload:</strong> Get raw JSON for API integration</li>
      <li><strong>Auto-Save:</strong> Your work is saved automatically</li>
      <li><strong>Responsive:</strong> Works on desktop and mobile</li>
    </ul>

    <h3>What are Webhooks?</h3>
    <p>Webhooks are automated messages sent to Discord channels. They allow external services to post messages to your server without needing a bot account.</p>

    <h3>Made with ❤️ for the Discord community</h3>
  `;

  showModal('About Style Craft', aboutContent);
}

// Templates
function showTemplates() {
  const templatesContent = `
    <h3>Choose a Template</h3>
    <div class=\"template-grid\">
      <div class=\"template-card\" onclick=\"loadTemplate('success')\">
        <div class=\"template-icon\">✅</div>
        <h4>Success</h4>
        <p>For positive announcements</p>
      </div>
      
      <div class=\"template-card\" onclick=\"loadTemplate('error')\">
        <div class=\"template-icon\">❌</div>
        <h4>Error</h4>
        <p>For error messages</p>
      </div>
      
      <div class=\"template-card\" onclick=\"loadTemplate('info')\">
        <div class=\"template-icon\">ℹ️</div>
        <h4>Info</h4>
        <p>For informational messages</p>
      </div>
      
      <div class=\"template-card\" onclick=\"loadTemplate('announcement')\">
        <div class=\"template-icon\">📢</div>
        <h4>Announcement</h4>
        <p>For important updates</p>
      </div>

      <div class=\"template-card\" onclick=\"loadTemplate('welcome')\">
        <div class=\"template-icon\">👋</div>
        <h4>Welcome</h4>
        <p>For welcoming new members</p>
      </div>

      <div class=\"template-card\" onclick=\"loadTemplate('warning')\">
        <div class=\"template-icon\">⚠️</div>
        <h4>Warning</h4>
        <p>For warning messages</p>
      </div>
    </div>
  `;

  showModal('Message Templates', templatesContent);
}

function loadTemplate(type) {
  const templates = {
    success: {
      username: 'Success Bot',
      messageContent: '✅ Operation completed successfully!',
      embeds: [{
        id: 1,
        title: 'Success',
        description: 'Your action has been completed successfully.',
        color: '#10b981',
        timestamp: true,
        footerText: 'System Notification',
        authorName: '',
        authorIcon: '',
        authorUrl: '',
        thumbnailUrl: '',
        imageUrl: '',
        url: '',
        footerIcon: '',
        fields: []
      }]
    },
    error: {
      username: 'Error Bot',
      messageContent: '❌ An error occurred!',
      embeds: [{
        id: 1,
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        color: '#ef4444',
        timestamp: true,
        footerText: 'System Alert',
        authorName: '',
        authorIcon: '',
        authorUrl: '',
        thumbnailUrl: '',
        imageUrl: '',
        url: '',
        footerIcon: '',
        fields: []
      }]
    },
    info: {
      username: 'Info Bot',
      messageContent: 'ℹ️ Here\'s some important information',
      embeds: [{
        id: 1,
        title: 'Information',
        description: 'This is an informational message with useful details.',
        color: '#3b82f6',
        timestamp: true,
        footerText: 'Information',
        authorName: '',
        authorIcon: '',
        authorUrl: '',
        thumbnailUrl: '',
        imageUrl: '',
        url: '',
        footerIcon: '',
        fields: []
      }]
    },
    announcement: {
      username: 'Announcement',
      messageContent: '📢 Important Announcement',
      embeds: [{
        id: 1,
        title: '🎉 Big News!',
        description: 'We have an exciting announcement to share with you all!',
        color: '#8b5cf6',
        timestamp: true,
        footerText: 'Official Announcement',
        authorName: '',
        authorIcon: '',
        authorUrl: '',
        thumbnailUrl: '',
        imageUrl: '',
        url: '',
        footerIcon: '',
        fields: [
          { id: Date.now(), name: 'What\'s New?', value: 'Describe your announcement here', inline: false }
        ]
      }]
    },
    welcome: {
      username: 'Welcome Bot',
      messageContent: '👋 Welcome to the server!',
      embeds: [{
        id: 1,
        title: 'Welcome!',
        description: 'We\'re glad to have you here. Make yourself at home!',
        color: '#f59e0b',
        timestamp: true,
        footerText: 'Welcome Message',
        authorName: '',
        authorIcon: '',
        authorUrl: '',
        thumbnailUrl: '',
        imageUrl: '',
        url: '',
        footerIcon: '',
        fields: []
      }]
    },
    warning: {
      username: 'Warning Bot',
      messageContent: '⚠️ Warning',
      embeds: [{
        id: 1,
        title: 'Warning',
        description: 'Please pay attention to this important warning.',
        color: '#f59e0b',
        timestamp: true,
        footerText: 'Warning Notice',
        authorName: '',
        authorIcon: '',
        authorUrl: '',
        thumbnailUrl: '',
        imageUrl: '',
        url: '',
        footerIcon: '',
        fields: []
      }]
    }
  };

  const template = templates[type];
  if (template) {
    if (document.getElementById('username')) document.getElementById('username').value = template.username;
    if (document.getElementById('messageContent')) document.getElementById('messageContent').value = template.messageContent;
    
    embeds = template.embeds.map(e => ({ ...e, id: ++embedIdCounter }));
    
    renderEmbeds();
    updatePreview();
    saveToStorage();
    closeModal();
    showToast('Template loaded successfully!', 'success');
  }
}

// Export JSON
function exportJSON() {
  const data = {
    webhookUrl: document.getElementById('webhookUrl')?.value || '',
    messageContent: document.getElementById('messageContent')?.value || '',
    username: document.getElementById('username')?.value || '',
    avatarUrl: document.getElementById('avatarUrl')?.value || '',
    embeds: embeds
  };

  const jsonStr = JSON.stringify(data, null, 2);
  
  const modalContent = `
    <p>Copy the JSON below to save or share your message:</p>
    <textarea readonly onclick=\"this.select()\">${jsonStr}</textarea>
    <button class=\"send-button\" style=\"margin-top: 15px; width: 100%;\" onclick=\"copyToClipboard(this.previousElementSibling.value)\">
      <i class=\"fas fa-copy\"></i> Copy to Clipboard
    </button>
  `;
  
  showModal('Export JSON', modalContent);
}

// Import JSON
function importJSON() {
  const modalContent = `
    <p>Paste your JSON data below:</p>
    <textarea id=\"importJsonText\" placeholder=\"Paste JSON here...\"></textarea>
    <button class=\"send-button\" style=\"margin-top: 15px; width: 100%;\" onclick=\"processImportJSON()\">
      <i class=\"fas fa-file-import\"></i> Import
    </button>
  `;
  
  showModal('Import JSON', modalContent);
}

function processImportJSON() {
  const jsonText = document.getElementById('importJsonText').value;
  
  try {
    const data = JSON.parse(jsonText);
    
    if (document.getElementById('webhookUrl')) document.getElementById('webhookUrl').value = data.webhookUrl || '';
    if (document.getElementById('messageContent')) document.getElementById('messageContent').value = data.messageContent || '';
    if (document.getElementById('username')) document.getElementById('username').value = data.username || '';
    if (document.getElementById('avatarUrl')) document.getElementById('avatarUrl').value = data.avatarUrl || '';
    
    embeds = data.embeds || [];
    embedIdCounter = Math.max(...embeds.map(e => e.id), 0);
    
    renderEmbeds();
    updatePreview();
    saveToStorage();
    closeModal();
    showToast('JSON imported successfully!', 'success');
  } catch (e) {
    showToast('Invalid JSON format!', 'error');
  }
}

// Copy to clipboard utility
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy!', 'error');
  });
}

// Copy webhook payload
function copyPayload() {
  const payload = buildWebhookPayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  
  copyToClipboard(jsonStr);
}

// Build webhook payload
function buildWebhookPayload() {
  const payload = {
    content: document.getElementById('messageContent')?.value || null,
    username: document.getElementById('username')?.value || undefined,
    avatar_url: document.getElementById('avatarUrl')?.value || undefined,
  };

  const embedsPayload = [];

  embeds.forEach(embed => {
    const hasEmbed = embed.authorName || embed.title || embed.description || embed.fields.length > 0 ||
                     embed.thumbnailUrl || embed.imageUrl || embed.footerText;

    if (hasEmbed) {
      const embedObj = {};

      if (embed.authorName) {
        embedObj.author = {
          name: embed.authorName,
          icon_url: embed.authorIcon || undefined,
          url: embed.authorUrl || undefined
        };
      }

      if (embed.title) embedObj.title = embed.title;
      if (embed.description) embedObj.description = embed.description;
      if (embed.url) embedObj.url = embed.url;

      embedObj.color = parseInt(embed.color.replace('#', ''), 16);

      if (embed.thumbnailUrl) embedObj.thumbnail = { url: embed.thumbnailUrl };
      if (embed.imageUrl) embedObj.image = { url: embed.imageUrl };

      if (embed.fields.length > 0) {
        embedObj.fields = embed.fields.filter(f => f.name || f.value).map(f => ({
          name: f.name || 'Field',
          value: f.value || 'Value',
          inline: f.inline
        }));
      }

      if (embed.footerText || embed.footerIcon) {
        embedObj.footer = {
          text: embed.footerText || undefined,
          icon_url: embed.footerIcon || undefined
        };
      }

      if (embed.timestamp) {
        embedObj.timestamp = new Date().toISOString();
      }

      embedsPayload.push(embedObj);
    }
  });

  if (embedsPayload.length > 0) {
    payload.embeds = embedsPayload;
  }

  return payload;
}

// Add embed function
function addEmbed() {
  if (embeds.length >= MAX_EMBEDS) {
    showToast(`Maximum ${MAX_EMBEDS} embeds allowed!`, 'error');
    return;
  }

  const embedId = ++embedIdCounter;
  embeds.push({
    id: embedId,
    authorName: '',
    authorIcon: '',
    authorUrl: '',
    title: '',
    description: '',
    color: '#5865f2',
    thumbnailUrl: '',
    imageUrl: '',
    url: '',
    footerText: '',
    footerIcon: '',
    timestamp: false,
    fields: []
  });

  renderEmbeds();
  updatePreview();
  saveToStorage();
  showToast('Embed added!', 'success');
}

// Remove embed function
function removeEmbed(embedId) {
  embeds = embeds.filter(e => e.id !== embedId);
  renderEmbeds();
  updatePreview();
  saveToStorage();
  showToast('Embed removed!', 'info');
}

// Toggle embed collapse
function toggleEmbed(embedId) {
  const header = document.querySelector(`[data-embed-id=\"${embedId}\"]`);
  const content = header.nextElementSibling;

  header.classList.toggle('collapsed');
  if (content) {
    content.classList.toggle('collapsed');
  }
}

// Render embeds
function renderEmbeds() {
  const container = document.getElementById('embedsContainer');
  if (!container) return;

  container.innerHTML = '';

  embeds.forEach((embed, index) => {
    const embedDiv = document.createElement('div');
    embedDiv.className = 'embed-container';
    embedDiv.innerHTML = `
      <div class=\"embed-header\" data-embed-id=\"${embed.id}\" onclick=\"toggleEmbed(${embed.id})\">
        <div class=\"embed-header-left\">
          <i class=\"fas fa-chevron-down\"></i>
          <h3>Embed ${index + 1}</h3>
        </div>
        <button class=\"remove-embed\" onclick=\"event.stopPropagation(); removeEmbed(${embed.id})\">
          <i class=\"fas fa-trash\"></i> Remove
        </button>
      </div>
      <div class=\"embed-content\">
        <div class=\"form-group\">
          <label>Author Name</label>
          <input type=\"text\" value=\"${embed.authorName}\" oninput=\"updateEmbedField(${embed.id}, 'authorName', this.value)\" placeholder=\"Author name\">
        </div>

        <div class=\"form-group\">
          <label>Author Icon URL</label>
          <input type=\"text\" value=\"${embed.authorIcon}\" oninput=\"updateEmbedField(${embed.id}, 'authorIcon', this.value)\" placeholder=\"https://...\">
        </div>

        <div class=\"form-group\">
          <label>Author URL</label>
          <input type=\"text\" value=\"${embed.authorUrl}\" oninput=\"updateEmbedField(${embed.id}, 'authorUrl', this.value)\" placeholder=\"https://...\">
        </div>

        <div class=\"form-group\">
          <label>Title</label>
          <input type=\"text\" value=\"${embed.title}\" oninput=\"updateEmbedField(${embed.id}, 'title', this.value)\" placeholder=\"Embed title\" maxlength=\"256\">
        </div>

        <div class=\"form-group\">
          <label>Title URL</label>
          <input type=\"text\" value=\"${embed.url}\" oninput=\"updateEmbedField(${embed.id}, 'url', this.value)\" placeholder=\"https://...\">
        </div>

        <div class=\"form-group\">
          <label>Description</label>
          <textarea oninput=\"updateEmbedField(${embed.id}, 'description', this.value)\" placeholder=\"Embed description...\" rows=\"4\" maxlength=\"4096\">${embed.description}</textarea>
        </div>

        <div class=\"form-group\">
          <label>Color</label>
          <div class=\"color-input-group\">
            <input type=\"color\" id=\"embedColor${embed.id}\" value=\"${embed.color}\" oninput=\"updateEmbedColor(${embed.id}, this.value)\">
            <input type=\"text\" id=\"embedColorHex${embed.id}\" value=\"${embed.color}\" oninput=\"updateEmbedColorHex(${embed.id}, this.value)\" placeholder=\"#5865f2\">
          </div>
        </div>

        <div class=\"form-group\">
          <label>Thumbnail URL</label>
          <input type=\"text\" value=\"${embed.thumbnailUrl}\" oninput=\"updateEmbedField(${embed.id}, 'thumbnailUrl', this.value)\" placeholder=\"https://...\">
          <small class=\"input-hint\">Small image on top-right</small>
        </div>

        <div class=\"form-group\">
          <label>Image URL</label>
          <input type=\"text\" value=\"${embed.imageUrl}\" oninput=\"updateEmbedField(${embed.id}, 'imageUrl', this.value)\" placeholder=\"https://...\">
          <small class=\"input-hint\">Large image at bottom</small>
        </div>

        <div class=\"form-group\">
          <label>Footer Text</label>
          <input type=\"text\" value=\"${embed.footerText}\" oninput=\"updateEmbedField(${embed.id}, 'footerText', this.value)\" placeholder=\"Footer text\" maxlength=\"2048\">
        </div>

        <div class=\"form-group\">
          <label>Footer Icon URL</label>
          <input type=\"text\" value=\"${embed.footerIcon}\" oninput=\"updateEmbedField(${embed.id}, 'footerIcon', this.value)\" placeholder=\"https://...\">
        </div>

        <div class=\"form-group checkbox-group\">
          <input type=\"checkbox\" id=\"timestamp${embed.id}\" ${embed.timestamp ? 'checked' : ''} onchange=\"updateEmbedField(${embed.id}, 'timestamp', this.checked)\">
          <label for=\"timestamp${embed.id}\">Include Timestamp</label>
        </div>

        <div style=\"margin-top: 20px; padding-top: 20px; border-top: 1px solid #3f3f46;\">
          <h4 style=\"color: #fff; margin-bottom: 15px; font-size: 0.9rem;\">
            <i class=\"fas fa-th-list\"></i> Fields (${embed.fields.length}/${MAX_FIELDS_PER_EMBED})
          </h4>
          <div id=\"fieldsContainer${embed.id}\"></div>
          <button class=\"add-button\" onclick=\"addField(${embed.id})\" style=\"margin-top: 10px;\">
            <i class=\"fas fa-plus\"></i> Add Field
          </button>
        </div>
      </div>
    `;
    container.appendChild(embedDiv);
    renderFields(embed.id);
  });
}

// Update embed field with debouncing
function updateEmbedField(embedId, field, value) {
  const embed = embeds.find(e => e.id === embedId);
  if (embed) {
    embed[field] = value;
    debouncedUpdatePreview();
    debouncedSaveToStorage();
  }
}

// Update embed color
function updateEmbedColor(embedId, value) {
  const embed = embeds.find(e => e.id === embedId);
  if (embed) {
    embed.color = value;
    document.getElementById(`embedColorHex${embedId}`).value = value;
    updatePreview();
    saveToStorage();
  }
}

// Update embed color from hex input
function updateEmbedColorHex(embedId, value) {
  if (/^#[0-9A-F]{6}$/i.test(value)) {
    const embed = embeds.find(e => e.id === embedId);
    if (embed) {
      embed.color = value;
      document.getElementById(`embedColor${embedId}`).value = value;
      updatePreview();
      saveToStorage();
    }
  }
}

// Add field function
function addField(embedId) {
  const embed = embeds.find(e => e.id === embedId);
  if (!embed) return;

  if (embed.fields.length >= MAX_FIELDS_PER_EMBED) {
    showToast(`Maximum ${MAX_FIELDS_PER_EMBED} fields per embed!`, 'error');
    return;
  }

  const fieldId = Date.now();
  embed.fields.push({
    id: fieldId,
    name: '',
    value: '',
    inline: false
  });
  renderFields(embedId);
  updatePreview();
  saveToStorage();
}

// Remove field function
function removeField(embedId, fieldId) {
  const embed = embeds.find(e => e.id === embedId);
  if (embed) {
    embed.fields = embed.fields.filter(f => f.id !== fieldId);
    renderFields(embedId);
    updatePreview();
    saveToStorage();
    renderEmbeds();
  }
}

// Render fields
function renderFields(embedId) {
  const embed = embeds.find(e => e.id === embedId);
  if (!embed) return;

  const container = document.getElementById(`fieldsContainer${embedId}`);
  if (!container) return;

  container.innerHTML = '';

  embed.fields.forEach((field, index) => {
    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'field-item';
    fieldDiv.innerHTML = `
      <div class=\"field-header\">
        <h4>Field ${index + 1}</h4>
        <button class=\"remove-field\" onclick=\"removeField(${embedId}, ${field.id})\">
          <i class=\"fas fa-times\"></i> Remove
        </button>
      </div>
      <div class=\"form-group\">
        <label>Name</label>
        <input type=\"text\" value=\"${field.name}\" oninput=\"updateFieldName(${embedId}, ${field.id}, this.value)\" placeholder=\"Field name\" maxlength=\"256\">
      </div>
      <div class=\"form-group\">
        <label>Value</label>
        <textarea oninput=\"updateFieldValue(${embedId}, ${field.id}, this.value)\" placeholder=\"Field value\" rows=\"2\" maxlength=\"1024\">${field.value}</textarea>
      </div>
      <div class=\"checkbox-group\">
        <input type=\"checkbox\" id=\"inline-${embedId}-${field.id}\" ${field.inline ? 'checked' : ''} onchange=\"updateFieldInline(${embedId}, ${field.id}, this.checked)\">
        <label for=\"inline-${embedId}-${field.id}\">Inline</label>
      </div>
    `;
    container.appendChild(fieldDiv);
  });
}

// Update field functions with debouncing
function updateFieldName(embedId, fieldId, value) {
  const embed = embeds.find(e => e.id === embedId);
  if (embed) {
    const field = embed.fields.find(f => f.id === fieldId);
    if (field) {
      field.name = value;
      debouncedUpdatePreview();
      debouncedSaveToStorage();
    }
  }
}

function updateFieldValue(embedId, fieldId, value) {
  const embed = embeds.find(e => e.id === embedId);
  if (embed) {
    const field = embed.fields.find(f => f.id === fieldId);
    if (field) {
      field.value = value;
      debouncedUpdatePreview();
      debouncedSaveToStorage();
    }
  }
}

function updateFieldInline(embedId, fieldId, value) {
  const embed = embeds.find(e => e.id === embedId);
  if (embed) {
    const field = embed.fields.find(f => f.id === fieldId);
    if (field) {
      field.inline = value;
      updatePreview();
      saveToStorage();
    }
  }
}

// Update preview
function updatePreview() {
  const preview = document.getElementById('discordPreview');
  if (!preview) return;

  const messageContent = document.getElementById('messageContent')?.value || '';
  const username = document.getElementById('username')?.value || 'Webhook';
  const avatarUrl = document.getElementById('avatarUrl')?.value || '';

  // Check if we have any content
  const hasContent = messageContent || embeds.some(e => 
    e.authorName || e.title || e.description || e.fields.length > 0 ||
    e.thumbnailUrl || e.imageUrl || e.footerText
  );

  if (!hasContent) {
    preview.innerHTML = `
      <div class=\"preview-empty\">
        <i class=\"fas fa-message\"></i>
        <p>Your message preview will appear here</p>
      </div>
    `;
    return;
  }

  let html = '<div class=\"discord-message\">';

  // Avatar
  html += '<div class=\"discord-avatar\">';
  if (avatarUrl) {
    html += `<img src=\"${avatarUrl}\" alt=\"Avatar\" onerror=\"this.style.display='none'; this.parentElement.innerHTML='🤖';\">`;
  } else {
    html += '🤖';
  }
  html += '</div>';

  // Content
  html += '<div class=\"discord-content\">';

  // Header
  html += '<div class=\"discord-header\">';
  html += `<span class=\"discord-username\">${escapeHtml(username)}</span>`;
  html += `<span class=\"discord-timestamp\">${new Date().toLocaleString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })}</span>`;
  html += '</div>';

  // Message text
  if (messageContent) {
    html += `<div class=\"discord-text\">${escapeHtml(messageContent)}</div>`;
  }

  // Embeds
  embeds.forEach(embed => {
    const hasEmbed = embed.authorName || embed.title || embed.description || embed.fields.length > 0 ||
                     embed.thumbnailUrl || embed.imageUrl || embed.footerText;

    if (hasEmbed) {
      html += `<div class=\"discord-embed\" style=\"border-color: ${embed.color}\">`;

      // Thumbnail
      if (embed.thumbnailUrl) {
        html += `<img src=\"${embed.thumbnailUrl}\" class=\"embed-thumbnail\" alt=\"Thumbnail\" onerror=\"this.style.display='none';\">`;
      }

      // Author
      if (embed.authorName) {
        html += '<div class=\"embed-author\">';
        if (embed.authorIcon) {
          html += `<img src=\"${embed.authorIcon}\" class=\"embed-author-icon\" alt=\"Author\" onerror=\"this.style.display='none';\">`;
        }
        if (embed.authorUrl) {
          html += `<a href=\"${embed.authorUrl}\" class=\"embed-author-name\" target=\"_blank\">${escapeHtml(embed.authorName)}</a>`;
        } else {
          html += `<span class=\"embed-author-name\">${escapeHtml(embed.authorName)}</span>`;
        }
        html += '</div>';
      }

      // Title
      if (embed.title) {
        html += '<div class=\"embed-title\">';
        if (embed.url) {
          html += `<a href=\"${embed.url}\" target=\"_blank\">${escapeHtml(embed.title)}</a>`;
        } else {
          html += escapeHtml(embed.title);
        }
        html += '</div>';
      }

      // Description
      if (embed.description) {
        html += `<div class=\"embed-description\">${escapeHtml(embed.description)}</div>`;
      }

      // Fields
      if (embed.fields.length > 0) {
        html += '<div class=\"embed-fields\">';
        embed.fields.forEach(field => {
          if (field.name || field.value) {
            html += `<div class=\"embed-field ${field.inline ? 'inline' : ''}\">`;
            if (field.name) {
              html += `<div class=\"embed-field-name\">${escapeHtml(field.name)}</div>`;
            }
            if (field.value) {
              html += `<div class=\"embed-field-value\">${escapeHtml(field.value)}</div>`;
            }
            html += '</div>';
          }
        });
        html += '</div>';
      }

      // Image
      if (embed.imageUrl) {
        html += `<img src=\"${embed.imageUrl}\" class=\"embed-image\" alt=\"Image\" onerror=\"this.style.display='none';\">`;
      }

      // Footer
      if (embed.footerText || embed.timestamp) {
        html += '<div class=\"embed-footer\">';
        if (embed.footerIcon) {
          html += `<img src=\"${embed.footerIcon}\" class=\"embed-footer-icon\" alt=\"Footer\" onerror=\"this.style.display='none';\">`;
        }
        html += '<span>';
        if (embed.footerText) {
          html += escapeHtml(embed.footerText);
        }
        if (embed.footerText && embed.timestamp) {
          html += ' • ';
        }
        if (embed.timestamp) {
          html += new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        }
        html += '</span>';
        html += '</div>';
      }

      html += '</div>'; // End embed
    }
  });

  html += '</div>'; // End content
  html += '</div>'; // End message

  preview.innerHTML = html;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add event listeners to main inputs with character counters
if (document.getElementById('messageContent')) {
  const mainInputs = [
    { id: 'messageContent', counter: 'messageCounter', max: 2000 },
    { id: 'username', counter: 'usernameCounter', max: 80 }
  ];
  
  mainInputs.forEach(({ id, counter, max }) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', () => {
        updateCharCounter(id, counter, max);
        debouncedUpdatePreview();
        debouncedSaveToStorage();
      });
      // Initialize counter
      updateCharCounter(id, counter, max);
    }
  });

  // Avatar URL listener
  const avatarUrl = document.getElementById('avatarUrl');
  if (avatarUrl) {
    avatarUrl.addEventListener('input', () => {
      debouncedUpdatePreview();
      debouncedSaveToStorage();
    });
  }

  // Webhook URL listener
  const webhookUrl = document.getElementById('webhookUrl');
  if (webhookUrl) {
    webhookUrl.addEventListener('input', () => {
      debouncedSaveToStorage();
    });
  }
}

// Send webhook
async function sendWebhook() {
  const webhookUrl = document.getElementById('webhookUrl')?.value;

  if (!webhookUrl) {
    showToast('Please enter a webhook URL!', 'error');
    return;
  }

  if (!webhookUrl.includes('discord.com/api/webhooks/')) {
    showToast('Invalid webhook URL format!', 'error');
    return;
  }

  const payload = buildWebhookPayload();

  // Send webhook
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      showToast('✅ Webhook sent successfully!', 'success');
    } else {
      const error = await response.text();
      showToast(`Failed to send: ${error}`, 'error');
    }
  } catch (error) {
    showToast(`Error: ${error.message}`, 'error');
  }
}

// Clear all
function clearAll() {
  showModal('Clear All', `
    <p style=\"margin-bottom: 20px;\"><i class=\"fas fa-exclamation-triangle\" style=\"color: #fbbf24;\"></i> Are you sure you want to clear all fields? This action cannot be undone.</p>
    <div style=\"display: flex; gap: 10px;\">
      <button class=\"send-button\" style=\"flex: 1; background: #ef4444;\" onclick=\"confirmClear()\">
        <i class=\"fas fa-trash\"></i> Yes, Clear All
      </button>
      <button class=\"secondary-button\" style=\"flex: 1;\" onclick=\"closeModal()\">
        <i class=\"fas fa-times\"></i> Cancel
      </button>
    </div>
  `);
}

function confirmClear() {
  if (document.getElementById('webhookUrl')) document.getElementById('webhookUrl').value = '';
  if (document.getElementById('messageContent')) document.getElementById('messageContent').value = '';
  if (document.getElementById('username')) document.getElementById('username').value = '';
  if (document.getElementById('avatarUrl')) document.getElementById('avatarUrl').value = '';

  embeds = [];
  embedIdCounter = 0;
  renderEmbeds();
  updatePreview();
  saveToStorage();
  closeModal();
  showToast('All fields cleared!', 'info');
  
  // Reset character counters
  updateCharCounter('messageContent', 'messageCounter', 2000);
  updateCharCounter('username', 'usernameCounter', 80);
}

// Storage functions
function saveToStorage() {
  const data = {
    webhookUrl: document.getElementById('webhookUrl')?.value || '',
    messageContent: document.getElementById('messageContent')?.value || '',
    username: document.getElementById('username')?.value || '',
    avatarUrl: document.getElementById('avatarUrl')?.value || '',
    embeds: embeds,
    embedIdCounter: embedIdCounter
  };
  localStorage.setItem('stylecraft_data', JSON.stringify(data));
}

function loadFromStorage() {
  const stored = localStorage.getItem('stylecraft_data');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (document.getElementById('webhookUrl')) document.getElementById('webhookUrl').value = data.webhookUrl || '';
      if (document.getElementById('messageContent')) document.getElementById('messageContent').value = data.messageContent || '';
      if (document.getElementById('username')) document.getElementById('username').value = data.username || '';
      if (document.getElementById('avatarUrl')) document.getElementById('avatarUrl').value = data.avatarUrl || '';

      embeds = data.embeds || [];
      embedIdCounter = data.embedIdCounter || 0;
      renderEmbeds();
      
      // Update character counters
      updateCharCounter('messageContent', 'messageCounter', 2000);
      updateCharCounter('username', 'usernameCounter', 80);
    } catch (e) {
      console.error('Failed to load from storage:', e);
    }
  }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+Enter or Cmd+Enter to send
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    sendWebhook();
  }
  
  // Ctrl+S or Cmd+S to save (already auto-saves, but show feedback)
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveToStorage();
    showToast('Saved!', 'success');
  }
});

// Initialize
if (document.getElementById('embedsContainer')) {
  loadFromStorage();
  updatePreview();
}
