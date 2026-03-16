// ---------- JAVASCRIPT IS COMPLETELY UNCHANGED AS REQUESTED (EXTENDED, NON-BREAKING) ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, where, limit,
  serverTimestamp, updateDoc, getDocs, deleteDoc, writeBatch, addDoc, deleteField
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
// ---------- CONFIG ----------
const firebaseConfig = {
  apiKey: "AIzaSyCBBm3pHDVgUYs2BTzwVwtTwC-cOAFjKWo",
  authDomain: "chakachaka-e672a.firebaseapp.com",
  projectId: "chakachaka-e672a",
  storageBucket: "chakachaka-e672a.firebasestorage.app",
  messagingSenderId: "226377707807",
  appId: "1:226377707807:web:08f207a259c4e75ab8402a",
  measurementId: "G-14NQJL3Q1J"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- TURSO SYNC BRIDGE ---
const BACKEND_URL = 'https://chaka-backend-4-v1-1.onrender.com';

/**
 * After any admin save to Firestore, call this to sync the data to Turso.
 * type: 'config' | 'personalities' | 'announcements'
 */
async function syncToTurso(type) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/db/sync/${type}`, { method: 'POST' });
    if (res.ok) {
      console.log(`✅ Synced ${type} to Turso`);
    } else {
      console.warn(`⚠️ Turso sync failed for ${type}:`, await res.text());
    }
  } catch (e) {
    console.warn(`⚠️ Turso sync error for ${type}:`, e.message);
  }
}

// ---------- DOM REFS ----------
const appEl = document.getElementById('app');
const loginScreen = document.getElementById('loginScreen');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const toastContainer = document.getElementById('toastContainer');

const views = ['dashboard', 'announcements', 'moderation', 'personalities', 'apikeys', 'config', 'users', 'sessions', 'chats', 'logs'];
const pageTitle = document.getElementById('pageTitle');
const adminStatus = document.getElementById('adminStatus');
const adminEmail = document.getElementById('adminEmail');
const navButtons = document.querySelectorAll('.nav button[data-view]');

// dashboard refs
const totalUsersEl = document.getElementById('totalUsers');
const totalSessionsEl = document.getElementById('totalSessions');
const recentList = document.getElementById('recentList');

// Announcement refs
const announcementForm = document.getElementById('announcementForm');
const announcementTitleInput = document.getElementById('announcementTitle');
const announcementDescriptionInput = document.getElementById('announcementDescription');
const announcementFullContentInput = document.getElementById('announcementFullContent');
const announcementMediaFileInput = document.getElementById('announcementMediaFile');
const announcementMediaPreview = document.getElementById('announcementMediaPreview');
const announcementMediaTypeSelect = document.getElementById('announcementMediaType');
const announcementIsActiveSelect = document.getElementById('announcementIsActive');

// moderation refs
const blockedUsersList = document.getElementById('blocked-users-list');
const blockedSessionsList = document.getElementById('blocked-sessions-list');

// personalities refs
const addPersonalityForm = document.getElementById('addPersonalityForm');
const personalityNameInput = document.getElementById('personalityName');
const personalityDescriptionInput = document.getElementById('personalityDescription');
const personalityPersonaInput = document.getElementById('personalityPersona');
const personalityVideoFileInput = document.getElementById('personalityVideoFile');
const personalitiesList = document.getElementById('personalitiesList');
const editPersonalityModal = document.getElementById('editPersonalityModal');
const editPersonalityForm = document.getElementById('editPersonalityForm');
const editPersonalityId = document.getElementById('editPersonalityId');
const editPersonalityName = document.getElementById('editPersonalityName');
const editPersonalityDescription = document.getElementById('editPersonalityDescription');
const editPersonalityPersona = document.getElementById('editPersonalityPersona');
const editPersonalityVideoFileInput = document.getElementById('editPersonalityVideoFile');
const currentVideoStatus = document.getElementById('currentVideoStatus');
const removeVideoBtn = document.getElementById('removeVideoBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const closeEditModalOverlay = document.getElementById('closeEditModalOverlay');

// apikeys refs
const apiKeysList = document.getElementById('apiKeysList');
const newKeyType = document.getElementById('newKeyType');
const newKeyInput = document.getElementById('newKeyInput');
const addApiKeyBtn = document.getElementById('addApiKeyBtn');
const newKeyVoiceIdGroup = document.getElementById('newKeyVoiceIdGroup');
const newKeyVoiceId = document.getElementById('newKeyVoiceId');

// config refs
const cfgBotName = document.getElementById('cfgBotName');
const cfgWelcomeMessage = document.getElementById('cfgWelcomeMessage');
const cfgAllowFile = document.getElementById('cfgAllowFile');
const cfgBotBubble = document.getElementById('cfgBotBubble');
const cfgUserBubble = document.getElementById('cfgUserBubble');
const cfgTheme = document.getElementById('cfgTheme');
const cfgActive = document.getElementById('cfgActive');
const profileImageFile = document.getElementById('profileImageFile');
const uploadProfileBtn = document.getElementById('uploadProfileBtn');
const profileUploadProgress = document.getElementById('profileUploadProgress');
const profileUploadProgressFill = document.getElementById('profileUploadProgressFill');
const profileUploadProgressText = document.getElementById('profileUploadProgressText');
const profileMediaPreview = document.getElementById('profileMediaPreview');
const removeProfileMediaBtn = document.getElementById('removeProfileMediaBtn');
const exportConfigBtn = document.getElementById('exportConfigBtn');
const importConfigInput = document.getElementById('importConfigInput');
const undoConfigBtn = document.getElementById('undoConfigBtn');
const configDiffList = document.getElementById('configDiffList');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const toggleActiveBtn = document.getElementById('toggleActiveBtn');
const saveQuickConfig = document.getElementById('saveQuickConfig');

// Prompt Suggestion DOM refs
const promptSuggestionsList = document.getElementById('promptSuggestionsList');
const addSuggestionBtn = document.getElementById('addSuggestionBtn');
const newSuggestionIcon = document.getElementById('newSuggestionIcon');
const newSuggestionTitle = document.getElementById('newSuggestionTitle');
const newSuggestionPrompt = document.getElementById('newSuggestionPrompt');
const addSuggestionSection = document.getElementById('addSuggestionSection');
const moderationTemplates = document.getElementById('moderationTemplates');

// users refs
const usersList = document.getElementById('usersList');

// sessions refs
const sessionsUserSelect = document.getElementById('sessionsUserSelect');
const sessionsList = document.getElementById('sessionsList');
const sessionMessages = document.getElementById('sessionMessages');
// live chats refs
const liveUserSelect = document.getElementById('liveUserSelect');
const liveSessionSelect = document.getElementById('liveSessionSelect');
const watchBtn = document.getElementById('watchBtn');
const liveChatArea = document.getElementById('liveChatArea');
// logs refs
const logsList = document.getElementById('logsList');
const adminAuditList = document.getElementById('adminAuditList');

const signOutBtn = document.getElementById('signOutBtn');

// ---------- STATE ----------
let currentView = 'dashboard';
let configUnsub = null;
let usersUnsub = null;
let chatsUnsub = null;
let latestConfig = null;
let sessionsUnsubs = [];
let personalitiesUnsub = null;
let videoShouldBeRemoved = false;
let announcementUnsub = null;
let lastConfigBackup = null;
let auditUnsub = null;

// ---------- UI HELPERS ----------
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width:20px;height:20px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${message}`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

const CONFIG_KEYS = [
  'botName',
  'welcomeMessage',
  'allowFileUpload',
  'botBubbleColor',
  'userBubbleColor',
  'themeColor',
  'active',
  'profileImage',
  'profileMediaType',
  'promptSuggestions',
  'apiKeys'
];

function pickConfigFields(source) {
  const out = {};
  CONFIG_KEYS.forEach((k) => {
    if (source && Object.prototype.hasOwnProperty.call(source, k)) {
      out[k] = source[k];
    }
  });
  return out;
}

function getConfigFormData() {
  return {
    botName: cfgBotName.value.trim(),
    welcomeMessage: cfgWelcomeMessage.value.trim(),
    allowFileUpload: cfgAllowFile.value === 'true',
    botBubbleColor: cfgBotBubble.value.trim(),
    userBubbleColor: cfgUserBubble.value.trim(),
    themeColor: cfgTheme.value.trim(),
    active: cfgActive.value === 'true'
  };
}

function renderConfigDiff() {
  if (!configDiffList) return;
  configDiffList.innerHTML = '';
  if (!latestConfig) {
    configDiffList.innerHTML = '<div class="small">No config loaded yet.</div>';
    return;
  }

  const current = getConfigFormData();
  const baseline = {
    botName: latestConfig.botName || '',
    welcomeMessage: latestConfig.welcomeMessage || '',
    allowFileUpload: latestConfig.allowFileUpload ? true : false,
    botBubbleColor: latestConfig.botBubbleColor || '',
    userBubbleColor: latestConfig.userBubbleColor || '',
    themeColor: latestConfig.themeColor || '',
    active: (latestConfig.active !== false)
  };

  const changes = Object.keys(current).filter((key) => {
    return JSON.stringify(current[key]) !== JSON.stringify(baseline[key]);
  });

  if (changes.length === 0) {
    configDiffList.innerHTML = '<div class="small">No pending changes.</div>';
    return;
  }

  changes.forEach((key) => {
    const row = document.createElement('div');
    row.className = 'diff-row';
    row.innerHTML = `<strong>${key}</strong><span class="small"> → ${String(current[key])}</span>`;
    configDiffList.appendChild(row);
  });
}

function storeConfigBackup(reason = 'manual') {
  if (!latestConfig) return;
  const snapshot = {
    data: pickConfigFields(latestConfig),
    reason,
    savedAt: Date.now()
  };
  lastConfigBackup = snapshot;
  try {
    localStorage.setItem('last_config_backup', JSON.stringify(snapshot));
  } catch (_) { }
}

function loadConfigBackup() {
  if (lastConfigBackup) return lastConfigBackup;
  try {
    const raw = localStorage.getItem('last_config_backup');
    if (raw) lastConfigBackup = JSON.parse(raw);
  } catch (_) { }
  return lastConfigBackup;
}

async function logAdminAction(action, details = {}) {
  try {
    const admin = auth.currentUser;
    await addDoc(collection(db, 'admin_audit'), {
      action,
      details,
      adminId: admin?.uid || null,
      adminEmail: admin?.email || null,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.warn('Failed to log admin action', e);
  }
}

function isLikelyVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return ['.mp4', '.webm', '.ogg', '.mov', '.m4v'].some(ext => cleanUrl.endsWith(ext));
}

function renderProfileMediaPreview(url, mediaType) {
  if (!profileMediaPreview) return;
  profileMediaPreview.innerHTML = '';
  if (!url) {
    const empty = document.createElement('div');
    empty.className = 'small';
    empty.textContent = 'No media uploaded yet.';
    profileMediaPreview.appendChild(empty);
    return;
  }

  const isVideo = mediaType === 'video' || isLikelyVideoUrl(url);
  const mediaEl = document.createElement(isVideo ? 'video' : 'img');
  mediaEl.src = url;
  mediaEl.className = 'profile-media-preview-item';
  if (isVideo) {
    mediaEl.muted = true;
    mediaEl.loop = true;
    mediaEl.autoplay = true;
    mediaEl.playsInline = true;
    mediaEl.controls = true;
  } else {
    mediaEl.alt = 'Profile media preview';
  }
  profileMediaPreview.appendChild(mediaEl);
}

async function withLoader(button, asyncFn) {
  const originalContent = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `<div class="loader"></div>`;
  try {
    await asyncFn();
  } catch (error) {
    console.error("Operation failed:", error);
    showToast(error.message, 'error');
  } finally {
    button.disabled = false;
    button.innerHTML = originalContent;
  }
}

function showView(name) {
  currentView = name;
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  pageTitle.textContent = capitalized;
  document.title = `Temple AI — ${capitalized}`;
  views.forEach(v => {
    const viewEl = document.getElementById('view-' + v);
    if (viewEl) {
      viewEl.classList.toggle('hidden', v !== name);
    }
  });
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.view === name));
}
navButtons.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));

// ---------- AUTH ----------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = e.submitter;
  await withLoader(button, async () => {
    try {
      await signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value);
    } catch (err) {
      showToast('Sign-in failed: ' + err.message, 'error');
    }
  });
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // === ✅ NEW AUTHENTICATION LOGIC INTEGRATED HERE ===
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists() && adminSnap.data().role === "admin") {
      // User IS an admin, proceed to load the admin panel
      console.log("✅ Admin detected:", user.email);
      adminStatus.textContent = 'Signed in as';
      adminEmail.textContent = user.email || user.uid;
      loginScreen.classList.add('hidden');
      appEl.classList.remove('loading');
      initAdmin();
    } else {
      // User is NOT an admin, deny access
      console.log("👤 Access Denied for user:", user.email);
      adminStatus.textContent = 'Not authorized';
      adminEmail.textContent = 'Unauthorized';
      await signOut(auth); // Sign out the non-admin user
      showToast('Access denied. You do not have admin privileges.', 'error');
      loginScreen.classList.remove('hidden'); // Show the login screen
      appEl.classList.add('loading'); // Hide the admin panel content
    }
    // === END OF NEW AUTHENTICATION LOGIC ===
  } else {
    // User is not logged in
    adminStatus.textContent = 'Not signed in';
    adminEmail.textContent = '--';
    loginScreen.classList.remove('hidden');
    appEl.classList.add('loading');
  }
});

signOutBtn.addEventListener('click', async () => { await signOut(auth); location.reload(); });

// ---------- CORE LOGIC ----------
async function initAdmin() {
  await migrateOriginalPersona();
  subscribeConfig();
  subscribeUsers();
  subscribeLogs();
  subscribeAuditLogs();
  subscribeModeration();
  initModerationTemplates();
  subscribePersonalities();
  initAnnouncements();
  showView('dashboard');
  getAllSessionsCount().catch(() => { });
  refreshRecentActivity().catch(() => { });
  newKeyType.addEventListener('change', () => {
    const showVoice = newKeyType.value === 'tts' || newKeyType.value === 'multimodal-live';
    newKeyVoiceIdGroup.classList.toggle('hidden', !showVoice);
  });
  setInterval(() => {
    getAllSessionsCount().catch(() => { });
    refreshRecentActivity().catch(() => { });
  }, 10000);

  const configInputs = [cfgBotName, cfgWelcomeMessage, cfgAllowFile, cfgBotBubble, cfgUserBubble, cfgTheme, cfgActive];
  configInputs.forEach((el) => {
    if (!el) return;
    el.addEventListener('input', renderConfigDiff);
    el.addEventListener('change', renderConfigDiff);
  });

  if (exportConfigBtn) {
    exportConfigBtn.addEventListener('click', () => {
      if (!latestConfig) { showToast('No config loaded.', 'error'); return; }
      const data = { ...latestConfig };
      delete data.liveStatus;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `config-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      logAdminAction('config_export', { size: blob.size });
    });
  }

  if (importConfigInput) {
    importConfigInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!confirm('Import config and overwrite current settings?')) return;
        const allowedKeys = CONFIG_KEYS.concat(['persona', 'welcomeMessage']);
        const update = {};
        allowedKeys.forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(parsed, key)) {
            update[key] = parsed[key];
          }
        });
        storeConfigBackup('import');
        await setDoc(doc(db, 'config', 'global'), update, { merge: true });
        logAdminAction('config_import', { keys: Object.keys(update) });
      showToast('Config imported.');
      syncToTurso('config');
      } catch (err) {
        showToast('Import failed: ' + err.message, 'error');
      } finally {
        e.target.value = '';
      }
    });
  }

  if (undoConfigBtn) {
    undoConfigBtn.addEventListener('click', async (e) => {
      const backup = loadConfigBackup();
      if (!backup?.data) { showToast('No backup available.', 'error'); return; }
      if (!confirm('Undo last config save?')) return;
      await setDoc(doc(db, 'config', 'global'), backup.data, { merge: true });
      logAdminAction('config_undo', { reason: backup.reason, savedAt: backup.savedAt });
      showToast('Undo applied.');
    });
  }
}

// ---------- ANNOUNCEMENT LOGIC (UNCHANGED) ----------
function initAnnouncements() {
  const announcementRef = doc(db, 'announcements', 'latest');

  if (announcementUnsub) announcementUnsub();
  announcementUnsub = onSnapshot(announcementRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      announcementTitleInput.value = data.title || '';
      announcementDescriptionInput.value = data.description || '';
      announcementFullContentInput.value = data.fullContent || '';
      announcementMediaTypeSelect.value = data.mediaType || 'image';
      announcementIsActiveSelect.value = data.isActive ? 'true' : 'false';

      announcementMediaPreview.innerHTML = '';
      if (data.mediaUrl) {
        let mediaEl;
        if (data.mediaType === 'video') {
          mediaEl = document.createElement('video');
          mediaEl.src = data.mediaUrl;
          mediaEl.controls = true;
        } else {
          mediaEl = document.createElement('img');
          mediaEl.src = data.mediaUrl;
        }
        announcementMediaPreview.appendChild(mediaEl);
      } else {
        announcementMediaPreview.innerHTML = '<span class="small">No media uploaded</span>';
      }
    }
  });

  announcementForm.addEventListener('submit', (e) => {
    e.preventDefault();
    withLoader(e.submitter, handleAnnouncementSubmit);
  });
}

async function handleAnnouncementSubmit() {
  const title = announcementTitleInput.value.trim();
  const description = announcementDescriptionInput.value.trim();
  const fullContent = announcementFullContentInput.value.trim();
  const mediaFile = announcementMediaFileInput.files[0];
  const mediaType = announcementMediaTypeSelect.value;
  const isActive = announcementIsActiveSelect.value === 'true';

  if (!title || !description || !fullContent) {
    throw new Error('Title, Description, and Full Details are required.');
  }

  let mediaUrl = null;
  if (mediaFile) {
    const resourceType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
    mediaUrl = await uploadToCloudinary(mediaFile, resourceType);
  } else {
    const existingDoc = await getDoc(doc(db, 'announcements', 'latest'));
    if (existingDoc.exists()) {
      mediaUrl = existingDoc.data().mediaUrl || null;
    }
  }

  const announcementData = {
    id: 'anno_' + Date.now(),
    title,
    description,
    fullContent,
    mediaUrl,
    mediaType,
    isActive,
    createdAt: serverTimestamp()
  };

  await setDoc(doc(db, 'announcements', 'latest'), announcementData);
  showToast('Announcement published successfully!');
  syncToTurso('announcements');
  announcementMediaFileInput.value = '';
}

// ---------- ALL OTHER FUNCTIONS (UNCHANGED) ----------

function subscribeModeration() {
  const usersQuery = query(collection(db, "users"), where("blocked", "==", true));
  onSnapshot(usersQuery, (snap) => {
    blockedUsersList.innerHTML = "";
    if (snap.empty) {
      blockedUsersList.innerHTML = '<div class="small" style="padding: 1rem">No blocked users found. ✅</div>';
      return;
    }
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const el = document.createElement("div");
      el.className = 'card';
      el.style.marginBottom = '1rem';
      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; 
 flex-wrap: wrap; gap: 1rem;">
          <div style="word-break: break-all;">
            <strong>${docSnap.id}</strong>
            <div class="small">Reason: ${data.blockReason || "Blocked by admin"}</div>
          </div>
          <button class="btn ghost danger">Unblock</button>
        </div>`;
      el.querySelector('button').onclick = () => toggleUserBlock(docSnap.id, false);
      blockedUsersList.appendChild(el);
    });
  });
  subscribeBlockedSessions();
}

function subscribeBlockedSessions() {
  sessionsUnsubs.forEach(unsub => unsub());
  sessionsUnsubs = [];
  const allUsersRef = collection(db, "users");
  onSnapshot(allUsersRef, (usersSnap) => {
    let allBlockedSessions = [];
    const promises = usersSnap.docs.map(userDoc => {
      const sessionsCol = collection(db, "sessions", userDoc.id, "items");
      const q = query(sessionsCol, where("blocked", "==", true));
      return getDocs(q).then(sessionsSnap => {
        sessionsSnap.forEach(sessionDoc => {

          allBlockedSessions.push({
            userId: userDoc.id,
            sessionId: sessionDoc.id,
            data: sessionDoc.data(),

            ref: sessionDoc.ref
          });
        });
      });
    });
    Promise.all(promises).then(() => renderBlockedSessions(allBlockedSessions));
  });
}

function renderBlockedSessions(sessions) {
  blockedSessionsList.innerHTML = "";
  if (sessions.length === 0) {
    blockedSessionsList.innerHTML = '<div class="small" style="padding: 1rem">No blocked sessions found. ✅</div>';
    return;
  }
  sessions.forEach(s => {
    const el = document.createElement("div");
    el.className = 'card'; el.style.marginBottom = '1rem';
    el.innerHTML = `
           <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap: wrap; gap: 1rem;">
             <div style="word-break: break-all;">
               <strong>${s.sessionId}</strong>
          
             <div class="small">User: ${s.userId}</div>
               <div class="small">Reason: ${s.data.blockReason || "Triggered"}</div>
             </div>
             <button class="btn ghost danger">Unblock</button>
           </div>`;
    el.querySelector('button').onclick = async () => {
      await updateDoc(s.ref, { blocked: false });

      showToast('Session unblocked.');
    };
    blockedSessionsList.appendChild(el);
  });
}

function subscribeConfig() {
  const ref = doc(db, 'config', 'global');
  if (configUnsub) configUnsub();
  configUnsub = onSnapshot(ref, snap => {
    if (!snap.exists()) { latestConfig = {}; return; }
    latestConfig = snap.data();
    cfgBotName.value = latestConfig.botName || '';
    cfgWelcomeMessage.value = latestConfig.welcomeMessage || '';
    cfgAllowFile.value = latestConfig.allowFileUpload ? 'true' : 'false';
    cfgBotBubble.value = latestConfig.botBubbleColor || '';
    cfgUserBubble.value = latestConfig.userBubbleColor || '';
    cfgTheme.value = latestConfig.themeColor || '';
    cfgActive.value = (latestConfig.active !== false) ? 'true' : 'false';
    renderProfileMediaPreview(latestConfig.profileImage || '', latestConfig.profileMediaType || '');
    toggleActiveBtn.textContent = (latestConfig.active !== false) ? 'Deactivate Bot' : 'Activate Bot';

    renderApiKeys(latestConfig.apiKeys || {}, latestConfig.liveStatus || {});
    renderPromptSuggestions(latestConfig.promptSuggestions || []);
    renderConfigDiff();
  });
}

async function uploadToCloudinary(file, resourceType = 'auto', onProgress = null) {
  const CLOUDINARY_CLOUD_NAME = "dvjs45kft";
  const CLOUDINARY_UPLOAD_PRESET = "vevapvkv";

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  showToast(`Uploading ${resourceType}...`, 'success');
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.responseType = 'json';

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress({ loaded: event.loaded, total: event.total });
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = xhr.response || {};
        if (data.secure_url) {
          resolve(data.secure_url);
        } else {
          reject(new Error('Upload succeeded but no URL returned.'));
        }
      } else {
        const errorMessage = xhr.response?.error?.message || `Failed to upload ${resourceType} to Cloudinary.`;
        reject(new Error(errorMessage));
      }
    };

    xhr.onerror = () => reject(new Error(`Failed to upload ${resourceType} to Cloudinary.`));
    xhr.send(formData);
  });
}

async function migrateOriginalPersona() {
  try {
    const configRef = doc(db, 'config', 'global');
    const configSnap = await getDoc(configRef);

    if (configSnap.exists() && configSnap.data().persona) {
      const originalPersonaText = configSnap.data().persona;

      const personalitiesRef = collection(db, 'personalities');
      const q = query(personalitiesRef, where("name", "==", "Original Persona"));
      const existing = await getDocs(q);

      if (existing.empty) {
        console.log("Migrating original persona...");
        const currentPersonalities = await getDocs(personalitiesRef);
        const isFirstPersonality = currentPersonalities.empty;

        await addDoc(personalitiesRef, {
          name: "Original Persona",
          description: "The classic, original AI persona.",
          persona: originalPersonaText,
          isDefault: isFirstPersonality,
          createdAt: serverTimestamp()
        });

        if (!isFirstPersonality) {
          await updateDoc(configRef, { persona: deleteField() });
        }
        showToast('Original persona migrated successfully!');
      } else {
        await updateDoc(configRef, { persona: deleteField() });
      }
    }
  } catch (e) {
    console.error("Persona migration failed:", e);
  }
}

function subscribePersonalities() {
  const q = query(collection(db, 'personalities'), orderBy('createdAt', 'desc'));
  if (personalitiesUnsub) personalitiesUnsub();

  personalitiesUnsub = onSnapshot(q, (snapshot) => {
    personalitiesList.innerHTML = '';
    if (snapshot.empty) {
      personalitiesList.innerHTML = '<p class="small" style="padding: 1rem; text-align: center;">No personalities created yet. Add one to get started!</p>';
      return;
    }

    snapshot.forEach(docSnap => {
      const personality = { id: docSnap.id, ...docSnap.data() };
      const card = document.createElement('div');
      card.className = 'personality-card';
      card.innerHTML = `
                <div class="personality-header">
                    <div class="personality-info">
                        <h4 class="personality-name">${personality.name}</h4>
                        ${personality.isDefault ? '<span class="default-badge">Default</span>' : ''}
                    </div>
                    <div class="personality-actions">
                        <button class="btn ghost set-default-btn" ${personality.isDefault ? 'disabled' : ''}>Set Default</button>
                        <button class="btn ghost edit-btn">Edit</button>
                        <button class="btn danger delete-btn">Delete</button>
                    </div>
                </div>
                <p class="personality-persona">${personality.persona}</p>
            `;
      personalitiesList.appendChild(card);

      card.querySelector('.set-default-btn').addEventListener('click', (e) => {
        withLoader(e.currentTarget, () => handleSetDefaultPersonality(personality.id));
      });
      card.querySelector('.edit-btn').addEventListener('click', () => {
        openEditModal(personality.id, personality.name, personality.persona, personality.description || '', personality.videoUrl || null);
      });
      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        withLoader(e.currentTarget, () => handleDeletePersonality(personality.id, personality.isDefault));
      });
    });
  });
}

addPersonalityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const button = e.submitter;
  withLoader(button, async () => {
    const name = personalityNameInput.value.trim();
    const description = personalityDescriptionInput.value.trim();
    const persona = personalityPersonaInput.value.trim();
    const videoFile = personalityVideoFileInput.files[0];

    if (!name || !persona) {
      showToast('Name and Persona are required.', 'error');
      return;
    }

    let videoUrl = null;
    if (videoFile) {
      videoUrl = await uploadToCloudinary(videoFile, 'video');
    }

    const personalitiesRef = collection(db, 'personalities');
    const currentPersonalities = await getDocs(personalitiesRef);

    const newPersonality = {
      name,
      description,
      persona,
      videoUrl,
      isDefault: currentPersonalities.empty,
      createdAt: serverTimestamp()
    };

    await addDoc(personalitiesRef, newPersonality);
    syncToTurso('personalities');

    if (currentPersonalities.empty) {
      const configRef = doc(db, 'config', 'global');
      await setDoc(configRef, { persona: persona }, { merge: true });
    }

    showToast('Personality added successfully!');
    addPersonalityForm.reset();
  });
});

async function handleSetDefaultPersonality(docId) {
  const batch = writeBatch(db);
  const personalitiesRef = collection(db, 'personalities');

  const snapshot = await getDocs(personalitiesRef);
  snapshot.forEach(docSnap => {
    batch.update(docSnap.ref, { isDefault: (docSnap.id === docId) });
  });
  await batch.commit();

  const newDefaultRef = doc(db, 'personalities', docId);
  const newDefaultSnap = await getDoc(newDefaultRef);
  if (newDefaultSnap.exists()) {
    const personalityData = newDefaultSnap.data();
    const configRef = doc(db, 'config', 'global');
    await setDoc(configRef, {
      persona: personalityData.persona
    }, { merge: true });
  }

  showToast('Default personality updated!');
}

async function handleDeletePersonality(docId, isDefault) {
  if (isDefault) {
    showToast("Cannot delete the default personality.", 'error');
    return;
  }
  if (confirm(`Are you sure you want to delete this personality? This cannot be undone.`)) {
    await deleteDoc(doc(db, 'personalities', docId));
    showToast('Personality deleted.', 'error');
    syncToTurso('personalities');
  }
}

function openEditModal(id, name, persona, description, videoUrl) {
  editPersonalityId.value = id;
  editPersonalityName.value = name;
  editPersonalityPersona.value = persona;
  editPersonalityDescription.value = description;

  videoShouldBeRemoved = false;
  editPersonalityVideoFileInput.value = '';

  if (videoUrl) {
    currentVideoStatus.innerHTML = `Current: <a href="${videoUrl}" target="_blank" rel="noopener">View Video</a>`;
    removeVideoBtn.classList.remove('hidden');
  } else {
    currentVideoStatus.textContent = 'No preview video uploaded.';
    removeVideoBtn.classList.add('hidden');
  }

  editPersonalityModal.classList.remove('hidden');
}

function closeEditModal() {
  editPersonalityModal.classList.add('hidden');
  editPersonalityForm.reset();
}

cancelEditBtn.addEventListener('click', closeEditModal);
closeEditModalOverlay.addEventListener('click', closeEditModal);

removeVideoBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to remove the video for this personality?')) {
    videoShouldBeRemoved = true;
    currentVideoStatus.textContent = 'Video will be removed on save.';
    removeVideoBtn.classList.add('hidden');
    showToast('Video marked for removal.', 'success');
  }
});

editPersonalityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const button = e.submitter;
  withLoader(button, async () => {
    const id = editPersonalityId.value;
    const name = editPersonalityName.value.trim();
    const description = editPersonalityDescription.value.trim();
    const persona = editPersonalityPersona.value.trim();
    const newVideoFile = editPersonalityVideoFileInput.files[0];

    if (!id || !name || !persona) {
      showToast('Name and Persona are required.', 'error');
      return;
    }

    const personalityRef = doc(db, 'personalities', id);
    const updateData = { name, description, persona };

    if (videoShouldBeRemoved) {
      updateData.videoUrl = deleteField();
    } else if (newVideoFile) {
      updateData.videoUrl = await uploadToCloudinary(newVideoFile, 'video');
    }

    await updateDoc(personalityRef, updateData);

    const personalitySnap = await getDoc(personalityRef);
    if (personalitySnap.exists() && personalitySnap.data().isDefault) {
      const configRef = doc(db, 'config', 'global');
      await setDoc(configRef, { persona: persona }, { merge: true });
    }

    showToast('Personality updated successfully!');
    syncToTurso('personalities');
    closeEditModal();
  });
});

async function saveConfig() {
  const ref = doc(db, 'config', 'global');
  const obj = {
    botName: cfgBotName.value.trim(),
    welcomeMessage: cfgWelcomeMessage.value.trim(),
    allowFileUpload: cfgAllowFile.value === 'true',
    botBubbleColor: cfgBotBubble.value.trim(),
    userBubbleColor: cfgUserBubble.value.trim(),
    themeColor: cfgTheme.value.trim(),
    active: cfgActive.value === 'true'
  };
  try {
    storeConfigBackup('save_config');
    await setDoc(ref, obj, { merge: true });
    logAdminAction('config_save', { keys: Object.keys(obj) });
    showToast('Settings saved!');
    syncToTurso('config');
  } catch (e) { showToast('Failed: ' + e.message, 'error'); }
}
saveConfigBtn.addEventListener('click', (e) => withLoader(e.currentTarget, saveConfig));
toggleActiveBtn.addEventListener('click', (e) => withLoader(e.currentTarget, async () => {
  const ref = doc(db, 'config', 'global');
  const current = (latestConfig && latestConfig.active !== false);
  storeConfigBackup('toggle_active');
  await setDoc(ref, { active: !current }, { merge: true });
  logAdminAction('config_toggle_active', { active: !current });
  showToast(`Bot ${!current ? 'activated' : 'deactivated'}.`);
  syncToTurso('config');
}));
saveQuickConfig.addEventListener('click', (e) => withLoader(e.currentTarget, async () => {
  const ref = doc(db, 'config', 'global');
  const appearanceSettings = {
    themeColor: cfgTheme.value.trim(),
    botBubbleColor: cfgBotBubble.value.trim(),
    userBubbleColor: cfgUserBubble.value.trim()
  };
  storeConfigBackup('save_appearance');
  await setDoc(ref, appearanceSettings, { merge: true });
  logAdminAction('config_save_appearance', { keys: Object.keys(appearanceSettings) });
  showToast('Appearance saved!');
  syncToTurso('config');
}));
uploadProfileBtn.addEventListener('click', (e) => withLoader(e.currentTarget, async () => {
  const f = profileImageFile.files[0];
  if (!f) { showToast('Select an image or video.', 'error'); return; }

  const isVideo = typeof f.type === 'string' && f.type.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';
  const MAX_PROFILE_MB = 20;
  const MAX_VIDEO_SECONDS = 60;

  if (f.size > MAX_PROFILE_MB * 1024 * 1024) {
    showToast(`File too large. Max ${MAX_PROFILE_MB}MB.`, 'error');
    return;
  }

  if (isVideo) {
    const durationSeconds = await new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const objectUrl = URL.createObjectURL(f);
      const cleanup = () => URL.revokeObjectURL(objectUrl);
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const seconds = Number(video.duration) || 0;
        cleanup();
        resolve(seconds);
      };
      video.onerror = () => {
        cleanup();
        reject(new Error('Unable to read video metadata.'));
      };
      video.src = objectUrl;
    });

    if (durationSeconds > MAX_VIDEO_SECONDS) {
      showToast(`Video too long. Max ${MAX_VIDEO_SECONDS} seconds.`, 'error');
      return;
    }
  }

  if (profileUploadProgress) {
    profileUploadProgress.classList.remove('hidden');
  }
  if (profileUploadProgressFill) {
    profileUploadProgressFill.style.width = '0%';
  }
  if (profileUploadProgressText) {
    profileUploadProgressText.textContent = 'Starting upload...';
  }

  try {
    const url = await uploadToCloudinary(f, resourceType, ({ loaded, total }) => {
      const pct = total > 0 ? Math.round((loaded / total) * 100) : 0;
      if (profileUploadProgressFill) {
        profileUploadProgressFill.style.width = `${pct}%`;
      }
      if (profileUploadProgressText) {
        const mb = (bytes) => (bytes / (1024 * 1024)).toFixed(1);
        profileUploadProgressText.textContent = `Uploading ${pct}% (${mb(loaded)}MB / ${mb(total)}MB)`;
      }
    });
    const ref = doc(db, 'config', 'global');
    storeConfigBackup('profile_media_upload');
    await setDoc(ref, { profileImage: url, profileMediaType: resourceType }, { merge: true });
    renderProfileMediaPreview(url, resourceType);
    logAdminAction('profile_media_upload', { type: resourceType, size: f.size });

    if (profileUploadProgressFill) {
      profileUploadProgressFill.style.width = '100%';
    }
    if (profileUploadProgressText) {
      profileUploadProgressText.textContent = 'Upload complete.';
    }
    setTimeout(() => {
      if (profileUploadProgress) {
        profileUploadProgress.classList.add('hidden');
      }
    }, 1500);
    showToast(`${resourceType === 'video' ? 'Video' : 'Image'} uploaded!`);
  } catch (error) {
    if (profileUploadProgressText) {
      profileUploadProgressText.textContent = 'Upload failed. Please try again.';
    }
    throw error;
  }
}));

if (removeProfileMediaBtn) {
  removeProfileMediaBtn.addEventListener('click', (e) => withLoader(e.currentTarget, async () => {
    if (!confirm('Remove current profile media?')) return;
    const ref = doc(db, 'config', 'global');
    storeConfigBackup('profile_media_remove');
    await setDoc(ref, { profileImage: deleteField(), profileMediaType: deleteField() }, { merge: true });
    renderProfileMediaPreview('', '');
    logAdminAction('profile_media_remove');
    showToast('Profile media removed.');
  }));
}

function renderApiKeys(obj, liveStatus = {}) {
  apiKeysList.innerHTML = '';
  const activeKeyId = liveStatus.activeApiKeyId;
  const usageMap = liveStatus.apiKeyUsage || {};
  const failuresMap = liveStatus.apiKeyFailures || {};
  const oneHourAgo = Date.now() - 3600 * 1000;

  const sortedKeys = Object.entries(obj || {}).sort(([idA, keyA], [idB, keyB]) => {
    const aIsActive = idA === activeKeyId;
    const bIsActive = idB === activeKeyId;
    if (aIsActive) return -1;
    if (bIsActive) return 1;

    const aEnabled = keyA.enabled !== false;
    const bEnabled = keyB.enabled !== false;
    if (aEnabled && !bEnabled) return -1;
    if (!aEnabled && bEnabled) return 1;

    const aLastUsed = usageMap[idA]?.seconds || 0;
    const bLastUsed = usageMap[idB]?.seconds || 0;
    return bLastUsed - aLastUsed;
  });

  if (sortedKeys.length === 0) {
    apiKeysList.innerHTML = '<p class="small" style="padding: 1rem;">No API keys have been added yet.</p>';
    return;
  }

  sortedKeys.forEach(([id, k]) => {
    const row = document.createElement('div');
    row.className = 'api-row';
    const isActive = activeKeyId === id;
    const lastUsed = usageMap[id];
    const lastUsedStr = lastUsed ? `Last used: ${new Date(lastUsed.seconds * 1000).toLocaleString()}` : 'Never used';

    const failureTimestamp = failuresMap[id];
    let hasFailedRecently = false;
    if (failureTimestamp && (failureTimestamp.toMillis() > oneHourAgo)) {
      hasFailedRecently = true;
    }

    const isVoiceKey = k.type === 'tts' || k.type === 'multimodal-live';
    const voiceIdHTML = isVoiceKey
      ? `<div class="row" style="margin-top: 0.5rem;">
           <input type="text" class="api-voice-id-input" data-id-voice="${id}" value="${k.voiceId || ''}" placeholder="Voice Name (e.g., Puck, Kore, Zephyr, Charon)">
         </div>`
      : '';

    row.innerHTML = `
      <div class="api-key-info">
        <input type="text" value="${(k.key || '')}" readonly />
        ${voiceIdHTML}
        <div class="api-key-meta">
            <span class="small">${lastUsedStr}</span>
            ${isActive ? '<span class="status-badge active">In Use</span>' : ''}
            ${hasFailedRecently && !isActive ? '<span class="status-badge failed">Failed Recently</span>' : ''}
        </div>
      </div>
            <select data-id-type="${id}"><option>text</option><option>image</option><option>tts</option><option>search</option><option>code</option><option>whisper</option><option>email</option><option>multimodal-live</option></select>

      <label class="row" style="cursor:pointer"><input type="checkbox" data-enabled="${id}" ${k.enabled !== false ? 'checked' : ''}/> enabled</label>
      <button data-del="${id}" class="btn ghost danger">Delete</button>
    `;

    apiKeysList.appendChild(row);
    row.querySelector('select').value = k.type || 'text';
    row.querySelector(`[data-del]`).addEventListener('click', () => removeApiKey(id));
    row.querySelector(`[data-enabled]`).addEventListener('change', (e) => toggleApiKeyEnabled(id, e.target.checked));
    row.querySelector(`select`).addEventListener('change', (e) => updateApiKeyType(id, e.target.value));

    const voiceIdInput = row.querySelector('.api-voice-id-input');
    if (voiceIdInput) {
      voiceIdInput.addEventListener('change', (e) => updateApiKeyVoiceId(id, e.target.value.trim()));
    }
  });
}

addApiKeyBtn.addEventListener('click', (e) => withLoader(e.currentTarget, async () => {
  const type = newKeyType.value;
  const key = newKeyInput.value.trim();
  if (!key) { showToast('Key cannot be empty.', 'error'); return; }

  const id = 'k_' + Date.now();
  const ref = doc(db, 'config', 'global');
  const update = {};

  const keyData = { key, type, enabled: true };
  if (type === 'tts' || type === 'multimodal-live') {
    const voiceId = newKeyVoiceId.value.trim();
    if (voiceId) {
      keyData.voiceId = voiceId;
    }
  }

  update[`apiKeys.${id}`] = keyData;
  storeConfigBackup('api_key_add');
  await updateDoc(ref, update).catch(async () => { await setDoc(ref, update, { merge: true }); });

  newKeyInput.value = '';
  newKeyVoiceId.value = '';
  logAdminAction('api_key_add', { id, type });
  showToast('API Key added.');
}));

async function removeApiKey(id) {
  if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) return;
  const ref = doc(db, 'config', 'global');
  const updatePayload = {
    [`apiKeys.${id}`]: deleteField()
  };
  try {
    storeConfigBackup('api_key_remove');
    await updateDoc(ref, updatePayload);
    logAdminAction('api_key_remove', { id });
    showToast('API Key removed.', 'error');
  } catch (error) {
    console.error("Failed to delete API key:", error);
    showToast('Error deleting key: ' + error.message, 'error');
  }
}

async function toggleApiKeyEnabled(id, enabled) {
  const ref = doc(db, 'config', 'global');
  const update = {};
  update[`apiKeys.${id}.enabled`] = enabled;
  storeConfigBackup('api_key_toggle');
  await updateDoc(ref, update);
  logAdminAction('api_key_toggle', { id, enabled });
  showToast(`Key ${enabled ? 'enabled' : 'disabled'}.`);
}

async function updateApiKeyType(id, type) {
  const ref = doc(db, 'config', 'global');
  const update = {};
  update[`apiKeys.${id}.type`] = type;
  storeConfigBackup('api_key_type');
  await updateDoc(ref, update);
  logAdminAction('api_key_type', { id, type });
  showToast(`Key type updated to ${type}.`);
}

async function updateApiKeyVoiceId(id, voiceId) {
  const ref = doc(db, 'config', 'global');
  const update = {};
  update[`apiKeys.${id}.voiceId`] = voiceId;
  try {
    storeConfigBackup('api_key_voice');
    await updateDoc(ref, update);
    logAdminAction('api_key_voice', { id, voiceId: !!voiceId });
    showToast(`Voice ID updated.`);
  } catch (e) {
    showToast(`Failed to update Voice ID: ${e.message}`, 'error');
  }
}

function renderPromptSuggestions(suggestions = []) {
  promptSuggestionsList.innerHTML = '';

  suggestions.forEach((suggestion, index) => {
    const row = document.createElement('div');
    row.className = 'suggestion-row';
    row.dataset.index = index;

    row.innerHTML = `
            <div class="suggestion-details">
                <div class="suggestion-header">
                    <span class="suggestion-icon-display">${suggestion.icon || '▫️'}</span>
                    <span class="suggestion-title-display">${suggestion.title}</span>
                </div>
                <p class="suggestion-prompt-display">${suggestion.prompt}</p>
            </div>

            <div class="suggestion-inputs">
                <div class="row">
                    <input type="text" class="suggestion-icon-input" value="${suggestion.icon || ''}" placeholder="Icon" style="width: 80px;">
                    <input type="text" class="suggestion-title-input" value="${suggestion.title || ''}" placeholder="Title" style="flex-grow: 1;">
                </div>
                <textarea class="suggestion-prompt-input" placeholder="Prompt...">${suggestion.prompt || ''}</textarea>
            </div>

            <div class="suggestion-actions">
                <button class="btn ghost edit-save-btn">Edit</button>
                <button class="btn ghost danger delete-suggestion-btn">Delete</button>
            </div>
        `;
    promptSuggestionsList.appendChild(row);
  });

  promptSuggestionsList.querySelectorAll('.suggestion-row').forEach(row => {
    const index = parseInt(row.dataset.index);
    const editSaveBtn = row.querySelector('.edit-save-btn');
    const deleteBtn = row.querySelector('.delete-suggestion-btn');

    editSaveBtn.addEventListener('click', () => {
      handleEditSaveSuggestion(row, index, editSaveBtn);
    });

    deleteBtn.addEventListener('click', (e) => {
      withLoader(e.currentTarget, () => handleDeleteSuggestion(index));
    });
  });

  addSuggestionSection.style.display = suggestions.length >= 6 ? 'none' : 'block';
}

function handleEditSaveSuggestion(row, index, button) {
  const isEditing = row.classList.contains('editing');

  if (isEditing) {
    const icon = row.querySelector('.suggestion-icon-input').value.trim();
    const title = row.querySelector('.suggestion-title-input').value.trim();
    const prompt = row.querySelector('.suggestion-prompt-input').value.trim();

    if (!title || !prompt) {
      showToast('Title and Prompt are required.', 'error');
      return;
    }

    latestConfig.promptSuggestions[index] = { icon, title, prompt };

    row.querySelector('.suggestion-icon-display').textContent = icon || '▫️';
    row.querySelector('.suggestion-title-display').textContent = title;
    row.querySelector('.suggestion-prompt-display').textContent = prompt;

    saveSuggestionsToFirestore(latestConfig.promptSuggestions);
    showToast('Suggestion saved!');

    row.classList.remove('editing');
    button.textContent = 'Edit';
    button.classList.remove('primary');

  } else {
    row.classList.add('editing');
    button.textContent = 'Save';
    button.classList.add('primary');
  }
}

async function handleDeleteSuggestion(index) {
  if (!confirm('Are you sure you want to delete this suggestion?')) return;
  const currentSuggestions = latestConfig.promptSuggestions || [];
  currentSuggestions.splice(index, 1);
  await saveSuggestionsToFirestore(currentSuggestions);
  showToast('Suggestion removed.', 'error');
}

addSuggestionBtn.addEventListener('click', (e) => {
  withLoader(e.currentTarget, async () => {
    const icon = newSuggestionIcon.value.trim();
    const title = newSuggestionTitle.value.trim();
    const prompt = newSuggestionPrompt.value.trim();

    if (!title || !prompt) {
      showToast('Title and Prompt are required.', 'error');
      return;
    }

    const currentSuggestions = latestConfig.promptSuggestions || [];
    if (currentSuggestions.length >= 6) {
      showToast('Maximum of 6 suggestions allowed.', 'error');
      return;
    }

    currentSuggestions.push({ icon, title, prompt });
    await saveSuggestionsToFirestore(currentSuggestions);

    newSuggestionIcon.value = '';
    newSuggestionTitle.value = '';
    newSuggestionPrompt.value = '';
    showToast('Suggestion added.');
  });
});

async function saveSuggestionsToFirestore(suggestions) {
  const ref = doc(db, 'config', 'global');
  try {
    await setDoc(ref, { promptSuggestions: suggestions }, { merge: true });
  } catch (error) {
    showToast(`Failed to save suggestions: ${error.message}`, 'error');
  }
}

function subscribeUsers() {
  const ref = collection(db, 'users');
  if (usersUnsub) usersUnsub();
  usersUnsub = onSnapshot(ref, snap => {
    usersList.innerHTML = '';
    const users = [];
    snap.forEach(d => users.push({ id: d.id, ...d.data() }));
    totalUsersEl.textContent = users.length;
    users.forEach(u => {
      const el = document.createElement('div');
      el.className = 'card user-card';
      const city = u.city || 'N/A';
      const region = u.region || 'N/A';
      const country = u.country || 'N/A';
      const ip = u.ip || 'N/A';
      const os = u.os || 'N/A';
      const browser = u.browser || 'N/A';
      const network = u.network || 'N/A';
      const lastSeen = u.lastSeen ? new Date(u.lastSeen.seconds * 1000).toLocaleString() : 'Never';
      const activityStatus = u.activityStatus || 'N/A';
      const connection = u.connection || 'N/A';
      const latitude = u.latitude || 'N/A';
      const longitude = u.longitude || 'N/A';

      el.innerHTML = `
        <div class="user-card-header">
            <div class="user-info">
                <div class="user-flag" style="width: 24px; height: 18px; background: #eee;"></div>
                <code class="user-id" title="Click to copy">${u.id}</code>
            </div>
            <div class="user-actions">
                <button data-id="${u.id}" class="btn ghost">Sessions</button>
                <button data-block="${u.id}" class="btn ${u.blocked ? 'danger' : 'ghost'}">${u.blocked ? 'Unblock' : 'Block'}</button>
            </div>
        </div>
        <div class="user-card-details">
            <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value">${activityStatus}</span></div>
            <div class="detail-item"><span class="detail-label">Location</span><span class="detail-value">${city}, ${country}</span></div>
            <div class="detail-item"><span class="detail-label">IP Address</span><span class="detail-value">${ip}</span></div>
            <div class="detail-item"><span class="detail-label">Device</span><span class="detail-value">${os} / ${browser}</span></div>
            <div class="detail-item"><span class="detail-label">Network</span><span class="detail-value">${network}</span></div>
            <div class="detail-item"><span class="detail-label">Connection</span><span class="detail-value">${connection}</span></div>
            <div class="detail-item"><span class="detail-label">Coordinates</span><span class="detail-value">${latitude}, ${longitude}</span></div>
            <div class="detail-item"><span class="detail-label">Last Seen</span><span class="detail-value">${lastSeen}</span></div>
        </div>`;

      usersList.appendChild(el);

      const userIdEl = el.querySelector('.user-id');
      userIdEl.addEventListener('click', () => {
        navigator.clipboard.writeText(u.id);
        showToast('User ID copied!');
      });
      el.querySelector('[data-id]').addEventListener('click', () => {
        showView('sessions');
        openUserSessions(u.id);
      });
      el.querySelector('[data-block]').addEventListener('click', () => toggleUserBlock(u.id, !u.blocked));
    });
    refreshUserSelects(users.map(x => x.id));
  });
}

async function toggleUserBlock(uid, block) {
  if (!confirm(`Are you sure you want to ${block ? 'block' : 'unblock'} this user?`)) return;
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { blocked: block, blockedAt: block ? serverTimestamp() : null }, { merge: true });
  try {
    const snaps = await getDocs(collection(db, 'sessions', uid, 'items'));
    const batch = writeBatch(db);
    snaps.forEach(snap => {
      batch.update(snap.ref, { blocked: block, blockedByAdmin: block, blockReason: block ? 'Blocked by admin' : null });
    });
    await batch.commit();
  } catch (e) {
    console.warn('Session metadata update failed', e);
  }
  showToast(`User ${block ? 'blocked' : 'unblocked'}.`);
}

async function openUserSessions(uid) {
  sessionsList.innerHTML = 'Loading...';
  sessionMessages.innerHTML = '';
  sessionsUserSelect.value = uid;
  const snaps = await getDocs(collection(db, 'sessions', uid, 'items'));
  sessionsList.innerHTML = '';
  if (snaps.empty) { sessionsList.innerHTML = '<div class="small">No sessions.</div>'; return; }
  snaps.forEach(s => {
    const d = s.data();
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<div style="display:flex;justify-content:space-between"><div><strong>${d.title || 'Untitled'}</strong><div class="small">${d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleString() : ''}</div></div><div class="row"><button data-sid="${s.id}" class="btn">Open</button><button data-del="${s.id}" class="btn ghost danger">Delete</button></div></div>`;
    sessionsList.appendChild(el);
    el.querySelector('[data-sid]').addEventListener('click', () => loadSessionForUser(uid, s.id));
    el.querySelector('[data-del]').addEventListener('click', () => deleteSession(uid, s.id));
  });
}

async function loadSessionForUser(uid, sid) {
  sessionMessages.innerHTML = 'Loading...';
  const snaps = await getDocs(query(collection(db, 'chats', uid, sid), orderBy('createdAt', 'asc')));
  sessionMessages.innerHTML = '';
  snaps.forEach(m => {
    const mm = m.data();
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<div><strong>${mm.sender}</strong><div class="small">${mm.text}</div><div class="small">${mm.createdAt ? new Date(mm.createdAt.seconds * 1000).toLocaleString() : ''}</div></div>`;
    sessionMessages.appendChild(el);
  });
}

async function deleteSession(uid, sid) {
  if (!confirm('Delete session?')) return;
  await deleteDoc(doc(db, 'sessions', uid, 'items', sid));
  showToast('Session deleted.', 'error');
  openUserSessions(uid);
}

function refreshUserSelects(userIds) {
  [sessionsUserSelect, liveUserSelect].forEach(sel => {
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">Select user</option>';
    userIds.forEach(u => {
      const o = document.createElement('option');
      o.value = u; o.textContent = u; sel.appendChild(o);
    });
    if (userIds.includes(currentVal)) sel.value = currentVal;
  });
}
sessionsUserSelect.addEventListener('change', (e) => e.target.value && openUserSessions(e.target.value));

liveUserSelect.addEventListener('change', async (e) => {
  const uid = e.target.value;
  liveSessionSelect.innerHTML = '';
  if (!uid) return;
  const snaps = await getDocs(collection(db, 'sessions', uid, 'items'));
  snaps.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.data().title || s.id;
    liveSessionSelect.appendChild(o);
  });
});
watchBtn.addEventListener('click', (e) => withLoader(e.currentTarget, async () => {
  const uid = liveUserSelect.value;
  const sid = liveSessionSelect.value;
  if (!uid || !sid) { showToast('Select user and session.', 'error'); return; }
  if (chatsUnsub) chatsUnsub();
  liveChatArea.innerHTML = 'Starting live view...';
  chatsUnsub = onSnapshot(query(collection(db, 'chats', uid, sid), orderBy('createdAt', 'asc')), snap => {
    liveChatArea.innerHTML = '';
    if (snap.empty) { liveChatArea.innerHTML = '<div class="small">No messages.</div>'; }
    snap.forEach(m => {
      const mm = m.data();
      const el = document.createElement('div');

      el.className = 'card';
      el.innerHTML = `<div><strong>${mm.sender}</strong><div class="small">${mm.text}</div><div class="small">${mm.createdAt ? new Date(mm.createdAt.seconds * 1000).toLocaleString() : ''}</div></div>`;
      liveChatArea.appendChild(el);
    });
    liveChatArea.scrollTop = liveChatArea.scrollHeight;
  });
}));
function subscribeLogs() {
  const ref = doc(db, 'config', 'global');
  onSnapshot(ref, snap => {
    if (!snap.exists()) return;
    const li = document.createElement('div');
    li.className = 'card';
    li.textContent = 'config/global updated at ' + new Date().toLocaleString();
    logsList.prepend(li);
    if (logsList.children.length > 50) logsList.removeChild(logsList.lastChild);
  });
}

function subscribeAuditLogs() {
  if (!adminAuditList) return;
  if (auditUnsub) auditUnsub();
  const q = query(collection(db, 'admin_audit'), orderBy('createdAt', 'desc'), limit(50));
  auditUnsub = onSnapshot(q, (snap) => {
    adminAuditList.innerHTML = '';
    if (snap.empty) {
      adminAuditList.innerHTML = '<div class="small">No audit logs yet.</div>';
      return;
    }
    snap.forEach((docSnap) => {
      const data = docSnap.data() || {};
      const el = document.createElement('div');
      el.className = 'card';
      const time = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toLocaleString() : '';
      el.innerHTML = `
        <div><strong>${data.action || 'action'}</strong></div>
        <div class="small">${data.adminEmail || data.adminId || 'Unknown admin'} • ${time}</div>
        <div class="small">${data.details ? JSON.stringify(data.details) : ''}</div>
      `;
      adminAuditList.appendChild(el);
    });
  });
}

function initModerationTemplates() {
  if (!moderationTemplates) return;
  const templates = [
    'Your account was flagged for violating community guidelines.',
    'This session was blocked due to repeated unsafe requests.',
    'Please avoid sharing sensitive or personal information.',
    'Content removed for violating platform policies.',
    'Your request was denied for safety and compliance reasons.'
  ];
  moderationTemplates.innerHTML = '';
  templates.forEach((text) => {
    const btn = document.createElement('button');
    btn.className = 'btn ghost template-btn';
    btn.textContent = text;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Template copied.');
      } catch (e) {
        showToast('Copy failed.', 'error');
      }
    });
    moderationTemplates.appendChild(btn);
  });
}

async function getAllSessionsCount() {
  try {
    const us = await getDocs(collection(db, 'users'));
    let total = 0;
    for (const u of us.docs) {
      const snaps = await getDocs(collection(db, 'sessions', u.id, 'items'));
      total += snaps.size;
    }
    totalSessionsEl.textContent = total;
  } catch (e) {
    console.warn('count sessions failed', e);
  }
}

async function refreshRecentActivity() {
  recentList.innerHTML = '';
  const us = await getDocs(query(collection(db, 'users'), orderBy('lastSeen', 'desc'),));
  us.forEach(u => {
    const data = u.data();
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `<div style="display:flex;justify-content:space-between"><div><strong>${u.id}</strong><div class="small">Last seen: ${data.lastSeen ? new Date(data.lastSeen.seconds * 1000).toLocaleString() : 'N/A'}</div></div><div><span style="background:var(--bg); padding:0.25rem 0.5rem; border-radius:99px; font-size:0.75rem; border:1px solid var(--border-default)">${data.blocked ? 'Blocked' : 'Active'}</span></div></div>`;
    recentList.appendChild(el);
  });
}
