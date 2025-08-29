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

        async function analyzeResume() {
            if (!uploadedFile) {
                showError('Please select a file first.');
                return;
            }

            // Show loading state
            loading.style.display = 'block';
            analyzeBtn.disabled = true;
            results.style.display = 'none';

            try {
                // Simulate API call with mock data for demo
                await simulateAnalysis();
                
                // In real implementation, you would:
                // const formData = new FormData();
                // formData.append('resume', uploadedFile);
                // const response = await fetch('/api/analyze', {
                //     method: 'POST',
                //     body: formData
                // });
                // const data = await response.json();
                
                displayResults(analysisResults);
                showSuccess('Resume analyzed successfully!');
                
                // Smooth scroll to results
                setTimeout(() => {
                    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
                
            } catch (error) {
                console.error('Analysis error:', error);
                showError('Analysis failed. Please try again.');
            } finally {
                loading.style.display = 'none';
                analyzeBtn.disabled = false;
            }
        }

        async function simulateAnalysis() {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Mock analysis results with personal details
            analysisResults = {
                personalDetails: {
                    name: "John Smith",
                    profession: "Senior Software Engineer",
                    email: "john.smith@email.com",
                    phone: "+1 (555) 123-4567",
                    location: "San Francisco, CA",
                    linkedin: "linkedin.com/in/johnsmith",
                    website: "johnsmith.dev"
                },
                score: 78,
                sections: {
                    content: {
                        score: 85,
                        feedback: "Strong professional experience section with quantified achievements. Work history shows clear career progression with relevant skills for target roles."
                    },
                    formatting: {
                        score: 72,
                        feedback: "Good overall structure but could benefit from more consistent spacing and better use of white space. Consider using a more ATS-friendly format."
                    },
                    keywords: {
                        score: 68,
                        feedback: "Missing several industry-relevant keywords that could improve ATS compatibility. Consider incorporating more role-specific terminology."
                    },
                    ats: {
                        score: 82,
                        feedback: "Resume is mostly ATS-compatible with clear section headers and standard formatting. Minor improvements could enhance parsing accuracy."
                    }
                },
                suggestions: [
                    "Add 3-5 more industry-specific keywords throughout your experience section",
                    "Include quantified achievements with specific numbers and percentages",
                    "Optimize formatting with consistent bullet points and spacing",
                    "Add a professional summary section at the top",
                    "Include relevant technical skills section",
                    "Consider adding professional certifications if applicable"
                ]
            };
        }

        function displayResults(data) {
            // Remove personal details display
            // displayPersonalDetails(data.personalDetails);

            // Update score circle
            const scoreCircle = document.getElementById('score-circle');
            const scoreValue = document.getElementById('score-value');
            const scoreDegrees = (data.score / 100) * 360;

            scoreCircle.style.setProperty('--score-deg', `${scoreDegrees}deg`);
            scoreValue.textContent = data.score;

            // Populate analysis grid
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

            // Populate suggestions
            const suggestionList = document.getElementById('suggestion-list');
            suggestionList.innerHTML = '';

            data.suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.textContent = suggestion;
                suggestionList.appendChild(li);
            });

            // Show results with animation
            results.style.display = 'block';
            results.style.opacity = '0';
            setTimeout(() => {
                results.style.transition = 'opacity 0.5s ease';
                results.style.opacity = '1';
            }, 100);
        }

        // Remove displayPersonalDetails function

        function formatSectionTitle(key) {
            const titles = {
                content: 'Content Quality',
                formatting: 'Formatting & Structure',
                keywords: 'Keyword Optimization',
                ats: 'ATS Compatibility'
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
            console.error('Analysis error:', error);
            
            let errorMessage = 'Analysis failed. Please try again.';
            
            if (error.message.includes('network')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('file')) {
                errorMessage = 'File processing error. Please try uploading a different file.';
            } else if (error.message.includes('server')) {
                errorMessage = 'Server error. Please try again in a few moments.';
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
            handleAnalysisError(new Error('Promise rejection: ' + event.reason));
        });
        