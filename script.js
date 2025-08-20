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
    if (!input.files || input.files.length === 0)
        return;
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const imageUrl = e.target.result;
        image.src = imageUrl;

        image.onload = function () {
            const colorThief = new ColorThief();
            const dominantColor = colorThief.getColor(image);
            const colorRgb = `rgb(${dominantColor.join(',')})`;
            display.style.backgroundColor = colorRgb;

            const item = { image: imageUrl, color: colorRgb };
            if (category === 'tops') {
                uploadedTops.push(item);
            } else if (category === 'bottoms') {
                uploadedBottoms.push(item);
            }
        };
    };
    reader.readAsDataURL(file);
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