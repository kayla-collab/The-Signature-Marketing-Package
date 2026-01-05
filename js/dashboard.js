// Dashboard functionality for client view

// Global state
let currentModules = [];
let currentContentItems = [];
let userProgress = [];
let assignedModuleIds = [];
let moduleScrollObserver = null;

function getModuleSlug(title = '') {
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

// Update loading message
function updateLoadingMessage(text, subtext) {
    const textEl = document.querySelector('.loading-text');
    const subtextEl = document.querySelector('.loading-subtext');
    if (textEl && text) textEl.textContent = text;
    if (subtextEl && subtext) subtextEl.textContent = subtext;
}

// Initialize dashboard
async function initDashboard() {
    console.log('[Dashboard] Initializing...');
    
    // Require authentication first
    updateLoadingMessage('Welcome back!', 'Checking your session...');
    const isAuthed = await auth.requireAuth();
    if (!isAuthed) return;
    
    const session = auth.getSession();
    
    // Display user name
    document.getElementById('userName').textContent = session.fullName;
    
    // Update loading
    updateLoadingMessage(`Hi ${session.fullName.split(' ')[0]}!`, 'Loading your content...');
    
    // Load personal greeting
    await loadPersonalGreeting(session.userId, session.fullName);
    
    // Check if benchmark call CTA should be shown
    checkBenchmarkCallDisplay(session.userId);
    
    // Initialize night mode
    initNightMode();
    
    // Initialize review system
    initReviewSystem();
    
    try {
        // Load modules
        updateLoadingMessage(null, 'Fetching your modules...');
        await loadModules();
        
        // Load user progress
        updateLoadingMessage(null, 'Loading your progress...');
        await loadUserProgress();
        
        // Setup navigation
        setupNavigation();
        initSidebarToggle();
        updateCurrentModuleLabel('Overview');
        
        // Check for hash navigation
        if (window.location.hash) {
            handleHashNavigation();
        }
        
        // Ensure body is scrollable (mobile fix)
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        // Hide loading overlay with slight delay for smooth transition
        updateLoadingMessage('All set!', 'Opening your dashboard...');
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            setTimeout(() => {
                loadingOverlay.classList.remove('show');
                // Double-check scroll is enabled after overlay hides
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            }, 600);
        }
        
        console.log('[Dashboard] Initialization complete');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        updateLoadingMessage('Oops!', 'Something went wrong. Please refresh.');
        // Still hide overlay after error
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) loadingOverlay.classList.remove('show');
        }, 2000);
    }
}

// Load personal greeting for client
async function loadPersonalGreeting(userId, fullName) {
    try {
        // Set client name
        const clientNameEl = document.getElementById('clientName');
        if (clientNameEl) {
            const firstName = fullName.split(' ')[0];
            clientNameEl.textContent = firstName;
        }
        
        // Try to load custom greeting first (client-specific)
        const customResponse = await fetch(`tables/client_greetings?limit=100`);
        const customData = await customResponse.json();
        const customGreetings = customData.data || [];
        
        // Find greeting for this client
        const customGreeting = customGreetings.find(g => g.client_id === userId && g.is_active);
        
        if (customGreeting && customGreeting.greeting_message) {
            // Use custom greeting
            document.getElementById('personalGreeting').innerHTML = customGreeting.greeting_message;
        } else {
            // Try to load global welcome message
            const globalResponse = await fetch('tables/global_welcome_message?limit=1');
            const globalData = await globalResponse.json();
            const globalMessages = globalData.data || [];
            
            if (globalMessages.length > 0 && globalMessages[0].is_active && globalMessages[0].message) {
                // Use global message
                document.getElementById('personalGreeting').innerHTML = globalMessages[0].message;
            }
            // Otherwise keep default message already in HTML
        }
        
        // Show greeting modal on first load (check if they've seen it today)
        const greetingKey = `greetingShown_${userId}_${new Date().toDateString()}`;
        if (!sessionStorage.getItem(greetingKey)) {
            setTimeout(() => {
                showGreetingModal();
                sessionStorage.setItem(greetingKey, 'true');
            }, 1000);
        }
    } catch (error) {
        console.error('Error loading greeting:', error);
        // Keep default greeting on error
    }
}

// Check if benchmark call CTA should be displayed (every 3 months after account creation)
async function checkBenchmarkCallDisplay(userId) {
    try {
        // Get user's creation date
        const userResponse = await fetch(`tables/users/${userId}`);
        const user = await userResponse.json();
        
        if (!user.created_at) return; // No creation date, don't show
        
        const accountCreated = user.created_at;
        const threeMonthsInMs = 90 * 24 * 60 * 60 * 1000; // 90 days
        const now = Date.now();
        
        // Check if account is at least 3 months old
        const accountAge = now - new Date(accountCreated).getTime();
        if (accountAge < threeMonthsInMs) {
            return; // Account too new, don't show
        }
        
        // Check when they last clicked the benchmark call
        const storageKey = `lastBenchmarkCall_${userId}`;
        const lastCallDate = localStorage.getItem(storageKey);
        
        // Show if never clicked, or if it's been 3 months since last click
        let shouldShow = false;
        
        if (!lastCallDate) {
            shouldShow = true;
        } else {
            const timeSinceLastCall = now - parseInt(lastCallDate);
            if (timeSinceLastCall >= threeMonthsInMs) {
                shouldShow = true;
            }
        }
        
        if (shouldShow) {
            // Show as popup instead of inline
            showBenchmarkCallModal();
        }
    } catch (error) {
        console.error('Error checking benchmark call:', error);
    }
}

// Show benchmark call as modal popup
function showBenchmarkCallModal() {
    const modal = document.getElementById('benchmarkModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Load client's assigned modules
async function loadClientAssignedModules() {
    try {
        const session = auth.getSession();
        const response = await fetch('tables/client_modules?limit=1000');
        const data = await response.json();
        
        // Filter for this client's enabled modules
        const assignments = (data.data || []).filter(
            cm => cm.client_id === session.userId && cm.is_enabled
        );
        
        assignedModuleIds = assignments.map(a => a.module_id);
        
        // If no assignments, show all modules (backward compatibility)
        if (assignedModuleIds.length === 0) {
            assignedModuleIds = currentModules.map(m => m.id);
        }
        
        // Filter modules to only show assigned ones
        currentModules = currentModules.filter(m => assignedModuleIds.includes(m.id));
        
        // Re-sort after filtering to maintain order_index order
        currentModules.sort((a, b) => {
            const orderA = parseInt(a.order_index) || 999;
            const orderB = parseInt(b.order_index) || 999;
            return orderA - orderB;
        });
        
        console.log(`[Dashboard] Loaded ${currentModules.length} modules in correct order`);
        
    } catch (error) {
        console.error('Error loading assigned modules:', error);
        // On error, show all modules
        assignedModuleIds = currentModules.map(m => m.id);
    }
}

// Load all modules
async function loadModules() {
    try {
        const response = await fetch('tables/modules?sort=order_index&limit=100');
        const data = await response.json();
        // Ensure modules are sorted by order_index (ascending)
        currentModules = (data.data || []).sort((a, b) => {
            const orderA = parseInt(a.order_index) || 999;
            const orderB = parseInt(b.order_index) || 999;
            return orderA - orderB;
        });
        
        // Load client's assigned modules
        await loadClientAssignedModules();
        
        renderModulesGrid();
        renderNavigationMenu();
    } catch (error) {
        console.error('Error loading modules:', error);
    }
}

// Render modules in grid
function renderModulesGrid() {
    const grid = document.getElementById('modulesGrid');
    grid.innerHTML = '';
    
    if (currentModules.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px; grid-column: 1/-1;">No modules assigned yet. Contact your administrator.</p>';
        return;
    }
    
    currentModules.forEach((module, index) => {
        const progress = calculateModuleProgress(module.id);
        
        const card = document.createElement('div');
        card.className = 'module-card fade-in-up';
        card.style.animationDelay = `${index * 0.1}s`;
        card.onclick = () => openModule(module.id);
        
        card.innerHTML = `
            <h3>${module.title}</h3>
            <p>${module.description}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">${Math.round(progress)}% Complete</p>
        `;
        
        grid.appendChild(card);
    });
}

// Calculate progress for a module
function calculateModuleProgress(moduleId) {
    const moduleItems = currentContentItems.filter(item => item.module_id === moduleId);
    if (moduleItems.length === 0) return 0;
    
    const completedItems = moduleItems.filter(item => 
        userProgress.some(p => p.content_item_id === item.id && p.completed)
    );
    
    return (completedItems.length / moduleItems.length) * 100;
}

// Load user progress
async function loadUserProgress() {
    try {
        const session = auth.getSession();
        const response = await fetch(`tables/progress?limit=1000`);
        const data = await response.json();
        
        userProgress = data.data.filter(p => p.client_id === session.userId);
        
        // Also load all content items for progress calculation
        const contentResponse = await fetch('tables/content_items?limit=1000');
        const contentData = await contentResponse.json();
        currentContentItems = contentData.data;
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

// Open a specific module
async function openModule(moduleId) {
    const module = currentModules.find(m => m.id === moduleId);
    if (!module) return;
    
    // Update URL hash
    const moduleSlug = getModuleSlug(module.title);
    if (window.location.hash.substring(1) !== moduleSlug) {
        window.location.hash = moduleSlug;
    }
    
    // Hide overview, show module detail
    document.getElementById('overview-section').classList.add('hidden');
    document.getElementById('module-detail-section').classList.remove('hidden');
    document.body.classList.add('module-focus');
    setActiveModuleLink(moduleSlug);
    toggleSidebar(false);
    updateCurrentModuleLabel(module.title);
    
    // Show floating back button
    const floatingBtn = document.getElementById('floatingBackBtn');
    if (floatingBtn) floatingBtn.style.display = 'flex';
    
    const moduleTitleEl = document.getElementById('moduleTitle');
    const moduleDescriptionEl = document.getElementById('moduleDescription');
    const moduleNavTitleEl = document.getElementById('moduleNavTitle');
    
    if (moduleTitleEl) moduleTitleEl.textContent = module.title;
    if (moduleDescriptionEl) moduleDescriptionEl.textContent = module.description || '';
    if (moduleNavTitleEl) moduleNavTitleEl.textContent = 'Content sections';
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Load module content
    await loadModuleContent(moduleId);
}

// Load content items for a module
async function loadModuleContent(moduleId) {
    try {
        const session = auth.getSession();
        const response = await fetch('tables/content_items?limit=1000&sort=order_index');
        const data = await response.json();
        
        // Filter for this module (global content where client_id is empty/null + client-specific)
        const items = (data.data || []).filter(item => {
            // Must match the module
            if (item.module_id !== moduleId) return false;
            
            // Include if no client_id (global template)
            if (!item.client_id || item.client_id === '' || item.client_id === null) return true;
            
            // Include if client-specific for this user
            if (item.client_id === session.userId) return true;
            
            return false;
        });
        
        // Sort by order_index to ensure correct order
        items.sort((a, b) => {
            const orderA = parseInt(a.order_index) || 999;
            const orderB = parseInt(b.order_index) || 999;
            return orderA - orderB;
        });
        
        console.log(`[Dashboard] Loaded ${items.length} content items for module ${moduleId}`);
        renderModuleContent(items);
    } catch (error) {
        console.error('Error loading module content:', error);
        document.getElementById('moduleContent').innerHTML = '<p>Error loading content. Please refresh the page.</p>';
    }
}

function sanitizeModuleHtml(rawHtml) {
    if (!rawHtml || typeof rawHtml !== 'string') {
        return '';
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<div>${rawHtml}</div>`, 'text/html');
        const root = doc.body || doc;

        if (!root) {
            return rawHtml;
        }

        root.querySelectorAll('script, link[rel="stylesheet"]').forEach(el => el.remove());

        root.querySelectorAll('style').forEach(styleEl => {
            const css = styleEl.textContent || '';
            if (/position\s*:\s*(sticky|fixed)/i.test(css) || /z-index\s*:\s*\d+/i.test(css)) {
                styleEl.remove();
            }
        });

        root.querySelectorAll('[style]').forEach(el => {
            const style = el.getAttribute('style');
            if (!style) return;

            let sanitized = style
                .replace(/position\s*:\s*(?:sticky|fixed)[^;]*;?/ig, '')
                .replace(/z-index\s*:\s*[^;]+;?/ig, '')
                .replace(/top\s*:\s*[^;]+;?/ig, '')
                .replace(/left\s*:\s*[^;]+;?/ig, '')
                .replace(/right\s*:\s*[^;]+;?/ig, '')
                .replace(/bottom\s*:\s*[^;]+;?/ig, '')
                .replace(/!important/ig, '');

            sanitized = sanitized
                .split(';')
                .map(segment => segment.trim())
                .filter(Boolean)
                .join('; ');

            if (sanitized) {
                el.setAttribute('style', `${sanitized};`);
            } else {
                el.removeAttribute('style');
            }
        });

        root.querySelectorAll('[class]').forEach(el => {
            const classes = (el.getAttribute('class') || '')
                .split(/\s+/)
                .filter(cls => cls && !/sticky|fixed/i.test(cls));

            if (classes.length) {
                el.setAttribute('class', classes.join(' '));
            } else {
                el.removeAttribute('class');
            }
        });

        return root.innerHTML;
    } catch (error) {
        console.warn('Failed to sanitize module HTML', error);
        return rawHtml;
    }
}

// Render module content items
function renderModuleContent(items) {
    const container = document.getElementById('moduleContent');
    container.innerHTML = '';
    
    if (items.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 40px;">Content coming soon! Your admin is setting up your personalized materials.</p>';
        buildModuleNavigator([]);
        teardownModuleScrollSpy();
        return;
    }
    
    items.forEach((item, index) => {
        const section = document.createElement('div');
        section.className = 'content-section';
        section.id = `content-item-${item.id}`;
        section.dataset.stepIndex = String(index + 1);
        
        const isCompleted = userProgress.some(p => 
            p.content_item_id === item.id && p.completed
        );

        const safeBody = sanitizeModuleHtml(item.content_body || '');
        
        section.innerHTML = `
            <div class="content-header" onclick="toggleContent(this)">
                <h4>${item.title}</h4>
                <span class="toggle-icon">▼</span>
            </div>
            <div class="content-body">
                ${safeBody}
                ${renderContentByType(item)}
                <div class="completion-checkbox">
                    <label>
                        <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                               onchange="toggleCompletion('${item.id}', this.checked)">
                        Mark as complete
                    </label>
                </div>
            </div>
        `;
        
        container.appendChild(section);
    });
    
    buildModuleNavigator(items);
    setupModuleScrollSpy(items);
}

// Convert absolute URLs to relative (fixes domain mismatch issues)
function normalizeContentUrl(url) {
    if (!url) return url;
    
    // If it's a file-viewer URL with an old domain, extract just the relative part
    // Matches: https://anything.com/file-viewer.html?fileId=xxx
    const fileViewerMatch = url.match(/file-viewer\.html\?fileId=([^&]+)/);
    if (fileViewerMatch) {
        return `file-viewer.html?fileId=${fileViewerMatch[1]}`;
    }
    
    // If it's any internal page on a different domain, make it relative
    // Matches: https://anything.com/somepage.html
    const internalPageMatch = url.match(/https?:\/\/[^\/]+\/([^\/]+\.html.*)$/);
    if (internalPageMatch && !url.includes('youtube') && !url.includes('vimeo') && !url.includes('wistia')) {
        return internalPageMatch[1];
    }
    
    // Return as-is for external URLs (YouTube, Vimeo, etc.)
    return url;
}

// Render content based on type
function renderContentByType(item) {
    const contentUrl = normalizeContentUrl(item.content_url);
    
    switch (item.content_type) {
        case 'video':
            if (contentUrl) {
                return `
                    <div class="video-embed">
                        <iframe src="${contentUrl}" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                `;
            }
            return '';
            
        case 'download':
            if (contentUrl) {
                return `
                    <div class="download-button">
                        <a href="${contentUrl}" target="_blank" class="btn btn-primary" download>
                            Download File
                        </a>
                    </div>
                `;
            }
            return '';
            
        case 'link':
            if (contentUrl) {
                return `
                    <div style="margin: 20px 0;">
                        <a href="${contentUrl}" target="_blank" class="btn btn-secondary">
                            Open Resource
                        </a>
                    </div>
                `;
            }
            return '';
        
        case 'embedded_file':
            if (contentUrl) {
                return `
                    <div style="margin: 20px 0;">
                        <a href="${contentUrl}" target="_blank" class="btn btn-primary">
                            View File
                        </a>
                    </div>
                `;
            }
            return '';
            
        default:
            return '';
    }
}

// Toggle content section
function toggleContent(header) {
    header.classList.toggle('expanded');
    const body = header.nextElementSibling;
    body.classList.toggle('show');
}

function buildModuleNavigator(items) {
    const navList = document.getElementById('moduleNavList');
    if (!navList) return;

    navList.innerHTML = '';

    if (!items || items.length === 0) {
        navList.innerHTML = '<p class="module-nav-empty">Content will appear here as soon as it’s published.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'module-nav-link';
        button.dataset.targetId = `content-item-${item.id}`;
        button.setAttribute('aria-label', `Jump to ${item.title}`);
        button.innerHTML = `
            <span class="module-nav-link__bullet"></span>
            <span class="module-nav-link__title">${index + 1}. ${item.title}</span>
        `;

        button.addEventListener('click', () => {
            const target = document.getElementById(button.dataset.targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            toggleSidebar(false);
        });

        fragment.appendChild(button);
    });

    navList.appendChild(fragment);
}

function setupModuleScrollSpy(items) {
    teardownModuleScrollSpy();

    const navList = document.getElementById('moduleNavList');
    if (!navList) return;

    const navLinks = navList.querySelectorAll('.module-nav-link');
    if (!navLinks.length || !items || !items.length) return;

    moduleScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.dataset.targetId === targetId);
                });
            }
        });
    }, {
        root: null,
        threshold: 0.4,
        rootMargin: '-25% 0px -45% 0px'
    });

    items.forEach(item => {
        const section = document.getElementById(`content-item-${item.id}`);
        if (section) {
            moduleScrollObserver.observe(section);
        }
    });
}

function teardownModuleScrollSpy() {
    if (moduleScrollObserver) {
        moduleScrollObserver.disconnect();
        moduleScrollObserver = null;
    }
}

function updateCurrentModuleLabel(label) {
    const labelEl = document.getElementById('currentModuleLabel');
    if (labelEl) {
        labelEl.textContent = label;
    }
}

function initSidebarToggle() {
    const toggleButton = document.getElementById('sidebarToggle');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleButton) {
        toggleButton.addEventListener('click', () => toggleSidebar());
    }

    if (overlay) {
        overlay.addEventListener('click', () => toggleSidebar(false));
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            toggleSidebar(false);
        }
    });
}

function toggleSidebar(forceState) {
    const shouldOpen = typeof forceState === 'boolean'
        ? forceState
        : !document.body.classList.contains('sidebar-open');

    if (shouldOpen) {
        document.body.classList.add('sidebar-open');
    } else {
        document.body.classList.remove('sidebar-open');
    }

    const toggleButton = document.getElementById('sidebarToggle');
    if (toggleButton) {
        toggleButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    }
}

// Toggle completion status
async function toggleCompletion(contentItemId, completed) {
    const session = auth.getSession();
    
    try {
        // Find existing progress record
        const existingProgress = userProgress.find(p => 
            p.content_item_id === contentItemId && 
            p.client_id === session.userId
        );
        
        if (existingProgress) {
            // Update existing record
            await fetch(`tables/progress/${existingProgress.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    completed: completed,
                    completed_at: completed ? new Date().toISOString() : null
                })
            });
        } else {
            // Create new record
            const module = currentModules.find(m => 
                currentContentItems.find(c => c.id === contentItemId)?.module_id === m.id
            );
            
            await fetch('tables/progress', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    client_id: session.userId,
                    module_id: module?.id || '',
                    content_item_id: contentItemId,
                    completed: completed,
                    completed_at: completed ? new Date().toISOString() : null
                })
            });
        }
        
        // Reload progress
        await loadUserProgress();
        
        // Update progress bars if on overview
        if (!document.getElementById('overview-section').classList.contains('hidden')) {
            renderModulesGrid();
        }
    } catch (error) {
        console.error('Error updating completion:', error);
        alert('Error saving progress. Please try again.');
    }
}

// Show overview
function showOverview() {
    if (window.location.hash.substring(1) !== 'overview') {
        window.location.hash = 'overview';
    }

    document.getElementById('module-detail-section').classList.add('hidden');
    document.getElementById('overview-section').classList.remove('hidden');
    document.body.classList.remove('module-focus');
    setActiveModuleLink('overview');
    toggleSidebar(false);
    updateCurrentModuleLabel('Overview');
    const moduleNavTitleEl = document.getElementById('moduleNavTitle');
    if (moduleNavTitleEl) moduleNavTitleEl.textContent = 'Content sections';
    buildModuleNavigator([]);
    teardownModuleScrollSpy();
    
    // Hide floating back button
    const floatingBtn = document.getElementById('floatingBackBtn');
    if (floatingBtn) floatingBtn.style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup navigation
function setupNavigation() {
    // Will be called after renderNavigationMenu
}

function getModuleNavItems() {
    const items = [{
        key: 'overview',
        label: 'Overview',
        position: 0
    }];

    currentModules.forEach((module, index) => {
        items.push({
            key: getModuleSlug(module.title),
            label: module.title,
            moduleId: module.id,
            position: index + 1
        });
    });

    return items;
}

// Render navigation menu dynamically
function renderNavigationMenu() {
    const navMenu = document.getElementById('clientNavMenu');
    const navItems = getModuleNavItems();
    const currentTarget = window.location.hash.substring(1) || 'overview';

    if (navMenu) {
        const navMarkup = navItems.map(item => {
            const isActive = item.key === currentTarget;
            return `<li><a href="#${item.key}" class="nav-link${isActive ? ' active' : ''}" data-module-target="${item.key}">${item.label}</a></li>`;
        }).join('');

        navMenu.innerHTML = navMarkup;
    }

    attachModuleNavigationHandlers();
    setActiveModuleLink(currentTarget);
}

function attachModuleNavigationHandlers() {
    const links = document.querySelectorAll('[data-module-target]');

    links.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const targetKey = event.currentTarget.getAttribute('data-module-target');
            navigateToModuleTarget(targetKey);
        });
    });
}

function navigateToModuleTarget(targetKey) {
    if (!targetKey) return;

    if (targetKey === 'overview') {
        showOverview();
    } else {
        const module = currentModules.find(m => getModuleSlug(m.title) === targetKey);
        if (module) {
            openModule(module.id);
        }
    }

    setActiveModuleLink(targetKey);
}

function setActiveModuleLink(targetKey) {
    const normalized = targetKey || 'overview';

    document.querySelectorAll('[data-module-target]').forEach(link => {
        const matches = link.getAttribute('data-module-target') === normalized;
        link.classList.toggle('active', matches);

        if (matches) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });
}

// Handle hash navigation on load
function handleHashNavigation() {
    const hash = window.location.hash.substring(1);

    if (!hash || hash === 'overview') {
        showOverview();
        return;
    }

    const module = currentModules.find(m => getModuleSlug(m.title) === hash);

    if (module) {
        const currentModuleTitle = document.getElementById('moduleTitle')?.textContent || '';
        const isAlreadyOpen = currentModuleTitle === module.title && !document.getElementById('module-detail-section').classList.contains('hidden');

        if (isAlreadyOpen) {
            setActiveModuleLink(hash);
            return;
        }

        openModule(module.id);
    }
}

// Toggle Fullscreen Mode
function toggleFullscreen() {
    const body = document.body;
    const btn = document.getElementById('fullscreenToggle');
    const icon = btn.querySelector('.icon-expand');
    
    if (!body.classList.contains('fullscreen-mode')) {
        // Enter fullscreen
        body.classList.add('fullscreen-mode');
        icon.textContent = '⤡'; // Compress icon
        btn.innerHTML = '<span class="icon-expand">⤡</span> Exit Fullscreen';
        
        // Try browser fullscreen if available
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Browser fullscreen not allowed:', err);
            });
        }
    } else {
        // Exit fullscreen
        body.classList.remove('fullscreen-mode');
        icon.textContent = '⤢'; // Expand icon
        btn.innerHTML = '<span class="icon-expand">⤢</span> Fullscreen';
        
        // Exit browser fullscreen
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(err => {
                console.log('Error exiting browser fullscreen:', err);
            });
        }
    }
}

// Handle browser fullscreen change (e.g. user presses Esc)
document.addEventListener('fullscreenchange', () => {
    const body = document.body;
    const btn = document.getElementById('fullscreenToggle');
    
    if (!document.fullscreenElement && body.classList.contains('fullscreen-mode')) {
        // Browser exited fullscreen (e.g. Esc pressed), so sync UI
        body.classList.remove('fullscreen-mode');
        if (btn) {
            btn.innerHTML = '<span class="icon-expand">⤢</span> Fullscreen';
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);

// Handle browser back/forward
window.addEventListener('hashchange', handleHashNavigation);
