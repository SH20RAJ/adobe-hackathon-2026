/**
 * HTML Parser & Content Extractor for OmniAudit-GEO.
 * Zero external dependencies. Maintains strict non-negative depth invariants
 * and complete parity with Python HTMLContentExtractor state machine.
 */

export interface ExtractedHeading {
  level: string;
  text: string;
}

export interface ExtractedImage {
  src: string;
  alt: string;
  has_alt: boolean;
}

export interface ExtractedAction {
  tag: string;
  label: string;
  href: string;
  hidden: boolean;
  region: string;
}

export interface ExtractedForm {
  action: string;
  controls: number;
  submit_controls: number;
  has_action: boolean;
}

export interface AeoBlock {
  tag: string;
  text: string;
}

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

export class HTMLContentExtractor {
  public text_chunks: string[] = [];
  public scripts: string[] = [];
  public json_ld_blocks: string[] = [];
  public headings: ExtractedHeading[] = [];
  public images: ExtractedImage[] = [];
  public links: string[] = [];
  public meta_tags: Record<string, string> = {};
  public action_candidates: ExtractedAction[] = [];
  public forms: ExtractedForm[] = [];
  public aeo_blocks: AeoBlock[] = [];

  public list_blocks = 0;
  public table_blocks = 0;
  public faq_pairs = 0;
  public has_article_region = false;

  public hidden_text_words = 0;
  public hidden_content_words = 0;
  public hidden_interface_words = 0;

  private _element_stack: Array<{
    tag: string;
    is_hidden: boolean;
    is_interface_hidden: boolean;
    is_nav: boolean;
    is_footer: boolean;
    is_article: boolean;
  }> = [];

  private _hidden_depth = 0;
  private _hidden_interface_depth = 0;
  private _navigation_depth = 0;
  private _footer_depth = 0;
  private _article_depth = 0;

  private _in_script = false;
  private _script_type = "";
  private _script_buffer: string[] = [];

  private _current_heading_tag: string | null = null;
  private _current_heading_buffer: string[] = [];

  private _block_tag: string | null = null;
  private _block_buffer: string[] = [];

  private _current_action: { tag: string; labelBuffer: string[]; href: string; hidden: boolean } | null = null;
  private _current_form: ExtractedForm | null = null;

  public feed(html: string): void {
    // Regex-based robust tokenization of HTML tags, comments, scripts, and text
    const tagRegex = /<!--[\s\S]*?-->|<script\b([^>]*)>([\s\S]*?)<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<(\/?)([a-zA-Z0-9\-]+)([^>]*)>|([^<]+)/gi;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(html)) !== null) {
      if (match[0].startsWith("<!--") || match[0].toLowerCase().startsWith("<style")) {
        continue;
      }

      // Script block with content captured
      if (match[1] !== undefined && match[2] !== undefined) {
        const rawAttrs = match[1];
        const scriptBody = match[2];
        const typeMatch = rawAttrs.match(/type\s*=\s*['"]([^'"]+)['"]/i);
        const scriptType = typeMatch ? typeMatch[1].toLowerCase().trim() : "";

        if (scriptType === "application/ld+json") {
          const trimmed = scriptBody.trim();
          if (trimmed) this.json_ld_blocks.push(trimmed);
        } else {
          this.scripts.push(scriptBody);
        }
        continue;
      }

      // Start or end tag
      if (match[4] !== undefined) {
        const isClosing = match[3] === "/";
        const tagName = match[4].toLowerCase();
        const rawAttrs = match[5] || "";

        if (isClosing) {
          this.handleEndTag(tagName);
        } else {
          const attrs = this.parseAttributes(rawAttrs);
          this.handleStartTag(tagName, attrs);
          if (VOID_TAGS.has(tagName) || rawAttrs.trim().endsWith("/")) {
            this.handleEndTag(tagName);
          }
        }
        continue;
      }

      // Text chunk
      if (match[6] !== undefined) {
        this.handleData(match[6]);
      }
    }

    this.assertInvariants();
  }

  public assertInvariants(): void {
    if (this._hidden_depth < 0) this._hidden_depth = 0;
    if (this._hidden_interface_depth < 0) this._hidden_interface_depth = 0;
    if (this._navigation_depth < 0) this._navigation_depth = 0;
    if (this._footer_depth < 0) this._footer_depth = 0;
    if (this._article_depth < 0) this._article_depth = 0;
  }

  private parseAttributes(rawAttrs: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const attrRegex = /([a-zA-Z0-9\-:_]+)(?:\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+)))?/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(rawAttrs)) !== null) {
      const key = m[1].toLowerCase();
      const val = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : (m[4] !== undefined ? m[4] : ""));
      attrs[key] = val;
    }
    return attrs;
  }

  private handleStartTag(tag: string, attrs: Record<string, string>): void {
    const styleAttr = (attrs["style"] || "").toLowerCase();
    const classAttr = (attrs["class"] || "").toLowerCase();
    const ariaHidden = attrs["aria-hidden"] === "true";
    const hiddenAttr = attrs["hidden"] !== undefined;

    const isDisplayNone = styleAttr.includes("display:none") || styleAttr.includes("display: none");
    const isVisibilityHidden = styleAttr.includes("visibility:hidden") || styleAttr.includes("visibility: hidden");

    const isHidden = ariaHidden || hiddenAttr || isDisplayNone || isVisibilityHidden;
    const isInterfaceHidden = isHidden && (
      classAttr.includes("sr-only") ||
      classAttr.includes("visually-hidden") ||
      attrs["role"] === "tooltip" ||
      tag === "template"
    );

    const isNav = tag === "nav" || attrs["role"] === "navigation";
    const isFooter = tag === "footer" || attrs["role"] === "contentinfo";
    const isArticle = tag === "article" || tag === "main" || attrs["role"] === "main";

    if (isHidden) this._hidden_depth++;
    if (isInterfaceHidden) this._hidden_interface_depth++;
    if (isNav) this._navigation_depth++;
    if (isFooter) this._footer_depth++;
    if (isArticle) {
      this._article_depth++;
      this.has_article_region = true;
    }

    this._element_stack.push({
      tag,
      is_hidden: isHidden,
      is_interface_hidden: isInterfaceHidden,
      is_nav: isNav,
      is_footer: isFooter,
      is_article: isArticle,
    });

    // Heading tracking
    if (/^h[1-6]$/.test(tag)) {
      this._current_heading_tag = tag;
      this._current_heading_buffer = [];
    }

    // Block tracking for AEO
    if (["p", "blockquote", "dd", "section", "li"].includes(tag)) {
      this._block_tag = tag;
      this._block_buffer = [];
    }

    if (tag === "ul" || tag === "ol") this.list_blocks++;
    if (tag === "table") this.table_blocks++;

    // Meta tags
    if (tag === "meta") {
      const name = (attrs["name"] || attrs["property"] || "").toLowerCase();
      const content = attrs["content"] || "";
      if (name && content) {
        this.meta_tags[name] = content;
      }
    }

    // Images
    if (tag === "img") {
      const src = attrs["src"] || "";
      const alt = attrs["alt"] !== undefined ? attrs["alt"].trim() : "";
      this.images.push({
        src,
        alt,
        has_alt: attrs["alt"] !== undefined && alt.length > 0,
      });
    }

    // Action candidates (links / buttons)
    if (tag === "a" || tag === "button") {
      const region = this._navigation_depth > 0 ? "nav" : (this._footer_depth > 0 ? "footer" : "body");
      this._current_action = {
        tag,
        labelBuffer: [],
        href: attrs["href"] || "",
        hidden: this._hidden_depth > 0,
      };
      if (attrs["aria-label"]) {
        this._current_action.labelBuffer.push(attrs["aria-label"]);
      }
      if (attrs["href"]) {
        this.links.push(attrs["href"]);
      }
    }

    // Forms
    if (tag === "form") {
      this._current_form = {
        action: attrs["action"] || "",
        controls: 0,
        submit_controls: 0,
        has_action: Boolean(attrs["action"]),
      };
    } else if (this._current_form && (tag === "input" || tag === "select" || tag === "textarea")) {
      const type = (attrs["type"] || "").toLowerCase();
      if (type !== "hidden") {
        this._current_form.controls++;
        if (type === "submit" || type === "image") {
          this._current_form.submit_controls++;
        }
      }
    } else if (this._current_form && tag === "button") {
      const type = (attrs["type"] || "submit").toLowerCase();
      if (type === "submit") {
        this._current_form.submit_controls++;
      }
      this._current_form.controls++;
    }
  }

  private handleEndTag(tag: string): void {
    // Heading finish
    if (tag === this._current_heading_tag) {
      const text = this._current_heading_buffer.join(" ").trim();
      if (text) {
        this.headings.push({ level: tag, text });
      }
      this._current_heading_tag = null;
      this._current_heading_buffer = [];
    }

    // Block finish
    if (tag === this._block_tag) {
      const text = this._block_buffer.join(" ").trim();
      if (text) {
        this.aeo_blocks.push({ tag, text });
      }
      this._block_tag = null;
      this._block_buffer = [];
    }

    // Action finish
    if (this._current_action && tag === this._current_action.tag) {
      const label = this._current_action.labelBuffer.join(" ").trim();
      const region = this._navigation_depth > 0 ? "nav" : (this._footer_depth > 0 ? "footer" : "body");
      this.action_candidates.push({
        tag: this._current_action.tag,
        label,
        href: this._current_action.href,
        hidden: this._current_action.hidden,
        region,
      });
      this._current_action = null;
    }

    // Form finish
    if (this._current_form && tag === "form") {
      this.forms.push(this._current_form);
      this._current_form = null;
    }

    // Unwind stack backwards to handle misnested tags cleanly
    let idx = -1;
    for (let i = this._element_stack.length - 1; i >= 0; i--) {
      if (this._element_stack[i].tag === tag) {
        idx = i;
        break;
      }
    }

    if (idx !== -1) {
      while (this._element_stack.length > idx) {
        const popped = this._element_stack.pop()!;
        if (popped.is_hidden) this._hidden_depth = Math.max(0, this._hidden_depth - 1);
        if (popped.is_interface_hidden) this._hidden_interface_depth = Math.max(0, this._hidden_interface_depth - 1);
        if (popped.is_nav) this._navigation_depth = Math.max(0, this._navigation_depth - 1);
        if (popped.is_footer) this._footer_depth = Math.max(0, this._footer_depth - 1);
        if (popped.is_article) this._article_depth = Math.max(0, this._article_depth - 1);
      }
    }
  }

  private handleData(data: string): void {
    const text = data.trim();
    if (!text) return;

    if (this._current_heading_tag) {
      this._current_heading_buffer.push(text);
    }
    if (this._block_tag) {
      this._block_buffer.push(text);
    }
    if (this._current_action) {
      this._current_action.labelBuffer.push(text);
    }

    const words = text.split(/\s+/).filter(Boolean).length;

    if (this._hidden_depth > 0) {
      this.hidden_text_words += words;
      if (this._hidden_interface_depth > 0) {
        this.hidden_interface_words += words;
      } else {
        this.hidden_content_words += words;
      }
    } else {
      this.text_chunks.push(text);
    }
  }
}
