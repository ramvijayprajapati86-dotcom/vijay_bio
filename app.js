// Application State
const STORAGE_KEY = 'vij_biodata_profile_v2';
const OLD_STORAGE_KEY = 'vij_biodata_profile_v1';
const THEME_KEY = 'vij_biodata_theme';
const MESSAGES_KEY = 'vij_biodata_messages_v1';

let currentProfile = null;
let receivedMessages = [];

// Initialize app on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadProfileData();
  loadMessages();
  renderProfile();
  initScrollAnimations();
});

// ================= THEME (DARK / LIGHT) =================
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  // Default to Dark Theme on background as requested
  const isDark = savedTheme === 'dark' || savedTheme === null;
  
  if (isDark) {
    document.documentElement.classList.add('dark');
    updateThemeIcon(true);
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeIcon(false);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = isDark ? 'fa-solid fa-sun text-amber-400' : 'fa-solid fa-moon text-slate-600';
  }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// ================= DATA LOADING & PERSISTENCE =================
function loadProfileData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      currentProfile = JSON.parse(saved);
    } else {
      // Check if previous v1 storage exists
      const oldSaved = localStorage.getItem(OLD_STORAGE_KEY);
      const freshEnglishData = JSON.parse(JSON.stringify(initialProfileData));
      if (oldSaved) {
        try {
          const parsedOld = JSON.parse(oldSaved);
          // Preserve any custom avatar photo the user uploaded
          if (parsedOld && parsedOld.personal && parsedOld.personal.avatarUrl) {
            freshEnglishData.personal.avatarUrl = parsedOld.personal.avatarUrl;
          }
        } catch (e) {
          console.warn("Could not migrate old avatar:", e);
        }
      }
      currentProfile = freshEnglishData;
      saveProfileData();
    }
  } catch (err) {
    console.error("Error loading data from localStorage:", err);
    currentProfile = JSON.parse(JSON.stringify(initialProfileData));
  }
}

function saveProfileData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProfile));
    return true;
  } catch (err) {
    console.error("Error saving data to localStorage:", err);
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      alert("Browser storage quota reached! Please upload a smaller compressed image or export your profile backup.");
    }
    return false;
  }
}

// Toast notification helper
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('flex');

  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 3500);
}

// ================= RENDER PROFILE =================
function renderProfile() {
  if (!currentProfile) return;

  const { personal, homeAddress, education, certificates, skills, socialLinks } = currentProfile;

  // 1. Navigation & Brand
  const initials = personal.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'BIO';
  document.getElementById('navInitials').textContent = initials;
  document.getElementById('navName').textContent = personal.fullName.split(' ')[0] || 'Bio';

  // 2. Hero Section
  document.getElementById('heroAvatar').src = personal.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';
  document.getElementById('heroName').textContent = personal.fullName;
  document.getElementById('heroTagline').textContent = personal.tagline;
  document.getElementById('heroAboutShort').textContent = personal.aboutMe;
  
  document.getElementById('heroPhoneVal').textContent = personal.phone;
  document.getElementById('heroEmailVal').textContent = personal.email;
  document.getElementById('heroLocationVal').textContent = `${homeAddress.district}, ${homeAddress.state}`;

  // WhatsApp Action & Contact Section Links
  const cleanPhone = (personal.whatsapp || personal.phone || '').replace(/\D/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hello " + personal.fullName + ", I saw your bio-data website!")}` : '#';
  const heroWa = document.getElementById('heroWhatsAppBtn');
  if (heroWa) heroWa.href = waUrl;

  // Contact section cards
  const cardWa = document.getElementById('cardWhatsAppLink');
  const cardWaVal = document.getElementById('contactCardWhatsApp');
  if (cardWa) cardWa.href = waUrl;
  if (cardWaVal) cardWaVal.textContent = personal.whatsapp ? `+${personal.whatsapp}` : (personal.phone || 'Available on WhatsApp');

  const cardPhone = document.getElementById('cardPhoneLink');
  const cardPhoneVal = document.getElementById('contactCardPhone');
  if (cardPhone) cardPhone.href = cleanPhone ? `tel:+${cleanPhone}` : '#';
  if (cardPhoneVal) cardPhoneVal.textContent = personal.phone || 'Not specified';

  const cardEmail = document.getElementById('cardEmailLink');
  const cardEmailVal = document.getElementById('contactCardEmail');
  if (cardEmail) cardEmail.href = `mailto:${personal.email}`;
  if (cardEmailVal) cardEmailVal.textContent = personal.email || 'Not specified';

  const cardLocVal = document.getElementById('contactCardLocation');
  if (cardLocVal) cardLocVal.textContent = `${homeAddress.currentCity || homeAddress.district || 'City'}, ${homeAddress.state || 'State'}`;

  // Social Links in Hero
  renderSocialLinks(socialLinks);

  // 3. Personal Bio-Data Section
  document.getElementById('bioFullName').textContent = personal.fullName;
  document.getElementById('bioDob').textContent = personal.dob || 'Not specified';
  document.getElementById('bioGenderBlood').textContent = `${personal.gender || '-'} | Blood: ${personal.bloodGroup || '-'}`;
  document.getElementById('bioMarital').textContent = personal.maritalStatus || 'Single';
  document.getElementById('bioNationality').textContent = personal.nationality || 'Indian';
  document.getElementById('bioLanguages').textContent = Array.isArray(personal.languages) ? personal.languages.join(', ') : personal.languages;

  // Hobbies Tags
  const hobbiesContainer = document.getElementById('bioHobbiesTags');
  hobbiesContainer.innerHTML = '';
  const hobbiesList = Array.isArray(personal.hobbies) ? personal.hobbies : (personal.hobbies || '').split(',').map(s => s.trim());
  hobbiesList.forEach(hobby => {
    if (!hobby) return;
    const badge = document.createElement('span');
    badge.className = 'px-3 py-1 bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs';
    badge.textContent = hobby;
    hobbiesContainer.appendChild(badge);
  });

  // 4. Education Section
  renderEducation(education);

  // 5. Certificates Section
  renderCertificates(certificates);

  // 6. Family & Home Address Section
  document.getElementById('familyFather').textContent = homeAddress.fatherName || '-';
  document.getElementById('familyFatherOcc').textContent = homeAddress.fatherOccupation || '-';
  document.getElementById('familyMother').textContent = homeAddress.motherName || '-';
  document.getElementById('familyMotherOcc').textContent = homeAddress.motherOccupation || '-';
  document.getElementById('familySiblings').textContent = homeAddress.siblings || 'None';

  document.getElementById('addrNative').textContent = `${homeAddress.nativeVillage}, Dist: ${homeAddress.district}, ${homeAddress.state} - ${homeAddress.pincode}`;
  document.getElementById('addrCurrent').textContent = homeAddress.currentCity || `${homeAddress.district}, ${homeAddress.state}`;

  // 7. Skills Section
  renderSkills(skills);

  // 8. Footer
  document.getElementById('footerCopy').textContent = `© ${new Date().getFullYear()} ${personal.fullName}. All rights reserved.`;
}

function renderSocialLinks(links) {
  const container = document.getElementById('heroSocialLinks');
  if (!container) return;
  container.innerHTML = '';

  const socialConfig = [
    { key: 'github', icon: 'fa-brands fa-github', title: 'GitHub' },
    { key: 'linkedin', icon: 'fa-brands fa-linkedin', title: 'LinkedIn' },
    { key: 'twitter', icon: 'fa-brands fa-x-twitter', title: 'Twitter' },
    { key: 'instagram', icon: 'fa-brands fa-instagram', title: 'Instagram' }
  ];

  socialConfig.forEach(({ key, icon, title }) => {
    const url = links && links[key];
    if (url && url !== '#' && url.trim() !== '') {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition';
      a.title = title;
      a.innerHTML = `<i class="${icon}"></i>`;
      container.appendChild(a);
    }
  });
}

function renderEducation(educationList) {
  const container = document.getElementById('educationContainer');
  container.innerHTML = '';

  if (!educationList || educationList.length === 0) {
    container.innerHTML = `<p class="text-sm text-slate-500 py-4">No education entries added yet.</p>`;
    return;
  }

  educationList.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-slate-800/70 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm transition hover:border-indigo-300 dark:hover:border-indigo-600';

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shrink-0 mt-0.5 border border-indigo-100 dark:border-indigo-900/60">
            <i class="fa-solid fa-graduation-cap"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-snug">
              ${escapeHtml(item.degree)}
            </h3>
            <p class="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              ${escapeHtml(item.institution)}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Board / University: <span class="text-slate-700 dark:text-slate-300 font-medium">${escapeHtml(item.boardOrUniversity || 'State Board')}</span>
            </p>
          </div>
        </div>

        <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
          <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            ${escapeHtml(item.startYear)} - ${escapeHtml(item.endYear)}
          </span>
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            Score: ${escapeHtml(item.grade || 'Completed')}
          </span>
        </div>
      </div>

      ${item.description ? `
        <p class="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          ${escapeHtml(item.description)}
        </p>
      ` : ''}
    `;

    container.appendChild(card);
  });
}

function renderCertificates(certList) {
  const container = document.getElementById('certificatesGrid');
  container.innerHTML = '';

  if (!certList || certList.length === 0) {
    container.innerHTML = `<p class="col-span-full text-sm text-slate-500 py-4">No certificates added yet.</p>`;
    return;
  }

  const defaultImg = "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80";

  certList.forEach((cert, index) => {
    const card = document.createElement('div');
    card.className = 'cert-card group bg-white dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden flex flex-col justify-between transition hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600';

    const certImage = cert.imageUrl || defaultImg;

    card.innerHTML = `
      <div>
        <!-- Certificate Image Container with Preview Button -->
        <div class="relative h-48 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
          <img src="${certImage}" alt="${escapeHtml(cert.title)}" class="cert-card-img w-full h-full object-cover cursor-pointer" onclick="openCertificateByIndex(${index})" />
          
          <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-medium text-xs pointer-events-none">
            <i class="fa-solid fa-magnifying-glass-plus text-base"></i>
            <span>Click to View Full Preview</span>
          </div>

          <!-- Direct Upload Button on Card -->
          <button type="button" onclick="event.stopPropagation(); triggerDirectCertUpload(${index})" class="no-print absolute top-3 left-3 w-8 h-8 rounded-lg bg-white/95 dark:bg-slate-800/95 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 flex items-center justify-center shadow-md transition z-10" title="Upload New Certificate Image">
            <i class="fa-solid fa-camera text-xs"></i>
          </button>

          <span class="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur text-white text-[10px] font-semibold tracking-wide">
            ${escapeHtml(cert.date || 'Certified')}
          </span>
        </div>

        <!-- Body -->
        <div class="p-5">
          <span class="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
            ${escapeHtml(cert.issuer || 'Certification')}
          </span>
          <h3 class="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-indigo-600 transition cursor-pointer" onclick="openCertificateByIndex(${index})">
            ${escapeHtml(cert.title)}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
            ${escapeHtml(cert.description || 'Verified course completion and skills demonstration.')}
          </p>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span class="text-slate-400 text-[11px] font-mono">
          ID: ${escapeHtml(cert.credentialId || 'Verified')}
        </span>
        <div class="flex items-center gap-3">
          <button type="button" onclick="triggerDirectCertUpload(${index})" class="no-print text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
            <i class="fa-solid fa-upload text-[11px]"></i>
            <span>Upload Photo</span>
          </button>
          <button type="button" onclick="openCertificateByIndex(${index})" class="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1">
            <span>Inspect</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function openCertificateByIndex(index) {
  const defaultImg = "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80";
  const cert = currentProfile && currentProfile.certificates && currentProfile.certificates[index];
  if (!cert) return;
  openImagePreview(cert.imageUrl || defaultImg, cert.title || 'Certificate Preview');
}

let pendingCertUploadIndex = null;

function triggerDirectCertUpload(index) {
  pendingCertUploadIndex = index;
  const input = document.getElementById('directCertFileInput');
  if (input) {
    input.value = '';
    input.click();
  }
}

async function handleDirectCertFileInput(event) {
  const file = event.target.files && event.target.files[0];
  if (!file || pendingCertUploadIndex === null) return;

  const index = pendingCertUploadIndex;
  try {
    const compressedDataUrl = await compressImage(file, 1000, 1000, 0.82);
    
    if (currentProfile && currentProfile.certificates && currentProfile.certificates[index]) {
      currentProfile.certificates[index].imageUrl = compressedDataUrl;
      saveProfileData();
      renderCertificates(currentProfile.certificates);
      showToast(`Certificate #${index + 1} photo updated successfully!`);
    }
  } catch (err) {
    console.error("Direct certificate upload error:", err);
    alert("Could not upload certificate image: " + err.message);
  } finally {
    event.target.value = '';
    pendingCertUploadIndex = null;
  }
}

function renderSkills(skillsList) {
  const container = document.getElementById('skillsContainer');
  container.innerHTML = '';

  if (!skillsList || skillsList.length === 0) {
    container.innerHTML = `<p class="text-sm text-slate-500">No skills listed yet.</p>`;
    return;
  }

  skillsList.forEach((skill) => {
    const rawVal = parseInt(skill.level) || 80;
    const pct = Math.min(Math.max(rawVal, 10), 100);

    const div = document.createElement('div');
    div.className = 'space-y-2';
    div.innerHTML = `
      <div class="flex items-center justify-between text-xs font-semibold">
        <span class="text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]"></span>
          ${escapeHtml(skill.name)}
        </span>
        <span class="text-indigo-600 dark:text-indigo-400 font-mono font-bold">${pct}%</span>
      </div>
      <div class="w-full h-3 bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/60 shadow-inner">
        <div class="skill-bar-fill h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000" style="width: ${pct}%"></div>
      </div>
    `;
    container.appendChild(div);
  });
}

// Scroll-triggered Fade & Slide Animations
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals || reveals.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

// ================= IMAGE PREVIEW MODAL =================
function openImagePreview(url, title) {
  const modal = document.getElementById('imagePreviewModal');
  const img = document.getElementById('previewModalImg');
  const titleEl = document.getElementById('previewModalTitle');

  img.src = decodeURI(url);
  titleEl.textContent = title || 'Certificate Preview';
  modal.classList.remove('hidden');
}

function closeImagePreview() {
  const modal = document.getElementById('imagePreviewModal');
  modal.classList.add('hidden');
}

// ================= CUSTOMIZER / ADMIN MODAL LOGIC =================
function openCustomizerModal(preferredTab = 'tab-personal') {
  populateCustomizerForm();
  switchTab(preferredTab);
  document.getElementById('customizerModal').classList.remove('hidden');
}

function closeCustomizerModal() {
  document.getElementById('customizerModal').classList.add('hidden');
}

function switchTab(tabId) {
  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  
  // Show target panel
  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');

  // Update tab button styles
  const tabKeys = ['personal', 'education', 'certificates', 'family', 'skills', 'messages', 'backup'];
  tabKeys.forEach(key => {
    const btn = document.getElementById(`tabBtn-${key}`);
    if (btn) {
      if (tabId === `tab-${key}`) {
        btn.className = 'px-4 py-3 border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold shrink-0 flex items-center gap-1.5';
      } else {
        btn.className = 'px-4 py-3 border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shrink-0 flex items-center gap-1.5';
      }
    }
  });

  if (tabId === 'tab-messages') {
    renderInboxMessages();
  }
}

function populateCustomizerForm() {
  if (!currentProfile) return;

  const { personal, homeAddress, education, certificates, skills } = currentProfile;

  // Personal Fields
  document.getElementById('input_fullName').value = personal.fullName || '';
  document.getElementById('input_tagline').value = personal.tagline || '';
  document.getElementById('input_avatarUrl').value = personal.avatarUrl || '';
  updateModalAvatarPreview(personal.avatarUrl);
  const statusEl = document.getElementById('avatarUploadStatus');
  if (statusEl) statusEl.classList.add('hidden');
  document.getElementById('input_aboutMe').value = personal.aboutMe || '';
  document.getElementById('input_email').value = personal.email || '';
  document.getElementById('input_phone').value = personal.phone || '';
  document.getElementById('input_whatsapp').value = personal.whatsapp || '';
  document.getElementById('input_dob').value = personal.dob || '';
  document.getElementById('input_gender').value = personal.gender || '';
  document.getElementById('input_bloodGroup').value = personal.bloodGroup || '';
  document.getElementById('input_maritalStatus').value = personal.maritalStatus || '';
  document.getElementById('input_languages').value = Array.isArray(personal.languages) ? personal.languages.join(', ') : (personal.languages || '');
  document.getElementById('input_hobbies').value = Array.isArray(personal.hobbies) ? personal.hobbies.join(', ') : (personal.hobbies || '');

  // Family & Address Fields
  document.getElementById('input_fatherName').value = homeAddress.fatherName || '';
  document.getElementById('input_fatherOccupation').value = homeAddress.fatherOccupation || '';
  document.getElementById('input_motherName').value = homeAddress.motherName || '';
  document.getElementById('input_motherOccupation').value = homeAddress.motherOccupation || '';
  document.getElementById('input_siblings').value = homeAddress.siblings || '';
  document.getElementById('input_nativeVillage').value = homeAddress.nativeVillage || '';
  document.getElementById('input_district').value = homeAddress.district || '';
  document.getElementById('input_state').value = homeAddress.state || '';
  document.getElementById('input_pincode').value = homeAddress.pincode || '';
  document.getElementById('input_currentCity').value = homeAddress.currentCity || '';

  // Render Education in editor
  renderEditorEducationList(education);

  // Render Certificates in editor
  renderEditorCertificatesList(certificates);

  // Render Skills in editor
  renderEditorSkillsList(skills);
}

// ----------------- Dynamic Education Editor -----------------
function renderEditorEducationList(educationList) {
  const container = document.getElementById('editorEducationList');
  container.innerHTML = '';

  educationList.forEach((edu, idx) => {
    const div = document.createElement('div');
    div.className = 'p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3';
    div.innerHTML = `
      <div class="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
        <span class="font-bold text-xs uppercase text-indigo-600 dark:text-indigo-400">Entry #${idx + 1}</span>
        <button type="button" onclick="removeEducationItem(${idx})" class="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">Degree / Standard Name</label>
          <input type="text" id="edu_degree_${idx}" value="${escapeHtml(edu.degree || '')}" placeholder="B.Tech / 12th / 10th" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">School / College / Institute</label>
          <input type="text" id="edu_inst_${idx}" value="${escapeHtml(edu.institution || '')}" placeholder="School / College Name" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">Board / University</label>
          <input type="text" id="edu_board_${idx}" value="${escapeHtml(edu.boardOrUniversity || '')}" placeholder="CBSE / UP Board / AKTU" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">Start Year</label>
            <input type="text" id="edu_start_${idx}" value="${escapeHtml(edu.startYear || '')}" placeholder="2018" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">End Year</label>
            <input type="text" id="edu_end_${idx}" value="${escapeHtml(edu.endYear || '')}" placeholder="2022" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
          </div>
        </div>
        <div>
          <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">Grade / Percentage / CGPA</label>
          <input type="text" id="edu_grade_${idx}" value="${escapeHtml(edu.grade || '')}" placeholder="85% or 8.5 CGPA" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">Key Subjects / Description</label>
          <input type="text" id="edu_desc_${idx}" value="${escapeHtml(edu.description || '')}" placeholder="Science, Maths, etc." class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function addNewEducation() {
  currentProfile.education.unshift({
    id: 'edu_' + Date.now(),
    degree: 'New Qualification / Degree',
    institution: 'College or School Name',
    boardOrUniversity: 'Board / University',
    startYear: '2022',
    endYear: '2024',
    grade: '80%',
    description: 'Specialization or subjects studied'
  });
  renderEditorEducationList(currentProfile.education);
}

function removeEducationItem(index) {
  currentProfile.education.splice(index, 1);
  renderEditorEducationList(currentProfile.education);
}

// ----------------- Dynamic Certificates Editor -----------------
function renderEditorCertificatesList(certList) {
  const container = document.getElementById('editorCertificatesList');
  if (!container) return;
  container.innerHTML = '';

  const defaultImg = "https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80";

  certList.forEach((cert, idx) => {
    const certImage = cert.imageUrl || defaultImg;
    const div = document.createElement('div');
    div.className = 'p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3';
    div.innerHTML = `
      <div class="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700">
        <span class="font-bold text-xs uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <i class="fa-solid fa-award mr-1"></i> Certificate #${idx + 1}
        </span>
        <button type="button" onclick="removeCertificateItem(${idx})" class="text-rose-500 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 transition">
          <i class="fa-solid fa-trash-can"></i> Delete
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Certificate Title</label>
          <input type="text" id="cert_title_${idx}" value="${escapeHtml(cert.title || '')}" placeholder="e.g. Full Stack Web Development" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Issuing Organization / Platform</label>
          <input type="text" id="cert_issuer_${idx}" value="${escapeHtml(cert.issuer || '')}" placeholder="e.g. Coursera, Google, Harvard, University" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
          <input type="text" id="cert_date_${idx}" value="${escapeHtml(cert.date || '')}" placeholder="e.g. May 2023" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Credential ID / Code</label>
          <input type="text" id="cert_code_${idx}" value="${escapeHtml(cert.credentialId || '')}" placeholder="e.g. UC-87429184" class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        
        <!-- Enhanced Certificate Image Upload Box with Thumbnail Preview -->
        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Certificate Image / Document</label>
          <div class="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            
            <!-- Live Thumbnail -->
            <div class="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer group" onclick="openCertificateByIndex(${idx})" title="Click to view full preview">
              <img id="cert_preview_${idx}" src="${certImage}" alt="Certificate Preview" class="w-full h-full object-cover" />
              <span class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px]">
                <i class="fa-solid fa-eye"></i>
              </span>
            </div>

            <!-- Upload Controls -->
            <div class="flex-1 space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <button type="button" onclick="document.getElementById('cert_file_${idx}').click()" class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition">
                  <i class="fa-solid fa-upload"></i> Upload Certificate Image
                </button>
                <span id="cert_upload_badge_${idx}" class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hidden">
                  <i class="fa-solid fa-circle-check"></i> Image attached!
                </span>
              </div>

              <!-- Explicit Hidden File Input -->
              <input type="file" id="cert_file_${idx}" accept="image/*" class="hidden" onchange="handleCertImageUpload(event, ${idx})" />
              <input type="text" id="cert_img_${idx}" value="${escapeHtml(cert.imageUrl || '')}" oninput="document.getElementById('cert_preview_${idx}').src = this.value || '${defaultImg}'" placeholder="Or paste image URL link here..." class="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

          </div>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function addNewCertificate() {
  // Sync current form fields to state first so unsaved edits aren't wiped
  syncCertificatesFromInputs();

  currentProfile.certificates.unshift({
    id: 'cert_' + Date.now(),
    title: 'New Certificate / Course Name',
    issuer: 'Organization / Issuer',
    date: new Date().getFullYear().toString(),
    credentialId: 'CERT-' + Math.floor(10000 + Math.random() * 90000),
    imageUrl: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
    description: 'Course summary or verified achievement details'
  });
  renderEditorCertificatesList(currentProfile.certificates);
}

function removeCertificateItem(index) {
  syncCertificatesFromInputs();
  currentProfile.certificates.splice(index, 1);
  renderEditorCertificatesList(currentProfile.certificates);
}

function syncCertificatesFromInputs() {
  if (!currentProfile || !currentProfile.certificates) return;
  currentProfile.certificates.forEach((cert, idx) => {
    const title = document.getElementById(`cert_title_${idx}`);
    const issuer = document.getElementById(`cert_issuer_${idx}`);
    const date = document.getElementById(`cert_date_${idx}`);
    const code = document.getElementById(`cert_code_${idx}`);
    const img = document.getElementById(`cert_img_${idx}`);

    if (title) cert.title = title.value.trim();
    if (issuer) cert.issuer = issuer.value.trim();
    if (date) cert.date = date.value.trim();
    if (code) cert.credentialId = code.value.trim();
    if (img && img.value.trim() !== '') cert.imageUrl = img.value.trim();
  });
}

// ----------------- Dynamic Skills Editor -----------------
function renderEditorSkillsList(skillsList) {
  const container = document.getElementById('editorSkillsList');
  container.innerHTML = '';

  skillsList.forEach((skill, idx) => {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700';
    div.innerHTML = `
      <input type="text" id="skill_name_${idx}" value="${escapeHtml(skill.name || '')}" placeholder="Skill Name" class="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
      <input type="text" id="skill_lvl_${idx}" value="${escapeHtml(skill.level || '80%')}" placeholder="e.g. 85%" class="w-24 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
      <button type="button" onclick="removeSkillItem(${idx})" class="p-1.5 text-rose-500 hover:text-rose-700 text-xs">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

function addNewSkill() {
  currentProfile.skills.push({ name: 'New Skill', level: '80%' });
  renderEditorSkillsList(currentProfile.skills);
}

function removeSkillItem(index) {
  currentProfile.skills.splice(index, 1);
  renderEditorSkillsList(currentProfile.skills);
}

// ================= SAVE ALL CHANGES =================
function saveAllCustomizerChanges() {
  // Collect Personal details
  currentProfile.personal.fullName = document.getElementById('input_fullName').value.trim();
  currentProfile.personal.tagline = document.getElementById('input_tagline').value.trim();
  currentProfile.personal.avatarUrl = document.getElementById('input_avatarUrl').value.trim();
  currentProfile.personal.aboutMe = document.getElementById('input_aboutMe').value.trim();
  currentProfile.personal.email = document.getElementById('input_email').value.trim();
  currentProfile.personal.phone = document.getElementById('input_phone').value.trim();
  currentProfile.personal.whatsapp = document.getElementById('input_whatsapp').value.trim();
  currentProfile.personal.dob = document.getElementById('input_dob').value.trim();
  currentProfile.personal.gender = document.getElementById('input_gender').value.trim();
  currentProfile.personal.bloodGroup = document.getElementById('input_bloodGroup').value.trim();
  currentProfile.personal.maritalStatus = document.getElementById('input_maritalStatus').value.trim();
  currentProfile.personal.languages = document.getElementById('input_languages').value.split(',').map(s => s.trim()).filter(Boolean);
  currentProfile.personal.hobbies = document.getElementById('input_hobbies').value.split(',').map(s => s.trim()).filter(Boolean);

  // Collect Family & Home Address details
  currentProfile.homeAddress.fatherName = document.getElementById('input_fatherName').value.trim();
  currentProfile.homeAddress.fatherOccupation = document.getElementById('input_fatherOccupation').value.trim();
  currentProfile.homeAddress.motherName = document.getElementById('input_motherName').value.trim();
  currentProfile.homeAddress.motherOccupation = document.getElementById('input_motherOccupation').value.trim();
  currentProfile.homeAddress.siblings = document.getElementById('input_siblings').value.trim();
  currentProfile.homeAddress.nativeVillage = document.getElementById('input_nativeVillage').value.trim();
  currentProfile.homeAddress.district = document.getElementById('input_district').value.trim();
  currentProfile.homeAddress.state = document.getElementById('input_state').value.trim();
  currentProfile.homeAddress.pincode = document.getElementById('input_pincode').value.trim();
  currentProfile.homeAddress.currentCity = document.getElementById('input_currentCity').value.trim();

  // Collect Education details from inputs
  currentProfile.education.forEach((edu, idx) => {
    const deg = document.getElementById(`edu_degree_${idx}`);
    const inst = document.getElementById(`edu_inst_${idx}`);
    const board = document.getElementById(`edu_board_${idx}`);
    const start = document.getElementById(`edu_start_${idx}`);
    const end = document.getElementById(`edu_end_${idx}`);
    const grade = document.getElementById(`edu_grade_${idx}`);
    const desc = document.getElementById(`edu_desc_${idx}`);

    if (deg) edu.degree = deg.value.trim();
    if (inst) edu.institution = inst.value.trim();
    if (board) edu.boardOrUniversity = board.value.trim();
    if (start) edu.startYear = start.value.trim();
    if (end) edu.endYear = end.value.trim();
    if (grade) edu.grade = grade.value.trim();
    if (desc) edu.description = desc.value.trim();
  });

  // Collect Certificates details from inputs
  currentProfile.certificates.forEach((cert, idx) => {
    const title = document.getElementById(`cert_title_${idx}`);
    const issuer = document.getElementById(`cert_issuer_${idx}`);
    const date = document.getElementById(`cert_date_${idx}`);
    const code = document.getElementById(`cert_code_${idx}`);
    const img = document.getElementById(`cert_img_${idx}`);

    if (title) cert.title = title.value.trim();
    if (issuer) cert.issuer = issuer.value.trim();
    if (date) cert.date = date.value.trim();
    if (code) cert.credentialId = code.value.trim();
    if (img) cert.imageUrl = img.value.trim();
  });

  // Collect Skills details from inputs
  currentProfile.skills.forEach((skill, idx) => {
    const name = document.getElementById(`skill_name_${idx}`);
    const lvl = document.getElementById(`skill_lvl_${idx}`);
    if (name) skill.name = name.value.trim();
    if (lvl) skill.level = lvl.value.trim();
  });

  // Save to LocalStorage
  saveProfileData();

  // Re-render Page
  renderProfile();

  // Flash Success Message
  const statusEl = document.getElementById('saveStatusText');
  statusEl.classList.remove('hidden');
  setTimeout(() => {
    statusEl.classList.add('hidden');
    closeCustomizerModal();
  }, 1000);
}

// ----------------- Image Compression & Upload Handlers -----------------

/**
 * Automatically compress and resize images via HTML5 Canvas
 * Prevents LocalStorage 5MB quota errors while preserving high visual quality!
 */
function compressImage(file, maxWidth = 500, maxHeight = 500, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.match(/image.*/)) {
      return reject(new Error("Selected file is not an image"));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compact JPEG data URL (~30KB-70KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ================= CROPPER.JS INTEGRATION & IMAGE ADJUSTMENT =================
let cropperInstance = null;

/**
 * Open Crop Modal with given image URL or DataURL
 */
function openCropModal(imageUrl) {
  const modal = document.getElementById('cropModal');
  const imgEl = document.getElementById('imageToCrop');
  if (!modal || !imgEl) return;

  // Clean up any previous cropper instance
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }

  imgEl.src = imageUrl;
  modal.classList.remove('hidden');

  // Check if Cropper library is loaded
  if (typeof Cropper === 'undefined') {
    console.warn("Cropper.js not loaded, using fallback.");
    // Fallback: apply directly
    currentProfile.personal.avatarUrl = imageUrl;
    saveProfileData();
    renderProfile();
    closeCropModal();
    showToast("Photo applied without crop (Cropper offline)");
    return;
  }

  // Small timeout to allow modal DOM rendering
  setTimeout(() => {
    cropperInstance = new Cropper(imgEl, {
      aspectRatio: 1, // 1:1 Square/Circular for profile avatar
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 0.9,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      background: false
    });
  }, 100);
}

function closeCropModal() {
  const modal = document.getElementById('cropModal');
  if (modal) modal.classList.add('hidden');
  if (cropperInstance) {
    cropperInstance.destroy();
    cropperInstance = null;
  }
}

function cropZoom(delta) {
  if (cropperInstance) cropperInstance.zoom(delta);
}

function cropRotate(degrees) {
  if (cropperInstance) cropperInstance.rotate(degrees);
}

function cropReset() {
  if (cropperInstance) cropperInstance.reset();
}

/**
 * Crop the currently active profile avatar
 */
function cropCurrentAvatar() {
  const currentAvatar = (currentProfile && currentProfile.personal && currentProfile.personal.avatarUrl) ||
    document.getElementById('heroAvatar').src;
  if (!currentAvatar) {
    alert("Please select or upload a photo first!");
    return;
  }
  openCropModal(currentAvatar);
}

/**
 * Apply the cropped area from Cropper.js and save
 */
function applyCroppedImage() {
  if (!cropperInstance) {
    closeCropModal();
    return;
  }

  try {
    // Generate high-resolution 500x500 cropped canvas
    const canvas = cropperInstance.getCroppedCanvas({
      width: 500,
      height: 500,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    if (!canvas) {
      alert("Failed to crop image. Please try adjusting the crop area again.");
      return;
    }

    // Convert to lightweight compact JPEG DataURL (~40KB-60KB)
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

    // 1. Update State
    currentProfile.personal.avatarUrl = croppedDataUrl;

    // 2. Save to LocalStorage
    saveProfileData();

    // 3. Update Hero Avatar in DOM
    const heroAvatar = document.getElementById('heroAvatar');
    if (heroAvatar) heroAvatar.src = croppedDataUrl;

    // 4. Update Customizer Modal Preview & Input
    const inputUrl = document.getElementById('input_avatarUrl');
    if (inputUrl) inputUrl.value = croppedDataUrl;
    updateModalAvatarPreview(croppedDataUrl);

    const statusEl = document.getElementById('avatarUploadStatus');
    if (statusEl) statusEl.classList.remove('hidden');

    // 5. Close Crop Modal & notify user
    closeCropModal();
    showToast("Profile photo cropped and updated successfully!");

  } catch (err) {
    console.error("Error cropping image:", err);
    alert("Cropping error: " + err.message);
  }
}

// Direct Avatar upload from the Camera button on the Hero Photo
function handleDirectAvatarUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    // Open image in Crop Modal so user can adjust, zoom & pan!
    openCropModal(e.target.result);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

// Avatar upload inside the Customizer Modal
function handleAvatarUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    // Open image in Crop Modal so user can adjust, zoom & pan!
    openCropModal(e.target.result);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

// Keep modal avatar preview in sync
function updateModalAvatarPreview(url) {
  const preview = document.getElementById('modalAvatarPreview');
  if (!preview) return;
  const fallback = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80';
  preview.src = url && url.trim() !== '' ? url : fallback;
}

// Certificate Image upload with compression
async function handleCertImageUpload(event, index) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  try {
    // Compress certificate image so it stays crisp but lightweight (~80-120KB)
    const compressedDataUrl = await compressImage(file, 1000, 1000, 0.82);
    
    // Update input field
    const input = document.getElementById(`cert_img_${index}`);
    if (input) input.value = compressedDataUrl;
    
    // Update live thumbnail preview in modal
    const previewImg = document.getElementById(`cert_preview_${index}`);
    if (previewImg) previewImg.src = compressedDataUrl;

    // Show confirmation badge
    const badge = document.getElementById(`cert_upload_badge_${index}`);
    if (badge) badge.classList.remove('hidden');

    // Update state object directly
    if (currentProfile && currentProfile.certificates && currentProfile.certificates[index]) {
      currentProfile.certificates[index].imageUrl = compressedDataUrl;
      // Persist to local storage and refresh homepage grid
      saveProfileData();
      renderCertificates(currentProfile.certificates);
    }

    showToast(`Certificate #${index + 1} image uploaded successfully!`);
  } catch (err) {
    console.error("Certificate upload error:", err);
    alert("Certificate image upload error: " + err.message);
  } finally {
    event.target.value = '';
  }
}

// ================= EXPORT & IMPORT JSON =================
function exportDataToFile() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentProfile, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `biodata_${(currentProfile.personal.fullName || 'profile').toLowerCase().replace(/\s+/g, '_')}.json`);
  dlAnchorElem.click();
}

function importDataFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (parsed && parsed.personal) {
        currentProfile = parsed;
        saveProfileData();
        renderProfile();
        populateCustomizerForm();
        alert("Data successfully imported! Your profile has been updated.");
      } else {
        alert("Invalid JSON format. Please upload a valid bio-data JSON file.");
      }
    } catch (err) {
      alert("Error parsing file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function resetToDefaultData() {
  if (confirm("Are you sure you want to reset all profile data to demo default values? Your customized changes will be replaced.")) {
    currentProfile = JSON.parse(JSON.stringify(initialProfileData));
    saveProfileData();
    renderProfile();
    populateCustomizerForm();
    alert("Reset successful! Default demo profile restored.");
  }
}

// ================= CONTACT FORM & INBOX MESSAGES =================

function loadMessages() {
  try {
    const saved = localStorage.getItem(MESSAGES_KEY);
    if (saved) {
      receivedMessages = JSON.parse(saved);
    } else {
      receivedMessages = [];
    }
  } catch (err) {
    console.error("Error loading messages from localStorage:", err);
    receivedMessages = [];
  }
  updateInboxBadge();
}

function saveMessages() {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(receivedMessages));
  } catch (err) {
    console.error("Error saving messages to localStorage:", err);
  }
  updateInboxBadge();
}

function updateInboxBadge() {
  const count = receivedMessages.length;
  const navBadge = document.getElementById('inboxCountBadge');
  const modalBadge = document.getElementById('modalMsgCountBadge');

  if (navBadge) navBadge.textContent = count;
  if (modalBadge) modalBadge.textContent = count;

  const clearBtn = document.getElementById('clearAllMsgBtn');
  if (clearBtn) {
    clearBtn.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

function handleContactFormSubmit(event) {
  event.preventDefault();

  const nameInput = document.getElementById('form_senderName');
  const emailInput = document.getElementById('form_senderEmail');
  const phoneInput = document.getElementById('form_senderPhone');
  const subjectInput = document.getElementById('form_subject');
  const messageInput = document.getElementById('form_message');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const subject = subjectInput ? subjectInput.value : 'General Inquiry';
  const message = messageInput.value.trim();

  if (!name || !email || !message) {
    alert("Please fill in your name, email, and message.");
    return;
  }

  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const newMessage = {
    id: 'msg_' + Date.now(),
    name,
    email,
    phone,
    subject,
    message,
    timestamp
  };

  // Add to inbox messages
  receivedMessages.unshift(newMessage);
  saveMessages();

  // Prepare mailto link for direct sending
  const targetEmail = (currentProfile && currentProfile.personal && currentProfile.personal.email) || 'ramvijay@example.com';
  const mailSubject = encodeURIComponent(`[${subject}] Message from ${name}`);
  const mailBody = encodeURIComponent(
    `Hello,\n\nYou have received a new inquiry from your bio-data website:\n\n` +
    `Sender: ${name}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone || 'Not provided'}\n` +
    `Subject: ${subject}\n\n` +
    `Message:\n${message}\n\n` +
    `Sent on: ${timestamp}`
  );
  const mailtoUrl = `mailto:${targetEmail}?subject=${mailSubject}&body=${mailBody}`;

  const successMailtoBtn = document.getElementById('successMailtoBtn');
  if (successMailtoBtn) {
    successMailtoBtn.href = mailtoUrl;
  }

  // Show success confirmation
  const successBox = document.getElementById('contactSuccessMsg');
  const successTitle = document.getElementById('contactSuccessTitle');
  if (successTitle) {
    successTitle.textContent = `Thank you, ${name}! Your message has been sent successfully.`;
  }
  if (successBox) {
    successBox.classList.remove('hidden');
  }

  // Reset form
  event.target.reset();

  showToast("Your message was received and saved in the inbox!");
}

function sendViaWhatsAppDirect() {
  const nameInput = document.getElementById('form_senderName');
  const emailInput = document.getElementById('form_senderEmail');
  const phoneInput = document.getElementById('form_senderPhone');
  const subjectInput = document.getElementById('form_subject');
  const messageInput = document.getElementById('form_message');

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const subject = subjectInput ? subjectInput.value : 'Inquiry';
  const message = messageInput.value.trim();

  if (!name || !message) {
    alert("Please enter at least your Name and Message to send via WhatsApp.");
    if (!name) nameInput.focus();
    else messageInput.focus();
    return;
  }

  const cleanTargetPhone = (currentProfile && currentProfile.personal && (currentProfile.personal.whatsapp || currentProfile.personal.phone || '')).replace(/\D/g, '');
  if (!cleanTargetPhone) {
    alert("No WhatsApp number configured for this profile.");
    return;
  }

  const formattedMsg =
    `*New Inquiry from Bio-Data Website*\n\n` +
    `👤 *Name:* ${name}\n` +
    `📧 *Email:* ${email || 'Not provided'}\n` +
    `📞 *Phone:* ${phone || 'Not provided'}\n` +
    `📌 *Subject:* ${subject}\n\n` +
    `💬 *Message:*\n${message}`;

  const waUrl = `https://wa.me/${cleanTargetPhone}?text=${encodeURIComponent(formattedMsg)}`;

  // Also save to local messages
  const timestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  receivedMessages.unshift({
    id: 'msg_' + Date.now(),
    name,
    email: email || 'WhatsApp Sender',
    phone,
    subject: `[WhatsApp] ${subject}`,
    message,
    timestamp
  });
  saveMessages();

  // Open WhatsApp in new tab
  window.open(waUrl, '_blank');
  showToast("Opening WhatsApp with your pre-filled message...");
}

function renderInboxMessages() {
  const container = document.getElementById('inboxMessagesContainer');
  if (!container) return;

  container.innerHTML = '';

  if (!receivedMessages || receivedMessages.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <div class="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-lg mb-3">
          <i class="fa-solid fa-inbox"></i>
        </div>
        <h5 class="font-bold text-slate-800 dark:text-slate-200 text-sm">No Messages Yet</h5>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          When visitors fill out the contact form on your website, their inquiries will be saved and displayed here.
        </p>
      </div>
    `;
    return;
  }

  receivedMessages.forEach((msg, idx) => {
    const card = document.createElement('div');
    card.className = 'p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3 transition hover:border-indigo-300 dark:hover:border-indigo-600';

    const cleanSenderPhone = (msg.phone || '').replace(/\D/g, '');

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-700/60">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
            ${escapeHtml(msg.name.substring(0, 2).toUpperCase())}
          </div>
          <div>
            <h5 class="font-bold text-slate-900 dark:text-white text-sm leading-tight">${escapeHtml(msg.name)}</h5>
            <span class="text-[11px] text-slate-500 dark:text-slate-400">${escapeHtml(msg.email)}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
            ${escapeHtml(msg.subject || 'Inquiry')}
          </span>
          <span class="text-[10px] text-slate-400 font-mono">${escapeHtml(msg.timestamp || '')}</span>
        </div>
      </div>

      <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 select-text">
        ${escapeHtml(msg.message)}
      </p>

      <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div class="flex items-center gap-2">
          ${msg.phone ? `
            <span class="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <i class="fa-solid fa-phone text-slate-400"></i> ${escapeHtml(msg.phone)}
            </span>
          ` : ''}
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <a href="mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent('Re: ' + msg.subject)}" class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 font-medium text-[11px] flex items-center gap-1">
            <i class="fa-solid fa-reply"></i> Reply
          </a>
          ${cleanSenderPhone ? `
            <a href="https://wa.me/${cleanSenderPhone}" target="_blank" class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-medium text-[11px] flex items-center gap-1">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
          ` : ''}
          <button onclick="deleteMessage(${idx})" class="px-2.5 py-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium text-[11px] flex items-center gap-1">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function deleteMessage(index) {
  if (confirm("Are you sure you want to delete this message?")) {
    receivedMessages.splice(index, 1);
    saveMessages();
    renderInboxMessages();
    showToast("Message deleted.");
  }
}

function clearAllMessages() {
  if (confirm("Are you sure you want to clear all received messages? This cannot be undone.")) {
    receivedMessages = [];
    saveMessages();
    renderInboxMessages();
    showToast("All messages cleared.");
  }
}

// Helper to escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
