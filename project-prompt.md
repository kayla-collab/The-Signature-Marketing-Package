# Project Prompt: The Signature Marketing Package Delivery Platform

## Project Overview
Build an embeddable HTML-based delivery platform for "The Signature Marketing Package" - a comprehensive marketing resource hub that clients can access after purchase. The platform must be client-friendly, professional, and easy to manage.

## Core Requirements

### 1. Authentication System
- **Client Login Portal**
  - Simple username/password authentication
  - Session persistence (stay logged in)
  - Secure password storage
  
- **Master Admin Access**
  - Master login for kayla@kaylasierra.com
  - Admin dashboard to:
    - Add new clients
    - Set/reset client passwords
    - Pre-fill custom content for each client
    - View client access logs (optional)
    - Enable/disable client access

### 2. Content Module System
Each module must be:
- **Fully Editable** (through admin interface)
- **Flexible Content Types** supporting:
  - Rich text explanations/descriptions
  - Video embeds (Zoom recordings with iframe thumbnails)
  - File download buttons (PDFs, templates, spreadsheets)
  - Direct text/HTML content insertion
  - Links to external resources
  
- **Collapsible/Expandable** sections for easy navigation
- **Progress Tracking** (mark sections as complete)

### 3. Package Content Modules

#### Module 1: YouTube Execution Assets
- 30-day posting calendar (viewable/downloadable)
- 3-5 complete video scripts
- 20+ ChatGPT prompts document
- YouTube optimization checklist
- Shorts strategy guide + 10 clip ideas
- Analytics dashboard guide

#### Module 2: Instagram Execution Assets
- 30-day posting calendar
- 10 carousel post templates
- 15+ ready-to-use captions
- 4-week Stories strategy
- Instagram engagement playbook
- Reel ideas guide

#### Module 3: LinkedIn Sponsorship Assets
- Complete outreach sequence
- 5 sponsorship pitch templates
- Email + LinkedIn message swipe files
- Sponsorship agreement template
- Sponsor benefits package outline

#### Module 4: Campus Club Partnership Assets
- Club outreach email template
- 60-minute workshop outline + speaker notes
- Email capture strategy
- Follow-up email sequence
- Post-workshop thank you template

#### Module 5: Affiliate Marketing Assets
- Complete affiliate program guide
- Recruitment email templates
- Affiliate onboarding package
- Tracking + payment management guide
- 10+ pitch variations

#### Module 6: Branding & Design Assets
- Brand color palette (with HEX codes)
- Canva template library (15+ graphics)
- YouTube banner template
- Instagram Stories template pack
- Social media header checklist

#### Module 7: Strategy & Operations
- 30-day implementation timeline
- Weekly progress tracker
- Decision-making framework
- FAQ + troubleshooting guide (50+ problems/solutions)
- Monthly content planning template
- Email copy + sequences

#### Module 8: Bonus - Personal Consultation Access
- Booking link for 30-minute strategy call
- Email support access information
- How to submit questions

### 4. Call-to-Action Pathways
Prominently display throughout the platform:

- **Book Marketing Deep Dive Call**
  - URL: https://wix.to/IYtKXqT
  - Context: "Need more strategy? Book a deep dive."
  
- **Join Coaching Program**
  - URL: https://www.kaylasierra.com/pricing-plans
  - Context: "Want ongoing support? Join my coaching program."
  
- **Leave a Review**
  - URL: https://fera.review/vb2
  - Context: "Loving your results? Share your experience!"

### 5. Design Specifications

#### Visual Style
- **Font**: Open Sans (all text)
- **Primary Accent Color**: #db8a70 (used for buttons, headings, highlights)
- **Background**: White (#FFFFFF)
- **Design Style**: Minimal, clean, professional
- **Responsive**: Must work on desktop, tablet, and mobile

#### UI/UX Guidelines
- Clean navigation sidebar or top menu
- Breadcrumb navigation within modules
- Search functionality (find specific resources)
- Visual progress indicators
- Smooth transitions and animations (subtle)
- Loading states for videos/downloads

### 6. Legal & Branding

#### Footer Requirements
```
© [Current Year] Kayla Sierra Consulting. All Rights Reserved.

DISCLAIMER: The strategies, templates, and recommendations provided in The Signature Marketing Package are for educational and consulting purposes only. Results may vary based on individual effort, market conditions, and business circumstances. Kayla Sierra Consulting does not guarantee specific outcomes or revenue results. All content is provided "as is" without warranty of any kind. By using these materials, you agree that Kayla Sierra Consulting is not liable for any decisions made or actions taken based on the information provided.
```

### 7. Technical Requirements

#### Data Storage
- Use the RESTful Table API for:
  - User authentication data
  - Client-specific content customization
  - Progress tracking
  - Access logs

#### File Management
- Support for file uploads (admin side)
- Secure download links with access control
- Video embed optimization (lazy loading)

#### Security
- Password hashing
- Session management
- CSRF protection for admin actions
- Access control (clients only see their content)

### 8. Admin Features Needed

#### Content Management
- WYSIWYG editor for text content
- Upload/link video files
- Upload downloadable files
- Reorder modules/sections
- Duplicate content across clients (with customization)

#### Client Management
- Add/remove clients
- Set access duration (optional expiration dates)
- View client progress
- Send notifications/updates

#### Analytics (Nice to Have)
- Most accessed modules
- Download tracking
- Video view counts
- Time spent on platform

## User Flow

### Client Experience
1. Receive login credentials via email
2. Log in to personalized dashboard
3. See welcome message + overview of package
4. Navigate through modules at own pace
5. Download resources, watch videos, read guides
6. Mark sections complete as they progress
7. Access CTAs for calls, coaching, reviews
8. Log out (session persists)

### Admin Experience
1. Log in with master credentials
2. Access admin dashboard
3. Add new client → set password → customize content
4. Pre-fill client-specific information
5. Upload new resources/templates
6. Monitor client progress
7. Update global content (affects all clients)

## Success Criteria
- Clients can easily find and access all materials
- Admin can add/manage clients in under 5 minutes
- Platform loads quickly (< 3 seconds)
- Mobile-friendly and accessible
- Professional appearance matching brand standards
- Secure and reliable authentication

## Deliverables
1. Embeddable HTML/CSS/JS files
2. Admin interface for content + client management
3. Client login portal
4. Responsive design across devices
5. Documentation for admin usage
6. README with setup instructions

---

**Primary Goal**: Create a premium, user-friendly delivery experience that makes clients feel supported and empowered to execute their marketing strategy while providing administrative ease for managing multiple clients with customized content.
