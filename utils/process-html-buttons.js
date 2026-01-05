/**
 * HTML File Processor - Standardize Copy Buttons
 * 
 * This script processes HTML template files to:
 * 1. Replace "Send" buttons with "Copy to Clipboard" buttons
 * 2. Remove "Save Draft" buttons
 * 3. Add copy-to-clipboard functionality
 * 4. Standardize all action buttons
 */

// Function to read the source HTML file
async function processHTMLFile() {
    const response = await fetch('uploads/Affiliate-Recruitment-Email-Templates.html');
    let html = await response.text();
    
    // Replace all "Send" buttons with "Copy to Clipboard" buttons
    html = html.replace(
        /<button class="email-button">Send<\/button>/g,
        '<button class="email-button copy-btn" onclick="copyEmailContent(this)">Copy to Clipboard</button>'
    );
    
    // Remove all "Save Draft" buttons
    html = html.replace(
        /<button class="email-button secondary">Save Draft<\/button>/g,
        ''
    );
    
    // Add copy-to-clipboard JavaScript before closing </body> tag
    const copyScript = `
    <script>
    function copyEmailContent(button) {
        // Find the email body
        const emailTemplate = button.closest('.email-template');
        const emailBody = emailTemplate.querySelector('.email-body');
        
        if (!emailBody) {
            alert('Could not find email content');
            return;
        }
        
        // Get the text content
        const textContent = emailBody.innerText || emailBody.textContent;
        
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textContent)
                .then(() => {
                    // Show success feedback
                    const originalText = button.textContent;
                    button.textContent = '✓ Copied!';
                    button.style.backgroundColor = '#5cb85c';
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        button.textContent = originalText;
                        button.style.backgroundColor = '#db8a70';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    alert('Failed to copy. Please try selecting and copying manually.');
                });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = textContent;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                // Show success feedback
                const originalText = button.textContent;
                button.textContent = '✓ Copied!';
                button.style.backgroundColor = '#5cb85c';
                
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.backgroundColor = '#db8a70';
                }, 2000);
            } catch (err) {
                document.body.removeChild(textArea);
                alert('Failed to copy. Please try selecting and copying manually.');
            }
        }
    }
    </script>
    `;
    
    html = html.replace('</body>', copyScript + '\n</body>');
    
    // Save the processed HTML
    return html;
}

// Execute and save
processHTMLFile().then(processedHTML => {
    // This would save to embedded-files directory
    console.log('Processed HTML ready');
    console.log('Button replacements: All "Send" buttons converted to "Copy to Clipboard"');
    console.log('Removed: All "Save Draft" buttons');
});
