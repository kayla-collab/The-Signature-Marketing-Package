// File Upload Manager - Handles actual file uploads and HTML code paste
let currentFiles = [];
let selectedFile = null;
let currentMode = 'file'; // 'file' or 'code'

// Tab switching function
function switchTab(mode) {
    console.log('Switching to tab:', mode);
    currentMode = mode;
    
    const fileTab = document.getElementById('fileTab');
    const codeTab = document.getElementById('codeTab');
    const fileUploadTab = document.getElementById('fileUploadTab');
    const htmlCodeTab = document.getElementById('htmlCodeTab');
    const fileSizeGroup = document.getElementById('fileSizeGroup');
    const fileInput = document.getElementById('fileInput');
    const htmlCode = document.getElementById('htmlCode');
    
    if (mode === 'file') {
        // Show file upload, hide HTML code
        fileTab.classList.add('active');
        codeTab.classList.remove('active');
        fileUploadTab.style.display = 'block';
        htmlCodeTab.style.display = 'none';
        fileSizeGroup.style.display = 'block';
        fileInput.required = true;
        htmlCode.required = false;
        document.getElementById('uploadBtnText').textContent = 'Upload File';
    } else {
        // Show HTML code, hide file upload
        codeTab.classList.add('active');
        fileTab.classList.remove('active');
        fileUploadTab.style.display = 'none';
        htmlCodeTab.style.display = 'block';
        fileSizeGroup.style.display = 'none';
        fileInput.required = false;
        htmlCode.required = true;
        document.getElementById('uploadBtnText').textContent = 'Save HTML Code';
        
        // Auto-set file type to HTML
        document.getElementById('fileType').value = 'html';
        document.getElementById('fileTypeDisplay').textContent = 'HTML';
        document.getElementById('fileTypeDisplay').style.color = '#4CAF50';
    }
}

// Make switchTab available globally
window.switchTab = switchTab;

// Load uploaded files on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('=== FILE UPLOAD MANAGER INITIALIZING ===');
    console.log('Timestamp:', new Date().toISOString());
    
    try {
        console.log('Checking admin authentication...');
        const isAdmin = await auth.requireAdmin(); // Require admin authentication
        console.log('Admin check result:', isAdmin);
        
        if (!isAdmin) {
            // User will be redirected, don't continue
            console.log('Not admin, hiding loading and returning');
            hideLoading();
            return;
        }
        
        console.log('Admin authenticated, loading files...');
        await loadFiles();
        
        console.log('Setting up file input...');
        setupFileInput();
        
        console.log('=== INITIALIZATION COMPLETE ===');
    } catch (error) {
        console.error('Error initializing page:', error);
    } finally {
        hideLoading(); // Always hide loading screen
    }
});

// Setup file input handler
function setupFileInput() {
    console.log('Setting up file input handler...');
    
    const fileInput = document.getElementById('fileInput');
    const fileNameInput = document.getElementById('fileName');
    const fileTypeDisplay = document.getElementById('fileTypeDisplay');
    const fileSizeDisplay = document.getElementById('fileSizeDisplay');
    const fileTypeHidden = document.getElementById('fileType');
    
    console.log('Elements found:', {
        fileInput: !!fileInput,
        fileNameInput: !!fileNameInput,
        fileTypeDisplay: !!fileTypeDisplay,
        fileSizeDisplay: !!fileSizeDisplay,
        fileTypeHidden: !!fileTypeHidden
    });
    
    if (!fileInput) {
        console.error('ERROR: fileInput element not found!');
        return;
    }
    
    fileInput.addEventListener('change', (e) => {
        console.log('File input changed!', e.target.files);
        const file = e.target.files[0];
        if (!file) {
            console.log('No file selected');
            selectedFile = null;
            fileTypeDisplay.textContent = 'Not selected';
            fileSizeDisplay.textContent = '-';
            fileTypeHidden.value = '';
            return;
        }
        
        console.log('File selected:', file.name, file.size, 'bytes');
        selectedFile = file;
        
        // Auto-fill file name (remove extension)
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        if (!fileNameInput.value) {
            fileNameInput.value = nameWithoutExt;
            console.log('Auto-filled file name:', nameWithoutExt);
        }
        
        // Detect and display file type
        const fileType = detectFileType(file);
        console.log('Detected file type:', fileType);
        fileTypeHidden.value = fileType;
        fileTypeDisplay.textContent = fileType.toUpperCase();
        fileTypeDisplay.style.color = '#4CAF50';
        
        // Display file size
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        fileSizeDisplay.textContent = `${sizeInMB} MB`;
        console.log('File size:', sizeInMB, 'MB');
        
        // Warning for large files
        if (file.size > 10 * 1024 * 1024) {
            fileSizeDisplay.style.color = '#ff9800';
            fileSizeDisplay.textContent += ' (Large file - may affect performance)';
            console.warn('Large file detected!');
        } else {
            fileSizeDisplay.style.color = '#4CAF50';
        }
    });
    
    console.log('File input handler attached successfully');
}

// Detect file type from file extension
function detectFileType(file) {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.html') || fileName.endsWith('.htm')) return 'html';
    if (fileName.endsWith('.pdf')) return 'pdf';
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return 'docx';
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return 'xlsx';
    if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) return 'pptx';
    return 'unknown';
}

// Convert file to Data URL
function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

// Load all uploaded files
async function loadFiles() {
    try {
        const response = await fetch('tables/uploaded_files?limit=100');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        currentFiles = result.data || [];
        renderFilesList();
    } catch (error) {
        console.error('Error loading files:', error);
        const tbody = document.getElementById('filesList');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <div style="color: #d9534f; margin-bottom: 10px;">
                        <strong>⚠️ Unable to load files</strong>
                    </div>
                    <div style="color: #666; font-size: 14px;">
                        ${error.message || 'Please check your connection and try refreshing the page.'}
                    </div>
                    <button class="btn btn-primary" onclick="loadFiles()" style="margin-top: 15px;">
                        Retry
                    </button>
                </td>
            </tr>
        `;
    }
}

// Render files list table
function renderFilesList() {
    const tbody = document.getElementById('filesList');
    
    if (currentFiles.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: #999;">
                    No files uploaded yet. Upload your first file above.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = currentFiles.map(file => {
        // Calculate file size if stored
        const sizeDisplay = file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : '-';
        const isLarge = file.file_size && file.file_size > 10 * 1024 * 1024;
        
        // Get file type icon (Font Awesome)
        const typeIcon = {
            'html': '<i class="fas fa-file-code"></i>',
            'pdf': '<i class="fas fa-file-pdf"></i>',
            'docx': '<i class="fas fa-file-word"></i>',
            'xlsx': '<i class="fas fa-file-excel"></i>',
            'pptx': '<i class="fas fa-file-powerpoint"></i>'
        }[file.file_type] || '<i class="fas fa-file"></i>';
        
        return `
            <tr>
                <td>
                    ${typeIcon} ${escapeHtml(file.file_name)}
                    ${isLarge ? '<span style="color: #ff9800; font-size: 0.8em;"><i class="fas fa-exclamation-triangle"></i> Large</span>' : ''}
                </td>
                <td><span style="background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600;">${file.file_type.toUpperCase()}</span></td>
                <td>${file.allow_download ? '<span style="background: #e8f5e9; color: #388e3c; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600;"><i class="fas fa-check"></i> Yes</span>' : '<span style="background: #f5f5f5; color: #757575; padding: 4px 12px; border-radius: 12px; font-size: 0.85em;"><i class="fas fa-times"></i> No</span>'}</td>
                <td>${file.allow_copy ? '<span style="background: #e8f5e9; color: #388e3c; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600;"><i class="fas fa-check"></i> Yes</span>' : '<span style="background: #f5f5f5; color: #757575; padding: 4px 12px; border-radius: 12px; font-size: 0.85em;"><i class="fas fa-times"></i> No</span>'}</td>
                <td>${new Date(file.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm" onclick="previewFile('${file.id}')" style="background: #2196f3; margin-right: 5px;"><i class="fas fa-eye"></i> Preview</button>
                    <button class="btn btn-sm" onclick="downloadFile('${file.id}')" style="background: #4caf50; margin-right: 5px;"><i class="fas fa-download"></i> Download</button>
                    <button class="btn btn-sm" onclick="deleteFile('${file.id}')" style="background: #f44336;"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}
console.log('renderFilesList function defined');

// Handle file upload form submission
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('=== FORM SUBMITTED ===');
    console.log('Current mode:', currentMode);
    
    const submitBtn = document.getElementById('uploadBtn');
    const uploadBtnText = document.getElementById('uploadBtnText');
    const uploadProgress = document.getElementById('uploadProgress');
    
    let fileDataURL;
    let fileSize = 0;
    let originalFilename = '';
    
    try {
        // Show progress
        console.log('Disabling submit button...');
        submitBtn.disabled = true;
        uploadBtnText.style.display = 'none';
        uploadProgress.style.display = 'inline';
        
        if (currentMode === 'file') {
            // FILE UPLOAD MODE
            console.log('Selected file:', selectedFile);
            
            if (!selectedFile) {
                throw new Error('Please select a file to upload');
            }
            
            uploadProgress.textContent = 'Converting file...';
            console.log('Converting file to Data URL...');
            fileDataURL = await fileToDataURL(selectedFile);
            fileSize = selectedFile.size;
            originalFilename = selectedFile.name;
            console.log('Data URL created, length:', fileDataURL.length);
            
        } else {
            // HTML CODE PASTE MODE
            const htmlCode = document.getElementById('htmlCode').value.trim();
            console.log('HTML code length:', htmlCode.length);
            
            if (!htmlCode) {
                throw new Error('Please paste HTML code');
            }
            
            uploadProgress.textContent = 'Processing HTML...';
            console.log('Converting HTML to Data URL...');
            
            // Convert HTML text to Data URL
            const blob = new Blob([htmlCode], { type: 'text/html' });
            fileDataURL = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            
            fileSize = new Blob([htmlCode]).size;
            originalFilename = document.getElementById('fileName').value.trim() + '.html';
            console.log('HTML Data URL created, length:', fileDataURL.length);
        }
        
        uploadProgress.textContent = 'Uploading to database...';
        
        // Get form values with validation
        const fileNameValue = document.getElementById('fileName').value.trim();
        const fileTypeValue = document.getElementById('fileType').value;
        const allowDownloadValue = document.getElementById('allowDownload').checked;
        const allowCopyValue = document.getElementById('allowCopy').checked;
        const descriptionValue = document.getElementById('fileDescription').value.trim();
        
        console.log('Form values:', {
            fileName: fileNameValue,
            fileType: fileTypeValue,
            allowDownload: allowDownloadValue,
            allowCopy: allowCopyValue,
            mode: currentMode
        });
        
        // Validate required fields
        if (!fileNameValue) {
            throw new Error('File name is required');
        }
        
        if (!fileTypeValue) {
            throw new Error('File type could not be detected. Please select a valid file.');
        }
        
        const fileData = {
            file_name: fileNameValue,
            file_type: fileTypeValue,
            file_url: fileDataURL,
            file_size: fileSize,
            original_filename: originalFilename,
            allow_download: allowDownloadValue,
            allow_copy: allowCopyValue,
            description: descriptionValue,
            source_type: currentMode // Track if it's from file or code paste
        };
        
        console.log('File data prepared:', {
            file_name: fileData.file_name,
            file_type: fileData.file_type,
            file_size: fileData.file_size,
            original_filename: fileData.original_filename,
            dataURL_length: fileData.file_url.length
        });
        
        console.log('Sending POST request to tables/uploaded_files...');
        const response = await fetch('tables/uploaded_files', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fileData)
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed:', errorText);
            throw new Error('Failed to upload file: ' + errorText);
        }

        const result = await response.json();
        console.log('Upload successful:', result);
        
        uploadProgress.textContent = 'Success!';
        
        // Reset form
        setTimeout(() => {
            console.log('Resetting form...');
            document.getElementById('uploadForm').reset();
            document.getElementById('fileTypeDisplay').textContent = 'Not selected';
            document.getElementById('fileTypeDisplay').style.color = '#db8a70';
            document.getElementById('fileSizeDisplay').textContent = '-';
            document.getElementById('fileSizeDisplay').style.color = 'inherit';
            document.getElementById('htmlCode').value = ''; // Clear HTML textarea
            selectedFile = null;
            
            submitBtn.disabled = false;
            uploadBtnText.style.display = 'inline';
            uploadProgress.style.display = 'none';
            
            alert(currentMode === 'file' ? 'File uploaded successfully!' : 'HTML code saved successfully!');
            loadFiles();
        }, 1000);

    } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file: ' + error.message);
        
        submitBtn.disabled = false;
        uploadBtnText.style.display = 'inline';
        uploadProgress.style.display = 'none';
    }
});
console.log('Form submit handler attached');

// Preview file
function previewFile(fileId) {
    const viewerUrl = `file-viewer.html?fileId=${fileId}`;
    window.open(viewerUrl, '_blank', 'width=1200,height=800');
}

// Download file
function downloadFile(fileId) {
    const file = currentFiles.find(f => f.id === fileId);
    if (!file) return;
    
    // Create a download link
    const link = document.createElement('a');
    link.href = file.file_url; // Data URL
    link.download = file.original_filename || file.file_name + '.' + file.file_type;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Delete file
async function deleteFile(fileId) {
    const file = currentFiles.find(f => f.id === fileId);
    if (!file) return;
    
    if (!confirm(`Are you sure you want to delete "${file.file_name}"?`)) return;
    
    try {
        showLoading();
        const response = await fetch(`tables/uploaded_files/${fileId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete file');

        hideLoading();
        alert('File deleted successfully!');
        await loadFiles();
    } catch (error) {
        hideLoading();
        console.error('Error deleting file:', error);
        alert('Error deleting file. Please try again.');
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Loading screen functions
function showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
}
