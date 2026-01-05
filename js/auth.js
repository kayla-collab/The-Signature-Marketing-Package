// Authentication and Session Management

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionKey = 'smp_session';
    }
    
    // Initialize authentication
    async init() {
        const session = this.getSession();
        if (session) {
            await this.validateSession(session);
        }
    }
    
    // Login user
    async login(email, password) {
        try {
            // Fetch all users
            const response = await fetch('tables/users?limit=100');
            
            if (!response.ok) {
                throw new Error('Unable to connect to server. Please check your internet connection.');
            }
            
            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                throw new Error('No users found. Please contact support.');
            }
            
            // Find matching user - Check truthy for is_active to handle both boolean and number
            const user = data.data.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password_hash === password &&
                u.is_active // Truthy check works for both true and 1
            );
            
            if (!user) {
                // Check if email exists
                const emailExists = data.data.find(u => u.email.toLowerCase() === email.toLowerCase());
                if (emailExists) {
                    throw new Error('Incorrect password. Please try again.');
                } else {
                    throw new Error('No account found with this email address.');
                }
            }
            
            // Check access expiration
            if (user.access_expires) {
                const expiryDate = new Date(user.access_expires);
                if (expiryDate < new Date()) {
                    throw new Error('Your access has expired. Please contact support.');
                }
            }
            
            // Store session
            this.setSession(user);
            this.currentUser = user;
            
            return user;
        } catch (error) {
            // Better error handling
            if (error.message) {
                throw error;
            } else {
                throw new Error('Login failed. Please check your credentials and try again.');
            }
        }
    }
    
    // Logout user
    logout() {
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
        window.location.href = 'index.html';
    }
    
    // Store session in localStorage
    setSession(user) {
        const session = {
            userId: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            timestamp: Date.now()
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
    }
    
    // Get session from localStorage
    getSession() {
        const sessionData = localStorage.getItem(this.sessionKey);
        if (!sessionData) return null;
        
        const session = JSON.parse(sessionData);
        
        // Check if session is older than 24 hours
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (Date.now() - session.timestamp > twentyFourHours) {
            this.logout();
            return null;
        }
        
        return session;
    }
    
    // Validate existing session
    async validateSession(session) {
        try {
            const response = await fetch(`tables/users/${session.userId}`);
            if (!response.ok) {
                throw new Error('Session invalid');
            }
            
            const user = await response.json();
            
            if (!user.is_active && user.is_active !== 1) {
                throw new Error('Account deactivated');
            }
            
            this.currentUser = user;
            return user;
        } catch (error) {
            this.logout();
            throw error;
        }
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return this.getSession() !== null;
    }
    
    // Check if user is admin
    isAdmin() {
        const session = this.getSession();
        return session && session.role === 'admin';
    }
    
    // Require authentication (call on protected pages)
    async requireAuth() {
        const session = this.getSession();
        if (!session) {
            window.location.href = 'index.html';
            return false;
        }
        
        // Validate session
        try {
            await this.validateSession(session);
            return true;
        } catch (error) {
            window.location.href = 'index.html';
            return false;
        }
    }
    
    // Require admin role
    async requireAdmin() {
        const session = this.getSession();
        if (!session) {
            window.location.href = 'index.html';
            return false;
        }
        
        if (session.role !== 'admin') {
            window.location.href = 'dashboard.html';
            return false;
        }
        
        // Validate session
        try {
            await this.validateSession(session);
            return true;
        } catch (error) {
            window.location.href = 'index.html';
            return false;
        }
    }
}

// Initialize global auth manager
const auth = new AuthManager();

// Global logout function for navigation links
function logout() {
    auth.logout();
}

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('errorMessage');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        try {
            errorMsg.classList.remove('show');
            
            // Show loading
            if (loadingOverlay) loadingOverlay.classList.add('show');
            
            const user = await auth.login(email, password);
            
            // Redirect based on role
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            // Hide loading
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            
            errorMsg.textContent = error.message;
            errorMsg.classList.add('show');
        }
    });
}
