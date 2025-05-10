export class CodeHighlighter {
    static applyToContent(content) {
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
            block.innerHTML = this.addLineNumbers(block.textContent);
        });
    }

    static addLineNumbers(code) {
        return code.split('\n')
            .map((line, index) => `${index + 1}${line}`)
            .join('\n');
    }
}