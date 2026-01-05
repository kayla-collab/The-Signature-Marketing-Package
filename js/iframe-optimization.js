// Iframe Detection and Mobile Scroll Fix v3
// CRITICAL: Enables full-page swipe scrolling in embeds

(function() {
    'use strict';
    
    function isInIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }
    
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
            || ('ontouchstart' in window) 
            || (navigator.maxTouchPoints > 0)
            || window.innerWidth <= 968;
    }
    
    function applyScrollFix() {
        const html = document.documentElement;
        const body = document.body;
        
        // Safety check - body may not exist yet if called too early
        if (!body) {
            console.log('[ScrollFix] Body not ready, will retry...');
            return;
        }
        
        // Add detection classes
        if (isInIframe()) {
            html.classList.add('in-iframe');
            body.classList.add('in-iframe', 'embedded');
        }
        
        if (isMobile()) {
            html.classList.add('is-mobile');
            body.classList.add('is-mobile', 'touch-device');
        }
        
        // CRITICAL: Inject scroll-fix CSS at highest priority
        const style = document.createElement('style');
        style.id = 'scroll-fix-critical';
        style.textContent = `
            /* CRITICAL SCROLL FIX - Makes entire page swipeable */
            html {
                overflow-x: hidden !important;
                overflow-y: scroll !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior: contain;
                height: auto !important;
                width: 100% !important;
                max-width: 100vw !important;
            }
            
            body {
                overflow-x: hidden !important;
                overflow-y: visible !important;
                -webkit-overflow-scrolling: touch !important;
                overscroll-behavior: contain;
                position: relative !important;
                width: 100% !important;
                max-width: 100vw !important;
                min-height: 100% !important;
            }
            
            /* Prevent ANY element from causing horizontal scroll */
            * {
                max-width: 100vw;
            }
            
            /* Container constraints */
            .dashboard,
            .main-content,
            .login-container,
            .admin-container {
                width: 100% !important;
                max-width: 100vw !important;
                overflow-x: hidden !important;
            }
            
            /* iOS momentum scrolling on all scrollable areas */
            .sidebar,
            .modal-content,
            .content-body {
                -webkit-overflow-scrolling: touch;
            }
            
            /* Ensure touch events work */
            body, body * {
                touch-action: pan-y pan-x;
            }
            
            /* But buttons/links should be manipulation only */
            a, button, input, select, textarea, .btn {
                touch-action: manipulation;
            }
        `;
        
        // Insert at very beginning of head (with safety check)
        if (document.head) {
            document.head.insertBefore(style, document.head.firstChild);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.head.insertBefore(style, document.head.firstChild);
            });
        }
        
        // Also apply via JS for extra certainty
        html.style.cssText += 'overflow-x:hidden!important;overflow-y:scroll!important;-webkit-overflow-scrolling:touch!important;';
        body.style.cssText += 'overflow-x:hidden!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch!important;position:relative!important;';
        
        // Remove any scroll locks that might be applied
        body.style.position = 'relative';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.bottom = '';
        
        // Fix for iOS 100vh bug
        function setVH() {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => setTimeout(setVH, 100));
        
        // Ensure viewport is correct
        let viewport = document.querySelector('meta[name="viewport"]');
        const viewportContent = 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes';
        if (viewport) {
            viewport.content = viewportContent;
        } else {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = viewportContent;
            document.head.appendChild(viewport);
        }
        
        console.log('[ScrollFix] Applied - iframe:', isInIframe(), 'mobile:', isMobile());
    }
    
    // Handle links in iframe
    function setupLinks() {
        if (!isInIframe()) return;
        
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link || !link.href) return;
            
            // External links - new tab
            if (link.hostname !== window.location.hostname) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        });
    }
    
    // Parent communication for responsive iframe height
    function setupParentComm() {
        if (!isInIframe()) return;
        
        function sendHeight() {
            try {
                const height = Math.max(
                    document.body.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.scrollHeight,
                    document.documentElement.offsetHeight
                );
                window.parent.postMessage({ type: 'resize', height: height }, '*');
            } catch (e) {}
        }
        
        // Send height periodically
        sendHeight();
        setInterval(sendHeight, 1000);
        
        // And on resize
        window.addEventListener('resize', sendHeight);
        
        // Observe DOM changes
        if (window.MutationObserver) {
            const observer = new MutationObserver(sendHeight);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    
    // Run when DOM is ready (safe approach)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            applyScrollFix();
            setupLinks();
            setupParentComm();
        });
    } else {
        // DOM already loaded
        applyScrollFix();
        setupLinks();
        setupParentComm();
    }
    
    // And after full page load
    window.addEventListener('load', function() {
        applyScrollFix();
        // Double-check scroll is working after everything loads
        setTimeout(applyScrollFix, 500);
    });
    
    // Expose for debugging
    window.ScrollFix = {
        isInIframe: isInIframe,
        isMobile: isMobile,
        reapply: applyScrollFix
    };
})();
