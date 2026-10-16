import { useEffect } from "react";

const SITE_NAME = "Movie Finder";

/** Sets document.title and the meta description for the current page. */
export function useDocumentMeta(title: string, description?: string) {
    useEffect(() => {
        document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

        if (description) {
            let tag = document.querySelector<HTMLMetaElement>(
                'meta[name="description"]'
            );

            if (!tag) {
                tag = document.createElement("meta");
                tag.name = "description";
                document.head.appendChild(tag);
            }

            tag.content = description;
        }
    }, [title, description]);
}
