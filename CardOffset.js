const leftBtn = document.querySelector(".arrow.left"); 
const rightBtn = document.querySelector(".arrow.right"); 

const cardTrack = document.querySelector(".card-track");
const projectContent = document.querySelector(".project-content");

const style = getComputedStyle(cardTrack);
const allCards = cardTrack.querySelectorAll(".card");
const cardCount = allCards.length;
const halfCardCount = Math.floor( cardCount / 2);
const hasEvenCardCount = cardCount % 2 == 0;

let cardIndex = 0;

//css variables
let cardWidth;
let activeCardWidth;
let cardSpacing;
let activeCardSpacing;
let singleCardOffset;
let evenBaseCardOffset;

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

    singleCardOffset = cardWidth + cardSpacing;
    evenBaseCardOffset = singleCardOffset * .5;
}

function updateCardSelection(prevCardIndex)
{
    fetchCardVariables();
    const prevArrayIndex = cardToArrayIndex(prevCardIndex);
    const arrayIndex = cardToArrayIndex(cardIndex);
    loadProjectContent(arrayIndex);
    updateCardVisibility(arrayIndex);
    // updateCardPositioning(arrayIndex, false);
}

function updateCardVisibility(arrayIndex)
{
    for(let i = 0; i < allCards.length; i++)
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
        
        let display = "none";
        let visibility = "hidden";

        if(distance <= 1)
        {
            display = "block";
            visibility = "visible";
            left = "auto";
            
            switch(direction)
            {
                case 0:
                    allCards[i].classList.add("active");
                    left = "50%";
                    break;
                case -1:
                    left = "25%";
                    allCards[i].classList.remove("active");
                    break;
                
                case 1:
                    left = "75%";
                    allCards[i].classList.remove("active");
                    break;

                default:
                    console.logerror("Non viable direction: " + direction);
            }

            allCards[i].style.setProperty("--left", left);
            allCards[i].style.setProperty("--zIndex", 1 - distance);
        }

        allCards[i].style.setProperty("--display", display);
        allCards[i].style.setProperty("--visibility", visibility);
    }
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
    updateCardPositioning(cardToArrayIndex(cardIndex), true);
});

fetchCardVariables();
updateCardSelection(0);