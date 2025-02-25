function htmlToReact(htmlString) {
  // Replace class with className
  let reactString = htmlString.replace(/class="/g, 'className="');
  // List of tags that should self-close in JSX
  const selfClosingTags = ['img', 'br', 'hr', 'input', 'meta', 'link'];
  // Process tags
  reactString = reactString.replace(/<(\w+)([^>]*)>([^<]*)(<\/\1>)?/g, (match, tag, attrs, content, closingTag) => {
    const trimmedAttrs = attrs.trim();
    const isSelfClosing = selfClosingTags.includes(tag.toLowerCase()) && !content.trim() && !closingTag;

    if (isSelfClosing) {
      // Self-closing tag (e.g., <img src="..." />)
      return `<${tag}${trimmedAttrs ? ' ' + trimmedAttrs : ''} />`;
    } else if (closingTag) {
      // Tag with content or nested elements (e.g., <h4>First Name</h4>)
      return `<${tag}${trimmedAttrs ? ' ' + trimmedAttrs : ''}>${content}</${tag}>`;
    } else {
      // Tag without closing (assume it’s a fragment or error, leave as-is for now)
      return match;
    }
  });

  return reactString;
}