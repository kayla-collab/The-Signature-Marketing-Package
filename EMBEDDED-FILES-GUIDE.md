# Embedded Files Feature Guide

## Overview
The Signature Marketing Package platform now includes a comprehensive embedded file system that allows you to upload, manage, and embed files directly into your modules with full access control.

## Key Features

### 1. File Upload & Management
- Upload files via URL
- Support for multiple file types: HTML, PDF, DOCX, XLSX, PPTX
- Central file manager for all uploaded files
- Edit file settings at any time
- Preview files before assigning to modules

### 2. Access Control
Files can be configured with two types of access control:

**Downloadable Toggle**
- When enabled: Clients can download the file to their device
- When disabled: Clients can only view the file online (no download option)

**Copyable Toggle** (HTML files only)
- When enabled: Copy buttons in HTML files remain functional
- When disabled: Copy buttons are removed and content cannot be copied

### 3. File Viewer
Professional file viewer with:
- Zoom controls (50% - 200%)
- Full-screen viewing
- Download button (when enabled)
- Access notices for view-only files
- Context menu and keyboard shortcut blocking (when copy is disabled)

## How to Use

### Step 1: Upload a File

1. Log in as admin (kayla@kaylasierra.com)
2. Click "File Manager" in the sidebar
3. Fill out the upload form:
   - **File Name**: Display name (e.g., "Affiliate Recruitment Email Templates")
   - **File Type**: Select the file format
   - **File URL**: Direct URL to the file
   - **Allow Download**: Check if clients can download
   - **Allow Copy**: Check if clients can copy content (HTML only)
   - **Description**: Optional notes about the file

4. Click "Upload File"

### Step 2: Add File to a Module

1. Go to admin dashboard
2. Click "Manage Content"
3. Click "Add Content" button
4. Fill out the form:
   - **Module**: Select the target module
   - **Title**: Name for this content item
   - **Content Type**: Select "Embedded File"
   - **File**: Choose from your uploaded files dropdown
   - **Description**: Add instructions or context

5. Click "Save"

### Step 3: Client Views the File

When clients log in and access the module:
1. They see a "View File" button
2. Clicking opens the file in a new window with zoom controls
3. If download is enabled, they see a "Download" button
4. If download is disabled, they see a view-only notice

## File Types & Behaviors

### HTML Files
- Rendered directly in the viewer
- Zoom controls work perfectly
- Copy protection can be applied
- Best for: Email templates, formatted documents, interactive content

### PDF Files
- Displayed using browser's native PDF viewer
- Zoom controls available
- Download can be restricted
- Best for: Forms, worksheets, guides

### Office Documents (DOCX, XLSX, PPTX)
- Displayed using Google Docs Viewer
- Requires internet connection
- Download can be restricted
- Best for: Templates, spreadsheets, presentations

## Pre-Loaded Files

Your platform comes with two files already uploaded:

1. **Sponsorship Agreement Template** (DOCX)
   - View-only (no download)
   - Cannot be copied
   - Ready to assign to LinkedIn module

2. **Affiliate Recruitment Email Templates** (HTML)
   - View-only (no download)
   - Copy buttons enabled
   - Ready to assign to Affiliate Marketing module

## Best Practices

### Security
- Only enable download for files you want clients to keep
- Disable copy for proprietary content
- Use view-only mode for reference materials

### Organization
- Use clear, descriptive file names
- Add descriptions to help you remember file contents
- Preview files before assigning to modules

### Client Experience
- Add context in the content description
- Tell clients what to do with the file
- Group related files in the same module

## Access Control Examples

### Example 1: Proprietary Template
```
File: Email Sequence Template
Download: Disabled
Copy: Disabled
Use Case: Clients can view and learn structure, but must create their own
```

### Example 2: Client Deliverable
```
File: Brand Guidelines PDF
Download: Enabled
Copy: N/A (PDF)
Use Case: Clients can download and keep for reference
```

### Example 3: Interactive Tool
```
File: Content Calendar Template (HTML)
Download: Disabled
Copy: Enabled
Use Case: Clients can copy specific dates/ideas but can't download the framework
```

## Managing Existing Files

### Edit a File
1. Go to File Manager
2. Find the file in the table
3. Click "Edit"
4. Make your changes
5. Click "Update File"

### Delete a File
1. Go to File Manager
2. Find the file in the table
3. Click "Delete"
4. Confirm deletion

**Note**: Deleting a file will break any content items that reference it. Update those content items first.

### Preview a File
1. Go to File Manager
2. Find the file in the table
3. Click "Preview"
4. File opens in viewer (same view clients see)

## Troubleshooting

### File Won't Load
- Check that the file URL is publicly accessible
- Verify the file type matches the actual file format
- Try opening the URL directly in a new tab

### Copy Protection Not Working
- Copy protection only applies to HTML files
- Some browsers may bypass certain protections
- Consider watermarking sensitive content

### Google Docs Viewer Issues
- Office documents require Google Docs Viewer to be available
- File must be publicly accessible
- Large files may take longer to load

## Technical Details

### Database Structure
Files are stored in the `uploaded_files` table with:
- `id`: Unique identifier
- `file_name`: Display name
- `file_type`: Format (html, pdf, docx, etc.)
- `file_url`: Location of the file
- `allow_download`: Boolean for download permission
- `allow_copy`: Boolean for copy permission
- `description`: Optional notes

### Integration with Content System
- Embedded files use the "embedded_file" content type
- File ID is stored in `content_url` as: `file-viewer.html?fileId={id}`
- Client dashboard recognizes embedded files and renders view buttons
- File viewer loads file data from database and applies access controls

## Future Enhancements

Potential additions to the file system:
- Direct file upload (vs. URL input)
- File versioning and history
- Usage analytics (who viewed what)
- Expiring access links
- Password-protected files
- File annotations and notes

---

**Copyright © 2025 Kayla Sierra Consulting. All rights reserved.**
