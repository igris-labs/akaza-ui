import type { ShjLanguageData, ShjRule } from "@speed-highlight/core";
import { defaultLoader, highlightHTML, setLoader } from "@speed-highlight/core";

const tag: ShjRule = {
  match: /<\/?[A-Z](?:[^>"']|"[^"]*"|'[^']*')*>/gi,
  sub: [
    { match: /^<\/?[\w.:-]+/g, type: "var" },
    { match: /(?:v-[\w:-]+|[@:#][\w.:-]+)(?:\.[\w-]+)*/g, type: "class" },
    { match: /[\w:@#][\w.:-]*(?=\s*=)/g, type: "class" },
    { match: /"[^"]*"|'[^']*'/g, type: "str" },
    { match: /[=<>/]/g, type: "oper" },
  ],
};
const vue: ShjLanguageData = [
  { match: /<!--[\s\S]*?-->/g, type: "cmnt" },
  {
    match: /<script\b[^>]*>[\s\S]*?<\/script\s*>/g,
    sub: [tag, { match: /(?<=>)[\s\S]+(?=<\/script\s*>$)/g, sub: "ts" }],
  },
  {
    match: /<style\b[^>]*>[\s\S]*?<\/style\s*>/g,
    sub: [tag, { match: /(?<=>)[\s\S]+(?=<\/style\s*>$)/g, sub: "css" }],
  },
  { match: /\{\{[\s\S]*?\}\}/g, sub: "ts" },
  tag,
];
setLoader((name) => (name === "vue" ? vue : defaultLoader(name)));

const aliases: Record<string, string> = {
  typescript: "ts",
  javascript: "js",
  shellscript: "bash",
  shell: "bash",
  sh: "bash",
  zsh: "bash",
  console: "bash",
  shellsession: "bash",
  yml: "yaml",
  markdown: "md",
  text: "plain",
  txt: "plain",
};
const highlightedTag = /class="shj-syn-var">(&lt;\/?[\w.:-]+)/g;
const highlightedAttribute = /class="shj-syn-class"/g;
const controlKeyword =
  /<span class="shj-syn-kwd">(import|export|from|return|if|else|for|while|switch|case|break|continue|throw|try|catch|finally|await|yield)<\/span>/g;
export async function highlightCode(code: string, language: string) {
  let html = await highlightHTML(code, aliases[language] ?? language, { block: false });
  if (language === "vue" || language === "html") {
    html = html
      .replace(highlightedTag, 'class="shj-syn-tag">$1')
      .replace(highlightedAttribute, 'class="shj-syn-attr"');
  }
  return html.replace(controlKeyword, '<span class="shj-syn-control">$1</span>');
}
