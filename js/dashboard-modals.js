// Additional Dashboard Functions for Modals, Night Mode, and Review System

// Show greeting modal on first load
function showGreetingModal() {
    const modal = document.getElementById('greetingModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Close greeting modal
function closeGreetingModal() {
    const modal = document.getElementById('greetingModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Close benchmark modal
function closeBenchmarkModal() {
    const modal = document.getElementById('benchmarkModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Record benchmark call click
function recordBenchmarkClick() {
    const session = auth.getSession();
    const storageKey = `lastBenchmarkCall_${session.userId}`;
    localStorage.setItem(storageKey, Date.now().toString());
    closeBenchmarkModal();
}

// Close review modal
function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Initialize night mode
function initNightMode() {
    const toggle = document.getElementById('nightModeToggle');
    if (!toggle) return;
    
    // Load saved preference
    const isDarkMode = localStorage.getItem('nightMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('night-mode');
        toggle.checked = true;
    }
    
    // Toggle on change
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            document.body.classList.add('night-mode');
            localStorage.setItem('nightMode', 'true');
        } else {
            document.body.classList.remove('night-mode');
            localStorage.setItem('nightMode', 'false');
        }
    });
}

// Initialize review request system
function initReviewSystem() {
    const session = auth.getSession();
    const lastReviewKey = `lastReviewRequest_${session.userId}`;
    const reviewCompletedKey = `reviewCompleted_${session.userId}`;
    const lastReview = localStorage.getItem(lastReviewKey);
    const reviewCompleted = localStorage.getItem(reviewCompletedKey);
    
    // Don't show if completed review in last 2 months
    if (reviewCompleted) {
        const twoMonthsInMs = 60 * 24 * 60 * 60 * 1000; // 60 days
        const timeSinceReview = Date.now() - parseInt(reviewCompleted);
        if (timeSinceReview < twoMonthsInMs) {
            return; // Don't show review modal
        }
    }
    
    // Show review modal every 30-60 minutes
    const minTime = 30 * 60 * 1000; // 30 minutes
    const maxTime = 60 * 60 * 1000; // 60 minutes
    const randomTime = Math.random() * (maxTime - minTime) + minTime;
    
    // Check if we should show now
    if (!lastReview || (Date.now() - parseInt(lastReview)) >= randomTime) {
        setTimeout(() => {
            showReviewModal();
        }, randomTime);
    }
}

// Show review modal
function showReviewModal() {
    const session = auth.getSession();
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.classList.add('show');
        localStorage.setItem(`lastReviewRequest_${session.userId}`, Date.now().toString());
        initStarRating();
    }
}

// Initialize star rating system
function initStarRating() {
    const stars = document.querySelectorAll('.star');
    const messageDiv = document.getElementById('ratingMessage');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < selectedRating) {
                    s.textContent = '★';
                    s.classList.add('active');
                } else {
                    s.textContent = '☆';
                    s.classList.remove('active');
                }
            });
            
            // Show appropriate message
            if (selectedRating === 5) {
                messageDiv.innerHTML = `
                    <p style="color: #4CAF50; font-weight: 600; margin-bottom: 15px;">Thank you! We're thrilled you're having a 5-star experience!</p>
                    <a href="https://fera.review/vb2" target="_blank" class="btn btn-primary" onclick="recordReviewCompletion()" style="text-decoration: none;">Share Your Review</a>
                `;
            } else {
                const session = auth.getSession();
                messageDiv.innerHTML = `
                    <p style="color: #666; margin-bottom: 15px;">Thank you for your feedback. We're always working to improve!</p>
                    <button onclick="closeReviewModal()" class="btn btn-secondary">Close</button>
                `;
                // Record that they gave feedback (but don't send to review page)
                localStorage.setItem(`reviewCompleted_${session.userId}`, Date.now().toString());
            }
        });
        
        // Hover effect
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.textContent = '★';
                } else {
                    s.textContent = '☆';
                }
            });
        });
    });
    
    // Reset on mouse leave
    const ratingDiv = document.getElementById('starRating');
    ratingDiv.addEventListener('mouseleave', () => {
        stars.forEach((s, index) => {
            if (index < selectedRating) {
                s.textContent = '★';
            } else {
                s.textContent = '☆';
            }
        });
    });
}

// Record review completion (when they click to go to review page)
function recordReviewCompletion() {
    const session = auth.getSession();
    localStorage.setItem(`reviewCompleted_${session.userId}`, Date.now().toString());
    closeReviewModal();
}

// Make functions global
window.closeGreetingModal = closeGreetingModal;
window.closeBenchmarkModal = closeBenchmarkModal;
window.recordBenchmarkClick = recordBenchmarkClick;
window.closeReviewModal = closeReviewModal;
window.recordReviewCompletion = recordReviewCompletion;
window.showGreetingModal = showGreetingModal;
