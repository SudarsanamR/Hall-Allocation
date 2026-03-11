/**
 * Student Viewer — Pure JavaScript App
 * Loads allocation JSON from URL or file, provides instant search.
 */

let allocationsMap = new Map(); // registerNumber -> [allocations]
let dataLoaded = false;

// =============== THEME ===============
function initTheme() {
    const saved = localStorage.getItem('sv-theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('sunIcon').classList.remove('hidden');
        document.getElementById('moonIcon').classList.add('hidden');
    }
}

document.getElementById('themeToggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('sv-theme', isDark ? 'dark' : 'light');
    document.getElementById('sunIcon').classList.toggle('hidden', !isDark);
    document.getElementById('moonIcon').classList.toggle('hidden', isDark);
});

initTheme();

// =============== DATA SOURCE ===============
function showUrlInput() {
    document.getElementById('urlInputSection').classList.remove('hidden');
    document.getElementById('fileInputSection').classList.add('hidden');
    document.getElementById('loadUrlBtn').classList.add('active');
    document.getElementById('loadFileBtn').classList.remove('active');
}

function showFileInput() {
    document.getElementById('urlInputSection').classList.add('hidden');
    document.getElementById('fileInputSection').classList.remove('hidden');
    document.getElementById('loadUrlBtn').classList.remove('active');
    document.getElementById('loadFileBtn').classList.add('active');
}

// Load from URL
async function loadFromUrl() {
    const url = document.getElementById('jsonUrl').value.trim();
    if (!url) return;

    try {
        showStatus('Loading...');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        processData(data);
    } catch (err) {
        showError(`Failed to load data: ${err.message}`);
    }
}

// File upload
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) readFile(e.target.files[0]);
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
});

function readFile(file) {
    if (!file.name.endsWith('.json')) {
        showError('Please upload a .json file');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            processData(data);
        } catch (err) {
            showError('Invalid JSON file');
        }
    };
    reader.readAsText(file);
}

// Process the allocation data
function processData(data) {
    if (!data.allocations || !Array.isArray(data.allocations)) {
        showError('Invalid data format. Expected { allocations: [...] }');
        return;
    }

    allocationsMap.clear();

    data.allocations.forEach(alloc => {
        const regNo = alloc.registerNumber;
        if (!allocationsMap.has(regNo)) {
            allocationsMap.set(regNo, []);
        }
        allocationsMap.get(regNo).push(alloc);
    });

    dataLoaded = true;

    // Show status
    const sessionCount = data.sessions ? data.sessions.length : '?';
    showStatus(`Loaded ${data.allocations.length} allocations across ${sessionCount} session(s)`);

    // Show search
    document.getElementById('searchSection').classList.remove('hidden');
    document.getElementById('registerInput').focus();

    hideError();
}

// =============== SEARCH ===============
const registerInput = document.getElementById('registerInput');
const searchBtn = document.getElementById('searchBtn');

registerInput.addEventListener('input', (e) => {
    // Only allow digits
    e.target.value = e.target.value.replace(/\D/g, '');
    searchBtn.disabled = e.target.value.length !== 12;
});

function handleSearch(e) {
    e.preventDefault();
    const regNo = registerInput.value.trim();

    if (!regNo || regNo.length !== 12) return;
    if (!dataLoaded) {
        showError('Please load allocation data first.');
        return;
    }

    const results = allocationsMap.get(regNo);
    if (!results || results.length === 0) {
        showError('No allocation found for this register number.');
        document.getElementById('results').classList.add('hidden');
        return;
    }

    hideError();
    renderResults(results);
}

// =============== RENDER ===============
function renderResults(allocations) {
    const container = document.getElementById('results');
    container.innerHTML = '';
    container.classList.remove('hidden');

    allocations.forEach(alloc => {
        const formattedSession = alloc.session ? alloc.session.replace(/_/g, ' ') : 'N/A';
        const subjectCode = alloc.subject ? alloc.subject.split(':')[0] : 'N/A';

        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="glow"></div>
            <div class="result-header">
                <div>
                    <p class="session-label">Exam Session</p>
                    <h3 class="session-value">${escapeHtml(formattedSession)}</h3>
                </div>
                <div class="subject-badge">${escapeHtml(subjectCode)}</div>
            </div>
            <div class="result-details">
                <div class="detail-item">
                    <div class="detail-icon hall">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                        <p class="detail-label">Allocated Hall</p>
                        <p class="detail-value">${escapeHtml(alloc.hallName || 'N/A')}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-icon seat">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"/><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z"/><path d="M5 18v2"/><path d="M19 18v2"/></svg>
                    </div>
                    <div>
                        <p class="detail-label">Seat Number</p>
                        <p class="detail-value">${escapeHtml(alloc.seatNumber || 'N/A')}</p>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// =============== HELPERS ===============
function showStatus(text) {
    const el = document.getElementById('dataStatus');
    document.getElementById('statusText').textContent = text;
    el.classList.remove('hidden');
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = msg;
    el.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorMsg').classList.add('hidden');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// =============== AUTO-LOAD ===============
// If URL has a ?data= parameter, auto-load from that URL
(function autoLoad() {
    const params = new URLSearchParams(window.location.search);
    const dataUrl = params.get('data');
    if (dataUrl) {
        document.getElementById('jsonUrl').value = dataUrl;
        loadFromUrl();
    }
})();
