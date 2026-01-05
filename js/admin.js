// Admin dashboard functionality

// Global state
let allClients = [];
let allModules = [];
let allContent = [];
let editingClientId = null;
let editingContentId = null;
let editingModuleId = null;
let duplicatingModuleId = null;

// Initialize admin dashboard
async function initAdmin() {
    // Require admin authentication first
    const isAuthed = await auth.requireAuth();
    if (!isAuthed) return;
    
    const isAdmin = await auth.requireAdmin();
    if (!isAdmin) return;
    
    try {
        await loadClients();
        await loadModules();
        await loadContent();
        await loadUploadedFiles();
        
        setupAdminNavigation();
        populateModuleDropdowns();
        populateClientDropdowns();
        
        // Check for hash navigation
        if (window.location.hash) {
            handleAdminHashNavigation();
        }
        
        // Hide loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
            }, 500);
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
        alert('Error loading admin panel. Please refresh the page.');
    }
}

// Load uploaded files for embedded file selector
async function loadUploadedFiles() {
    try {
        const response = await fetch('tables/uploaded_files?limit=100');
        const data = await response.json();
        const files = data.data;
        
        const fileSelect = document.getElementById('embeddedFileSelect');
        if (fileSelect) {
            const options = files.map(f => 
                `<option value="${f.id}" data-type="${f.file_type}">${f.file_name} (${f.file_type.toUpperCase()})</option>`
            ).join('');
            
            fileSelect.innerHTML = '<option value="">Choose a file...</option>' + options;
        }
    } catch (error) {
        console.error('Error loading uploaded files:', error);
    }
}

// Load all clients
async function loadClients() {
    try {
        const response = await fetch('tables/users?limit=100');
        const data = await response.json();
        
        // Filter out admin users, only show clients
        allClients = data.data.filter(u => u.role === 'client');
        
        renderClientsTable();
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Render clients table
function renderClientsTable() {
    const tbody = document.getElementById('clientsTableBody');
    
    if (allClients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666; padding: 30px;">No clients yet. Add your first client to get started!</td></tr>';
        return;
    }
    
    tbody.innerHTML = allClients.map(client => `
        <tr>
            <td>${client.full_name}</td>
            <td>${client.email}</td>
            <td>
                <span class="status-badge ${client.is_active ? 'active' : 'inactive'}">
                    ${client.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${client.access_expires ? new Date(client.access_expires).toLocaleDateString() : 'Never'}</td>
            <td>
                <div class="action-buttons">
                    <button onclick="editClient('${client.id}')" class="btn-icon" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="toggleClientStatus('${client.id}', ${!client.is_active})" 
                            class="btn-icon" title="${client.is_active ? 'Deactivate' : 'Activate'}">
                        <i class="fas fa-${client.is_active ? 'ban' : 'check'}"></i>
                    </button>
                    <button onclick="deleteClient('${client.id}')" class="btn-icon" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load all modules
async function loadModules() {
    try {
        const response = await fetch('tables/modules?sort=order_index&limit=100');
        const data = await response.json();
        // Ensure modules are sorted by order_index (ascending) after fetch
        allModules = (data.data || []).sort((a, b) => {
            const orderA = parseInt(a.order_index) || 999;
            const orderB = parseInt(b.order_index) || 999;
            return orderA - orderB;
        });
        console.log('[Admin] Loaded modules in order:', allModules.map(m => `${m.title} (order: ${m.order_index})`));
        renderModulesTable();
    } catch (error) {
        console.error('Error loading modules:', error);
    }
}

// Load all content
async function loadContent() {
    try {
        const response = await fetch('tables/content_items?sort=order_index&limit=1000');
        const data = await response.json();
        // Ensure content is sorted by order_index (ascending) after fetch
        allContent = (data.data || []).sort((a, b) => {
            const orderA = parseInt(a.order_index) || 999;
            const orderB = parseInt(b.order_index) || 999;
            return orderA - orderB;
        });
        console.log('[Admin] Loaded content items:', allContent.length);
        renderContentTable();
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Render modules table
function renderModulesTable() {
    const tbody = document.getElementById('modulesTableBody');
    
    if (!tbody) return; // Not on modules page
    
    if (allModules.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666; padding: 30px;">No modules yet. Create your first module template!</td></tr>';
        return;
    }
    
    tbody.innerHTML = allModules.map(module => {
        const contentCount = allContent.filter(c => c.module_id === module.id && !c.client_id).length;
        
        return `
            <tr>
                <td><strong>${module.title}</strong></td>
                <td>${module.description || '<span style="color: #999;">No description</span>'}</td>
                <td>${contentCount} item${contentCount !== 1 ? 's' : ''}</td>
                <td>${module.order_index}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editModule('${module.id}')" class="btn-icon" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="openDuplicateModuleModal('${module.id}')" class="btn-icon" title="Duplicate with Content">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button onclick="deleteModule('${module.id}')" class="btn-icon" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Render content table
function renderContentTable(filteredContent = null) {
    const tbody = document.getElementById('contentTableBody');
    const items = filteredContent || allContent;
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666; padding: 30px;">No content items yet. Add content to get started!</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map(item => {
        const module = allModules.find(m => m.id === item.module_id);
        const client = allClients.find(c => c.id === item.client_id);
        
        return `
            <tr>
                <td>${module ? module.title : 'Unknown'}</td>
                <td>${item.title}</td>
                <td><span style="text-transform: capitalize;">${item.content_type}</span></td>
                <td>${client ? client.full_name : '<span style="color: #666;">All Clients</span>'}</td>
                <td>
                    <div class="action-buttons">
                        <button onclick="editContent('${item.id}')" class="btn-icon" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteContent('${item.id}')" class="btn-icon" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Populate module dropdowns
function populateModuleDropdowns() {
    const moduleSelect = document.getElementById('contentModule');
    const moduleFilter = document.getElementById('moduleFilter');
    
    const options = allModules.map(m => 
        `<option value="${m.id}">${m.title}</option>`
    ).join('');
    
    moduleSelect.innerHTML = '<option value="">Select a module...</option>' + options;
    moduleFilter.innerHTML = '<option value="">All Modules</option>' + options;
}

// Populate client dropdowns
function populateClientDropdowns() {
    const clientSelect = document.getElementById('contentClient');
    const previewSelect = document.getElementById('previewClientSelect');
    
    const options = allClients
        .filter(c => c.is_active)
        .map(c => `<option value="${c.id}">${c.full_name}</option>`)
        .join('');
    
    clientSelect.innerHTML = '<option value="">Global (All Clients)</option>' + options;
    previewSelect.innerHTML = '<option value="">Choose a client...</option>' + options;
}

// Filter content by module
function filterContentByModule() {
    const moduleId = document.getElementById('moduleFilter').value;
    
    if (!moduleId) {
        renderContentTable();
    } else {
        const filtered = allContent.filter(item => item.module_id === moduleId);
        renderContentTable(filtered);
    }
}

// Client Modal Functions
function openAddClientModal() {
    editingClientId = null;
    document.getElementById('clientModalTitle').textContent = 'Add New Client';
    document.getElementById('clientForm').reset();
    document.getElementById('clientId').value = '';
    document.getElementById('clientIsActive').checked = true;
    document.getElementById('clientModal').classList.add('show');
}

function editClient(clientId) {
    editingClientId = clientId;
    const client = allClients.find(c => c.id === clientId);
    
    if (!client) return;
    
    document.getElementById('clientModalTitle').textContent = 'Edit Client';
    document.getElementById('clientId').value = client.id;
    document.getElementById('clientFullName').value = client.full_name;
    document.getElementById('clientEmail').value = client.email;
    document.getElementById('clientPassword').value = client.password_hash;
    document.getElementById('clientPassword').placeholder = 'Leave unchanged or enter new password';
    document.getElementById('clientIsActive').checked = client.is_active;
    
    if (client.access_expires) {
        const date = new Date(client.access_expires);
        document.getElementById('clientAccessExpires').value = date.toISOString().split('T')[0];
    }
    
    document.getElementById('clientModal').classList.add('show');
}

function closeClientModal() {
    document.getElementById('clientModal').classList.remove('show');
    editingClientId = null;
}

// Handle client form submission
document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const clientData = {
        full_name: document.getElementById('clientFullName').value,
        email: document.getElementById('clientEmail').value,
        password_hash: document.getElementById('clientPassword').value,
        role: 'client',
        is_active: document.getElementById('clientIsActive').checked,
        access_expires: document.getElementById('clientAccessExpires').value || null
    };
    
    try {
        if (editingClientId) {
            // Update existing client
            await fetch(`tables/users/${editingClientId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(clientData)
            });
        } else {
            // Create new client
            await fetch('tables/users', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(clientData)
            });
        }
        
        closeClientModal();
        await loadClients();
        populateClientDropdowns();
        
        alert(editingClientId ? 'Client updated successfully!' : 'Client added successfully!');
    } catch (error) {
        console.error('Error saving client:', error);
        alert('Error saving client. Please try again.');
    }
});

// Toggle client status
async function toggleClientStatus(clientId, newStatus) {
    try {
        await fetch(`tables/users/${clientId}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ is_active: newStatus })
        });
        
        await loadClients();
        alert(`Client ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
        console.error('Error updating client status:', error);
        alert('Error updating client status.');
    }
}

// Delete client
async function deleteClient(clientId) {
    if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
        return;
    }
    
    try {
        await fetch(`tables/users/${clientId}`, {
            method: 'DELETE'
        });
        
        await loadClients();
        populateClientDropdowns();
        alert('Client deleted successfully!');
    } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client.');
    }
}

// Content Modal Functions
function openAddContentModal() {
    editingContentId = null;
    document.getElementById('contentModalTitle').textContent = 'Add Content Item';
    document.getElementById('contentForm').reset();
    document.getElementById('contentId').value = '';
    document.getElementById('contentOrder').value = allContent.length + 1;
    updateContentFields();
    document.getElementById('contentModal').classList.add('show');
}

function editContent(contentId) {
    editingContentId = contentId;
    const content = allContent.find(c => c.id === contentId);
    
    if (!content) return;
    
    document.getElementById('contentModalTitle').textContent = 'Edit Content Item';
    document.getElementById('contentId').value = content.id;
    document.getElementById('contentModule').value = content.module_id;
    document.getElementById('contentClient').value = content.client_id || '';
    document.getElementById('contentTitle').value = content.title;
    document.getElementById('contentType').value = content.content_type;
    document.getElementById('contentBody').value = content.content_body || '';
    document.getElementById('contentUrl').value = content.content_url || '';
    document.getElementById('contentOrder').value = content.order_index;
    
    updateContentFields();
    document.getElementById('contentModal').classList.add('show');
}

function closeContentModal() {
    document.getElementById('contentModal').classList.remove('show');
    editingContentId = null;
}

// Update content fields based on type
function updateContentFields() {
    const type = document.getElementById('contentType').value;
    const urlGroup = document.getElementById('contentUrlGroup');
    const urlLabel = document.getElementById('contentUrlLabel');
    const urlInput = document.getElementById('contentUrl');
    const urlHint = document.getElementById('contentUrlHint');
    const fileSelector = document.getElementById('embeddedFileSelector');
    
    // Hide file selector by default
    if (fileSelector) fileSelector.style.display = 'none';
    
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
            urlHint.textContent = 'For YouTube: Use embed URL format. For Zoom: Use the recording URL.';
            break;
            
        case 'download':
            urlGroup.style.display = 'block';
            urlLabel.textContent = 'Download File URL *';
            urlInput.placeholder = 'https://example.com/file.pdf';
            urlInput.required = true;
            urlHint.textContent = 'Direct URL to the downloadable file (PDF, DOCX, ZIP, etc.)';
            break;
            
        case 'embedded_file':
            urlGroup.style.display = 'none';
            urlInput.required = false;
            if (fileSelector) {
                fileSelector.style.display = 'block';
                document.getElementById('embeddedFileSelect').required = true;
            }
            break;
            
        case 'link':
            urlGroup.style.display = 'block';
            urlLabel.textContent = 'External Link URL *';
            urlInput.placeholder = 'https://example.com';
            urlInput.required = true;
            urlHint.textContent = 'URL to external resource or webpage';
            break;
    }
}

// Handle content form submission
document.getElementById('contentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let contentUrl = document.getElementById('contentUrl').value || '';
    
    // If embedded file type, get the file ID
    if (document.getElementById('contentType').value === 'embedded_file') {
        const fileId = document.getElementById('embeddedFileSelect').value;
        if (!fileId) {
            alert('Please select a file to embed.');
            return;
        }
        // Store file viewer URL in content_url
        contentUrl = `file-viewer.html?fileId=${fileId}`;
    }
    
    const contentData = {
        module_id: document.getElementById('contentModule').value,
        client_id: document.getElementById('contentClient').value || '',
        title: document.getElementById('contentTitle').value,
        content_type: document.getElementById('contentType').value,
        content_body: document.getElementById('contentBody').value,
        content_url: contentUrl,
        order_index: parseInt(document.getElementById('contentOrder').value)
    };
    
    try {
        if (editingContentId) {
            // Update existing content
            await fetch(`tables/content_items/${editingContentId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(contentData)
            });
        } else {
            // Create new content
            await fetch('tables/content_items', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(contentData)
            });
        }
        
        closeContentModal();
        await loadContent();
        
        alert(editingContentId ? 'Content updated successfully!' : 'Content added successfully!');
    } catch (error) {
        console.error('Error saving content:', error);
        alert('Error saving content. Please try again.');
    }
});

// Delete content
async function deleteContent(contentId) {
    if (!confirm('Are you sure you want to delete this content item?')) {
        return;
    }
    
    try {
        await fetch(`tables/content_items/${contentId}`, {
            method: 'DELETE'
        });
        
        await loadContent();
        alert('Content deleted successfully!');
    } catch (error) {
        console.error('Error deleting content:', error);
        alert('Error deleting content.');
    }
}

// Preview as client
function previewAsClient() {
    const clientId = document.getElementById('previewClientSelect').value;
    
    if (!clientId) {
        alert('Please select a client to preview.');
        return;
    }
    
    const client = allClients.find(c => c.id === clientId);
    
    if (!client) {
        alert('Client not found.');
        return;
    }
    
    // Create temporary session for preview
    const previewSession = {
        userId: client.id,
        email: client.email,
        fullName: client.full_name,
        role: 'client',
        timestamp: Date.now()
    };
    
    // Store in sessionStorage (temporary)
    sessionStorage.setItem('preview_session', JSON.stringify(previewSession));
    
    // Open in new tab
    window.open('dashboard.html?preview=true', '_blank');
}

// Setup admin navigation
function setupAdminNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Get hash and show appropriate section
            const hash = link.getAttribute('href').substring(1);
            showAdminSection(hash);
        });
    });
}

// Show admin section
function showAdminSection(section) {
    document.querySelectorAll('.content-view').forEach(view => {
        view.classList.add('hidden');
    });
    
    document.getElementById(`${section}-section`).classList.remove('hidden');
    window.location.hash = section;
}

// Handle hash navigation
function handleAdminHashNavigation() {
    const hash = window.location.hash.substring(1);
    
    if (hash) {
        const navLink = document.querySelector(`.nav-link[href="#${hash}"]`);
        if (navLink) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            navLink.classList.add('active');
            showAdminSection(hash);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAdmin);

// Handle browser back/forward
window.addEventListener('hashchange', handleAdminHashNavigation);

// ===== MODULE MANAGEMENT FUNCTIONS =====

// Open add module modal
function openAddModuleModal() {
    editingModuleId = null;
    document.getElementById('moduleModalTitle').textContent = 'Create New Module';
    document.getElementById('moduleForm').reset();
    document.getElementById('moduleId').value = '';
    document.getElementById('moduleOrder').value = allModules.length + 1;
    document.getElementById('moduleModal').classList.add('show');
}

// Edit module
function editModule(moduleId) {
    editingModuleId = moduleId;
    const module = allModules.find(m => m.id === moduleId);
    
    if (!module) return;
    
    document.getElementById('moduleModalTitle').textContent = 'Edit Module';
    document.getElementById('moduleId').value = module.id;
    document.getElementById('moduleName').value = module.title;
    document.getElementById('moduleDescription').value = module.description || '';
    document.getElementById('moduleOrder').value = module.order_index;
    
    document.getElementById('moduleModal').classList.add('show');
}

// Close module modal
function closeModuleModal() {
    document.getElementById('moduleModal').classList.remove('show');
    editingModuleId = null;
}

// Handle module form submission
document.addEventListener('DOMContentLoaded', () => {
    const moduleForm = document.getElementById('moduleForm');
    if (moduleForm) {
        moduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const moduleData = {
                title: document.getElementById('moduleName').value,
                description: document.getElementById('moduleDescription').value,
                order_index: parseInt(document.getElementById('moduleOrder').value),
                icon: ''
            };
            
            try {
                if (editingModuleId) {
                    // Update existing module
                    await fetch(`tables/modules/${editingModuleId}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(moduleData)
                    });
                } else {
                    // Create new module
                    await fetch('tables/modules', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(moduleData)
                    });
                }
                
                closeModuleModal();
                await loadModules();
                populateModuleDropdowns();
                
                alert(editingModuleId ? 'Module updated successfully!' : 'Module created successfully!');
            } catch (error) {
                console.error('Error saving module:', error);
                alert('Error saving module. Please try again.');
            }
        });
    }
});

// Delete module
async function deleteModule(moduleId) {
    const module = allModules.find(m => m.id === moduleId);
    const contentCount = allContent.filter(c => c.module_id === moduleId).length;
    
    if (!confirm(`Are you sure you want to delete "${module.title}"?\n\nThis will also delete ${contentCount} content item(s) associated with this module.\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        // Delete all content items for this module
        const moduleContent = allContent.filter(c => c.module_id === moduleId);
        for (const item of moduleContent) {
            await fetch(`tables/content_items/${item.id}`, {
                method: 'DELETE'
            });
        }
        
        // Delete the module
        await fetch(`tables/modules/${moduleId}`, {
            method: 'DELETE'
        });
        
        await loadModules();
        await loadContent();
        populateModuleDropdowns();
        
        alert('Module and associated content deleted successfully!');
    } catch (error) {
        console.error('Error deleting module:', error);
        alert('Error deleting module. Please try again.');
    }
}

// Open duplicate module modal
function openDuplicateModuleModal(moduleId) {
    duplicatingModuleId = moduleId;
    const module = allModules.find(m => m.id === moduleId);
    
    if (!module) return;
    
    document.getElementById('duplicateModuleName').textContent = module.title;
    document.getElementById('duplicateNewName').value = `${module.title} (Copy)`;
    document.getElementById('duplicateNewDescription').value = module.description || '';
    
    document.getElementById('duplicateModuleModal').classList.add('show');
}

// Close duplicate module modal
function closeDuplicateModuleModal() {
    document.getElementById('duplicateModuleModal').classList.remove('show');
    duplicatingModuleId = null;
}

// Execute duplicate
async function executeDuplicate() {
    if (!duplicatingModuleId) return;
    
    const originalModule = allModules.find(m => m.id === duplicatingModuleId);
    const newName = document.getElementById('duplicateNewName').value.trim();
    const newDescription = document.getElementById('duplicateNewDescription').value.trim();
    
    if (!newName || !newDescription) {
        alert('Please fill in both name and description.');
        return;
    }
    
    try {
        // Create new module
        const newModuleData = {
            title: newName,
            description: newDescription,
            order_index: allModules.length + 1,
            icon: ''
        };
        
        const moduleResponse = await fetch('tables/modules', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newModuleData)
        });
        
        const newModule = await moduleResponse.json();
        
        // Get all content items from original module (global only)
        const originalContent = allContent.filter(c => 
            c.module_id === duplicatingModuleId && !c.client_id
        );
        
        // Duplicate each content item
        for (const item of originalContent) {
            const newContentData = {
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newContentData)
            });
        }
        
        closeDuplicateModuleModal();
        await loadModules();
        await loadContent();
        populateModuleDropdowns();
        
        alert(`Module duplicated successfully! Created "${newName}" with ${originalContent.length} content item(s).`);
    } catch (error) {
        console.error('Error duplicating module:', error);
        alert('Error duplicating module. Please try again.');
    }
}
