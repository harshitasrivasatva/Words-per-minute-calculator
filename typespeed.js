document.addEventListener("DOMContentLoaded", () => {
  let begun = false;
  let completed = false;
  let startTime;
  let endTime;
  let wordCount;
  let elapsedTime;
  let testLength;
  let accuracy;
  let markupText = "";

  const selectText = () =>
    texts[Math.floor(Math.random() * texts.length)].replace(
      /(\r\n|\n|\r)/gm,
      ""
    );
  let currentText = selectText();

  // save dom nodes for displaying metrics and updates
  let accuracyNode = document.getElementById("accuracy");
  let countNode = document.getElementById("word-count");
  let errorNode = document.getElementById("error-count");
  let wpm = document.getElementById("wpm");
  let elapsedTimeNode = document.getElementById("typing-time");
  let mistypedNode = document.getElementById("mistyped-words");
  let newTest = document.getElementById("newTest");

  // stringCount filters for truthy values, ignoring empty strings and other falsy values
  let stringCount = (string) => string.split(" ").filter((e) => e).length;

  // store the dom nodes for main UI elements, where text is rendered and typed
  let displayField = document.getElementById("display");
  let inputField = document.getElementById("type-speed-input");

  newTest.onclick = () => {
    completed = false;
    currentText = selectText();
    displayField.innerHTML = currentText;
    testLength = stringCount(currentText);
    accuracyNode.innerHTML = "100%";
    countNode.innerHTML = "0";
    errorNode.innerHTML = "0";
    wpm.innerHTML = "60";
    elapsedTimeNode.innerHTML = "(not done)";
    mistypedNode.innerHTML = "0";
    inputField.value = "";
  };

  displayField.innerHTML = currentText;
  testLength = stringCount(currentText);

  inputField.oninput = () => {
    if (!begun) {
      begun = true;
      startTime = new Date();
    }

    let userInput = inputField.value;
    wordCount = stringCount(inputField.value);
    if (wordCount >= 0) {
      countNode.innerHTML = wordCount;
    }

    if (wordCount === testLength) {
      endTime = new Date();
    }

    let lastIdx = stringCount(userInput) - 1;
    let filterUserInput = userInput.split(" ").filter((e) => e);
    let lastword = filterUserInput[lastIdx];
    let filterCurrentText = currentText.split(" ").filter((e) => e);
    let targetWord = filterCurrentText[lastIdx];
    let lastWordsMatch = lastword === targetWord;

    // count then display any mispelled words
    let mistypedWords = 0;
    for (let i = 0; i < lastIdx; i++) {
      if (filterCurrentText[i] !== filterUserInput[i]) {
        mistypedWords++;
      }
    }
    if (mistypedWords >= 0) {
      mistypedNode.innerHTML = mistypedWords;
    }

    // count character accuracy
    let mistakes = 0;
    let characters = 0;
    for (let i = 0; i <= lastIdx; i++) {
      let userword = filterUserInput[i];
      let originalTextWord = filterCurrentText[i];
      if (userword && originalTextWord) {
        for (let j = 0; j < userword.length; j++) {
          characters++;
          if (userword[j] !== originalTextWord[j]) {
            mistakes++;
          }
        } // end of inner for loop
      }
    } // end of outer for loop

    // markup and replace text to insert highlighted spans for detected typing errors
    for (let i = 0; i < testLength; i++) {
      // highlight previously mispelled words in red
      if (i < lastIdx && filterCurrentText[i] !== filterUserInput[i]) {
        markupText += `<span style='background: red;'>${filterCurrentText[i]}</span> `;
        // in the current word, if there are non-matching characters, highlight them in yellow
      } else if (i === lastIdx && filterCurrentText[i] !== filterUserInput[i]) {
        let currentUserWord = filterUserInput[i];
        let currentWordLength = currentUserWord.length;
        let originalWord = filterCurrentText[i];
        let buildWord = "";
        for (let j = 0; j < originalWord.length; j++) {
          if (
            j >= currentWordLength ||
            currentUserWord[j] === originalWord[j]
          ) {
            buildWord += `${originalWord[j]}`;
          } else {
            buildWord += `<span style='background: yellow;'>${originalWord[j]}</span>`;
          }
        }
        markupText += `${buildWord} `;
        // otherwise, just add the word from the original source
      } else {
        markupText += `${filterCurrentText[i]} `;
      }
    }

    // only display positive integers, reset markupText
    if (mistakes >= 0) {
      errorNode.innerHTML = mistakes;
      displayField.innerHTML = markupText;
      // reset markupText
      markupText = "";
    }

    // display character accuracy
    accuracy = Math.floor(((characters - mistakes) / characters) * 100);

    // ignore not-a-number errors when updating
    if (!isNaN(accuracy)) {
      accuracyNode.innerHTML = `${accuracy}%`;
    }

    // calculate words per minute
    let entryTime = new Date();
    let elapsedMinutes = (entryTime - startTime) / 1000 / 60;
    wpm.innerHTML = Math.floor(wordCount / elapsedMinutes);

    // calculate total typing time, only once per given text
    if (endTime && !completed && lastWordsMatch) {
      elapsedTime = (endTime - startTime) / 1000;
      let minutes = Math.floor(elapsedTime / 60);
      let seconds = Math.floor(elapsedTime % 60);
      elapsedTimeNode.innerHTML = `${minutes}m${seconds}s`;
      completed = true;
    }
  }; //end of the oninput function
}); //end of doc, end of document loaded listener
