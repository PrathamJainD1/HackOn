document.addEventListener('DOMContentLoaded', () => {
    // Global docStore initialization for early access
    window.docStore = {
        documents: [],
        settings: {}
    };

    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function handleNavigation(sectionId) {
        const currentActive = document.querySelector('.content-section.active');
        const newActive = document.getElementById(sectionId);

        if (!newActive || currentActive === newActive) return;

        // Start exit animation for current section
        if (currentActive) {
            currentActive.classList.add('exiting');
            currentActive.classList.remove('active');

            // Wait for exit animation to complete before cleaning up
            setTimeout(() => {
                currentActive.classList.remove('exiting');
            }, 220);
        }

        // Show new section
        newActive.classList.add('active');

        // Update Nav Links (Sidebar)
        navLinks.forEach(link => {
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update Mobile Nav Links
        mobileNavLinks.forEach(link => {
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Scroll main content to top on change
        const viewport = document.querySelector('.content-viewport');
        if (viewport) viewport.scrollTop = 0;

        // Close mobile sidebar if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('mobile-active');

        // Update hash without triggering hashchange again
        if (window.location.hash !== `#${sectionId}`) {
            history.pushState(null, null, `#${sectionId}`);
        }
    }

    // Mobile Toggle Logic
    const mobileToggle = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-active');
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl + Key shortcuts
        if (e.ctrlKey) {
            if (e.key.toLowerCase() === 'd') {
                e.preventDefault();
                handleNavigation('dashboard');
            } else if (e.key.toLowerCase() === 'u') {
                e.preventDefault();
                handleNavigation('upload');
            } else if (e.key.toLowerCase() === 'l') {
                e.preventDefault();
                handleNavigation('library');
            } else if (e.key === ',') {
                e.preventDefault();
                handleNavigation('settings');
            }
        }

        // Global Escape key
        if (e.key === 'Escape') {
            // Close drawers and rule builder
            if (notificationDrawer && notificationDrawer.classList.contains('active')) {
                notificationDrawer.classList.remove('active');
            }
            const ruleBuilder = document.getElementById('rule-builder');
            if (ruleBuilder && !ruleBuilder.classList.contains('hidden')) {
                ruleBuilder.classList.add('hidden');
            }
        }
    });

    // Shortcut Hint Bar Logic
    const shortcutBar = document.getElementById('shortcut-hint-bar');
    const dismissShortcuts = document.getElementById('dismiss-shortcuts');
    if (dismissShortcuts && shortcutBar) {
        dismissShortcuts.addEventListener('click', () => {
            shortcutBar.classList.add('dismissed');
            localStorage.setItem('docusmart_shortcuts_dismissed', 'true');
        });

        // Check if previously dismissed
        if (localStorage.getItem('docusmart_shortcuts_dismissed') === 'true') {
            shortcutBar.classList.add('dismissed');
        }
    }

    // Global Loader Logic
    const loader = document.getElementById('global-loader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 1200); // Branded delay for "premium" feel
    });

    // --- Settings Persistence & Initialization ---
    const defaultSettings = {
        lightMode: false,
        glassIntensity: 20,
        autoCategorize: true,
        workflowNotifications: true,
        ocrThreshold: 85
    };

    // Load settings from localStorage or use defaults
    const savedSettings = JSON.parse(localStorage.getItem('docuSmart_settings')) || defaultSettings;
    window.docStore.settings = savedSettings;

    function saveSettings() {
        localStorage.setItem('docuSmart_settings', JSON.stringify(window.docStore.settings));
    }

    // Apply settings on load
    if (window.docStore.settings.lightMode) document.body.classList.add('light-mode');
    document.documentElement.style.setProperty('--glass-blur', `${window.docStore.settings.glassIntensity}px`);

    // Settings UI Wiring
    const lightModeToggle = document.getElementById('setting-light-mode');
    const glassSlider = document.getElementById('glass-intensity');
    const autoCatToggle = document.getElementById('setting-auto-categorize');
    const workflowNotifToggle = document.getElementById('setting-workflow-notif');
    const thresholdSlider = document.getElementById('confidence-threshold');
    const thresholdVal = document.getElementById('threshold-val');

    // Set initial UI states
    if (lightModeToggle) lightModeToggle.checked = window.docStore.settings.lightMode;
    if (glassSlider) glassSlider.value = window.docStore.settings.glassIntensity * 5; // Simple scale 0-20 to 0-100
    if (autoCatToggle) autoCatToggle.checked = window.docStore.settings.autoCategorize;
    if (workflowNotifToggle) workflowNotifToggle.checked = window.docStore.settings.workflowNotifications;
    if (thresholdSlider) {
        thresholdSlider.value = window.docStore.settings.ocrThreshold;
        thresholdVal.innerText = window.docStore.settings.ocrThreshold + '%';
    }

    if (lightModeToggle) {
        lightModeToggle.addEventListener('change', (e) => {
            window.docStore.settings.lightMode = e.target.checked;
            document.body.classList.toggle('light-mode', e.target.checked);
            updateChartTheme(e.target.checked);
            saveSettings();
            showToast('Theme Updated', `System switched to ${e.target.checked ? 'Light' : 'Dark'} mode.`, 'info');
        });
    }

    function updateChartTheme(isLight) {
        const textColor = isLight ? '#64748b' : 'rgba(255, 255, 255, 0.7)';
        const borderColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = borderColor;

        // Force update all active charts
        if (timelineChart) {
            timelineChart.options.scales.x.grid.color = borderColor;
            timelineChart.options.scales.y.grid.color = borderColor;
            timelineChart.update();
        }
        if (categoryChart) {
            categoryChart.options.scales.x.grid.color = borderColor;
            categoryChart.options.scales.y.grid.color = borderColor;
            categoryChart.update();
        }
        if (financialChart) financialChart.update();
        if (dashboardDonutChart) dashboardDonutChart.update();
    }

    if (glassSlider) {
        glassSlider.addEventListener('input', (e) => {
            const intensity = e.target.value / 5; // Scale back to 0-20px
            window.docStore.settings.glassIntensity = intensity;
            document.documentElement.style.setProperty('--glass-blur', `${intensity}px`);
        });
        glassSlider.addEventListener('change', saveSettings);
    }

    if (autoCatToggle) {
        autoCatToggle.addEventListener('change', (e) => {
            window.docStore.settings.autoCategorize = e.target.checked;
            saveSettings();
        });
    }

    if (workflowNotifToggle) {
        workflowNotifToggle.addEventListener('change', (e) => {
            window.docStore.settings.workflowNotifications = e.target.checked;
            saveSettings();
        });
    }

    if (thresholdSlider) {
        thresholdSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            window.docStore.settings.ocrThreshold = val;
            thresholdVal.innerText = val + '%';
            if (typeof applyFilters === 'function') applyFilters(); // Re-render to update warning badges
        });
        thresholdSlider.addEventListener('change', saveSettings);
    }



    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');

            // Push state to handle back/forward buttons
            window.location.hash = sectionId;
            handleNavigation(sectionId);
        });
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            window.location.hash = sectionId;
            handleNavigation(sectionId);
        });
    });

    // Handle initial load with hash or default to dashboard
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    handleNavigation(initialHash);

    // Sync active state on hash change (browser navigation)
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.replace('#', '') || 'dashboard';
        handleNavigation(newHash);
    });

    // Simple interaction feedback for buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = 'translateY(-2px)';
            }, 100);
        });
    });

    // --- Upload Panel Logic ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const uploadProgressPanel = document.getElementById('upload-progress-panel');
    const previewPanel = document.getElementById('preview-panel');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const uploadPercentage = document.getElementById('upload-percentage');
    const uploadStatusText = document.getElementById('upload-status-text');

    // Elements for metadata and preview
    const fileNameDisplay = document.getElementById('file-name');
    const fileSizeDisplay = document.getElementById('file-size');
    const fileTypeDisplay = document.getElementById('file-type');
    const fileDateDisplay = document.getElementById('file-date');
    const previewThumbnail = document.getElementById('preview-thumbnail');

    let currentFile;

    const cancelBtn = document.getElementById('cancel-btn');
    const processBtn = document.getElementById('process-btn');

    // Trigger file input on browse button click
    browseBtn.addEventListener('click', () => fileInput.click());

    // Also trigger on drop zone click
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag and Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileInput.addEventListener('change', function () {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            currentFile = file;

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx')) {
                alert('Please upload a supported file format (PDF, PNG, JPG, or DOCX).');
                return;
            }

            simulateUpload(file);
        }
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function simulateUpload(file) {
        // Reset UI
        dropZone.classList.add('hidden');
        previewPanel.classList.add('hidden');
        uploadProgressPanel.classList.remove('hidden');

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                showPreview(file);
            }

            progressBarFill.style.width = `${progress}%`;
            uploadPercentage.innerText = `${Math.round(progress)}%`;

            if (progress < 40) uploadStatusText.innerText = 'Uploading document...';
            else if (progress < 80) uploadStatusText.innerText = 'Scanning for optimization...';
            else uploadStatusText.innerText = 'Finalizing...';

        }, 200);
    }

    function showPreview(file) {
        // Hide progress and show preview
        uploadProgressPanel.classList.add('hidden');
        previewPanel.classList.remove('hidden');

        // Set Metadata
        fileNameDisplay.innerText = file.name;
        fileSizeDisplay.innerText = formatBytes(file.size);
        fileTypeDisplay.innerText = file.type || 'Unknown';
        fileDateDisplay.innerText = new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Generate Preview
        previewThumbnail.innerHTML = '';
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                previewThumbnail.appendChild(img);
            };
            reader.readAsDataURL(file);
        } else {
            // PDF or DOCX icon
            const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
            const iconHtml = `
                <div class="thumbnail-placeholder">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <text x="7" y="18" font-size="5" fill="currentColor" font-weight="bold" style="font-family: sans-serif;">${isPdf ? 'PDF' : 'DOCX'}</text>
                    </svg>
                    <span>${isPdf ? 'PDF Document' : 'Word Document'}</span>
                </div>
            `;
            previewThumbnail.innerHTML = iconHtml;
        }
    }

    // Cancel Button click
    cancelBtn.addEventListener('click', () => {
        previewPanel.classList.add('hidden');
        dropZone.classList.remove('hidden');
        fileInput.value = '';
    });

    // Function to get mock data based on file
    function getMockData(file) {
        const name = file.name.toLowerCase();
        if (name.includes('invoice')) {
            return [
                { label: 'Document Type', value: 'Commercial Invoice', confidence: 'high' },
                { label: 'Full Name', value: 'Alexander Wright', confidence: 'high' },
                { label: 'Date', value: 'March 08, 2026', confidence: 'high' },
                { label: 'Amount', value: '₹500.00 INR', confidence: 'medium' },
                { label: 'Invoice Number', value: 'INV-2026-042', confidence: 'high' },
                { label: 'Organization', value: 'NovaStream Technologies', confidence: 'high' },
                { label: 'Summary', value: 'Service agreement for Q1 infrastructure maintenance and cloud optimization services.', confidence: 'medium', isSummary: true }
            ];
        } else if (name.includes('contract') || name.includes('agreement')) {
            return [
                { label: 'Document Type', value: 'Service Contract', confidence: 'high' },
                { label: 'Agreement Type', value: 'Service Level Agreement', confidence: 'high' },
                { label: 'Client', value: 'Apex Solutions', confidence: 'high' },
                { label: 'Effective Date', value: 'Mar 02, 2026', confidence: 'high' },
                { label: 'Term', value: '24 Months', confidence: 'medium' },
                { label: 'Summary', value: 'Comprehensive service level agreement for IT support and maintenance.', confidence: 'medium', isSummary: true }
            ];
        } else if (name.includes('receipt')) {
            return [
                { label: 'Document Type', value: 'Business Receipt', confidence: 'high' },
                { label: 'Vendor', value: 'Office Depot', confidence: 'high' },
                { label: 'Total', value: '₹342.80', confidence: 'high' },
                { label: 'Date', value: 'Mar 09, 2026', confidence: 'high' },
                { label: 'Item', value: 'Ergonomic Chair', confidence: 'medium' },
                { label: 'Summary', value: 'Purchase receipt for office supplies and equipment.', confidence: 'medium', isSummary: true }
            ];
        } else if (name.includes('id') || name.includes('passport')) {
            return [
                { label: 'Document Type', value: 'Passport/ID', confidence: 'high' },
                { label: 'Full Name', value: 'James Wilson', confidence: 'high' },
                { label: 'Document Number', value: 'P-992031B', confidence: 'high' },
                { label: 'DOB', value: 'May 14, 1988', confidence: 'high' },
                { label: 'Summary', value: 'Identification document with personal details.', confidence: 'medium', isSummary: true }
            ];
        } else if (name.includes('report')) {
            return [
                { label: 'Document Type', value: 'Financial Report', confidence: 'high' },
                { label: 'Report Title', value: 'Q3 Annual Summary', confidence: 'high' },
                { label: 'Fiscal Year', value: '2025', confidence: 'high' },
                { label: 'Total Revenue', value: '₹180,000.00', confidence: 'high' },
                { label: 'Auditor', value: 'Grant & Sons', confidence: 'medium' },
                { label: 'Summary', value: 'Quarterly financial performance report.', confidence: 'medium', isSummary: true }
            ];
        } else {
            // Default
            return [
                { label: 'Document Type', value: 'Document', confidence: 'medium' },
                { label: 'File Name', value: file.name, confidence: 'high' },
                { label: 'Date', value: new Date().toLocaleDateString(), confidence: 'high' },
                { label: 'Summary', value: 'General document processed successfully.', confidence: 'medium', isSummary: true }
            ];
        }
    }

    // Process Button click
    processBtn.addEventListener('click', () => {
        const resultsContainer = document.getElementById('extraction-results-container');
        const resultsGrid = document.getElementById('extraction-results');

        // Reset and hide previous results if any
        resultsContainer.classList.add('hidden');
        resultsGrid.innerHTML = '';

        // Update button state
        processBtn.innerHTML = '<span class="loader"></span> Processing...';
        processBtn.disabled = true;

        // Add processing class to preview for scan-line
        previewThumbnail.classList.add('processing');

        // Ensure scan-line is present (in case it was cleared by showPreview)
        if (!previewThumbnail.querySelector('.scan-line')) {
            const scanLine = document.createElement('div');
            scanLine.className = 'scan-line';
            previewThumbnail.prepend(scanLine);
        }

        // Simulate AI Processing
        setTimeout(() => {
            previewThumbnail.classList.remove('processing');
            resultsContainer.classList.remove('hidden');

            const mockData = getMockData(currentFile);

            displayExtractedData(mockData);

            processBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                Process with OCR & AI
            `;
            processBtn.disabled = false;
        }, 3000);
    });

    async function displayExtractedData(data) {
        const resultsGrid = document.getElementById('extraction-results');

        // Prepare doc data for library
        const newDoc = {
            id: Date.now(),
            name: fileNameDisplay.innerText,
            type: 'Unknown',
            category: 'Uncategorized',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: '-',
            confidence: 'high',
            thumbnail: previewThumbnail.querySelector('img') ? previewThumbnail.querySelector('img').src : null,
            extractedFields: []
        };

        for (const item of data) {
            const card = document.createElement('div');
            card.className = `extraction-card ${item.isSummary ? 'summary-card' : ''}`;

            card.id = `card-${item.label.replace(/\s+/g, '-').toLowerCase()}`;
            card.innerHTML = `
                <div class="card-header">
                    <span class="field-label">${item.label}</span>
                    <span class="confidence-badge confidence-${item.confidence}">${item.confidence}</span>
                </div>
                <div class="field-value" id="field-${item.label.replace(/\s+/g, '-').toLowerCase()}"></div>
            `;

            resultsGrid.appendChild(card);

            // Show card with a micro-delay for animation
            await new Promise(resolve => setTimeout(resolve, 50));
            card.classList.add('visible');

            // Wait for typing animation
            await typeText(document.getElementById(`field-${item.label.replace(/\s+/g, '-').toLowerCase()}`), item.value);

            // Map data to newDoc for library
            if (!item.isSummary) {
                newDoc.extractedFields.push({ label: item.label, value: item.value, confidence: item.confidence });
            }

            if (item.label === 'Document Type') {
                newDoc.type = item.value;
                if (window.docStore.settings.autoCategorize) {
                    newDoc.category = autoCategorize(item.value, false);
                } else {
                    newDoc.category = 'Uncategorized';
                }
            }
            if (item.label === 'Amount') newDoc.amount = item.value;
            if (item.confidence === 'medium' || item.confidence === 'low') newDoc.confidence = item.confidence;

            // Small pause between fields
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        // Add to library and notify
        documents.unshift(newDoc);
        renderLibrary();
        renderExtractedData(); // Refresh the extracted data panel
        renderCategories(); // Update category counts and previews
        showToast('Processing Complete', `<b>${newDoc.name}</b> has been added to your Library.`, 'check-circle');
        addNotification('process', `Document <b>${newDoc.name}</b> processed and added to library.`);

        // Trigger automated workflows
        checkWorkflows(newDoc);

        // Update reports if active
        updateReports();

        // Update dashboard if active
        updateDashboard();
    }

    function autoCategorize(docType, showNotify = true) {
        let category = 'Uncategorized';
        const type = docType.toLowerCase();

        if (type.includes('invoice')) category = 'Invoices';
        else if (type.includes('contract') || type.includes('agreement')) category = 'Contracts';
        else if (type.includes('report') || type.includes('analysis')) category = 'Reports';
        else if (type.includes('id') || type.includes('passport') || type.includes('license')) category = 'Identity';
        else if (type.includes('receipt')) category = 'Receipts';

        if (showNotify) {
            // Update counts (simulated)
            const countElement = document.getElementById(`count-${category.toLowerCase()}`);
            if (countElement) {
                const currentCount = parseInt(countElement.innerText) || 0;
                countElement.innerText = `${currentCount + 1} Documents`;
            }
            showToast('Auto-Categorized', `Smart AI assigned this document to <b>${category}</b>.`, 'check-circle');
            addNotification('info', `Document auto-categorized under <b>${category}</b>.`);
        }

        return category;
    }

    // --- Toast System ---
    function showToast(title, message, iconType = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';

        const icon = iconType === 'check-circle' ?
            `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>` :
            `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-msg">${message}</div>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Remove toast after 4 seconds
        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // --- Drag and Drop for Categories ---
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('dragenter', (e) => {
            e.preventDefault();
            card.classList.add('drag-over');
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        card.addEventListener('dragleave', () => {
            card.classList.remove('drag-over');
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            const category = card.getAttribute('data-category');
            showToast('Document Moved', `Successfully moved to <b>${category}</b>.`, 'info');

            // Update counts
            const countId = `count-${category.toLowerCase()}`;
            const countElement = document.getElementById(countId);
            if (countElement) {
                const currentCount = parseInt(countElement.innerText) || 0;
                countElement.innerText = `${currentCount + 1} Documents`;
            }
        });
    });

    // --- Document Library Data ---
    let documents = [];

    // Global docStore documents assignment
    window.docStore.documents = documents;

    let currentView = 'grid'; // 'grid' or 'list'

    // --- Extracted Data Panel Logic ---
    const extractedDataTbody = document.getElementById('extracted-data-tbody');
    const extractedSearchInput = document.getElementById('extracted-search');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const extractedEmptyState = document.getElementById('extracted-empty-state');
    const dataTableWrapper = document.getElementById('extracted-data-table-wrapper');

    function renderExtractedData(query = '') {
        if (!extractedDataTbody) return;

        extractedDataTbody.innerHTML = '';
        let allFields = [];

        documents.forEach(doc => {
            if (doc.extractedFields) {
                doc.extractedFields.forEach(field => {
                    allFields.push({
                        docName: doc.name,
                        docType: doc.type,
                        label: field.label,
                        value: field.value,
                        confidence: field.confidence
                    });
                });
            }
        });

        const filteredFields = allFields.filter(f =>
            f.label.toLowerCase().includes(query.toLowerCase()) ||
            f.value.toLowerCase().includes(query.toLowerCase()) ||
            f.docName.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredFields.length === 0) {
            dataTableWrapper.classList.add('hidden');
            extractedEmptyState.classList.remove('hidden');
            return;
        }

        dataTableWrapper.classList.remove('hidden');
        extractedEmptyState.classList.add('hidden');

        filteredFields.forEach(field => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="doc-name-cell">${field.docName}</td>
                <td>${field.docType}</td>
                <td class="field-label-cell">${field.label}</td>
                <td class="extracted-value-cell">${field.value}</td>
                <td><span class="confidence-badge confidence-${field.confidence}">${field.confidence}</span></td>
            `;
            extractedDataTbody.appendChild(row);
        });
    }

    // --- Categories Panel Logic ---
    const CATEGORIES_CONFIG = [
        { id: 'Invoices', label: 'Finance', color: '#f59e0b', colorRgb: '245, 158, 11', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
        { id: 'Contracts', label: 'Legal', color: '#10b981', colorRgb: '16, 185, 129', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
        { id: 'Reports', label: 'Business', color: '#3b82f6', colorRgb: '59, 130, 246', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
        { id: 'Identity', label: 'Personal', color: '#8b5cf6', colorRgb: '139, 92, 246', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
        { id: 'Receipts', label: 'Operations', color: '#ec4899', colorRgb: '236, 72, 153', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' }
    ];

    const categoriesGrid = document.getElementById('categories-grid');

    function renderCategories() {
        if (!categoriesGrid) return;
        categoriesGrid.innerHTML = '';

        CATEGORIES_CONFIG.forEach(cat => {
            const catDocs = documents.filter(d => d.category === cat.id);
            const count = catDocs.length;
            const recentDocs = catDocs.slice(0, 2);

            const card = document.createElement('div');
            card.className = 'category-card';
            card.style.setProperty('--category-color', cat.color);
            card.style.setProperty('--category-color-rgb', cat.colorRgb);
            card.setAttribute('data-category', cat.id);

            let previewHtml = '';
            if (recentDocs.length > 0) {
                previewHtml = `
                    <div class="category-preview-strip">
                        <span class="preview-tag">Recent Files</span>
                        ${recentDocs.map(d => `<div class="preview-item">${d.name}</div>`).join('')}
                    </div>
                `;
            }

            card.innerHTML = `
                <svg class="folder-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="${cat.icon}"></path>
                </svg>
                <div class="category-info">
                    <span class="category-name">${cat.id}</span>
                    <span class="category-count">${count} Document${count !== 1 ? 's' : ''}</span>
                </div>
                <span class="category-label">${cat.label}</span>
                ${previewHtml}
            `;

            card.addEventListener('click', () => {
                // Navigate to library
                window.location.hash = 'library';
                handleNavigation('library');

                // Set filter
                const catFilter = document.getElementById('filter-category');
                if (catFilter) {
                    catFilter.value = cat.id;
                    applyFilters(); // Trigger renderLibrary
                }
            });

            categoriesGrid.appendChild(card);
        });
    }

    if (extractedSearchInput) {
        ['input', 'keyup', 'change'].forEach(evt => {
            extractedSearchInput.addEventListener(evt, (e) => {
                renderExtractedData(e.target.value);
            });
        });
    }

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            let csvContent = "Document,Doc Type,Field,Value,Confidence\n";
            documents.forEach(doc => {
                if (doc.extractedFields) {
                    doc.extractedFields.forEach(field => {
                        const row = [
                            `"${doc.name}"`,
                            `"${doc.type}"`,
                            `"${field.label}"`,
                            `"${field.value}"`,
                            `"${field.confidence}"`
                        ].join(",");
                        csvContent += row + "\n";
                    });
                }
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `extracted_data_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Export Complete', 'Extracted data downloaded as CSV.', 'check-circle');
        });
    }

    // Call initially
    renderExtractedData();
    renderCategories();

    // --- Library Elements ---
    const libraryGrid = document.getElementById('library-grid');
    const libraryEmpty = document.getElementById('library-empty');
    const searchInput = document.getElementById('library-search-input');
    const categoryFilter = document.getElementById('filter-category');
    const typeFilter = document.getElementById('filter-type');
    const confidenceFilter = document.getElementById('filter-confidence');
    const sortSelect = document.getElementById('sort-by');
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');

    function renderLibrary(filteredDocs = documents) {
        if (!libraryGrid) return;
        libraryGrid.innerHTML = '';

        if (filteredDocs.length === 0) {
            libraryGrid.classList.add('hidden');
            libraryEmpty.classList.remove('hidden');
            return;
        }

        libraryGrid.classList.remove('hidden');
        libraryEmpty.classList.add('hidden');

        filteredDocs.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'doc-card';

            const isPdf = doc.name.endsWith('.pdf');
            const isDocx = doc.name.endsWith('.docx');

            // Threshold Logic
            const confidenceVal = doc.confidence === 'high' ? 95 : (doc.confidence === 'medium' ? 70 : 40);
            const isBelowThreshold = confidenceVal < window.docStore.settings.ocrThreshold;

            if (isBelowThreshold) card.classList.add('low-confidence-card');

            let thumbContent = `<img src="${doc.thumbnail}" alt="${doc.name}">`;
            if (!doc.thumbnail) {
                thumbContent = `
                    <div class="thumbnail-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span>${isPdf ? 'PDF' : isDocx ? 'DOCX' : 'IMG'}</span>
                    </div>
                `;
            }

            const thresholdBadge = isBelowThreshold ? `
                <div class="threshold-warning">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    </svg>
                    Review Required
                </div>
            ` : '';

            card.innerHTML = `
                <div class="doc-thumb">
                    ${thumbContent}
                    ${thresholdBadge}
                    <div class="doc-badge-container">
                        <span class="confidence-badge confidence-${doc.confidence} ${isBelowThreshold ? 'low-confidence-badge' : ''}">${doc.confidence}</span>
                    </div>
                </div>
                <div class="doc-content">
                    <div class="doc-info">
                        <span class="doc-type-label">${doc.type}</span>
                        <h4 class="doc-name" title="${doc.name}">${doc.name}</h4>
                    </div>
                    <div class="doc-meta-grid">
                        <div class="meta-item">
                            <span class="meta-label">Date</span>
                            <span class="meta-value">${doc.date}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Amount</span>
                            <span class="meta-value">${doc.amount}</span>
                        </div>
                        <div class="meta-item grid-only">
                            <span class="meta-label">Category</span>
                            <span class="meta-value">${doc.category}</span>
                        </div>
                    </div>
                </div>
            `;

            libraryGrid.appendChild(card);
        });
    }

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const type = typeFilter.value;
        const confidence = confidenceFilter.value;
        const sort = sortSelect.value;

        let filtered = documents.filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(query) ||
                doc.type.toLowerCase().includes(query) ||
                doc.category.toLowerCase().includes(query);
            const matchesCategory = category === 'all' || doc.category === category;
            const matchesType = type === 'all' || doc.type === type;
            const matchesConfidence = confidence === 'all' ||
                (confidence === 'high' && doc.confidence === 'high') ||
                (confidence === 'medium' && (doc.confidence === 'high' || doc.confidence === 'medium'));

            return matchesSearch && matchesCategory && matchesType && matchesConfidence;
        });

        // Sorting
        filtered.sort((a, b) => {
            if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
            if (sort === 'date-asc') return new Date(a.date) - new Date(b.date);
            if (sort === 'name-asc') return a.name.localeCompare(b.name);
            if (sort === 'amount-desc') {
                const valA = parseFloat(a.amount.replace(/[^0-9.]/g, '')) || 0;
                const valB = parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0;
                return valB - valA;
            }
            return 0;
        });

        renderLibrary(filtered);
    }

    // View Toggles
    gridViewBtn.addEventListener('click', () => {
        currentView = 'grid';
        libraryGrid.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    });

    listViewBtn.addEventListener('click', () => {
        currentView = 'list';
        libraryGrid.classList.add('list-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    });

    // Listeners
    searchInput.addEventListener('input', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
    confidenceFilter.addEventListener('change', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    // Update processBtn handler to add doc to library
    const originalProcessHandler = processBtn.onclick; // Wait, it's an addEventListener
    // I need to find where it's defined and append the add function.
    // It's in script.js line 213. I'll modify it in the Next step.

    // Initial Render
    renderLibrary();

    // --- Workflow System logic ---
    let workflowRules = [
        {
            id: 1,
            field: 'amount',
            operator: 'gt',
            value: '1000',
            action: 'alert',
            enabled: true,
            title: 'High Value Invoice Alert'
        },
        {
            id: 2,
            field: 'type',
            operator: 'contains',
            value: 'Invoice',
            action: 'summarize',
            enabled: true,
            title: 'Auto-Summarize Invoices'
        }
    ];

    const workflowGrid = document.getElementById('workflow-rules-grid');
    const addWorkflowBtn = document.getElementById('add-workflow-btn');
    const ruleBuilder = document.getElementById('rule-builder');
    const closeBuilderBtn = document.getElementById('close-builder-btn');
    const saveRuleBtn = document.getElementById('save-rule-btn');
    const cancelRuleBtn = document.getElementById('cancel-rule-btn');

    function renderWorkflows() {
        workflowGrid.innerHTML = '';
        workflowRules.forEach(rule => {
            const card = document.createElement('div');
            card.className = 'workflow-card';

            const operatorText = {
                'equals': 'is exactly',
                'contains': 'contains',
                'gt': 'is greater than',
                'lt': 'is less than'
            }[rule.operator];

            const actionText = {
                'alert': 'Send High-Priority Alert',
                'summarize': 'Generate AI Summary Report',
                'export': 'Export to Cloud Storage',
                'flag': 'Flag for Review'
            }[rule.action];

            card.innerHTML = `
                <div class="rule-active-indicator">
                    <label class="switch">
                        <input type="checkbox" ${rule.enabled ? 'checked' : ''} onchange="toggleWorkflow(${rule.id})">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="workflow-info">
                    <h4 class="doc-name">${rule.title || 'Untitled Rule'}</h4>
                    <p class="rule-statement">
                        If <b>${rule.field}</b> ${operatorText} <b>${rule.value}</b>, 
                        then <b>${actionText}</b>.
                    </p>
                    <div class="rule-action-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        ${rule.action}
                    </div>
                </div>
            `;
            workflowGrid.appendChild(card);
        });
    }

    // Global toggle function
    window.toggleWorkflow = (id) => {
        const rule = workflowRules.find(r => r.id === id);
        if (rule) {
            rule.enabled = !rule.enabled;
            showToast('Workflow Updated', `Workflow rule is now ${rule.enabled ? 'Enabled' : 'Disabled'}.`, 'info');
        }
    };

    addWorkflowBtn.addEventListener('click', () => ruleBuilder.classList.remove('hidden'));
    closeBuilderBtn.addEventListener('click', () => ruleBuilder.classList.add('hidden'));
    cancelRuleBtn.addEventListener('click', () => ruleBuilder.classList.add('hidden'));

    saveRuleBtn.addEventListener('click', () => {
        const field = document.getElementById('rule-field').value;
        const operator = document.getElementById('rule-operator').value;
        const value = document.getElementById('rule-value').value;
        const action = document.getElementById('rule-action').value;

        if (!value) {
            alert('Please enter a value for the rule condition');
            return;
        }

        const newRule = {
            id: Date.now(),
            field,
            operator,
            value,
            action,
            enabled: true,
            title: `Custom ${field} Rule`
        };

        workflowRules.push(newRule);
        renderWorkflows();
        ruleBuilder.classList.add('hidden');
        showToast('Workflow Created', 'Your new automation rule is now active.', 'check-circle');
    });

    function checkWorkflows(doc) {
        workflowRules.forEach(rule => {
            if (!rule.enabled) return;

            let match = false;
            const docValue = doc[rule.field] ? doc[rule.field].toString().toLowerCase() : '';
            const ruleValue = rule.value.toLowerCase();

            if (rule.operator === 'equals') match = docValue === ruleValue;
            else if (rule.operator === 'contains') match = docValue.includes(ruleValue);
            else if (rule.operator === 'gt') {
                const numDoc = parseFloat(docValue.replace(/[^0-9.]/g, ''));
                const numRule = parseFloat(ruleValue);
                match = numDoc > numRule;
            }
            else if (rule.operator === 'lt') {
                const numDoc = parseFloat(docValue.replace(/[^0-9.]/g, ''));
                const numRule = parseFloat(ruleValue);
                match = numDoc < numRule;
            }

            if (match) {
                executeWorkflowAction(rule, doc);
            }
        });
    }

    function executeWorkflowAction(rule, doc) {
        setTimeout(() => {
            if (rule.action === 'alert') {
                showAlertBanner('Workflow Alert Triggered', `High-priority rule matched for <b>${doc.name}</b>. Action: Notification sent.`);
                addNotification('alert', `High-priority alert triggered for <b>${doc.name}</b>.`);
            } else if (rule.action === 'summarize') {
                showToast('AI Action', `Workflow generating summary for <b>${doc.name}</b>...`, 'info');
                addNotification('workflow', `AI Summary workflow started for <b>${doc.name}</b>.`);
            } else {
                showToast('Workflow Action', `Rule "${rule.title}" executing for <b>${doc.name}</b>.`, 'info');
                addNotification('workflow', `Workflow "${rule.title}" executed for <b>${doc.name}</b>.`);
            }
        }, 1000);
    }

    function showAlertBanner(title, message) {
        if (!window.docStore.settings.workflowNotifications) return;

        const container = document.getElementById('workflow-banner-container');
        const banner = document.createElement('div');
        banner.className = 'alert-banner';

        banner.innerHTML = `
            <div class="alert-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-msg">${message}</div>
            </div>
            <button class="icon-btn" style="color: white; margin-left: auto;" onclick="this.parentElement.remove()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `;

        container.appendChild(banner);

        // Auto remove but keep user focus
        setTimeout(() => {
            if (banner.parentElement) {
                banner.style.opacity = '0';
                banner.style.transform = 'translateY(-20px)';
                setTimeout(() => banner.remove(), 500);
            }
        }, 8000);
    }

    // --- Reports & Analytics System ---
    let timelineChart, categoryChart, financialChart;

    const downloadReportBtn = document.getElementById('download-report-btn');

    function initReports() {
        const ctxTimeline = document.getElementById('timelineChart').getContext('2d');
        const ctxCategory = document.getElementById('categoryChart').getContext('2d');
        const ctxFinancial = document.getElementById('financialChart').getContext('2d');

        // General Chart Defaults based on current theme
        const isLight = document.body.classList.contains('light-mode');
        updateChartTheme(isLight);

        // Timeline Line Chart
        timelineChart = new Chart(ctxTimeline, {
            type: 'line',
            data: { labels: [], datasets: [{ label: 'Processed Documents', data: [], borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.2)', fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        // Category Bar Chart
        categoryChart = new Chart(ctxCategory, {
            type: 'bar',
            data: { labels: [], datasets: [{ data: [], backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#22c55e', '#64748b'], borderRadius: 10 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        // Financial Pie Chart
        financialChart = new Chart(ctxFinancial, {
            type: 'pie',
            data: { labels: [], datasets: [{ data: [], backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#22c55e'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });

        updateReports();
    }

    function updateReports() {
        if (!timelineChart || !categoryChart || !financialChart) return;

        // 1. Data for Timeline (Documents over last 30 days)
        const labels30Days = [];
        const data30Days = [];
        const dateMap = {};

        // Prepare last 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            labels30Days.push(shortDate);
            dateMap[dateStr] = 0;
        }

        // Count docs by date
        documents.forEach(doc => {
            if (dateMap[doc.date] !== undefined) {
                dateMap[doc.date]++;
            }
        });

        // Fill data array
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            data30Days.push(dateMap[dateStr]);
        }

        timelineChart.data.labels = labels30Days;
        timelineChart.data.datasets[0].data = data30Days;
        timelineChart.update();

        // 2. Data for Category Distribution
        const catCounts = {};
        documents.forEach(doc => {
            catCounts[doc.category] = (catCounts[doc.category] || 0) + 1;
        });
        categoryChart.data.labels = Object.keys(catCounts);
        categoryChart.data.datasets[0].data = Object.values(catCounts);
        categoryChart.update();

        // 3. Data for Financial Insights (Amounts by Category)
        const finTotals = {};
        documents.forEach(doc => {
            if (doc.amount && doc.amount !== '-') {
                const val = parseFloat(doc.amount.replace(/[^0-9.]/g, '')) || 0;
                finTotals[doc.category] = (finTotals[doc.category] || 0) + val;
            }
        });
        financialChart.data.labels = Object.keys(finTotals); // Removed ($) from keys to keep it cleaner
        financialChart.data.datasets[0].data = Object.values(finTotals);
        financialChart.update();
    }

    // Report Download Logic
    downloadReportBtn.addEventListener('click', () => {
        if (!timelineChart) initReports(); // Ensure charts are initialized

        const reportTitle = "DocuSmart System Report";
        const totalDocs = documents.length;
        const totalValue = documents.reduce((sum, d) => sum + (parseFloat(d.amount.replace(/[^0-9.]/g, '')) || 0), 0);

        // Get Chart Snapshots
        const timelineImg = timelineChart.toBase64Image();
        const categoryImg = categoryChart.toBase64Image();
        const financialImg = financialChart.toBase64Image();

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${reportTitle}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; background: #f8fafc; line-height: 1.6; }
                    .header { text-align: center; margin-bottom: 50px; border-bottom: 2px solid #6366f1; padding-bottom: 20px; }
                    .header h1 { color: #6366f1; margin-bottom: 5px; }
                    .header p { color: #64748b; margin: 0; }
                    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                    .stat-box { background: white; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                    .stat-label { font-size: 0.875rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }
                    .stat-value { font-size: 2rem; font-weight: 800; color: #6366f1; }
                    
                    .charts-section { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
                    .chart-card { background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                    .chart-card.full { grid-column: span 2; }
                    .chart-card h3 { margin-top: 0; margin-bottom: 15px; font-size: 1.125rem; }
                    .chart-card img { width: 100%; height: auto; display: block; }
                    
                    .docs-heading { margin-top: 40px; display: flex; align-items: center; justify-content: space-between; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
                    th, td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #f1f5f9; }
                    th { background: #6366f1; color: white; font-weight: 600; }
                    tr:last-child td { border-bottom: none; }
                    .timestamp { text-align: right; font-size: 0.875rem; color: #64748b; margin-top: 50px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>DocuSmart Analytics Report</h1>
                    <p>Intelligence summary for your document workspace</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-label">Total Documents</div>
                        <div class="stat-value">${totalDocs}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Extracted Value</div>
                        <div class="stat-value">$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">Workspace Rules</div>
                        <div class="stat-value">${workflowRules.filter(r => r.enabled).length}</div>
                    </div>
                </div>

                <div class="charts-section">
                    <div class="chart-card full">
                        <h3>Document Velocity (Last 30 Days)</h3>
                        <img src="${timelineImg}" />
                    </div>
                    <div class="chart-card">
                        <h3>Categorization Distribution</h3>
                        <img src="${categoryImg}" />
                    </div>
                    <div class="chart-card">
                        <h3>Financial Allocation</h3>
                        <img src="${financialImg}" />
                    </div>
                </div>

                <div class="docs-section">
                    <div class="docs-heading">
                        <h3>Full Workspace Inventory</h3>
                        <span>Showing all ${totalDocs} documents</span>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Filename</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Processing Date</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${documents.map(d => `
                                <tr>
                                    <td><strong>${d.name}</strong></td>
                                    <td>${d.category}</td>
                                    <td>${d.amount}</td>
                                    <td>${d.date}</td>
                                    <td>${d.confidence.toUpperCase()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="timestamp">
                    Security Stamp: DOC-REP-${Math.random().toString(36).substr(2, 9).toUpperCase()} • Generated: ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DocuSmart_Report_${new Date().toISOString().slice(0, 10)}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast('Report Generated', 'Premium analysis report downloaded successfully.', 'check-circle');
    });

    // Update charts when reports section is shown
    document.querySelector('a[href="#reports"]').addEventListener('click', () => {
        if (!timelineChart) initReports();
        else updateReports();
    });

    // --- Dashboard & Activity System ---
    let dashboardDonutChart;

    function initDashboard() {
        const ctxDonut = document.getElementById('categoryDonutChart').getContext('2d');

        // Apply theme colors
        const isLight = document.body.classList.contains('light-mode');
        updateChartTheme(isLight);

        dashboardDonutChart = new Chart(ctxDonut, {
            type: 'doughnut',
            data: { labels: [], datasets: [{ data: [], backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#22c55e'], borderWidth: 0, hoverOffset: 10 }] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { display: false }, tooltip: { enabled: true } }
            }
        });

        updateDashboard();
    }

    function updateDashboard() {
        if (!dashboardDonutChart) return;

        // 1. Calculate Stats
        const totalDocs = documents.length;
        const totalValue = documents.reduce((sum, d) => sum + (parseFloat(d.amount.replace(/[^0-9.]/g, '')) || 0), 0);
        const weeklyDocs = documents.filter(d => {
            const docDate = new Date(d.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return docDate >= weekAgo;
        }).length;
        const activeWorkflows = workflowRules.filter(r => r.enabled).length;
        const categoriesCount = new Set(documents.map(d => d.category)).size;

        // 2. Animate Numbers
        animateValue("stat-total-docs", 0, totalDocs, 1000);
        animateValue("stat-weekly-docs", 0, weeklyDocs, 1000);
        animateValue("stat-total-amount", 0, totalValue, 1000, true);
        animateValue("stat-active-workflows", 0, activeWorkflows, 1000);
        animateValue("stat-categories-used", 0, categoriesCount, 1000);

        // 3. Update Donut Chart
        const catCounts = {};
        documents.forEach(doc => {
            catCounts[doc.category] = (catCounts[doc.category] || 0) + 1;
        });
        dashboardDonutChart.data.labels = Object.keys(catCounts);
        dashboardDonutChart.data.datasets[0].data = Object.values(catCounts);
        dashboardDonutChart.update();

        // 4. Update Activity Feed
        const activityFeed = document.getElementById('recent-activity-feed');
        activityFeed.innerHTML = '';

        documents.slice(0, 5).forEach(doc => {
            const item = document.createElement('div');
            item.className = 'activity-item';

            const isPdf = doc.name.endsWith('.pdf');

            item.innerHTML = `
                <div class="activity-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <div class="activity-info">
                    <h4>${doc.name}</h4>
                    <div class="activity-meta">Processed ${doc.date} • ${doc.type}</div>
                </div>
                <div class="activity-badge" style="background: rgba(99, 102, 241, 0.1); color: #6366f1;">
                    ${doc.category}
                </div>
            `;
            activityFeed.appendChild(item);
        });
    }

    function animateValue(id, start, end, duration, isCurrency = false) {
        const obj = document.getElementById(id);
        if (!obj) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = progress * (end - start) + start;

            if (isCurrency) {
                obj.innerHTML = "$" + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            } else {
                obj.innerHTML = Math.floor(value).toLocaleString();
            }

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Nav trigger for dashboard
    document.querySelector('a[href="#dashboard"]').addEventListener('click', () => {
        if (!dashboardDonutChart) initDashboard();
        else updateDashboard();
    });

    // Initialize dashboard on load if it's the active section
    if (window.location.hash === '#dashboard' || !window.location.hash) {
        initDashboard();
    }

    // --- Notifications Alert Center System ---
    let notifications = [
        { id: 1, type: 'process', msg: 'System initialized and ready for document processing.', time: '10 mins ago', unread: false },
        { id: 2, type: 'info', msg: 'AI models updated to v2.4 (Improved Invoice extraction).', time: '1 hour ago', unread: true }
    ];

    const notificationTrigger = document.getElementById('notification-trigger');
    const notificationDrawer = document.getElementById('notification-drawer');
    const notificationBadge = document.getElementById('notification-badge');
    const notificationList = document.getElementById('notification-list');
    const clearAllNotifBtn = document.getElementById('clear-all-notifications');

    function addNotification(type, msg) {
        const id = Date.now();
        const time = 'Just now';
        notifications.unshift({ id, type, msg, time, unread: true });
        renderNotifications();
        updateNotificationBadge();
    }

    function renderNotifications() {
        if (notifications.length === 0) {
            notificationList.innerHTML = '<div class="empty-notifications">No new messages</div>';
            return;
        }

        notificationList.innerHTML = notifications.map(notif => {
            let iconColor, iconSvg;
            if (notif.type === 'process') { iconColor = '#6366f1'; iconSvg = '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>'; }
            else if (notif.type === 'workflow') { iconColor = '#a855f7'; iconSvg = '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>'; }
            else if (notif.type === 'alert') { iconColor = '#ef4444'; iconSvg = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'; }
            else { iconColor = '#64748b'; iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'; }

            return `
                <div class="notification-item ${notif.unread ? 'unread' : ''}" data-id="${notif.id}">
                    <div class="notif-icon" style="background: ${iconColor}22; color: ${iconColor};">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>
                    </div>
                    <div class="notif-details">
                        <div class="notif-msg">${notif.msg}</div>
                        <div class="notif-time">${notif.time}</div>
                    </div>
                    ${notif.unread ? `<div class="mark-read-btn" title="Mark as Read"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"></path></svg></div>` : ''}
                </div>
            `;
        }).join('');

        // Attach listeners to mark-read buttons
        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.closest('.notification-item').dataset.id);
                markAsRead(id);
            });
        });
    }

    function updateNotificationBadge() {
        const unreadCount = notifications.filter(n => n.unread).length;
        if (unreadCount > 0) {
            notificationBadge.innerText = unreadCount;
            notificationBadge.classList.remove('hidden');
        } else {
            notificationBadge.classList.add('hidden');
        }
    }

    function markAsRead(id) {
        const notif = notifications.find(n => n.id === id);
        if (notif) {
            notif.unread = false;
            renderNotifications();
            updateNotificationBadge();
        }
    }

    notificationTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        notificationDrawer.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!notificationDrawer.contains(e.target) && e.target !== notificationTrigger) {
            notificationDrawer.classList.remove('active');
        }
    });

    clearAllNotifBtn.addEventListener('click', () => {
        notifications = [];
        renderNotifications();
        updateNotificationBadge();
    });

    renderNotifications();
    updateNotificationBadge();

    // Initial Workflows Render
    renderWorkflows();




    function typeText(element, text) {
        return new Promise(resolve => {
            let i = 0;
            element.innerText = '';
            element.classList.add('typing');

            const interval = setInterval(() => {
                element.innerText += text.charAt(i);
                i++;
                if (i >= text.length) {
                    clearInterval(interval);
                    element.classList.remove('typing');
                    resolve();
                }
            }, 25); // Speed of typing
        });
    }

    console.log('DocuSmart App Initialized');
});

