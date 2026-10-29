# VevahaMatrimony — Backoffice Admin Portal (v2.4)

An interactive, high-fidelity administrative dashboard built for **[VevahaMatrimony](https://www.vevahamatrimony.com/)**, designed for business owners and branch staff to manage memberships, offline customer migrations, payment reconciliations, and identity verification.

---

## 🌟 Key Functional Modules

1. **Executive KPI Dashboard**
   - Live KPI overview (12,840 members, ₹18.45L monthly revenue, pending verification queue).
   - Revenue intake breakdown comparing online Razorpay gateway (68%) vs branch walk-in cash/UPI (32%).
   - Recent profile enrolments and approval ticker.

2. **Member Directory & 85-Field Profile Inspector**
   - Multi-parameter filtering by Gender, Community/Caste (Mudaliar, Chettiar, Brahmin, Nadar, Gounder, Thevar, Pillai), Membership Tier (VIP, Diamond, Gold, Silver, Free), and KYC Status.
   - Comprehensive tabbed profile inspector modal:
     - **Personal & Physical** (Height, Weight, Blood Group, Mother Tongue, Dietary habits)
     - **Religious & Horoscope** (Rasi, Nakshatram, Lagnam, Chevvai / Manglik Dosham, Birth Time, Birth Place)
     - **Education & Career** (Degrees, Sector, Organization, Annual Income)
     - **Family Background** (Parents, Siblings, Family Status & Values)
     - **Partner Preferences** (Age, Height, Education, Caste expectations)
     - **Photos & Protective Watermarking** (Dynamic anti-screenshot watermark simulator: `VevahaMatrimony.com / VM-XXXX`)

3. **Offline Archive & Legacy Migration Tool**
   - Digital bridge for branch walk-in registrations across Chennai, Coimbatore, Madurai, and Tirunelveli.
   - Preserves physical ledger references (e.g. `Vol-14 / Page 82`).
   - One-click migration into the digital database with automated SMS/WhatsApp portal credential dispatch.

4. **Payments & Subscription Reconciliation**
   - Mixed payment ledger for Razorpay online transactions and branch cash/UPI receipts.
   - "Record Manual Payment" modal with automatic 18% GST calculation and instant invoice generation (`INV-2026-XXXX`).
   - Export GST Ledger as CSV.

5. **Government ID KYC Verification Queue ("Blue Tick" Approval)**
   - Split-screen comparison workbench:
     - **Left Pane:** Optical extraction from submitted Government ID (Aadhaar / Voter ID / Passport) with confidence matching score.
     - **Right Pane:** Registered profile data.
   - One-click **Approve & Grant Blue Tick** or **Reject with Reason**.

---

## 🚀 Technology Stack

- **Frontend:** Pure HTML5, CSS3, and Vanilla JavaScript (ES6+).
- **Icons & Typography:** FontAwesome 6, Google Fonts (*Outfit*, *Plus Jakarta Sans*).
- **Zero Build Tools:** Runs natively in any browser with zero dependencies or npm installs required.

---

## 💻 How to Run Locally

Simply double-click `index.html` or serve via any static file server:

```bash
# Python built-in static server
python -m http.server 8085
```
Then navigate to `http://localhost:8085/index.html` in your web browser.
