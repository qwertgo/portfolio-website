const leftBtn = document.querySelector(".arrow.left"); 
const rightBtn = document.querySelector(".arrow.right"); 

const cardTrack = document.querySelector(".card-track");
const projectContent = document.querySelector(".project-content");

const style = getComputedStyle(cardTrack);
const allCards = cardTrack.querySelectorAll(".card");
const cardCount = allCards.length;
const halfCardCount = Math.floor( cardCount / 2);
const hasEvenCardCount = cardCount % 2 == 0;
const peekCardCount = 2;

let cardIndex = 0;

//css variables
let defaultCardWidth;
let defaultCardHeight;
let defaultDropShadowY;
let defaultDropShadowBlur;
let defaultFontSize;
let defaultBottom;

let activeCardWidth;
let activeCardHeight;
let activeDropShadowY;
let activeDropShadowBlur;
let activeFontSize;
let activeBottom;

let cardBaseXOffset;
let cardEaseXOffset;

let oldVariables = new Map();
let halfScreenWidth = 0;

cardIndex = Math.floor((cardCount + (hasEvenCardCount ? -1 : 0)) / 2.0);

class CardVariables 
{
    constructor(left, cardWidth, cardHeight, rotation, fontsize, bottom, dropShadowY, dropShadowBlur)
    {
        this.left = left;
        this.cardWidth = cardWidth;
        this.cardHeight = cardHeight;
        this.rotation = rotation;
        this.fontSize = fontsize;
        this.bottom = bottom;
        this.dropShadowY = dropShadowY;
        this.dropShadowBlur = dropShadowBlur;
    }
}

//remap index to reflect the index of the card in the array
function cardToArrayIndex(index)
{
    return cardCount - 1 - (index + halfCardCount) % cardCount;
}

function fetchCardVariables()
{
    defaultCardWidth = parseFloat(style.getPropertyValue("--defaultCardWidth")) + "px";
    defaultCardHeight = parseFloat(style.getPropertyValue("--defaultCardHeight")) + "px";
    defaultDropShadowY = parseFloat(style.getPropertyValue("--defaultDropShadowY")) + "px";
    defaultDropShadowBlur = parseFloat(style.getPropertyValue("--defaultDropShadowBlur")) + "px";
    defaultFontSize = parseFloat(style.getPropertyValue("--defaultFontSize")) + "pt";
    defaultBottom = parseFloat(style.getPropertyValue("--defaultBottom")) + "%";

    activeCardWidth = parseFloat(style.getPropertyValue("--activeCardWidth")) + "px";
    activeCardHeight = parseFloat(style.getPropertyValue("--activeCardHeight")) + "px";
    activeDropShadowY = parseFloat(style.getPropertyValue("--activeDropShadowY")) + "px";
    activeDropShadowBlur = parseFloat(style.getPropertyValue("--activeDropShadowBlur")) + "px";
    activeFontSize = parseFloat(style.getPropertyValue("--activeFontSize")) + "pt";
    activeBottom = parseFloat(style.getPropertyValue("--activeBottom")) + "%";

    cardBaseXOffset = parseFloat(style.getPropertyValue("--cardBaseXOffset"));
    cardEaseXOffset = parseFloat(style.getPropertyValue("--cardEaseXOffset"));
}

function updateCardSelection(prevCardIndex)
{
    fetchCardVariables();
    const prevArrayIndex = cardToArrayIndex(prevCardIndex);
    const arrayIndex = cardToArrayIndex(cardIndex);
    loadProjectContent(arrayIndex);
    updateCardVisuals(arrayIndex);
}

function updateCardVisuals(arrayIndex)
{
    halfScreenWidth = window.innerWidth * .5;
    const random = new alea('portfolio');
    const trackStyle = getComputedStyle(cardTrack);

    for(let i = 0; i < allCards.length; i++)
    {
        const [distance, direction] = getDistanceAndDirection(i, arrayIndex);
        //need to always get the random number so the rotation for each card stays the same
        const randomNumber = random();
        let rotation = ((random() - .5) * .1) + "turn";
        updateCssVariables(i, distance, direction, trackStyle, rotation);
    }
}

function getDistanceAndDirection(i, arrayIndex)
{
    const offsetIndex = i - arrayIndex;
    const firstDistance = Math.abs(offsetIndex);
    const secondDistance = Math.abs(offsetIndex - allCards.length);
    const thirdDistance = Math.abs(offsetIndex + allCards.length);
    let distance;
    let direction = 0; //-1 left, 0 middle, 1 right;
    
    if(firstDistance < secondDistance && firstDistance < thirdDistance)
    {
        distance = firstDistance;
        direction = Math.sign(offsetIndex);
    }
    else if(secondDistance < firstDistance && secondDistance < thirdDistance)
    {
        distance = secondDistance;
        direction = -1;
    }
    else
    {
        distance = thirdDistance;
        direction = 1;
    }

    return [distance, direction]
}

function updateCssVariables(i, distance, direction, trackStyle, rotation)
{
    let display = "none";
    let visibility = "hidden";

    if(distance <= peekCardCount)
    {
        display = "block";
        visibility = "visible";
        left = "auto";
        let cardVariables = new CardVariables(
            0,
            defaultCardWidth,
            defaultCardHeight,
            rotation,
            defaultFontSize,
            defaultBottom,
            defaultDropShadowY,
            defaultDropShadowBlur
        );

        if(direction == 0)
        {
            cardVariables.left = halfScreenWidth + "px";
            cardVariables.cardWidth = activeCardWidth;
            cardVariables.cardHeight = activeCardHeight;
            cardVariables.dropShadowY = activeDropShadowY;
            cardVariables.dropShadowBlur = activeDropShadowBlur;
            cardVariables.fontSize = activeFontSize;
            cardVariables.bottom = activeBottom;
            cardVariables.rotation = "0turn";
        }
        else
        {
            let distancePercentage;
            let leftFloat;
            if(direction < 0)
            {
                distancePercentage = getDistancePercentage(distance);
                leftFloat = halfScreenWidth - cardBaseXOffset - 
                    distancePercentage * cardEaseXOffset;
            }
            else
            {
                distancePercentage = getDistancePercentage(distance);
                leftFloat = halfScreenWidth + cardBaseXOffset + 
                    distancePercentage * cardEaseXOffset;
            }

            cardVariables.left = leftFloat + "px";
        }

        animateActiveCards(i, distance, cardVariables);
    }

    allCards[i].style.setProperty("--display", display);
    allCards[i].style.setProperty("--visibility", visibility);
}

function getDistancePercentage(distance)
{
    const normalizedDistance = distance / peekCardCount;
    const invertedNormDistance = 1 - normalizedDistance;
    return 1 - invertedNormDistance * invertedNormDistance;
}

function animateActiveCards(i, distance, cardVariables)
{
    let cardStyle = allCards[i].style;
    cardStyle.setProperty("--zIndex", peekCardCount - distance);

    if(oldVariables.has(i))
    {
        lastState = oldVariables.get(i);
        allCards[i].animate([
            {
                "--left": lastState.left,
                "--cardWidth": lastState.cardWidth,
                "--cardHeight": lastState.cardHeight,
                "--rotation": lastState.rotation,
                "--fontSize": lastState.fontSize,
                "--bottom": lastState.bottom,
                "--dropShadowY": lastState.dropShadowY,
                "--dropShadowBlur": lastState.dropShadowBlur,
            },
            {
                "--left": cardVariables.left,
                "--cardWidth": cardVariables.cardWidth,
                "--cardHeight": cardVariables.cardHeight,
                "--rotation": cardVariables.rotation,
                "--fontSize": cardVariables.fontSize,
                "--bottom": cardVariables.bottom,
                "--dropShadowY": cardVariables.dropShadowY,
                "--dropShadowBlur": cardVariables.dropShadowBlur,
            }
        ], {duration: 400, easing: "ease-in-out", fill: "forwards"});
    }
    else
    {
        cardStyle.setProperty("--left", cardVariables.left);
        cardStyle.setProperty("--cardWidth", cardVariables.cardWidth);
        cardStyle.setProperty("--cardHeight", cardVariables.cardHeight);
        cardStyle.setProperty("--rotation", cardVariables.rotation);
        cardStyle.setProperty("--fontSize", cardVariables.fontSize);
        cardStyle.setProperty("--bottom", cardVariables.bottom);
        cardStyle.setProperty("--dropShadowY", cardVariables.dropShadowY);
        cardStyle.setProperty("--dropShadowBlur", cardVariables.dropShadowBlur);
    }

    oldVariables.set(i, cardVariables);
}
        

//load page by id name
async function loadProjectContent(arrayIndex)
{
    const contentName = allCards[arrayIndex].id;

    try
    {
        const response = await fetch(`ProjectContent/${contentName}.html`)

        if(!response.ok)
            throw new Error(`File not found: ${contentName}`);
        
        const htmlData = await response.text();

        projectContent.innerHTML = '';
        projectContent.innerHTML = htmlData;
    }
    catch(error)
    {
        console.error(error);
        projectContent.innerHTML = `<p style="color:red;">Error loading content: ${error.message}</p>`;
    }
}

rightBtn.addEventListener("click", () => {
    const prevCardIndex = cardIndex;
    cardIndex--;
    
    if(cardIndex < 0)
        cardIndex = cardCount - 1;
    
    updateCardSelection(prevCardIndex);
});

leftBtn.addEventListener("click", () => {
    const prevCardIndex = cardIndex;
    cardIndex++;
    cardIndex %= cardCount;
    
    updateCardSelection(prevCardIndex);
});

addEventListener("resize", () => {
    fetchCardVariables();
    updateCardVisuals(cardToArrayIndex(cardIndex));
});

fetchCardVariables();
updateCardSelection(0);