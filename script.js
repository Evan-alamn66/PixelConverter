document.addEventListener('DOMContentLoaded', () => {
    const videoUpload = document.getElementById('videoUpload');
    const sourceVideo = document.getElementById('sourceVideo');
    const pixelCanvas = document.getElementById('pixelCanvas');
    const ctx = pixelCanvas.getContext('2d');
    const pixelSizeInput = document.getElementById('pixelSize');
    const pixelSizeValueSpan = document.getElementById('pixelSizeValue');
    const playPauseButton = document.getElementById('playPauseButton');

    let pixelSize = parseInt(pixelSizeInput.value);
    let animationFrameId;

    pixelSizeInput.addEventListener('input', () => {
        pixelSize = parseInt(pixelSizeInput.value);
        pixelSizeValueSpan.textContent = pixelSize;
        if (sourceVideo.readyState >= 2) { // Ensure video is loaded enough to draw
            drawPixelatedFrame();
        }
    });

    videoUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            sourceVideo.src = url;
            sourceVideo.load();
            sourceVideo.style.display = 'none'; // Keep it hidden
            playPauseButton.textContent = 'Play'; // Reset button text
        }
    });

    sourceVideo.addEventListener('loadedmetadata', () => {
        // Set canvas dimensions to match video dimensions
        pixelCanvas.width = sourceVideo.videoWidth;
        pixelCanvas.height = sourceVideo.videoHeight;
        playPauseButton.style.display = 'inline-block'; // Show button once video is loaded
    });

    sourceVideo.addEventListener('play', () => {
        playPauseButton.textContent = 'Pause';
        drawPixelatedVideo();
    });

    sourceVideo.addEventListener('pause', () => {
        playPauseButton.textContent = 'Play';
        cancelAnimationFrame(animationFrameId);
    });

    sourceVideo.addEventListener('ended', () => {
        playPauseButton.textContent = 'Play';
        cancelAnimationFrame(animationFrameId);
    });

    playPauseButton.addEventListener('click', () => {
        if (sourceVideo.paused) {
            sourceVideo.play();
        } else {
            sourceVideo.pause();
        }
    });

    function drawPixelatedFrame() {
        if (sourceVideo.paused || sourceVideo.ended) {
            return;
        }

        const width = pixelCanvas.width;
        const height = pixelCanvas.height;

        // Draw the current video frame onto the canvas at its original resolution first
        ctx.drawImage(sourceVideo, 0, 0, width, height);

        // Get the image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data; // This is a 1D array: [R, G, B, A, R, G, B, A, ...]

        // Clear the canvas to redraw with pixelated effect
        ctx.clearRect(0, 0, width, height);

        for (let y = 0; y < height; y += pixelSize) {
            for (let x = 0; x < width; x += pixelSize) {
                // Calculate the index of the top-left pixel of the current "pixel block"
                const index = (y * width + x) * 4;

                const red = data[index];
                const green = data[index + 1];
                const blue = data[index + 2];
                const alpha = data[index + 3];

                // Draw a large rectangle (our "pixel") with the color of the sampled pixel
                ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        }
    }

    function drawPixelatedVideo() {
        drawPixelatedFrame(); // Draw the current frame
        animationFrameId = requestAnimationFrame(drawPixelatedVideo); // Request next frame
    }

    // Initial state: hide play/pause button until video is loaded
    playPauseButton.style.display = 'none';
});