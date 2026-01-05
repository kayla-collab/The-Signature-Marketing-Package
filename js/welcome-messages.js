// Welcome Messages Admin

// Require admin authentication
auth.requireAuth();
auth.requireAdmin();

// Global state
let globalMessageEditor = null;
let customGreetingEditor = null;
let allClients = [];
let allCustomMessages = [];
let editingCustomId = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadClients();
    await loadGlobalMessage();
    await loadCustomMessages();
    initializeEditors();
    hideLoading();
});

// Initialize rich text editors
function initializeEditors() {
    // Global message editor
    globalMessageEditor = new Quill('#globalMessageEditor', {
        theme: 'snow',
        placeholder: 'Enter your welcome message for all clients...',
        modules: {
            toolbar: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
            ]
        }
    });
    
    // Sync with hidden textarea
    globalMessageEditor.on('text-change', function() {
        document.getElementById('globalMessage').value = globalMessageEditor.root.innerHTML;
        updateGlobalPreview();
    });
    
    // Custom greeting editor
    customGreetingEditor = new Quill('#customGreetingEditor', {
        theme: 'snow',
        placeholder: 'Enter custom welcome message for this client...',
        modules: {
            toolbar: [
                [{ 'header': [2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
            ]
        }
    });
    
    customGreetingEditor.on('text-change', function() {
        document.getElementById('customGreeting').value = customGreetingEditor.root.innerHTML;
    });
}

// Load all clients for dropdown
async function loadClients() {
    try {
        const response = await fetch('tables/users?limit=100');
        const data = await response.json();
        allClients = data.data.filter(u => u.role === 'client');
        
        const select = document.getElementById('customClient');
        select.innerHTML = '<option value="">Choose a client...</option>' +
            allClients.map(c => `<option value="${c.id}">${c.full_name} (${c.email})</option>`).join('');
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Load global welcome message
async function loadGlobalMessage() {
    try {
        const response = await fetch('tables/global_welcome_message?limit=1');
        const data = await response.json();
        const messages = data.data || [];
        
        if (messages.length > 0) {
            const message = messages[0];
            document.getElementById('globalTitle').value = message.title || '';
            document.getElementById('globalActive').checked = message.is_active;
            
            if (globalMessageEditor && message.message) {
                globalMessageEditor.root.innerHTML = message.message;
            }
            
            updateGlobalPreview();
        }
    } catch (error) {
        console.error('Error loading global message:', error);
    }
}

// Update global message preview
function updateGlobalPreview() {
    const title = document.getElementById('globalTitle').value;
    const content = globalMessageEditor.root.innerHTML;
    
    if (title || content) {
        document.getElementById('globalPreview').style.display = 'block';
        document.getElementById('previewTitle').textContent = title || 'Welcome!';
        document.getElementById('previewContent').innerHTML = content || '<p>No content yet...</p>';
    } else {
        document.getElementById('globalPreview').style.display = 'none';
    }
}

// Also update preview when title changes
document.getElementById('globalTitle').addEventListener('input', updateGlobalPreview);

// Save global welcome message
async function saveGlobalMessage() {
    const title = document.getElementById('globalTitle').value;
    const message = globalMessageEditor.root.innerHTML;
    const isActive = document.getElementById('globalActive').checked;
    
    if (!title || !message) {
        alert('Please enter both a title and message');
        return;
    }
    
    showLoading();
    
    try {
        // Check if global message exists
        const response = await fetch('tables/global_welcome_message?limit=1');
        const data = await response.json();
        const existing = data.data || [];
        
        const messageData = {
            title: title,
            message: message,
            is_active: isActive
        };
        
        if (existing.length > 0) {
            // Update existing
            await fetch(`tables/global_welcome_message/${existing[0].id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
        } else {
            // Create new
            await fetch('tables/global_welcome_message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
        }
        
        alert('Global welcome message saved successfully!');
        hideLoading();
    } catch (error) {
        console.error('Error saving global message:', error);
        alert('Error saving message. Please try again.');
        hideLoading();
    }
}

// Load custom client messages
async function loadCustomMessages() {
    try {
        const response = await fetch('tables/client_greetings?limit=100');
        const data = await response.json();
        allCustomMessages = data.data || [];
        
        renderCustomMessages();
    } catch (error) {
        console.error('Error loading custom messages:', error);
    }
}

// Render custom messages table
function renderCustomMessages() {
    const tbody = document.getElementById('customMessagesList');
    
    if (allCustomMessages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #999;">No custom messages yet. Add one above!</td></tr>';
        return;
    }
    
    tbody.innerHTML = allCustomMessages.map(msg => {
        const client = allClients.find(c => c.id === msg.client_id);
        const clientName = client ? client.full_name : 'Unknown Client';
        const preview = msg.greeting_message.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
        
        return `
            <tr>
                <td>${escapeHtml(clientName)}</td>
                <td>${escapeHtml(preview)}</td>
                <td>${msg.is_active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-inactive">Inactive</span>'}</td>
                <td>
                    <button class="btn btn-sm" onclick="editCustomMessage('${msg.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCustomMessage('${msg.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Show add custom message modal
function showAddCustomMessage() {
    editingCustomId = null;
    document.getElementById('customModalTitle').textContent = 'Add Custom Welcome Message';
    document.getElementById('customMessageId').value = '';
    document.getElementById('customClient').value = '';
    document.getElementById('customActive').checked = true;
    
    if (customGreetingEditor) {
        customGreetingEditor.setText('');
    }
    
    document.getElementById('customMessageModal').classList.add('show');
}

// Edit custom message
function editCustomMessage(messageId) {
    const message = allCustomMessages.find(m => m.id === messageId);
    if (!message) return;
    
    editingCustomId = messageId;
    document.getElementById('customModalTitle').textContent = 'Edit Custom Welcome Message';
    document.getElementById('customMessageId').value = message.id;
    document.getElementById('customClient').value = message.client_id;
    document.getElementById('customActive').checked = message.is_active;
    
    if (customGreetingEditor) {
        customGreetingEditor.root.innerHTML = message.greeting_message;
    }
    
    document.getElementById('customMessageModal').classList.add('show');
}

// Close custom message modal
function closeCustomMessageModal() {
    document.getElementById('customMessageModal').classList.remove('show');
    editingCustomId = null;
}

// Save custom message
document.getElementById('customMessageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const clientId = document.getElementById('customClient').value;
    const greeting = customGreetingEditor.root.innerHTML;
    const isActive = document.getElementById('customActive').checked;
    
    if (!clientId || !greeting) {
        alert('Please select a client and enter a message');
        return;
    }
    
    showLoading();
    
    try {
        const messageData = {
            client_id: clientId,
            greeting_message: greeting,
            is_active: isActive
        };
        
        if (editingCustomId) {
            // Update existing
            await fetch(`tables/client_greetings/${editingCustomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
        } else {
            // Create new
            await fetch('tables/client_greetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
        }
        
        alert('Custom message saved successfully!');
        closeCustomMessageModal();
        await loadCustomMessages();
        hideLoading();
    } catch (error) {
        console.error('Error saving custom message:', error);
        alert('Error saving message. Please try again.');
        hideLoading();
    }
});

// Delete custom message
async function deleteCustomMessage(messageId) {
    if (!confirm('Delete this custom welcome message?')) return;
    
    showLoading();
    
    try {
        await fetch(`tables/client_greetings/${messageId}`, {
            method: 'DELETE'
        });
        
        alert('Custom message deleted successfully!');
        await loadCustomMessages();
        hideLoading();
    } catch (error) {
        console.error('Error deleting message:', error);
        alert('Error deleting message. Please try again.');
        hideLoading();
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
}

function logout() {
    auth.logout();
}
