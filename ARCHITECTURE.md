# XCyber Insurance Questionnaire Platform - Architecture

## 📁 Project Structure

```
/src/app/
├── App.tsx                     # Main app with providers and router
├── routes.tsx                  # React Router configuration
│
├── types/
│   └── index.ts               # TypeScript type definitions
│
├── data/
│   └── mockData.ts            # Mock database (providers, users, questions, responses)
│
├── context/
│   ├── AuthContext.tsx        # Authentication state & methods
│   └── DataContext.tsx        # Global data state & CRUD methods
│
├── components/
│   ├── Navbar.tsx             # Top navigation bar
│   ├── ProtectedRoute.tsx     # Route guard with role-based access
│   └── ui/                    # Radix UI components (pre-built)
│
└── pages/
    ├── Login.tsx              # Login page (all roles)
    ├── Register.tsx           # Registration page (all roles)
    │
    ├── admin/
    │   ├── Dashboard.tsx      # Admin analytics dashboard
    │   ├── Questions.tsx      # Question builder
    │   ├── Responses.tsx      # View all responses
    │   └── Users.tsx          # View all users/agents
    │
    ├── agent/
    │   ├── Dashboard.tsx      # Agent-scoped dashboard
    │   ├── Users.tsx          # Agent's clients only
    │   └── Responses.tsx      # Agent's provider responses
    │
    └── user/
        ├── Dashboard.tsx      # User provider selection
        └── Form.tsx           # Multi-section form with auto-save
```

---

## 🗄️ Data Model

### InsuranceProvider
```typescript
{
  id: string;
  name: string;
  logoUrl: string;
  createdAt: string;
}
```

### User
```typescript
{
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'admin' | 'agent' | 'user';
  insuranceProviderId?: string;  // Only for agents
  createdAt: string;
}
```

### Section
```typescript
{
  id: string;
  insuranceProviderId: string;
  title: string;
  order: number;
  createdAt: string;
}
```

### Question
```typescript
{
  id: string;
  sectionId: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[];  // For MCQ, Checkbox, Dropdown
  required: boolean;
  order: number;
  createdAt: string;
}
```

### Response
```typescript
{
  id: string;
  userId: string;
  insuranceProviderId: string;
  sectionId: string;
  questionId: string;
  answer: string | string[];
  isSubmitted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔄 Data Flow

### Authentication Flow
```
1. User enters credentials
2. AuthContext.login() validates against mockUsers
3. User object stored in localStorage
4. isAuthenticated set to true
5. Router redirects based on role
```

### Auto-Save Flow (User Form)
```
1. User types in form field
2. handleAnswerChange() updates local state
3. useEffect with 1-second debounce triggers
4. DataContext.saveResponse() called
5. Response created/updated in responses array
6. Responses synced to localStorage
7. Toast notification shown
```

### Data Isolation Flow (Agent)
```
1. Agent logs in
2. user.insuranceProviderId retrieved
3. All data queries filter by:
   - responses.filter(r => r.insuranceProviderId === user.insuranceProviderId)
   - sections.filter(s => s.insuranceProviderId === user.insuranceProviderId)
4. Agent only sees their provider's data
```

### Provider Visibility Flow (User)
```
1. User navigates to dashboard
2. DataContext.getProvidersWithQuestions() called
3. Logic:
   - Get all section IDs
   - Extract unique insuranceProviderId values
   - Filter providers to only those with sections
4. Only providers with questions displayed
```

---

## 🧩 Component Hierarchy

### Admin Routes
```
ProtectedRoute (allowedRoles: ['admin'])
├── Navbar
└── Outlet
    ├── AdminDashboard
    │   ├── Stats Cards
    │   ├── Bar Chart (Recharts)
    │   ├── Pie Chart (Recharts)
    │   └── Provider Stats Table
    │
    ├── AdminQuestions
    │   ├── Provider Select
    │   ├── Section Management
    │   │   ├── Add Section Dialog
    │   │   └── Section Cards
    │   │       └── Question List
    │   └── Add Question Dialog
    │
    ├── AdminResponses
    │   ├── Provider Filter
    │   └── Tabs (All/Submitted/Draft)
    │       └── Response Cards
    │
    └── AdminUsers
        ├── Search Input
        └── Tabs (Users/Agents)
            └── User Cards
```

### Agent Routes
```
ProtectedRoute (allowedRoles: ['agent'])
├── Navbar
└── Outlet
    ├── AgentDashboard
    │   ├── Stats Cards (Provider-scoped)
    │   ├── Bar Chart
    │   └── Recent Activity
    │
    ├── AgentUsers
    │   ├── Search Input
    │   └── Client Cards (Provider-scoped)
    │
    └── AgentResponses
        ├── Export Button
        └── Tabs (All/Submitted/Draft)
            └── Response Cards (Provider-scoped)
```

### User Routes
```
ProtectedRoute (allowedRoles: ['user'])
├── Navbar
└── Outlet
    ├── UserDashboard
    │   ├── Stats Cards
    │   ├── Provider Cards (Only with questions)
    │   └── Info Card
    │
    └── UserForm
        ├── Progress Bar
        ├── Section Navigation
        ├── Question Rendering
        │   ├── Text Input
        │   ├── Textarea
        │   ├── Number Input
        │   ├── Date Picker
        │   ├── Email Input
        │   ├── Phone Input
        │   ├── Radio Group (MCQ)
        │   ├── Checkbox Group
        │   └── Dropdown Select
        └── Navigation Buttons
```

---

## 🔐 Security Architecture

### Role-Based Access Control (RBAC)

```typescript
// ProtectedRoute enforces role access
<ProtectedRoute allowedRoles={['admin']} />

// Checks:
1. User is authenticated
2. User's role is in allowedRoles
3. If not, redirect to appropriate dashboard
```

### Data Filtering

```typescript
// Admin - No filtering
const allResponses = responses;

// Agent - Filter by provider
const agentResponses = responses.filter(
  r => r.insuranceProviderId === user.insuranceProviderId
);

// User - Filter by self
const userResponses = responses.filter(
  r => r.userId === user.id
);
```

### Route Guards

```typescript
// routes.tsx
{
  path: '/admin',
  element: <ProtectedRoute allowedRoles={['admin']} />,
  children: [...]
}

// Prevents URL manipulation
// Redirects unauthorized access
```

---

## 🎯 State Management Strategy

### Context Architecture

```
App
├── AuthProvider
│   └── Provides: user, login, register, logout, isAuthenticated
│
└── DataProvider
    └── Provides:
        ├── providers, sections, questions, responses
        ├── CRUD methods for each entity
        └── Computed data (stats, filtered lists)
```

### State Persistence

```typescript
// AuthContext
- Reads from: localStorage.getItem('xcyber_user')
- Writes to: localStorage.setItem('xcyber_user', ...)

// DataContext
- Reads from: localStorage.getItem('xcyber_responses')
- Writes to: localStorage.setItem('xcyber_responses', ...)
- Auto-syncs on responses change
```

### State Update Flow

```
User Action
    ↓
Component Handler
    ↓
Context Method
    ↓
State Update (useState)
    ↓
useEffect Trigger
    ↓
localStorage Sync
    ↓
Re-render Components
```

---

## 📊 Business Logic Layer

### Provider Visibility Logic

```typescript
getProvidersWithQuestions() {
  // Get all section provider IDs
  const providerIds = new Set(sections.map(s => s.insuranceProviderId));
  
  // Filter providers that have at least one section
  return providers.filter(p => providerIds.has(p.id));
}

// Result:
// ✅ LIC, HDFC, ICICI (have questions)
// ❌ SBI, Max Life (no questions - hidden from users)
```

### Response Status Logic

```typescript
getProviderStatus(providerId) {
  const responses = responsesByProvider[providerId] || [];
  
  if (responses.length === 0) return 'not-started';
  
  const allSubmitted = responses.every(r => r.isSubmitted);
  return allSubmitted ? 'submitted' : 'draft';
}
```

### Auto-Save Logic

```typescript
useEffect(() => {
  // Debounce: Wait 1 second after last keystroke
  const timer = setTimeout(() => {
    // Save all answers to DataContext
    Object.entries(answers).forEach(([questionId, answer]) => {
      saveResponse(userId, providerId, sectionId, questionId, answer);
    });
    
    // Show confirmation
    toast.success('Progress saved');
  }, 1000);

  // Cleanup timer on next change
  return () => clearTimeout(timer);
}, [answers]);
```

### Data Isolation Logic

```typescript
// Agent can ONLY access their provider's data
const myResponses = responses.filter(
  r => r.insuranceProviderId === user?.insuranceProviderId
);

const mySections = sections.filter(
  s => s.insuranceProviderId === user?.insuranceProviderId
);

const myUsers = users.filter(u => {
  return myResponses.some(r => r.userId === u.id);
});
```

---

## 🎨 UI/UX Patterns

### Consistent Card Pattern
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Status Badge Pattern
```tsx
{isSubmitted ? (
  <Badge className="bg-green-100 text-green-800">Submitted</Badge>
) : (
  <Badge className="bg-orange-100 text-orange-800">Draft</Badge>
)}
```

### Table Pattern
```tsx
<table className="w-full">
  <thead>
    <tr className="border-b">
      <th className="text-left py-3 px-4">Column</th>
    </tr>
  </thead>
  <tbody>
    {data.map(item => (
      <tr key={item.id} className="border-b hover:bg-gray-50">
        <td className="py-3 px-4">{item.value}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### Dialog Pattern
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button onClick={handleAction}>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🚀 Performance Considerations

### Debouncing
- Auto-save debounced to 1 second
- Prevents excessive localStorage writes
- Reduces re-renders

### Memoization Opportunities
```typescript
// Could be memoized for large datasets
const providerStats = useMemo(() => getProviderStats(), [responses]);
const filteredUsers = useMemo(() => 
  users.filter(u => u.name.includes(searchTerm)), 
  [users, searchTerm]
);
```

### Lazy Loading
- Form sections loaded on-demand
- Images lazy loaded with Unsplash
- Components code-split by route

### Local State
- Form answers stored in component state
- Only synced to global state on save
- Reduces context re-renders

---

## 🔧 Extensibility Points

### Adding New Question Type
```typescript
// 1. Add to QuestionType union
export type QuestionType = 'text' | 'textarea' | ... | 'signature';

// 2. Add rendering logic in UserForm.tsx
case 'signature':
  return <SignatureCanvas />;

// 3. Add to question type options in AdminQuestions.tsx
{ value: 'signature', label: 'Signature' }
```

### Adding New Role
```typescript
// 1. Add to Role union
export type Role = 'admin' | 'agent' | 'user' | 'manager';

// 2. Create route in routes.tsx
{
  path: '/manager',
  element: <ProtectedRoute allowedRoles={['manager']} />,
  children: [...]
}

// 3. Add to registration flow
// 4. Create manager pages
```

### Adding File Upload
```typescript
// 1. Add to Question type
interface Question {
  // ... existing fields
  attachmentUrl?: string;
}

// 2. Create FileUpload component
// 3. Add to renderQuestion() switch case
// 4. Store file reference in response
```

---

## 🧪 Testing Strategy (Recommended)

### Unit Tests
- Context methods (login, saveResponse, etc.)
- Utility functions (getProvidersWithQuestions)
- Component logic (auto-save debounce)

### Integration Tests
- Login flow → Dashboard redirect
- Form submission → Response storage
- Agent data isolation

### E2E Tests
- Complete user journey: Register → Fill Form → Submit
- Admin creates question → User sees it
- Agent views only their provider's data

---

## 📦 Dependencies

### Core
- react: 18.3.1
- react-router: 7.13.0
- typescript: (via Vite)

### UI
- @radix-ui/*: Various (Dialog, Select, etc.)
- lucide-react: 0.487.0
- tailwindcss: 4.1.12

### Charts
- recharts: 2.15.2

### Forms
- react-hook-form: 7.55.0

### Notifications
- sonner: 2.0.3

### Utils
- clsx: 2.1.1
- tailwind-merge: 3.2.0
- date-fns: 3.6.0

---

## 🔄 Migration Path (Mock → Production)

### Phase 1: Backend Setup
1. Setup Supabase project
2. Create database tables (providers, users, sections, questions, responses)
3. Configure Row Level Security (RLS) policies

### Phase 2: API Integration
1. Replace AuthContext with Supabase Auth
2. Replace DataContext methods with Supabase queries
3. Remove localStorage, use Supabase real-time

### Phase 3: Enhanced Features
1. File upload to Supabase Storage
2. Email notifications via Supabase Edge Functions
3. Advanced analytics with SQL views
4. Bulk import via CSV parser

### Phase 4: Production Hardening
1. Add error boundaries
2. Implement retry logic
3. Add loading skeletons
4. Optimize bundle size
5. Add monitoring (Sentry, LogRocket)

---

**Architecture Version:** 1.0.0  
**Last Updated:** February 4, 2026  
**Complexity:** Medium-High  
**Scalability:** Ready for backend integration
