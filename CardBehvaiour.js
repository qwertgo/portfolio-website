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
let cardFlowDirection;

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

let oldCardVariables = new Map();
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
        initateCardAnimation(i, distance, direction, trackStyle, rotation);
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

function initateCardAnimation(i, distance, direction, trackStyle, rotation)
{
    let display = "none";
    let visibility = "hidden";

    if(distance <= peekCardCount)
    {
        display = "block";
        visibility = "visible";
        const cardVariables = getActiveCardVariables(i, distance, direction, rotation);
        animateActiveCard(i, distance, cardVariables);
    }
    else if(distance == peekCardCount + 1 && direction == cardFlowDirection)
    {
        display = "block";
        visibility = "visible";
        animateDisappearingCard(i, rotation);
    }

    allCards[i].style.setProperty("--display", display);
    allCards[i].style.setProperty("--visibility", visibility);
}

function getActiveCardVariables(i, distance, direction, rotation)
{
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
        cardVariables.left = getLeftPostition(distance, direction) + "px";

        if(distance == peekCardCount && direction == cardFlowDirection * -1)
            setAppearingCardVariables(i, rotation);
    }

    return cardVariables;
}

function getLeftPostition(distance, direction)
{
    let distancePercentage;
    if(direction < 0)
    {
        distancePercentage = getDistancePercentage(distance);
        return halfScreenWidth - cardBaseXOffset - 
            distancePercentage * cardEaseXOffset;
    }

    distancePercentage = getDistancePercentage(distance);
    return halfScreenWidth + cardBaseXOffset + 
        distancePercentage * cardEaseXOffset;
    
}

function getDistancePercentage(distance)
{
    const normalizedDistance = distance / peekCardCount;
    const invertedNormDistance = 1 - normalizedDistance;
    return 1 - invertedNormDistance * invertedNormDistance;
}

function setAppearingCardVariables(i, rotation)
{
    if(oldCardVariables.has(i))
    {
        const oldV = oldCardVariables.get(i);
        oldV.left = halfScreenWidth + "px";
        oldV.cardWidth = "0px";
        oldV.cardHeight = "0px";
        oldV.fontSize = "0pt";
    }
    else
    {
        const oldV = new CardVariables(
            halfScreenWidth + "px",
            "0px",
            "0px",
            rotation,
            "0pt",
            defaultBottom,
            defaultDropShadowY,
            defaultDropShadowBlur
        );

        oldCardVariables.set(i, oldV);
    }
}

function animateActiveCard(i, distance, cardVariables, rotation)
{
    let cardStyle = allCards[i].style;
    cardStyle.setProperty("--zIndex", peekCardCount - distance);

    if(oldCardVariables.has(i))
        animateSingleCard(allCards[i], oldCardVariables.get(i), cardVariables);
    else
    {
        const startCard = new CardVariables(
            halfScreenWidth + "px",
            "0px",
            "0px",
            rotation,
            "0pt",
            defaultBottom,
            "0px",
            "0px"
        );
        const duration = distance / peekCardCount * 200 + 400;
        animateSingleCard(allCards[i], startCard, cardVariables, duration);
    }

    oldCardVariables.set(i, cardVariables);
}

function animateSingleCard(card, from, to, duration = 400)
{
    return card.animate([
        {
            "--left": from.left,
            "--cardWidth": from.cardWidth,
            "--cardHeight": from.cardHeight,
            "--rotation": from.rotation,
            "--fontSize": from.fontSize,
            "--bottom": from.bottom,
            "--dropShadowY": from.dropShadowY,
            "--dropShadowBlur": from.dropShadowBlur,
        },
        {
            "--left": to.left,
            "--cardWidth": to.cardWidth,
            "--cardHeight": to.cardHeight,
            "--rotation": to.rotation,
            "--fontSize": to.fontSize,
            "--bottom": to.bottom,
            "--dropShadowY": to.dropShadowY,
            "--dropShadowBlur": to.dropShadowBlur,
        }
    ], {duration: duration, easing: "ease-in-out", fill: "forwards"});
}

function animateDisappearingCard(i, rotation)
{
    cardStyle = allCards[i].style;
    cardStyle.setProperty("--zIndex", -1);

    const oldVariables = oldCardVariables.get(i);
    const newValues = new CardVariables(
        halfScreenWidth + "px",
        "0px",
        "0px",
        rotation,
        "0pt",
        oldVariables.bottom,
        oldVariables.dropShadowY,
        oldVariables.dropShadowBlur
    );

    const animation = animateSingleCard(allCards[i], oldCardVariables.get(i), newValues);

    animation.finished.then(() =>
    {
        cardStyle.setProperty("--display", "none");
        cardStyle.setProperty("--visibility", "hidden");
        cardStyle.setProperty("--zIndex", 0);
    });
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

        cleanupVideos(projectContent);
        projectContent.innerHTML = '';
        projectContent.innerHTML = htmlData;
        initLazyVideos(projectContent);
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
    cardFlowDirection = -1;
    
    if(cardIndex < 0)
        cardIndex = cardCount - 1;
    
    updateCardSelection(prevCardIndex);
});

leftBtn.addEventListener("click", () => {
    const prevCardIndex = cardIndex;
    cardIndex++;
    cardIndex %= cardCount;
    cardFlowDirection = 1;
    
    updateCardSelection(prevCardIndex);
});

addEventListener("resize", () => {
    fetchCardVariables();
    updateCardVisuals(cardToArrayIndex(cardIndex));
});

fetchCardVariables();
updateCardSelection(0);