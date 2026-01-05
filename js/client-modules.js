// Client Modules Management

// Require admin authentication
auth.requireAuth();
auth.requireAdmin();

let allClients = [];
let allModules = [];
let currentClientId = null;
let clientModuleAssignments = [];

// Default template (all modules)
const DEFAULT_TEMPLATE = 'all';

// Initialize page
async function init() {
    await loadClients();
    await loadModules();
    populateClientDropdown();
}

// Load all clients
async function loadClients() {
    try {
        const response = await fetch('tables/users?limit=100');
        const data = await response.json();
        allClients = data.data.filter(u => u.role === 'client' && u.is_active);
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Load all modules
async function loadModules() {
    try {
        const response = await fetch('tables/modules?sort=order_index&limit=100');
        const data = await response.json();
        // Ensure modules are sorted by order_index (ascending)
        allModules = (data.data || []).sort((a, b) => {
            const orderA = parseInt(a.order_index) || 999;
            const orderB = parseInt(b.order_index) || 999;
            return orderA - orderB;
        });
        console.log('[ClientModules] Loaded modules in order:', allModules.map(m => `${m.title} (order: ${m.order_index})`));
    } catch (error) {
        console.error('Error loading modules:', error);
    }
}

// Populate client dropdown
function populateClientDropdown() {
    const select = document.getElementById('clientSelectMain');
    
    const options = allClients.map(c => 
        `<option value="${c.id}">${c.full_name} (${c.email})</option>`
    ).join('');
    
    select.innerHTML = '<option value="">Choose a client...</option>' + options;
}

// Load client modules when client is selected
async function loadClientModules() {
    const clientId = document.getElementById('clientSelectMain').value;
    
    if (!clientId) {
        document.getElementById('moduleAssignmentSection').style.display = 'none';
        document.getElementById('noClientSelected').style.display = 'block';
        return;
    }
    
    currentClientId = clientId;
    document.getElementById('moduleAssignmentSection').style.display = 'block';
    document.getElementById('noClientSelected').style.display = 'none';
    
    // Load existing assignments
    await loadClientModuleAssignments();
    
    // Render module checklist
    renderModuleChecklist();
    
    // Display current assignments
    displayCurrentModules();
}

// Load existing module assignments for client
async function loadClientModuleAssignments() {
    try {
        const response = await fetch('tables/client_modules?limit=1000');
        const data = await response.json();
        
        clientModuleAssignments = data.data.filter(cm => cm.client_id === currentClientId);
    } catch (error) {
        console.error('Error loading client modules:', error);
        clientModuleAssignments = [];
    }
}

// Render module checklist
function renderModuleChecklist() {
    const container = document.getElementById('moduleChecklistContainer');
    
    if (allModules.length === 0) {
        container.innerHTML = '<p class="empty-state">No modules available</p>';
        return;
    }
    
    container.innerHTML = allModules.map(module => {
        const isAssigned = clientModuleAssignments.some(
            cm => cm.module_id === module.id && cm.is_enabled
        );
        
        return `
            <div class="module-item">
                <input type="checkbox" 
                       id="module_${module.id}" 
                       value="${module.id}"
                       ${isAssigned ? 'checked' : ''}>
                <div class="module-info">
                    <h4>${module.title}</h4>
                    <p>${module.description}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Display current assigned modules
function displayCurrentModules() {
    const list = document.getElementById('currentModulesList');
    
    const assignedModules = allModules.filter(module =>
        clientModuleAssignments.some(cm => cm.module_id === module.id && cm.is_enabled)
    );
    
    if (assignedModules.length === 0) {
        list.innerHTML = '<li class="empty-state">No modules assigned yet</li>';
        return;
    }
    
    list.innerHTML = assignedModules.map(module => 
        `<li>${module.title}</li>`
    ).join('');
}

// Select all modules
function selectAllModules() {
    const checkboxes = document.querySelectorAll('#moduleChecklistContainer input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = true);
}

// Deselect all modules
function deselectAllModules() {
    const checkboxes = document.querySelectorAll('#moduleChecklistContainer input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
}

// Apply default template (all modules)
function applyDefaultTemplate() {
    if (confirm('Apply default template? This will assign all modules to this client.')) {
        selectAllModules();
    }
}

// Save client module assignments
async function saveClientModules() {
    if (!currentClientId) {
        alert('Please select a client first.');
        return;
    }
    
    const checkboxes = document.querySelectorAll('#moduleChecklistContainer input[type="checkbox"]');
    const selectedModules = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    try {
        // First, delete all existing assignments for this client
        for (const assignment of clientModuleAssignments) {
            await fetch(`tables/client_modules/${assignment.id}`, {
                method: 'DELETE'
            });
        }
        
        // Then create new assignments for selected modules
        for (const moduleId of selectedModules) {
            await fetch('tables/client_modules', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    client_id: currentClientId,
                    module_id: moduleId,
                    is_enabled: true
                })
            });
        }
        
        alert('Module assignments saved successfully!');
        
        // Reload assignments
        await loadClientModuleAssignments();
        displayCurrentModules();
        
    } catch (error) {
        console.error('Error saving module assignments:', error);
        alert('Error saving module assignments. Please try again.');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
