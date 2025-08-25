// ======= UPLOADED ITEMS =======
const uploadedTops = [];
const uploadedBottoms = [];

const savedTops = JSON.parse(localStorage.getItem('uploadedTops')) || [];
savedTops.forEach(top => uploadedTops.push({ ...top, active: false }));

const savedBottoms = JSON.parse(localStorage.getItem('uploadedBottoms')) || [];
savedBottoms.forEach(bottom => uploadedBottoms.push({ ...bottom, active: false }));

// ======= ELEMENTS =======
const outfitsContainer = document.getElementById('outfits');
const generateButton = document.getElementById('generateOutfits');
const generatedDiv = document.getElementById('generatedOutfits');

// Overlay buttons
const openTopsOverlayBtn = document.getElementById('openTopsOverlay');
const openBottomsOverlayBtn = document.getElementById('openBottomsOverlay');
const topsOverlay = document.getElementById('topsOverlay');
const bottomsOverlay = document.getElementById('bottomsOverlay');
const closeOverlayBtns = document.querySelectorAll('.closeOverlay');

// Gallery elements
const topsGallery = document.getElementById('topsGallery');
const bottomsGallery = document.getElementById('bottomsGallery');

// Gallery controls
const topsRemoveAll = document.getElementById('removeAllTops');
const topsDeselectAll = document.getElementById('deselectAllTops');
const topsSelectAll = document.getElementById('selectAllTops');

const bottomsRemoveAll = document.getElementById('removeAllBottoms');
const bottomsDeselectAll = document.getElementById('deselectAllBottoms');
const bottomsSelectAll = document.getElementById('selectAllBottoms');

// ======= LINK UPLOAD BUTTONS =======
const topsInput = document.getElementById('topsInput');
const bottomsInput = document.getElementById('bottomsInput');

// ======= INPUT HANDLING =======
outfitsContainer.addEventListener('change', (event) => {
    const target = event.target;
    if (target.classList.contains('fileInput')) {
        const figure = target.closest('figure');
        const image = figure.querySelector('.uploadedImage');
        const display = figure.querySelector('.colorDisplay');
        const category = target.dataset.category;

        handleInput(target, image, display, category);
    }
});

function handleInput(input, image, display, category) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const imageUrl = e.target.result;
        image.src = imageUrl;

        image.onload = function () {
            const dominantColor = getDominantColorFromCenter(image);
            display.style.backgroundColor = dominantColor;

            // New item
            const item = { image: imageUrl, color: dominantColor, active: true };

            if (category === 'tops') {
                const existing = uploadedTops.find(t => t.image === imageUrl);
                if (!existing) {
                    // Add new
                    uploadedTops.push(item);
                } else {
                    // Activate existing
                    existing.active = true;
                    existing.color = dominantColor; // optional: update color
                }
                localStorage.setItem('uploadedTops', JSON.stringify(uploadedTops));
                renderTopsGallery();
            } else if (category === 'bottoms') {
                const existing = uploadedBottoms.find(b => b.image === imageUrl);
                if (!existing) {
                    uploadedBottoms.push(item);
                } else {
                    existing.active = true;
                    existing.color = dominantColor; // optional: update color
                }
                localStorage.setItem('uploadedBottoms', JSON.stringify(uploadedBottoms));
                renderBottomsGallery();
            }
        }
    };

    reader.readAsDataURL(file);
}

function getDominantColorFromCenter(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const data = ctx.getImageData(0, 0, img.width, img.height).data;

    let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;
    const startX = Math.floor(img.width * 0.2);
    const endX = Math.floor(img.width * 0.8);
    const startY = Math.floor(img.height * 0.2);
    const endY = Math.floor(img.height * 0.8);

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const i = (y * img.width + x) * 4;
            rTotal += data[i];
            gTotal += data[i + 1];
            bTotal += data[i + 2];
            count++;
        }
    }

    const rAvg = Math.round(rTotal / count);
    const gAvg = Math.round(gTotal / count);
    const bAvg = Math.round(bTotal / count);

    return `rgb(${rAvg}, ${gAvg}, ${bAvg})`;
}

// ======= GENERATE OUTFITS =======
generateButton.addEventListener('click', () => {
    const activeTops = uploadedTops.filter(top => top.active);
    const activeBottoms = uploadedBottoms.filter(bottom => bottom.active);

    if (activeTops.length === 0 || activeBottoms.length === 0) {
        alert("Please select at least one top and one bottom!");
        return;
    }

    const outfits = generateOutfits(activeTops, activeBottoms);
    generatedDiv.innerHTML = '';
    outfits.slice(0, 4).forEach(outfit => {
        const card = document.createElement('div');
        card.classList.add('outfitCard');

        const topImage = document.createElement('img');
        topImage.src = outfit.top.image;
        topImage.classList.add('generatedImage');

        const bottomImage = document.createElement('img');
        bottomImage.src = outfit.bottom.image;
        bottomImage.classList.add('generatedImage');

        card.appendChild(topImage);
        card.appendChild(bottomImage);

        generatedDiv.appendChild(card);
    });
});

function generateOutfits(tops, bottoms) {
    const matches = [];
    tops.forEach(top => {
        bottoms.forEach(bottom => {
            const distance = chroma.distance(top.color, bottom.color, 'lab');
            matches.push({ top, bottom, distance });
        });
    });
    matches.sort((a, b) => a.distance - b.distance);
    return matches;
}

// ======= OVERLAY LOGIC =======
openTopsOverlayBtn.addEventListener('click', () => topsOverlay.classList.add('active'));
openBottomsOverlayBtn.addEventListener('click', () => bottomsOverlay.classList.add('active'));
closeOverlayBtns.forEach(btn => {
    btn.addEventListener('click', () => document.getElementById(btn.dataset.target).classList.remove('active'));
});

// ======= UPDATE PREVIEW =======
function updatePreview(category, imageUrl, color) {
    const container = document.getElementById(category);
    if (!container) return;

    const figure = container.querySelector('figure');
    if (!figure) return;

    const img = figure.querySelector('.uploadedImage');
    const display = figure.querySelector('.colorDisplay');
    if (!img || !display) return;

    img.src = imageUrl || '';
    display.style.backgroundColor = color || '';
}

// ======= TOPS GALLERY =======
function renderTopsGallery() {
    topsGallery.innerHTML = '';
    uploadedTops.forEach((top, index) => {
        const card = document.createElement('div');
        card.classList.add('galleryCard');

        const image = document.createElement('img');
        image.src = top.image;
        image.classList.add('thumbnail');

        const circle = document.createElement('div');
        circle.classList.add('activeCircle');
        circle.style.backgroundColor = top.active ? '#4CAF50' : '#ccc';
        circle.addEventListener('click', e => {
            e.stopPropagation();
            top.active = !top.active;
            localStorage.setItem('uploadedTops', JSON.stringify(uploadedTops));
            renderTopsGallery();

            // Live preview logic
            if (top.active) updatePreview('tops', top.image, top.color);
            else {
                const anotherActive = uploadedTops.find(t => t.active);
                if (anotherActive) updatePreview('tops', anotherActive.image, anotherActive.color);
                else updatePreview('tops', '', '');
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'x';
        deleteBtn.classList.add('deleteButton');
        deleteBtn.addEventListener('click', () => {
            uploadedTops.splice(index, 1);
            localStorage.setItem('uploadedTops', JSON.stringify(uploadedTops));
            renderTopsGallery();

            const active = uploadedTops.find(t => t.active);
            if (active) updatePreview('tops', active.image, active.color);
            else updatePreview('tops', '', '');
        });

        card.appendChild(image);
        card.appendChild(circle);
        card.appendChild(deleteBtn);

        topsGallery.appendChild(card);
    });
}

// Bulk controls for tops
topsRemoveAll.addEventListener('click', () => {
    if (confirm("Are you sure you want to remove all tops?")) {
        uploadedTops.length = 0;
        localStorage.removeItem('uploadedTops');
        renderTopsGallery();

        // Clear preview
        updatePreview('tops', '', '');
    }
});

topsSelectAll.addEventListener('click', () => {
    uploadedTops.forEach(t => t.active = true);
    localStorage.setItem('uploadedTops', JSON.stringify(uploadedTops));
    renderTopsGallery();

    const firstActive = uploadedTops.find(t => t.active);
    if (firstActive) updatePreview('tops', firstActive.image, firstActive.color);
});

topsDeselectAll.addEventListener('click', () => {
    uploadedTops.forEach(t => t.active = false);
    localStorage.setItem('uploadedTops', JSON.stringify(uploadedTops));
    renderTopsGallery();

    updatePreview('tops', '', '');
});

// ======= BOTTOMS GALLERY =======
function renderBottomsGallery() {
    bottomsGallery.innerHTML = '';
    uploadedBottoms.forEach((bottom, index) => {
        const card = document.createElement('div');
        card.classList.add('galleryCard');

        const image = document.createElement('img');
        image.src = bottom.image;
        image.classList.add('thumbnail');

        const circle = document.createElement('div');
        circle.classList.add('activeCircle');
        circle.style.backgroundColor = bottom.active ? '#4CAF50' : '#ccc';
        circle.addEventListener('click', e => {
            e.stopPropagation();
            bottom.active = !bottom.active;
            localStorage.setItem('uploadedBottoms', JSON.stringify(uploadedBottoms));
            renderBottomsGallery();

            // Live preview logic
            if (bottom.active) updatePreview('bottoms', bottom.image, bottom.color);
            else {
                const anotherActive = uploadedBottoms.find(b => b.active);
                if (anotherActive) updatePreview('bottoms', anotherActive.image, anotherActive.color);
                else updatePreview('bottoms', '', '');
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'x';
        deleteBtn.classList.add('deleteButton');
        deleteBtn.addEventListener('click', () => {
            uploadedBottoms.splice(index, 1);
            localStorage.setItem('uploadedBottoms', JSON.stringify(uploadedBottoms));
            renderBottomsGallery();

            const active = uploadedBottoms.find(b => b.active);
            if (active) updatePreview('bottoms', active.image, active.color);
            else updatePreview('bottoms', '', '');
        });

        card.appendChild(image);
        card.appendChild(circle);
        card.appendChild(deleteBtn);

        bottomsGallery.appendChild(card);
    });
}

// Bulk controls for bottoms
bottomsRemoveAll.addEventListener('click', () => {
    if (confirm("Are you sure you want to remove all bottoms?")) {
        uploadedBottoms.length = 0;
        localStorage.removeItem('uploadedBottoms');
        renderBottomsGallery();

        // Clear preview
        updatePreview('bottoms', '', '');
    }
});

bottomsSelectAll.addEventListener('click', () => {
    uploadedBottoms.forEach(b => b.active = true);
    localStorage.setItem('uploadedBottoms', JSON.stringify(uploadedBottoms));
    renderBottomsGallery();

    const firstActive = uploadedBottoms.find(b => b.active);
    if (firstActive) updatePreview('bottoms', firstActive.image, firstActive.color);
});

bottomsDeselectAll.addEventListener('click', () => {
    uploadedBottoms.forEach(b => b.active = false);
    localStorage.setItem('uploadedBottoms', JSON.stringify(uploadedBottoms));
    renderBottomsGallery();

    updatePreview('bottoms', '', '');
});

// Initial render
renderTopsGallery();
renderBottomsGallery();