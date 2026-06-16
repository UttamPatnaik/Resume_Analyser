// Global state
let uploadedFile = null;
let analysisResults = null;

// DOM Elements
const fileInput = document.getElementById('resume-file');
const uploadArea = document.querySelector('.upload-area');
const filePreview = document.getElementById('file-preview');
const analyzeBtn = document.getElementById('analyze-btn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

// File Upload Handling
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
analyzeBtn.addEventListener('click', analyzeResume);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
        validateAndPreviewFile(file);
    }
}

function validateAndPreviewFile(file) {
    // File type validation
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        showError('Please upload a PDF, DOC, or DOCX file.');
        return;
    }

    // File size validation (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB.');
        return;
    }

    uploadedFile = file;
    showFilePreview(file);
    analyzeBtn.disabled = false;
    hideError();
}

function showFilePreview(file) {
    const fileSize = (file.size / 1024 / 1024).toFixed(2);
    const fileType = file.type.includes('pdf') ? 'PDF' : 'DOC';
    
    filePreview.innerHTML = `
        <div class="file-info">
            <div class="file-icon">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
            </div>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${fileType} • ${fileSize} MB</p>
            </div>
        </div>
    `;
    filePreview.style.display = 'block';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    // Remove existing errors
    const existingErrors = document.querySelectorAll('.error');
    existingErrors.forEach(error => error.remove());
    
    uploadArea.parentNode.insertBefore(errorDiv, uploadArea.nextSibling);
}

function hideError() {
    const errors = document.querySelectorAll('.error');
    errors.forEach(error => error.remove());
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    
    uploadArea.parentNode.insertBefore(successDiv, uploadArea.nextSibling);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// REAL BACKEND CONNECTION
// REAL BACKEND CONNECTION
async function analyzeResume() {
    if (!uploadedFile) {
        showError('Please select a file first.');
        return;
    }

    // Show loading state with the Cold Start warning
    loading.style.display = 'block';
    
    // Safely inject the text inside the loading container 
    // (If you have a CSS spinner inside #loading, make sure your HTML still includes it above this text!)
    loading.innerHTML = `
        <div class="loader-spinner" style="margin: 0 auto; margin-bottom: 15px;"></div>
        <p style="font-weight: 600; margin-bottom: 8px;">Analyzing Resume...</p>
        <small style="display: block; color: #64748b; font-size: 0.85em; max-width: 80%; margin: 0 auto; line-height: 1.4;">
            ⚠️ <b>Note:</b> The first upload may take 60-90 seconds while the free cloud server wakes up. 
            Subsequent uploads will be instant!
        </small>
    `;

    analyzeBtn.disabled = true;
    results.style.display = 'none';
    hideError();

    try {
        // 1. Package the file for the backend
        const formData = new FormData();
        formData.append('resume_file', uploadedFile); 

        // 2. Send request to your live Render server
        const response = await fetch('https://resume-analyser-dbrh.onrender.com/api/analyze', {
            method: 'POST',
            body: formData
        });

        // 3. Handle server errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const err = new Error(errorData.detail || 'Server error occurred');
            err.status = response.status;
            throw err;
        }

        // 4. Parse JSON and update UI
        const data = await response.json();
        
        displayResults(data);
        showSuccess('Resume analyzed successfully!');
        addResetButton();
        
        // Smooth scroll to results
        setTimeout(() => {
            results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
        
    } catch (error) {
        console.error('Analysis error:', error);
        handleAnalysisError(error);
    } finally {
        loading.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

function displayResults(data) {
    // 1. Update score circle (using the new 'overall_score' key)
    const scoreCircle = document.getElementById('score-circle');
    const scoreValue = document.getElementById('score-value');
    const scoreDegrees = (data.overall_score / 100) * 360;

    scoreCircle.style.setProperty('--score-deg', `${scoreDegrees}deg`);
    scoreValue.textContent = data.overall_score;

    // 2. Populate analysis grid
    const analysisGrid = document.getElementById('analysis-grid');
    analysisGrid.innerHTML = '';

    Object.entries(data.sections).forEach(([key, section]) => {
        const card = document.createElement('div');
        card.className = 'analysis-card';
        card.innerHTML = `
            <h3>${formatSectionTitle(key)} (${section.score}/100)</h3>
            <p>${section.feedback}</p>
        `;
        analysisGrid.appendChild(card);
    });

    // 3. Populate suggestions list
    const suggestionList = document.getElementById('suggestion-list');
    suggestionList.innerHTML = '';

    // Let's combine your new 'major_issues' and 'improvement_suggestions' 
    // into one powerful list for the UI
    const allFeedback = [...data.major_issues, ...data.improvement_suggestions];

    allFeedback.forEach(suggestion => {
        if (suggestion.trim() !== "") { // Ignore empty strings
            const li = document.createElement('li');
            li.textContent = suggestion;
            suggestionList.appendChild(li);
        }
    });

    // Show results with animation
    results.style.display = 'block';
    results.style.opacity = '0';
    setTimeout(() => {
        results.style.transition = 'opacity 0.5s ease';
        results.style.opacity = '1';
    }, 100);
}

// Update the titles to match your new JSON keys
function formatSectionTitle(key) {
    const titles = {
        content_quality: 'Content Quality',
        formatting_structure: 'Formatting & Structure',
        keywords_skills: 'Keyword Optimization',
        ats_compatibility: 'ATS Compatibility'
    };
    return titles[key] || key;
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Reset functionality
function resetAnalyzer() {
    uploadedFile = null;
    analysisResults = null;
    fileInput.value = '';
    filePreview.style.display = 'none';
    results.style.display = 'none';
    loading.style.display = 'none';
    analyzeBtn.disabled = true;
    hideError();
}

// Add reset button to results
function addResetButton() {
    if (!document.getElementById('reset-btn')) {
        const resetBtn = document.createElement('button');
        resetBtn.id = 'reset-btn';
        resetBtn.className = 'upload-btn';
        resetBtn.style.background = 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
        resetBtn.style.marginTop = '24px';
        resetBtn.textContent = 'Analyze Another Resume';
        resetBtn.addEventListener('click', () => {
            resetAnalyzer();
            document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
        });
        
        results.appendChild(resetBtn);
    }
}

// Enhanced file validation
function validateFile(file) {
    const errors = [];
    
    // Check file type
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        errors.push('Invalid file type. Please upload PDF, DOC, or DOCX files only.');
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        errors.push('File size exceeds 5MB limit. Please compress your file or choose a smaller one.');
    }
    
    // Check if file is empty
    if (file.size === 0) {
        errors.push('File appears to be empty. Please choose a valid resume file.');
    }
    
    return errors;
}

// Enhanced error handling
function handleAnalysisError(error) {
    let errorMessage = 'Analysis failed. Please try again.';
    
    if (error.status === 400) {
        errorMessage = error.message;
    } else if (error.message.includes('network') || error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Ensure the backend server is running and try again.';
    } else if (error.message.includes('file')) {
        errorMessage = 'File processing error. Please try uploading a different file.';
    } else if (error.message) {
        errorMessage = `Server Error: ${error.message}`;
    }
    
    showError(errorMessage);
}

// Accessibility enhancements
function enhanceAccessibility() {
    // Add keyboard navigation
    uploadArea.setAttribute('tabindex', '0');
    uploadArea.setAttribute('role', 'button');
    uploadArea.setAttribute('aria-label', 'Click or press Enter to upload resume file');
    
    uploadArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });
    
    // Add live region for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    document.body.appendChild(liveRegion);
}

function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
    }
}

// Initialize accessibility features
document.addEventListener('DOMContentLoaded', enhanceAccessibility);

// Progressive enhancement for older browsers
function checkBrowserSupport() {
    const features = {
        fileAPI: !!(window.File && window.FileReader && window.FileList && window.Blob),
        fetch: !!window.fetch,
        flexbox: CSS.supports('display', 'flex')
    };
    
    if (!features.fileAPI) {
        showError('Your browser does not support file uploads. Please update your browser.');
        return false;
    }
    
    return true;
}

// Performance optimization
function optimizePerformance() {
    // Debounce file input changes
    let fileTimeout;
    fileInput.addEventListener('change', (e) => {
        clearTimeout(fileTimeout);
        fileTimeout = setTimeout(() => handleFileSelect(e), 300);
    });
    
    // Lazy load images if any
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (checkBrowserSupport()) {
        optimizePerformance();
        console.log('Resume Analyzer initialized successfully');
    }
});

// Error boundary for graceful error handling
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    showError('An unexpected error occurred. Please refresh the page and try again.');
});

// Unhandled promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    handleAnalysisError(new Error(event.reason));
});