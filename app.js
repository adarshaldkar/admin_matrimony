/**
 * VevahaMatrimony Admin Portal - Client Interactive Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDashboard();
  renderMemberDirectory();
  renderOfflineArchive();
  renderPayments();
  renderKYCQueue();
  populateDropdowns();
  setupGlobalSearch();
});

// --------------------------------------------------------------------------
// Navigation & Views
// --------------------------------------------------------------------------
function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-view]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewKey = item.getAttribute('data-view');
      switchView(viewKey);
    });
  });
}

function switchView(viewKey) {
  // Update sidebar active state
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
  const activeNavItem = document.querySelector(`.sidebar-nav .nav-item[data-view="${viewKey}"]`);
  if (activeNavItem) activeNavItem.classList.add('active');

  // Update view visibility
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  const targetView = document.getElementById(`view-${viewKey}`);
  if (targetView) targetView.classList.add('active');

  // Update Topbar Title
  const titles = {
    dashboard: "Executive Dashboard",
    members: "Live Member Directory & Profile Inspector",
    offline: "Offline Archive & Legacy Migration",
    payments: "Membership Plans & Payment Reconciliation",
    kyc: "Government ID Verification & Blue Tick Approvals",
    audit: "Staff Administrative Audit Trail"
  };
  const titleEl = document.getElementById('topbar-page-heading');
  if (titleEl && titles[viewKey]) {
    titleEl.textContent = titles[viewKey];
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openLiveWebsite() {
  window.open('https://www.vevahamatrimony.com/', '_blank');
}

// --------------------------------------------------------------------------
// View 1: Dashboard
// --------------------------------------------------------------------------
function initDashboard() {
  // Render Revenue Trend Bars
  const barsContainer = document.getElementById('revenue-bars-container');
  if (barsContainer && MATRIMONY_DATA.revenueBreakdown) {
    const maxVal = 2200000;
    barsContainer.innerHTML = MATRIMONY_DATA.revenueBreakdown.map(item => {
      const onlineHeight = Math.round((item.razorpay / maxVal) * 140);
      const offlineHeight = Math.round((item.offline / maxVal) * 140);
      return `
        <div class="bar-group">
          <div class="bar-stack" title="${item.month}: Online ₹${(item.razorpay/100000).toFixed(1)}L | Offline ₹${(item.offline/100000).toFixed(1)}L">
            <div class="bar-offline" style="height: ${offlineHeight}px;"></div>
            <div class="bar-online" style="height: ${onlineHeight}px;"></div>
          </div>
          <div class="bar-label">${item.month}</div>
        </div>
      `;
    }).join('');
  }

  // Render Recent Members on Dashboard
  const recentTable = document.getElementById('dashboard-recent-members');
  if (recentTable) {
    const topRecent = MATRIMONY_DATA.members.slice(0, 4);
    recentTable.innerHTML = topRecent.map(m => `
      <tr>
        <td>
          <div class="member-cell">
            <img src="${m.avatar}" class="member-avatar-img" alt="${m.name}">
            <div class="member-info">
              <h4>${m.name} ${m.kycStatus === 'Verified' ? '<i class="fa-solid fa-circle-check blue-tick-icon" title="KYC Verified"></i>' : ''}</h4>
              <p>${m.id} • ${m.age} yrs • ${m.gender}</p>
            </div>
          </div>
        </td>
        <td><strong>${m.caste}</strong><br><span style="color:#64748B; font-size:11px;">${m.subcaste}</span></td>
        <td>${m.rasi}<br><span style="color:#64748B; font-size:11px;">${m.nakshatram}</span></td>
        <td>${m.occupation}<br><span style="color:#64748B; font-size:11px;">${m.location}</span></td>
        <td><span class="badge badge-${m.plan.toLowerCase()}">${m.plan}</span></td>
        <td>${getKycBadgeHtml(m.kycStatus)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="inspectProfile('${m.id}')">
            <i class="fa-regular fa-eye"></i> Inspect
          </button>
        </td>
      </tr>
    `).join('');
  }
}

// --------------------------------------------------------------------------
// View 2: Live Member Directory
// --------------------------------------------------------------------------
function renderMemberDirectory(filteredList = null) {
  const tbody = document.getElementById('member-directory-tbody');
  if (!tbody) return;

  const list = filteredList || MATRIMONY_DATA.members;
  tbody.innerHTML = list.map(m => `
    <tr>
      <td>
        <div class="member-cell">
          <img src="${m.avatar}" class="member-avatar-img" alt="${m.name}">
          <div class="member-info">
            <h4>${m.name} ${m.kycStatus === 'Verified' ? '<i class="fa-solid fa-circle-check blue-tick-icon" title="KYC Verified"></i>' : ''}</h4>
            <p>${m.id} • ${m.phone}</p>
          </div>
        </div>
      </td>
      <td><strong>${m.age} yrs</strong><br><span style="color:#64748B;">${m.gender}</span></td>
      <td><strong>${m.caste}</strong><br><span style="color:#64748B; font-size:11px;">${m.subcaste}</span></td>
      <td>${m.occupation}<br><span style="color:#64748B; font-size:11px;">${m.location}</span></td>
      <td>
        <span class="badge badge-${m.plan.toLowerCase()}">${m.plan}</span>
        <div style="font-size:11px; color:#64748B; margin-top:2px;">${m.viewsRemaining} views left</div>
      </td>
      <td>${getKycBadgeHtml(m.kycStatus)}</td>
      <td>
        <span class="badge" style="background:#ECFDF5; color:#047857; border:1px solid #A7F3D0;">${m.accountStatus}</span>
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="inspectProfile('${m.id}')">
          <i class="fa-regular fa-folder-open"></i> Full Inspector
        </button>
      </td>
    </tr>
  `).join('');

  const countLabel = document.getElementById('filter-count-label');
  if (countLabel) {
    countLabel.textContent = `Showing ${list.length} of ${MATRIMONY_DATA.members.length} registered profiles`;
  }
}

function applyMemberFilters() {
  const gender = document.getElementById('filter-gender').value;
  const caste = document.getElementById('filter-caste').value;
  const plan = document.getElementById('filter-plan').value;
  const kyc = document.getElementById('filter-kyc').value;

  let filtered = MATRIMONY_DATA.members.filter(m => {
    if (gender !== 'All' && m.gender !== gender) return false;
    if (caste !== 'All' && !m.caste.toLowerCase().includes(caste.toLowerCase())) return false;
    if (plan !== 'All' && m.plan !== plan) return false;
    if (kyc !== 'All' && m.kycStatus !== kyc) return false;
    return true;
  });

  renderMemberDirectory(filtered);
}

function getKycBadgeHtml(status) {
  if (status === 'Verified') {
    return `<span class="badge badge-verified"><i class="fa-solid fa-check"></i> Verified</span>`;
  } else if (status === 'Pending') {
    return `<span class="badge badge-pending"><i class="fa-solid fa-clock"></i> Pending</span>`;
  } else {
    return `<span class="badge badge-rejected"><i class="fa-solid fa-xmark"></i> Rejected</span>`;
  }
}

// --------------------------------------------------------------------------
// View 3: Offline Archive
// --------------------------------------------------------------------------
function renderOfflineArchive() {
  const tbody = document.getElementById('offline-archive-tbody');
  if (!tbody) return;

  tbody.innerHTML = MATRIMONY_DATA.offlineArchive.map(item => `
    <tr>
      <td><strong style="color: #6B21A8; font-family: monospace;">${item.legacyId}</strong></td>
      <td>
        <strong>${item.name}</strong><br>
        <span style="font-size: 11px; color:#64748B;">${item.age} yrs • ${item.gender}</span>
      </td>
      <td><i class="fa-solid fa-building" style="color:#94A3B8;"></i> ${item.branch}</td>
      <td><span style="background:#F1F5F9; padding:2px 8px; border-radius:4px; font-family:monospace;">${item.ledgerPage}</span></td>
      <td>${item.caste} (${item.subcaste})</td>
      <td>${item.phone}</td>
      <td><span class="badge badge-offline">${item.activationStatus}</span></td>
      <td>
        <button class="btn btn-primary btn-sm" style="background:#8B5CF6;" onclick="quickMigrateMember('${item.legacyId}')">
          <i class="fa-solid fa-bolt"></i> Migrate Online
        </button>
      </td>
    </tr>
  `).join('');
}

// --------------------------------------------------------------------------
// View 4: Payments Ledger
// --------------------------------------------------------------------------
function renderPayments() {
  const tbody = document.getElementById('payments-ledger-tbody');
  if (!tbody) return;

  tbody.innerHTML = MATRIMONY_DATA.payments.map(p => `
    <tr>
      <td><strong style="font-family: monospace; color:#0F172A;">${p.txnId}</strong></td>
      <td>${p.date}</td>
      <td>
        <strong>${p.memberName}</strong><br>
        <span style="font-size:11px; color:#64748B;">${p.memberId}</span>
      </td>
      <td><span class="badge badge-${p.plan.toLowerCase()}">${p.plan}</span></td>
      <td>
        <strong style="color: #047857;">₹${p.amount.toLocaleString()}</strong><br>
        <span style="font-size: 11px; color:#64748B;">GST ₹${p.gst}</span>
      </td>
      <td>
        <i class="fa-solid fa-money-bill-transfer" style="color:#64748B;"></i> ${p.mode}
      </td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="printInvoice('${p.invoiceNo}', '${p.memberName}', ${p.amount}, '${p.plan}')">
          <i class="fa-solid fa-file-pdf"></i> ${p.invoiceNo}
        </button>
      </td>
    </tr>
  `).join('');
}

function printInvoice(invNo, name, amount, plan) {
  showNotification(`Generating GST Tax Invoice ${invNo} for ${name} (₹${amount.toLocaleString()})...`);
}

function exportPaymentsCSV() {
  let csvContent = "data:text/csv;charset=utf-8,TxnID,Date,MemberID,Name,Plan,Amount,GST,Mode,Invoice\n";
  MATRIMONY_DATA.payments.forEach(p => {
    csvContent += `${p.txnId},${p.date},${p.memberId},"${p.memberName}",${p.plan},${p.amount},${p.gst},"${p.mode}",${p.invoiceNo}\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Vevaha_Matrimony_Payments_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showNotification("Payment Ledger CSV exported successfully.");
}

// --------------------------------------------------------------------------
// View 5: KYC Verification Queue
// --------------------------------------------------------------------------
function renderKYCQueue() {
  const tbody = document.getElementById('kyc-queue-tbody');
  if (!tbody) return;

  tbody.innerHTML = MATRIMONY_DATA.kycQueue.map(k => `
    <tr>
      <td><strong style="font-family: monospace;">${k.queueId}</strong></td>
      <td>
        <strong>${k.name}</strong><br>
        <span style="font-size: 11px; color:#64748B;">${k.memberId} • ${k.caste}</span>
      </td>
      <td><i class="fa-solid fa-id-card" style="color:#DB2777;"></i> ${k.docType}</td>
      <td>${k.submittedDate}</td>
      <td>
        <div style="font-size: 12px;"><strong>Doc:</strong> ${k.extractedName}</div>
        <div style="font-size: 12px; color:#64748B;"><strong>Registered:</strong> ${k.name}</div>
      </td>
      <td>
        <span class="badge" style="background:#EFF6FF; color:#1D4ED8; font-weight:700;">${k.nameMatchScore} AI Match</span>
      </td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="openKycWorkbench('${k.queueId}')">
          <i class="fa-solid fa-magnifying-glass"></i> Verify Now
        </button>
      </td>
    </tr>
  `).join('');

  const countBadge = document.getElementById('kyc-badge-counter');
  if (countBadge) countBadge.textContent = `${MATRIMONY_DATA.kycQueue.length} Pending Review`;
}

function openKycWorkbench(queueId) {
  const item = MATRIMONY_DATA.kycQueue.find(k => k.queueId === queueId);
  if (!item) return;

  const card = document.getElementById('kyc-workbench-card');
  const content = document.getElementById('kyc-split-content');
  if (!card || !content) return;

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth' });

  // Find linked member record
  const member = MATRIMONY_DATA.members.find(m => m.id === item.memberId) || {
    id: item.memberId,
    name: item.name,
    dob: "1999-08-05",
    gender: "Female",
    location: "Chennai, Tamil Nadu",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  };

  content.innerHTML = `
    <!-- Left Pane: Submitted Official Document -->
    <div class="kyc-doc-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4 style="font-size:15px; color:white;"><i class="fa-solid fa-file-shield"></i> Submitted Document: ${item.docType}</h4>
        <span class="badge" style="background:rgba(255,255,255,0.1); color:white;">Confidence: ${item.nameMatchScore}</span>
      </div>

      <div class="id-card-render">
        <div class="id-card-header">
          <div class="id-emblem">GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION AUTHORITY</div>
          <i class="fa-solid fa-fingerprint" style="font-size:20px; color:#9D174D;"></i>
        </div>

        <div class="id-card-content">
          <div class="id-photo-placeholder">
            <img src="${member.avatar}" alt="Biometric photo">
          </div>
          <div class="id-text-fields">
            <div><strong>Name:</strong> ${item.extractedName}</div>
            <div><strong>DOB / Year:</strong> ${item.extractedDob}</div>
            <div><strong>Address:</strong> ${item.extractedAddress}</div>
          </div>
        </div>

        <div class="id-number-bar">
          ${item.docNumber}
        </div>
      </div>

      <div style="font-size: 12px; color: #94A3B8; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px;">
        <strong style="color: #FBBF24;"><i class="fa-solid fa-triangle-exclamation"></i> AI Optical Verification Note:</strong><br>
        ${item.flagNotes}
      </div>
    </div>

    <!-- Right Pane: Registered Matrimonial Profile -->
    <div class="card" style="margin: 0;">
      <div class="card-header" style="margin-bottom: 12px;">
        <div class="card-title">
          <h3>Registered Portal Profile</h3>
          <p>Target Profile: ${member.name} (${member.id})</p>
        </div>
      </div>

      <div class="data-group" style="margin-bottom: 12px;">
        <label>Portal Registered Name</label>
        <div class="value">${member.name}</div>
      </div>

      <div class="field-grid-2" style="margin-bottom: 12px;">
        <div class="data-group">
          <label>Registered DOB</label>
          <div class="value">${member.dob}</div>
        </div>
        <div class="data-group">
          <label>Gender</label>
          <div class="value">${member.gender}</div>
        </div>
      </div>

      <div class="data-group" style="margin-bottom: 16px;">
        <label>Registered Native Location</label>
        <div class="value">${member.location}</div>
      </div>

      <div style="display:flex; gap:12px; margin-top:20px;">
        <button class="btn btn-success" style="flex:1;" onclick="approveKyc('${item.queueId}', '${member.id}')">
          <i class="fa-solid fa-circle-check"></i> Approve & Grant Blue Tick
        </button>
        <button class="btn btn-danger" onclick="rejectKyc('${item.queueId}', '${member.id}')">
          <i class="fa-solid fa-circle-xmark"></i> Reject ID
        </button>
      </div>
    </div>
  `;
}

function closeKycWorkbench() {
  const card = document.getElementById('kyc-workbench-card');
  if (card) card.style.display = 'none';
}

function approveKyc(queueId, memberId) {
  // Update member status
  const member = MATRIMONY_DATA.members.find(m => m.id === memberId);
  if (member) member.kycStatus = 'Verified';

  // Remove from queue
  MATRIMONY_DATA.kycQueue = MATRIMONY_DATA.kycQueue.filter(k => k.queueId !== queueId);

  // Update counts
  const pendingCount = MATRIMONY_DATA.kycQueue.length;
  document.getElementById('sidebar-kyc-pending').textContent = pendingCount;
  document.getElementById('kpi-kyc-pending').textContent = `${pendingCount} Pending`;

  renderKYCQueue();
  renderMemberDirectory();
  closeKycWorkbench();
  showNotification(`Profile ${memberId} verified successfully! Blue Tick granted.`);
}

function rejectKyc(queueId, memberId) {
  const member = MATRIMONY_DATA.members.find(m => m.id === memberId);
  if (member) member.kycStatus = 'Rejected';

  MATRIMONY_DATA.kycQueue = MATRIMONY_DATA.kycQueue.filter(k => k.queueId !== queueId);

  renderKYCQueue();
  renderMemberDirectory();
  closeKycWorkbench();
  showNotification(`ID rejected for ${memberId}. SMS notification dispatched to re-upload.`);
}

// --------------------------------------------------------------------------
// 85-Field Member Profile Inspector Modal
// --------------------------------------------------------------------------
function inspectProfile(memberId) {
  const m = MATRIMONY_DATA.members.find(item => item.id === memberId);
  if (!m) return;

  const modal = document.getElementById('inspector-modal');
  const title = document.getElementById('inspector-modal-title');
  const body = document.getElementById('inspector-modal-body');

  title.innerHTML = `
    <i class="fa-solid fa-address-card" style="color: #DB2777;"></i>
    <span>Profile Inspector — ${m.name} (${m.id})</span>
  `;

  body.innerHTML = `
    <!-- Tab 1: Personal & Physical -->
    <div class="tab-pane active" id="tab-personal">
      <div class="field-grid-3" style="margin-bottom: 18px;">
        <div class="data-group"><label>Full Name</label><div class="value">${m.name}</div></div>
        <div class="data-group"><label>Gender</label><div class="value">${m.gender}</div></div>
        <div class="data-group"><label>Date of Birth</label><div class="value">${m.dob} (${m.age} yrs)</div></div>
        <div class="data-group"><label>Height</label><div class="value">${m.height}</div></div>
        <div class="data-group"><label>Weight</label><div class="value">${m.weight}</div></div>
        <div class="data-group"><label>Blood Group</label><div class="value">${m.bloodGroup}</div></div>
      </div>
      <div class="field-grid-3">
        <div class="data-group"><label>Marital Status</label><div class="value">${m.maritalStatus}</div></div>
        <div class="data-group"><label>Mother Tongue</label><div class="value">${m.motherTongue}</div></div>
        <div class="data-group"><label>Eating Habit</label><div class="value">${m.eatingHabit}</div></div>
        <div class="data-group"><label>Drinking</label><div class="value">${m.drinkingHabit}</div></div>
        <div class="data-group"><label>Smoking</label><div class="value">${m.smokingHabit}</div></div>
        <div class="data-group"><label>Residing City</label><div class="value">${m.location}</div></div>
      </div>
    </div>

    <!-- Tab 2: Horoscope / Astrology -->
    <div class="tab-pane" id="tab-horoscope">
      <div class="field-grid-3" style="margin-bottom: 18px;">
        <div class="data-group"><label>Caste</label><div class="value">${m.caste}</div></div>
        <div class="data-group"><label>Subcaste</label><div class="value">${m.subcaste}</div></div>
        <div class="data-group"><label>Gothram</label><div class="value">${m.gothram}</div></div>
        <div class="data-group"><label>Rasi</label><div class="value">${m.rasi}</div></div>
        <div class="data-group"><label>Nakshatram</label><div class="value">${m.nakshatram}</div></div>
        <div class="data-group"><label>Lagnam</label><div class="value">${m.lagnam}</div></div>
      </div>
      <div class="field-grid-3">
        <div class="data-group"><label>Dosham Status</label><div class="value" style="color: #DB2777; font-weight:700;">${m.dosham}</div></div>
        <div class="data-group"><label>Time of Birth</label><div class="value">${m.birthTime}</div></div>
        <div class="data-group"><label>Place of Birth</label><div class="value">${m.birthPlace}</div></div>
      </div>
    </div>

    <!-- Tab 3: Education & Career -->
    <div class="tab-pane" id="tab-career">
      <div class="field-grid-2" style="margin-bottom: 18px;">
        <div class="data-group"><label>Highest Degree</label><div class="value">${m.education}</div></div>
        <div class="data-group"><label>Employed Sector</label><div class="value">${m.employedIn}</div></div>
        <div class="data-group"><label>Job Designation</label><div class="value">${m.occupation}</div></div>
        <div class="data-group"><label>Organization</label><div class="value">${m.organization}</div></div>
      </div>
      <div class="data-group"><label>Annual Income</label><div class="value" style="font-weight:700; color:#047857;">${m.annualIncome}</div></div>
    </div>

    <!-- Tab 4: Family Details -->
    <div class="tab-pane" id="tab-family">
      <div class="field-grid-2" style="margin-bottom: 18px;">
        <div class="data-group"><label>Father's Name & Details</label><div class="value">${m.fatherName}</div></div>
        <div class="data-group"><label>Mother's Name & Details</label><div class="value">${m.motherName}</div></div>
        <div class="data-group"><label>Brothers</label><div class="value">${m.brothers}</div></div>
        <div class="data-group"><label>Sisters</label><div class="value">${m.sisters}</div></div>
      </div>
      <div class="field-grid-2">
        <div class="data-group"><label>Family Status</label><div class="value">${m.familyStatus}</div></div>
        <div class="data-group"><label>Family Values</label><div class="value">${m.familyValues}</div></div>
      </div>
    </div>

    <!-- Tab 5: Partner Preferences -->
    <div class="tab-pane" id="tab-partner">
      <div class="field-grid-2" style="margin-bottom: 18px;">
        <div class="data-group"><label>Preferred Age Range</label><div class="value">${m.partnerAge}</div></div>
        <div class="data-group"><label>Preferred Height Range</label><div class="value">${m.partnerHeight}</div></div>
        <div class="data-group"><label>Education Preference</label><div class="value">${m.partnerEducation}</div></div>
        <div class="data-group"><label>Caste Preference</label><div class="value">${m.partnerCaste}</div></div>
      </div>
    </div>

    <!-- Tab 6: Photos & Watermarking -->
    <div class="tab-pane" id="tab-watermark">
      <div class="watermark-demo-box">
        <div class="watermark-img-wrap">
          <img src="${m.avatar}" alt="${m.name}">
          <div class="watermark-overlay">
            <div class="watermark-text-pattern">VEVAHA MATRIMONY</div>
            <div style="font-size: 11px; color: white; font-weight: 700; margin-top: 6px;">${m.id}</div>
          </div>
        </div>

        <div style="flex:1;">
          <h4 style="font-size: 15px; margin-bottom: 6px;">Dynamic Anti-Screenshot Watermark</h4>
          <p style="font-size: 13px; color: #64748B; margin-bottom: 16px;">
            To protect bride & groom privacy, all uploaded photos are dynamically overlaid with the viewer's IP, member's unique ID, and the VevahaMatrimony trademark.
          </p>
          <div class="data-group" style="margin-bottom: 12px;">
            <label>Photo Visibility Setting</label>
            <div class="value">Visible to Paid Members Only (Diamond & VIP)</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="showNotification('Protective watermark re-generated.')">
            <i class="fa-solid fa-rotate"></i> Re-stamp Watermark
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach tab switching events inside modal
  const tabBtns = modal.querySelectorAll('.modal-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      modal.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const paneId = btn.getAttribute('data-tab');
      document.getElementById(paneId).classList.add('active');
    });
  });

  modal.classList.add('active');
}

function closeInspectorModal() {
  document.getElementById('inspector-modal').classList.remove('active');
}

// --------------------------------------------------------------------------
// Offline Account Activation Flow
// --------------------------------------------------------------------------
function openOfflineModal() {
  document.getElementById('offline-modal').classList.add('active');
}

function closeOfflineModal() {
  document.getElementById('offline-modal').classList.remove('active');
}

function quickMigrateMember(legacyId) {
  const item = MATRIMONY_DATA.offlineArchive.find(o => o.legacyId === legacyId);
  if (!item) return;

  openOfflineModal();
  const select = document.getElementById('offline-select-member');
  if (select) select.value = legacyId;
  const phone = document.getElementById('offline-phone');
  if (phone) phone.value = item.phone;
}

function handleOfflineActivation(e) {
  e.preventDefault();
  const legacyId = document.getElementById('offline-select-member').value;
  const phone = document.getElementById('offline-phone').value;
  
  const offlineItem = MATRIMONY_DATA.offlineArchive.find(o => o.legacyId === legacyId);
  if (!offlineItem) return;

  // Create new active member
  const newMember = {
    id: legacyId.replace('VM-OFF-', 'VM-'),
    name: offlineItem.name,
    gender: offlineItem.gender,
    age: offlineItem.age,
    dob: "1998-05-10",
    height: "5 ft 6 in",
    weight: "60 kg",
    bloodGroup: "O+",
    maritalStatus: "Never Married",
    motherTongue: "Tamil",
    eatingHabit: "Non-Vegetarian",
    drinkingHabit: "No",
    smokingHabit: "No",
    caste: offlineItem.caste,
    subcaste: offlineItem.subcaste,
    gothram: "Siva",
    rasi: "Mesham",
    nakshatram: "Aswini",
    lagnam: "Kanni",
    dosham: "No Dosham",
    birthTime: "08:00 AM",
    birthPlace: "Tamil Nadu",
    education: offlineItem.qualification,
    employedIn: "Private",
    occupation: offlineItem.occupation,
    organization: "Corporate",
    annualIncome: offlineItem.annualIncome,
    location: offlineItem.branch,
    fatherName: offlineItem.guardianName,
    motherName: "Family",
    brothers: "None",
    sisters: "None",
    familyStatus: "Middle Class",
    familyValues: "Traditional",
    partnerAge: "25 - 32 yrs",
    partnerHeight: "5 ft 4 in+",
    partnerEducation: "Graduate",
    partnerCaste: offlineItem.caste,
    plan: "Silver",
    planExpiry: "2027-04-14",
    kycStatus: "Pending",
    accountStatus: "Active",
    phone: phone,
    email: `${offlineItem.name.toLowerCase().replace(/[^a-z]/g, '')}@vevaha.com`,
    viewsRemaining: 25,
    avatar: offlineItem.gender === 'Female' 
      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    registeredDate: new Date().toISOString().slice(0, 10),
    idProofType: "Aadhaar (Submitted offline)",
    idProofNumber: "Verified via Ledger"
  };

  // Add to active members
  MATRIMONY_DATA.members.unshift(newMember);

  // Remove from offline archive
  MATRIMONY_DATA.offlineArchive = MATRIMONY_DATA.offlineArchive.filter(o => o.legacyId !== legacyId);

  // Refresh counts
  document.getElementById('sidebar-total-members').textContent = `${(MATRIMONY_DATA.members.length / 1000).toFixed(1)}k`;
  document.getElementById('sidebar-offline-count').textContent = MATRIMONY_DATA.offlineArchive.length;
  document.getElementById('kpi-offline-count').textContent = `${MATRIMONY_DATA.offlineArchive.length} Legacy`;

  renderMemberDirectory();
  renderOfflineArchive();
  populateDropdowns();
  closeOfflineModal();

  showNotification(`Migrated ${offlineItem.name} to Digital Portal! SMS credentials sent to ${phone}.`);
}

// --------------------------------------------------------------------------
// Record Manual Cash / UPI Payment Flow
// --------------------------------------------------------------------------
function openPaymentModal() {
  document.getElementById('payment-modal').classList.add('active');
}

function closePaymentModal() {
  document.getElementById('payment-modal').classList.remove('active');
}

function updatePlanPrice() {
  const planSelect = document.getElementById('payment-plan-select');
  const selectedOption = planSelect.options[planSelect.selectedIndex];
  const price = selectedOption.getAttribute('data-price');
  document.getElementById('payment-amount').value = `₹${parseInt(price).toLocaleString()}`;
}

function handleRecordPayment(e) {
  e.preventDefault();
  const memberId = document.getElementById('payment-member-select').value;
  const planSelect = document.getElementById('payment-plan-select');
  const plan = planSelect.value;
  const price = parseInt(planSelect.options[planSelect.selectedIndex].getAttribute('data-price'));
  const mode = document.getElementById('payment-mode').value;
  const ref = document.getElementById('payment-ref').value;

  const member = MATRIMONY_DATA.members.find(m => m.id === memberId);
  const memberName = member ? member.name : "Member";

  // Upgrade member plan
  if (member) {
    member.plan = plan;
    member.viewsRemaining += (plan === 'VIP' ? 150 : (plan === 'Diamond' ? 75 : 30));
  }

  // Create payment record
  const newTxn = {
    txnId: `TXN-MAN-${Math.floor(10000 + Math.random() * 90000)}`,
    date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    memberId: memberId,
    memberName: memberName,
    plan: plan,
    amount: price,
    gst: Math.round(price * 0.18 / 1.18),
    netAmount: price - Math.round(price * 0.18 / 1.18),
    mode: `${mode} [Ref: ${ref}]`,
    status: "Success",
    invoiceNo: `INV-2026-${Math.floor(1100 + Math.random() * 900)}`
  };

  MATRIMONY_DATA.payments.unshift(newTxn);

  renderPayments();
  renderMemberDirectory();
  closePaymentModal();
  showNotification(`Payment recorded! Member upgraded to ${plan} with invoice ${newTxn.invoiceNo}.`);
}

// --------------------------------------------------------------------------
// Helpers & Dropdown Population
// --------------------------------------------------------------------------
function populateDropdowns() {
  // Offline migration select
  const offSelect = document.getElementById('offline-select-member');
  if (offSelect) {
    offSelect.innerHTML = MATRIMONY_DATA.offlineArchive.map(item => `
      <option value="${item.legacyId}">${item.name} (${item.legacyId} - ${item.branch})</option>
    `).join('');
  }

  // Payment member select
  const paySelect = document.getElementById('payment-member-select');
  if (paySelect) {
    paySelect.innerHTML = MATRIMONY_DATA.members.map(m => `
      <option value="${m.id}">${m.id} — ${m.name} (${m.caste}) [Current: ${m.plan}]</option>
    `).join('');
  }
}

function setupGlobalSearch() {
  const searchInput = document.getElementById('global-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      renderMemberDirectory();
      return;
    }

    switchView('members');
    const filtered = MATRIMONY_DATA.members.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.caste.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.occupation.toLowerCase().includes(q)
    );
    renderMemberDirectory(filtered);
  });
}

function showNotification(msg) {
  const toast = document.getElementById('toast-notification');
  const text = document.getElementById('toast-message');
  if (!toast || !text) return;

  text.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
