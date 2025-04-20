document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseButton = document.getElementById('browse-button');
    const processButton = document.getElementById('process-button');
    const resultContainer = document.getElementById('result-container');
    const resultText = document.getElementById('result-text');
    const copyButton = document.getElementById('copy-button');
    const downloadButton = document.getElementById('download-button');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.getElementById('preview-container');
    const dropMessage = document.querySelector('.drop-message');
    const changeImageButton = document.getElementById('change-image');
    const loading = document.getElementById('loading');
    const biometryCheckbox = document.getElementById('biometry-checkbox');

    let imageDataUrl = null;
    let processingTimeout;

    // Event listeners for file drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('active');
    }

    function unhighlight() {
        dropArea.classList.remove('active');
    }

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // Handle selected files from file input
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Click the hidden file input when browse button is clicked
    browseButton.addEventListener('click', () => {
        fileInput.click();
    });

    // Add clipboard paste event listener to the document
    document.addEventListener('paste', function(e) {
        // Prevent the default paste behavior
        e.preventDefault();
        
        // Get clipboard data
        const clipboardData = e.clipboardData || window.clipboardData;
        const items = clipboardData.items;
        
        // Check if there are any items in the clipboard
        if (!items) return;
        
        // Look for an image in the clipboard
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                // Get the image as a file
                const file = items[i].getAsFile();
                
                // Process the image file
                handleFiles([file]);
                
                // We found an image, so we can stop looking
                break;
            }
        }
    });

    // Add paste instructions to the drop area
    const dropMessageText = dropArea.querySelector('p');
    if (dropMessageText) {
        dropMessageText.innerHTML = 'Drag & drop an image, paste a screenshot (Ctrl+V), or click to browse';
    }

    // Handle the selected files
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            
            // Only process image files
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            // Check file size and warn if too large
            if (file.size > 10 * 1024 * 1024) { // 10MB
                alert('Warning: Large images may take longer to process. Consider using a smaller image for faster results.');
            }
            
            // Show image preview
            const reader = new FileReader();
            reader.onload = function(e) {
                imageDataUrl = e.target.result;
                imagePreview.src = imageDataUrl;
                dropMessage.classList.add('hidden');
                previewContainer.classList.remove('hidden');
                processButton.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    }

    // Change image button
    changeImageButton.addEventListener('click', () => {
        dropMessage.classList.remove('hidden');
        previewContainer.classList.add('hidden');
        processButton.disabled = true;
        imageDataUrl = null;
        imagePreview.src = '#';
    });

    // Process the image when button is clicked
    processButton.addEventListener('click', processImage);

    async function processImage() {
        if (!imageDataUrl) {
            alert('Please select an image first');
            return;
        }

        // Show loading spinner
        loading.classList.remove('hidden');
        document.querySelector('.loading p').textContent = 'Processing image with Bimini AI...';
        
        // Disable process button
        processButton.disabled = true;
        
        // Set a timeout warning
        processingTimeout = setTimeout(() => {
            document.querySelector('.loading p').textContent = 'Still processing... (this may take a while for large images)';
        }, 15000);
        
        try {
            // Get biometry checkbox state
            const extractBiometry = biometryCheckbox.checked;
            
            // Create request with image data and biometry flag
            const requestData = {
                image: imageDataUrl,
                extractBiometry: extractBiometry
            };

            const response = await fetch('/api/extract-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            clearTimeout(processingTimeout);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            
            // Display the result
            resultText.textContent = data.text;
            resultContainer.classList.remove('hidden');
            
            // Scroll to results
            resultContainer.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            clearTimeout(processingTimeout);
            console.error('Error:', error);
            
            if (error.message.includes('timeout')) {
                alert('The request took too long to process. This can happen with large images. Please try again with a smaller image.');
            } else {
                alert('An error occurred while processing the image. Please try again.');
            }
        } finally {
            // Hide loading spinner
            loading.classList.add('hidden');
            
            // Re-enable process button
            processButton.disabled = false;
        }
    }

    // Copy result text to clipboard
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(resultText.textContent)
            .then(() => {
                // Temporarily change button text to show success
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyButton.innerHTML = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy text to clipboard');
            });
    });

    // Download result as text file
    downloadButton.addEventListener('click', () => {
        const text = resultText.textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}); 