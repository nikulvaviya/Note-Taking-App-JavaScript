"use strict";

/*
  $ Module Import
*/
import {
  addEventOnElements,
  getGreetingMsg,
  activeNotebook,
  makeElemEditable,
} from "./utils.js";
import { Tooltip } from "./components/Tooltip.js";
import { db } from "./db.js";
import { client } from "./client.js";
import { NoteModal } from "./components/Modal.js";

// $ <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=>

/*
  $ Toggle Sidebar in Small Screen
*/

const /* {HTMLElement} */ $sidebar = document.querySelector("[data-sidebar]");

const /* {Array<HTMLElement>} */ $sidebarTogglers = document.querySelectorAll(
    "[data-sidebar-toggler]"
  );

const /* {HTMLElements} */ $overlay = document.querySelector(
    "[data-sidebar-overlay]"
  );

addEventOnElements($sidebarTogglers, "click", function () {
  $sidebar.classList.toggle("active");
  $overlay.classList.toggle("active");
});

// $ <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=>

/*
  $ Initialize tooltip behavior for all DOM elements with a 'data-tooltip' attribute.
*/

const /* {Array<HTMLElement>} */ $tooltipElems =
    document.querySelectorAll("[data-tooltip]");

$tooltipElems.forEach(($elem) => Tooltip($elem));

// $ <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=>

/*
  $ Show Greeting Message on Homepage
*/

const /* {HTMLElement} */ $greetElem =
    document.querySelector("[data-greeting]");

const /* {number} */ currentHour = new Date().getHours();

$greetElem.textContent = getGreetingMsg(currentHour);

// $ <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=>

/*
  $ Show Current Date on Homepage
*/

const /* {HTMLElement} */ $currentDateElem = document.querySelector(
    "[data-current-date]"
  );

$currentDateElem.textContent = new Date().toDateString().replace(" ", ", ");

// $ <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=> <=>

/*
  $ Notebook Create Field
*/

const /* {HTMLElement} */ $sidebarList = document.querySelector(
    "[data-sidebar-list]"
  );

const /* {HTMLElement} */ $addNotebookBtn = document.querySelector(
    "[data-add-notebook]"
  );

/*

  * Shows a Notebook Creation Field in the sidebar when the "Add Notebook" button is clicked.

  * The function dynamically adds a new notebook field element, makes it editable, and listens for.

  * the "Enter" key to create a new notebook when pressed.

*/

const showNotebookField = function () {
  const /* {HTMLElement} */ $navItem = document.createElement("div");
  $navItem.classList.add("nav-item");

  $navItem.innerHTML = `
    <span class="text text-label-large" data-notebook-field></span>

    <div class="state-layer"></div>
  `;

  $sidebarList.appendChild($navItem);

  const /* {HTMLElement} */ $navItemField = $navItem.querySelector(
      "[data-notebook-field]"
    );

  //$ Active New created notebook and de-active the last one.
  activeNotebook.call($navItem);

  //$ Make notebook field content editable and focus
  makeElemEditable($navItemField);

  //$ When user press "Enter" then Create notebook
  $navItemField.addEventListener("keydown", createNotebook);
};

$addNotebookBtn.addEventListener("click", showNotebookField);

/*

  * Create New Notebook.

  * Creates a new notebook when the "Enter" key is pressed while editing a notebook name field.

  * The New Notebook is Stored in the Database.

  $ @param {KeyboardEvent} event - The keyboard event that triggered notebook creation.

*/

const createNotebook = function (event) {
  if (event.key === "Enter") {
    //~ Store New Created Notebook in Database
    const /* {Object} */ notebookData = db.post.notebook(
        this.textContent || "Untitled"
      ); // this: $navItemField
    this.parentElement.remove();

    //$ Render navItem
    client.notebook.create(notebookData);
  }
};

/*

  $ Render the existing notebook list by retrieving data from the database and passing it to the client.

*/

const renderExistedNotebook = function () {
  const /* {Array} */ notebookList = db.get.notebook();
  client.notebook.read(notebookList);
};

renderExistedNotebook();

/*

  * Create New Note

  * Attaches event listener to a collection of DOM elements representing "Create Note" buttons.

  * When a button is clicked, it opens a modal for creating new note and handles the submission of the new note to the database and client.

*/

const /* {Array<HTMLElement>} */ $noteCreateBtns = document.querySelectorAll(
    "[data-note-create-btn]"
  );

addEventOnElements($noteCreateBtns, "click", function () {
  //$ Create and open a new modal
  const /* {HTMLElement} */ modal = NoteModal();
  modal.open();

  //$ Handle the submission of the new note to the database and client
  modal.onSubmit((noteObj) => {
    const /* {string} */ activeNotebookId = document.querySelector(
        "[data-notebook].active"
      ).dataset.notebook;

    const /* {Object} */ noteData = db.post.note(activeNotebookId, noteObj);

    client.note.create(noteData);

    modal.close();
  });
});

/*

  * Renders existing notes in the active notebook. Retrieves note data from the database based on the active notebook's ID and uses the client to display the notes.

*/

const renderExistedNote = function () {
  const /* {string | undefined} */ activeNotebookId = document.querySelector(
      "[data-notebook].active"
    )?.dataset.notebook;

  if (activeNotebookId) {
    const /* {Array<Object>} */ noteList = db.get.note(activeNotebookId);
    
    //$ Display existing note
    client.note.read(noteList)
    
  }
};

renderExistedNote();
