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
let cardWidth;
let activeCardWidth;
let cardSpacing;
let activeCardSpacing;
let singleCardOffset;
let evenBaseCardOffset;
let cardBaseXOffset;
let cardEaseXOffset;

cardIndex = Math.floor((cardCount + (hasEvenCardCount ? -1 : 0)) / 2.0);

//remap index to reflect the index of the card in the array
function cardToArrayIndex(index)
{
    return cardCount - 1 - (index + halfCardCount) % cardCount;
}

function fetchCardVariables()
{
    cardWidth = parseFloat(style.getPropertyValue("--cardWidth"));
    activeCardWidth = parseFloat(style.getPropertyValue("--activeCardWidth"));
    cardSpacing = parseFloat(style.getPropertyValue("--cardSpacing"));
    activeCardSpacing = parseFloat(style.getPropertyValue("--activeCardSpacing"));
    cardBaseXOffset = parseFloat(style.getPropertyValue("--cardBaseXOffset"));
    cardEaseXOffset = parseFloat(style.getPropertyValue("--cardEaseXOffset"));

    singleCardOffset = cardWidth + cardSpacing;
    evenBaseCardOffset = singleCardOffset * .5;
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

    for(let i = 0; i < allCards.length; i++)
    {
        const [distance, direction] = getDistanceAndDirection(i, arrayIndex);
        updateCssVariables(i, distance, direction, halfScreenWidth);

        //need to always get the random number so the rotation for each card stays the same
        const randomNumber = random();
        const rotation = i == arrayIndex ? 0 : (randomNumber - .5) * .1;
        allCards[i].style.setProperty("--rotation", rotation + "turn");
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

function updateCssVariables(i, distance, direction, halfScreenWidth)
{
    let display = "none";
    let visibility = "hidden";

    if(distance <= peekCardCount)
    {
        display = "block";
        visibility = "visible";
        left = "auto";
        let distancePercentage;
        let leftFloat;
        
        switch(direction)
        {
            case 0:
                allCards[i].classList.add("active");
                left = "50%";
                yOffset = 0;
                break;
            case -1:
                distancePercentage = getDistancePercentage(distance);
                leftFloat = halfScreenWidth - cardBaseXOffset - 
                    distancePercentage * cardEaseXOffset;
                left = leftFloat + "px";
                allCards[i].classList.remove("active");
                break;
            
            case 1:
                distancePercentage = getDistancePercentage(distance);
                leftFloat = halfScreenWidth + cardBaseXOffset + 
                    distancePercentage * cardEaseXOffset;
                left = leftFloat + "px";
                allCards[i].classList.remove("active");
                break;

            default:
                console.logerror("Non viable direction: " + direction);
        }

        allCards[i].style.setProperty("--left", left);
        allCards[i].style.setProperty("--zIndex", peekCardCount - distance);
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