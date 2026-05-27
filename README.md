# Sales Management System

Multi-company and multi-branch sales management application built with React, Tailwind CSS, React Router, Recharts, jsPDF and SheetJS.

## Included Workflows

- Login, active company, active branch and navigation state persistence
- Company and branch-scoped products, inventory, sales, relationships, settings and logs
- Product management for general merchandise, electronics, phones and accessories with free-form categories
- Bulk product and inventory import from Excel or CSV files
- Automatically generated branch, product and invoice codes with optional product barcodes
- Company-user assignment for branch managers
- Point of sale invoice initiation with totals, optional tax, discounts and itemized invoice preview
- Finance / Accountant payment queue with stock reduction only after successful payment confirmation
- Immediate POS and Finance synchronization across separately signed-in browser tabs
- Return-to-POS handling for unpaid invoices, with product availability released for correction
- Template-style PDF and Excel downloads for individual sales invoices
- Dashboard charts, PDF/Excel reports, access permissions and platform administration

## Run Locally

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run lint
npm run build
npm run preview
```

## Sample Accounts

| Profile | Email | Password |
| --- | --- | --- |
| System administrator | `admin@salesmanagement.app` | `Admin123!` |
| Multi-company company admin / cashier | `emmanuel@axis.co.tz` | `Demo123!` |
| Single-branch cashier | `cashier@axis.co.tz` | `Demo123!` |
| Finance / accountant | `finance@axis.co.tz` | `Finance123!` |
| New company onboarding | `founder@new.co.tz` | `Start123!` |

## Data Storage

Records are persisted in browser local storage and the signed-in session is isolated per browser tab. Company-scoped records carry `companyId`, and operational records additionally carry `branchId`.

## Deployment

### Vercel

1. Push this directory to a Git repository.
2. Import the repository into Vercel.
3. Set framework preset to `Vite`, build command to `npm run build`, and output directory to `dist`.
4. Deploy. The included `vercel.json` enables React Router refreshes.

### Netlify

1. Import the repository in Netlify.
2. Set build command to `npm run build` and publish directory to `dist`.
3. Deploy. The included `public/_redirects` enables React Router refreshes.
