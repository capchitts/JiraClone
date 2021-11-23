let addBtn = document.querySelector(".add-btn");
let remBtn = document.querySelector(".remove-btn");
let modalContainer = document.querySelector('.modal-cont');
let taskArea = document.querySelector('.textarea-cont');
let mainContainer = document.querySelector('.main-cont');
let allpriorityColor = document.querySelectorAll('.priority-color');
let toolboxColors  = document.querySelectorAll('.color');



let addFlag = false;
let remFlag = false;
let lockClass = 'fa-lock';
let unlockClass = 'fa-lock-open';

let colors = ['lightpink','lightblue','lightgreen','black'];

//fix black as default color    
let modalPriorityColor = colors[colors.length-1];


//for maintaining ticket
let ticketsArr = [];

/* below code add eventlisteners to colors
* Single click ---> only how selected color tickets
* Double Click ---> Show all the tickets
*/

//re render all the persistant tickets on reload or startup
if(localStorage.getItem("jira_tickets"))
{
    //Retrieve and display tickets
    ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketsArr.forEach((ticketObj)=>{
        createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);

    });
}

for(let i = 0;i<toolboxColors.length;i++)
{
    //add click eventlistener on toolboxColor
    toolboxColors[i].addEventListener('click',(e)=>{
        let currentToolboxColor = toolboxColors[i].classList[0];
        
        //extract out tickets with currentColor
        let filteredTickets = ticketsArr.filter((ticketObj,idx)=>{
            return currentToolboxColor === ticketObj.ticketColor;
        });

        //Remove previous tickets
        let allTicketsCont = document.querySelectorAll('.ticket-cont');
        for(let i=0;i<allTicketsCont.length;i++)
        {
            allTicketsCont[i].remove();
        }

        //Display filtered tickets
        filteredTickets.forEach((ticketObj,idx)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask,ticketObj.ticketID);
        });
    });


    toolboxColors[i].addEventListener('dblclick',(e)=>{
        
        //Remove all tickets
        let allTicketsCont = document.querySelectorAll('.ticket-cont');
        for(let i=0;i<allTicketsCont.length;i++)
        {
            allTicketsCont[i].remove();
        } 

        //createTicket form ticketarr
        ticketsArr.forEach((ticketObj,idx)=>{
            createTicket(ticketObj.ticketColor,ticketObj.ticketTask, ticketObj.ticketID);
        });
    });
}

addBtn.addEventListener('click', (e) =>{
    //Display Modal

    //Generate ticket

    //Add flag == true then  Modal -> display
    // else Modal -> none
    addFlag = !addFlag;
    if(addFlag)
    {
        modalContainer.style.display="flex";
    }
    else
    {
        modalContainer.style.display="none";
    }

});


remBtn.addEventListener('click', (e) =>{
    remFlag = !remFlag;
});


modalContainer.addEventListener('keydown',(e)=>{
    let key = e.key;
    if(key === 'Shift')
    {
        createTicket(modalPriorityColor, taskArea.value);
        addFlag = false;
        setModalToDefault();

    }

});

//this function create ticket when plus sign is clicked on 
function createTicket(ticketColor,ticketTask, ticketID)
{
    //if no ticketID is undefined means it is created for first time
    let id = ticketID || shortid();


    let ticketCont = document.createElement('div');
    ticketCont.setAttribute("class","ticket-cont");

    //add html content
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor} "></div>
        <div class="ticket-id">${id}</div>
        <div class="task-area">${ticketTask}</div>   
        <div class="ticket-lock">
            <i class="fas fa-lock"></i>
        </div>
        `;

    //add  ticket to ticketArr only if it is new ticket
    if(!ticketID)
    {
        ticketsArr.push({ticketColor,ticketTask,ticketID: id});
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
    }
    //append this ticket to mainContainer
    mainContainer.appendChild(ticketCont);
    handleRemoval(ticketCont,id);
    handleLock(ticketCont,id);
    handleColor(ticketCont,id);
}

//to set ticket color
function handleColor(ticket,id)
{
    let ticketColor = ticket.querySelector('.ticket-color');

    ticketColor.addEventListener('click',(e)=>{
        let currentTicketColor = ticketColor.classList[1];
        //Get color ticket index
        console.log(currentTicketColor);
        let ticketIdx = getTicketIdx(id);

        
        let currentTicketColorIndex = colors.findIndex((color)=>{
            return currentTicketColor === color;
        });
        
        let newColorIndex = (currentTicketColorIndex +1)%4;
        let newColorTicket = colors[newColorIndex];
        
        console.log(newColorIndex);
        console.log(newColorTicket);
        
        //add next color as ticket color and remove current one
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newColorTicket);


        //Modify data in local storage
        ticketsArr[ticketIdx].ticketColor = newColorTicket;
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));    
    });
   

}

function getTicketIdx(id)
{
    let ticketIndex = ticketsArr.findIndex((ticketObj, idx)=>{
        return ticketObj.ticketID === id;
    });

    return ticketIndex;
}



function handleRemoval(ticket, id)
{
    ticket.addEventListener('click',(e)=>{
        if(!remFlag) return;
        
        //DB removal
        let ticketIdx = getTicketIdx(id);
        ticketsArr.splice(ticketIdx,1);
        localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));

        ticket.remove();//UI removal
    });


    
}

function handleLock(ticket,id)
{
    let lockElement = ticket.querySelector('.ticket-lock');
    let ticketlock = lockElement.children[0];
    
    //additional functionality we have to add is to make 
    //task area editable or uneditable
    let taskArea = ticket.querySelector('.task-area');
    
    ticketlock.addEventListener('click',(e)=>{
        if(ticketlock.classList.contains(lockClass))
        {
            console.log("unlocked");

            ticketlock.classList.remove(lockClass);
            ticketlock.classList.add(unlockClass);
            taskArea.setAttribute("contenteditable",'true');
        }
        else
        {
            console.log("locked");
            //remove unlock class
            ticketlock.classList.remove(unlockClass);
            //add lock class
            ticketlock.classList.add(lockClass);
            taskArea.setAttribute("contenteditable",'false');
        }
    });

    let ticketIdx = getTicketIdx(id);
    ticketsArr[ticketIdx].taskArea = taskArea.innerText;
    //it get overwrite eveytime
    localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));

}

//Listener for modal priority coloring
allpriorityColor.forEach((colorElem , idx)=>{

    colorElem.addEventListener('click',(e)=>{

        console.log(colorElem.classList[0]);
        //remove border functionalities from all the colors
        allpriorityColor.forEach((c_elem,idx2)=>{

            c_elem.classList.remove('border');
        });

        //add border class to clicked element only
        colorElem.classList.add('border');

        //get the priority color in modalPriorityColor
        modalPriorityColor = colorElem.classList[0];

    });
});

function setModalToDefault()
{
    modalContainer.style.display="none";
    taskArea.value = "";
    modalPriorityColor = colors[colors.length-1];
    
    //remove border from all classes and add it to the black.
    allpriorityColor.forEach((curColor,idx)=>{
        curColor.classList.remove('border');
    });

    allpriorityColor[allpriorityColor.length - 1].classList.add('border');
}
