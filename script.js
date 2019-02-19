// Array för sökta praktikplatser
let list = (localStorage.list) ? parseList(localStorage.list) : [];

// Funktion som kontrollerar att listan är i korrekt format
function parseList(txt) {
    try { return JSON.parse(txt); } 
    catch(err) { return [new Post('Felaktigt format på lagrad lista! Skapa en ny eller ladda upp en sparad lista.','','','','','','','')]; }
}

// Variabel för att hålla redan på eventuell post som redigeras
let edit;

// Objektkonstruktor för att skapa nya poster
function Post(company, contact, email, phone, contactDate, replyDates, comments, status) {
    this.company = company;
    this.contact = contact;
    this.email = email;
    this.phone = phone;
    this.contactDate = contactDate;
    this.replyDates = replyDates;
    this.comments = comments;
    this.status = status;
}

// Hämta nödvändiga element och lägg till eventlisteners
const inputStatus = document.querySelector('#input-status');
const form = document.querySelector('form');
const company = document.querySelector('[name=company]');
const contact = document.querySelector('[name=contact]');
const email = document.querySelector('[name=email]');
const phone = document.querySelector('[name=phone]');
const contactDate = document.querySelector('[name=contact-date]');
const status = document.querySelector('[name=status]');
const replyDate = document.querySelector('[name=reply-date]');
const replyDates = document.querySelector('[name=reply-dates]');
const addDate = document.querySelector('[name=add-date]');
const remDate = document.querySelector('[name=rem-date]');
const comments = document.querySelector('[name=comments]');
const table = document.querySelector('tbody');
const importFile = document.querySelector('#import-file');
const demoList = document.querySelector('[name=demo-list]');
const clearList = document.querySelector('[name=clear-list]');
const saveList = document.querySelector('#save-list');
const exportList = document.querySelector('#export-list');
form.addEventListener('submit', savePost);
form.addEventListener('reset', updateForm);
addDate.addEventListener('click', addDateF);
remDate.addEventListener('click', remDateF);
importFile.addEventListener('change', importListF);
demoList.addEventListener('click', demoListF);
clearList.addEventListener('click',clearListF);
saveList.addEventListener('click', saveListF);
exportList.addEventListener('click', exportListF);
updateTable();

// Funktion för att uppdatera tabellens data och eventlisteners
function updateTable() {
    let posts = '';
    // Rensa tabell
    table.childNodes.forEach(post => post.remove());
    // Lägg till uppdaterad data
    for (let post of list) {
        posts += `
				<tr ${(post.status) ? 'class="'+post.status+'"' : ''}>
                    <td>${post.company}</td>
                    <td>${post.contact}</td>
                    <td>${post.email}</td>
                    <td>${post.phone}</td>
                    <td>${post.contactDate}</td>
                    <td><span class="replies">${(post.replyDates[0]) ? post.replyDates[0] : ''}</span></td>
                    <td><span class="bubble"}>&#128488;${(post.comments) ? '<span class="comments">' + post.comments + '</span>' : ''}</span></td>
                    <td><span class="edit">&#9998;</span></td>
                    <td><span class="delete">&#10006;</span></td>
				</tr>
				`
    }
    table.innerHTML = posts;
    // Uppdatera eventlisteners
    const edit = document.querySelectorAll('.edit');
    const del = document.querySelectorAll('.delete');
    edit.forEach(btn => btn.addEventListener('click', editPost));
    del.forEach(btn => btn.addEventListener('click', delPost));
}

// Funktion för att uppdatera formulär
function updateForm() {
    edit = undefined;
    replyDates.innerHTML = '';
    inputStatus.innerHTML = 'Lägg till ny ansökan';
}

// Funktion för att lägga till återkopplingsdatum
function addDateF() {
    if (replyDate.value) {
        const option = document.createElement('option');
        option.innerText = replyDate.value;
        replyDates.appendChild(option);
    }
}

// Funktion för att ta bort återkopplingsdatum
function remDateF() {
    if (replyDates.value)
        replyDates.removeChild(replyDates.children[replyDates.selectedIndex]);
}

// Funktion för att skapa/uppdatera poster (praktikansökningar).
function savePost(event) {
    event.preventDefault(); // Hindra sidan från att submita
    // Kontroll av obligatoriska fält
    if (!company.value) { alert('Företag måste anges!'); return; }
    if (!contactDate.value) { alert('Ansökningsdatum måste anges!'); return; }
    let replyDatesArray = [];
    replyDates.childNodes.forEach(option => replyDatesArray.push(option.innerText));
    replyDatesArray.sort().reverse();
    let post = new Post(
        company.value,
        contact.value,
        email.value,
        phone.value,
        contactDate.value,
        replyDatesArray,
        comments.value,
        status.value
    );
    if (!edit) list.push(post); // Lägg till post om en ny skapas
    else list[edit] = post;     // Uppdatera post om en ändring utförs             
    form.reset();
    updateForm();
    localStorage.list = JSON.stringify(list); // Spara nya listan i local storage
    updateTable();
}

// Funktion för att läsa in post till redigering
function editPost() {
    for (let post in table.children) {
        if (table.children[post] === this.parentElement.parentElement) {
            form.reset();
            replyDates.innerHTML = ''; // Ta bort alla options från select
            edit = post; // Sätter edit till aktuell posts plats
            company.value = list[edit].company;
            contact.value = list[edit].contact;
            email.value = list[edit].email;
            phone.value = list[edit].phone;
            contactDate.value = list[edit].contactDate;
            status.value = (list[edit].status) ? list[edit].status : '';
            comments.value = list[edit].comments;
            list[edit].replyDates.forEach(date => {
                const option = document.createElement('option');
                option.innerText = date;
                replyDates.appendChild(option); 
            });
            inputStatus.innerHTML = 'Redigera ansökan';
        }
    }
}

// Ta bort praktikansökan
function delPost() {
    if (confirm('Är du säker på att du vill ta bort posten?')) {
        for (let post in table.children) {
            if (table.children[post] === this.parentElement.parentElement) {
                list.splice(post, 1); // Ta bort objekt ur array
                localStorage.list = JSON.stringify(list); // Spara nya listan i local storage
                updateTable();
            }
        }
    }
}

// Funktion för att importera lista i JSON-format
function importListF() {
    let file = new FileReader();
    file.onload = e => { 
        localStorage.list = e.target.result; // Läs in filens innehåll i localstorage variabel
        list = parseList(localStorage.list); // Uppdatera list-array med nya listan
        updateTable();
    }; 
    file.readAsText(importFile.files[0]); // Ladda in fil
}

// Funktion för att lägga till demolista
function demoListF() {
    if(confirm('Detta kommer ersätta befintlig lista med en demolista, vill du fortsätta?')) {
        localStorage.list = `[
                {"company":"Ankeborg","contact":"Kalle Anka","email":"kalle.anka@ankeborg.se","phone":"070-1234567","contactDate":"2019-02-01","replyDates":["2019-02-08","2019-02-05"],"comments":"Tar inte emot någon praktikant under 2019.","status":"status-no"},
                {"company":"Springfield","contact":"Homer Simpson","email":"homer.simpson@springfield.se","phone":"070-1234567","contactDate":"2019-02-03","replyDates":[],"comments":"","status":""},
                {"company":"Bikinibotten","contact":"Svampbob Fyrkant","email":"svampbob@fyrkant.se","phone":"","contactDate":"2019-02-07","replyDates":["2019-02-11"],"comments":"Möte inbokat med Svampbob, måndag 25/2.","status":"status-pending"},
                {"company":"Quahog","contact":"Peter Griffin","email":"","phone":"070-1234567","contactDate":"2019-02-07","replyDates":["2019-02-15"],"comments":"Redan tillsatt LIA-praktikant för sökt period.","status":"status-no"},
                {"company":"South Park","contact":"Cartman","email":"cartman@southpark.se","phone":"070-1234567","contactDate":"2019-02-08","replyDates":[],"comments":"","status":""},
                {"company":"Sjumilaskogen","contact":"Nalle Puh","email":"puh@sjumilaskogen.se","phone":"","contactDate":"2019-02-11","replyDates":[],"comments":"","status":""},
                {"company":"Bumbiskogen","contact":"Bernhard Bumbi","email":"bernhad@bumbi.se","phone":"070-1234567","contactDate":"2019-02-15","replyDates":["2019-02-19","2019-02-18","2019-02-14"],"comments":"Blev erbjuden LIA 2019-02-19. ","status":"status-yes"},
                {"company":"Strawhat Pirates","contact":"Monkey D Luffy","email":"luffy@strawhats.se","phone":"","contactDate":"2019-02-18","replyDates":[],"comments":"","status":""}
        ]`;
        list = parseList(localStorage.list);
        updateTable();
    }
}

// Funktion för att spara listan i JSON-format
function saveListF() {
    const blob = new Blob([localStorage.list],{type: 'text/plain; charset=utf-8'});
    saveList.href = URL.createObjectURL(blob);
    saveList.download = "lia-tracker.lia";
}

// Funktion för att exportera listan till CSV-format
function exportListF() {
    let csvData = '\uFEFFFöretag;Kontaktperson;E-post;Telefon;Ansökningsdatum;Återkopplingar;Kommentar;Status';
    list.forEach(post => csvData += 
        `\n${post.company};${post.contact};${post.email};${post.phone};${post.contactDate};${post.replyDates.join(', ')};${post.comments};${(post.status === 'status-yes') ? 'Fått LIA' : (post.status === 'status-no') ? 'Ej fått LIA' : (post.status === 'status-pending') ? 'Samtal pågår' : 'Sökt'}`
    );
    const blob = new Blob([csvData],{type: 'data:text/csv;charset=utf-8'});
    exportList.href = URL.createObjectURL(blob);
    exportList.download = "lia-tracker.csv";
}

// Funktion för att tömma tabellen
function clearListF() {
    if(confirm('Är du säker på att du vill tömma listan?')) {
        localStorage.list = [];
        list = [];
        updateTable();
    }
}