# Wooblet --- MVP Development Plan

> **Wooblet by WoobleWorks** --- a customizable 3D-printed NFC pet
> identification tag connected to an editable online pet profile.

**Core principle:** The NFC tag stores only a permanent Wooblet URL. Pet
and owner information lives in the application database and can be
updated without reprogramming the physical tag.

------------------------------------------------------------------------

## 1. MVP Objective

Wooblet V1 should prove the complete core flow:

**Sell → Pay → Produce → Activate → Identify → Reunite**

### Customer Flow

``` text
Browse Wooblet
    ↓
Choose Tag Design
    ↓
Customize Tag
    ↓
Add to Cart
    ↓
Checkout
    ↓
Receive Wooblet Order Number
    ↓
Pay using QR Ph
    ↓
Send Order Number + Payment Screenshot
to Official Wooblet Facebook Page
    ↓
Admin Verifies Payment
    ↓
Tag Enters Production
    ↓
NFC + QR Prepared
    ↓
Order Shipped
    ↓
Customer Receives Wooblet
    ↓
Tap NFC / Scan QR
    ↓
Login / Register
    ↓
Activate Wooblet
    ↓
Create or Select Pet
    ↓
Wooblet Active
```

### Finder Flow

``` text
Finder finds pet
    ↓
Taps NFC / Scans QR
    ↓
Public Wooblet Pet Profile
    ↓
Views permitted pet information
    ↓
Contacts Owner
    ↓
Optionally Shares Found Location
```

------------------------------------------------------------------------

## 2. Technology Stack

### Frontend

-   Next.js
-   TypeScript
-   Tailwind CSS
-   Redux Toolkit
-   RTK Query
-   React Hook Form
-   Zod

### Backend

-   NestJS
-   TypeScript
-   Mongoose
-   MongoDB
-   JWT authentication
-   Refresh tokens
-   `class-validator`
-   `class-transformer`
-   Swagger / OpenAPI

### Other Services

-   S3-compatible object storage for pet and product images
-   QR code generation
-   NFC using NDEF URL records
-   QR Ph manual payment for V1

------------------------------------------------------------------------

## 3. Repository Structure

Keep the frontend and backend as separate applications.

``` text
wooblet/
├── wooblet-web/
│   └── Next.js application
│
└── wooblet-api/
    └── NestJS application
```

Suggested initialization:

``` bash
mkdir wooblet
cd wooblet

npx create-next-app@latest wooblet-web
npx @nestjs/cli new wooblet-api
```

Use TypeScript in both projects.

------------------------------------------------------------------------

## 4. High-Level Architecture

``` text
                   WOOBLET
                      │
          ┌───────────┴───────────┐
          │                       │
       Next.js                  NestJS
       Frontend                  API
          │                       │
    Tailwind CSS             Controllers
    Redux Toolkit                │
      RTK Query               Services
          │                       │
          └────── REST API ───────┤
                                  │
                              Mongoose
                                  │
                               MongoDB
                                  │
                        ┌─────────┴─────────┐
                        │                   │
                     Database         Object Storage
                                            │
                                         Images
```

------------------------------------------------------------------------

## 5. Environment Configuration

Never commit production secrets.

### `wooblet-web/.env.local`

``` env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Configure when the official page exists.
NEXT_PUBLIC_FACEBOOK_URL=
```

### `wooblet-api/.env`

``` env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/wooblet

JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

FRONTEND_URL=http://localhost:3000

# Object storage
S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

Use long randomly generated secrets outside local development.

------------------------------------------------------------------------

# 6. Frontend Structure

Suggested Next.js App Router structure:

``` text
wooblet-web/src/

app/
├── page.tsx
│
├── shop/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
│
├── cart/
│   └── page.tsx
│
├── checkout/
│   └── page.tsx
│
├── order/
│   └── [orderNumber]/
│       └── page.tsx
│
├── t/
│   └── [token]/
│       └── page.tsx
│
├── login/
│   └── page.tsx
│
├── register/
│   └── page.tsx
│
├── dashboard/
│   ├── page.tsx
│   ├── pets/
│   ├── wooblets/
│   ├── orders/
│   └── settings/
│
└── admin/
    ├── page.tsx
    ├── orders/
    ├── products/
    ├── customers/
    └── wooblets/

components/
├── ui/
├── layout/
├── pets/
├── wooblets/
├── products/
├── checkout/
└── finder/

store/
├── store.ts
├── provider.tsx
└── features/
    ├── cart/
    ├── auth/
    └── ui/

services/
└── api/
    ├── baseApi.ts
    ├── authApi.ts
    ├── petsApi.ts
    ├── tagsApi.ts
    ├── productsApi.ts
    ├── ordersApi.ts
    └── adminApi.ts

hooks/
types/
utils/
```

------------------------------------------------------------------------

# 7. Redux Strategy

Do not copy all backend data into ordinary Redux slices.

## Redux Toolkit

Use normal slices for client/global state such as:

-   Shopping cart
-   Checkout state
-   Authentication/UI state where appropriate
-   Global modal/navigation state

## RTK Query

Use RTK Query for server resources:

-   `authApi`
-   `petsApi`
-   `tagsApi`
-   `productsApi`
-   `ordersApi`
-   `usersApi`
-   `adminApi`

RTK Query should own fetching, caching, loading states and invalidation
for API resources.

------------------------------------------------------------------------

# 8. Backend Structure

Suggested NestJS structure:

``` text
wooblet-api/src/

auth/
├── dto/
├── guards/
├── strategies/
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts

users/
pets/
tags/
products/
orders/
payments/
scans/
finder-reports/
uploads/
admin/

common/
├── decorators/
├── guards/
├── filters/
├── interceptors/
├── pipes/
└── enums/

config/

app.module.ts
main.ts
```

Each feature should generally follow:

``` text
pets/
├── dto/
│   ├── create-pet.dto.ts
│   └── update-pet.dto.ts
├── schemas/
│   └── pet.schema.ts
├── pets.controller.ts
├── pets.service.ts
└── pets.module.ts
```

------------------------------------------------------------------------

# 9. MongoDB Collections

Initial collections:

``` text
users
pets
tags
products
orders
scanEvents
finderReports
```

Additional collections can be introduced when genuinely needed.

------------------------------------------------------------------------

# 10. User Model

Example fields:

``` ts
User {
  _id
  email
  passwordHash
  firstName
  lastName
  phone

  role: "USER" | "ADMIN"

  emailVerified
  createdAt
  updatedAt
}
```

Do not return `passwordHash` through API responses.

------------------------------------------------------------------------

# 11. Pet Model

``` ts
Pet {
  _id
  ownerId

  name
  species
  breed
  sex
  birthday
  colorMarkings
  photoUrl

  medical: {
    allergies
    conditions
    medications
    specialInstructions
  }

  contact: {
    ownerName
    phone
    alternatePhone
    email
    emergencyContact
  }

  privacy: {
    showPhoto
    showBreed
    showSex
    showAge
    showOwnerName
    showPhone
    showMedicalNotes
    showEmergencyContact
  }

  lostMode: {
    active
    message
    lastSeenAt
    lastSeenLocation
    rewardMessage
  }

  createdAt
  updatedAt
}
```

Most medical/contact fields should be optional.

------------------------------------------------------------------------

# 12. Wooblet Tag Model

Keep the physical tag separate from the pet.

``` ts
WoobletTag {
  _id

  tagCode
  publicToken
  activationCodeHash

  ownerId
  petId

  status:
    "UNASSIGNED" |
    "UNCLAIMED" |
    "ACTIVE" |
    "DISABLED" |
    "REPLACED"

  activatedAt
  replacedByTagId

  createdAt
  updatedAt
}
```

### Important

Do **not** use MongoDB `_id` as the public NFC identifier.

Generate a cryptographically secure random `publicToken`.

Example:

``` text
Tag Code:
WB-X7K92P

Public Token:
K7mx92QaP3

Activation Code:
482913

Public URL:
https://wooblet.ph/t/K7mx92QaP3
```

Store a hash of the activation code rather than the plaintext code where
practical.

------------------------------------------------------------------------

# 13. Product Model

``` ts
Product {
  _id

  name
  slug
  description

  basePrice

  images[]

  availableColors[]
  availableFonts[]

  active

  createdAt
  updatedAt
}
```

Possible initial products:

-   Paw
-   Bone
-   Heart
-   Classic Round
-   Cat

------------------------------------------------------------------------

# 14. Order Model

``` ts
Order {
  _id
  orderNumber
  userId

  customer: {
    fullName
    email
    phone
  }

  shippingAddress: {
    addressLine
    barangay
    cityMunicipality
    province
    postalCode
    notes
  }

  items: [
    {
      productId
      productName
      quantity
      unitPrice

      customization: {
        primaryColor
        secondaryColor
        petName
        font
      }

      tagIds[]
    }
  ]

  subtotal
  shippingFee
  total

  payment: {
    method: "QRPH"

    status:
      "AWAITING_PAYMENT" |
      "PAYMENT_VERIFICATION" |
      "PAID" |
      "PAYMENT_ISSUE"

    verifiedAt
    verifiedBy
  }

  status:
    "AWAITING_PAYMENT" |
    "PAID" |
    "IN_PRODUCTION" |
    "READY_TO_SHIP" |
    "SHIPPED" |
    "COMPLETED" |
    "CANCELLED"

  createdAt
  updatedAt
}
```

------------------------------------------------------------------------

# 15. Scan Event Model

A scan event represents access to a public Wooblet profile.

``` ts
ScanEvent {
  _id
  tagId

  eventType: "PROFILE_VIEW"

  createdAt
}
```

Do not silently treat a page view as a precise finder location.

------------------------------------------------------------------------

# 16. Finder Report Model

Location sharing must be an explicit finder action.

``` ts
FinderReport {
  _id
  tagId
  petId

  location: {
    latitude
    longitude
    accuracy
  }

  message

  createdAt
}
```

Only create a precise location report after the finder explicitly
chooses to share their location and grants browser permission.

------------------------------------------------------------------------

# 17. Authentication

Use:

**JWT access token + refresh token**

Roles:

``` text
USER
ADMIN
```

Required functionality:

-   Register
-   Login
-   Logout
-   Refresh session
-   Email verification
-   Forgot password
-   Reset password

Protected NestJS routes should verify both authentication and resource
ownership.

Admin routes additionally require the `ADMIN` role.

------------------------------------------------------------------------

# 18. Core API

Use a common prefix such as:

``` text
/api
```

## Authentication

``` http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

## Pets

``` http
GET    /api/pets
POST   /api/pets
GET    /api/pets/:id
PATCH  /api/pets/:id
DELETE /api/pets/:id
```

## Wooblets

``` http
GET   /api/tags
GET   /api/tags/:id
POST  /api/tags/:id/activate
PATCH /api/tags/:id/pet
```

## Public Wooblet

``` http
GET  /api/public/tags/:token
POST /api/public/tags/:token/found-location
```

The public endpoint must return only fields allowed by the pet's privacy
settings.

## Products

``` http
GET /api/products
GET /api/products/:slug
```

## Orders

``` http
POST /api/orders
GET  /api/orders
GET  /api/orders/:orderNumber
```

## Admin

``` http
GET   /api/admin/orders
GET   /api/admin/orders/:id

PATCH /api/admin/orders/:id/status
PATCH /api/admin/orders/:id/payment

POST  /api/admin/tags
POST  /api/admin/tags/batch
PATCH /api/admin/tags/:id/status

GET   /api/admin/users
GET   /api/admin/finder-reports
```

Document APIs with Swagger/OpenAPI.

------------------------------------------------------------------------

# 19. Public Website

## Home --- `/`

Suggested sections:

1.  Hero
2.  What is Wooblet?
3.  How it works
4.  Benefits
5.  Available tag designs
6.  NFC + QR explanation
7.  Lost Mode
8.  FAQ
9.  CTA
10. Footer

Suggested brand positioning:

> **Wooblet**\
> Your pet's little link home.

------------------------------------------------------------------------

# 20. Shop

Route:

``` text
/shop
```

Display available Wooblet designs.

Each product links to:

``` text
/shop/[slug]
```

------------------------------------------------------------------------

# 21. Product Customization

MVP customization:

-   Design
-   Primary color
-   Secondary color
-   Pet name
-   Font
-   Quantity

A static/image preview is sufficient for V1.

A live 3D preview can be added later.

------------------------------------------------------------------------

# 22. Cart

Cart should support:

-   Add product
-   Remove product
-   Update quantity
-   Review customization
-   Calculate subtotal

Store cart state using Redux Toolkit.

------------------------------------------------------------------------

# 23. Checkout

Collect:

## Contact

-   Full name
-   Email
-   Phone

## Shipping

-   Address line
-   Barangay
-   City/Municipality
-   Province
-   Postal code
-   Delivery notes

Display final order summary before submission.

When the user places the order, NestJS generates an immutable,
human-readable order number.

Example:

``` text
WB-2026-001024
```

------------------------------------------------------------------------

# 24. QR Ph Payment Flow

Wooblet V1 uses manual QR Ph verification.

After successful checkout, redirect to:

``` text
/order/WB-2026-001024
```

Example screen:

``` text
🐾 Thank you for your order!

WOOBLET ORDER NUMBER

WB-2026-001024

Total
₱698.00

Payment Status
🟡 Awaiting Payment

HOW TO PAY

1. Scan the official Wooblet QR Ph code.
2. Pay the exact amount shown above.
3. Take a screenshot of the successful payment.
4. Message the official Wooblet Facebook Page.
5. Send:
   • Wooblet Order Number
   • Payment screenshot

Your order will be processed after
payment has been verified.

[ Message Wooblet on Facebook ]
```

The Wooblet order number is **not** the QR Ph transaction/reference
number.

------------------------------------------------------------------------

# 25. Order Lifecycle

``` text
AWAITING_PAYMENT
       ↓
PAYMENT_VERIFICATION
       ↓
PAID
       ↓
IN_PRODUCTION
       ↓
READY_TO_SHIP
       ↓
SHIPPED
       ↓
COMPLETED
```

Exceptional states:

``` text
PAYMENT_ISSUE
CANCELLED
```

Admin manually verifies the payment received through QR Ph/Facebook.

------------------------------------------------------------------------

# 26. Customer Dashboard

Route:

``` text
/dashboard
```

Sections:

-   My Pets
-   My Wooblets
-   My Orders
-   Account Settings

Example:

``` text
Welcome 👋

MY PETS

┌────────────────────────────┐
│ 🐶 Cooper                  │
│ Golden Retriever           │
│                            │
│ 🟢 Wooblet Active          │
│                            │
│ [View] [Manage]            │
└────────────────────────────┘

+ Add Pet
```

------------------------------------------------------------------------

# 27. Pet Management

Users can:

-   Create pet
-   View pet
-   Edit pet
-   Delete pet
-   Upload/change photo
-   Configure privacy
-   Enable/disable Lost Mode
-   See linked Wooblets

------------------------------------------------------------------------

# 28. Privacy Controls

Example:

``` text
PUBLIC PROFILE

Pet Photo               ON
Pet Name                ON
Breed                   ON
Sex                     ON
Age                     ON

Owner Name              OFF
Phone Number            OFF

Medical Notes           ON
Emergency Contact       OFF
```

Sensitive information should be private by default where appropriate.

Do not expose a customer's shipping/home address on the public pet
profile.

------------------------------------------------------------------------

# 29. NFC Design

The NFC chip stores only the public URL.

Example NDEF URL:

``` text
https://wooblet.ph/t/K7mx92QaP3
```

It does **not** store:

-   Pet name
-   Phone number
-   Owner name
-   Address
-   Medical information

This allows the owner to change information without reprogramming the
tag.

------------------------------------------------------------------------

# 30. QR Backup

Generate a QR code containing the same public URL:

``` text
NFC ───┐
       ├──► https://wooblet.ph/t/K7mx92QaP3
QR ────┘
```

The physical tag should ideally include both.

------------------------------------------------------------------------

# 31. Tag Activation

A newly manufactured tag starts as:

``` text
UNCLAIMED
```

When its URL is opened:

``` text
🐾 Welcome to Wooblet

This Wooblet hasn't been activated yet.

[ Activate My Wooblet ]
```

Activation flow:

``` text
Tap Wooblet
    ↓
Login / Register
    ↓
Enter Activation Code
    ↓
Validate Code
    ↓
Create or Select Pet
    ↓
Link Tag to Pet
    ↓
Invalidate Activation Code
    ↓
Status = ACTIVE
```

------------------------------------------------------------------------

# 32. Public Finder Profile

Route:

``` text
/t/[publicToken]
```

No account should be required.

This page must be mobile-first and fast.

Example:

``` text
          🐶

        COOPER

     🚨 I'M LOST

Golden Retriever • Male

Hi! I'm Cooper.

If you've found me,
please contact my family.

┌─────────────────────────┐
│    📞 CONTACT OWNER     │
└─────────────────────────┘

┌─────────────────────────┐
│ 📍 SHARE FOUND LOCATION │
└─────────────────────────┘

IMPORTANT

⚕ Allergic to chicken

🐾 Wooblet
Your pet's little link home.
```

Only fields permitted by the owner's privacy settings should be
returned/displayed.

------------------------------------------------------------------------

# 33. Lost Mode

Owner can select:

``` text
Mark as Lost
```

Optional Lost Mode fields:

-   Last seen date/time
-   General last-seen location
-   Message
-   Special instructions
-   Reward message

When enabled:

``` text
lostMode.active = true
```

Public profile prominently displays:

``` text
🚨 I'M LOST
```

After recovery:

``` text
Mark as Safe
```

------------------------------------------------------------------------

# 34. Share Found Location

The finder can voluntarily select:

``` text
📍 Share Where You Found Me
```

Before requesting browser geolocation, explain what will happen.

Example:

> Your current location will be shared with the pet's owner to help them
> locate their pet.

Flow:

``` text
Finder
   ↓
Share Location
   ↓
Consent explanation
   ↓
Browser Geolocation Permission
   ↓
Latitude / Longitude
   ↓
NestJS
   ↓
FinderReport
   ↓
MongoDB
   ↓
Owner Dashboard
```

Never collect precise finder location without explicit consent.

------------------------------------------------------------------------

# 35. Multiple Wooblets Per Pet

The data model must allow:

``` text
COOPER
 │
 ├── Wooblet #1 — Main Collar
 ├── Wooblet #2 — Harness
 └── Wooblet #3 — Replacement
```

Do not enforce a one-pet-to-one-tag relationship.

------------------------------------------------------------------------

# 36. Replacement Tags

When a tag is replaced:

``` text
Old Tag
ACTIVE → REPLACED

New Tag
UNCLAIMED → ACTIVE
```

The new tag links to the existing pet profile.

The owner should not need to recreate pet information.

------------------------------------------------------------------------

# 37. Admin Dashboard

Route:

``` text
/admin
```

Require authenticated `ADMIN` access.

Sections:

-   Dashboard
-   Orders
-   Products
-   Customers
-   Pets
-   Wooblets
-   Finder Reports

------------------------------------------------------------------------

# 38. Admin Order Management

Example:

``` text
ORDER
WB-2026-001024

Customer
Juan Dela Cruz

2 × Wooblet Paw

Total
₱698.00

PAYMENT
🟡 Awaiting Payment

[ VERIFY PAYMENT ]

PRODUCTION
○ Not Started
```

After manually checking the payment receipt:

``` text
payment.status = PAID
payment.verifiedAt = current timestamp
payment.verifiedBy = admin user
```

Then move the order into production.

------------------------------------------------------------------------

# 39. Admin Wooblet Management

Admin can:

-   Create Wooblet
-   Generate tag batches
-   Generate/download QR
-   View tag status
-   View linked owner
-   View linked pet
-   Disable tag
-   Replace tag
-   Reassign where permitted

Example:

``` text
WB-X7K92P

Status
🟢 ACTIVE

Pet
Cooper

Public URL
https://wooblet.ph/t/K7mx92QaP3

[ Generate QR ]
[ Disable ]
[ Replace ]
```

------------------------------------------------------------------------

# 40. Batch Tag Generation

Admin should eventually be able to generate inventory before orders
arrive.

Example:

``` text
Generate Wooblets

Quantity: 50

[ GENERATE ]
```

Produces:

``` text
WB-000001
WB-000002
WB-000003
...
WB-000050
```

Each gets its own:

-   Tag code
-   Public token
-   Activation code
-   Public URL
-   QR code

The NFC chip is programmed with the corresponding public URL.

------------------------------------------------------------------------

# 41. Core Relationships

``` text
USER
 │
 ├──────── PET
 │           │
 │           └──────── WOOBLET TAG
 │                       │
 │                       ├── SCAN EVENTS
 │                       └── FINDER REPORTS
 │
 └──────── ORDER
              │
              └── ORDER ITEMS
                       │
                       └── WOOBLET TAG(S)

PRODUCT
 │
 └── PRODUCT CONFIGURATION
```

The central model is:

``` text
User → Pet → Wooblet Tag
```

not:

``` text
Wooblet Tag → Embedded Pet Data
```

------------------------------------------------------------------------

# 42. Security Checklist

Before production:

-   [ ] Hash passwords with a suitable password hashing algorithm
-   [ ] Hash/protect activation codes
-   [ ] Use secure refresh-token handling
-   [ ] Rate-limit login/authentication endpoints
-   [ ] Rate-limit sensitive public endpoints where appropriate
-   [ ] Validate every NestJS DTO
-   [ ] Verify resource ownership before updates/deletes
-   [ ] Protect admin routes
-   [ ] Generate cryptographically random public tokens
-   [ ] Never expose activation codes through public endpoints
-   [ ] Avoid exposing MongoDB IDs unnecessarily
-   [ ] Validate image MIME type and size
-   [ ] Restrict CORS to expected origins
-   [ ] Use HTTPS in production
-   [ ] Keep secrets in environment variables
-   [ ] Add database backups
-   [ ] Add application logging
-   [ ] Add error monitoring
-   [ ] Add privacy policy
-   [ ] Add terms of service
-   [ ] Test NFC links on iPhone and Android
-   [ ] Test QR fallback
-   [ ] Test public profile without authentication

------------------------------------------------------------------------

# 43. Development Roadmap

## Phase 1 --- Foundation

Goal: frontend and backend communicate successfully.

-   [ ] Create Git repository
-   [ ] Initialize Next.js
-   [ ] Initialize NestJS
-   [ ] Configure TypeScript
-   [ ] Configure Tailwind CSS
-   [ ] Configure MongoDB
-   [ ] Configure Mongoose
-   [ ] Add environment configuration
-   [ ] Configure CORS
-   [ ] Add `/api` prefix
-   [ ] Configure Swagger
-   [ ] Install Redux Toolkit
-   [ ] Configure RTK Query
-   [ ] Create basic frontend layout
-   [ ] Create health-check endpoint

**Success check:** Next.js can call NestJS and NestJS can read/write
MongoDB.

------------------------------------------------------------------------

## Phase 2 --- Authentication

-   [ ] User schema
-   [ ] Register
-   [ ] Login
-   [ ] Access JWT
-   [ ] Refresh token
-   [ ] Logout
-   [ ] Authentication guard
-   [ ] Role guard
-   [ ] Email verification
-   [ ] Forgot/reset password
-   [ ] Protected frontend dashboard

**Success check:** a user can register, log in and open a protected
dashboard.

------------------------------------------------------------------------

## Phase 3 --- Pet Profiles

-   [ ] Pet schema
-   [ ] Create pet
-   [ ] List user's pets
-   [ ] View pet
-   [ ] Edit pet
-   [ ] Delete pet
-   [ ] Photo upload
-   [ ] Contact fields
-   [ ] Medical fields
-   [ ] Privacy settings
-   [ ] Lost Mode fields

**Success check:** a logged-in owner can completely create and maintain
a pet profile.

------------------------------------------------------------------------

## Phase 4 --- Wooblet Core

-   [ ] Tag schema
-   [ ] Secure public-token generator
-   [ ] Activation-code generator
-   [ ] Tag-code generator
-   [ ] Create tag
-   [ ] Generate QR
-   [ ] Activation endpoint
-   [ ] Link tag to pet
-   [ ] Tag ownership validation
-   [ ] Public tag lookup
-   [ ] Program physical NFC test tag

**Success check:**

``` text
Create Tag
→ Write URL to NFC
→ Tap Phone
→ Open Wooblet
→ Activate
→ Link Pet
→ Tap Again
→ Display Pet
```

This is the first major MVP milestone.

------------------------------------------------------------------------

## Phase 5 --- Finder Experience

-   [ ] Public pet page
-   [ ] Mobile-first design
-   [ ] Privacy filtering
-   [ ] Contact Owner
-   [ ] Lost Mode presentation
-   [ ] Scan events
-   [ ] Share Found Location
-   [ ] Finder report
-   [ ] Owner view of finder reports

**Success check:** a person with no account can tap the tag, see the
safe public profile, contact the owner and voluntarily share a location.

------------------------------------------------------------------------

## Phase 6 --- Admin

-   [ ] Admin dashboard
-   [ ] Admin authentication/authorization
-   [ ] List customers
-   [ ] List pets
-   [ ] List tags
-   [ ] Create tag
-   [ ] Batch tag generation
-   [ ] Generate QR
-   [ ] Disable tag
-   [ ] Replace tag
-   [ ] Finder reports

**Success check:** Wooblet operations can be managed without directly
editing MongoDB.

------------------------------------------------------------------------

## Phase 7 --- Store

-   [ ] Product schema
-   [ ] Product listing
-   [ ] Product page
-   [ ] Color selection
-   [ ] Font selection
-   [ ] Pet-name customization
-   [ ] Cart
-   [ ] Cart totals
-   [ ] Checkout
-   [ ] Shipping information
-   [ ] Order creation
-   [ ] Customer order history

**Success check:** a customer can customize a Wooblet and successfully
create an order.

------------------------------------------------------------------------

## Phase 8 --- QR Ph Payment

-   [ ] Order number generator
-   [ ] QR Ph payment screen
-   [ ] Official Facebook CTA
-   [ ] Awaiting-payment state
-   [ ] Admin payment verification
-   [ ] Payment audit fields
-   [ ] Production status
-   [ ] Shipping status
-   [ ] Customer order-status page

**Success check:**

``` text
Checkout
→ WB Order Number
→ QR Ph Instructions
→ Customer Sends Receipt
→ Admin Verifies
→ Paid
→ In Production
→ Shipped
```

------------------------------------------------------------------------

## Phase 9 --- Production Hardening

-   [ ] Security review
-   [ ] Error handling
-   [ ] Rate limiting
-   [ ] Logging
-   [ ] Monitoring
-   [ ] Backups
-   [ ] SEO
-   [ ] Metadata/social sharing
-   [ ] Accessibility checks
-   [ ] Responsive testing
-   [ ] Browser testing
-   [ ] iPhone NFC testing
-   [ ] Android NFC testing
-   [ ] QR testing
-   [ ] Privacy policy
-   [ ] Terms
-   [ ] Deployment
-   [ ] Production domain
-   [ ] HTTPS

------------------------------------------------------------------------

# 44. Recommended First Coding Sprint

Do **not** start with checkout.

The first sprint should prove the core technical concept.

### Sprint 1

1.  Create `wooblet-web`
2.  Create `wooblet-api`
3.  Connect NestJS to MongoDB
4.  Configure Swagger
5.  Configure Tailwind
6.  Configure Redux Toolkit + RTK Query
7.  Build registration/login
8.  Build basic dashboard
9.  Build `Pet` schema
10. Build Create Pet
11. Build Edit Pet
12. Build `WoobletTag` schema
13. Generate a public token
14. Create `/api/public/tags/:token`
15. Create `/t/[token]`
16. Program one NFC tag with the URL
17. Tap it with a real phone

The milestone is:

``` text
Physical NFC Tag
       ↓
Phone
       ↓
Next.js Public Route
       ↓
NestJS API
       ↓
MongoDB
       ↓
Pet Profile
```

Once this works, the core Wooblet concept is technically proven.

------------------------------------------------------------------------

# 45. Wooblet V1 Definition of Done

Wooblet V1 is complete when this entire journey works:

``` text
CUSTOMER

Browse
  ↓
Customize Wooblet
  ↓
Add to Cart
  ↓
Checkout
  ↓
Receive Wooblet Order Number
  ↓
Pay QR Ph
  ↓
Send Order Number + Receipt
  ↓
Admin Verifies Payment
  ↓
Production
  ↓
NFC + QR Programmed
  ↓
Shipping
  ↓
Customer Receives Wooblet
  ↓
Register / Login
  ↓
Create Pet
  ↓
Activate Tag
  ↓
Link Wooblet to Pet


FINDER

Finds Pet
  ↓
Tap NFC / Scan QR
  ↓
Public Pet Profile
  ↓
Contact Owner
  ↓
Optional Share Location


OWNER

Login
  ↓
Edit Pet Information
  ↓
Save
  ↓
Same Physical Wooblet
Immediately Shows Updated Information
```

------------------------------------------------------------------------

# 46. Out of Scope for V1

Do not block launch on these features:

-   GPS
-   LoRa
-   Native iOS/Android apps
-   Automated QR Ph payment processing
-   Subscription plans
-   Live tracking
-   AI features
-   Vet integrations
-   Vaccination management
-   Advanced analytics
-   Bluetooth tracking
-   Crowdsourced tracking network
-   Complex 3D product configurator

These can be considered after the NFC product has real customers.

------------------------------------------------------------------------

# 47. Immediate Next Step

Start with the core infrastructure and **one physical NFC prototype**.

The first technical target is not the complete ecommerce website.

It is:

> **Tap a real Wooblet NFC tag with a phone and successfully load an
> editable pet profile from the Wooblet database.**

Once that works reliably, build the commerce and operational workflows
around it.
