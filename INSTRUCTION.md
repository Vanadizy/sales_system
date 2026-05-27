
Build a professional enterprise-level Sales Management System (POS) frontend prototype using:

========================================================
TECH STACK
========================================================

- React.js
- Tailwind CSS
- React Router
- Context API or Zustand/Redux
- Node.js-ready architecture
- LocalStorage or IndexedDB for persistence
- jsPDF for PDF export
- xlsx library for Excel export
- Lucide React or Heroicons
- Responsive modern dashboard UI

IMPORTANT:
This is a FRONTEND-ONLY prototype but it must be structured professionally for future integration with:
- Node.js backend
- REST APIs
- PostgreSQL/MySQL/MongoDB
- Authentication services
- WebSocket realtime systems

The system must look like a real deployable enterprise application.

========================================================
CORE SYSTEM OVERVIEW
========================================================

Create a modern, scalable, responsive, realtime, multi-company and multi-branch POS / Sales Management System with:

- Multi-company architecture
- Multi-branch architecture
- Role-based access control
- Permission-based module access using checkboxes
- Company and branch switching
- Realtime frontend updates without refresh
- Persistent session and navigation state
- Professional dashboards
- Activity logging
- PDF and Excel report exports
- Responsive layouts
- HCI-compliant UX/UI
- Clean scalable architecture

========================================================
SYSTEM HIERARCHY
========================================================

The system hierarchy must support:

1. SYSTEM ADMINISTRATOR
   - Manages entire platform
   - Views registered companies
   - Views company owners
   - Views branches
   - Activates/deactivates companies

2. COMPANY ADMIN
   - Manages one company
   - Manages all branches under that company
   - Manages company users and permissions

3. BRANCH MANAGER
   - Manages assigned branch

4. STAFF / CASHIER / USER
   - Access only assigned branches and modules

========================================================
MULTI-COMPANY (MULTI-TENANT) REQUIREMENTS
========================================================

The system must support multiple companies.

Each company must have isolated data:
- Users
- Branches
- Products
- Inventory
- Sales
- Customers
- Suppliers
- Reports
- Logs
- Settings
- Roles
- Permissions

STRICT RULE:
No company data should ever mix with another company.

Every record must contain:
companyId

Example:
{
  id,
  companyId,
  ...
}

========================================================
MULTI-BRANCH REQUIREMENTS
========================================================

Each company can optionally have multiple branches.

Branch fields:
- Branch name
- Branch code
- Address/location
- Phone
- Manager
- Status

Branch-specific data:
- Products
- Stock
- Inventory
- Sales
- Customers
- Suppliers
- Logs
- Reports
- POS transactions

Every branch-level record must contain:
companyId
branchId

STRICT RULE:
No branch data should mix with another branch.

========================================================
FIRST-TIME APPLICATION FLOW
========================================================

STEP 1:
Show Login page.

STEP 2:
After login:
- If user belongs to one company:
  auto-select company
- If user belongs to multiple companies:
  show Company Selection page

STEP 3:
After company selection:
- If company has one branch:
  auto-select branch
- If multiple branches:
  show Branch Selection page

STEP 4:
If company profile does not exist:
show Company Setup page.

STEP 5:
Redirect user to dashboard.

Persist:
- Logged-in user
- Selected company
- Selected branch
- Last visited page

========================================================
COMPANY SETUP PAGE
========================================================

Fields:
- Company name
- Company logo
- Business type
- Address
- Phone
- Email
- Website
- Country
- Currency
- Tax/TIN number
- Receipt footer message

After saving:
- Save company
- Generate companyId
- Redirect to dashboard

========================================================
BRANCH SETUP PAGE
========================================================

Allow company admin to create branches.

Fields:
- Branch name
- Branch code
- Address
- Phone
- Branch manager
- Status

========================================================
AUTHENTICATION PROTOTYPE
========================================================

Create demo login system.

Each user must contain:
- Full name
- Username/email
- Password (mocked frontend)
- Role
- Assigned companies
- Assigned branches
- Permissions
- Status
- Avatar/profile image

Display logged in user:
“Welcome, Emmanuel Charles”

Persist login after refresh.

========================================================
ROLE-BASED ACCESS CONTROL (RBAC)
========================================================

Default roles:
- System Admin
- Company Admin
- Branch Manager
- Inventory Manager
- Accountant
- Cashier
- Viewer/User

========================================================
PERMISSION SYSTEM
========================================================

Create User & Permission Management page.

Permissions must be assigned using CHECKBOXES.

Example permissions:

Dashboard
[ ] View Dashboard

POS
[ ] Use POS
[ ] Apply Discount
[ ] Cancel Sale

Products
[ ] View Products
[ ] Add Product
[ ] Edit Product
[ ] Delete Product

Inventory
[ ] View Inventory
[ ] Add Inventory
[ ] Edit Inventory

Customers
[ ] View Customers
[ ] Add Customer
[ ] Edit Customer
[ ] Delete Customer

Suppliers
[ ] View Suppliers
[ ] Add Supplier
[ ] Edit Supplier
[ ] Delete Supplier

Reports
[ ] View Reports
[ ] Export PDF
[ ] Export Excel

Users
[ ] View Users
[ ] Add Users
[ ] Edit Users
[ ] Disable Users

Settings
[ ] Manage Settings

Logs
[ ] View Logs

========================================================
USER / STAFF MAPPING
========================================================

Company Admin must:
- Create users
- Assign role
- Assign companies
- Assign branches
- Assign permissions using checkboxes

Branch mapping example:
[ ] Head Office
[ ] Kariakoo Branch
[ ] Mlimani City Branch
[ ] Dodoma Branch

A user can:
- Be Admin in Company A
- Be Cashier in Company B
- Work in multiple branches

========================================================
PERMISSION RULES
========================================================

Sidebar must ONLY show:
- Allowed modules
- Allowed companies
- Allowed branches

Protected routes must block:
- Unauthorized company access
- Unauthorized branch access
- Unauthorized modules

Direct URL access must show:
“Access Denied”

Buttons like:
- Add
- Edit
- Delete
- Export
must appear ONLY if permission exists.

========================================================
COMPANY SWITCHER
========================================================

Add company switcher in navbar/sidebar.

Requirements:
- Show company logo
- Show company name
- Instant switching without refresh
- Persist selected company

========================================================
BRANCH SWITCHER
========================================================

Add branch switcher in navbar/sidebar.

Requirements:
- Show active branch
- Show active company
- Allow switching only to permitted branches
- Update all data instantly
- Persist selected branch

========================================================
SYSTEM ADMINISTRATOR PANEL
========================================================

Create separate System Admin area.

System Admin can:
- View all companies
- View company owners
- View company branches
- View total users
- Activate/deactivate companies
- Search/filter companies
- Export companies list
- View global logs

Dashboard cards:
- Total companies
- Active companies
- Inactive companies
- Total branches
- Total users
- Recent registrations

Company registration details:
- Company name
- Owner name
- Email
- Phone
- Registration date
- Number of branches
- Number of users
- Status

========================================================
MAIN DASHBOARD
========================================================

Create professional dashboard with:
- Statistic cards
- Charts
- Tables
- Recent transactions
- Alerts

Cards:
- Total sales
- Today sales
- Monthly sales
- Total products
- Low stock
- Customers
- Suppliers

Include:
- Sales chart
- Inventory summary
- Top products
- Recent activities

Dashboard must display:
- Company name
- Branch name
- Company logo
- Logged-in user name

========================================================
POS SALES PAGE
========================================================

Features:
- Product search
- Barcode input mockup
- Add to cart
- Quantity controls
- Discount
- Tax
- Multiple payment methods
- Receipt preview
- Save sale
- Print receipt
- Realtime totals

Realtime behavior:
- No refresh
- Instant updates
- Auto stock updates

========================================================
PRODUCTS / STOCK MODULE
========================================================

Features:
- Product table
- Product cards
- Add/Edit/Delete product
- Categories
- Search/filter
- Product images
- Stock quantity
- Low stock alerts
- Pagination

========================================================
INVENTORY MODULE
========================================================

Features:
- Add inventory
- Purchase cost
- Supplier assignment
- Inventory logs
- Inventory history
- Stock movement

========================================================
CUSTOMERS MODULE
========================================================

Features:
- Add customer
- Edit customer
- Purchase history
- Search/filter

========================================================
SUPPLIERS MODULE
========================================================

Features:
- Add supplier
- Edit supplier
- Supplier history
- Search/filter

========================================================
REPORTS MODULE
========================================================

Generate:
- Daily sales reports
- Weekly reports
- Monthly reports
- Yearly reports
- Inventory reports
- Low stock reports
- Customer reports
- Supplier reports
- User activity reports

EXPORTS:
- PDF
- Excel

PDF reports must contain:
- Company logo
- Company name
- Branch name
- Report title
- Generated by
- Generated date/time

========================================================
ACTIVITY LOGGING SYSTEM
========================================================

Create Logs page.

Log:
- Login
- Logout
- Product added
- Product edited
- Product deleted
- Inventory updated
- Sale completed
- Report exported
- User created
- User updated
- Permission changed
- Company switched
- Branch switched
- Settings updated

Each log must contain:
- Date/time
- User full name
- Company
- Branch
- Role
- Action
- Module
- Status

========================================================
SETTINGS MODULE
========================================================

General:
- Company profile
- Branch settings
- Currency
- Language
- Timezone

Appearance:
- Light mode
- Dark mode

POS:
- Receipt settings
- Tax settings

System:
- Export backup
- Reset demo data

========================================================
REALTIME FRONTEND REQUIREMENTS
========================================================

- No full page reloads
- Instant UI updates
- Persistent sessions
- Restore last visited route
- Restore company/branch state
- Realtime state synchronization

========================================================
RESPONSIVE DESIGN REQUIREMENTS
========================================================

DESKTOP:
- Fixed sidebar
- Top navbar

TABLET:
- Collapsible sidebar

MOBILE:
- Drawer sidebar
- Bottom navigation if needed

Requirements:
- Mobile-friendly forms
- Responsive tables/cards
- Touch-friendly buttons

========================================================
HCI (HUMAN COMPUTER INTERACTION) REQUIREMENTS
========================================================

Follow HCI principles:
- Simplicity
- Consistency
- Accessibility
- Minimal cognitive load
- Good spacing
- Clear navigation
- Readable typography
- High contrast
- Clear icons
- Feedback notifications
- Confirmation dialogs
- Loading states
- Empty states
- Error states

DO NOT overcrowd pages.

Use:
- Tabs
- Modals
- Drawers
- Pagination
- Cards
- Step forms

Compress secondary actions into understandable icons.

========================================================
DESIGN STYLE
========================================================

Use:
- Modern enterprise dashboard design
- Tailwind CSS
- Rounded cards
- Soft shadows
- Elegant tables
- Smooth animations
- Professional spacing
- Minimal clean appearance

========================================================
PROJECT STRUCTURE
========================================================

src/
│
├── components/
├── layouts/
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── companies/
│   ├── branches/
│   ├── pos/
│   ├── products/
│   ├── inventory/
│   ├── customers/
│   ├── suppliers/
│   ├── reports/
│   ├── users/
│   ├── logs/
│   ├── settings/
│   └── system-admin/
│
├── routes/
├── hooks/
├── context/
├── store/
├── services/
├── utils/
├── constants/
├── mockData/
├── assets/

========================================================
REUSABLE COMPONENTS
========================================================

Create reusable:
- Sidebar
- Navbar
- CompanySwitcher
- BranchSwitcher
- ProtectedRoute
- PermissionGate
- DataTable
- StatCard
- Modal
- Drawer
- Tabs
- FormInput
- CheckboxGroup
- Toast
- ConfirmDialog
- ReportExporter
- ReceiptPreview
- ActivityLogTable
- EmptyState
- LoadingSpinner

========================================================
DATA STRUCTURE
========================================================

Use:
companies[]
branches[]
users[]
roles[]
permissions[]
products[]
inventory[]
sales[]
customers[]
suppliers[]
logs[]
settings[]

Every company-level record:
companyId

Every branch-level record:
companyId
branchId

========================================================
SESSION STRUCTURE
========================================================

Store:
- currentUser
- activeCompanyId
- activeBranchId
- role
- permissions
- lastVisitedRoute

========================================================
FINAL REQUIREMENT
========================================================

Generate:
- Full React frontend prototype
- Production-style architecture
- Clean scalable code
- Mock data
- Demo authentication
- Fully responsive design
- Reusable components
- Enterprise-level UI
- Fully navigable system
- Professional dashboard
- Modern POS experience

The prototype must feel like a real enterprise SaaS POS platform ready for deployment and future backend integration.
```
