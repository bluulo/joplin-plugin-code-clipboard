module.exports = {
    default: function(context) {
        return {
            plugin: function(markdownIt, _options) {
                const pluginId = context.pluginId;
                const popupOptions = {
                    text: "Copied!",
                    displayTime: 850,
                }

                const defaultRender = markdownIt.renderer.rules.fence || function(tokens, idx, options, env, self) {
                    return self.renderToken(tokens, idx, options, env, self);
                };
            
                markdownIt.renderer.rules.fence = function(tokens, idx, options, env, self) {
                    const token = tokens[idx];

                    // Pre-process the content
                    const oneLineContent = encodeURIComponent(token.content)
                        .replace(/'/g, "\\'");

                    // What should happen when the button is clicked:
                    // 1. send a message to update the clipboard
                    // 2. show the popup
                    // 3. remove the popup after a specified time
                    const onClick = `
                        webviewApi.postMessage('${pluginId}', '${oneLineContent}');
                        this.getElementsByClassName('popuptext')[0].classList.add('show-popup');
                        setTimeout(() => this.getElementsByClassName('popuptext')[0].classList.remove('show-popup'), ${popupOptions.displayTime});
                    `.replace(/\n/g, ' ')  // turn into a single line for usage in a html attribute

                    const button = `
                        <div class="code-clipboard-button" onclick="${onClick}" title="Copy">
                            <span class="code-clipboard-icon">⧉</span>
                            <span class="popuptext">${popupOptions.text}</span>
                        </div>
                    `
                    return `<div class="code-clipboard-container" style="position: relative">${defaultRender(tokens, idx, options, env, self)} ${button}</div>`;
                };
            },
            assets: function() {
                return [
                    { name: 'codeClipboard.css' }
                ];
            },
        }
    }
}