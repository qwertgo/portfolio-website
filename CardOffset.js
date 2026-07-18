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

cardIndex = Math.floor((cardCount + (hasEvenCardCount ? -1 : 0)) / 2.0);

class CardVariables 
{
    constructor(left, cardWidth, cardHeight, rotation)
    {
        this.left = left;
        this.cardWidth = cardWidth;
        this.cardHeight = cardHeight;
        this.rotation = rotation;
    }
}

//remap index to reflect the index of the card in the array
function cardToArrayIndex(index)
{
    return cardCount - 1 - (index + halfCardCount) % cardCount;
}

function fetchCardVariables()
{
    defaultCardWidth = parseFloat(style.getPropertyValue("--defaultCardWidth"));
    defaultCardHeight = parseFloat(style.getPropertyValue("--defaultCardHeight"));
    defaultDropShadowY = parseFloat(style.getPropertyValue("--defaultDropShadowY"));
    defaultDropShadowBlur = parseFloat(style.getPropertyValue("--defaultDropShadowBlur"));
    defaultFontSize = parseFloat(style.getPropertyValue("--defaultFontSize"));
    defaultBottom = parseFloat(style.getPropertyValue("--defaultBottom"));

    activeCardWidth = parseFloat(style.getPropertyValue("--activeCardWidth"));
    activeCardHeight = parseFloat(style.getPropertyValue("--activeCardHeight"));
    activeDropShadowY = parseFloat(style.getPropertyValue("--activeDropShadowY"));
    activeDropShadowBlur = parseFloat(style.getPropertyValue("--activeDropShadowBlur"));
    activeFontSize = parseFloat(style.getPropertyValue("--activeFontSize"));
    activeBottom = parseFloat(style.getPropertyValue("--activeBottom"));

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
    const halfScreenWidth = window.innerWidth * .5;
    const random = new alea('portfolio');
    const trackStyle = getComputedStyle(cardTrack);

    for(let i = 0; i < allCards.length; i++)
    {
        const [distance, direction] = getDistanceAndDirection(i, arrayIndex);
        //need to always get the random number so the rotation for each card stays the same
        const randomNumber = random();
        let rotation = i == arrayIndex ? 0 : (randomNumber - .5) * .1;
        rotation += "turn";
        updateCssVariables(i, distance, direction, halfScreenWidth, trackStyle, rotation);
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

function updateCssVariables(i, distance, direction, halfScreenWidth, trackStyle, rotation)
{
    let display = "none";
    let visibility = "hidden";

    if(distance <= peekCardCount)
    {
        display = "block";
        visibility = "visible";
        left = "auto";
        let cardWidth = activeCardWidth + "px";
        let cardHeight = activeCardHeight + "px";
        let dropShadowY = activeDropShadowY;
        let dropShadowBlur = activeDropShadowBlur;
        let fontSize = activeFontSize;
        let bottom = activeBottom;

        if(direction == 0)
        {
            left = halfScreenWidth + "px";
            yOffset = 0;
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

            cardWidth = defaultCardWidth + "px";
            cardHeight = defaultCardHeight + "px";
            dropShadowY = defaultDropShadowY;
            dropShadowBlur = defaultDropShadowBlur;
            fontSize = defaultFontSize;
            bottom = defaultBottom;
            left = leftFloat + "px";
        }

        let cardStyle = allCards[i].style;
        cardStyle.setProperty("--zIndex", peekCardCount - distance);
        cardStyle.setProperty("--dropShadowY", dropShadowY + "px");
        cardStyle.setProperty("--dropShadowBlur", dropShadowBlur + "px");
        cardStyle.setProperty("--fontSize", fontSize + "pt");
        cardStyle.setProperty("--bottom", bottom + "%");

        if(oldVariables.has(i))
        {
            allCards[i].animate([
                {
                    "--left": oldVariables.get(i).left,
                    "--cardWidth": oldVariables.get(i).cardWidth,
                    "--cardHeight": oldVariables.get(i).cardHeight,
                    "--rotation": oldVariables.get(i).rotation
                },
                {
                    "--left": left,
                    "--cardWidth": cardWidth,
                    "--cardHeight": cardHeight,
                    "--rotation": rotation
                }
            ], {duration: 500, easing: "ease", fill: "forwards"});
        }
        else
        {
            cardStyle.setProperty("--left", left);
            cardStyle.setProperty("--cardWidth", cardWidth);
            cardStyle.setProperty("--cardHeight", cardHeight);
            cardStyle.setProperty("--rotation", rotation);
        }

        oldVariables.set(i, new CardVariables(left, cardWidth, cardHeight, rotation));

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
        
function animateCardOffset(newOffset, instant)
{
    cardTrack.style.setProperty("--cardOffset", `${newOffset}px`);
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