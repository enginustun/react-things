module.exports = {
  strings: {
    capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),
  },

  /**
   * Returns matched word from second array which has same index
   * of 'text' parameter in first given array
   */
  getMatchedWord: (text, textArray = [], wordArray = []) => {
    const textIndex = textArray.indexOf(text);
    return textIndex > -1 ? wordArray[textIndex] : text;
  },
};
