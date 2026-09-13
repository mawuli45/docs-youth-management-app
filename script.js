const STORAGE_KEYS = {
  events: 'youthManagementEvents',
  gallery: 'youthManagementGallery',
  members: 'youthManagementMembers',
  announcements: 'youthManagementAnnouncements',
  executives: 'youthManagementExecutives',
  memberSession: 'mmogccYouthHubMemberSession',
  activityLog: 'mmogccYouthHubActivityLog',
  adminSession: 'mmogccYouthHubAdminSession',
};

const defaultMembers = [
  { name: 'Sarah Mantey', role: 'MMOGCC YOUTH Program Lead', engagement: '96%', status: 'Active' },
  { name: 'James Owusu', role: 'MMOGCC YOUTH Volunteer Coordinator', engagement: '89%', status: 'Active' },
  { name: 'Amina Salifu', role: 'MMOGCC YOUTH Media & Outreach', engagement: '83%', status: 'Pending' },
  { name: 'Daniel Koduah', role: 'MMOGCC YOUTH Mentor', engagement: '74%', status: 'Review' },
];

const defaultAnnouncements = [
  {
    title: 'MMOGCC YOUTH council meeting rescheduled',
    summary: 'The MMOGCC YOUTH council meeting has moved to Thursday at 4:00 PM to allow wider participation across the organization.',
    tone: 'Update',
  },
  {
    title: 'Volunteer recruitment open',
    summary: 'Applications for MMOGCC YOUTH outreach volunteers are now open for the next community drive.',
    tone: 'Call to action',
  },
  {
    title: 'Scholarship opportunity shared',
    summary: 'A new scholarship support desk is available for members seeking career guidance and formation support within MMOGCC YOUTH.',
    tone: 'Support',
  },
];

const defaultTasks = [
  { title: 'Confirm youth outreach venue', due: 'Today', state: 'Ready' },
  { title: 'Finalize volunteer shift list', due: 'Tomorrow', state: 'Pending' },
  { title: 'Review event registration forms', due: 'Friday', state: 'Pending' },
];

const defaultEvents = [
  {
    title: 'MMOGCC YOUTH Clean-Up Drive',
    date: '2026-09-20',
    venue: 'MMOGCC YOUTH Community Park',
    category: 'Outreach',
    description: 'Join us for a neighborhood cleanup and MMOGCC YOUTH awareness campaign.',
    poster: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'MMOGCC YOUTH Leadership & Public Speaking Workshop',
    date: '2026-09-24',
    venue: 'MMOGCC YOUTH Center',
    category: 'Workshop',
    description: 'An interactive session on confidence-building, public speaking, and service leadership.',
    poster: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'MMOGCC YOUTH Career Mentorship Meetup',
    date: '2026-10-02',
    venue: 'MMOGCC YOUTH Innovation Hub',
    category: 'Training',
    description: 'Connect with mentors and learn practical career pathways for young adults within MMOGCC YOUTH.',
    poster: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
  },
];

const defaultGallery = [
  {
    title: 'MMOGCC YOUTH Training Session',
    category: 'Training',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'MMOGCC YOUTH Outreach Mission',
    category: 'Outreach',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'MMOGCC YOUTH Creative Workshop',
    category: 'Workshop',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'MMOGCC YOUTH Talent Showcase Night',
    category: 'Social',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  },
];

const defaultExecutives = [
  {
    name: 'Grace Wiafe',
    role: 'MMOGCC YOUTH Chair',
    focus: 'Leadership',
    quote: 'Empowering every MMOGCC YOUTH member to lead with faith and purpose.',
    initials: 'GW',
  },
  {
    name: 'Kevin Tetteh',
    role: 'MMOGCC YOUTH Programs Director',
    focus: 'Impact',
    quote: 'Strong programs create lasting transformation in our MMOGCC YOUTH community.',
    initials: 'KT',
  },
  {
    name: 'Lilian Mensah',
    role: 'MMOGCC YOUTH Community Relations Lead',
    focus: 'Engagement',
    quote: 'Every voice deserves a seat at the table in MMOGCC YOUTH.',
    initials: 'LM',
  },
];

const APP_STORAGE_VERSION = 'mmogcc-youth-hub-v2026-09-08';

if (!localStorage.getItem('mmogccYouthHubAdminPassword')) {
  localStorage.setItem('mmogccYouthHubAdminPassword', 'admin123');
}

if (localStorage.getItem('mmogccYouthHubVersion') !== APP_STORAGE_VERSION) {
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(defaultEvents));
  localStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(defaultGallery));
  localStorage.setItem(STORAGE_KEYS.members, JSON.stringify(defaultMembers));
  localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(defaultAnnouncements));
  localStorage.setItem('mmogccYouthHubVersion', APP_STORAGE_VERSION);
}

const state = {
  events: loadFromStorage(STORAGE_KEYS.events, defaultEvents),
  gallery: loadFromStorage(STORAGE_KEYS.gallery, defaultGallery),
  members: loadFromStorage(STORAGE_KEYS.members, defaultMembers),
  announcements: loadFromStorage(STORAGE_KEYS.announcements, defaultAnnouncements),
  executives: loadFromStorage(STORAGE_KEYS.executives, defaultExecutives),
  activities: loadFromStorage(STORAGE_KEYS.activityLog, []),
  activeView: 'admin',
  activeFilter: 'all',
  role: 'guest',
  currentMember: null,
};

const savedMemberSession = localStorage.getItem(STORAGE_KEYS.memberSession);
if (savedMemberSession) {
  const member = state.members.find((item) => item.email === savedMemberSession);
  if (member) {
    state.currentMember = member;
    state.role = 'member';
  }
}

if (localStorage.getItem(STORAGE_KEYS.adminSession) === 'true') {
  state.role = 'admin';
  state.currentMember = null;
}

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(state.events));
  syncStateWithServer();
}

function saveGallery() {
  localStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(state.gallery));
  syncStateWithServer();
}

function saveMembers() {
  localStorage.setItem(STORAGE_KEYS.members, JSON.stringify(state.members));
  syncStateWithServer();
}

function saveAnnouncements() {
  localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(state.announcements));
  syncStateWithServer();
}

function saveExecutives() {
  localStorage.setItem(STORAGE_KEYS.executives, JSON.stringify(state.executives));
  syncStateWithServer();
}

function saveActivities() {
  localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(state.activities));
  syncStateWithServer();
}

async function hydrateStateFromServer() {
  try {
    const response = await fetch('/api/state', { cache: 'no-store' });
    if (!response.ok) {
      return;
    }

    const serverState = await response.json();
    if (!serverState || typeof serverState !== 'object') {
      return;
    }

    const keys = ['events', 'gallery', 'members', 'announcements', 'executives', 'activities'];
    keys.forEach((key) => {
      if (Array.isArray(serverState[key])) {
        state[key] = serverState[key];
      }
    });

    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(state.events));
    localStorage.setItem(STORAGE_KEYS.gallery, JSON.stringify(state.gallery));
    localStorage.setItem(STORAGE_KEYS.members, JSON.stringify(state.members));
    localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(state.announcements));
    localStorage.setItem(STORAGE_KEYS.executives, JSON.stringify(state.executives));
    localStorage.setItem(STORAGE_KEYS.activityLog, JSON.stringify(state.activities));
  } catch {
    // Ignore backend availability issues and continue with localStorage fallback.
  }
}

async function syncStateWithServer() {
  try {
    await fetch('/api/state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: state.events,
        gallery: state.gallery,
        members: state.members,
        announcements: state.announcements,
        executives: state.executives,
        activities: state.activities,
      }),
    });
  } catch {
    // Ignore backend sync failures and rely on localStorage.
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function renderStats() {
  document.getElementById('statMembers').textContent = state.members.length;
  document.getElementById('statEvents').textContent = state.events.length;
  document.getElementById('statGallery').textContent = state.gallery.length;
  document.getElementById('statExecutives').textContent = state.executives.length;
}

function renderMemberTable() {
  const tbody = document.getElementById('memberTable');
  const isAdmin = state.role === 'admin';
  const searchInput = document.getElementById('memberSearchInput');
  const statusFilter = document.getElementById('memberStatusFilter');

  const searchTerm = (searchInput?.value || '').trim().toLowerCase();
  const selectedStatus = statusFilter?.value || 'all';

  const filteredMembers = state.members
    .map((member, index) => ({ member, index }))
    .filter(({ member, index }) => {
      const matchesSearch =
        !searchTerm ||
        [member.name, member.role, member.email, member.location, member.status]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(searchTerm));

      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });

  tbody.innerHTML = filteredMembers.length
    ? filteredMembers
        .map(
          ({ member, index }) => `
        <tr>
          <td>${member.name}</td>
          <td>${member.role}</td>
          <td>${member.engagement}</td>
          <td>${member.age || '-'}</td>
          <td>${member.dayBornGroup || '-'}</td>
          <td><span class="status-pill ${member.status.toLowerCase()}">${member.status}</span></td>
          ${
            isAdmin
              ? `<td><div class="card-actions compact-actions"><button type="button" class="delete-btn" data-delete-type="member" data-index="${index}">Delete</button></div></td>`
              : ''
          }
        </tr>
      `
        )
        .join('')
    : `
      <tr>
        <td colspan="${isAdmin ? '7' : '6'}" style="text-align: center; color: var(--muted); padding: 20px;">
          No members match your current search or filter.
        </td>
      </tr>
    `;

  const tableHead = document.querySelector('#memberTable')?.closest('table')?.querySelector('thead tr');
  if (tableHead) {
    const actionHeader = tableHead.querySelector('th[data-action-header]');
    if (isAdmin && !actionHeader) {
      const header = document.createElement('th');
      header.dataset.actionHeader = 'true';
      header.textContent = 'Action';
      tableHead.appendChild(header);
    }

    if (!isAdmin && actionHeader) {
      actionHeader.remove();
    }
  }
}

function renderActivityRecords() {
  const recordsList = document.getElementById('activityRecordsList');
  if (!recordsList) {
    return;
  }

  const sortedActivities = [...state.activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  recordsList.innerHTML = sortedActivities.length
    ? sortedActivities
        .map(
          (activity) => `
            <div class="activity-record">
              <div>
                <strong>${activity.memberName}</strong>
                <p>${activity.action}</p>
              </div>
              <div class="activity-meta">
                <span>${activity.email}</span>
                <small>${new Date(activity.timestamp).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</small>
              </div>
            </div>
          `
        )
        .join('')
    : '<p class="chart-empty">No member activity records yet.</p>';
}

function renderMemberInsightsChart() {
  const chartContainer = document.getElementById('memberInsightsChart');
  if (!chartContainer) {
    return;
  }

  const getCounts = (key, fallbackLabel = 'Unknown') => {
    const counts = {};
    state.members.forEach((member) => {
      const value = member[key] || fallbackLabel;
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  };

  const ageGroups = [
    { label: '15-19', predicate: (age) => age >= 15 && age <= 19 },
    { label: '20-24', predicate: (age) => age >= 20 && age <= 24 },
    { label: '25-29', predicate: (age) => age >= 25 && age <= 29 },
    { label: '30-34', predicate: (age) => age >= 30 && age <= 34 },
    { label: '35+', predicate: (age) => age >= 35 },
  ];

  const counts = {
    status: getCounts('status', 'Unknown'),
    employmentStatus: getCounts('employmentStatus', 'Unknown'),
    dayBornGroup: getCounts('dayBornGroup', 'Unknown'),
    ageGroups: ageGroups
      .map((group) => ({
        label: group.label,
        value: state.members.filter((member) => {
          const age = Number(member.age || 0);
          return !Number.isNaN(age) && group.predicate(age);
        }).length,
      }))
      .filter((group) => group.value > 0),
  };

  const chartSections = [
    { title: 'Status', data: counts.status },
    { title: 'Employment status', data: counts.employmentStatus },
    { title: 'Day born group', data: counts.dayBornGroup },
    { title: 'Age groups', data: counts.ageGroups },
  ];

  const maxForSection = (data) => Math.max(...data.map((item) => item.value), 1);

  chartContainer.innerHTML = chartSections
    .map(({ title, data }) => {
      if (!data || data.length === 0) {
        return `
          <div class="chart-block">
            <h4>${title}</h4>
            <p class="chart-empty">No data yet</p>
          </div>
        `;
      }

      const maxValue = maxForSection(data);

      return `
        <div class="chart-block">
          <h4>${title}</h4>
          <div class="chart-bars">
            ${data
              .map(
                (item) => `
                  <div class="chart-row">
                    <span class="chart-label">${item.label}</span>
                    <div class="chart-track">
                      <span class="chart-fill" style="width: ${(item.value / maxValue) * 100}%"></span>
                    </div>
                    <span class="chart-value">${item.value}</span>
                  </div>
                `
              )
              .join('')}
          </div>
        </div>
      `;
    })
    .join('');
}

function renderTaskList() {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = defaultTasks
    .map(
      (task) => `
        <li class="task-item">
          <div>
            <strong>${task.title}</strong>
            <small>${task.due}</small>
          </div>
          <span class="status-pill ${task.state === 'Ready' ? 'active' : 'pending'}">${task.state}</span>
        </li>
      `
    )
    .join('');
}

function renderAnnouncements() {
  const announcementsList = document.getElementById('announcementsList');
  announcementsList.innerHTML = state.announcements
    .map(
      (item) => `
        <article class="announcement-card">
          <span class="announcement-tag">${item.tone}</span>
          <h3>${item.title}</h3>
          <p>${item.summary}</p>
        </article>
      `
    )
    .join('');
}

function renderMemberEvents() {
  const memberEvents = document.getElementById('memberEvents');
  memberEvents.innerHTML = state.events
    .slice(0, 4)
    .map(
      (event) => `
        <div class="event-shell">
          <div>
            <strong>${event.title}</strong>
            <small>${formatDate(event.date)} · ${event.venue}</small>
          </div>
          <span class="event-pill">Booked</span>
        </div>
      `
    )
    .join('');
}

function renderEvents() {
  const eventsGrid = document.getElementById('eventsGrid');
  eventsGrid.innerHTML = state.events
    .map(
      (event, index) => `
        <article class="event-card">
          <div class="poster" style="background-image: url('${event.poster}')"></div>
          <div class="event-info">
            <div class="meta">
              <span>${event.category}</span>
              <span>${formatDate(event.date)}</span>
            </div>
            <h3>${event.title}</h3>
            <p>${event.venue}</p>
            <p style="margin-top: 10px;">${event.description}</p>
            ${
              state.role === 'admin'
                ? `<div class="card-actions compact-actions"><button type="button" class="delete-btn" data-delete-type="event" data-index="${index}">Delete</button></div>`
                : ''
            }
          </div>
        </article>
      `
    )
    .join('');
}

function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  const filteredGallery =
    state.activeFilter === 'all'
      ? state.gallery
      : state.gallery.filter((item) => item.category === state.activeFilter);

  galleryGrid.innerHTML = filteredGallery
    .map(
      (item, index) => `
        <article class="gallery-card" data-gallery-index="${index}">
          <div class="gallery-image" style="background-image: url('${item.image}')"></div>
          <div class="gallery-info">
            <h3>${item.title}</h3>
            <span class="caption-tag">${item.category}</span>
            ${
              state.role === 'admin'
                ? `<div class="card-actions compact-actions"><button type="button" class="delete-btn" data-delete-type="gallery" data-index="${index}">Delete</button></div>`
                : ''
            }
          </div>
        </article>
      `
    )
    .join('');
}

function renderExecutives() {
  const executivesGrid = document.getElementById('executivesGrid');
  executivesGrid.innerHTML = state.executives
    .map(
      (executive, index) => `
        <article class="executive-card">
          <div class="executive-photo">
            ${
              executive.image
                ? `<img src="${executive.image}" alt="${executive.name}">`
                : `<div class="executive-avatar">${executive.initials}</div>`
            }
          </div>
          <div class="executive-top">
            <div class="executive-info">
              <h3>${executive.name}</h3>
              <span class="role">${executive.role}</span>
            </div>
          </div>
          <p>${executive.quote}</p>
          <div class="executive-stats">
            <span>${executive.focus}</span>
            <span>Open</span>
          </div>
          ${
            state.role === 'admin'
              ? `<div class="card-actions compact-actions"><button type="button" class="delete-btn" data-delete-type="executive" data-index="${index}">Delete</button></div>`
              : ''
          }
        </article>
      `
    )
    .join('');
}

function switchDashboard(view) {
  state.activeView = view;
  document.querySelectorAll('.view-toggle').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  document.getElementById('adminDashboard').classList.toggle('active', view === 'admin');
  document.getElementById('memberDashboard').classList.toggle('active', view === 'member');
}

function setupDashboardButtons() {
  document.querySelectorAll('.view-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.view === 'admin' && state.role !== 'admin') {
        openLoginModal();
        return;
      }

      switchDashboard(button.dataset.view);
    });
  });
}

function setupFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeFilter = button.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.classList.toggle('active', btn === button);
      });
      renderGallery();
    });
  });
}

function handleEventFormSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const posterFile = form.get('poster');
  const title = form.get('title').trim();
  const date = form.get('date');
  const venue = form.get('venue').trim();
  const category = form.get('category');
  const description = form.get('description').trim();

  if (!title || !date || !venue || !description) {
    return;
  }

  const eventObject = {
    title,
    date,
    venue,
    category,
    description,
    poster:
      posterFile && posterFile.name
        ? 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80'
        : 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
  };

  state.events.unshift(eventObject);
  saveEvents();
  renderEvents();
  renderStats();
  renderMemberEvents();
  event.target.reset();
}

function handleMemberFormSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const name = form.get('memberName').trim();
  const role = form.get('memberRole').trim();
  const status = form.get('memberStatus');

  if (!name || !role) {
    return;
  }

  state.members.unshift({
    name,
    role,
    engagement: 'New',
    status,
  });

  saveMembers();
  renderMemberTable();
  renderStats();
  event.target.reset();
}

function updateSignupEmploymentDetailField() {
  const employmentStatusSelect = document.querySelector('[name="signupEmploymentStatus"]');
  const detailLabel = document.getElementById('signupEmploymentDetailLabel');
  const detailInput = document.getElementById('signupEmploymentDetail');
  const detailLabelText = document.getElementById('signupEmploymentDetailLabelText');
  const employmentStatus = employmentStatusSelect?.value || '';

  const detailConfig = {
    Student: {
      label: 'School name',
      placeholder: 'Enter the school name',
    },
    Employed: {
      label: 'Employer / workplace name',
      placeholder: 'Enter the company or workplace name',
    },
    'Self-employed': {
      label: 'Business / workplace name',
      placeholder: 'Enter the business or workplace name',
    },
  };

  const shouldShowDetail = ['Student', 'Employed', 'Self-employed'].includes(employmentStatus);

  detailLabel?.classList.toggle('hidden', !shouldShowDetail);
  detailInput.placeholder = detailConfig[employmentStatus]?.placeholder || 'Enter the school name';
  detailLabelText.textContent = detailConfig[employmentStatus]?.label || 'School name';

  if (!shouldShowDetail) {
    detailInput.value = '';
  }
}

function handleMemberSignupSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const name = form.get('signupName').trim();
  const email = form.get('signupEmail').trim();
  const role = form.get('signupRole').trim();
  const dob = form.get('signupDob')?.trim() || '';
  const age = form.get('signupAge')?.trim() || '';
  const dayBornGroup = form.get('signupDayBornGroup')?.trim() || '';
  const location = form.get('signupLocation')?.trim() || '';
  const employmentStatus = form.get('signupEmploymentStatus')?.trim() || '';
  const employmentDetail = form.get('signupEmploymentDetail')?.trim() || '';
  const contact = form.get('signupContact')?.trim() || '';
  const emergencyContact = form.get('signupEmergencyContact')?.trim() || '';

  const requiresEmploymentDetail = ['Student', 'Employed', 'Self-employed'].includes(employmentStatus);

  if (!name || !email || !role || !dob || !age || !dayBornGroup || !location || !employmentStatus || !contact || !emergencyContact || (requiresEmploymentDetail && !employmentDetail)) {
    alert('Please complete all signup fields before registering.');
    return;
  }

  const emailExists = state.members.some((member) => member.email && member.email.toLowerCase() === email.toLowerCase());
  if (emailExists) {
    alert('This email address is already registered. Please use a different email.');
    return;
  }

  const newMember = {
    name,
    role,
    engagement: 'New',
    status: 'Pending',
    email,
    dob,
    age,
    dayBornGroup,
    location,
    employmentStatus,
    employmentDetail,
    contact,
    emergencyContact,
  };

  state.members.unshift(newMember);
  saveMembers();
  logMemberActivity(newMember, 'Signed up', 'New membership registration completed.');
  renderMemberTable();
  renderStats();
  event.target.reset();
  closeSignupModal();
  signInMember(newMember);
  alert('Your MMOGCC YOUTH membership signup has been received.');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleGalleryFormSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const file = form.get('galleryImage');
  const caption = form.get('caption').trim();
  const category = form.get('category');

  if (!file || !file.name) {
    return;
  }

  const image = await readFileAsDataUrl(file);
  state.gallery.unshift({
    title: caption || 'New gallery item',
    category,
    image,
  });

  saveGallery();
  renderGallery();
  renderStats();
  event.target.reset();
}

async function handleExecutiveFormSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const file = form.get('executiveImage');
  const name = form.get('executiveName').trim();
  const role = form.get('executiveRole').trim();
  const focus = form.get('executiveFocus').trim();
  const quote = form.get('executiveQuote').trim();

  if (!file || !file.name || !name || !role || !focus || !quote) {
    return;
  }

  const image = await readFileAsDataUrl(file);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  state.executives.unshift({
    name,
    role,
    focus,
    quote,
    initials,
    image,
  });

  saveExecutives();
  renderExecutives();
  renderStats();
  event.target.reset();
}

function handleChangePasswordSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const currentPassword = form.get('currentPassword').trim();
  const newPassword = form.get('newPassword').trim();
  const confirmPassword = form.get('confirmPassword').trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return;
  }

  if (currentPassword !== getStoredAdminPassword()) {
    alert('The current password is incorrect.');
    return;
  }

  if (newPassword.length < 6) {
    alert('New password must be at least 6 characters long.');
    return;
  }

  if (newPassword !== confirmPassword) {
    alert('New password and confirm password do not match.');
    return;
  }

  localStorage.setItem('mmogccYouthHubAdminPassword', newPassword);
  alert('Admin password updated successfully.');
  event.target.reset();
}

function bindFormHandlers() {
  document.getElementById('eventForm').addEventListener('submit', handleEventFormSubmit);
  document.getElementById('galleryForm').addEventListener('submit', handleGalleryFormSubmit);
  document.getElementById('memberForm').addEventListener('submit', handleMemberFormSubmit);
  document.getElementById('memberSignupForm').addEventListener('submit', handleMemberSignupSubmit);
  document.getElementById('executiveForm').addEventListener('submit', handleExecutiveFormSubmit);
  document.getElementById('changePasswordForm').addEventListener('submit', handleChangePasswordSubmit);

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleMemberSignupSubmit);
  }

  const signupEmploymentStatus = document.querySelector('[name="signupEmploymentStatus"]');
  if (signupEmploymentStatus) {
    signupEmploymentStatus.addEventListener('change', updateSignupEmploymentDetailField);
    updateSignupEmploymentDetailField();
  }
}

function bindMemberOverviewControls() {
  const searchInput = document.getElementById('memberSearchInput');
  const statusFilter = document.getElementById('memberStatusFilter');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderMemberTable();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      renderMemberTable();
    });
  }
}

function handleDeleteItemClick(event) {
  const deleteButton = event.target.closest('[data-delete-type]');
  if (!deleteButton) {
    return;
  }

  const type = deleteButton.dataset.deleteType;
  const index = Number(deleteButton.dataset.index);

  if (Number.isNaN(index)) {
    return;
  }

  if (type === 'member') {
    state.members.splice(index, 1);
    saveMembers();
  }

  if (type === 'event') {
    state.events.splice(index, 1);
    saveEvents();
  }

  if (type === 'gallery') {
    state.gallery.splice(index, 1);
    saveGallery();
  }

  if (type === 'executive') {
    state.executives.splice(index, 1);
    saveExecutives();
  }

  renderDashboardContent();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildEditForm(type, index) {
  const item = state[type]?.[index];
  if (!item) {
    return '';
  }

  if (type === 'member') {
    const employmentDetailLabel = item.employmentStatus === 'Student'
      ? 'School name'
      : item.employmentStatus === 'Employed'
        ? 'Employer / workplace name'
        : item.employmentStatus === 'Self-employed'
          ? 'Business / workplace name'
          : 'Employment detail';

    return `
      <div class="field-row">
        <label>
          Full name
          <input type="text" name="name" value="${escapeHtml(item.name || '')}" required />
        </label>
        <label>
          Role
          <input type="text" name="role" value="${escapeHtml(item.role || '')}" required />
        </label>
      </div>
      <div class="field-row">
        <label>
          Email
          <input type="email" name="email" value="${escapeHtml(item.email || '')}" />
        </label>
        <label>
          Status
          <select name="status">
            <option value="Active" ${item.status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Review" ${item.status === 'Review' ? 'selected' : ''}>Review</option>
          </select>
        </label>
      </div>
      <div class="field-row">
        <label>
          Engagement
          <input type="text" name="engagement" value="${escapeHtml(item.engagement || '')}" required />
        </label>
        <label>
          Date of birth
          <input type="date" name="dob" value="${escapeHtml(item.dob || '')}" />
        </label>
      </div>
      <div class="field-row">
        <label>
          Age
          <input type="number" name="age" min="1" max="120" value="${escapeHtml(item.age || '')}" />
        </label>
        <label>
          Day born group
          <select name="dayBornGroup">
            <option value="" ${!item.dayBornGroup ? 'selected' : ''}>Select day born group</option>
            <option value="Monday" ${item.dayBornGroup === 'Monday' ? 'selected' : ''}>Monday</option>
            <option value="Tuesday" ${item.dayBornGroup === 'Tuesday' ? 'selected' : ''}>Tuesday</option>
            <option value="Wednesday" ${item.dayBornGroup === 'Wednesday' ? 'selected' : ''}>Wednesday</option>
            <option value="Thursday" ${item.dayBornGroup === 'Thursday' ? 'selected' : ''}>Thursday</option>
            <option value="Friday" ${item.dayBornGroup === 'Friday' ? 'selected' : ''}>Friday</option>
            <option value="Saturday" ${item.dayBornGroup === 'Saturday' ? 'selected' : ''}>Saturday</option>
            <option value="Sunday" ${item.dayBornGroup === 'Sunday' ? 'selected' : ''}>Sunday</option>
          </select>
        </label>
      </div>
      <div class="field-row">
        <label>
          Location
          <input type="text" name="location" value="${escapeHtml(item.location || '')}" />
        </label>
        <label>
          Employment status
          <select name="employmentStatus">
            <option value="" ${!item.employmentStatus ? 'selected' : ''}>Select employment status</option>
            <option value="Employed" ${item.employmentStatus === 'Employed' ? 'selected' : ''}>Employed</option>
            <option value="Self-employed" ${item.employmentStatus === 'Self-employed' ? 'selected' : ''}>Self-employed</option>
            <option value="Student" ${item.employmentStatus === 'Student' ? 'selected' : ''}>Student</option>
            <option value="Unemployed" ${item.employmentStatus === 'Unemployed' ? 'selected' : ''}>Unemployed</option>
          </select>
        </label>
      </div>
      <div class="field-row">
        <label>
          Employment detail
          <input type="text" name="employmentDetail" value="${escapeHtml(item.employmentDetail || '')}" placeholder="${escapeHtml(employmentDetailLabel)}" />
        </label>
        <label>
          Contact
          <input type="text" name="contact" value="${escapeHtml(item.contact || '')}" />
        </label>
      </div>
      <div class="field-row">
        <label>
          Emergency contact
          <input type="text" name="emergencyContact" value="${escapeHtml(item.emergencyContact || '')}" />
        </label>
      </div>
      <button type="submit" class="primary-btn">Save changes</button>
    `;
  }

  if (type === 'event') {
    return `
      <div class="field-row">
        <label>
          Event title
          <input type="text" name="title" value="${escapeHtml(item.title || '')}" required />
        </label>
        <label>
          Date
          <input type="date" name="date" value="${escapeHtml(item.date || '')}" required />
        </label>
      </div>
      <div class="field-row">
        <label>
          Venue
          <input type="text" name="venue" value="${escapeHtml(item.venue || '')}" required />
        </label>
        <label>
          Category
          <select name="category">
            <option value="Training" ${item.category === 'Training' ? 'selected' : ''}>Training</option>
            <option value="Outreach" ${item.category === 'Outreach' ? 'selected' : ''}>Outreach</option>
            <option value="Workshop" ${item.category === 'Workshop' ? 'selected' : ''}>Workshop</option>
            <option value="Social" ${item.category === 'Social' ? 'selected' : ''}>Social</option>
          </select>
        </label>
      </div>
      <label>
        Description
        <textarea name="description" rows="4" required>${escapeHtml(item.description || '')}</textarea>
      </label>
      <label>
        Update poster image
        <input type="file" name="poster" accept="image/*" />
      </label>
      <button type="submit" class="primary-btn">Save changes</button>
    `;
  }

  if (type === 'gallery') {
    return `
      <div class="field-row">
        <label>
          Title
          <input type="text" name="title" value="${escapeHtml(item.title || '')}" required />
        </label>
        <label>
          Category
          <select name="category">
            <option value="Training" ${item.category === 'Training' ? 'selected' : ''}>Training</option>
            <option value="Outreach" ${item.category === 'Outreach' ? 'selected' : ''}>Outreach</option>
            <option value="Workshop" ${item.category === 'Workshop' ? 'selected' : ''}>Workshop</option>
            <option value="Social" ${item.category === 'Social' ? 'selected' : ''}>Social</option>
          </select>
        </label>
      </div>
      <label>
        Replace image
        <input type="file" name="image" accept="image/*" />
      </label>
      <button type="submit" class="primary-btn">Save changes</button>
    `;
  }

  if (type === 'executive') {
    return `
      <div class="field-row">
        <label>
          Executive name
          <input type="text" name="name" value="${escapeHtml(item.name || '')}" required />
        </label>
        <label>
          Role
          <input type="text" name="role" value="${escapeHtml(item.role || '')}" required />
        </label>
      </div>
      <div class="field-row">
        <label>
          Focus area
          <input type="text" name="focus" value="${escapeHtml(item.focus || '')}" required />
        </label>
        <label>
          Quote
          <input type="text" name="quote" value="${escapeHtml(item.quote || '')}" required />
        </label>
      </div>
      <label>
        Replace photo
        <input type="file" name="image" accept="image/*" />
      </label>
      <button type="submit" class="primary-btn">Save changes</button>
    `;
  }

  return '';
}

function openEditModal(type, index) {
  const editForm = document.getElementById('editForm');
  const editModal = document.getElementById('editModal');
  const editTitle = document.querySelector('#editModal h3');

  if (!editForm || !editModal || !editTitle) {
    return;
  }

  const titleMap = {
    member: 'Edit member',
    event: 'Edit event',
    gallery: 'Edit gallery item',
    executive: 'Edit executive',
  };

  editTitle.textContent = titleMap[type] || 'Edit record';
  editForm.dataset.editType = type;
  editForm.dataset.index = String(index);
  editForm.innerHTML = buildEditForm(type, index);
  editModal.classList.remove('hidden');
}

function closeEditModal() {
  const editModal = document.getElementById('editModal');
  const editForm = document.getElementById('editForm');

  if (editModal) {
    editModal.classList.add('hidden');
  }

  if (editForm) {
    editForm.dataset.editType = '';
    editForm.dataset.index = '';
    editForm.innerHTML = '';
  }
}

function handleEditItemClick(event) {
  const editButton = event.target.closest('[data-edit-type]');
  if (!editButton) {
    return;
  }

  const type = editButton.dataset.editType;
  const index = Number(editButton.dataset.index);

  if (Number.isNaN(index)) {
    return;
  }

  openEditModal(type, index);
}

function handleEditFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const type = form.dataset.editType;
  const index = Number(form.dataset.index);

  if (!type || Number.isNaN(index)) {
    return;
  }

  const formData = new FormData(form);

  if (type === 'member') {
    const name = formData.get('name')?.toString().trim();
    const role = formData.get('role')?.toString().trim();
    const email = formData.get('email')?.toString().trim();
    const engagement = formData.get('engagement')?.toString().trim();
    const status = formData.get('status')?.toString().trim();
    const employmentStatus = formData.get('employmentStatus')?.toString().trim() || '';
    const employmentDetail = formData.get('employmentDetail')?.toString().trim() || '';

    if (!name || !role || !engagement || !status) {
      alert('Please complete all required member fields before saving.');
      return;
    }

    if (['Student', 'Employed', 'Self-employed'].includes(employmentStatus) && !employmentDetail) {
      alert('Please enter the school or workplace name for the selected employment status.');
      return;
    }

    state.members[index] = {
      ...state.members[index],
      name,
      role,
      email: email || state.members[index].email || '',
      engagement,
      status,
      dob: formData.get('dob')?.toString().trim() || '',
      age: formData.get('age')?.toString().trim() || '',
      dayBornGroup: formData.get('dayBornGroup')?.toString().trim() || '',
      location: formData.get('location')?.toString().trim() || '',
      employmentStatus,
      employmentDetail,
      contact: formData.get('contact')?.toString().trim() || '',
      emergencyContact: formData.get('emergencyContact')?.toString().trim() || '',
    };

    saveMembers();
  }

  if (type === 'event') {
    const title = formData.get('title')?.toString().trim();
    const date = formData.get('date')?.toString().trim();
    const venue = formData.get('venue')?.toString().trim();
    const category = formData.get('category')?.toString().trim();
    const description = formData.get('description')?.toString().trim();
    const posterFile = formData.get('poster');

    if (!title || !date || !venue || !category || !description) {
      alert('Please complete all event fields before saving.');
      return;
    }

    const updatedEvent = {
      ...state.events[index],
      title,
      date,
      venue,
      category,
      description,
    };

    if (posterFile && posterFile.name) {
      updatedEvent.poster = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80';
    }

    state.events[index] = updatedEvent;

    saveEvents();
  }

  if (type === 'gallery') {
    const title = formData.get('title')?.toString().trim();
    const category = formData.get('category')?.toString().trim();
    const imageFile = formData.get('image');

    if (!title || !category) {
      alert('Please complete both gallery fields before saving.');
      return;
    }

    const updatedGalleryItem = {
      ...state.gallery[index],
      title,
      category,
    };

    if (imageFile && imageFile.name) {
      updatedGalleryItem.image = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80';
    }

    state.gallery[index] = updatedGalleryItem;

    saveGallery();
  }

  if (type === 'executive') {
    const name = formData.get('name')?.toString().trim();
    const role = formData.get('role')?.toString().trim();
    const focus = formData.get('focus')?.toString().trim();
    const quote = formData.get('quote')?.toString().trim();
    const imageFile = formData.get('image');

    if (!name || !role || !focus || !quote) {
      alert('Please complete all executive fields before saving.');
      return;
    }

    const updatedExecutive = {
      ...state.executives[index],
      name,
      role,
      focus,
      quote,
    };

    if (imageFile && imageFile.name) {
      updatedExecutive.image = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80';
    }

    state.executives[index] = updatedExecutive;

    saveExecutives();
  }

  closeEditModal();
  renderDashboardContent();
}

function bindDeleteHandlers() {
  document.addEventListener('click', handleDeleteItemClick);
  document.addEventListener('click', handleEditItemClick);

  const editCloseBtn = document.getElementById('closeEditModalBtn');
  if (editCloseBtn) {
    editCloseBtn.addEventListener('click', closeEditModal);
  }

  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', handleEditFormSubmit);
  }
}

function renderDashboardContent() {
  renderStats();
  renderMemberTable();
  renderMemberInsightsChart();
  renderActivityRecords();
  renderTaskList();
  renderAnnouncements();
  renderMemberEvents();
  renderEvents();
  renderGallery();
  renderExecutives();
  updateMemberDashboardProfile();
}

function updateMemberDashboardProfile() {
  const member = state.currentMember;
  const profileName = document.getElementById('memberProfileName');
  const profileId = document.getElementById('memberProfileId');
  const profileEmail = document.getElementById('memberProfileEmail');
  const profileRole = document.getElementById('memberProfileRole');
  const profileAttendance = document.getElementById('memberProfileAttendance');

  if (!member) {
    return;
  }

  if (profileName) profileName.textContent = member.name;
  if (profileId) profileId.textContent = `Member ID: ${member.email?.slice(0, 8).toUpperCase() || 'MMOGCC'}`;
  if (profileEmail) profileEmail.textContent = member.email || 'Not available';
  if (profileRole) profileRole.textContent = member.role || 'Member';
  if (profileAttendance) profileAttendance.textContent = member.engagement || 'New';
}

function updateAuthUI() {
  const authStatus = document.getElementById('authStatus');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminDashboard = document.getElementById('adminDashboard');
  const memberDashboard = document.getElementById('memberDashboard');

  if (state.role === 'admin') {
    authStatus.textContent = 'Signed in as Admin';
    document.body.classList.add('admin-mode');
    document.body.classList.remove('member-mode');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    if (adminDashboard) {
      adminDashboard.classList.remove('hidden');
    }
    if (memberDashboard) {
      memberDashboard.classList.add('hidden');
    }
    switchDashboard('admin');
  } else if (state.role === 'member') {
    authStatus.textContent = `Signed in as ${state.currentMember?.name || 'Member'}`;
    document.body.classList.remove('admin-mode');
    document.body.classList.add('member-mode');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    if (adminDashboard) {
      adminDashboard.classList.add('hidden');
    }
    if (memberDashboard) {
      memberDashboard.classList.remove('hidden');
    }
    switchDashboard('member');
  } else {
    authStatus.textContent = 'Not signed in';
    document.body.classList.remove('admin-mode');
    document.body.classList.remove('member-mode');
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    if (adminDashboard) {
      adminDashboard.classList.add('hidden');
    }
    if (memberDashboard) {
      memberDashboard.classList.add('hidden');
    }
    switchDashboard('admin');
  }

  renderDashboardContent();
}

function openSignupModal() {
  document.getElementById('signupModal').classList.remove('hidden');
}

function closeSignupModal() {
  const signupModal = document.getElementById('signupModal');
  if (signupModal) {
    signupModal.classList.add('hidden');
  }
}

function openLoginModal() {
  document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.add('hidden');
}

function getStoredAdminPassword() {
  return localStorage.getItem('mmogccYouthHubAdminPassword') || 'admin123';
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const username = form.get('username').trim().toLowerCase();
  const password = form.get('password').trim();

  if (username === 'admin' && password === getStoredAdminPassword()) {
    state.role = 'admin';
    state.currentMember = null;
    localStorage.setItem(STORAGE_KEYS.adminSession, 'true');
    closeLoginModal();
    updateAuthUI();
    switchDashboard('admin');
    event.target.reset();
    return;
  }

  alert('Invalid login details. Please try again.');
}

function saveMemberSession(member) {
  if (!member || !member.email) {
    localStorage.removeItem(STORAGE_KEYS.memberSession);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.memberSession, member.email);
}

function logMemberActivity(member, action, details = '') {
  if (!member || !member.email) {
    return;
  }

  state.activities.unshift({
    memberName: member.name,
    email: member.email,
    action,
    details,
    timestamp: new Date().toISOString(),
  });

  saveActivities();
}

function signInMember(member) {
  if (!member) {
    return;
  }

  state.currentMember = member;
  state.role = 'member';
  saveMemberSession(member);
  logMemberActivity(member, 'Signed in', 'Member opened their dashboard.');
  updateAuthUI();
}

function handleLogout() {
  state.role = 'guest';
  state.currentMember = null;
  localStorage.removeItem(STORAGE_KEYS.memberSession);
  localStorage.removeItem(STORAGE_KEYS.adminSession);
  updateAuthUI();
}

function bindAuthHandlers() {
  document.getElementById('loginBtn').addEventListener('click', openLoginModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeLoginModal);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
}

function addChatMessage(targetId, role, text) {
  const messages = document.getElementById(targetId);
  if (!messages) {
    return;
  }

  const message = document.createElement('div');
  message.className = `message ${role}`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function getChatbotReply(question) {
  const query = question.toLowerCase();

  if (query.includes('register') || query.includes('signup') || query.includes('member')) {
    return 'To register, click “Join MMOGCC YOUTH” on the page, fill in the form, and click Register.';
  }

  if (query.includes('gallery') || query.includes('picture') || query.includes('slideshow')) {
    return 'Open the Gallery section and click any image to view it in the slideshow.';
  }

  if (query.includes('executive') || query.includes('leaders')) {
    return 'Visit the Executives section to view the leaders and their profiles in MMOGCC YOUTH.';
  }

  if (query.includes('event') || query.includes('upcoming')) {
    return 'Browse the Events section to see upcoming MMOGCC YOUTH activities and initiatives.';
  }

  if (query.includes('dashboard')) {
    return 'The admin dashboard is only available after an admin signs in with the correct login details.';
  }

  return 'I can help with registration, gallery, executives, events, and updates for MMOGCC YOUTH.';
}

async function handleChatbotSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chatbotInput');
  const message = input.value.trim();

  if (!message) {
    return;
  }

  addChatMessage('chatbotMessages', 'user', message);
  addChatMessage('chatbotMessages', 'bot', getChatbotReply(message));
  input.value = '';
}

function bindChatbotHandlers() {
  const toggleBtn = document.getElementById('chatbotToggleBtn');
  const closeBtn = document.getElementById('chatbotCloseBtn');
  const panel = document.getElementById('chatbotPanel');
  const form = document.getElementById('chatbotForm');
  const suggestions = document.querySelectorAll('.chatbot-suggestion');

  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => {
      panel.classList.toggle('hidden');
    });
  }

  if (closeBtn && panel) {
    closeBtn.addEventListener('click', () => {
      panel.classList.add('hidden');
    });
  }

  if (form) {
    form.addEventListener('submit', handleChatbotSubmit);
  }

  suggestions.forEach((suggestion) => {
    suggestion.addEventListener('click', () => {
      const question = suggestion.dataset.question;
      if (!question) {
        return;
      }

      const input = document.getElementById('chatbotInput');
      if (input) {
        input.value = question;
      }

      addChatMessage('chatbotMessages', 'user', question);
      addChatMessage('chatbotMessages', 'bot', getChatbotReply(question));
    });
  });
}

function getFilteredGalleryItems() {
  return state.activeFilter === 'all'
    ? state.gallery
    : state.gallery.filter((item) => item.category === state.activeFilter);
}

function openGallerySlideshow(index) {
  const galleryItems = getFilteredGalleryItems();
  const slideshowModal = document.getElementById('galleryModal');
  const galleryImage = document.getElementById('galleryModalImage');
  const galleryTitle = document.getElementById('galleryModalTitle');
  const galleryCategory = document.getElementById('galleryModalCategory');
  const galleryCurrentIndex = document.getElementById('galleryCurrentIndex');
  const galleryTotalCount = document.getElementById('galleryTotalCount');

  if (!galleryItems.length || !galleryImage || !slideshowModal) {
    return;
  }

  const safeIndex = Math.max(0, Math.min(index, galleryItems.length - 1));
  const currentItem = galleryItems[safeIndex];

  state.gallerySlideshowIndex = safeIndex;
  galleryImage.src = currentItem.image;
  galleryImage.alt = currentItem.title;
  galleryTitle.textContent = currentItem.title;
  galleryCategory.textContent = currentItem.category;
  galleryCurrentIndex.textContent = String(safeIndex + 1);
  galleryTotalCount.textContent = String(galleryItems.length);
  slideshowModal.classList.remove('hidden');
}

function closeGallerySlideshow() {
  const slideshowModal = document.getElementById('galleryModal');
  if (slideshowModal) {
    slideshowModal.classList.add('hidden');
  }
}

function moveGallerySlideshow(direction) {
  const galleryItems = getFilteredGalleryItems();
  if (!galleryItems.length) {
    return;
  }

  const nextIndex = Math.max(
    0,
    Math.min((state.gallerySlideshowIndex ?? 0) + direction, galleryItems.length - 1)
  );

  openGallerySlideshow(nextIndex);
}

function handleJoinMemberClick() {
  openSignupModal();
}

function exportMembersOverview() {
  const headers = [
    'Name',
    'Role',
    'Engagement',
    'Status',
    'Email',
    'Date of Birth',
    'Age',
    'Day Born Group',
    'Location',
    'Employment Status',
    'Employment Detail',
    'Contact',
    'Emergency Contact',
  ];

  const rows = state.members.map((member) => [
    member.name || '',
    member.role || '',
    member.engagement || '',
    member.status || '',
    member.email || '',
    member.dob || '',
    member.age || '',
    member.dayBornGroup || '',
    member.location || '',
    member.employmentStatus || '',
    member.employmentDetail || '',
    member.contact || '',
    member.emergencyContact || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'mmogcc-youth-members.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}

function bindHomepageActions() {
  const joinMemberBtn = document.getElementById('joinMemberBtn');
  if (joinMemberBtn) {
    joinMemberBtn.addEventListener('click', handleJoinMemberClick);
  }

  const closeSignupModalBtn = document.getElementById('closeSignupModalBtn');
  if (closeSignupModalBtn) {
    closeSignupModalBtn.addEventListener('click', closeSignupModal);
  }

  const closeGalleryModalBtn = document.getElementById('closeGalleryModalBtn');
  if (closeGalleryModalBtn) {
    closeGalleryModalBtn.addEventListener('click', closeGallerySlideshow);
  }

  const galleryPrevBtn = document.getElementById('galleryPrevBtn');
  if (galleryPrevBtn) {
    galleryPrevBtn.addEventListener('click', () => moveGallerySlideshow(-1));
  }

  const galleryNextBtn = document.getElementById('galleryNextBtn');
  if (galleryNextBtn) {
    galleryNextBtn.addEventListener('click', () => moveGallerySlideshow(1));
  }

  const exportMembersBtn = document.getElementById('exportMembersBtn');
  if (exportMembersBtn) {
    exportMembersBtn.addEventListener('click', exportMembersOverview);
  }

  const galleryGrid = document.getElementById('galleryGrid');
  if (galleryGrid) {
    galleryGrid.addEventListener('click', (event) => {
      const deleteButton = event.target.closest('.delete-btn');
      if (deleteButton) {
        return;
      }

      const galleryCard = event.target.closest('.gallery-card');
      if (!galleryCard) {
        return;
      }

      const galleryIndex = Number(galleryCard.dataset.galleryIndex);
      if (!Number.isNaN(galleryIndex)) {
        openGallerySlideshow(galleryIndex);
      }
    });
  }
}

async function init() {
  await hydrateStateFromServer();
  setupDashboardButtons();
  setupFilterButtons();
  bindFormHandlers();
  bindDeleteHandlers();
  bindAuthHandlers();
  bindHomepageActions();
  bindChatbotHandlers();
  bindMemberOverviewControls();
  renderDashboardContent();
  updateAuthUI();
  switchDashboard('admin');
}

init();
