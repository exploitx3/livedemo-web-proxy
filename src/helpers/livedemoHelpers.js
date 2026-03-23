function replaceLinkVarsInText(text, link) {
  let result = text;

  link.variables.forEach(variable => {
    const pattern = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, 'g');
    result = result.replace(pattern, variable.value);
  });

  return result;
}

function processLiveDemoLinkUpdates(liveDemo, link) {


  liveDemo.screens = liveDemo.screens.map(screen => {
    screen.steps = screen.steps.map(step => {
      if (step && step.view) {
        step.view.content = replaceLinkVarsInText(step.view.content, link)
        step.view.popup.title = replaceLinkVarsInText(step.view.popup.title, link)
        step.view.popup.description = replaceLinkVarsInText(step.view.popup.description, link)

      }

      return step
    })

    return screen
  })

  return liveDemo
}


module.exports = {
  processLiveDemoLinkUpdates,
  replaceLinkVarsInText
}
