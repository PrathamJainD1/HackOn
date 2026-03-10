document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');

    function handleNavigation(sectionId) {
        // Update Nav Links
        navLinks.forEach(link => {
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update Sections
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
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

            const mockData = [
                { label: 'Document Type', value: 'Commercial Invoice', confidence: 'high' },
                { label: 'Full Name', value: 'Alexander Wright', confidence: 'high' },
                { label: 'Date', value: 'March 08, 2026', confidence: 'high' },
                { label: 'Amount', value: '$1,450.00 USD', confidence: 'medium' },
                { label: 'Invoice Number', value: 'INV-2026-042', confidence: 'high' },
                { label: 'Organization', value: 'NovaStream Technologies', confidence: 'high' },
                { label: 'Summary', value: 'Service agreement for Q1 infrastructure maintenance and cloud optimization services.', confidence: 'medium', isSummary: true }
            ];

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
            thumbnail: previewThumbnail.querySelector('img') ? previewThumbnail.querySelector('img').src : null
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
            if (item.label === 'Document Type') {
                newDoc.type = item.value;
                newDoc.category = autoCategorize(item.value, false); // Get category without showing toast yet
            }
            if (item.label === 'Amount') newDoc.amount = item.value;
            if (item.confidence === 'medium' || item.confidence === 'low') newDoc.confidence = item.confidence;

            // Small pause between fields
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        // Add to library and notify
        documents.unshift(newDoc);
        renderLibrary();
        showToast('Processing Complete', `<b>${newDoc.name}</b> has been added to your Library.`, 'check-circle');

        // Trigger automated workflows
        checkWorkflows(newDoc);
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
    let documents = [
        {
            id: 1,
            name: 'Inv-Nov-Tech-102.pdf',
            type: 'Commercial Invoice',
            category: 'Invoices',
            date: 'Mar 02, 2026',
            amount: '$2,850.00',
            confidence: 'high',
            thumbnail: 'https://images.unsplash.com/photo-1554224155-169746ecde15?w=400&auto=format&fit=crop&q=60'
        },
        {
            id: 2,
            name: 'Service-Agreement-Q1.docx',
            type: 'Service Agreement',
            category: 'Contracts',
            date: 'Feb 28, 2026',
            amount: '-',
            confidence: 'high',
            thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&auto=format&fit=crop&q=60'
        },
        {
            id: 3,
            name: 'Quarterly-Report.pdf',
            type: 'Financial Report',
            category: 'Reports',
            date: 'Mar 05, 2026',
            amount: '-',
            confidence: 'medium',
            thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=60'
        },
        {
            id: 4,
            name: 'Amazon-Receipt-201.png',
            type: 'Receipt',
            category: 'Receipts',
            date: 'Mar 09, 2026',
            amount: '$42.99',
            confidence: 'high',
            thumbnail: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&auto=format&fit=crop&q=60'
        }
    ];

    let currentView = 'grid'; // 'grid' or 'list'

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

            card.innerHTML = `
                <div class="doc-thumb">
                    ${thumbContent}
                    <div class="doc-badge-container">
                        <span class="confidence-badge confidence-${doc.confidence}">${doc.confidence}</span>
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
            } else if (rule.action === 'summarize') {
                showToast('AI Action', `Workflow generating summary for <b>${doc.name}</b>...`, 'info');
            } else {
                showToast('Workflow Action', `Rule "${rule.title}" executing for <b>${doc.name}</b>.`, 'info');
            }
        }, 1000);
    }

    function showAlertBanner(title, message) {
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

