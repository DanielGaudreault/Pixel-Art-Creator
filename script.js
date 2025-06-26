document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const colorPicker = document.getElementById('color');
    const secondaryColor = document.getElementById('secondaryColor");
    const gridSize = document.getElementById('gridSize");
    const clearBtn = document.getElementById('clear");
    const saveBtn = document.getElementById('save");
    const loadBtn = document.getElementById('load");
    const exportBtn = document.getElementById('export");
    const pencilBtn = document.getElementById('pencil");
    const fillBtn = document.getElementById('fill");
    const eraseBtn = document.getElementById('erase");

    let currentTool = 'pencil';
    let isDrawing = false;
    let currentColor = colorPicker.value;
    let gridData = [];

    // Initialize grid
    function createGrid(size = 16) {
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        gridData = Array(size).fill().map(() => Array(size).fill('#ffffff'));

        for (let i = 0; i < size * size; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            pixel.dataset.row = Math.floor(i / size);
            pixel.dataset.col = i % size;
            
            pixel.addEventListener('mousedown', startDrawing);
            pixel.addEventListener('mouseenter', draw);
            pixel.addEventListener('mouseup', stopDrawing);
            pixel.addEventListener('contextmenu', (e) => e.preventDefault());
            
            grid.appendChild(pixel);
        }
    }

    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);
        
        if (e.buttons === 1) { // Left-click
            if (currentTool === 'pencil') {
                gridData[row][col] = currentColor;
            } else if (currentTool === 'fill') {
                floodFill(row, col, gridData[row][col], currentColor);
            } else if (currentTool === 'erase') {
                gridData[row][col] = '#ffffff';
            }
        } else if (e.buttons === 2) { // Right-click
            gridData[row][col] = '#ffffff';
        }
        
        renderGrid();
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Flood fill algorithm
    function floodFill(row, col, targetColor, replacementColor) {
        if (targetColor === replacementColor) return;
        if (gridData[row][col] !== targetColor) return;
        
        gridData[row][col] = replacementColor;
        
        if (row > 0) floodFill(row - 1, col, targetColor, replacementColor);
        if (row < gridData.length - 1) floodFill(row + 1, col, targetColor, replacementColor);
        if (col > 0) floodFill(row, col - 1, targetColor, replacementColor);
        if (col < gridData[0].length - 1) floodFill(row, col + 1, targetColor, replacementColor);
    }

    // Render grid based on data
    function renderGrid() {
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach(pixel => {
            const row = parseInt(pixel.dataset.row);
            const col = parseInt(pixel.dataset.col);
            pixel.style.backgroundColor = gridData[row][col];
        });
    }

    // Save/Load functionality
    function saveArt() {
        localStorage.setItem('pixelArt', JSON.stringify(gridData));
        alert('Art saved!');
    }

    function loadArt() {
        const savedArt = localStorage.getItem('pixelArt');
        if (savedArt) {
            gridData = JSON.parse(savedArt);
            renderGrid();
            alert('Art loaded!');
        } else {
            alert('No saved art found.');
        }
    }

    // Export as PNG
    function exportPNG() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = gridData.length;
        const pixelSize = 10; // Scale for export
        
        canvas.width = size * pixelSize;
        canvas.height = size * pixelSize;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                ctx.fillStyle = gridData[row][col];
                ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
            }
        }
        
        const link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // Event Listeners
    colorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
    });

    gridSize.addEventListener('change', (e) => {
        createGrid(parseInt(e.target.value));
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Clear the grid?')) {
            createGrid(parseInt(gridSize.value));
        }
    });

    saveBtn.addEventListener('click', saveArt);
    loadBtn.addEventListener('click', loadArt);
    exportBtn.addEventListener('click', exportPNG);

    pencilBtn.addEventListener('click', () => {
        currentTool = 'pencil';
        pencilBtn.classList.add('active');
        fillBtn.classList.remove('active');
        eraseBtn.classList.remove('active');
    });

    fillBtn.addEventListener('click', () => {
        currentTool = 'fill';
        fillBtn.classList.add('active');
        pencilBtn.classList.remove('active');
        eraseBtn.classList.remove('active');
    });

    eraseBtn.addEventListener('click', () => {
        currentTool = 'erase';
        eraseBtn.classList.add('active');
        pencilBtn.classList.remove('active');
        fillBtn.classList.remove('active');
    });

    // Initialize
    createGrid(16);
});
