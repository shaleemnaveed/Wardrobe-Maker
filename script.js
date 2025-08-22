// Handles Inputs: 
const uploadedTops = [];
const uploadedBottoms = [];

const outfitsContainer = document.getElementById('outfits');
outfitsContainer.addEventListener('change', (event) => {
    const target = event.target;
    if (target.classList.contains('fileInput')) {
        const figure = target.closest('figure');
        const image = figure.querySelector('.uploadedImage');
        const display = figure.querySelector('.colorDisplay');
        const category = target.dataset.category;

        HandleInput(target, image, display, category);
    }
});

// Generates Outfits: 
const generateButton = document.getElementById('generateOutfits');
const generatedDiv = document.getElementById('generatedOutfits');

generateButton.addEventListener('click', () => {
    if (uploadedTops.length === 0 || uploadedBottoms.length === 0) {
        alert("Please upload atleast one top and one bottom!");
        return;
    }
    const outfits = GenerateOutfits(uploadedTops, uploadedBottoms);
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













// Functions: 

function HandleInput(input, image, display, category) {
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const imageUrl = e.target.result;
        image.src = imageUrl;

        image.onload = function () {
            // Grab dominant color from central portion
            const dominantColor = GetDominantColorFromCenter(image);
            display.style.backgroundColor = dominantColor;

            const item = { image: imageUrl, color: dominantColor };
            if (category === 'tops') uploadedTops.push(item);
            else if (category === 'bottoms') uploadedBottoms.push(item);
        };
    };

    reader.readAsDataURL(file);
}

function GetDominantColorFromCenter(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const data = imageData.data;

    let rTotal = 0, gTotal = 0, bTotal = 0, count = 0;

    // Central region (60% of width/height)
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

function GenerateOutfits(tops, bottoms) {
    const matches = [];
    tops.forEach(top => {
        bottoms.forEach(bottom => {
            const topLab = chroma(top.color).lab();
            const bottomLab = chroma(bottom.color).lab();
            const distance = chroma.distance(topLab, bottomLab, 'lab');
            matches.push({
                top: top,
                bottom: bottom,
                distance: distance
            });
        });
    });
    matches.sort((a, b) => a.distance - b.distance);
    return matches;
}