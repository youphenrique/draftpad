chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'index.html' });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-scratchpad') {
    chrome.tabs.create({ url: 'index.html' });
  }
});
