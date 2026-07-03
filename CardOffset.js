const leftBtn = document.querySelector(".arrow.left"); 
const rightBtn = document.querySelector(".arrow.right"); 

const cardTrack = document.querySelector(".card-track");
const projectContent = document.querySelector(".project-content");

const style = getComputedStyle(cardTrack);
const cardCount = cardTrack.querySelectorAll(":scope > .card").length;
const halfCardCount = Math.floor( cardCount / 2);
const hasEvenCardCount = cardCount % 2 == 0;

const originalContent = cardTrack.innerHTML;
cardTrack.innerHTML += originalContent + originalContent;
const allCards = document.querySelectorAll(".card");

let cardIndex = 0;

//remove cards added by script
let selectableCards = Array.from(allCards);
selectableCards = selectableCards.slice(cardCount, selectableCards.length - cardCount);

//css variables
let cardWidth;
let activeCardWidth;
let cardSpacing;
let activeCardSpacing;
let singleCardOffset;
let evenBaseCardOffset;

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

    singleCardOffset = cardWidth + cardSpacing;
    evenBaseCardOffset = singleCardOffset * .5;
}

function updateCardSelection(prevCardIndex)
{
    fetchCardVariables();
    const prevArrayIndex = cardToArrayIndex(prevCardIndex);
    const arrayIndex = cardToArrayIndex(cardIndex);
    
    selectableCards[prevArrayIndex].classList.remove("active");
    selectableCards[arrayIndex].classList.add("active");
    
    updateCardPositioning(arrayIndex, false);
}

function updateCardPositioning(arrayIndex, instant)
{
    let cardOffsetIndex = arrayIndex - halfCardCount;
    
    if(!hasEvenCardCount && cardOffsetIndex == 0)
    {
        animateCardOffset(0, instant);
        loadProjectContent(arrayIndex);
        return;
    }
    
    let baseOffset;
    if(hasEvenCardCount)
    {
        baseOffset = evenBaseCardOffset;
        if(cardOffsetIndex >= 0)
            cardOffsetIndex++;
    }
    else
        baseOffset = singleCardOffset;
    
    const cardsOffset = singleCardOffset * (Math.max(Math.abs(cardOffsetIndex) - 1, 0));
    const totalOffset = (baseOffset + cardsOffset) * -Math.sign(cardOffsetIndex);
    
    animateCardOffset(totalOffset, instant);
    loadProjectContent(arrayIndex);
}
        
function animateCardOffset(newOffset, instant)
{
    cardTrack.style.setProperty("--cardOffset", `${newOffset}px`);
}

//load page by id name
async function loadProjectContent(arrayIndex)
{
    const contentName = selectableCards[arrayIndex].id;

    try
    {
        const response = await fetch(`ProjectContent/${contentName}.html`)

        if(!response.ok)
            throw new Error(`File not found: ${contentName}`);
        
        const htmlData = await response.text();

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
    updateCardPositioning(cardToArrayIndex(cardIndex), true);
});

let cardAddition = 0;
if(hasEvenCardCount)
    cardAddition = -1;

cardIndex = Math.floor((cardCount + cardAddition) / 2.0);

fetchCardVariables();
updateCardSelection(0);