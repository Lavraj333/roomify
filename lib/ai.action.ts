import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constants";

export const generate3DView = async ({ sourceImage }: Generate3DViewParams) => {
    const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT,{
        provider: 'gemini',
        model: 'gemini-3.1-flash-image',
        input_image: sourceImage,
        ratio: {w:1024,h:1024}
    })

    const rawImageUrl = (response as HTMLImageElement).src ?? null;

    if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined};

    return { renderedImage: rawImageUrl, renderedPath: undefined };
}