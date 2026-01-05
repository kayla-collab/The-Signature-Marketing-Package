// Module Builder - Module-focused content management

// Require admin authentication
auth.requireAuth();
auth.requireAdmin();

// Global state
let allModules = [];
let currentModule = null;
let currentModuleContent = [];
let allFiles = [];
let editingContentId = null;
let contentBodyEditor = null; // Quill editor instance

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadModules();
    await loadUploadedFiles();
    initializeRichTextEditor();
    
    // Check for module parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('module');
    if (moduleId && allModules.find(m => m.id === moduleId)) {
        document.getElementById('moduleSelect').value = moduleId;
        await loadModuleContent();
    }
    
    hideLoading();
});

// Initialize Quill rich text editor
function initializeRichTextEditor() {
    contentBodyEditor = new Quill('#contentBodyEditor', {
        theme: 'snow',
        placeholder: 'Add explanation or context for this content...',
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
    
    // Sync editor content with hidden textarea
    contentBodyEditor.on('text-change', function() {
        document.getElementById('contentBody').value = contentBodyEditor.root.innerHTML;
    });
}

// Load all modules
async function loadModules() {
    try {
        const response = await fetch('tables/modules?limit=100&sort=order_index');
        const data = await response.json();
        // Ensure modules are sorted by order_index (ascending)
        allModules = (data.data || []).sort((a, b) => {
            const orderA = parseInt(a.order_index) || 999;
            const orderB = parseInt(b.order_index) || 999;
            return orderA - orderB;
        });
        
        console.log('[ModuleBuilder] Loaded modules in order:', allModules.map(m => `${m.title} (order: ${m.order_index})`));
        
        const select = document.getElementById('moduleSelect');
        select.innerHTML = '<option value="">Select a module to edit...</option>' + 
            allModules.map(m => `<option value="${m.id}">${escapeHtml(m.title || m.module_name || 'Unnamed Module')} (Order: ${m.order_index})</option>`).join('');
    } catch (error) {
        console.error('Error loading modules:', error);
        alert('Error loading modules');
    }
}

// Load uploaded files for embedded file selector
async function loadUploadedFiles() {
    try {
        const response = await fetch('tables/uploaded_files?limit=100');
        const data = await response.json();
        allFiles = data.data || [];
        
        const select = document.getElementById('embeddedFileSelect');
        select.innerHTML = '<option value="">Choose a file...</option>' +
            allFiles.map(f => `<option value="${f.id}">${f.file_name} (${f.file_type.toUpperCase()})</option>`).join('');
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

// Load module content
async function loadModuleContent() {
    const moduleId = document.getElementById('moduleSelect').value;
    
    if (!moduleId) {
        document.getElementById('moduleContent').style.display = 'none';
        return;
    }

    showLoading();
    
    try {
        // Load module info
        const moduleResponse = await fetch(`tables/modules/${moduleId}`);
        currentModule = await moduleResponse.json();
        
        // Load module content
        const contentResponse = await fetch(`tables/content_items?limit=100`);
        const allContent = await contentResponse.json();
        
        // Filter content for this module (global or module-specific)
        currentModuleContent = allContent.data.filter(c => 
            c.module_id === moduleId && (c.client_id === '' || !c.client_id)
        ).sort((a, b) => a.order_index - b.order_index);
        
        // Display module
        displayModule();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading module:', error);
        alert('Error loading module content');
        hideLoading();
    }
}

// Display module and its content
function displayModule() {
    document.getElementById('moduleContent').style.display = 'block';
    document.getElementById('moduleName').textContent = currentModule.title || currentModule.module_name;
    document.getElementById('moduleDescription').textContent = currentModule.description || currentModule.module_description || 'No description';
    
    // Calculate stats
    const stats = {
        total: currentModuleContent.length,
        video: currentModuleContent.filter(c => c.content_type === 'video').length,
        files: currentModuleContent.filter(c => c.content_type === 'download' || c.content_type === 'embedded_file').length,
        text: currentModuleContent.filter(c => c.content_type === 'text').length
    };
    
    document.getElementById('contentCount').textContent = stats.total;
    document.getElementById('videoCount').textContent = stats.video;
    document.getElementById('fileCount').textContent = stats.files;
    document.getElementById('textCount').textContent = stats.text;
    
    // Display content list
    displayContentList();
}

// Display content list
function displayContentList() {
    const container = document.getElementById('contentList');
    
    if (currentModuleContent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No content yet</h3>
                <p>Add your first content item to this module</p>
                <button class="btn btn-primary" onclick="addContentToModule()" style="margin-top: 15px;">Add Content</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = currentModuleContent.map(item => `
        <div class="content-item-card">
            <div class="content-item-header">
                <div>
                    <span class="content-item-title">${escapeHtml(item.title)}</span>
                    <span class="content-type-badge">${item.content_type}</span>
                    <span class="order-badge">#${item.order_index}</span>
                </div>
                <div class="content-item-actions">
                    <button class="btn btn-sm" onclick="editContent('${item.id}')">Edit</button>
                    <button class="btn btn-sm btn-secondary" onclick="moveUp('${item.id}')">↑</button>
                    <button class="btn btn-sm btn-secondary" onclick="moveDown('${item.id}')">↓</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteContent('${item.id}')">Delete</button>
                </div>
            </div>
            <div class="content-item-body">
                ${item.content_body ? escapeHtml(item.content_body).substring(0, 150) + '...' : '<em>No description</em>'}
            </div>
            ${item.content_url ? `<small style="color: #999;">URL: ${escapeHtml(item.content_url)}</small>` : ''}
        </div>
    `).join('');
}

// Create new module
function createNewModule() {
    document.getElementById('moduleModalTitle').textContent = 'Create New Module';
    document.getElementById('modalModuleName').value = '';
    document.getElementById('modalModuleDescription').value = '';
    document.getElementById('modalModuleOrder').value = allModules.length + 1;
    document.getElementById('moduleModal').classList.add('show');
}

// Edit module info
function editModuleInfo() {
    if (!currentModule) return;
    
    document.getElementById('moduleModalTitle').textContent = 'Edit Module Information';
    document.getElementById('modalModuleName').value = currentModule.title || currentModule.module_name;
    document.getElementById('modalModuleDescription').value = currentModule.description || currentModule.module_description || '';
    document.getElementById('modalModuleOrder').value = currentModule.order_index || 1;
    document.getElementById('moduleModal').classList.add('show');
}

// Close module modal
function closeModuleModal() {
    document.getElementById('moduleModal').classList.remove('show');
}

// Save module (create or update)
document.getElementById('moduleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('modalModuleName').value.trim();
    const description = document.getElementById('modalModuleDescription').value.trim();
    const orderIndex = parseInt(document.getElementById('modalModuleOrder').value);
    
    // Validation
    if (!title) {
        alert('Please enter a module name');
        return;
    }
    
    if (isNaN(orderIndex) || orderIndex < 1) {
        alert('Please enter a valid display order (1 or higher)');
        return;
    }
    
    const moduleData = {
        title: title,
        description: description || '',
        order_index: orderIndex,
        icon: ''
    };
    
    console.log('Saving module with data:', moduleData);
    showLoading();
    
    try {
        let response;
        if (currentModule) {
            // Update existing
            console.log('Updating module:', currentModule.id);
            response = await fetch(`tables/modules/${currentModule.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(moduleData)
            });
        } else {
            // Create new
            console.log('Creating new module');
            response = await fetch('tables/modules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(moduleData)
            });
        }
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error response:', errorText);
            throw new Error(`Server error (${response.status}): ${errorText}`);
        }
        
        const savedModule = await response.json();
        console.log('Module saved successfully:', savedModule);
        
        closeModuleModal();
        await loadModules();
        
        if (currentModule) {
            // Refresh current module
            document.getElementById('moduleSelect').value = currentModule.id;
            await loadModuleContent();
        }
        
        alert('Module saved successfully!');
        hideLoading();
    } catch (error) {
        console.error('Error saving module:', error);
        alert('Error saving module: ' + error.message + '\n\nCheck the browser console (F12) for details.');
        hideLoading();
    }
});

// Duplicate module
async function duplicateModule() {
    if (!currentModule) return;
    
    const newName = prompt('Enter name for the duplicated module:', (currentModule.title || currentModule.module_name) + ' (Copy)');
    if (!newName) return;
    
    showLoading();
    
    try {
        // Create new module
        const newModuleData = {
            title: newName,
            description: currentModule.description || currentModule.module_description || '',
            order_index: allModules.length + 1,
            icon: ''
        };
        
        const moduleResponse = await fetch('tables/modules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newModuleData)
        });
        
        const newModule = await moduleResponse.json();
        
        // Duplicate all content
        for (const item of currentModuleContent) {
            const newContent = {
                module_id: newModule.id,
                client_id: '',
                title: item.title,
                content_type: item.content_type,
                content_body: item.content_body,
                content_url: item.content_url,
                order_index: item.order_index
            };
            
            await fetch('tables/content_items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContent)
            });
        }
        
        alert('Module duplicated successfully');
        await loadModules();
        document.getElementById('moduleSelect').value = newModule.id;
        await loadModuleContent();
        hideLoading();
    } catch (error) {
        console.error('Error duplicating module:', error);
        alert('Error duplicating module');
        hideLoading();
    }
}

// Delete module
async function deleteModule() {
    if (!currentModule) return;
    
    if (!confirm(`Delete "${currentModule.title || currentModule.module_name}" and all its content?`)) return;
    
    showLoading();
    
    try {
        // Delete all content first
        for (const item of currentModuleContent) {
            await fetch(`tables/content_items/${item.id}`, { method: 'DELETE' });
        }
        
        // Delete module
        await fetch(`tables/modules/${currentModule.id}`, { method: 'DELETE' });
        
        alert('Module deleted successfully');
        await loadModules();
        document.getElementById('moduleContent').style.display = 'none';
        document.getElementById('moduleSelect').value = '';
        currentModule = null;
        hideLoading();
    } catch (error) {
        console.error('Error deleting module:', error);
        alert('Error deleting module');
        hideLoading();
    }
}

// Add content to current module
function addContentToModule() {
    if (!currentModule) return;
    
    editingContentId = null;
    document.getElementById('contentModalTitle').textContent = 'Add Content to ' + (currentModule.title || currentModule.module_name);
    document.getElementById('contentId').value = '';
    document.getElementById('contentModuleId').value = currentModule.id;
    document.getElementById('contentTitle').value = '';
    document.getElementById('contentType').value = '';
    document.getElementById('contentBody').value = '';
    document.getElementById('contentUrl').value = '';
    document.getElementById('contentOrder').value = currentModuleContent.length + 1;
    
    // Clear rich text editor
    if (contentBodyEditor) {
        contentBodyEditor.setText('');
    }
    
    updateContentFields();
    document.getElementById('contentModal').classList.add('show');
}

// Edit content
function editContent(contentId) {
    const content = currentModuleContent.find(c => c.id === contentId);
    if (!content) return;
    
    editingContentId = contentId;
    document.getElementById('contentModalTitle').textContent = 'Edit Content';
    document.getElementById('contentId').value = content.id;
    document.getElementById('contentModuleId').value = content.module_id;
    document.getElementById('contentTitle').value = content.title;
    document.getElementById('contentType').value = content.content_type;
    document.getElementById('contentBody').value = content.content_body || '';
    document.getElementById('contentUrl').value = content.content_url || '';
    document.getElementById('contentOrder').value = content.order_index;
    
    // Load content into rich text editor
    if (contentBodyEditor && content.content_body) {
        contentBodyEditor.root.innerHTML = content.content_body;
    }
    
    // If embedded file, select the file
    if (content.content_type === 'embedded_file' && content.content_url) {
        const fileId = content.content_url.split('fileId=')[1];
        if (fileId) {
            document.getElementById('embeddedFileSelect').value = fileId;
        }
    }
    
    updateContentFields();
    document.getElementById('contentModal').classList.add('show');
}

// Close content modal
function closeContentModal() {
    document.getElementById('contentModal').classList.remove('show');
    editingContentId = null;
    // Clear editor
    if (contentBodyEditor) {
        contentBodyEditor.setText('');
    }
}

// Update content form fields based on type
function updateContentFields() {
    const type = document.getElementById('contentType').value;
    const urlGroup = document.getElementById('contentUrlGroup');
    const urlLabel = document.getElementById('contentUrlLabel');
    const urlInput = document.getElementById('contentUrl');
    const urlHint = document.getElementById('contentUrlHint');
    const fileSelector = document.getElementById('embeddedFileSelector');
    
    fileSelector.style.display = 'none';
    
    switch (type) {
        case 'text':
            urlGroup.style.display = 'none';
            urlInput.required = false;
            break;
        case 'video':
            urlGroup.style.display = 'block';
            urlLabel.textContent = 'Video Embed URL *';
            urlInput.placeholder = 'https://www.youtube.com/embed/VIDEO_ID';
            urlInput.required = true;
            urlHint.textContent = 'YouTube embed URL or Zoom recording URL';
            break;
        case 'download':
            urlGroup.style.display = 'block';
            urlLabel.textContent = 'Download File URL *';
            urlInput.placeholder = 'https://example.com/file.pdf';
            urlInput.required = true;
            urlHint.textContent = 'Direct URL to downloadable file';
            break;
        case 'embedded_file':
            urlGroup.style.display = 'none';
            urlInput.required = false;
            fileSelector.style.display = 'block';
            document.getElementById('embeddedFileSelect').required = true;
            break;
        case 'link':
            urlGroup.style.display = 'block';
            urlLabel.textContent = 'External Link URL *';
            urlInput.placeholder = 'https://example.com';
            urlInput.required = true;
            urlHint.textContent = 'URL to external resource';
            break;
    }
}

// Save content
document.getElementById('contentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let contentUrl = document.getElementById('contentUrl').value || '';
    
    // Handle embedded file
    if (document.getElementById('contentType').value === 'embedded_file') {
        const fileId = document.getElementById('embeddedFileSelect').value;
        if (!fileId) {
            alert('Please select a file');
            return;
        }
        contentUrl = `file-viewer.html?fileId=${fileId}`;
    }
    
    const contentData = {
        module_id: document.getElementById('contentModuleId').value,
        client_id: '',
        title: document.getElementById('contentTitle').value,
        content_type: document.getElementById('contentType').value,
        content_body: document.getElementById('contentBody').value,
        content_url: contentUrl,
        order_index: parseInt(document.getElementById('contentOrder').value)
    };
    
    showLoading();
    
    try {
        let response;
        if (editingContentId) {
            response = await fetch(`tables/content_items/${editingContentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contentData)
            });
        } else {
            response = await fetch('tables/content_items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contentData)
            });
        }
        
        if (!response.ok) throw new Error('Failed to save content');
        
        closeContentModal();
        await loadModuleContent();
        alert('Content saved successfully');
        hideLoading();
    } catch (error) {
        console.error('Error saving content:', error);
        alert('Error saving content');
        hideLoading();
    }
});

// Delete content
async function deleteContent(contentId) {
    const content = currentModuleContent.find(c => c.id === contentId);
    if (!content) return;
    
    if (!confirm(`Delete "${content.title}"?`)) return;
    
    showLoading();
    
    try {
        await fetch(`tables/content_items/${contentId}`, { method: 'DELETE' });
        await loadModuleContent();
        alert('Content deleted successfully');
        hideLoading();
    } catch (error) {
        console.error('Error deleting content:', error);
        alert('Error deleting content');
        hideLoading();
    }
}

// Move content up
async function moveUp(contentId) {
    const index = currentModuleContent.findIndex(c => c.id === contentId);
    if (index <= 0) return;
    
    showLoading();
    
    try {
        // Swap order with previous item
        const current = currentModuleContent[index];
        const previous = currentModuleContent[index - 1];
        
        await fetch(`tables/content_items/${current.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: previous.order_index })
        });
        
        await fetch(`tables/content_items/${previous.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: current.order_index })
        });
        
        await loadModuleContent();
        hideLoading();
    } catch (error) {
        console.error('Error moving content:', error);
        alert('Error reordering content');
        hideLoading();
    }
}

// Move content down
async function moveDown(contentId) {
    const index = currentModuleContent.findIndex(c => c.id === contentId);
    if (index < 0 || index >= currentModuleContent.length - 1) return;
    
    showLoading();
    
    try {
        // Swap order with next item
        const current = currentModuleContent[index];
        const next = currentModuleContent[index + 1];
        
        await fetch(`tables/content_items/${current.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: next.order_index })
        });
        
        await fetch(`tables/content_items/${next.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: current.order_index })
        });
        
        await loadModuleContent();
        hideLoading();
    } catch (error) {
        console.error('Error moving content:', error);
        alert('Error reordering content');
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
