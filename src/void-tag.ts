export default class VoidTag {
	private voidTags: Set<string>;
	public constructor(
		public addClosingSlash = false,
		tags?: string[]
	) {
		if (Array.isArray(tags)) {
			this.voidTags = tags.reduce((set, tag) => {
				return set.add(tag.toLowerCase());
			}, new Set<string>());
		} else {
			this.voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].reduce((set, tag) => {
				return set.add(tag);
			}, new Set<string>());
		}
	}
	public formatNode(tag: string, attrs: string, innerHTML: string) {
		const addClosingSlash = this.addClosingSlash;
		const closingSpace = (addClosingSlash && attrs && !attrs.endsWith(' ')) ? ' ' : '';
		const closingSlash = addClosingSlash ? `${closingSpace}/` : '';
		return this.isVoidElement(tag.toLowerCase()) ? `<${tag}${attrs}${closingSlash}>` : `<${tag}${attrs}>${innerHTML}</${tag}>`;
	}
	public isVoidElement(tag: string) {
		return this.voidTags.has(tag);
	}
}
