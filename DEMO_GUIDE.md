# XCyber Insurance Questionnaire Platform - Demo Guide

## 🎯 Quick Start

### Demo Credentials

#### **Admin Account**
- **Email:** admin@xcyber.com
- **Password:** admin123
- **Access:** Full platform control, create questions, view all responses

#### **Insurance Agent Accounts**
1. **LIC Agent**
   - **Email:** agent.lic@xcyber.com
   - **Password:** agent123
   - **Provider:** LIC of India

2. **HDFC Agent**
   - **Email:** agent.hdfc@xcyber.com
   - **Password:** agent123
   - **Provider:** HDFC Life

3. **ICICI Agent**
   - **Email:** agent.icici@xcyber.com
   - **Password:** agent123
   - **Provider:** ICICI Prudential

#### **User (Client) Accounts**
1. **User 1**
   - **Email:** user1@example.com
   - **Password:** user123
   - **Status:** Has draft responses for LIC

2. **User 2**
   - **Email:** user2@example.com
   - **Password:** user123
   - **Status:** Submitted form for HDFC

3. **User 3**
   - **Email:** user3@example.com
   - **Password:** user123
   - **Status:** Has draft responses for ICICI

---

## 👑 Admin Features

### Dashboard
- View analytics across all providers
- See total users, agents, submitted and draft forms
- Provider-wise statistics with completion percentages
- Interactive charts showing user distribution

### Question Management
1. Select an insurance provider
2. Create sections (e.g., Personal Details, Health Information)
3. Add questions with multiple types:
   - Text, Textarea, Number, Date, Email, Phone
   - Multiple Choice (MCQ)
   - Checkbox
   - Dropdown
4. Set questions as required/optional
5. Delete sections and questions

### Response Management
- Filter responses by provider
- View draft and submitted responses separately
- See user contact details with each response
- Export responses to CSV (mock feature)

### User Management
- View all users and agents
- Search by name or email
- See which provider each agent is linked to
- Access contact information (email, phone)

---

## 🧑‍💼 Insurance Agent Features

### Dashboard
- View statistics for YOUR provider only
- See client count, submitted/draft forms
- Recent activity feed
- Response status chart

### Client Management
- View only clients who have filled YOUR provider's forms
- Access client contact details (email, phone)
- See response status (Draft/Submitted)
- Last activity timestamps

### Response Viewer
- View all responses for your provider
- Filter by status (All/Submitted/Draft)
- See individual client responses
- Export functionality

**Key Restriction:** Agents can ONLY see data for their assigned provider

---

## 👤 User (Client) Features

### Dashboard
- See available insurance providers (ONLY those with questions)
- View your form status for each provider:
  - Not Started (gray)
  - In Progress (orange)
  - Submitted (green)
- Quick stats: Available Forms, In Progress, Completed

### Form Filling Experience
1. Select a provider
2. Fill multi-section questionnaire
3. **Auto-save:** Your answers are saved automatically as you type
4. Navigate between sections with Previous/Next
5. Progress bar shows completion percentage
6. Resume anytime - your draft is preserved
7. Submit when complete

**Important Notes:**
- Forms auto-save every second after you stop typing
- You can logout and login - your progress persists
- Once submitted, forms cannot be edited
- Only providers with questions are shown

---

## 🔐 Core Business Rules (Implemented)

### Provider Visibility
✅ Users see ONLY providers that have questions  
✅ Providers without questions are hidden  
✅ SBI Life and Max Life have no questions and won't appear to users

### Data Isolation
✅ Agents can ONLY access their provider's data  
✅ No cross-provider data leakage  
✅ All queries filter by `insuranceProviderId`

### Auto-save & Resume
✅ Responses auto-save while typing  
✅ Draft state preserved on logout  
✅ Users can resume from where they left off  
✅ Submit functionality locks the form

### Role-Based Access
✅ Admin: Global access  
✅ Agent: Provider-scoped access  
✅ User: Can access any provider's form

---

## 🎨 UI/UX Highlights

- **Professional Design:** Clean blue and white theme
- **Responsive:** Works on desktop, tablet, and mobile
- **Real-time Feedback:** Toast notifications for all actions
- **Visual Status:** Color-coded badges (green=submitted, orange=draft)
- **Charts:** Interactive Recharts visualizations
- **Form UX:** Google Forms-like experience with auto-save

---

## 📊 Data Architecture

### Insurance Providers
- LIC of India ✅ Has questions
- HDFC Life ✅ Has questions
- ICICI Prudential ✅ Has questions
- SBI Life ❌ No questions (hidden from users)
- Max Life Insurance ❌ No questions (hidden from users)

### Sample Sections & Questions

**LIC of India:**
- Personal Details (7 questions)
- Health Information (6 questions)
- Financial Details (3 questions)

**HDFC Life:**
- Applicant Information (4 questions)
- Medical History (3 questions)

**ICICI Prudential:**
- Basic Information (3 questions)
- Lifestyle & Habits (2 questions)

---

## 🚀 Testing Scenarios

### Scenario 1: Admin Creates Questions
1. Login as admin@xcyber.com
2. Go to Questions page
3. Select "SBI Life" (currently has no questions)
4. Add a section: "Personal Info"
5. Add questions with different types
6. Logout and login as a user
7. Verify SBI Life now appears in user dashboard

### Scenario 2: User Fills Form
1. Login as user1@example.com
2. Select LIC of India
3. Fill section 1, then navigate to section 2
4. Logout (data is auto-saved)
5. Login again
6. Resume from section 2
7. Complete and submit

### Scenario 3: Agent Views Responses
1. Login as agent.lic@xcyber.com
2. View dashboard - see only LIC stats
3. Go to Users - see only LIC clients
4. Go to Responses - see only LIC submissions
5. Try to access HDFC data - not possible (data isolation)

### Scenario 4: Draft vs Submitted
1. Login as admin
2. View Responses for HDFC
3. See user2@example.com has submitted form (green badge)
4. View Responses for LIC
5. See user1@example.com has draft (orange badge)
6. Real-time status reflects in charts

---

## 💾 Data Persistence

- Uses **localStorage** for data persistence
- Auto-save triggers 1 second after user stops typing
- Responses stored with timestamps
- Session survives page refresh
- Data isolated by user and provider

---

## 🎯 Production Considerations

This is a frontend demo with mock data. For production:

1. **Backend Required:** Replace mock data with Supabase/PostgreSQL
2. **Row Level Security:** Implement proper RLS policies
3. **Authentication:** Use OAuth/JWT tokens
4. **File Upload:** Add document upload for insurance docs
5. **Email Notifications:** Notify agents when forms submitted
6. **Bulk Import:** CSV/Excel upload for questions
7. **Advanced Analytics:** More detailed reporting
8. **Audit Logs:** Track all data access
9. **Data Encryption:** Secure PII data
10. **Compliance:** GDPR, HIPAA compliance

---

## 🎬 Demo Flow

**Recommended Order:**
1. Start as **Admin** - explore dashboard and create a question
2. Switch to **Agent** - see provider-scoped view
3. Switch to **User** - fill a form and test auto-save
4. Back to **Admin** - view the draft response in real-time

---

**Built with:** React, TypeScript, Tailwind CSS, React Router, Recharts, Radix UI

**Note:** This is a demonstration platform. All data is stored locally in the browser.
